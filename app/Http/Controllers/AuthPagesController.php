<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\CryptoService;
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

        return Inertia::render('dashboard', [
            // Pass the array to the frontend
            'cryptoData' => $cryptoData
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
        return Inertia::render('wallet/activity');
    }

    public function makeTransactions()
    {
        return Inertia::render('wallet/transactions');
    }

    public function investments()
    {
        return Inertia::render('wallet/investments');
    }
}
