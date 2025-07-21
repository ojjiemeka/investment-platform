<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\History;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return back()->with('flash', [
                'message' => 'You must be authenticated to perform this action.',
                'type' => 'error'
            ]);
        }

        // Validate the request data
        try {
            $validatedData = $request->validate([
                'amount' => ['required', 'numeric', 'min:0.01'],
                'selectedAccountId' => ['required', 'integer', 'exists:bank_accounts,id'],
                'note' => ['nullable', 'string', 'max:500'],
                'currency' => ['required', 'string', 'in:usd,eur,gbp'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->with('flash', [
                'message' => 'Please check your input and try again.',
                'type' => 'error',
                'errors' => $e->errors()
            ])->withInput();
        }

        // Load user relationships
        $user->load([
            'portfolios',
            'bankAccounts',
            'bankAccountRequests',
            'histories',
            'notifications'
        ]);

        // Find the bank account and verify ownership
        $bankAccount = $user->bankAccounts->find($validatedData['selectedAccountId']);

        if (!$bankAccount) {
            return back()->with('flash', [
                'message' => 'Bank account not found or does not belong to you.',
                'type' => 'error'
            ])->withInput();
        }

        // Check if user has sufficient balance
        // Fix: Get the sum of all portfolio balances, not just pluck
        $userBalance = $user->portfolios->sum('balance') ?? 0;
        
        // Alternative if you have a direct balance field on user:
        // $userBalance = $user->balance ?? 0;

        if ($validatedData['amount'] > $userBalance) {
            return back()->with('flash', [
                'message' => 'Insufficient balance for this withdrawal.',
                'type' => 'error'
            ])->withInput();
        }

        // Prepare data for database insertion
        $historyData = [
            'user_id' => $user->id,
            'bank_account_id' => $validatedData['selectedAccountId'],
            'amount' => $validatedData['amount'],
            // 'note' => $validatedData['note'] ?? null,
            'status' => 'pending',
            // 'currency' => strtoupper($validatedData['currency']),
            'type' => 'withdrawal',
        ];

        // dd($userBalance, $historyData, $validatedData, $bankAccount);

        try {
            DB::beginTransaction();

            // Create the history record (UNCOMMENTED)
            $history = History::create($historyData);

            // Create the notification message
            $currencySymbol = $this->getCurrencySymbol($validatedData['currency']);
            $messageText = sprintf(
                "Withdrawal Request Submitted\n• Amount: %s%s\n• Destination: %s • …%s\n• Status: Pending approval",
                $currencySymbol,
                number_format($validatedData['amount'], 2),
                $bankAccount->bank_name,
                substr($bankAccount->account_number, -4)
            );

            // Create notification (UNCOMMENTED)
            Notification::create([
                'message' => $messageText,
                'to_user_id' => $user->id
            ]);

            // Optionally update user balance if needed
            // $user->decrement('balance', $validatedData['amount']);

            DB::commit();

            // Return success response with consistent flash data structure
            return back()->with('flash', [
                'message' => 'Withdrawal request submitted successfully! You will receive a confirmation email shortly.',
                'type' => 'success',
                'withdrawal' => [
                    'amount' => $validatedData['amount'],
                    'currency' => $validatedData['currency'],
                    'bank_name' => $bankAccount->bank_name,
                    'account_last_four' => substr($bankAccount->account_number, -4)
                ]
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            // Log the error for debugging
            Log::error('Withdrawal request failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'request_data' => $validatedData,
                'exception' => $e->getTraceAsString()
            ]);

            return back()->with('flash', [
                'message' => 'Failed to process withdrawal request. Please try again.',
                'type' => 'error'
            ])->withInput();
        }
    }

    /**
     * Get currency symbol based on currency code
     */
    private function getCurrencySymbol(string $currency): string
    {
        $symbols = [
            'usd' => '$',
            'eur' => '€',
            'gbp' => '£',
        ];

        return $symbols[strtolower($currency)] ?? '$';
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
