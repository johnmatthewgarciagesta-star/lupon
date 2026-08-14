<?php

namespace App\Http\Controllers;

use App\Models\LuponCase;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CaseController extends Controller
{
    public static function checkMonthlyRolloverAutoArchive()
    {
        try {
            $startOfCurrentMonth = \Carbon\Carbon::now()->startOfMonth();
            
            // Auto-archive cases from prior months that have not been modified or restored during the current month
            $olderCases = LuponCase::where('date_filed', '<', $startOfCurrentMonth)
                ->where('updated_at', '<', $startOfCurrentMonth)
                ->whereNull('deleted_at')
                ->get();

            foreach ($olderCases as $case) {
                $case->delete();
                AuditService::log(
                    'AUTO_ARCHIVE',
                    'Cases',
                    "Auto-archived Case #{$case->case_number} upon new month rollover",
                    $case->case_number
                );
            }
        } catch (\Exception $e) {
            Log::error('Monthly Auto-Archive failed: ' . $e->getMessage());
        }
    }

    public function index(Request $request)
    {
        // Auto-archive cases from prior months when a new month arrives
        static::checkMonthlyRolloverAutoArchive();

        $query = LuponCase::with(['documents.creator', 'creator']);

        // Search across case_number, folder_name, title, complainant, respondent, nature_of_case, status, date_filed
        if ($request->filled('search')) {
            $search = $request->input('search');
            $cleanSearch = trim($search, '/ ');
            
            $numericId = null;
            if (preg_match('/^case-(\d+)$/i', $cleanSearch, $matches)) {
                $numericId = (int) $matches[1];
            } elseif (is_numeric($cleanSearch)) {
                $numericId = (int) $cleanSearch;
            }
            
            $dateParsed = null;
            if (!is_numeric($cleanSearch) && preg_match('/[\/\-\.]/', $cleanSearch) && strtotime($cleanSearch) !== false) {
                try {
                    $dateParsed = \Carbon\Carbon::parse($cleanSearch)->format('Y-m-d');
                } catch (\Exception $e) {}
            }

            $query->where(function ($q) use ($search, $cleanSearch, $numericId, $dateParsed) {
                $q->where('case_number', 'like', "%{$cleanSearch}%")
                    ->orWhere('folder_name', 'like', "%{$cleanSearch}%")
                    ->orWhere('title', 'like', "%{$cleanSearch}%")
                    ->orWhere('complainant', 'like', "%{$cleanSearch}%")
                    ->orWhere('respondent', 'like', "%{$cleanSearch}%")
                    ->orWhere('nature_of_case', 'like', "%{$cleanSearch}%")
                    ->orWhere('status', 'like', "%{$cleanSearch}%")
                    ->orWhere('date_filed', 'like', "%{$cleanSearch}%");

                if ($numericId !== null) {
                    $q->orWhere('id', $numericId)
                      ->orWhere('case_number', 'like', "%{$numericId}%");
                }

                if ($dateParsed) {
                    $q->orWhereDate('date_filed', $dateParsed);
                }
            });
        }

        // Filter by Status
        if ($request->filled('status') && $request->status !== 'all') {
            $st = $request->status;
            if (strcasecmp($st, 'Resolved') === 0 || strcasecmp($st, 'Settled') === 0) {
                $query->whereIn('status', ['Resolved', 'Settled']);
            } elseif (strcasecmp($st, 'Escalated') === 0) {
                $query->whereIn('status', ['Escalated', 'Certified', 'Dismissed']);
            } elseif (strcasecmp($st, 'Pending') === 0) {
                $query->whereIn('status', ['Pending', 'Ongoing']);
            } else {
                $query->where('status', 'like', "%{$st}%");
            }
        }

        // Filter by Date
        if ($request->filled('date')) {
            $query->whereDate('date_filed', $request->date);
        }

        // Filter by Nature / Case Type
        if ($request->filled('nature') && $request->nature !== 'all') {
            $query->where('nature_of_case', 'like', "%{$request->nature}%");
        }

<<<<<<< HEAD
        // Filter by Month (ONLY if explicitly set to a specific month or 'latest', and NOT 'all')
        if ($request->filled('month') && $request->month !== 'all') {
            $monthVal = $request->input('month');
=======
        // Filter by Month or New Cases trigger
        if (($request->filled('month') && $request->month !== 'all') || $request->input('filter') === 'new_cases') {
            $monthVal = $request->input('month', 'latest');
>>>>>>> a485458 (Fixed errors after interview with tito ni gab)
            $targetYear = \Carbon\Carbon::now()->year;

            if ($monthVal === 'latest') {
                $targetMonth = \Carbon\Carbon::now()->month;
<<<<<<< HEAD
                $query->where(function($q) use ($targetMonth, $targetYear) {
                    $q->whereMonth('date_filed', $targetMonth)
                      ->orWhereMonth('created_at', $targetMonth);
                });
            } elseif (is_numeric($monthVal)) {
                $targetMonth = (int) $monthVal;
                $query->where(function($q) use ($targetMonth, $targetYear) {
                    $q->whereMonth('date_filed', $targetMonth)
                      ->orWhereMonth('created_at', $targetMonth);
                });
            }
        } elseif ($request->input('filter') === 'new_cases') {
            $targetMonth = \Carbon\Carbon::now()->month;
            $targetYear = \Carbon\Carbon::now()->year;
            $query->where(function($q) use ($targetMonth, $targetYear) {
                $q->whereMonth('date_filed', $targetMonth)
                  ->orWhereMonth('created_at', $targetMonth);
=======
                $query->whereMonth('date_filed', $targetMonth)
                      ->whereYear('date_filed', $targetYear);
            } elseif (is_numeric($monthVal)) {
                $targetMonth = (int) $monthVal;
                $query->whereMonth('date_filed', $targetMonth)
                      ->whereYear('date_filed', $targetYear);
            }
        }

        // Filter by Document Type / File Association
        if ($request->filled('doc_type') && $request->doc_type !== 'all') {
            $docType = $request->input('doc_type');
            $docTitle = $request->input('doc_title', '');

            $query->where(function ($q) use ($docType, $docTitle) {
                $q->whereHas('documents', function ($dq) use ($docType, $docTitle) {
                    $dq->where('type', 'like', "%{$docType}%");
                    if ($docTitle) {
                        $dq->orWhere('type', 'like', "%{$docTitle}%");
                    }
                })
                ->orWhere('document_data', 'like', "%{$docType}%");

                if ($docTitle) {
                    $q->orWhere('document_data', 'like', "%{$docTitle}%");
                }
>>>>>>> a485458 (Fixed errors after interview with tito ni gab)
            });
        }

        // Sort
        $defaultSort = ($request->filled('month') && $request->month !== 'all') ? 'date_filed' : 'created_at';
        $sortField = $request->input('sort_by', $defaultSort);
        $sortOrder = $request->input('sort_order', 'desc');
        
        // Ensure valid sort field
        $allowedFields = ['case_number', 'title', 'nature_of_case', 'complainant', 'respondent', 'status', 'date_filed', 'created_at'];
        if (!in_array($sortField, $allowedFields)) {
            $sortField = $defaultSort;
        }
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $paginated = $query->orderBy($sortField, $sortOrder)
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $paginated->through(function ($case) {
            $folderName = $case->folder_name ?: ('case-' . str_pad($case->id, 3, '0', STR_PAD_LEFT));
            return [
                'id' => $case->id,
                'case_number' => $case->case_number,
                'folder_name' => $folderName,
                'title' => $case->title,
                'nature_of_case' => $case->nature_of_case,
                'complainant' => $case->complainant,
                'respondent' => $case->respondent,
                'status' => $case->status,
                'date_filed' => $case->date_filed,
                'created_by' => $case->created_by,
                'creator' => ['name' => $case->creator ? $case->creator->name : ($case->created_by ? 'Encoder #'.$case->created_by : 'System Admin')],
                'documents_count' => $case->documents->count(),
                'documents' => $case->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'type' => $doc->type,
                        'file_path' => $doc->file_path,
                        'status' => $doc->status,
                        'created_at' => $doc->created_at ? $doc->created_at->format('M d, Y H:i') : null,
                        'creator' => $doc->creator ? ['name' => $doc->creator->name] : null,
                    ];
                })->values(),
            ];
        });

        return \Inertia\Inertia::render('cases/index', [
            'cases' => $paginated,
            'filters' => $request->only(['search', 'status', 'nature', 'date', 'month', 'filter', 'sort_by', 'sort_order', 'doc_type', 'doc_title']),
        ]);
    }

    public function archives(Request $request)
    {
        // Only get soft-deleted cases
        $query = LuponCase::onlyTrashed();

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('case_number', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('complainant', 'like', "%{$search}%")
                    ->orWhere('respondent', 'like', "%{$search}%");
            });
        }

        // Filter by Date (the file date to show on archive dashboard)
        if ($request->filled('date')) {
            // Can be exact date or month/year depending on UI - let's do exactly date matching for now
            $query->whereDate('date_filed', $request->date);
        }

        $cases = $query->orderBy('deleted_at', 'desc')->paginate(10)->withQueryString();

        return \Inertia\Inertia::render('cases/archive', [
            'cases' => $cases,
            'filters' => $request->only(['search', 'date']),
        ]);
    }

    public function store(Request $request)
    {
        // OWASP TOP 10 PROTECTION EXPLANATION:
        // 5. Identification and Authentication Failures / CSRF (OWASP #7)
        // Bago pa man makarating ang data sa 'store' function na ito, dumaan na ito sa verified CSRF protection ng Laravel.
        // Ibig sabihin, nakasiguro ang system na galing mismo sa authorized device ng barangay ang form submission
        // at hindi pwersahang pinasa ng hacker mula sa ibang website (Cross-Site Request Forgery).
        Log::info('Submitting Case:', $request->all());

        $caseNo = trim($request->input('case_no') ?: $request->input('case_number') ?: '');

        if (!empty($caseNo)) {
            $existingCase = LuponCase::where('case_number', $caseNo)->first();
            if ($existingCase) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Case Number already exists in the records.',
                        'errors' => [
                            'case_no' => ['Case Number already exists in the records.']
                        ]
                    ], 422);
                }

                return back()->withErrors([
                    'case_no' => 'Case Number already exists in the records.'
                ])->withInput();
            }
        }

        // Validate basic fields
        $validated = $request->validate([
            'case_no' => 'required|string',
            'complainant' => 'required|string',
            'respondent' => 'required|string',
            'narrative' => 'nullable|string',
            'date_filed' => 'nullable|date',
            // Add other fields as needed
        ]);

        try {
            $case = LuponCase::create([
                'case_number' => $request->case_no,
                'title' => $request->complainant.' vs '.$request->respondent,
                'complainant' => $request->complainant,
                'respondent' => $request->respondent,
                'nature_of_case' => $request->nature ?? ucwords(str_replace(['_', '-'], ' ', $request->document_type ?? 'Unspecified')),
                'status' => 'Pending',
                'date_filed' => $request->date_filed ?? now(),
                'complaint_narrative' => $request->narrative,
                'admin_notes' => 'Submitted via Visual Editor',
                'document_data' => $request->all(),
                'created_by' => auth()->id(),
            ]);

            AuditService::log('CREATE', 'Cases', "Created Case #{$case->case_number}", $case->case_number);

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'message' => 'Case filed successfully.']);
            }

            return redirect()->route('cases.index')->with('success', 'Case filed successfully.');

        } catch (\Exception $e) {
            Log::error('Case Submission Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error saving case: '.$e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        Log::info('Updating Case:', $request->all());

        try {
            $case = LuponCase::findOrFail($id);

            // Update fields if present (allow partial updates)
            if ($request->has('case_no')) {
                $case->case_number = $request->case_no;
            }

            if ($request->has('complainant')) {
                $case->complainant = $request->complainant;
            }
            if ($request->has('respondent')) {
                $case->respondent = $request->respondent;
            }

            // Sync title if either party changes
            if ($request->has('complainant') || $request->has('respondent')) {
                $comp = $request->complainant ?? $case->complainant ?? explode(' vs ', $case->title)[0];
                $resp = $request->respondent ?? $case->respondent ?? explode(' vs ', $case->title)[1] ?? 'Unknown';
                $case->title = $comp.' vs '.$resp;
            }

            if ($request->has('narrative')) {
                $case->complaint_narrative = $request->narrative;
            }
            if ($request->has('date_filed')) {
                $case->date_filed = $request->date_filed;
            }
            if ($request->has('status')) {
                $case->status = $request->status;
            }

            // Update document data (layout overrides, new values)
            // We only want to overwrite document_data if all fields are actually being sent, 
            // but we can leave the original logic. To be safe, let's only do it if document_type is present.
            if ($request->has('document_type')) {
                $case->document_data = $request->all();
            }
            $case->save();

            // Sync and record version snapshot for attached Document
            $docType = $request->input('document_type') ?? $case->nature_of_case ?? 'complaint';
            $doc = $case->documents()->where('type', $docType)->latest()->first() 
                ?: $case->documents()->latest()->first();

            if ($doc) {
                $mergedContent = array_merge($doc->content ?: [], $request->all());
                $doc->content = $mergedContent;
                $doc->save();
                \App\Services\DocumentBackupService::recordVersion($doc, 'edited', 'Updated via Case Management');
            } else {
                $folderName = $case->folder_name ?: ('case-' . str_pad($case->id, 3, '0', STR_PAD_LEFT));
                $newDoc = \App\Models\Document::create([
                    'case_id' => $case->id,
                    'folder_name' => $folderName,
                    'type' => $docType,
                    'status' => 'Issued',
                    'content' => $request->all(),
                    'issued_at' => now(),
                    'created_by' => auth()->id(),
                ]);
                \App\Services\DocumentBackupService::recordVersion($newDoc, 'created', 'Created via Case Management Update');
            }

            AuditService::log('UPDATE', 'Cases', "Updated details for Case #{$case->case_number}", $case->case_number);

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'message' => 'Case updated successfully.']);
            }

            return redirect()->back()->with('success', 'Case updated successfully.');

        } catch (\Exception $e) {
            Log::error('Case Update Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error updating case: '.$e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $case = LuponCase::findOrFail($id);
            $case->delete(); // Soft delete

            AuditService::log('DELETE', 'Cases', "Archived Case #{$case->case_number}", $case->case_number);

            return redirect()->back()->with('success', 'Case archived successfully.');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error archiving case: '.$e->getMessage(),
            ], 500);
        }
    }

    public function restore($id)
    {
        try {
            $case = LuponCase::onlyTrashed()->findOrFail($id);
            $case->restore();
            $case->touch(); // Refresh updated_at timestamp so monthly rollover auto-archive respects manual restoration

            AuditService::log('UPDATE', 'Cases', "Restored Case #{$case->case_number}", $case->case_number);

            return redirect()->route('cases.index')->with('success', "Case #{$case->case_number} has been restored successfully.");
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restoring case: '.$e->getMessage(),
            ], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return redirect()->back();
        }

        try {
            LuponCase::whereIn('id', $ids)->delete();
            AuditService::log('DELETE', 'Cases', 'Bulk Archived '.count($ids).' Cases', 'Bulk');

            return redirect()->back()->with('success', count($ids).' cases archived successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error archiving cases.');
        }
    }
    public function lookup(Request $request)
    {
        $search = $request->input('search');

        if (empty($search)) {
            return response()->json([]);
        }

        $cases = LuponCase::withTrashed()
            ->where('case_number', 'like', "%{$search}%")
            ->orWhere('title', 'like', "%{$search}%")
            ->take(5)
            ->get(['id', 'case_number', 'title', 'status', 'nature_of_case']);

        return response()->json($cases);
    }
}
