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
        'created_by',
    ];

    protected $casts = [
        'content' => 'array',
        'issued_at' => 'datetime',
    ];

    public function case()
    {
        return $this->belongsTo(LuponCase::class, 'case_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
