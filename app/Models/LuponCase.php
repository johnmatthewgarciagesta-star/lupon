<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LuponCase extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $table = 'cases';

    // OWASP TOP 10 PROTECTION EXPLANATION:
    // 3. Injection (OWASP #3) - Pinipigilan nito ang mga hacker na maglagay ng malisyosong SQL commands.
    // Ang variable na $fillable ay pumipigil sa "Mass Assignment Vulnerability".
    // Ang paggamit natin ng Laravel Eloquent ORM ay automatic na gumagamit ng "PDO Parameter Binding".
    // Ibig sabihin, ang lahat ng input tulad ng 'title' o 'complainant' ay itinuturing lamang na text 
    // at hindi tatakbo bilang malicious code sa ating database kahit subukan itong i-hack.
    protected $fillable = ['case_number', 'title', 'nature_of_case', 'complainant', 'respondent', 'created_by', 'status', 'date_filed', 'complaint_narrative', 'admin_notes', 'document_data'];

    protected $casts = [
        'document_data' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
