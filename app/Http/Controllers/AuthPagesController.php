<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuthPagesController extends Controller
{
    public function index()
    {
        $totalRevenue = 15271.89; // Fetch actual value
        $percentageChange = 20.1; // Fetch/calculate actual change
        $chartData = [ // Fetch actual chart data
            ['name' => 'Jan', 'value' => 10000],
            ['name' => 'Feb', 'value' => 11500],
            // ... more data
            ['name' => 'Jul', 'value' => 16271.89],
        ];

        return Inertia::render('dashboard', [
            'totalRevenue' => $totalRevenue,
            'percentageChange' => $percentageChange,
            'revenueChartData' => $chartData, // Pass chart data
            // ... other props
        ]);
        // return Inertia::render('');
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
