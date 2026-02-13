<?php

namespace App\Config;

class FormLayouts
{
    public static function getLayout($type)
    {
        $commonFields = [
            'case_no' => ['label' => 'Case No.', 'x' => '85%', 'y' => '22.5%', 'w' => '10%', 'class' => 'text-right'],
        ];

        $layouts = [
            'complaint' => [
                ['name' => 'complainant', 'label' => 'Complainant', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent', 'label' => 'Respondent', 'x' => '8.5%', 'y' => '29%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no', 'label' => 'Case No.', 'x' => '71.5%', 'y' => '18.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For', 'label' => 'For', 'x' => '59%', 'y' => '20.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'narrative', 'label' => 'Complaint Narrative', 'x' => '8.5%', 'y' => '44%', 'w' => '85%', 'h' => '30%', 'type' => 'textarea'],
                ['name' => 'made_this_1', 'label' => '', 'x' => '18%', 'y' => '74%', 'w' => '19%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_2', 'label' => '', 'x' => '43%', 'y' => '74%', 'w' => '19%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_3', 'label' => '', 'x' => '65.5%', 'y' => '74%', 'w' => '8%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_day', 'label' => '', 'x' => '28.5%', 'y' => '80%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month', 'label' => 'Month/Year', 'x' => '50%', 'y' => '80%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'year', 'label' => '', 'x' => '67%', 'y' => '80.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
            ],
            'summons' => [
                ['name' => 'respondent', 'label' => 'Respondent', 'x' => '8.5%', 'y' => '29%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no', 'label' => 'Case No.', 'x' => '71.5%', 'y' => '18.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'hearing_date_time', 'label' => 'Date/Time', 'x' => '20%', 'y' => '40%', 'w' => '60%', 'h' => 'auto'],

                // Checkboxes
                ['name' => 'served_personal', 'label' => 'Personal', 'x' => '10%', 'y' => '55%', 'w' => '30px', 'h' => '30px', 'type' => 'checkbox', 'class' => 'bg-transparent flex items-center justify-center font-bold text-xl'],
                ['name' => 'served_substituted', 'label' => 'Substituted', 'x' => '10%', 'y' => '60%', 'w' => '30px', 'h' => '30px', 'type' => 'checkbox', 'class' => 'bg-transparent flex items-center justify-center font-bold text-xl'],

                // Footer / Dates
                ['name' => 'made_this_1', 'label' => '', 'x' => '18%', 'y' => '74%', 'w' => '19%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_2', 'label' => '', 'x' => '43%', 'y' => '74%', 'w' => '19%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_3', 'label' => '', 'x' => '65.5%', 'y' => '74%', 'w' => '8%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_day', 'label' => '', 'x' => '28.5%', 'y' => '80%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month', 'label' => 'Month/Year', 'x' => '50%', 'y' => '80%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'year', 'label' => '', 'x' => '67%', 'y' => '80.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
            ],
            'amicable_settlement' => [
                ['name' => 'complainant', 'label' => 'Complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent', 'label' => 'Respondent', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no', 'label' => 'Case No.', 'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'agreement', 'label' => 'Terms of Settlement', 'x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
            ],
            'arbitration_award' => [
                ['name' => 'complainant', 'label' => 'Complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent', 'label' => 'Respondent', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no', 'label' => 'Case No.', 'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'award_details', 'label' => 'Award Details', 'x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
            ],
            'repudiation' => [
                ['name' => 'scan_content', 'label' => 'Note: This form typically contains a sworn statement.', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => 'auto', 'default' => 'I hereby repudiate the arbitration award/amicable settlement on the grounds that my consent was obtained through fraud, violence, or intimidation.'],
                ['name' => 'notary', 'label' => 'Subscribed and Sworn', 'x' => '10%', 'y' => '70%', 'w' => '40%', 'h' => 'auto'],
            ],
            'hearing_notice' => [
                ['name' => 'complainant', 'label' => 'Complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent', 'label' => 'Respondent', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_date', 'label' => 'Hearing Date', 'x' => '30%', 'y' => '40%', 'w' => '40%', 'h' => 'auto'],
            ],
            'certification_bar_action' => [
                ['name' => 'complainant', 'label' => 'Complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent', 'label' => 'Respondent', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'cert_body', 'label' => 'Certification Body', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '40%', 'type' => 'textarea', 'default' => 'This is to certify that the above-captioned case was dismissed...'],
            ],
            'certification_to_file_action' => [
                ['name' => 'complainant', 'label' => 'Complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent', 'label' => 'Respondent', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'cert_body', 'label' => 'Certification Body', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '40%', 'type' => 'textarea', 'default' => 'This is to certify that...'],
            ],
            'notice_of_hearing' => [
                ['name' => 'respondent', 'label' => 'To', 'x' => '10%', 'y' => '25%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_schedule', 'label' => 'Hearing Schedule', 'x' => '20%', 'y' => '40%', 'w' => '60%', 'h' => 'auto'],
            ],
            'notice_for_constitution' => [
                ['name' => 'body', 'label' => 'Notice Body', 'x' => '10%', 'y' => '30%', 'w' => '80%', 'h' => '40%', 'type' => 'textarea'],
            ],
            'notice_chosen_pangkat' => [
                ['name' => 'pangkat_names', 'label' => 'Pangkat Members', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
            ],
            // Fallback for others to use the default or a generic 'content' layout
            // 'subpoena', 'withdraw_appointment', 'oath', etc. will naturally fall to 'default' or can be added here.
            'default' => [
                ['name' => 'complainant', 'label' => 'Complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent', 'label' => 'Respondent', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no', 'label' => 'Case No.', 'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body_text', 'label' => 'Content', 'x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
            ]
        ];

        return $layouts[$type] ?? $layouts['default'];
    }
}
