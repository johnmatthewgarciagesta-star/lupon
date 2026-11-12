<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Services\AuditService;

class RoleController extends Controller
{
    /**
     * Display a listing of roles and permissions.
     */
    public function index()
    {
        try {
            // Only Administrator or users with 'manage roles' can access this
            if (!auth()->user()->can('manage roles')) {
                abort(403, 'Unauthorized action.');
            }

            $roles = Role::with('permissions')->get();
            $permissions = Permission::all();

            return Inertia::render('Roles/Index', [
                'roles' => $roles,
                'permissions' => $permissions,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Role index loading failed: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('error', 'An error has occurred while retrieving roles. Please reload your page.');
        }
    }

    /**
     * Update the permissions for a specific role.
     */
    public function update(Request $request, Role $role)
    {
        try {
            if (!auth()->user()->can('manage roles')) {
                abort(403, 'Unauthorized action.');
            }

            $validated = $request->validate([
                'permissions' => 'array',
                'permissions.*' => 'exists:permissions,name',
            ]);

            $role->syncPermissions($validated['permissions'] ?? []);

            AuditService::log('UPDATE', 'Roles', "Updated permissions for role: {$role->name}", auth()->user()->email);

            return redirect()->back()->with('success', 'Role permissions updated successfully.');
        } catch (\Throwable $e) {
            \Log::error('Role permission update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'An error has occurred while updating role permissions. Please reload your page or try again.');
        }
    }
}
