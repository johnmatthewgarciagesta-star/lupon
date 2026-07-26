<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LtiaPhase extends Model
{
    protected $fillable = [
        'step',
        'title',
        'description',
        'start_date',
        'end_date',
        'progress',
        'status',
    ];

    protected $casts = [
        'step' => 'integer',
        'progress' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
