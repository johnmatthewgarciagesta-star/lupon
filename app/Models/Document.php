<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'case_id',
        'folder_name',
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
        return $this->belongsTo(LuponCase::class, 'case_id')->withTrashed();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function versions()
    {
        return $this->hasMany(DocumentVersion::class, 'document_id')->orderBy('version_number', 'desc');
    }
}
