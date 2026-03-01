<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormLayout extends Model
{
    protected $fillable = [
        'document_type',
        'layout_json',
        'is_hidden',
    ];

    protected $casts = [
        'layout_json' => 'array',
        'is_hidden' => 'boolean',
    ];
}
