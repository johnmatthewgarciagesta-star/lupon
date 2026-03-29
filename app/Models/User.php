<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'duty_group',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
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
            // OWASP TOP 10 PROTECTION EXPLANATION:
            // 2. Cryptographic Failures (OWASP #2) - Pinoprotektahan nito ang sensitive data tulad ng passwords.
            // Ang 'hashed' attribute dito ay sumisiguro na gagamit ang Laravel ng Bcrypt encryption algorithm.
            // Kaya kahit ma-hack ang database, 'scrambled code' lang ang makikita nila at hindi ang totoong password ng user.
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
