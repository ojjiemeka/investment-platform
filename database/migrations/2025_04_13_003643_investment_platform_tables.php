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
        // Create the portfolios table
        Schema::create('portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->enum('type', ['stock', 'crypto', 'real_estate', 'fund', 'bond']);
            $table->decimal('balance', 20, 4)->default(0);
            $table->timestamps();
        });

        // Create the bank_accounts table
        // These are the official records added by admins after processing user requests.
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('account_number');
            $table->string('currency', 10)->default('USD');
            $table->string('swift_code');
            $table->string('iban')->nullable();
            $table->text('bank_address');
            $table->text('home_address');
            $table->string('country');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        // Create the bank_account_requests table
        // This table stores user-submitted requests to add bank account details.
        Schema::create('bank_account_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('account_number');
            $table->string('currency', 10)->default('USD');
            $table->string('swift_code');
            $table->string('iban')->nullable();
            $table->text('bank_address');
            $table->text('home_address');
            $table->string('country');
            $table->enum('status', ['pending','code_sent','approved','rejected'])->default('pending');
            // The admin who processes this request (nullable until processed)
            $table->foreignId('admin_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->timestamps();
        });

        // Create the histories table
        // For deposits and withdrawals, with bank_account_id required for withdrawals.
        Schema::create('histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->enum('type', ['deposit', 'withdrawal']);
            $table->decimal('amount', 20, 4);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            // Set bank_account_id only for withdrawals; nullable for deposits.
            $table->foreignId('bank_account_id')
                  ->nullable()
                  ->constrained('bank_accounts')
                  ->nullOnDelete();
            $table->timestamps();
        });

        // Create the notifications table
        // Admins can send notifications to a specific user or a broadcast (to_user_id is null).
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->text('message');
            // If to_user_id is null, then the notification applies to all users.
            $table->foreignId('to_user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('histories');
        Schema::dropIfExists('bank_account_requests');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('portfolios');
        Schema::dropIfExists('users');
    }
};