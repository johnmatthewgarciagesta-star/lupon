<?php

namespace Tests\Feature;

use App\Models\LuponCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CaseAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Administrator']);
        Role::firstOrCreate(['name' => 'Data Encoder']);
    }

    public function test_encoder_cannot_view_unauthorized_case_via_url()
    {
        $encoder = User::factory()->create(['status' => 'Active']);
        $encoder->assignRole('Data Encoder');

        $otherUser = User::factory()->create(['status' => 'Active']);
        $case = LuponCase::create([
            'case_number' => 'KP-2026-9999',
            'title' => 'Juan vs Pedro',
            'complainant' => 'Juan',
            'respondent' => 'Pedro',
            'nature_of_case' => 'Boundary Dispute',
            'status' => 'Pending',
            'date_filed' => now(),
            'created_by' => $otherUser->id,
        ]);

        $response = $this->actingAs($encoder)->get("/documents/view-case/{$case->id}");

        $response->assertRedirect(route('cases.index'));
        $response->assertSessionHas('error');
    }

    public function test_encoder_cannot_view_null_creator_case_via_url()
    {
        $encoder = User::factory()->create(['status' => 'Active']);
        $encoder->assignRole('Data Encoder');

        $case = LuponCase::create([
            'case_number' => 'KP-2026-5454',
            'title' => 'Null Creator Case',
            'complainant' => 'Comp',
            'respondent' => 'Resp',
            'nature_of_case' => 'Dispute',
            'status' => 'Pending',
            'date_filed' => now(),
            'created_by' => null,
        ]);

        $response = $this->actingAs($encoder)->get("/documents/view-case/{$case->id}");

        $response->assertRedirect(route('cases.index'));
        $response->assertSessionHas('error');
    }

    public function test_encoder_can_view_own_case_via_url()
    {
        $encoder = User::factory()->create(['status' => 'Active']);
        $encoder->assignRole('Data Encoder');

        $case = LuponCase::create([
            'case_number' => 'KP-2026-8888',
            'title' => 'Self vs Other',
            'complainant' => 'Self',
            'respondent' => 'Other',
            'nature_of_case' => 'Noise Complaint',
            'status' => 'Pending',
            'date_filed' => now(),
            'created_by' => $encoder->id,
        ]);

        $response = $this->actingAs($encoder)->get("/documents/view-case/{$case->id}");

        $response->assertStatus(200);
    }

    public function test_admin_can_view_any_case_via_url()
    {
        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Administrator');

        $otherUser = User::factory()->create(['status' => 'Active']);
        $case = LuponCase::create([
            'case_number' => 'KP-2026-7777',
            'title' => 'Admin Test Case',
            'complainant' => 'AdminComp',
            'respondent' => 'AdminResp',
            'nature_of_case' => 'Dispute',
            'status' => 'Pending',
            'date_filed' => now(),
            'created_by' => $otherUser->id,
        ]);

        $response = $this->actingAs($admin)->get("/documents/view-case/{$case->id}");

        $response->assertStatus(200);
    }

    public function test_non_existent_case_redirects_to_case_management_for_both_roles()
    {
        $admin = User::factory()->create(['status' => 'Active']);
        $admin->assignRole('Administrator');

        $encoder = User::factory()->create(['status' => 'Active']);
        $encoder->assignRole('Data Encoder');

        $resAdmin = $this->actingAs($admin)->get('/documents/view-case/99999');
        $resAdmin->assertRedirect(route('cases.index'));
        $resAdmin->assertSessionHas('error');

        $resEncoder = $this->actingAs($encoder)->get('/documents/view-case/99999');
        $resEncoder->assertRedirect(route('cases.index'));
        $resEncoder->assertSessionHas('error');
    }

    public function test_encoder_cannot_prelink_unauthorized_case_via_query_param()
    {
        $encoder = User::factory()->create(['status' => 'Active']);
        $encoder->assignRole('Data Encoder');

        $otherUser = User::factory()->create(['status' => 'Active']);
        $case = LuponCase::create([
            'case_number' => 'KP-2026-5555',
            'title' => 'Other User Case',
            'complainant' => 'OtherComp',
            'respondent' => 'OtherResp',
            'nature_of_case' => 'Dispute',
            'status' => 'Pending',
            'date_filed' => now(),
            'created_by' => $otherUser->id,
        ]);

        $response = $this->actingAs($encoder)->get("/documents/create/complaint?case_id={$case->id}");

        $response->assertRedirect(route('cases.index'));
        $response->assertSessionHas('error');
    }

    public function test_encoder_search_only_returns_own_cases()
    {
        $encoder = User::factory()->create(['status' => 'Active']);
        $encoder->assignRole('Data Encoder');

        $otherUser = User::factory()->create(['status' => 'Active']);

        LuponCase::create([
            'case_number' => 'SECRET-101',
            'title' => 'Secret Case',
            'complainant' => 'Secret',
            'respondent' => 'Party',
            'nature_of_case' => 'Dispute',
            'status' => 'Pending',
            'date_filed' => now(),
            'created_by' => $otherUser->id,
        ]);

        $ownCase = LuponCase::create([
            'case_number' => 'OWN-202',
            'title' => 'My Case',
            'complainant' => 'EncoderUser',
            'respondent' => 'OtherParty',
            'nature_of_case' => 'Dispute',
            'status' => 'Pending',
            'date_filed' => now(),
            'created_by' => $encoder->id,
        ]);

        $response = $this->actingAs($encoder)->get('/api/cases/lookup?search=SECRET-101');
        $response->assertJsonCount(0);

        $responseOwn = $this->actingAs($encoder)->get('/api/cases/lookup?search=OWN-202');
        $responseOwn->assertJsonCount(1);
    }
}
