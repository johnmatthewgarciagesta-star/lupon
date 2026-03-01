<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\LuponCase;
use App\Models\User;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MockDataSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('en_PH');
        $user = User::first();
        if (! $user) {
            $user = User::factory()->create();
        }

        // Map the 22 form types precisely to the 22 filenames in `resources/forms`
        $formNamesMap = [
            'complaint' => 'Complaint Form',
            'summons' => 'Summons Form',
            'amicable_settlement' => 'Amicable Settlement Form',
            'arbitration_award' => 'KP Form No. 17 Form',
            'repudiation' => 'Repudation Form',
            'affidavit_desistance' => 'Affidavit Of Desistance Form',
            'affidavit_withdrawal' => 'Affidavit Of Withdrawal Form',
            'hearing_conciliation' => 'Notice Of Hearing (Conciliation Proceedings) Form',
            'hearing_mediation' => 'Notice Of Hearing (Mediation Proceedings) Form',
            'hearing_failure_appear' => 'Notice Of Hearing (RE_ Failure To Appear) Form',
            'hearing_failure_appear_counterclaim' => 'Notice Of Hearing (RE_ Failure To Appear) CounterClaim Form',
            'cert_file_action' => 'Certification To File Action Form',
            'cert_file_action_court' => 'Certification To File Action In Court Form',
            'cert_bar_action' => 'Certification To Bar Action Form',
            'cert_bar_counterclaim' => 'Certification To Bar CounterClaim',
            'motion_execution' => 'Motion For Execution Form',
            'notice_execution' => 'Notice Of Hearing (RE_ Motion For Execution) Form',
            'notice_constitution' => 'Notice For The Constitution Of Pangkat Form',
            'notice_chosen_member' => 'Notice To Chosen Pangkat Member Form',
            'officers_return' => 'Officers Return Form',
            'letter_of_demand' => 'Letter Of Demand Form',
            'katunayan_pagkakasundo' => 'Katunayan Ng Pagkakasundo Form',
        ];

        $forms = array_keys($formNamesMap);

        $documentsToCreate = [];
        foreach ($forms as $form) {
            $documentsToCreate[] = $form; // Ensures all 22 are used
        }

        while (count($documentsToCreate) < 50) {
            $documentsToCreate[] = $faker->randomElement($forms); // Randomize the rest up to 50
        }

        shuffle($documentsToCreate);

        DB::beginTransaction();

        try {
            // Truncate existing mock data to cleanly recreate.
            LuponCase::query()->forceDelete();
            Document::query()->delete(); // Documents don't have soft deletes, but just in case

            foreach ($documentsToCreate as $index => $formType) {
                $caseNo = '2026-'.str_pad($faker->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT);
                $complainant = $faker->name();
                $respondent = $faker->name();
                $mockName = $formNamesMap[$formType];

                $case = LuponCase::create([
                    'case_number' => $caseNo,
                    'title' => $mockName.' - '.date('Y-m-d'), // Added date to easily check the newly created records
                    'nature_of_case' => $faker->randomElement(['Property Dispute', 'Noise Complaint', 'Debt Collection', 'Family Dispute']),
                    'complainant' => $complainant,
                    'respondent' => $respondent,
                    'status' => $faker->randomElement(['Pending', 'Resolved', 'Mediation', 'Dismissed', 'Certified']),
                    'date_filed' => date('Y-m-d'), // Set the date exactly to today for easy checking
                    'complaint_narrative' => 'This case pertains to a '.$mockName.'. '.$faker->paragraph(),
                    'created_by' => $user->id,
                ]);

                $content = [
                    'complainant' => $case->complainant,
                    'respondent' => $case->respondent,
                    'case_no' => $case->case_number,
                    'made_this_1' => $faker->city,
                    'made_this_2' => 'Province of '.$faker->lastName,
                    'made_this_3' => 'Philippines',
                    'made_this_day' => (string) $faker->numberBetween(1, 28),
                    'made_this_month' => $faker->monthName,
                    'year' => '2026',
                    'body_text' => $faker->paragraph(),
                ];

                Document::create([
                    'case_id' => $case->id,
                    'type' => $formType,
                    'content' => $content,
                    'file_path' => null, // Assuming it's nullable
                    'status' => $faker->randomElement(['draft', 'completed', 'signed']),
                    'issued_at' => $faker->dateTimeBetween('-1 month', 'now'),
                    'created_by' => $user->id,
                ]);
            }

            DB::commit();
            $this->command->info('Successfully generated 50 mock documents. The 22 resources/forms files are now precisely used as the mock data names.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error seeding: '.$e->getMessage());
        }
    }
}
