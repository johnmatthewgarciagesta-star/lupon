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
    }

    /**
     * Update the permissions for a specific role.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        AuditService::log('UPDATE', 'Roles & Permissions', "Updated permissions for role: {$role->name}", $role->id);

        return redirect()->back()->with('success', 'Role permissions updated successfully.');
    }
}
