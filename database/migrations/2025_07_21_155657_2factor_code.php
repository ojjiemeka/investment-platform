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
        Schema::create('two_factor_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->string('code', 10); // 6-digit code typically
            $table->string('type'); // Different 2FA methods
            $table->timestamp('expires_at'); // When the code expires
            $table->boolean('is_used')->default(false); // Track if code has been used
            $table->timestamps();

            // Add indexes for better performance
            $table->index(['user_id', 'code']);
            $table->index(['user_id', 'type', 'is_used']);
        });
    }

    /**
     * Run the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('two_factor_codes');
    }
};