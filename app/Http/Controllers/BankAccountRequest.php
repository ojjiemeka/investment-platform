<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BankAccountRequest as ModelsBankAccountRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BankAccountRequest extends Controller
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
        $user= Auth::user();

        // Validate the incoming request data
        $validatedData = $request->validate([
            // 'user_id' => ['required', 'string', 'exists:users,id'], // Ensure user_id exists in the users table
            'bank_name' => ['required', 'string', 'max:255'],
            'account_name' => ['required', 'string', 'max:255'],
            'account_number' => [
                'required',
                'string',
                'max:255',
                // Ensure account_number is unique for a given user_id
                Rule::unique('bank_accounts')->where(function ($query) use ($request) {
                    return $query->where('user_id', $request->user_id);
                }),
            ],
            'currency' => ['required', 'string'], // e.g., 'USD', 'NGN', 'EUR'
            'swift_code' => ['required', 'string', 'max:11'],
            'iban' => ['nullable', 'string', 'max:34'], // IBAN is optional
            'country' => ['nullable', 'string', 'max:255'], // Bank address is optional
            'home_address' => ['nullable', 'string', 'max:255'], // Bank address is optional
            'bank_address' => ['nullable', 'string', 'max:255'], // Bank address is optional
        ]);

        $validatedData['user_id'] = $user->id;

        dd($validatedData); // Debugging line to check the validated data

        // Handle the 'is_primary' logic:
        // If the new account is set as primary, set all other accounts for this user to not primary.

        // Create the new bank account record
        $bankAccountRequests = ModelsBankAccountRequest::create($validatedData);

        // Return a response, typically a redirect back with a flash message for Inertia
        return redirect()->route('wallet.index')
        ->with('success', 'Bank account added successfully!');

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
