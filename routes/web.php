<?php

use App\Http\Controllers\AdminPagesController;
use App\Http\Controllers\AuthPagesController;
use App\Http\Controllers\BankAccountsController;
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
    });


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';