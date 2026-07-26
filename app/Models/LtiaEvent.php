<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LtiaEvent extends Model
{
    protected $fillable = [
        'title',
        'notes',
        'event_date',
    ];

    protected $casts = [
        'event_date' => 'date',
    ];
}
