<?php

namespace App\Http\Controllers;

use App\Models\LuponCase;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CaseController extends Controller
{
    public function index(Request $request)
    {
        // Auto-archive cases older than 31 days (soft-delete so they remain restorable)
        LuponCase::where('date_filed', '<=', now()->subDays(31))->whereNull('deleted_at')->delete();

        $query = LuponCase::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            
            // Try parsing string as date for formats like MM/DD/YYYY to match SQL "Y-m-d"
            $dateParsed = null;
            if (strtotime($search) !== false) {
                try {
                    $dateParsed = \Carbon\Carbon::parse($search)->format('Y-m-d');
                } catch (\Exception $e) {}
            }

            $query->where(function ($q) use ($search, $dateParsed) {
                $q->where('case_number', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('complainant', 'like', "%{$search}%")
                    ->orWhere('respondent', 'like', "%{$search}%")
                    ->orWhere('date_filed', 'like', "%{$search}%");

                if ($dateParsed) {
                    $q->orWhereDate('date_filed', $dateParsed);
                }
            });
        }

        // Filter by Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by Date
        if ($request->filled('date')) {
            $query->whereDate('date_filed', $request->date);
        }

        // Filter by Nature
        if ($request->filled('nature') && $request->nature !== 'all') {
            $query->where('nature_of_case', 'like', "%{$request->nature}%");
        }

        // Sort
        $sortField = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        // Ensure valid sort field
        $allowedFields = ['case_number', 'title', 'nature_of_case', 'complainant', 'respondent', 'status', 'date_filed', 'created_at'];
        if (!in_array($sortField, $allowedFields)) {
            $sortField = 'created_at';
        }
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $cases = $query->orderBy($sortField, $sortOrder)->paginate(10)->withQueryString();

        return \Inertia\Inertia::render('cases/index', [
            'cases' => $cases,
            'filters' => $request->only(['search', 'status', 'nature', 'date', 'sort_by', 'sort_order']),
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
