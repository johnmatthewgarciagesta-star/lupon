<?php

namespace App\Http\Controllers;

use App\Models\LuponCase;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Browsershot\Browsershot;

class ReportController extends Controller
{
    public function index()
    {
        try {
            return Inertia::render('reports/index', [
                'stats' => $this->getStats(),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Reports loading error: ' . $e->getMessage());
            return Inertia::render('reports/index', [
                'error' => 'A database error occurred while loading reports. Details: ' . $e->getMessage(),
                'stats' => [
                    'total_cases' => 0,
                    'cases_this_month' => 0,
                    'pending_cases' => 0,
                    'resolved_cases' => 0,
                    'cases_by_nature' => [],
                    'recent_cases' => [],
                ],
            ]);
        }
    }

    public function generate(Request $request)
    {
        set_time_limit(300); // 5 minutes execution time for PDF generation
        $type = $request->input('type', 'summary');
        $stats = $this->getStats();

        $html = view('reports.pdf', compact('stats', 'type'))->render();

        try {
            $pdf = Browsershot::html($html)
                ->format('A4')
                ->margins(10, 10, 10, 10)
                ->showBackground()
                ->waitUntilNetworkIdle()
                ->timeout(120)
                ->noSandbox()
                ->ignoreHttpsErrors()
                ->setOption('args', ['--disable-web-security'])
                ->pdf();

            $filename = "System_Report_{$type}_" . date('Ymd_His') . '.pdf';

            return response($pdf)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");

        } catch (\Exception $e) {
            return response()->json(['error' => 'PDF Generation Failed: ' . $e->getMessage()], 500);
        }
    }

    private function getStats()
    {
        return [
            'total_cases' => LuponCase::count(),
            'cases_this_month' => LuponCase::whereMonth('date_filed', Carbon::now()->month)
                ->whereYear('date_filed', Carbon::now()->year)
                ->count(),
            'pending_cases' => LuponCase::where('status', 'Pending')->count(),
            'resolved_cases' => LuponCase::whereIn('status', ['Resolved', 'Settled', 'Dismissed'])->count(),

            // Group by Nature
            'cases_by_nature' => LuponCase::select('nature_of_case', DB::raw('count(*) as count'))
                ->groupBy('nature_of_case')
                ->get(),

            // Recent Cases for the table
            'recent_cases' => LuponCase::latest()
                ->take(20) // Increased for report
                ->get()
                ->map(function ($case) {
                    return [
                        'id' => $case->id,
                        'case_number' => $case->case_number,
                        'title' => $case->title,
                        'nature' => $case->nature_of_case,
                        'status' => $case->status,
                        'date_filed' => Carbon::parse($case->date_filed)->format('M d, Y'),
                    ];
                }),
        ];
    }
}
