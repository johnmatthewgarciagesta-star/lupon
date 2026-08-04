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
        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->integer('version_number')->default(1);
            $table->foreignId('edited_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('edited_by_name')->nullable();
            $table->string('change_type')->default('edited'); // created, edited, restored, soft_deleted
            $table->json('content_snapshot')->nullable();
            $table->string('file_path_snapshot')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        // Add soft_deletes to documents table if missing
        if (!Schema::hasColumn('documents', 'deleted_at')) {
            Schema::table('documents', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_versions');
        if (Schema::hasColumn('documents', 'deleted_at')) {
            Schema::table('documents', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
