<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds to create/update an Administrator with full privileges.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define all application permissions
        $permissions = [
            // User management
            'manage users',
            'create users',
            'edit users',
            'delete users',
            'view users',
            'manage_users',
            'create_users',
            'edit_users',
            'delete_users',
            'view_users',

            // Case management
            'manage cases',
            'create cases',
            'edit cases',
            'delete cases',
            'view cases',

            // Document management
            'manage documents',
            'create documents',
            'edit documents',
            'delete documents',
            'view documents',

            // Roles and permissions management
            'manage roles',
            'manage_roles',

            // Audit trail
            'view audit trail',
            'view_audit_trail',

            // Personnel & reports
            'manage personnel',
            'generate reports',
            'manage settings',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        $allPermissions = Permission::all();

        // 2. Create roles and assign all permissions to Administrator & Admin
        $adminRole = Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);
        $adminRole->syncPermissions($allPermissions);

        $legacyAdminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $legacyAdminRole->syncPermissions($allPermissions);

        // Ensure Data Encoder role exists for normal operations
        $encoderRole = Role::firstOrCreate(['name' => 'Data Encoder', 'guard_name' => 'web']);
        $encoderRole->syncPermissions(
            Permission::whereIn('name', [
                'view cases',
                'create cases',
                'edit cases',
                'view documents',
                'create documents',
                'edit documents',
                'manage cases',
            ])->get()
        );

        // 3. Create or update the Administrator user
        $adminName = env('ADMIN_NAME', 'Admin User');
        $adminEmail = env('ADMIN_EMAIL', 'admin@gmail.com');
        $adminPassword = env('ADMIN_PASSWORD', '12345');

        $admin = User::firstOrNew(['email' => $adminEmail]);
        $admin->name = $adminName;
        $admin->password = Hash::make($adminPassword);
        $admin->status = 'Active';
        $admin->email_verified_at = $admin->email_verified_at ?? now();

        if (Schema::hasColumn('users', 'role')) {
            $admin->role = 'Administrator';
        }

        $admin->save();

        // Assign both Administrator and Admin roles and all permissions
        $admin->syncRoles(['Administrator', 'Admin']);
        $admin->syncPermissions($allPermissions);

        // 4. If legacy/alternate admin user exists (e.g. kataru@gmail.com), also grant full privileges
        $altAdmin = User::where('email', 'kataru@gmail.com')->first();
        if ($altAdmin) {
            $altAdmin->status = 'Active';
            $altAdmin->email_verified_at = $altAdmin->email_verified_at ?? now();
            if (Schema::hasColumn('users', 'role')) {
                $altAdmin->role = 'Administrator';
            }
            $altAdmin->save();
            $altAdmin->syncRoles(['Administrator', 'Admin']);
            $altAdmin->syncPermissions($allPermissions);
        }

        // 5. CLI feedback
        if ($this->command) {
            $this->command->info(" Admin Seeder executed successfully!");
            $this->command->line("--------------------------------------------------");
            $this->command->line("Admin Name:     {$admin->name}");
            $this->command->line("Admin Email:    {$admin->email}");
            $this->command->line("Admin Password: {$adminPassword}");
            $this->command->line("Assigned Roles: " . implode(', ', $admin->getRoleNames()->toArray()));
            $this->command->line("Permissions:    " . $allPermissions->count() . " permissions granted");
            $this->command->line("--------------------------------------------------");
        }
    }
}
