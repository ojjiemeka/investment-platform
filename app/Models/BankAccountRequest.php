<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankAccountRequest extends Model
{
    protected $fillable = [
        'user_id',
        'bank_name',
        'account_name',
        'account_number',
        'currency',
        'swift_code',
        'iban',
        'bank_address',
        'home_address',
        'country',
        'status',  // 'pending', 'approved', 'rejected'
        'admin_id', // Admin who processes the request (nullable)
    ];

    // A bank account request belongs to a user (the requester)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // If the request is approved, it might reference an admin who processed it
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
