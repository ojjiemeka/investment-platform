<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
     // Define the fillable fields for mass-assignment
     protected $fillable = [
        'name',
        'email',
        'password',
        'role',         // 'user' or 'admin'
        'is_restricted',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

     // Relationships

    // A user can have many portfolios.
    public function portfolios()
    {
        return $this->hasMany(Portfolio::class);
    }

    // A user can have many bank accounts (official records)
    public function bankAccounts()
    {
        return $this->hasMany(BankAccount::class);
    }

    // A user can make many bank account requests.
    public function bankAccountRequests()
    {
        return $this->hasMany(BankAccountRequest::class);
    }

    // A user can have many history records (deposits and withdrawals).
    public function histories()
    {
        return $this->hasMany(History::class);
    }

    // A user can receive many notifications.
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'to_user_id');
    }
}
