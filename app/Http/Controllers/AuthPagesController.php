<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\CryptoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthPagesController extends Controller
{
    protected $cryptoService;

    public function __construct(CryptoService $cryptoService)
    {
        $this->cryptoService = $cryptoService;
    }

    public function index()
    {
        // Get the processed cryptocurrency data array from the service
        $cryptoData = $this->cryptoService->getLatestListings(); // This now returns the simplified array or null

        // Optional: Handle the case where fetching data failed
        if ($cryptoData === null) {
            // You might want to pass an empty array or handle the error differently
            $cryptoData = [];
            // Optionally add a flash message or log
            Log::error('Failed to load crypto data for dashboard');
        }

        // dd($cryptoData); // Keep for debugging if needed

        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Now safe to use `load()`
        // $user->load([
        //     'portfolios',
        //     'bankAccounts',
        //     'bankAccountRequests',
        //     'histories',
        //     'notifications'
        // ]);

        // $user = Auth::user();


        // Sum, cast to float, and format
        $portfolioBalanceRaw = $user->portfolios->sum(function ($portfolio) {
            return (float) $portfolio->balance;
        });

        // Format to 2 decimal places:
        $balance = number_format($portfolioBalanceRaw, 2, '.', '');

        // dd($user);


        return Inertia::render('dashboard', [
            // Pass the array to the frontend
            'cryptoData' => $cryptoData,
            'users' => $user,
            'portfolioBalance' => $balance
        ]);
    }

    public function withdrawal()
    {
        // return ("hi");
        return Inertia::render('wallet/withdraw');
    }

    public function deposit()
    {
        return Inertia::render('wallet/deposit');
    }

    public function externalAccounts()
    {
        return Inertia::render('wallet/externalAccounts');
    }

    public function activity()
    {
        $user = Auth::user();

         // Load user relationships
        $user->load([
            'portfolios',
            'bankAccounts',
            'bankAccountRequests',
            'histories',
            'notifications'
        ]);

         $notifications = $user->notifications()
        ->select(['id', 'message', 'to_user_id', 'created_at', 'updated_at'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->toArray(); // Convert to array to see the exact structure

        // dd($notifications);
        
        return Inertia::render('wallet/activity', [
            'notifications' => $notifications
        ]);
    }

    public function makeTransactions()
    {
        // return ("hi");
         $user = Auth::user();

          $user->load([
            'portfolios',
            'bankAccounts',
            'bankAccountRequests',
            'histories',
            'notifications'
        ]);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Sum, cast to float, and format
        $portfolioBalanceRaw = $user->portfolios->sum(function ($portfolio) {
            return (float) $portfolio->balance;
        });

        // Format to 2 decimal places:
        $balance = number_format($portfolioBalanceRaw, 2, '.', '');

         $bankAccounts = $user->bankAccounts->map(fn($acc) => [
            'id'            => $acc->id,
            'bank_name'     => $acc->bank_name,
            'account_name'  => $acc->account_name,
            'account_number'=> $acc->account_number,
            'currency'      => $acc->currency,
            'swift_code'    => $acc->swift_code,
            'iban'          => $acc->iban,
            'bank_address'  => $acc->bank_address,
            'home_address'  => $acc->home_address,
            'country'       => $acc->country,
            'is_primary'    => (bool) $acc->is_primary,
        ])->toArray();

        // Now safe to use `load()`

        // dd($bankAccounts);


        return Inertia::render('wallet/transactions', [
            'portfolioBalance' => $balance,
            'bankAccounts'     => $bankAccounts,
        ]);
    }

    public function investments()
    {
        return Inertia::render('wallet/investments');
    }
}
