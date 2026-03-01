<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LuponCase extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $table = 'cases';

    protected $fillable = ['case_number', 'title', 'nature_of_case', 'complainant', 'respondent', 'created_by', 'status', 'date_filed', 'complaint_narrative', 'admin_notes', 'document_data'];

    protected $casts = [
        'document_data' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
