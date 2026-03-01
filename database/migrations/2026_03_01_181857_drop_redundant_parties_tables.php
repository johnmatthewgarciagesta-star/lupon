<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('case_party');
        Schema::dropIfExists('parties');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('parties', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->text('address')->nullable();
            $table->string('contact_number')->nullable();
            $table->timestamps();
        });

        Schema::create('case_party', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('cases')->onDelete('cascade');
            $table->foreignId('party_id')->constrained('parties')->onDelete('cascade');
            $table->string('type'); // 'complainant' or 'respondent'
            $table->timestamps();
        });
    }
};
