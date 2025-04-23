<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
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
        'is_primary',
    ];

    // BankAccount belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A bank account might be associated with many withdrawal histories.
    public function histories()
    {
        return $this->hasMany(History::class);
    }
}
