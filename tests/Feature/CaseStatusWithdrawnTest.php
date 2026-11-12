<?php

use App\Models\LuponCase;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'Data Encoder']);
});

test('case status can be updated to Withdrawn, filtered in cases index, and excluded from pending metrics', function () {
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
        'date_filed' => '2026-10-15',
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

    // Excluded from Dashboard pending count and counted as concluded/dismissed
    $dashboardProps = $this->actingAs($encoder)
        ->get(route('dashboard'))
        ->assertOk()
        ->viewData('page')['props'];

    expect($dashboardProps['stats']['pending'])->toBe(0)
        ->and($dashboardProps['stats']['resolved'])->toBe(1)
        ->and($dashboardProps['statusDistribution']['dismissed'])->toBe(1);
});

