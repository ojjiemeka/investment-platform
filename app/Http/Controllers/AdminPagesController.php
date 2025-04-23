<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
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
            ->orderBy('created_at', 'desc')
            ->paginate(10); // 10 users per page

        // dd($users);

        // --- Add logic to get counts ---
        $totalUsersCount = User::where('role', 'user')->count();
        $totalBankAccountsCount = BankAccountRequest::count(); // Assuming a BankAccount model
        $pendingRequestsCount = History::where('status', 'pending')->count();
        // --- End add logic ---

        return Inertia::render('admin/admin-dashboard', [
            'users' => $users,
            'totalUsersCount' => $totalUsersCount,
            'totalBankAccountsCount' => $totalBankAccountsCount,
            'pendingRequestsCount' => $pendingRequestsCount,
        ]);
    }

    public function requests()
    {
        // dd('it works'); // Keep for debugging if needed
        return Inertia::render('admin/admin-requests', []);
    }

    public function mail()
    {
        // dd('it works'); // Keep for debugging if needed
        return Inertia::render('admin/admin-mail', []);
    }

    public function accounts()
    {
        // dd('it works'); // Keep for debugging if needed
        return Inertia::render('admin/admin-accounts', []);
    }

    public function notifications()
    {
        // dd('it works'); // Keep for debugging if needed
        return Inertia::render('admin/admin-notifications', []);
    }
}
