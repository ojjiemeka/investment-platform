<?php

use App\Http\Controllers\AdminPagesController;
use App\Http\Controllers\AuthPagesController;
use App\Http\Controllers\BankAccountRequest;
use App\Http\Controllers\BankAccountRequestController;
use App\Http\Controllers\BankAccountsController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\Two_Factor_Auth_Controller;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [AuthPagesController::class, 'index'])->name('dashboard');

    // Wallet Routes for regular users
    Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
    Route::get('/wallet/withdrawal', [AuthPagesController::class, 'withdrawal'])->name('wallet.withdraw');
    Route::get('/wallet/request', [AuthPagesController::class, 'deposit'])->name('wallet.deposit');
    Route::get('/wallet/external', [AuthPagesController::class, 'externalAccounts'])->name('wallet.external');
    Route::get('/wallet/activity', [AuthPagesController::class, 'activity'])->name('activity');
    Route::get('/wallet/transactions', [AuthPagesController::class, 'makeTransactions'])->name('makeTransactions');
    
     // Users can create bank requests
    Route::resource('bank-requests', BankAccountRequestController::class)->only(['store']);
    Route::resource('transaction-records', HistoryController::class);

     // 2FA Route - Add this line
    Route::post('/verify-2fa-code', [Two_Factor_Auth_Controller::class, 'verify'])->name('verify.2fa');
    Route::post('/resend-2fa-code', [Two_Factor_Auth_Controller::class, 'resend'])->name('resend.2fa'); // Add this line

    // Admin Routes - Apply the 'can' middleware
    Route::middleware(['can:admin'])->prefix('/wallet/admin')->group(function () {
        Route::get('/dashboard', [AdminPagesController::class, 'dashboard'])->name('adminDashboard');
        Route::get('/requests', [AdminPagesController::class, 'requests'])->name('requests');
        Route::get('/portfolios', [AdminPagesController::class, 'portfolios'])->name('portfolios');
        Route::get('/mail', [AdminPagesController::class, 'mail'])->name('mail');
        Route::get('/accounts', [AdminPagesController::class, 'accounts'])->name('accounts');
        Route::get('/notifications', [AdminPagesController::class, 'notifications'])->name('notifications');
        Route::resource('users', UserController::class);
        Route::resource('bank-accounts', BankAccountsController::class);

        // Admins can manage bank requests (view, update, delete)
        Route::resource('bank-requests', BankAccountRequestController::class)->except(['store']);
    });


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';