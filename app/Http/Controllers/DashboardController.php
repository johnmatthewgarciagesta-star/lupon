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
            $allCases = LuponCase::withTrashed()->get();
            $totalCases = $allCases->count();
            $pendingCases = $allCases->whereNotIn('status', ['Resolved', 'Settled', 'Dismissed'])->count();
            $resolvedCases = $allCases->whereIn('status', ['Resolved', 'Settled', 'Dismissed'])->count();

            // Calculate new cases this month
            $currentYear = Carbon::now()->year;
            $currentMonth = Carbon::now()->month;

            $latestMonthCasesCollection = LuponCase::withTrashed()
                ->with('creator')
                ->orderBy('date_filed', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            $newCasesThisMonth = $latestMonthCasesCollection->filter(function ($c) use ($currentMonth, $currentYear) {
                $d = Carbon::parse($c->date_filed);
                return $d->month === $currentMonth && $d->year === $currentYear;
            })->count();

            $latestMonthCases = $latestMonthCasesCollection->map(function ($case) {
                return [
                    'id' => $case->id,
                    'case_number' => $case->case_number,
                    'complainant' => $case->complainant,
                    'respondent' => $case->respondent,
                    'type' => $case->nature_of_case,
                    'date_filed' => Carbon::parse($case->date_filed)->format('M d, Y'),
                    'raw_date_filed' => $case->date_filed,
                    'created_at' => $case->created_at ? $case->created_at->toISOString() : null,
                    'status' => $case->status,
                    'creator' => ['name' => $case->creator ? $case->creator->name : ($case->created_by ? 'Encoder #'.$case->created_by : 'System Admin')],
                ];
            })->values();

            // 2. Explicit Case Overview Metrics
            $totalAllTime = $totalCases;
            $totalCurrentYear = $allCases->filter(function ($c) use ($currentYear) {
                return Carbon::parse($c->date_filed)->year === $currentYear;
            })->count();
            $totalCurrentMonth = $newCasesThisMonth;

            // Category breakdown: Criminal, Civil, Others / Administrative
            $criminalCount = 0;
            $civilCount = 0;
            $othersCount = 0;

            foreach ($allCases as $c) {
                $nature = strtolower($c->nature_of_case ?? '');
                if (str_contains($nature, 'criminal') || str_contains($nature, 'injury') || str_contains($nature, 'slander') || str_contains($nature, 'threat') || str_contains($nature, 'assault') || str_contains($nature, 'theft') || str_contains($nature, 'summons')) {
                    $criminalCount++;
                } elseif (str_contains($nature, 'civil') || str_contains($nature, 'debt') || str_contains($nature, 'property') || str_contains($nature, 'settlement') || str_contains($nature, 'contract') || str_contains($nature, 'lease') || str_contains($nature, 'boundary')) {
                    $civilCount++;
                } else {
                    $othersCount++;
                }
            }

            $caseOverview = [
                'total_all_time' => $totalAllTime,
                'total_current_year' => $totalCurrentYear,
                'total_current_month' => $totalCurrentMonth,
                'by_category' => [
                    'criminal' => $criminalCount,
                    'civil' => $civilCount,
                    'others' => $othersCount,
                ],
            ];

            // 3. Dynamic Month Status Distribution
            $calcStatusBreakdown = function ($casesCollection) {
                $med = 0; $conc = 0; $arb = 0; $settled = 0; $dism = 0; $cert = 0;
                foreach ($casesCollection as $c) {
                    $st = strtolower($c->status ?? '');
                    if (str_contains($st, 'mediation')) {
                        $med++;
                    } elseif (str_contains($st, 'conciliation') || $st === 'pending') {
                        $conc++;
                    } elseif (str_contains($st, 'arbitration')) {
                        $arb++;
                    } elseif (str_contains($st, 'settled') || str_contains($st, 'resolved')) {
                        $settled++;
                    } elseif (str_contains($st, 'dismissed') || str_contains($st, 'repudiated')) {
                        $dism++;
                    } elseif (str_contains($st, 'certified') || str_contains($st, 'certificate')) {
                        $cert++;
                    } else {
                        $conc++;
                    }
                }
                return [
                    'mediation' => $med,
                    'conciliation' => $conc,
                    'arbitration' => $arb,
                    'settled' => $settled,
                    'dismissed' => $dism,
                    'certified' => $cert,
                ];
            };

            $statusDistributionByMonth = [
                'all' => $calcStatusBreakdown($allCases->filter(function ($c) use ($currentYear) {
                    return Carbon::parse($c->date_filed)->year === $currentYear;
                })),
            ];

            for ($m = 1; $m <= 12; $m++) {
                $monthCases = $allCases->filter(function ($c) use ($m, $currentYear) {
                    $d = Carbon::parse($c->date_filed);
                    return $d->year === $currentYear && $d->month === $m;
                });
                $statusDistributionByMonth[(string)$m] = $calcStatusBreakdown($monthCases);
            }

            // 4. Recent Cases (Table)
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

            // 5. Outcome Distribution
            $pendingCount = $allCases->where('status', 'Pending')->count();
            $resolvedCount = $allCases->whereIn('status', ['Resolved', 'Settled'])->count();
            $mediationCount = $allCases->where('status', 'Mediation')->count();
            $dismissedCount = $allCases->where('status', 'Dismissed')->count();
            $certifiedCount = $allCases->where('status', 'Certified')->count();

            $statusDistribution = [
                'pending' => $pendingCount,
                'resolved' => $resolvedCount,
                'mediation' => $mediationCount,
                'dismissed' => $dismissedCount,
                'certified' => $certifiedCount,
            ];

            $settled = $resolvedCount;
            $pendingActive = $pendingCount + $mediationCount;
            $escalated = $dismissedCount + $certifiedCount;
            
            $totalForOutcome = $pendingActive + $settled + $escalated;

            $outcomeStats = [
                ['name' => 'Pending', 'value' => $pendingActive, 'percentage' => $totalForOutcome > 0 ? round(($pendingActive / $totalForOutcome) * 100) : 0],
                ['name' => 'Settled', 'value' => $settled, 'percentage' => $totalForOutcome > 0 ? round(($settled / $totalForOutcome) * 100) : 0],
                ['name' => 'Escalated', 'value' => $escalated, 'percentage' => $totalForOutcome > 0 ? round(($escalated / $totalForOutcome) * 100) : 0],
            ];

            // 6. Case Type Distribution
            $typeStats = LuponCase::selectRaw('nature_of_case, count(*) as count')
                ->groupBy('nature_of_case')
                ->orderByDesc('count')
                ->limit(5)
                ->get();

            // 7. Monthly Case Trend
            $monthlyStats = collect([]);
            try {
                $monthlyStats = LuponCase::whereYear('date_filed', $currentYear)
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
                // Ignore if parsing fails
            }

            $allMonths = [];
            for ($i = 1; $i <= 12; $i++) {
                $monthName = Carbon::create()->month($i)->format('M');
                $found = $monthlyStats->firstWhere('name', $monthName);
                $allMonths[] = [
                    'name' => $monthName,
                    'total' => $found ? $found['total'] : 0,
                ];
            }

            // 8. Document Analytics & Overview
            $hiddenTemplates = \App\Models\FormLayout::where('is_hidden', true)
                ->pluck('document_type')
                ->toArray();
            $customCount = Document::where('type', 'custom_form')->count();
            $standardCount = 14;
            $totalDocTemplates = ($standardCount - count($hiddenTemplates)) + $customCount;

            $summonsDocCount = Document::whereNotNull('case_id')
                ->whereIn('type', ['summons', 'summons_respondent', 'summons_witness', 'notice_to_appear'])
                ->count();

            $settlementsDocCount = Document::whereNotNull('case_id')
                ->whereIn('type', ['amicable_settlement', 'arbitration_agreement', 'arbitration_award', 'katunayan_pagkakasundo'])
                ->count();

            $recentDocsCount = Document::whereNotNull('case_id')->count();

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
                        'created_at' => $doc->created_at ? $doc->created_at->format('M d, Y') : 'N/A',
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
                'latestMonthCases' => $latestMonthCases,
                'caseOverview' => $caseOverview,
                'statusDistributionByMonth' => $statusDistributionByMonth,
                'recentCases' => $recentCases,
                'statusDistribution' => $statusDistribution,
                'outcomeStats' => $outcomeStats,
                'typeStats' => $typeStats,
                'monthlyStats' => $allMonths,
                'documentStats' => [
                    'total' => $totalDocTemplates,
                    'summons' => $summonsDocCount,
                    'settlements' => $settlementsDocCount,
                    'recent_count' => $recentDocsCount,
                    'by_type' => $documentsByType,
                    'recent' => $recentDocuments,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard loading failed: ' . $e->getMessage());
            
            $emptyDist = ['mediation' => 0, 'conciliation' => 0, 'arbitration' => 0, 'settled' => 0, 'dismissed' => 0, 'certified' => 0];
            $monthDist = ['all' => $emptyDist];
            for ($m = 1; $m <= 12; $m++) {
                $monthDist[(string)$m] = $emptyDist;
            }

            return Inertia::render('dashboard', [
                'stats' => [
                    'total' => 0,
                    'pending' => 0,
                    'resolved' => 0,
                    'new_this_month' => 0,
                ],
                'latestMonthCases' => [],
                'caseOverview' => [
                    'total_all_time' => 0,
                    'total_current_year' => 0,
                    'total_current_month' => 0,
                    'by_category' => ['criminal' => 0, 'civil' => 0, 'others' => 0],
                ],
                'statusDistributionByMonth' => $monthDist,
                'recentCases' => [],
                'statusDistribution' => ['settled' => 0, 'pending' => 0, 'mediation' => 0, 'dismissed' => 0, 'certified' => 0],
                'statusPercentages' => ['settled' => 0, 'pending' => 0, 'unresolved' => 0],
                'outcomeStats' => [
                    ['name' => 'Pending', 'value' => 0, 'percentage' => 0],
                    ['name' => 'Settled', 'value' => 0, 'percentage' => 0],
                    ['name' => 'Escalated', 'value' => 0, 'percentage' => 0],
                ],
                'typeStats' => [],
                'monthlyStats' => [],
                'documentStats' => [
                    'total' => 0,
                    'summons' => 0,
                    'settlements' => 0,
                    'recent_count' => 0,
                    'by_type' => [],
                    'recent' => [],
                ],
            ]);
        }
    }
}
