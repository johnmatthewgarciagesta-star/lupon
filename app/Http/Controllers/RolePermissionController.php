<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Services\AuditService;

class RolePermissionController extends Controller
{
    /**
     * Get all roles and permissions.
     */
    public function index()
    {
        try {
            $allowedRoles = ['Administrator', 'Data Encoder'];

            foreach ($allowedRoles as $roleName) {
                Role::firstOrCreate(['name' => $roleName]);
            }

            $roles = Role::with('permissions')
                ->whereIn('name', $allowedRoles)
                ->get();
            $permissions = Permission::all();

            return response()->json([
                'roles' => $roles,
                'permissions' => $permissions,
            ]);
        } catch (\Throwable $e) {
            \Log::error('RolePermission index failed: ' . $e->getMessage());
            return response()->json([
                'roles' => [],
                'permissions' => [],
                'message' => 'An error has occurred while retrieving roles and permissions.',
            ], 500);
        }
    }

    /**
     * Update the permissions for a specific role.
     */
    public function update(Request $request, Role $role)
    {
        try {
            $validated = $request->validate([
                'permissions' => 'array',
                'permissions.*' => 'string|exists:permissions,name',
            ]);

            $role->syncPermissions($validated['permissions'] ?? []);

            AuditService::log('UPDATE', 'Roles & Permissions', "Updated permissions for role: {$role->name}", $role->id);

            return redirect()->back()->with('success', 'Role permissions updated successfully.');
        } catch (\Throwable $e) {
            \Log::error('RolePermission update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'An error has occurred while updating permissions. Please reload your page or try again.');
        }
    }
}
