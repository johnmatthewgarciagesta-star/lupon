<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Make case_id nullable so standalone documents (not tied to a case) can be saved.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Drop the old non-nullable foreign key constraint first
            $table->dropForeign(['case_id']);
            // Re-add as nullable with cascade delete only when a case exists
            $table->foreignId('case_id')->nullable()->change();
            $table->foreign('case_id')->references('id')->on('cases')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['case_id']);
            $table->foreignId('case_id')->nullable(false)->change();
            $table->foreign('case_id')->references('id')->on('cases')->onDelete('cascade');
        });
    }
};
