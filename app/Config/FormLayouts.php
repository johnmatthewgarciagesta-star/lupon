<?php

namespace App\Config;

class FormLayouts
{
    public static function getAllLayouts()
    {
        // Common footer fields used in most forms
        $footerFields = [
            ['name' => 'made_this_1',     'label' => 'Place (City/Municipality)', 'default' => 'Pasay City, Brgy 183 Villamor', 'type' => 'hidden', 'x' => '10%',   'y' => '74%',   'w' => '30%', 'h' => 'auto', 'class' => 'text-center'],
            ['name' => 'made_this_2',     'label' => 'Province',                  'default' => 'Metro Manila', 'type' => 'hidden', 'x' => '43%',   'y' => '74%',   'w' => '19%', 'h' => 'auto', 'class' => 'text-center'],
            ['name' => 'made_this_date_picker', 'label' => 'Date',                'type' => 'date_split', 'x' => '-100%', 'y' => '-100%', 'w' => '0%'],
            ['name' => 'made_this_day',   'label' => 'Day',                       'type' => 'hidden', 'x' => '28.5%', 'y' => '80%',   'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
            ['name' => 'made_this_month', 'label' => 'Month',                     'type' => 'hidden', 'x' => '50%',   'y' => '80%',   'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
            ['name' => 'year',            'label' => 'Year',                      'type' => 'hidden', 'x' => '67%',   'y' => '80.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
        ];

        $layouts = [

            // KP Form 7 - Complaint Form (11 Text Boxes)
            'complaint' => [
                ['name' => 'case_no',         'label' => 'Case No',           'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',             'label' => 'For',               'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',     'label' => 'Complainant/s',     'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',      'label' => 'Respondent/s',      'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'narrative',      'label' => 'Complaint',         'placeholder' => 'Complaint details...', 'x' => '8.5%', 'y' => '44%', 'w' => '83%', 'h' => '25%', 'type' => 'textarea'],
                ['name' => 'made_this_month', 'label' => 'Month',             'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '72%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'made_this_day',   'label' => 'Date',              'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '72%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'year',            'label' => 'Year',              'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '72.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'received_month', 'label' => 'Month (Received)',  'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '82%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'received_day',   'label' => 'Date (Received)',   'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '82%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'received_year',  'label' => 'Year (Received)',   'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '82.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
            ],

            // KP Form 9 - Summons (9 Text Boxes)
            'summons' => [
                ['name' => 'case_no',         'label' => 'No', 'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',             'label' => 'For',               'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',     'label' => 'Complainant/s',     'placeholder' => 'Full legal name of the complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',      'label' => 'Respondent/s',      'placeholder' => 'Full legal name of the respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_date',    'label' => 'Hearing Date',      'placeholder' => 'e.g. February 28, 2026 at 9:00 AM', 'x' => '20%', 'y' => '40%', 'w' => '60%', 'h' => 'auto'],
                ['name' => 'location',        'label' => 'Location',          'placeholder' => 'Location', 'x' => '20%', 'y' => '44%', 'w' => '60%', 'h' => 'auto'],
                ['name' => 'made_this_month', 'label' => 'Month',             'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '80%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'made_this_day',   'label' => 'Day',               'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '80%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'year',            'label' => 'Year',              'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '80.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
            ],

            // KP Form 16 - Amicable Settlement (10 Text Boxes)
            'amicable_settlement' => [
                ['name' => 'case_no',         'label' => 'Barangay Case No.',       'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',             'label' => 'For:',                    'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',     'label' => 'Complainant/s',           'placeholder' => 'Full legal name of the complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',      'label' => 'Respondent/s',            'placeholder' => 'Full legal name of the respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'agreement',       'label' => 'Agreement',               'placeholder' => 'Terms of settlement agreement...', 'x' => '8.5%', 'y' => '40%', 'w' => '83%', 'h' => '25%', 'type' => 'textarea'],
                ['name' => 'made_this_month', 'label' => 'Month',                   'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '72%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'made_this_day',   'label' => 'Day',                     'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '72%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'year',            'label' => 'Year',                    'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '72.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant_sig', 'label' => 'Complainant/s',           'placeholder' => 'Complainant name for signature', 'x' => '15%', 'y' => '82%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'respondent_sig',  'label' => 'Respondent/s',            'placeholder' => 'Respondent name for signature', 'x' => '55%', 'y' => '82%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
            ],

            // KP Form 15 - Arbitration Award
            'arbitration_award' => [
                ['name' => 'complainant',   'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',     'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',    'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',      'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',       'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',        'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'award_details', 'label' => 'Award Details',   'x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
                ...$footerFields,
            ],

            // KP Form 17 - Repudiation
            'repudiation' => [
                ['name' => 'complainant',  'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'scan_content', 'label' => 'Grounds for Repudiation', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '25%', 'type' => 'textarea',
                    'default' => 'I hereby repudiate the arbitration award/amicable settlement on the grounds that my consent was obtained through fraud, violence, or intimidation.'],
                ['name' => 'notary',       'label' => 'Subscribed and Sworn Before', 'x' => '10%', 'y' => '70%', 'w' => '40%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Affidavit of Desistance
            'affidavit_desistance' => [
                ['name' => 'complainant', 'label' => 'Complainant (Affiant)', 'x' => '10%', 'y' => '22%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',            'x' => '10%', 'y' => '28%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',              'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body_text',   'label' => 'Affidavit Content',     'x' => '10%', 'y' => '38%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea',
                    'default' => 'I, the undersigned complainant, do hereby freely and voluntarily desist from pursuing the above-captioned case.'],
                ['name' => 'notary',      'label' => 'Subscribed and Sworn Before', 'x' => '10%', 'y' => '72%', 'w' => '40%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Affidavit of Withdrawal
            'affidavit_withdrawal' => [
                ['name' => 'complainant', 'label' => 'Complainant (Affiant)', 'x' => '10%', 'y' => '22%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',            'x' => '10%', 'y' => '28%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',              'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body_text',   'label' => 'Withdrawal Statement',  'x' => '10%', 'y' => '38%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea',
                    'default' => ''],
                ['name' => 'notary',      'label' => 'Subscribed and Sworn Before', 'x' => '10%', 'y' => '72%', 'w' => '40%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // KP Form 8 - Notice of Hearing (Conciliation) (14 Text Boxes)
            'hearing_conciliation' => [
                ['name' => 'complainant',     'label' => 'Complainant/s',          'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',      'label' => 'Respondent/s',           'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_month',   'label' => 'Month (Hearing)',        'placeholder' => 'e.g. February', 'x' => '30%', 'y' => '45%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'hearing_day',     'label' => 'Day (Hearing)',          'placeholder' => 'e.g. 28th', 'x' => '55%', 'y' => '45%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'hearing_year',    'label' => 'Year (Hearing)',         'placeholder' => 'e.g. 2026', 'x' => '75%', 'y' => '45%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'hearing_time',    'label' => 'Military time',          'placeholder' => 'e.g. 09:00 / 14:30', 'x' => '35%', 'y' => '50%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month', 'label' => 'Month',                  'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '65%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'made_this_day',   'label' => 'Day',                    'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '65%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'year',            'label' => 'Year',                   'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '65.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'officer_month',   'label' => 'Month (Officer)',        'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '75%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'officer_day',     'label' => 'Day (Officer)',          'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '75%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'officer_year',    'label' => 'Year (Officer)',         'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '75.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant_sig', 'label' => 'Complainant/s',          'placeholder' => 'Complainant name for signature', 'x' => '15%', 'y' => '85%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'respondent_sig',  'label' => 'Respondent/s',           'placeholder' => 'Respondent name for signature', 'x' => '55%', 'y' => '85%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
            ],

            // KP Form 8 - Notice of Hearing (Mediation) (14 Text Boxes)
            'hearing_mediation' => [
                ['name' => 'complainant',     'label' => 'Complainant/s',          'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',      'label' => 'Respondent/s',           'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_day',     'label' => 'Day (Hearing)',          'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '45%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'hearing_month',   'label' => 'Month (Hearing)',        'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '45%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'hearing_year',    'label' => 'Year (Hearing)',         'placeholder' => 'e.g. 2026', 'x' => '75%', 'y' => '45%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'hearing_time',    'label' => 'Military Time',          'placeholder' => 'e.g. 09:00 / 14:30', 'x' => '35%', 'y' => '50%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_day',   'label' => 'Day',                    'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '65%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month', 'label' => 'Month',                  'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '65%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'year',            'label' => 'Year',                   'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '65.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'officer_day',     'label' => 'Day (Officer)',          'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '75%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'officer_month',   'label' => 'Month (Officer)',        'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '75%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'officer_year',    'label' => 'Year (Officer)',         'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '75.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant_sig', 'label' => 'Complainant/s',          'placeholder' => 'Complainant name for signature', 'x' => '15%', 'y' => '85%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'respondent_sig',  'label' => 'Respondent/s',           'placeholder' => 'Respondent name for signature', 'x' => '55%', 'y' => '85%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
            ],

            // KP Form 18/19 - Notice of Hearing (Failure to Appear) (19 Text Boxes)
            'hearing_failure_appear' => [
                ['name' => 'case_no',           'label' => 'Case No',                'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',               'label' => 'For',                    'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',       'label' => 'Complainant/s',          'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',        'label' => 'Respondent/s',           'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'to_complainant',    'label' => 'To Complainant/s',       'placeholder' => 'Addressed party name', 'x' => '8.5%', 'y' => '33%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'failure_day',       'label' => 'Day (Failure)',          'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '42%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'failure_month',     'label' => 'Month (Failure)',        'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '42%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'failure_year',      'label' => 'Year (Failure)',         'placeholder' => 'e.g. 2026', 'x' => '75%', 'y' => '42%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'hearing_time',      'label' => 'Military time',          'placeholder' => 'e.g. 09:00 / 14:30', 'x' => '35%', 'y' => '47%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'next_hearing_date', 'label' => 'Hearing date',           'placeholder' => 'e.g. February 28', 'x' => '25%', 'y' => '52%', 'w' => '35%', 'h' => 'auto'],
                ['name' => 'next_hearing_year', 'label' => 'Year (Next Hearing)',    'placeholder' => 'e.g. 2026', 'x' => '65%', 'y' => '52%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'made_this_day',     'label' => 'Day',                    'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '65%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month',   'label' => 'Month',                  'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '65%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'year',              'label' => 'Year',                   'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '65.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'officer_day',       'label' => 'Day (Officer)',          'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '75%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'officer_month',     'label' => 'Month (Officer)',        'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '75%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'officer_year',      'label' => 'Year (Officer)',         'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '75.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant_sig',   'label' => 'Complainant/s',          'placeholder' => 'Complainant name for signature', 'x' => '15%', 'y' => '85%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'respondent_sig',    'label' => 'Respondent/s',           'placeholder' => 'Respondent name for signature', 'x' => '55%', 'y' => '85%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
            ],

            // KP Form 19 - Notice of Hearing (Failure to Appear - Counterclaim) (19 Text Boxes)
            'hearing_failure_appear_counterclaim' => [
                ['name' => 'case_no',           'label' => 'Case No',                'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',               'label' => 'For',                    'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',       'label' => 'Complainant/s',          'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',        'label' => 'Respondent/s',           'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'to_respondent',     'label' => 'To Respondent/s',        'placeholder' => 'Addressed party name', 'x' => '8.5%', 'y' => '33%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'failure_day',       'label' => 'Day (Failure)',          'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '42%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'failure_month',     'label' => 'Month (Failure)',        'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '42%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'failure_year',      'label' => 'Year (Failure)',         'placeholder' => 'e.g. 2026', 'x' => '75%', 'y' => '42%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'hearing_time',      'label' => 'Military Time',          'placeholder' => 'e.g. 09:00 / 14:30', 'x' => '35%', 'y' => '47%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'next_hearing_date', 'label' => 'Hearing Date',           'placeholder' => 'e.g. February 28', 'x' => '25%', 'y' => '52%', 'w' => '35%', 'h' => 'auto'],
                ['name' => 'next_hearing_year', 'label' => 'Year (Next Hearing)',    'placeholder' => 'e.g. 2026', 'x' => '65%', 'y' => '52%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'made_this_day',     'label' => 'Day',                    'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '65%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month',   'label' => 'Month',                  'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '65%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'year',              'label' => 'Year',                   'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '65.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'officer_day',       'label' => 'Day (Officer)',          'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '75%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'officer_month',     'label' => 'Month (Officer)',        'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '75%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'officer_year',      'label' => 'Year (Officer)',         'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '75.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant_sig',   'label' => 'Complainant/s',          'placeholder' => 'Complainant name for signature', 'x' => '15%', 'y' => '85%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'respondent_sig',    'label' => 'Respondent/s',           'placeholder' => 'Respondent name for signature', 'x' => '55%', 'y' => '85%', 'w' => '32%', 'h' => 'auto', 'class' => 'text-center'],
            ],

            // KP Form 20 - Certificate to File Action (Court) (4 Text Boxes)
            'cert_file_action_court' => [
                ['name' => 'case_no',         'label' => 'Case No',       'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',             'label' => 'For',           'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',     'label' => 'Complainant/s', 'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',      'label' => 'Respondent/s',  'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
            ],

            // Certificate to File Action
            'cert_file_action' => [
                ['name' => 'case_no',         'label' => 'Case No',       'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',             'label' => 'For',           'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',     'label' => 'Complainant/s', 'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',      'label' => 'Respondent/s',  'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
            ],

            // KP Form 21 - Certificate to Bar Action (9 Text Boxes)
            'cert_bar_action' => [
                ['name' => 'case_no',         'label' => 'Case No',       'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',             'label' => 'For',           'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',     'label' => 'Complainant/s', 'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',      'label' => 'Respondent/s',  'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_date',    'label' => 'Hearing date',  'placeholder' => 'e.g. February 28, 2026', 'x' => '25%', 'y' => '42%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'appear',          'label' => 'Appear',        'placeholder' => 'e.g. Complainant', 'x' => '25%', 'y' => '48%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'made_this_day',   'label' => 'Day',           'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '72%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month', 'label' => 'Month',         'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '72%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'year',            'label' => 'Year',          'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '72.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
            ],

            // KP Form 21 - Certificate to Bar Counterclaim (10 Text Boxes)
            'cert_bar_counterclaim' => [
                ['name' => 'case_no',          'label' => 'Case No',        'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',              'label' => 'For',            'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',      'label' => 'Complainant/s',  'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',       'label' => 'Respondent/s',   'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'complainant_body', 'label' => 'Complainant/s',  'placeholder' => 'Complainant name in body', 'x' => '25%', 'y' => '40%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_date',     'label' => 'Hearing Date',   'placeholder' => 'e.g. February 28, 2026', 'x' => '25%', 'y' => '46%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'respondent_body',  'label' => 'Respondent/s',   'placeholder' => 'Respondent name in body', 'x' => '25%', 'y' => '52%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'made_this_day',    'label' => 'Day',            'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '72%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month',  'label' => 'Month',          'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '72%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'year',             'label' => 'Year',           'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '72.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
            ],

            // KP Form 23 - Motion for Execution (10 Text Boxes)
            'motion_execution' => [
                ['name' => 'case_no',                     'label' => 'Case No',                     'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',                         'label' => 'For',                         'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'province',                    'label' => 'Province',                    'placeholder' => 'Metro Manila', 'x' => '43%', 'y' => '10%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'city',                        'label' => 'City',                        'placeholder' => 'Pasay City', 'x' => '10%', 'y' => '12%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'barangay',                    'label' => 'Barangay',                    'placeholder' => '183 Villamor', 'x' => '40%', 'y' => '12%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'complainant',                 'label' => 'Complainant/s',               'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',                  'label' => 'Respondent/s',                'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_date',                'label' => 'Hearing Date',                'placeholder' => 'e.g. February 28, 2026', 'x' => '25%', 'y' => '45%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'made_this_date',              'label' => 'Date',                        'placeholder' => 'e.g. February 28, 2026', 'x' => '25%', 'y' => '65%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'complainant_respondent_sig', 'label' => 'Complainant/s&Respondent/s', 'placeholder' => 'Complainant/s & Respondent/s', 'x' => '20%', 'y' => '80%', 'w' => '60%', 'h' => 'auto', 'class' => 'text-center'],
            ],

            // Notice of Hearing - Execution
            'notice_execution' => [
                ['name' => 'complainant',  'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Respondent / Addressee',  'placeholder' => 'Full legal name of the respondent', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number',            'placeholder' => 'e.g. 2024-001', 'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'hearing_date', 'label' => 'Hearing Date & Time',    'placeholder' => 'e.g. February 28, 2026 at 9:00 AM', 'x' => '25%', 'y' => '40%', 'w' => '50%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Notice for Constitution of Pangkat
            'notice_constitution' => [
                ['name' => 'complainant',  'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body', 'label' => 'Notice Body', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea',
                    'default' => 'You are hereby notified that the Pangkat ng Tagapagkasundo has been constituted to hear and settle the above-captioned case.'],
                ...$footerFields,
            ],

            // Notice to Chosen Pangkat Member
            'notice_chosen_member' => [
                ['name' => 'pangkat_names', 'label' => 'Pangkat Member (Full Name)', 'x' => '10%', 'y' => '28%', 'w' => '60%', 'h' => 'auto'],
                ['name' => 'case_no',       'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',                   'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'complainant',   'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',                'x' => '10%', 'y' => '35%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',    'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',                 'x' => '10%', 'y' => '40%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_date',  'label' => 'First Session Date & Time',  'x' => '25%', 'y' => '50%', 'w' => '50%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // KP Form 10 - Officer's Return (19 Text Boxes)
            'officers_return' => [
                ['name' => 'case_no',              'label' => 'Case No',                 'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'respondent',           'label' => 'Respondent',              'placeholder' => 'Full legal name of respondent', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'made_this_day',        'label' => 'Day',                     'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '35%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month',      'label' => 'Month',                   'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '35%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'year',                 'label' => 'Year',                    'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '35.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'respondent_name',      'label' => 'Respondent/s',            'placeholder' => 'Respondent name in body', 'x' => '25%', 'y' => '42%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'days',                 'label' => 'Days',                    'placeholder' => 'e.g. 5 days', 'x' => '25%', 'y' => '48%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'months',               'label' => 'Months',                  'placeholder' => 'e.g. 2 months', 'x' => '45%', 'y' => '48%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'years',                'label' => 'Years',                   'placeholder' => 'e.g. 2026', 'x' => '65%', 'y' => '48%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'answer_1',             'label' => 'Answer',                  'placeholder' => 'Answer 1 details...', 'x' => '20%', 'y' => '54%', 'w' => '60%', 'h' => 'auto'],
                ['name' => 'answer_2',             'label' => 'Answer',                  'placeholder' => 'Answer 2 details...', 'x' => '20%', 'y' => '59%', 'w' => '60%', 'h' => 'auto'],
                ['name' => 'answer_3',             'label' => 'Answer',                  'placeholder' => 'Answer 3 details...', 'x' => '20%', 'y' => '64%', 'w' => '60%', 'h' => 'auto'],
                ['name' => 'answer_4',             'label' => 'Answer',                  'placeholder' => 'Answer 4 details...', 'x' => '20%', 'y' => '69%', 'w' => '60%', 'h' => 'auto'],
                ['name' => 'business_name',        'label' => 'Business Name',           'placeholder' => 'Business Name', 'x' => '20%', 'y' => '74%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'officer',              'label' => 'Officer',                 'placeholder' => 'Officer Name', 'x' => '20%', 'y' => '79%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'representative_name', 'label' => 'Representative Name',     'placeholder' => 'Representative Name', 'x' => '20%', 'y' => '84%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'made_this_date',       'label' => 'Date',                    'placeholder' => 'e.g. February 28, 2026', 'x' => '65%', 'y' => '84%', 'w' => '25%', 'h' => 'auto'],
                ['name' => 'representative_sig',  'label' => 'Representative Signature','placeholder' => 'Signature Name', 'x' => '20%', 'y' => '89%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'time',                 'label' => 'Time',                    'placeholder' => 'e.g. 09:00 AM', 'x' => '65%', 'y' => '89%', 'w' => '25%', 'h' => 'auto'],
            ],

            // KP Form - Letter of Demand (8 Text Boxes)
            'letter_of_demand' => [
                ['name' => 'case_no',         'label' => 'Case No',       'placeholder' => 'e.g. 2024-001', 'x' => '65%', 'y' => '18.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',             'label' => 'For',           'placeholder' => 'Nature of Dispute / Case', 'x' => '65%', 'y' => '22.8%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'complainant',     'label' => 'Complainant/s', 'placeholder' => 'Full legal name of complainant(s)', 'x' => '8.5%', 'y' => '18%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',      'label' => 'Respondent/s',  'placeholder' => 'Full legal name of respondent(s)', 'x' => '8.5%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'dear',            'label' => 'Dear',          'placeholder' => 'e.g. Mr. / Ms. Respondent Name', 'x' => '8.5%', 'y' => '34%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'made_this_day',   'label' => 'Day',           'placeholder' => 'e.g. 28th', 'x' => '28.5%', 'y' => '72%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
                ['name' => 'made_this_month', 'label' => 'Month',         'placeholder' => 'e.g. February', 'x' => '50%', 'y' => '72%', 'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'year',            'label' => 'Year',          'placeholder' => 'e.g. 2026', 'x' => '67%', 'y' => '72.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
            ],

            // Katunayan ng Pagkakasundo (Tagalog Certificate of Agreement)
            'katunayan_pagkakasundo' => [
                ['name' => 'complainant', 'label' => 'Nagrereklamo (Complainant)', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Inirereklamo (Respondent)', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Bilang ng Kaso (Case No.)', 'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'agreement',   'label' => 'Mga Tuntunin ng Kasunduan (Terms of Agreement)', 'x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
                ...$footerFields,
            ],

            // Fallback / Legacy keys
            'hearing_notice' => [], // Will fall through to default
            'certification_bar_action' => [], // Will fall through to default
            'certification_to_file_action' => [], // Will fall through to default
            'notice_of_hearing' => [], // Will fall through to default
            'notice_for_constitution' => [], // Will fall through to default
            'notice_chosen_pangkat' => [], // Will fall through to default

            // Generic Default
            'default' => [
                ['name' => 'complainant', 'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body_text',   'label' => 'Content',     'x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
                ...$footerFields,
            ],
        ];

        return $layouts;
    }

    public static function getLayout($type)
    {
        $layouts = self::getAllLayouts();

        // If the requested layout is empty (legacy fallback key), use default
        $layout = $layouts[$type] ?? null;
        if ($layout === null || $layout === []) {
            return $layouts['default'];
        }

        return $layout;
    }

    public static function saveLayoutToFile($type, $fields)
    {
        try {
            $filePath = app_path('Config/FormLayouts.php');
            if (!file_exists($filePath)) {
                return;
            }

            // Keep FormLayout database record updated as the live single source of truth
            \App\Models\FormLayout::updateOrCreate(
                ['document_type' => $type],
                ['layout_json' => $fields]
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error saving layout to file: ' . $e->getMessage());
        }
    }
}
