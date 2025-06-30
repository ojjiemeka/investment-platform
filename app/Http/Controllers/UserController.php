<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;


class UserController extends Controller
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
       $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'balance' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'role' => ['nullable', 'string', 'in:user,admin'], // Added role validation
        ]);

        try {
            DB::beginTransaction();

            // Create the user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make('default123'),
                'is_active' => $validated['is_active'],
                'role' => $validated['role'] ?? 'user', // Default to 'user' role
            ]);

            // Create portfolio record if balance is provided
            if (isset($validated['balance']) && $validated['balance'] > 0 && $user) {
                $user->portfolios()->create([
                    'user_id' => $user->id,
                    'type' => 'stock', // Assuming a default type, adjust as needed
                    'balance' => $validated['balance'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            Log::info('User created successfully:', [
                'user_id' => $user->id,
                'user_data' => $user->toArray()
            ]);

            // Return success response that Inertia can handle
            // Option 1: Redirect back to the admin dashboard
            return redirect()->route('adminDashboard')
                ->with('success', 'User created successfully')
                ->with('user', $user->load('portfolios'));


        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create user:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $validated
            ]);
            
            return back()->withErrors([
                'general' => 'Failed to create user: ' . $e->getMessage()
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

               // Find the celebrity record
        $data = User::findOrFail($id);

        // Validate the incoming data using Laravel 12 syntax
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
            ],
            'balance' => ['nullable', 'decimal:0,2', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        // dd($validated, $data); // Keep this for debugging to see the validated data

        try {
            // Log the incoming data for debugging
            Log::info('Updating user:', [
                'user_id' => $data->id,
                'data' => $validated
            ]);

           // Update the user using Laravel 12 mass assignment protection
             $data->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_active' => $validated['is_active'],
            ]);

            // // If balance is stored in a separate table (like wallets/accounts)
            // if (isset($validated['balance'])) {
            //     // Example: Update wallet balance using Laravel 12 upsert
            //     $user->wallet()->updateOrCreate(
            //         ['user_id' => $user->id],
            //         ['balance' => $validated['balance']]
            //     );
            // }

            // Log success
            Log::info('User updated successfully:', ['user_id' => $data->id]);

            // Return success response using Laravel 12 Inertia response
             return redirect()->route('adminDashboard')
                ->with('success', 'User updated successfully')
                ->with('user', $data->load('portfolios'));

            // return redirect()->route('adminDashboard')
            //     ->with('flash', [
            //         'type' => 'success',
            //         'message' => 'User updated successfully'
            //     ]);
        } catch (\Throwable $e) {
            // Log the error
            Log::error('Error updating user:', [
                'user_id' => $data->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update user: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
