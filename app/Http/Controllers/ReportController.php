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
        return Inertia::render('reports/index', [
            'stats' => $this->getStats(),
        ]);
    }

    public function generate(Request $request)
    {
        set_time_limit(300); // 5 minutes execution time for PDF generation
        $type = $request->input('type', 'summary');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        // Security Audit Log
        \App\Services\AuditService::log('EXPORT', 'System Reports', "Generated System Report ({$type})", null);
        
        $stats = $this->getStats($startDate, $endDate);

        $html = view('reports.pdf', compact('stats', 'type', 'startDate', 'endDate'))->render();

        try {
            $browsershot = Browsershot::html($html);
            if (env('CHROME_PATH')) {
                $browsershot->setChromePath(env('CHROME_PATH'));
            }

            $pdf = $browsershot
                ->format('A4')
                ->margins(10, 10, 10, 10)
                ->showBackground()
                ->waitUntilNetworkIdle()
                ->timeout(120)
                ->noSandbox()
                ->ignoreHttpsErrors()
                ->setOption('args', ['--disable-web-security'])
                ->pdf();

            $filename = "System_Report_{$type}_".date('Ymd_His').'.pdf';

            return response($pdf)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");

        } catch (\Exception $e) {
            return response()->json(['error' => 'PDF Generation Failed: '.$e->getMessage()], 500);
        }
    }

    public function checkCount(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = LuponCase::withTrashed();
        if (!empty($startDate)) {
            $query->whereDate('date_filed', '>=', $startDate);
        }
        if (!empty($endDate)) {
            $query->whereDate('date_filed', '<=', $endDate);
        }

        return response()->json([
            'count' => $query->count()
        ]);
    }

    private function getStats($startDate = null, $endDate = null)
    {
        $query = LuponCase::withTrashed();

        if (!empty($startDate)) {
            $query->whereDate('date_filed', '>=', $startDate);
        }
        if (!empty($endDate)) {
            $query->whereDate('date_filed', '<=', $endDate);
        }

        $cases = $query->get();

        $nowMonth = Carbon::now()->month;
        $nowYear = Carbon::now()->year;

        // Recent cases: Cases filed this month (or sorted recent if custom date filter applied)
        $thisMonthCases = $cases->filter(function ($c) use ($nowMonth, $nowYear) {
            if (!$c->date_filed) return false;
            $d = Carbon::parse($c->date_filed);
            return $d->month === $nowMonth && $d->year === $nowYear;
        });

        // If filtering by specific date range or if no cases this month, fallback to filtered cases set
        $recentCasesCollection = (!empty($startDate) || !empty($endDate) || $thisMonthCases->isEmpty()) 
            ? $cases->sortByDesc('created_at')->take(50)
            : $thisMonthCases->sortByDesc('created_at');

        return [
            'total_cases' => $cases->count(),
            'cases_this_month' => $cases->filter(function ($c) use ($nowMonth, $nowYear) {
                if (!$c->date_filed) return false;
                $d = Carbon::parse($c->date_filed);
                return $d->month === $nowMonth && $d->year === $nowYear;
            })->count(),
            'pending_cases' => $cases->whereNotIn('status', ['Resolved', 'Settled', 'Dismissed'])->whereNull('deleted_at')->count(),
            'resolved_cases' => $cases->whereIn('status', ['Resolved', 'Settled', 'Dismissed'])->count(),

            // Group by Nature
            'cases_by_nature' => $cases->groupBy('nature_of_case')->map(function ($group, $key) {
                return (object)[
                    'nature_of_case' => $key ?: 'Unspecified',
                    'count' => $group->count()
                ];
            })->values(),

            // Recent Cases (Cases filed this month or matching period)
            'recent_cases' => $recentCasesCollection->map(function ($case) {
                    $statusStr = $case->status;
                    if ($case->trashed()) {
                        $statusStr = $statusStr ? "{$statusStr} (Archived)" : 'Archived';
                    }
                    return [
                        'id' => $case->id,
                        'case_number' => $case->case_number,
                        'title' => $case->title,
                        'nature' => $case->nature_of_case,
                        'status' => $statusStr,
                        'is_archived' => $case->trashed(),
                        'date_filed' => $case->date_filed ? Carbon::parse($case->date_filed)->format('M d, Y') : 'N/A',
                    ];
                })->values(),
        ];
    }
}
