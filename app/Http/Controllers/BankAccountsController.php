<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BankAccountsController extends Controller
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
        // dd($request->all()); // Debugging line to check the incoming request data
        // Validate the incoming request data
        $validatedData = $request->validate([
            'user_id' => ['required', 'string', 'exists:users,id'], // Ensure user_id exists in the users table
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
            'is_primary' => ['boolean'], // Expect a boolean value
        ]);

        // dd($validatedData); // Debugging line to check the validated data

        // Handle the 'is_primary' logic:
        // If the new account is set as primary, set all other accounts for this user to not primary.
        if ($validatedData['is_primary']) {
            BankAccount::where('user_id', $validatedData['user_id'])
                       ->update(['is_primary' => false]);
        }

        // Create the new bank account record
        $bankAccount = BankAccount::create($validatedData);

        // Return a response, typically a redirect back with a flash message for Inertia
        return redirect()->route('accounts')
        ->with('success', 'Bank account added successfully!')
        ->with('accounts', $bankAccount);

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
