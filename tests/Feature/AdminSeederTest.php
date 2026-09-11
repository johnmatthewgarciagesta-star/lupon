<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_seeder_creates_roles_permissions_and_admin_user()
    {
        $this->seed(AdminSeeder::class);

        // Verify roles exist
        $this->assertTrue(Role::where('name', 'Administrator')->exists());
        $this->assertTrue(Role::where('name', 'Admin')->exists());
        $this->assertTrue(Role::where('name', 'Data Encoder')->exists());

        // Verify essential permissions exist
        $this->assertTrue(Permission::where('name', 'manage users')->exists());
        $this->assertTrue(Permission::where('name', 'manage roles')->exists());
        $this->assertTrue(Permission::where('name', 'view audit trail')->exists());

        // Verify Admin user was created with Active status
        $admin = User::where('email', 'admin@gmail.com')->first();
        $this->assertNotNull($admin);
        $this->assertEquals('Active', $admin->status);
        $this->assertNotNull($admin->email_verified_at);
        $this->assertTrue(Hash::check('12345', $admin->password));

        // Verify Admin user has roles and permissions
        $this->assertTrue($admin->hasRole('Administrator'));
        $this->assertTrue($admin->hasRole('Admin'));
        $this->assertTrue($admin->hasPermissionTo('manage users'));
        $this->assertTrue($admin->hasPermissionTo('manage roles'));
        $this->assertTrue($admin->hasPermissionTo('view audit trail'));
    }

    public function test_admin_seeder_is_idempotent()
    {
        // Run first time
        $this->seed(AdminSeeder::class);
        $countUsers1 = User::where('email', 'admin@gmail.com')->count();
        $this->assertEquals(1, $countUsers1);

        // Run second time - should update without duplicates or errors
        $this->seed(AdminSeeder::class);
        $countUsers2 = User::where('email', 'admin@gmail.com')->count();
        $this->assertEquals(1, $countUsers2);

        $admin = User::where('email', 'admin@gmail.com')->first();
        $this->assertTrue($admin->hasRole('Administrator'));
    }

    public function test_admin_seeder_elevates_existing_alt_admin_if_present()
    {
        $altUser = User::create([
            'name' => 'Existing Kataru',
            'email' => 'kataru@gmail.com',
            'password' => Hash::make('secret'),
            'status' => 'Pending',
        ]);

        $this->seed(AdminSeeder::class);

        $altUser->refresh();
        $this->assertEquals('Active', $altUser->status);
        $this->assertTrue($altUser->hasRole('Administrator'));
        $this->assertTrue($altUser->hasPermissionTo('manage users'));
    }

    public function test_database_seeder_successfully_runs_admin_seeder()
    {
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        $admin = User::where('email', 'admin@gmail.com')->first();
        $this->assertNotNull($admin);
        $this->assertTrue($admin->hasRole('Administrator'));

        $encoder = User::where('email', 'encoder@gmail.com')->first();
        $this->assertNotNull($encoder);
        $this->assertTrue($encoder->hasRole('Data Encoder'));
    }
}
