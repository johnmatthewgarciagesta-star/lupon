<?php

use App\Models\LuponCase;
use App\Models\User;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'Data Encoder']);
});

test('case status can be updated to Withdrawn, filtered in cases index, and counted in dashboard status distribution', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    $case = LuponCase::create([
        'case_number' => '26-501',
        'folder_name' => 'case-001',
        'title' => 'Ana Cruz vs Ben Reyes',
        'nature_of_case' => 'Complaint',
        'complainant' => 'Ana Cruz',
        'respondent' => 'Ben Reyes',
        'status' => 'Pending',
        'date_filed' => now()->toDateString(),
        'created_by' => $encoder->id,
    ]);

    $response = $this->actingAs($encoder)->put(route('cases.update', $case->id), [
        'status' => 'Withdrawn',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $case->refresh();
    expect($case->status)->toBe('Withdrawn');

    // Filterable on Case Management page
    $casesProps = $this->actingAs($encoder)
        ->get(route('cases.index', ['status' => 'Withdrawn']))
        ->assertOk()
        ->viewData('page')['props'];

    $filtered = collect($casesProps['cases']['data'])->firstWhere('case_number', '26-501');
    expect($filtered)->not->toBeNull()
        ->and($filtered['status'])->toBe('Withdrawn');

    // Excluded from Dashboard pending count and counted under withdrawn in Status Distribution
    $dashboardProps = $this->actingAs($encoder)
        ->get(route('dashboard'))
        ->assertOk()
        ->viewData('page')['props'];

    expect($dashboardProps['stats']['pending'])->toBe(0)
        ->and($dashboardProps['stats']['resolved'])->toBe(1)
        ->and($dashboardProps['statusDistribution'])->toBe([
            'dismissed' => 0,
            'certified' => 0,
            'withdrawn' => 1,
            'settled' => 0,
        ]);
});

test('status distribution counts Dismissed, Certified to File Action, Withdrawn, and Settled and excludes archived cases', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    $monthDate = now()->startOfMonth()->toDateString();
    $currentMonthKey = (string) now()->month;

    $cases = [
        ['case_number' => '26-601', 'status' => 'Dismissed'],
        ['case_number' => '26-602', 'status' => 'Certified to File Action'],
        ['case_number' => '26-603', 'status' => 'Withdrawn'],
        ['case_number' => '26-604', 'status' => 'Settled'],
    ];

    $created = [];
    foreach ($cases as $idx => $c) {
        $created[$c['status']] = LuponCase::create([
            'case_number' => $c['case_number'],
            'folder_name' => 'case-60' . ($idx + 1),
            'title' => 'Complainant vs Respondent',
            'nature_of_case' => 'Complaint',
            'complainant' => 'Complainant',
            'respondent' => 'Respondent',
            'status' => $c['status'],
            'date_filed' => $monthDate,
            'created_by' => $encoder->id,
        ]);
    }

    // Active cases show all 4 statuses in Status Distribution
    $dashboardProps = $this->actingAs($encoder)
        ->get(route('dashboard'))
        ->assertOk()
        ->viewData('page')['props'];

    expect($dashboardProps['statusDistribution'])->toBe([
        'dismissed' => 1,
        'certified' => 1,
        'withdrawn' => 1,
        'settled' => 1,
    ])
        ->and($dashboardProps['statusDistributionByMonth'][$currentMonthKey])->toBe([
            'dismissed' => 1,
            'certified' => 1,
            'withdrawn' => 1,
            'settled' => 1,
        ]);

    // Archiving a case removes it immediately from Status Distribution
    $this->actingAs($encoder)
        ->post(route('cases.archive-single', $created['Settled']->id))
        ->assertRedirect();

    $afterManualArchive = $this->actingAs($encoder)
        ->get(route('dashboard'))
        ->assertOk()
        ->viewData('page')['props'];

    expect($afterManualArchive['statusDistribution'])->toBe([
        'dismissed' => 1,
        'certified' => 1,
        'withdrawn' => 1,
        'settled' => 0,
    ])
        ->and($afterManualArchive['statusDistributionByMonth'][$currentMonthKey]['settled'])->toBe(0);
});

test('cases updated before current month auto-archive and disappear from status distribution', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    $lastMonth = Carbon::now()->startOfMonth()->subDays(5);

    $staleCase = LuponCase::create([
        'case_number' => '26-701',
        'folder_name' => 'case-701',
        'title' => 'Old Updated Case',
        'nature_of_case' => 'Complaint',
        'complainant' => 'Alpha',
        'respondent' => 'Beta',
        'status' => 'Dismissed',
        'date_filed' => $lastMonth->toDateString(),
        'created_by' => $encoder->id,
    ]);
    $staleCase->timestamps = false;
    $staleCase->updated_at = $lastMonth;
    $staleCase->save();

    $activeBackdatedCase = LuponCase::create([
        'case_number' => '26-702',
        'folder_name' => 'case-702',
        'title' => 'Recently Updated Prior-Date Case',
        'nature_of_case' => 'Complaint',
        'complainant' => 'Gamma',
        'respondent' => 'Delta',
        'status' => 'Certified to File Action',
        'date_filed' => $lastMonth->toDateString(),
        'created_by' => $encoder->id,
    ]);

    $dashboardProps = $this->actingAs($encoder)
        ->get(route('dashboard'))
        ->assertOk()
        ->viewData('page')['props'];

    $staleCase->refresh();
    $activeBackdatedCase->refresh();

    expect($staleCase->trashed())->toBeTrue()
        ->and($activeBackdatedCase->trashed())->toBeFalse()
        ->and($dashboardProps['statusDistribution'])->toBe([
            'dismissed' => 0,
            'certified' => 1,
            'withdrawn' => 0,
            'settled' => 0,
        ]);
});


