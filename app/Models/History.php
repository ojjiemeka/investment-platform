<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class History extends Model
{
    protected $fillable = [
        'user_id',
        'type',            // 'deposit' or 'withdrawal'
        'amount',
        'status',          // 'pending', 'approved', 'rejected'
        'bank_account_id', // Nullable; required for withdrawals
    ];

    // A history record belongs to a user.
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // If this history is a withdrawal, it may belong to a bank account.
    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }
}
