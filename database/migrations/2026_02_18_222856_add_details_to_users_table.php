<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('Staff'); // Data Encoder, Summoner, etc.
            $table->string('status')->default('Active'); // Active, Inactive
            $table->string('duty_group')->nullable(); // Monday, Tuesday, etc. (For Pangkat)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'status', 'duty_group']);
        });
    }
};
