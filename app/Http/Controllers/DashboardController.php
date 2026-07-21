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
        try {
            // 1. Key Metrics
            $totalCases = LuponCase::withTrashed()->count();
            $pendingCases = LuponCase::withTrashed()->where('status', 'Pending')->count();
            $resolvedCases = LuponCase::withTrashed()->whereIn('status', ['Resolved', 'Settled'])->count();

            // Calculate new cases this month
            $newCasesThisMonth = LuponCase::withTrashed()->whereMonth('date_filed', Carbon::now()->month)
                ->whereYear('date_filed', Carbon::now()->year)
                ->count();

            // 2. Recent Cases (Table)
            $recentCases = LuponCase::orderBy('date_filed', 'desc')
                ->orderBy('created_at', 'desc')
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

            // 3. Status Distribution (Comprehensive list)
            $pendingCount = LuponCase::withTrashed()->where('status', 'Pending')->count();
            $resolvedCount = LuponCase::withTrashed()->whereIn('status', ['Resolved', 'Settled'])->count();
            $mediationCount = LuponCase::withTrashed()->where('status', 'Mediation')->count();
            $dismissedCount = LuponCase::withTrashed()->where('status', 'Dismissed')->count();
            $certifiedCount = LuponCase::withTrashed()->where('status', 'Certified')->count();

            $statusDistribution = [
                'pending' => $pendingCount,
                'resolved' => $resolvedCount,
                'mediation' => $mediationCount,
                'dismissed' => $dismissedCount,
                'certified' => $certifiedCount,
            ];

            // 3b. Outcome Distribution (Specifically for the requested 3-category Pie Chart)
            // Settled = Resolved/Settled
            // Pending = Pending + Mediation (Still active in the Lupon)
            // Unresolved = Dismissed + Certified (Did not reach an agreement)
            $settled = $resolvedCount;
            $pendingActive = $pendingCount + $mediationCount;
            $unresolved = $dismissedCount + $certifiedCount;
            
            $totalForOutcome = $settled + $pendingActive + $unresolved;

            $outcomeStats = [
                ['name' => 'Settled', 'value' => $settled, 'percentage' => $totalForOutcome > 0 ? round(($settled / $totalForOutcome) * 100) : 0],
                ['name' => 'Pending', 'value' => $pendingActive, 'percentage' => $totalForOutcome > 0 ? round(($pendingActive / $totalForOutcome) * 100) : 0],
                ['name' => 'Unresolved', 'value' => $unresolved, 'percentage' => $totalForOutcome > 0 ? round(($unresolved / $totalForOutcome) * 100) : 0],
            ];

            // 4. Case Type Distribution (Donut Chart)
            $typeStats = LuponCase::selectRaw('nature_of_case, count(*) as count')
                ->groupBy('nature_of_case')
                ->orderByDesc('count')
                ->limit(5)
                ->get();

            // 6. Monthly Case Trend (Bar Chart)
            $monthlyStats = collect([]);
            try {
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
            } catch (\Exception $e) {
                // Ignore if date_filed parsing fails on empty/bad data
            }

            // Ensure all months are represented
            $allMonths = [];
            for ($i = 1; $i <= 12; $i++) {
                $monthName = Carbon::create()->month($i)->format('M');
                $found = $monthlyStats->firstWhere('name', $monthName);
                $allMonths[] = [
                    'name' => $monthName,
                    'total' => $found ? $found['total'] : 0,
                ];
            }

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
                        'type' => $doc->type, 
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
                'outcomeStats' => $outcomeStats,
                'typeStats' => $typeStats,
                'monthlyStats' => $allMonths,
                'documentStats' => [
                    'total' => $totalDocuments,
                    'by_type' => $documentsByType,
                    'recent' => $recentDocuments,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard loading failed: ' . $e->getMessage());
            
            // Return empty data structure if DB fails (e.g., table doesn't exist yet before migrations)
            return Inertia::render('dashboard', [
                'stats' => [
                    'total' => 0,
                    'pending' => 0,
                    'resolved' => 0,
                    'new_this_month' => 0,
                ],
                'recentCases' => [],
                'statusDistribution' => ['settled' => 0, 'pending' => 0, 'dismissed' => 0, 'other' => 0],
                'statusPercentages' => ['settled' => 0, 'pending' => 0, 'unresolved' => 0],
                'typeStats' => [],
                'monthlyStats' => [],
                'documentStats' => [
                    'total' => 0,
                    'by_type' => [],
                    'recent' => [],
                ],
            ]);
        }
    }
}
