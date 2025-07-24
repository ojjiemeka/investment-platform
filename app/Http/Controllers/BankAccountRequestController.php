<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BankAccountRequest as ModelsBankAccountRequest;
use App\Models\Notification;
use App\Models\TwoFactorCode;
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
        $user = Auth::user();

        // Debug what we're receiving
        \Log::info('Update method called', [
            'url_id' => $id,
            'all_request_data' => $request->all(),
            'content' => $request->getContent(),
            'method' => $request->method()
        ]);

        // Make validation more flexible - user_id and request_id are optional since we have the ID in URL
        $validatedData = $request->validate([
            'status' => 'required|string',
            'user_id' => 'nullable|integer',
            'request_id' => 'nullable|integer',
        ]);

        try {
            // Find the bank account request
            $bankRequest = ModelsBankAccountRequest::findOrFail($id);
            
            // Store old status for comparison
            $oldStatus = $bankRequest->status;
            
            // Update the status
            $bankRequest->update([
                'status' => $validatedData['status'],
                'admin_id' => $user->id
            ]);

            // Create notification and 2FA code for the user based on status
            $this->createUserNotification($bankRequest, $validatedData['status'], $oldStatus);

            // Log the successful update
            \Log::info('Bank request status updated', [
                'request_id' => $id,
                'old_status' => $oldStatus,
                'new_status' => $validatedData['status'],
                'updated_by_admin' => $user->id,
                'target_user_id' => $bankRequest->user_id
            ]);

            // Return different flash messages based on status
            $flashMessage = $this->getAdminFlashMessage($validatedData['status']);
            
            return redirect()->back()->with('flash', $flashMessage);

        } catch (\Exception $e) {
            \Log::error('Failed to update bank request status', [
                'request_id' => $id,
                'error' => $e->getMessage(),
                'admin_user' => $user->id
            ]);

            return redirect()->back()->with('flash', [
                'message' => 'Failed to update bank request status. Please try again.',
                'type' => 'error'
            ]);
        }
    }

    /**
     * Create notification for user based on status update
     */
    private function createUserNotification($bankRequest, $newStatus, $oldStatus)
    {
        $notifications = [
            'code_sent' => "🔐 Verification Code Sent - Action Required

Great news! Your {$bankRequest->bank_name} account request has been approved.

📧 A verification code has been sent to your email: {$bankRequest->user->email}

⚡ Next Steps:
- Check your email (including spam folder)
- Enter the verification code when prompted
- Complete the final verification step

⏰ Code expires in 24 hours
💡 Need help? Contact our support team

Bank Details:
- Bank: {$bankRequest->bank_name}
- Account: ...{$bankRequest->account_number}
- Currency: {$bankRequest->currency}",

            'approved' => "✅ Bank Account Approved - Setup Complete!

Congratulations! Your {$bankRequest->bank_name} account has been fully approved and is now active.

🎉 Your account is ready to use:
- Bank: {$bankRequest->bank_name}
- Account: ...{$bankRequest->account_number}
- Currency: {$bankRequest->currency}
- Status: Active

💰 You can now:
- Receive payments
- Make withdrawals
- View transaction history

Thank you for choosing our platform!",

            'rejected' => "❌ Bank Account Request Declined

Unfortunately, your {$bankRequest->bank_name} account request has been declined after review.

📋 Request Details:
- Bank: {$bankRequest->bank_name}
- Currency: {$bankRequest->currency}
- Submitted: {$bankRequest->created_at->format('M d, Y')}

🔄 Next Steps:
- Review the requirements
- Submit a new request with correct information
- Contact support if you need assistance

💡 Common reasons for decline:
- Incomplete information
- Invalid bank details
- Documentation issues

We're here to help - reach out to our support team!"
        ];

        // Only create notification if we have a message for this status
        if (isset($notifications[$newStatus])) {
            // Create the notification
            Notification::create([
                'message' => $notifications[$newStatus],
                'to_user_id' => $bankRequest->user_id,
            ]);

            // Generate and store 2FA code if status is 'code_sent'
            if ($newStatus === 'code_sent') {
                $this->generateVerificationCode($bankRequest->user_id);
            }
        }
    }

    /**
     * Generate and store verification code for bank account verification
     */
    private function generateVerificationCode($userId)
    {
        try {
            // Create a 2FA code that expires in 24 hours (1440 minutes)
            $twoFactorCode = TwoFactorCode::createForUser(
                $userId, 
                'bank_account_verification', 
                1440 // 24 hours
            );

            // Log the code generation (for debugging - remove in production)
            \Log::info('Bank verification code generated', [
                'user_id' => $userId,
                'code_id' => $twoFactorCode->id,
                'code' => $twoFactorCode->code, // Remove this in production for security
                'expires_at' => $twoFactorCode->expires_at,
                'type' => $twoFactorCode->type
            ]);

            // In a real application, you would send this code via email
            // For now, we'll just log it for testing purposes
            \Log::info('Verification code to be sent via email', [
                'user_id' => $userId,
                'verification_code' => $twoFactorCode->code
            ]);

            return $twoFactorCode;

        } catch (\Exception $e) {
            \Log::error('Failed to generate verification code', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Get flash message for admin based on status
     */
    private function getAdminFlashMessage($status)
    {
        switch ($status) {
            case 'code_sent':
                return [
                    'message' => 'Request approved! Verification code generated and sent to user.',
                    'type' => 'success'
                ];
            case 'approved':
                return [
                    'message' => 'Request completed successfully! User has been notified.',
                    'type' => 'success'
                ];
            case 'rejected':
                return [
                    'message' => 'Request has been rejected. User has been notified.',
                    'type' => 'error'
                ];
            default:
                return [
                    'message' => 'Bank request status updated successfully!',
                    'type' => 'success'
                ];
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
