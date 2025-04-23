<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $fillable = [
        'user_id',
        'type',      // 'stock', 'crypto', 'real_estate', 'fund', 'bond'
        'balance',
    ];

    // Portfolio belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
