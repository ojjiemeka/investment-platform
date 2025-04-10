<?php

use App\Http\Controllers\AuthPagesController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');

    Route::get('/dashboard', [AuthPagesController::class, 'index'])->name('dashboard'); // Use 'create' convention for showing the form/page

    
    // Add the route for your Wallet/Deposit/Withdraw page
    Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index'); // Use 'create' convention for showing the form/page
    Route::get('/wallet/withdrawal', [AuthPagesController::class, 'withdrawal'])->name('wallet.withdraw');
    Route::get('/wallet/request', [AuthPagesController::class, 'deposit'])->name('wallet.deposit');
    Route::get('/wallet/external', [AuthPagesController::class, 'externalAccounts'])->name('wallet.external');
    Route::get('/wallet/activity', [AuthPagesController::class, 'activity'])->name('activity');
    Route::get('/wallet/transactions', [AuthPagesController::class, 'makeTransactions'])->name('makeTransactions');
     // You will later add POST routes for handling the actual deposit/withdrawal actions
    // Route::post('/deposit', [WalletController::class, 'storeDeposit'])->name('wallet.deposit.store');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
