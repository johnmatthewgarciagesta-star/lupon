<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\LuponCase;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

use Spatie\Browsershot\Browsershot;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('reports/index', [
            'stats' => $this->getStats()
        ]);
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

            $filename = "System_Report_{$type}_" . date('Ymd_His') . ".pdf";

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
