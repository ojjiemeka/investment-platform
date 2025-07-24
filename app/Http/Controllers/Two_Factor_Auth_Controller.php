<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\TwoFactorCode;
use App\Models\BankAccountRequest;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class Two_Factor_Auth_Controller extends Controller
{
    public function verify(Request $request)
    {
        $user = Auth::user();

        $validatedData = $request->validate([
            'code' => 'required|string|min:4|max:10',
            'type' => 'required|string',
            'notification_id' => 'nullable|integer',
            'account_number' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'currency' => 'nullable|string',
        ]);

        try {
            $accountNumber = $validatedData['account_number'] ?? null;
            $bankName = $validatedData['bank_name'] ?? null;
            $currency = $validatedData['currency'] ?? null;
            $verificationCode = $validatedData['code'];
            $verificationType = $validatedData['type'];
            $userId = $user->id;

            if ($verificationType === 'bank_account_verification') {
                if (!$accountNumber || !$bankName) {
                    return redirect()->back()->with('flash', [
                        'message' => 'Bank account details are required for verification.',
                        'type' => 'error'
                    ]);
                }

                // Use database transaction to prevent race conditions
                return DB::transaction(function () use ($userId, $bankName, $accountNumber, $verificationCode, $verificationType, $currency) {
                    
                    // STEP 1: Find the specific bank account request
                    $bankRequest = BankAccountRequest::where('user_id', $userId)
                        ->where('bank_name', $bankName)
                        ->where(function ($query) use ($accountNumber) {
                            $query->where('account_number', 'LIKE', '%' . $accountNumber)
                                ->orWhere('account_number', $accountNumber);
                        })
                        ->first();

                    if (!$bankRequest) {
                        return redirect()->back()->with('flash', [
                           'message' => 'Bank account details were not found.',
                            'type' => 'error'
                        ]);
                    }

                    // CHECK IF ALREADY APPROVED
                    if ($bankRequest->status === 'approved') {
                        return redirect()->back()->with('flash', [
                            'message' => "This bank account ({$bankName} ending in {$accountNumber}) has already been approved and verified.",
                            'type' => 'error'
                        ]);
                    }

                    if ($bankRequest->status !== 'code_sent') {
                        return redirect()->back()->with('flash', [
                            'message' => "This bank account request is not ready for verification. Current status: {$bankRequest->status}",
                            'type' => 'error'
                        ]);
                    }

                    // STEP 2: Find the most recent UNUSED code for this user and type
                    $codeRecord = TwoFactorCode::where('user_id', $userId)
                        ->where('code', $verificationCode)
                        ->where('type', $verificationType)
                        ->where('is_used', false)
                        ->orderBy('created_at', 'desc') // Get the most recent unused code
                        ->first();

                    if (!$codeRecord) {
                        return redirect()->back()->with('flash', [
                            'message' => 'Invalid verification code',
                            'type' => 'error'
                        ]);
                    }

                    // STEP 3: Check if code has expired
                    if ($codeRecord->isExpired()) {
                        return redirect()->back()->with('flash', [
                            'message' => 'This verification code has expired. Please request a new code.',
                            'type' => 'error'
                        ]);
                    }

                    // STEP 4: SECURITY CHECK - Ensure code was created AFTER this bank request was updated to 'code_sent'
                    // This prevents using old codes for new bank requests
                    if ($codeRecord->created_at < $bankRequest->updated_at->subMinutes(1)) {
                        // Mark this code as used to prevent future attempts
                        $codeRecord->update(['is_used' => true]);
                        
                        return redirect()->back()->with('flash', [
                            'message' => 'This verification code is not valid for this bank account request. Please request a new code.',
                            'type' => 'error'
                        ]);
                    }

                    // STEP 5: IMMEDIATELY mark code as used to prevent any reuse (ATOMIC OPERATION)
                    $codeUpdated = TwoFactorCode::where('id', $codeRecord->id)
                        ->where('is_used', false) // Double-check it's still unused
                        ->update(['is_used' => true]);

                    if (!$codeUpdated) {
                        return redirect()->back()->with('flash', [
                            'message' => 'This verification code has already been used by another request.',
                            'type' => 'error'
                        ]);
                    }

                    // STEP 6: Mark ALL other unused codes for this user and type as used
                    // This prevents any other pending codes from being used
                    TwoFactorCode::where('user_id', $userId)
                        ->where('type', $verificationType)
                        ->where('is_used', false)
                        ->where('id', '!=', $codeRecord->id)
                        ->update(['is_used' => true]);

                    // STEP 7: Update bank request status
                    $bankRequest->update([
                        'status' => 'approved',
                        'verified_at' => now()
                    ]);

                    // STEP 7.5: Create BankAccount entry if it doesn't exist
                    $existingBankAccount = BankAccount::where('user_id', $userId)
                        ->where('bank_name', $bankName)
                        ->where(function ($query) use ($accountNumber) {
                            $query->where('account_number', 'LIKE', '%' . $accountNumber)
                                ->orWhere('account_number', $accountNumber);
                        })
                        ->first();

                        // dd($bankRequest->is_primary, $bankRequest->bank_name);

                    if (!$existingBankAccount) {
                        // Create new bank account
                        $bankAccount = BankAccount::create([
                            'user_id' => $userId,
                            'bank_name' => $bankRequest->bank_name,
                            'account_name' => $bankRequest->account_name,
                            'account_number' => $bankRequest->account_number,
                            'currency' => $bankRequest->currency,
                            'swift_code' => $bankRequest->swift_code,
                            'iban' => $bankRequest->iban,
                            'country' => $bankRequest->country,
                            'home_address' => $bankRequest->home_address,
                            'bank_address' => $bankRequest->bank_address,
                            'is_primary' => 0,
                            'verified_at' => now(),
                        ]);

                        \Log::info('New bank account created successfully', [
                            'user_id' => $userId,
                            'bank_account_id' => $bankAccount->id,
                            'bank_name' => $bankRequest->bank_name,
                            'account_number' => $bankRequest->account_number,
                            'currency' => $bankRequest->currency
                        ]);
                    } else {
                        // Update existing bank account
                        $existingBankAccount->update([
                            'verified_at' => now(),
                        ]);

                        \Log::info('Existing bank account updated', [
                            'user_id' => $userId,
                            'bank_account_id' => $existingBankAccount->id,
                            'bank_name' => $bankRequest->bank_name,
                            'account_number' => $bankRequest->account_number
                        ]);
                    }

                    // STEP 8: Create approval notification (MOVED OUTSIDE THE IF BLOCK)
                    Notification::create([
                        'message' => "✅ Bank Account Approved Successfully!\n\n" .
                                    "Your bank account has been verified and approved for transactions.\n\n" .
                                    "Bank Details:\n" .
                                    "- Bank: {$bankName}\n" .
                                    "- Account: ...{$accountNumber}\n" .
                                    "- Currency: {$currency}\n" .
                                    "- Status: ✅ Approved\n" .
                                    "- Approved At: " . now()->format('M d, Y \a\t H:i') . "\n\n" .
                                    "🎉 Your account is now active and ready for:\n" .
                                    "• Deposits and Withdrawals\n" .
                                    "• Fund Transfers\n" .
                                    "• Transaction History\n\n" .
                                    "Thank you for completing the verification process!",
                        'to_user_id' => $userId,
                    ]);

                    // RETURN SUCCESS (MOVED OUTSIDE THE IF BLOCK)
                    return redirect()->back()->with('flash', [
                        'message' => "✅ Bank Account Approved Successfully! Your {$bankName} account ending in {$accountNumber} ({$currency}) has been verified and is now active for transactions.",
                        'type' => 'success'
                    ]);
                });

            } else {
                // For non-bank verification types, use original logic with immediate marking
                return DB::transaction(function () use ($userId, $verificationCode, $verificationType) {
                    $codeRecord = TwoFactorCode::where('user_id', $userId)
                        ->where('code', $verificationCode)
                        ->where('type', $verificationType)
                        ->where('is_used', false)
                        ->orderBy('created_at', 'desc')
                        ->first();

                    if (!$codeRecord || $codeRecord->isExpired()) {
                        return redirect()->back()->with('flash', [
                            'message' => 'Invalid or expired verification code.',
                            'type' => 'error'
                        ]);
                    }

                    // Immediately mark as used
                    $codeUpdated = TwoFactorCode::where('id', $codeRecord->id)
                        ->where('is_used', false)
                        ->update(['is_used' => true]);

                    if (!$codeUpdated) {
                        return redirect()->back()->with('flash', [
                            'message' => 'This verification code has already been used.',
                            'type' => 'error'
                        ]);
                    }

                    return redirect()->back()->with('flash', [
                        'message' => 'Verification code verified successfully!',
                        'type' => 'success'
                    ]);
                });
            }

        } catch (\Exception $e) {
            \Log::error('2FA verification failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'request_data' => $validatedData,
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('flash', [
                'message' => 'Verification failed. Please try again or contact support.',
                'type' => 'error'
            ]);
        }
    }

    public function resend(Request $request)
    {
        $user = Auth::user();

        // dd($user);

        $validatedData = $request->validate([
            'type' => 'required|string',
            'account_number' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'currency' => 'nullable|string',
        ]);

        try {
            $accountNumber = $validatedData['account_number'] ?? null;
            $bankName = $validatedData['bank_name'] ?? null;
            $currency = $validatedData['currency'] ?? null;
            $verificationType = $validatedData['type'];
            $userId = $user->id;

            if ($verificationType === 'bank_account_verification') {
                if (!$accountNumber || !$bankName) {
                    return redirect()->back()->with('flash', [
                        'message' => 'Bank account details are required to resend verification code.',
                        'type' => 'error'
                    ]);
                }

                return DB::transaction(function () use ($userId, $bankName, $accountNumber, $verificationType, $currency, $user) {
                    
                    // Find the bank account request
                    $bankRequest = BankAccountRequest::where('user_id', $userId)
                        ->where('bank_name', $bankName)
                        ->where(function ($query) use ($accountNumber) {
                            $query->where('account_number', 'LIKE', '%' . $accountNumber)
                                ->orWhere('account_number', $accountNumber);
                        })
                        ->first();

                    if (!$bankRequest) {
                        return redirect()->back()->with('flash', [
                           'message' => 'Bank account details were not found.',
                            'type' => 'error'
                        ]);
                    }

                    // Check if already approved
                    if ($bankRequest->status === 'approved') {
                        return redirect()->back()->with('flash', [
                            'message' => "This bank account has already been approved. No need to resend verification code.",
                            'type' => 'error'
                        ]);
                    }

                    // Check if request is in correct status
                    if ($bankRequest->status !== 'code_sent') {
                        return redirect()->back()->with('flash', [
                            'message' => "Cannot resend code for this bank account. Current status: {$bankRequest->status}",
                            'type' => 'error'
                        ]);
                    }

                    // Mark all existing codes for this user and type as used
                    TwoFactorCode::where('user_id', $userId)
                        ->where('type', $verificationType)
                        ->where('is_used', false)
                        ->update(['is_used' => true]);

                    // Generate new verification code
                    $newCode = TwoFactorCode::create([
                        'user_id' => $userId,
                        'code' => TwoFactorCode::generateCode(),
                        'type' => $verificationType,
                        'expires_at' => now()->addHours(24),
                        'is_used' => false,
                    ]);

                    // Send email with new verification code (you'll need to implement this)
                    // Mail::to($user->email)->send(new VerificationCodeMail($newCode->code, $bankRequest));

                    // Create notification about code resend
                    Notification::create([
                        'message' => "🔐 New Verification Code Sent!\n\n" .
                                    "A new verification code has been sent to your email for your bank account verification.\n\n" .
                                    "Bank Details:\n" .
                                    "- Bank: {$bankName}\n" .
                                    "- Account: ...{$accountNumber}\n" .
                                    "- Currency: {$currency}\n\n" .
                                    "📧 Please check your email (including spam folder) for the new 6-digit verification code.\n\n" .
                                    "⏰ Code expires in 24 hours.\n\n" .
                                    "Enter the verification code to complete your bank account setup.",
                        'to_user_id' => $userId,
                    ]);

                    return redirect()->back()->with('flash', [
                        'message' => "New verification code sent! Please check your email for the 6-digit code to verify your {$bankName} account.",
                        'type' => 'success'
                    ]);
                });

            } else {
                // For other verification types
                return redirect()->back()->with('flash', [
                    'message' => 'Resend functionality not available for this verification type.',
                    'type' => 'error'
                ]);
            }

        } catch (\Exception $e) {
            \Log::error('2FA resend failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'request_data' => $validatedData,
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('flash', [
                'message' => 'Failed to resend verification code. Please try again or contact support.',
                'type' => 'error'
            ]);
        }
    }
}