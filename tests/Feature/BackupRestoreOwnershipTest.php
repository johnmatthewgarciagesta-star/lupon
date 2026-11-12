<?php

use App\Models\Document;
use App\Models\LuponCase;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'Data Encoder']);
});

test('data encoder restore automatically reassigns restored cases and documents to current user', function () {
    $otherUser = User::factory()->create(['status' => 'Active']);
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    $backupPayload = [
        'metadata' => [
            'system' => 'Lupon Tagapamayapa System',
            'backup_type' => 'full_database_backup',
        ],
        'tables' => [
            'cases' => [
                [
                    'id' => 1,
                    'case_number' => '24-364',
                    'folder_name' => 'case-001',
                    'title' => 'Edna S. Matibag vs Jiffina Kalimpo',
                    'nature_of_case' => 'Complaint',
                    'complainant' => 'Edna S. Matibag',
                    'respondent' => 'Jiffina Kalimpo',
                    'status' => 'Pending',
                    'date_filed' => '2026-11-12',
                    'admin_notes' => 'Created via Scanned AI Ingestion',
                    'created_by' => $otherUser->id,
                ],
            ],
            'documents' => [
                [
                    'id' => 1,
                    'case_id' => 1,
                    'folder_name' => 'case-001',
                    'type' => 'complaint',
                    'file_path' => '/storage/scans/sample.jpg',
                    'status' => 'Issued',
                    'created_by' => $otherUser->id,
                ],
            ],
        ],
    ];

    $file = UploadedFile::fake()->createWithContent(
        'lupon_backup.json',
        json_encode($backupPayload)
    );

    $response = $this->actingAs($encoder)->post(route('settings.backup.restore'), [
        'backup_file' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $case = LuponCase::find(1);
    $doc = Document::find(1);

    expect($case)->not->toBeNull()
        ->and($case->created_by)->toBe($encoder->id)
        ->and($doc)->not->toBeNull()
        ->and($doc->created_by)->toBe($encoder->id);

    $casesResponse = $this->actingAs($encoder)->get(route('cases.index'));
    $casesResponse->assertStatus(200);
    $casesResponse->assertSee('24-364');
});

test('administrator restore preserves valid owner ids and falls back safely for missing user ids', function () {
    $admin = User::factory()->create(['status' => 'Active']);
    $admin->assignRole('Administrator');

    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    $backupPayload = [
        'metadata' => [
            'system' => 'Lupon Tagapamayapa System',
            'backup_type' => 'full_database_backup',
        ],
        'tables' => [
            'cases' => [
                [
                    'id' => 10,
                    'case_number' => '24-500',
                    'title' => 'Valid Owner Case',
                    'complainant' => 'Alpha',
                    'respondent' => 'Beta',
                    'nature_of_case' => 'Complaint',
                    'status' => 'Pending',
                    'date_filed' => '2026-11-12',
                    'created_by' => $encoder->id,
                ],
                [
                    'id' => 11,
                    'case_number' => '24-501',
                    'title' => 'Missing Owner Case',
                    'complainant' => 'Gamma',
                    'respondent' => 'Delta',
                    'nature_of_case' => 'Complaint',
                    'status' => 'Pending',
                    'date_filed' => '2026-11-12',
                    'created_by' => 999999,
                ],
            ],
            'documents' => [],
        ],
    ];

    $file = UploadedFile::fake()->createWithContent(
        'lupon_admin_backup.json',
        json_encode($backupPayload)
    );

    $response = $this->actingAs($admin)->post(route('settings.backup.restore'), [
        'backup_file' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(LuponCase::where('case_number', '24-500')->first()?->created_by)->toBe($encoder->id)
        ->and(LuponCase::where('case_number', '24-501')->first()?->created_by)->toBe($admin->id);
});
