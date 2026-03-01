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
        // Auto-archive cases older than 31 days
        LuponCase::where('date_filed', '<=', now()->subDays(31))->delete();

        $query = LuponCase::query();

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
            // Mapping frontend values to backend nature_of_case if needed
            // For now assuming exact match or 'like' if dropdowns are loose
            $nature = $request->nature;
            if ($nature === 'property') {
                $query->where('nature_of_case', 'like', '%Property%');
            } elseif ($nature === 'noise') {
                $query->where('nature_of_case', 'like', '%Noise%');
            } elseif ($nature === 'money') {
                $query->where('nature_of_case', 'like', '%Debt%');
            } else {
                $query->where('nature_of_case', $nature);
            }
        }

        $cases = $query->orderBy('date_filed', 'desc')->paginate(10)->withQueryString();

        return \Inertia\Inertia::render('cases/index', [
            'cases' => $cases,
            'filters' => $request->only(['search', 'status', 'nature', 'date']),
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

            // Update document data (layout overrides, new values)
            $case->document_data = $request->all(); // Overwrite with new full state
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
}
