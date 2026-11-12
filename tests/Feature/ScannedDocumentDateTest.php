<?php

use App\Models\Document;
use App\Models\LuponCase;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'Data Encoder']);
});

test('upload scan normalizes AI-extracted date_filed to Y-m-d', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    Storage::fake('public');

    $previousKey = getenv('GEMINI_API_KEY');
    putenv('GEMINI_API_KEY=test-gemini-key');
    $_ENV['GEMINI_API_KEY'] = 'test-gemini-key';
    $_SERVER['GEMINI_API_KEY'] = 'test-gemini-key';

    $cacheKey = 'gemini_quota_exceeded_' . now('Asia/Manila')->format('o_W');
    Cache::forget($cacheKey);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            [
                                'text' => json_encode([
                                    'document_type' => 'complaint',
                                    'complainant' => 'Juan Dela Cruz',
                                    'respondent' => 'Pedro Santos',
                                    'case_no' => '26-099',
                                    'date_filed' => 'October 15, 2026',
                                    'nature_of_case' => 'Disturbance',
                                    'summary' => 'Reklamo laban sa ingay sa gabi.',
                                ]),
                            ],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    try {
        $file = UploadedFile::fake()->image('scan.jpg', 400, 400);

        $response = $this->actingAs($encoder)->postJson(route('documents.upload'), [
            'file' => $file,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.date_filed', '2026-10-15')
            ->assertJsonPath('data.case_no', '26-099');
    } finally {
        if ($previousKey === false) {
            putenv('GEMINI_API_KEY');
            unset($_ENV['GEMINI_API_KEY'], $_SERVER['GEMINI_API_KEY']);
        } else {
            putenv("GEMINI_API_KEY={$previousKey}");
            $_ENV['GEMINI_API_KEY'] = $previousKey;
            $_SERVER['GEMINI_API_KEY'] = $previousKey;
        }
    }
});

test('storeScanned persists explicit date_filed and displays it across dashboard, cases, and documents', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    Storage::fake('public');
    Storage::disk('public')->put('scans/temp/sample-oct15.jpg', 'fake-image-content');

    $response = $this->actingAs($encoder)->post(route('documents.store-scanned'), [
        'temp_file' => 'scans/temp/sample-oct15.jpg',
        'type' => 'complaint',
        'complainant' => 'Juan Dela Cruz',
        'respondent' => 'Pedro Santos',
        'case_no' => '26-099',
        'date_filed' => '2026-10-15',
        'nature_of_case' => 'Disturbance',
        'summary' => 'Reklamo ukol sa kaguluhan.',
        'assigned_folder' => 'case-001',
    ]);

    $response->assertRedirect(route('cases.index'));
    $response->assertSessionHas('success');

    $case = LuponCase::where('case_number', '26-099')->first();
    expect($case)->not->toBeNull()
        ->and($case->date_filed)->toBe('2026-10-15');

    $document = Document::where('case_id', $case->id)->first();
    expect($document)->not->toBeNull()
        ->and($document->issued_at)->not->toBeNull()
        ->and($document->issued_at->timezone('Asia/Manila')->toDateString())->toBe('2026-10-15')
        ->and($document->content['made_this_month'])->toBe('October')
        ->and($document->content['made_this_day'])->toBe('15th')
        ->and($document->content['year'])->toBe('26')
        ->and($document->content['date_filed'])->toBe('2026-10-15');

    // Dashboard Recent Cases & Recent Documents
    $dashboardProps = $this->actingAs($encoder)->get(route('dashboard'))
        ->assertOk()
        ->viewData('page')['props'];

    $recentCase = collect($dashboardProps['recentCases'])->firstWhere('case_number', '26-099');
    $recentDoc = collect($dashboardProps['documentStats']['recent'])->firstWhere('case_number', '26-099');

    expect($recentCase['date_filed'])->toBe('Oct 15, 2026')
        ->and($recentDoc['created_at'])->toBe('Oct 15, 2026');

    // Case Management page
    $casesProps = $this->actingAs($encoder)->get(route('cases.index'))
        ->assertOk()
        ->viewData('page')['props'];

    $caseRow = collect($casesProps['cases']['data'])->firstWhere('case_number', '26-099');
    expect($caseRow['date_filed'])->toBe('2026-10-15')
        ->and($caseRow['documents'][0]['created_at'])->toStartWith('Oct 15, 2026');

    // Documents Templates (Recent Documents) & Folders
    $templatesProps = $this->actingAs($encoder)->get(route('documents.templates'))
        ->assertOk()
        ->viewData('page')['props'];

    $templateDoc = collect($templatesProps['documents'])->firstWhere('id', $document->id);
    expect($templateDoc['date'])->toStartWith('2026-10-15');

    $foldersProps = $this->actingAs($encoder)->get(route('documents.folders'))
        ->assertOk()
        ->viewData('page')['props'];

    $folderCase = collect($foldersProps['caseFolders'])->firstWhere('case_number', '26-099');
    expect($folderCase['documents'][0]['created_at'])->toStartWith('Oct 15, 2026');
});

test('storeScanned falls back to current Asia/Manila date when date_filed is omitted', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    Storage::fake('public');
    Storage::disk('public')->put('scans/temp/sample-fallback.jpg', 'fake-image-content');

    $expectedToday = Carbon::now('Asia/Manila')->toDateString();

    $response = $this->actingAs($encoder)->post(route('documents.store-scanned'), [
        'temp_file' => 'scans/temp/sample-fallback.jpg',
        'type' => 'complaint',
        'complainant' => 'Maria Clara',
        'respondent' => 'Padre Damaso',
        'case_no' => '26-100',
        'nature_of_case' => 'Dispute',
        'summary' => 'Fallback date test.',
        'assigned_folder' => 'case-002',
    ]);

    $response->assertRedirect(route('cases.index'));
    $response->assertSessionHas('success');

    $case = LuponCase::where('case_number', '26-100')->first();
    expect($case)->not->toBeNull()
        ->and($case->date_filed)->toBe($expectedToday);

    $document = Document::where('case_id', $case->id)->first();
    expect($document)->not->toBeNull()
        ->and($document->issued_at->timezone('Asia/Manila')->toDateString())->toBe($expectedToday);
});

