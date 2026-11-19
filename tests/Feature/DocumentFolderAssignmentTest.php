<?php

use App\Models\Document;
use App\Models\LuponCase;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'Data Encoder']);
});

test('form fill page renders successfully with case folders and next folder number', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    $case = LuponCase::create([
        'case_number' => 'KP-2026-001',
        'folder_name' => 'case-001',
        'title' => 'Juan Dela Cruz vs Pedro Santos',
        'nature_of_case' => 'Barangay Dispute',
        'complainant' => 'Juan Dela Cruz',
        'respondent' => 'Pedro Santos',
        'status' => 'Pending',
        'date_filed' => now()->toDateString(),
        'created_by' => $encoder->id,
    ]);

    $response = $this->actingAs($encoder)->get(route('documents.create', ['type' => 'summons']));

    $response->assertOk();
    $response->assertViewHas('caseFolders');
    $response->assertViewHas('nextFolderNumber');
    $response->assertSee('case-001');
    $response->assertSee('Create Case Folder');
    $response->assertSee('+ New Folder');
});

test('inline createFolder creates exactly one case folder and returns json', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    $response = $this->actingAs($encoder)->postJson(route('documents.create-folder'), [
        'folder_name' => 'case-001',
        'case_number' => 'KP-2026-101',
        'complainant' => 'Maria Santos',
        'respondent' => 'Jose Rizal',
        'nature_of_case' => 'Collection',
    ]);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
    ]);

    expect(LuponCase::count())->toBe(1);
    $case = LuponCase::first();
    expect($case->folder_name)->toBe('case-001')
        ->and($case->case_number)->toBe('KP-2026-101')
        ->and($case->complainant)->toBe('Maria Santos')
        ->and($case->respondent)->toBe('Jose Rizal');
});

test('saving form to assigned folder links to existing case without creating duplicate case or duplicate folder', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    // 1. Create the folder case (e.g. from inline modal or folders page)
    $case = LuponCase::create([
        'case_number' => 'KP-2026-102',
        'folder_name' => 'case-001',
        'title' => 'Maria Santos vs Jose Rizal',
        'nature_of_case' => 'Dispute',
        'complainant' => 'Maria Santos',
        'respondent' => 'Jose Rizal',
        'status' => 'Pending',
        'date_filed' => now()->toDateString(),
        'created_by' => $encoder->id,
    ]);

    expect(LuponCase::count())->toBe(1);

    // 2. Save the filled form (save_only) referencing folder_name and case_id
    $response = $this->actingAs($encoder)->postJson(route('documents.generate'), [
        'type' => 'summons',
        'action' => 'save_only',
        'folder_name' => 'case-001',
        'case_id' => $case->id,
        'case_no' => 'KP-2026-102',
        'complainant' => 'Maria Santos',
        'respondent' => 'Jose Rizal',
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);

    // Crucial: Exactly 1 case in DB, NO phantom duplicate created!
    expect(LuponCase::count())->toBe(1);

    // Exactly 1 document created and linked to the folder case
    expect(Document::count())->toBe(1);
    $doc = Document::first();
    expect($doc->case_id)->toBe($case->id)
        ->and($doc->folder_name)->toBe('case-001')
        ->and($doc->type)->toBe('summons');

    // 3. Saving the form again updates the same document, no duplicate document
    $response2 = $this->actingAs($encoder)->postJson(route('documents.generate'), [
        'type' => 'summons',
        'action' => 'save_only',
        'document_id' => $doc->id,
        'folder_name' => 'case-001',
        'case_id' => $case->id,
        'case_no' => 'KP-2026-102',
        'complainant' => 'Maria Santos',
        'respondent' => 'Jose Rizal Updated',
    ]);

    $response2->assertOk();
    expect(LuponCase::count())->toBe(1);
    expect(Document::count())->toBe(1);
});

test('saving form with a new folder name creates at most one case and one document', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    $response = $this->actingAs($encoder)->postJson(route('documents.generate'), [
        'type' => 'summons',
        'action' => 'save_only',
        'folder_name' => 'case-002',
        'case_no' => 'KP-2026-200',
        'complainant' => 'Cardo Dalisay',
        'respondent' => 'Joaquin Tuazon',
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);

    // Exactly 1 case and 1 document created
    expect(LuponCase::count())->toBe(1);
    expect(Document::count())->toBe(1);

    $case = LuponCase::first();
    $doc = Document::first();
    expect($case->folder_name)->toBe('case-002')
        ->and($doc->case_id)->toBe($case->id)
        ->and($doc->folder_name)->toBe('case-002');
});

test('saveLayout does not create rogue unlinked draft documents when case_id is missing', function () {
    $encoder = User::factory()->create(['status' => 'Active']);
    $encoder->assignRole('Data Encoder');

    $response = $this->actingAs($encoder)->postJson(route('documents.save-layout'), [
        'document_type' => 'summons',
        'positions' => ['case_no' => ['x' => 10, 'y' => 20]],
        'styles' => [],
        'content' => ['case_no' => 'KP-999'],
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);

    // saveLayout should NOT create an unlinked document in documents table
    expect(Document::count())->toBe(0);
});
