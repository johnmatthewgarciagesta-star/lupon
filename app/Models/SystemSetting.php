<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Get a setting by key with fallback.
     */
    public static function get(string $key, ?string $default = null): ?string
    {
        try {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        } catch (\Exception $e) {
            \Log::warning('SystemSetting get failed for key ' . $key . ': ' . $e->getMessage());
            return $default;
        }
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, ?string $value): ?static
    {
        try {
            return static::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        } catch (\Exception $e) {
            \Log::warning('SystemSetting set failed for key ' . $key . ': ' . $e->getMessage());
            return null;
        }
    }
}
