<?php

namespace App\Http\Controllers;

use App\Models\LuponCase;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index()
    {
        try {
            // 1. Case Growth Rate (Comparing this month vs last month)
            $thisMonth = LuponCase::whereMonth('date_filed', Carbon::now()->month)
                ->whereYear('date_filed', Carbon::now()->year)
                ->count();
            $lastMonth = LuponCase::whereMonth('date_filed', Carbon::now()->subMonth()->month)
                ->whereYear('date_filed', Carbon::now()->subMonth()->year)
                ->count();
            
            $growthRate = $lastMonth > 0 ? (($thisMonth - $lastMonth) / $lastMonth) * 100 : 0;

            // 2. Average Resolution Time (In days)
            // We consider 'Resolved' or 'Settled' statuses
            $resolvedCases = LuponCase::whereIn('status', ['Resolved', 'Settled'])
                ->whereNotNull('date_filed')
                ->get();
            
            $avgDays = 0;
            if ($resolvedCases->count() > 0) {
                $totalDays = $resolvedCases->sum(function($case) {
                    $filed = Carbon::parse($case->date_filed);
                    $resolved = Carbon::parse($case->updated_at);
                    return $filed->diffInDays($resolved);
                });
                $avgDays = round($totalDays / $resolvedCases->count());
            }

            // 3. Settlement Rate
            $totalCases = LuponCase::count();
            $settledCases = LuponCase::whereIn('status', ['Resolved', 'Settled'])->count();
            $settlementRate = $totalCases > 0 ? round(($settledCases / $totalCases) * 100, 1) : 0;

            // 4. Activity Trends (Monthly)
            $currentYear = Carbon::now()->year;
            $monthlyTrends = LuponCase::whereYear('date_filed', $currentYear)
                ->selectRaw('MONTH(date_filed) as month, count(*) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function($item) {
                    return [
                        'name' => Carbon::create()->month($item->month)->format('M'),
                        'total' => $item->total,
                    ];
                });

            // 5. Case Type Distribution
            $typeDistribution = LuponCase::selectRaw('nature_of_case as name, count(*) as value')
                ->groupBy('nature_of_case')
                ->orderByDesc('value')
                ->limit(5)
                ->get();

            // 6. Outcome Distribution
            $outcomeDistribution = LuponCase::selectRaw('status as name, count(*) as value')
                ->groupBy('status')
                ->get();

            return Inertia::render('analytics/index', [
                'stats' => [
                    'growth_rate' => round($growthRate, 1),
                    'avg_resolution_time' => $avgDays,
                    'settlement_rate' => $settlementRate,
                    'active_cases' => LuponCase::where('status', 'Pending')->count(),
                ],
                'monthlyTrends' => $monthlyTrends,
                'typeDistribution' => $typeDistribution,
                'outcomeDistribution' => $outcomeDistribution,
                'totalCases' => $totalCases,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Analytics loading failed: ' . $e->getMessage());

            return Inertia::render('analytics/index', [
                'stats' => [
                    'growth_rate' => 0,
                    'avg_resolution_time' => 0,
                    'settlement_rate' => 0,
                    'active_cases' => 0,
                ],
                'monthlyTrends' => [],
                'typeDistribution' => [],
                'outcomeDistribution' => [],
                'totalCases' => 0,
            ])->with('error', 'An error has occurred while retrieving analytics data. Please reload your page.');
        }
    }
}
