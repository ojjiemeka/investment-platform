<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BankAccountRequest as ModelsBankAccountRequest;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class BankAccountRequestController extends Controller
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
            return redirect()->back()->with('flash', [
                'message' => 'You must be authenticated to perform this action.',
                'type' => 'error'
            ]);
        }

        // Validate the incoming request data
        try {
            $validatedData = $request->validate([
                'bank_name' => ['required', 'string', 'max:255'],
                'account_name' => ['required', 'string', 'max:255'],
                'account_number' => [
                    'required',
                    'string',
                    'max:255',
                    // Ensure account_number is unique for a given user_id
                    Rule::unique('bank_account_requests')->where(function ($query) use ($user) {
                        return $query->where('user_id', $user->id);
                    }),
                ],
                'currency' => ['required', 'string', 'in:USD,EUR,GBP,CAD,AUD,JPY'],
                'swift_code' => ['nullable', 'string', 'max:11'],
                'iban' => ['nullable', 'string', 'max:34'],
                'country' => ['required', 'string', 'max:2'],
                'home_address' => ['nullable', 'string', 'max:500'],
                'bank_address' => ['nullable', 'string', 'max:500'],
                'is_primary' => ['boolean'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->with('flash', [
                'message' => 'Please check your input and try again.',
                'type' => 'error',
                'errors' => $e->errors()
            ])->withInput();
        }

        // Add user_id to validated data
        $validatedData['user_id'] = $user->id;

        try {
            DB::beginTransaction();

            // Create the new bank account request
            $bankAccountRequest = ModelsBankAccountRequest::create($validatedData);

            // Create notification message
            // Create notification message
            $messageText = sprintf(
                "Bank Account Request Submitted Successfully\n\nYour %s account ending in %s has been submitted for review.\n\n• Account Holder: %s\n• Currency: %s\n• Status: Pending approval\n• Timeline: 1-2 business days\n\nYou'll receive a confirmation email once your account is approved.",
                $validatedData['bank_name'],
                substr($validatedData['account_number'], -4),
                $validatedData['account_name'],
                $validatedData['currency']
            );

            // Create notification
            Notification::create([
                'message' => $messageText,
                'to_user_id' => $user->id,
                // 'type' => 'bank_account_request',
                // 'related_id' => $bankAccountRequest->id,
            ]);

            // dd($messageText);

            DB::commit();

            // Return success response
            return redirect()->back()->with('flash', [
                'message' => 'Bank account request submitted successfully! You will receive a confirmation email shortly.',
                'type' => 'success',
                'bank_request' => [
                    'bank_name' => $validatedData['bank_name'],
                    'account_name' => $validatedData['account_name'],
                    'currency' => $validatedData['currency'],
                    'account_last_four' => substr($validatedData['account_number'], -4)
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Log the error for debugging
            Log::error('Bank account request failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'request_data' => $validatedData,
                'exception' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('flash', [
                'message' => 'Failed to submit bank account request. Please try again.',
                'type' => 'error'
            ])->withInput();
        }
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
