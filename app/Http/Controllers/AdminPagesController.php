<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankAccountRequest;
use App\Models\History;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPagesController extends Controller
{
    public function dashboard()
    {
        $users = User::where('role', 'user')
            // ->select('id', 'name', 'email', 'is_active', 'created_at') // Select only needed fields
            ->with(['portfolios' => function ($query) {
                $query->select('user_id', 'balance'); // Include balance field
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(10); // 10 users per page

        // dd($users);

        // --- Add logic to get counts ---
        $totalUsersCount = User::where('role', 'user')->count();
        $totalBankAccountsCount = BankAccountRequest::count(); // Assuming a BankAccount model
        $pendingRequestsCount = History::where('status', 'pending')->count();
        // --- End add logic ---

        // dd($totalUsersCount);

        return Inertia::render('admin/admin-dashboard', [
            'users' => $users,
            'totalUsersCount' => $totalUsersCount,
            'totalBankAccountsCount' => $totalBankAccountsCount,
            'pendingRequestsCount' => $pendingRequestsCount,
        ]);
    }

    public function portfolios()
{
    // Get all history records with related user and bank account data
    $histories = History::with([
        'user:id,name,email,created_at,updated_at', 
        'bankAccount:id,bank_name,account_name,account_number,currency,is_primary'
    ])
    ->orderBy('created_at', 'desc')
    ->get()
    ->map(function ($history) {
        return [
            'id' => $history->id,
            'user_id' => $history->user_id,
            'type' => $history->type,
            'amount' => $history->amount,
            'status' => $history->status,
            'bank_account_id' => $history->bank_account_id,
            'created_at' => $history->created_at->toISOString(),
            'updated_at' => $history->updated_at->toISOString(),
            
            // User information
            'user' => $history->user ? [
                'id' => $history->user->id,
                'name' => $history->user->name,
                'email' => $history->user->email,
                'member_since' => $history->user->created_at->format('M d, Y'),
                'initials' => $this->getUserInitials($history->user->name),
            ] : null,
            
            // Bank account information (for withdrawals)
            'bank_account' => $history->bankAccount ? [
                'id' => $history->bankAccount->id,
                'bank_name' => $history->bankAccount->bank_name,
                'account_name' => $history->bankAccount->account_name,
                'account_number' => $history->bankAccount->account_number,
                'currency' => $history->bankAccount->currency,
                'is_primary' => $history->bankAccount->is_primary,
                'masked_account' => '...' . substr($history->bankAccount->account_number, -4),
            ] : null,
            
            // Formatted data for display
            'formatted_amount' => number_format($history->amount, 2),
            'currency_symbol' => $this->getCurrencySymbol($history->bankAccount?->currency ?? 'USD'),
            'formatted_date' => $history->created_at->format('M d, Y \a\t H:i'),
            'time_ago' => $history->created_at->diffForHumans(),
            'status_color' => $this->getStatusColor($history->status),
            'type_color' => $history->type === 'deposit' ? 'green' : 'blue',
            'display_title' => $this->getDisplayTitle($history),
            'display_description' => $this->getDisplayDescription($history),
        ];
    });

    // Get summary statistics
    $statistics = [
        'total_transactions' => $histories->count(),
        'total_deposits' => $histories->where('type', 'deposit')->sum('amount'),
        'total_withdrawals' => $histories->where('type', 'withdrawal')->sum('amount'),
        'pending_count' => $histories->where('status', 'pending')->count(),
        'approved_count' => $histories->where('status', 'approved')->count(),
        'rejected_count' => $histories->where('status', 'rejected')->count(),
        'unique_users' => $histories->pluck('user_id')->unique()->count(),
    ];

    // Add net flow
    $statistics['net_flow'] = $statistics['total_deposits'] - $statistics['total_withdrawals'];

    return Inertia::render('admin/admin-finance', [
        'histories' => $histories,
        'statistics' => $statistics,
    ]);
}

/**
 * Helper methods
 */
private function getUserInitials($name)
{
    $words = explode(' ', $name);
    if (count($words) >= 2) {
        return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
    }
    return strtoupper(substr($name, 0, 2));
}

private function getCurrencySymbol($currency)
{
    return match(strtoupper($currency)) {
        'USD' => '$',
        'EUR' => '€',
        'GBP' => '£',
        'JPY' => '¥',
        default => '$'
    };
}

private function getStatusColor($status)
{
    return match($status) {
        'pending' => 'yellow',
        'approved' => 'green',
        'rejected' => 'red',
        default => 'gray'
    };
}

private function getDisplayTitle($history)
{
    $type = ucfirst($history->type);
    $user = $history->user ? $history->user->name : 'Unknown User';
    return "{$type} Request - {$user}";
}

private function getDisplayDescription($history)
{
    $amount = number_format($history->amount, 2);
    $currency = $history->bankAccount?->currency ?? 'USD';
    $symbol = $this->getCurrencySymbol($currency);
    
    if ($history->type === 'withdrawal' && $history->bankAccount) {
        $bank = $history->bankAccount->bank_name;
        $account = '...' . substr($history->bankAccount->account_number, -4);
        return "{$symbol}{$amount} to {$bank} ({$account}) • Status: " . ucfirst($history->status);
    } else {
        return "{$symbol}{$amount} {$history->type} • Status: " . ucfirst($history->status);
    }
}

    public function requests()
    {
        $bankRequests = BankAccountRequest::with(['user:id,name,email'])
        ->orderBy('created_at', 'desc')
        ->paginate(15); // 15 requests per page

         // --- Add logic to get counts ---
        $totalUsersCount = User::where('role', 'user')->count();
        $totalBankAccountsCount = BankAccountRequest::count(); // Assuming a BankAccount model
        $pendingRequestsCount = History::where('status', 'pending')->count();
        // --- End add logic ---

        // dd($bankRequests);
        // dd('it works'); // Keep for debugging if needed
        return Inertia::render('admin/admin-requests', [
            'bankRequests' => $bankRequests,
            'totalUsersCount' => $totalUsersCount,
            'totalBankAccountsCount' => $totalBankAccountsCount,
            'pendingRequestsCount' => $pendingRequestsCount,
        ]);
    }

    public function mail()
    {
         // --- Add logic to get counts ---
        $totalUsersCount = User::where('role', 'user')->count();
        $totalBankAccountsCount = BankAccountRequest::count(); // Assuming a BankAccount model
        $pendingRequestsCount = History::where('status', 'pending')->count();
        // --- End add logic ---

        // dd($totalUsersCount);
        
        return Inertia::render('admin/admin-mail', [
            'totalUsersCount' => $totalUsersCount,
            'totalBankAccountsCount' => $totalBankAccountsCount,
            'pendingRequestsCount' => $pendingRequestsCount,
        ]);
    }

    public function accounts()
    {
        $users = User::where('role', 'user')
            // ->select('id', 'name', 'email', 'is_active', 'created_at') // Select only needed fields
            ->with([
                'portfolios' => function ($query) {
                    $query->select('user_id', 'balance'); // Include balance field
                },
                'bankAccounts'
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(10); // 10 users per page

        // dd($users);

        // --- Add logic to get counts ---
        $totalUsersCount = User::where('role', 'user')->count();
        $totalBankAccountsCount = BankAccount::count(); // Assuming a BankAccount model
        $pendingRequestsCount = History::where('status', 'pending')->count();
        // --- End add logic ---

        // dd($totalBankAccountsCount); // Keep for debugging if needed
        return Inertia::render('admin/admin-accounts', [
            'users' => $users,
            'totalUsersCount' => $totalUsersCount,
            'totalBankAccountsCount' => $totalBankAccountsCount,
            'pendingRequestsCount' => $pendingRequestsCount,
        ]);
    }

    public function notifications()
    {
        // dd('it works'); // Keep for debugging if needed
        return Inertia::render('admin/admin-notifications', []);
    }
}
