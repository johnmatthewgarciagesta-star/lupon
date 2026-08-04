<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentVersion extends Model
{
    protected $fillable = [
        'document_id',
        'version_number',
        'edited_by',
        'edited_by_name',
        'change_type',
        'content_snapshot',
        'file_path_snapshot',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'content_snapshot' => 'array',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class, 'document_id')->withTrashed();
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }
}
