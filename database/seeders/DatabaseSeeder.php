<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(AdminSeeder::class);

        $encoder = User::firstOrNew(['email' => 'encoder@gmail.com']);
        $encoder->name = 'Encoder User';
        $encoder->password = bcrypt('12345');
        $encoder->status = 'Active';
        $encoder->email_verified_at = $encoder->email_verified_at ?? now();
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'role')) {
            $encoder->role = 'Data Encoder';
        }
        $encoder->save();

        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Encoder', 'guard_name' => 'web']);
        $encoder->syncRoles(['Data Encoder', 'Encoder']);

        $this->call(MockDataSeeder::class);
    }
}
