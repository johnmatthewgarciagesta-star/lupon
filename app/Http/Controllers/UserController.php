<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = User::query();

            // Search
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter by Role
            if ($request->filled('role') && $request->input('role') !== 'all') {
                $query->where('role', $request->input('role'));
            }

            // Filter by Status
            if ($request->filled('status') && $request->input('status') !== 'all') {
                $query->where('status', $request->input('status'));
            }

            $users = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

            // Stats Calculation
            $totalUsers = User::count();
            $activeUsers = User::where('status', 'Active')->count();
            $inactiveUsers = User::where('status', 'Inactive')->count();

            // Group by Role
            $usersByRole = User::selectRaw('role, count(*) as count')
                ->groupBy('role')
                ->pluck('count', 'role')
                ->toArray();

            return Inertia::render('users/index', [
                'users' => $users,
                'filters' => $request->only(['search', 'role', 'status']),
                'stats' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'inactive' => $inactiveUsers,
                    'byRole' => $usersByRole,
                ],
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Users loading error: ' . $e->getMessage());

            return Inertia::render('users/index', [
                'error' => 'A database error occurred while loading users. Details: ' . $e->getMessage(),
                'users' => ['data' => [], 'links' => []],
                'filters' => $request->only(['search', 'role', 'status']),
                'stats' => [
                    'total' => 0,
                    'active' => 0,
                    'inactive' => 0,
                    'byRole' => [],
                ],
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string',
            'status' => 'required|string',
            'duty_group' => 'nullable|string',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => $validated['status'],
            'duty_group' => $validated['duty_group'],
        ]);

        AuditService::log('CREATE', 'Users', "Created new user: {$validated['name']} ({$validated['role']})", $validated['email']);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|string',
            'status' => 'required|string',
            'duty_group' => 'nullable|string',
            'password' => 'nullable|string|min:8',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->status = $validated['status'];
        $user->duty_group = $validated['duty_group'];

        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        AuditService::log('UPDATE', 'Users', "Updated user details: {$user->name}", $user->id);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting self (optional safety)
        if (auth()->id() == $user->id) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        AuditService::log('DELETE', 'Users', "Deleted user: {$user->name}", $user->id);

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
