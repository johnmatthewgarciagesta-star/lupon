<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            // Delete legacy roles from Spatie roles table
            DB::table('roles')->whereIn('name', ['Admin', 'Encoder', 'Lupon Secretary'])->delete();
        } catch (\Exception $e) {
            // Ignore if table structure differs
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
