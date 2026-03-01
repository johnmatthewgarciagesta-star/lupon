<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = AuditLog::query()->with('user');

            // Search
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('details', 'like', "%{$search}%")
                        ->orWhere('action', 'like', "%{$search}%")
                        ->orWhere('module', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }

            // Filter by Module
            if ($request->filled('module') && $request->input('module') !== 'all') {
                $query->where('module', $request->input('module'));
            }

            // Filter by Action
            if ($request->filled('action') && $request->input('action') !== 'all') {
                $query->where('action', $request->input('action'));
            }

            // Filter by User
            if ($request->filled('user') && $request->input('user') !== 'all') {
                $query->where('user_id', $request->input('user'));
            }

            // Filter by Date
            if ($request->filled('date')) {
                $query->whereDate('created_at', $request->input('date'));
            }

            $logs = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

            // Calculate Stats for KPI Cards
            $totalActivities = AuditLog::count();
            $todayActivities = AuditLog::whereDate('created_at', today())->count();
            $activeUsers = AuditLog::where('created_at', '>=', now()->subHours(24))->distinct('user_id')->count();

            // Activity by Module (for Chart)
            $moduleStats = AuditLog::selectRaw('module, count(*) as count')
                ->groupBy('module')
                ->pluck('count', 'module');

            return Inertia::render('audit/index', [
                'logs' => $logs,
                'filters' => $request->only(['search', 'module', 'action', 'user', 'date']),
                'users' => User::select('id', 'name')->get(), // For filter dropdown
                'stats' => [
                    'total' => $totalActivities,
                    'today' => $todayActivities,
                    'active_users_24h' => $activeUsers,
                    'by_module' => $moduleStats,
                ],
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Audit logs loading error: ' . $e->getMessage());

            return Inertia::render('audit/index', [
                'error' => 'A database error occurred while loading audit logs. Details: ' . $e->getMessage(),
                'logs' => ['data' => [], 'links' => []],
                'filters' => $request->only(['search', 'module', 'action', 'user', 'date']),
                'users' => [],
                'stats' => [
                    'total' => 0,
                    'today' => 0,
                    'active_users_24h' => 0,
                    'by_module' => [],
                ],
            ]);
        }
    }
}
