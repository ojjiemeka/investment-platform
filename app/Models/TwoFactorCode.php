<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class TwoFactorCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'type',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Relationship to User model
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a random 6-digit code
     */
    public static function generateCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create a new 2FA code for a user
     */
    public static function createForUser(int $userId, string $type, int $expiresInMinutes = 10): self
    {
        // Delete any existing unused codes for this user and type
        self::where('user_id', $userId)
            ->where('type', $type)
            ->where('is_used', false)
            ->delete();

        return self::create([
            'user_id' => $userId,
            'code' => self::generateCode(),
            'type' => $type,
            'expires_at' => Carbon::now()->addMinutes($expiresInMinutes),
            'is_used' => false,
        ]);
    }

    /**
     * Verify a code for a user
     */
    public static function verify(int $userId, string $code, string $type): bool
    {
        $twoFactorCode = self::where('user_id', $userId)
            ->where('code', $code)
            ->where('type', $type)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($twoFactorCode) {
            $twoFactorCode->update(['is_used' => true]);
            return true;
        }

        return false;
    }

    /**
     * Check if the code is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at < Carbon::now();
    }

    /**
     * Check if the code is valid (not used and not expired)
     */
    public function isValid(): bool
    {
        return !$this->is_used && !$this->isExpired();
    }

    /**
     * Clean up expired codes (can be called in a scheduled task)
     */
    public static function cleanupExpired(): int
    {
        return self::where('expires_at', '<', Carbon::now())
            ->orWhere('is_used', true)
            ->delete();
    }

    /**
     * Scope for valid codes
     */
    public function scopeValid($query)
    {
        return $query->where('is_used', false)
            ->where('expires_at', '>', Carbon::now());
    }

    /**
     * Scope for specific type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}