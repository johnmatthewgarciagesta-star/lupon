<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\LuponCase;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Key Metrics
        $totalCases = LuponCase::count();
        $pendingCases = LuponCase::where('status', 'Pending')->count();
        $resolvedCases = LuponCase::whereIn('status', ['Resolved', 'Settled'])->count();

        // Calculate new cases this month
        $newCasesThisMonth = LuponCase::whereMonth('date_filed', Carbon::now()->month)
            ->whereYear('date_filed', Carbon::now()->year)
            ->count();

        // 2. Recent Cases (Table)
        $recentCases = LuponCase::orderBy('date_filed', 'desc')
            ->take(5)
            ->get()
            ->map(function ($case) {
                return [
                    'id' => $case->id,
                    'case_number' => $case->case_number,
                    'type' => $case->nature_of_case,
                    'complainant' => $case->complainant,
                    'date_filed' => Carbon::parse($case->date_filed)->format('M d, Y'),
                    'status' => $case->status,
                ];
            });

        // 3. Status Distribution (Pie Chart)
        $statusDistribution = [
            'settled' => LuponCase::whereIn('status', ['Resolved', 'Settled'])->count(),
            'pending' => $pendingCases, // Already calculated
            'dismissed' => LuponCase::where('status', 'Dismissed')->count(),
            'other' => LuponCase::whereNotIn('status', ['Resolved', 'Settled', 'Pending', 'Dismissed'])->count(),
        ];

        // Calculate percentages for the pie chart display
        $totalForPie = array_sum($statusDistribution);
        $statusPercentages = [
            'settled' => $totalForPie > 0 ? round(($statusDistribution['settled'] / $totalForPie) * 100) : 0,
            'pending' => $totalForPie > 0 ? round(($statusDistribution['pending'] / $totalForPie) * 100) : 0,
            'unresolved' => $totalForPie > 0 ? round((($statusDistribution['dismissed'] + $statusDistribution['other']) / $totalForPie) * 100) : 0,
        ];

        // 4. Case Type Distribution (Donut Chart)
        // Group by nature_of_case and count
        // 4. Case Type Distribution (Donut Chart)
        $typeStats = LuponCase::selectRaw('nature_of_case, count(*) as count')
            ->groupBy('nature_of_case')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // 6. Monthly Case Trend (Bar Chart)
        $monthlyStats = LuponCase::whereYear('date_filed', Carbon::now()->year)
            ->get()
            ->groupBy(function ($d) {
                return Carbon::parse($d->date_filed)->month;
            })
            ->map(function ($items, $month) {
                return [
                    'name' => Carbon::create()->month($month)->format('M'),
                    'total' => $items->count(),
                ];
            })
            ->values();

        // Ensure all months are represented (optional, but good for charts)
        $allMonths = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthName = Carbon::create()->month($i)->format('M');
            $found = $monthlyStats->firstWhere('name', $monthName);
            $allMonths[] = [
                'name' => $monthName,
                'total' => $found ? $found['total'] : 0,
            ];
        }

        // Map to standardized categories if needed, or pass raw
        // For now, passing raw top 5

        // 5. Document Analytics
        $totalDocuments = Document::count();
        $documentsByType = Document::selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        $recentDocuments = Document::with('case')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'type' => $doc->type, // e.g., 'complaint', 'summons'
                    'case_number' => $doc->case ? $doc->case->case_number : 'N/A',
                    'created_at' => $doc->created_at->format('M d, Y'),
                    'status' => $doc->status,
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $totalCases,
                'pending' => $pendingCases,
                'resolved' => $resolvedCases,
                'new_this_month' => $newCasesThisMonth,
            ],
            'recentCases' => $recentCases,
            'statusDistribution' => $statusDistribution,
            'statusPercentages' => $statusPercentages,
            'typeStats' => $typeStats,
            'monthlyStats' => $allMonths,
            'documentStats' => [
                'total' => $totalDocuments,
                'by_type' => $documentsByType,
                'recent' => $recentDocuments,
            ],
        ]);
    }
}
