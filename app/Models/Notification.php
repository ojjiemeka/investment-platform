<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'message',
        'to_user_id',
    ];

    // A notification may belong to a user (if sent specifically).
    public function user()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
