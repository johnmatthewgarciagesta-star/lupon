<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_id',
        'type',
        'content',
        'file_path',
        'status',
        'issued_at',
    ];

    protected $casts = [
        'content' => 'array',
        'issued_at' => 'datetime',
    ];

    public function case()
    {
        return $this->belongsTo(LuponCase::class, 'case_id');
    }
}
