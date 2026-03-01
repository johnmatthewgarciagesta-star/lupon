<?php

namespace App\Config;

class FormLayouts
{
    public static function getLayout($type)
    {
        // Common footer fields used in most forms
        $footerFields = [
            ['name' => 'made_this_1',     'label' => 'Place (City/Municipality)', 'x' => '18%',   'y' => '74%',   'w' => '19%', 'h' => 'auto', 'class' => 'text-center'],
            ['name' => 'made_this_2',     'label' => 'Province',                  'x' => '43%',   'y' => '74%',   'w' => '19%', 'h' => 'auto', 'class' => 'text-center'],
            ['name' => 'made_this_3',     'label' => 'Philippines',               'x' => '65.5%', 'y' => '74%',   'w' => '8%',  'h' => 'auto', 'class' => 'text-center'],
            ['name' => 'made_this_day',   'label' => 'Day',                       'x' => '28.5%', 'y' => '80%',   'w' => '15%', 'h' => 'auto', 'class' => 'text-center'],
            ['name' => 'made_this_month', 'label' => 'Month',                     'x' => '50%',   'y' => '80%',   'w' => '20%', 'h' => 'auto', 'class' => 'text-left'],
            ['name' => 'year',            'label' => 'Year',                      'x' => '67%',   'y' => '80.5%', 'w' => '10%', 'h' => 'auto', 'class' => 'text-left'],
        ];

        $layouts = [

            // KP Form 7 - Complaint Form
            'complaint' => [
                ['name' => 'complainant',    'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',         'x' => '8.5%',  'y' => '18%',   'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',     'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',          'x' => '8.5%',  'y' => '29%',   'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',        'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',            'x' => '71.5%', 'y' => '18.5%', 'w' => '15%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'For',            'label' => 'For (Nature)',        'x' => '59%',   'y' => '20.5%', 'w' => '25%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'narrative',      'label' => 'Complaint Narrative', 'x' => '8.5%',  'y' => '44%',   'w' => '85%', 'h' => '30%',  'type' => 'textarea'],
                ...$footerFields,
            ],

            // KP Form 9 - Summons
            'summons' => [
                ['name' => 'respondent',        'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',        'x' => '8.5%',  'y' => '29%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',           'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',          'x' => '71.5%', 'y' => '18.5%','w' => '15%', 'h' => 'auto', 'class' => 'text-left'],
                ['name' => 'hearing_date_time', 'label' => 'Hearing Date & Time', 'placeholder' => 'e.g. February 28, 2026 at 9:00 AM', 'x' => '20%',   'y' => '40%', 'w' => '60%', 'h' => 'auto'],
                ['name' => 'served_personal',   'label' => 'Served (Personal)', 'x' => '10%',   'y' => '55%', 'w' => '30px','h' => '30px', 'type' => 'checkbox', 'class' => 'bg-transparent flex items-center justify-center font-bold text-xl'],
                ['name' => 'served_substituted','label' => 'Served (Substituted)','x' => '10%', 'y' => '60%', 'w' => '30px','h' => '30px', 'type' => 'checkbox', 'class' => 'bg-transparent flex items-center justify-center font-bold text-xl'],
                ...$footerFields,
            ],

            // KP Form 16 - Amicable Settlement
            'amicable_settlement' => [
                ['name' => 'complainant', 'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',        'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',         'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',           'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'agreement',   'label' => 'Terms of Settlement','x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
                ...$footerFields,
            ],

            // KP Form 15 - Arbitration Award
            'arbitration_award' => [
                ['name' => 'complainant',   'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',     'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',    'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',      'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',       'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',        'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'award_details', 'label' => 'Award Details',   'x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
                ...$footerFields,
            ],

            // KP Form 17 - Repudiation
            'repudiation' => [
                ['name' => 'complainant',  'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'scan_content', 'label' => 'Grounds for Repudiation', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '25%', 'type' => 'textarea',
                    'default' => 'I hereby repudiate the arbitration award/amicable settlement on the grounds that my consent was obtained through fraud, violence, or intimidation.'],
                ['name' => 'notary',       'label' => 'Subscribed and Sworn Before', 'x' => '10%', 'y' => '70%', 'w' => '40%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Affidavit of Desistance
            'affidavit_desistance' => [
                ['name' => 'complainant', 'label' => 'Complainant (Affiant)', 'x' => '10%', 'y' => '22%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',            'x' => '10%', 'y' => '28%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',              'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body_text',   'label' => 'Affidavit Content',     'x' => '10%', 'y' => '38%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea',
                    'default' => 'I, the undersigned complainant, do hereby freely and voluntarily desist from pursuing the above-captioned case.'],
                ['name' => 'notary',      'label' => 'Subscribed and Sworn Before', 'x' => '10%', 'y' => '72%', 'w' => '40%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Affidavit of Withdrawal
            'affidavit_withdrawal' => [
                ['name' => 'complainant', 'label' => 'Complainant (Affiant)', 'x' => '10%', 'y' => '22%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',            'x' => '10%', 'y' => '28%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',              'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body_text',   'label' => 'Withdrawal Statement',  'x' => '10%', 'y' => '38%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea',
                    'default' => 'I, the undersigned, do hereby voluntarily withdraw the complaint filed against the respondent.'],
                ['name' => 'notary',      'label' => 'Subscribed and Sworn Before', 'x' => '10%', 'y' => '72%', 'w' => '40%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Notice of Hearing - Conciliation
            'hearing_conciliation' => [
                ['name' => 'complainant',   'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',      'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',    'label' => 'Respondent / To',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',       'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',         'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'hearing_date',  'label' => 'Hearing Date & Time','x' => '25%','y' => '40%', 'w' => '50%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Notice of Hearing - Mediation
            'hearing_mediation' => [
                ['name' => 'complainant',  'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',        'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Respondent / To',    'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',           'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'hearing_date', 'label' => 'Hearing Date & Time','x' => '25%', 'y' => '40%', 'w' => '50%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Notice of Hearing - Failure to Appear
            'hearing_failure_appear' => [
                ['name' => 'complainant',  'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',            'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Absent Party / To',      'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',               'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'hearing_date', 'label' => 'Next Hearing Date & Time','x' => '25%','y' => '40%', 'w' => '50%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Notice of Hearing - Failure to Appear (Counterclaim)
            'hearing_failure_appear_counterclaim' => [
                ['name' => 'complainant',  'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',            'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Respondent / To',        'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',               'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'hearing_date', 'label' => 'Next Hearing Date & Time','x' => '25%','y' => '40%', 'w' => '50%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Certificate to File Action
            'cert_file_action' => [
                ['name' => 'complainant', 'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'cert_body',   'label' => 'Certification Text', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '35%', 'type' => 'textarea',
                    'default' => 'This is to certify that the above-captioned case was not settled before this Lupong Tagapamayapa and is hereby certified for filing with the appropriate government office or court.'],
                ...$footerFields,
            ],

            // Certificate to File Action (Court)
            'cert_file_action_court' => [
                ['name' => 'complainant', 'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'cert_body',   'label' => 'Certification Text', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '35%', 'type' => 'textarea',
                    'default' => 'This is to certify that the above-captioned case was not settled before this Lupong Tagapamayapa and is hereby certified for filing with the appropriate court.'],
                ...$footerFields,
            ],

            // Certificate to Bar Action
            'cert_bar_action' => [
                ['name' => 'complainant', 'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'cert_body',   'label' => 'Certification Text', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '35%', 'type' => 'textarea',
                    'default' => 'This is to certify that the dispute between the parties has been settled and no further action may be filed by either party.'],
                ...$footerFields,
            ],

            // Certificate to Bar Counterclaim
            'cert_bar_counterclaim' => [
                ['name' => 'complainant', 'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'cert_body',   'label' => 'Certification Text', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '35%', 'type' => 'textarea',
                    'default' => 'This is to certify that no counterclaim may be filed in connection with the above-captioned settled case.'],
                ...$footerFields,
            ],

            // Motion for Execution
            'motion_execution' => [
                ['name' => 'complainant',  'label' => 'Complainant / Movant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',           'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',             'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body_text',    'label' => 'Motion Content',       'x' => '10%', 'y' => '38%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea',
                    'default' => 'Movant respectfully prays that a writ of execution be issued to enforce the amicable settlement/arbitration award.'],
                ...$footerFields,
            ],

            // Notice of Hearing - Execution
            'notice_execution' => [
                ['name' => 'complainant',  'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Respondent / Addressee',  'placeholder' => 'Full legal name of the respondent', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number',            'placeholder' => 'e.g. 2024-001', 'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'hearing_date', 'label' => 'Hearing Date & Time',    'placeholder' => 'e.g. February 28, 2026 at 9:00 AM', 'x' => '25%', 'y' => '40%', 'w' => '50%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Notice for Constitution of Pangkat
            'notice_constitution' => [
                ['name' => 'complainant',  'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',   'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',      'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body', 'label' => 'Notice Body', 'x' => '10%', 'y' => '35%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea',
                    'default' => 'You are hereby notified that the Pangkat ng Tagapagkasundo has been constituted to hear and settle the above-captioned case.'],
                ...$footerFields,
            ],

            // Notice to Chosen Pangkat Member
            'notice_chosen_member' => [
                ['name' => 'pangkat_names', 'label' => 'Pangkat Member (Full Name)', 'x' => '10%', 'y' => '28%', 'w' => '60%', 'h' => 'auto'],
                ['name' => 'case_no',       'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',                   'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'complainant',   'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant',                'x' => '10%', 'y' => '35%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',    'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',                 'x' => '10%', 'y' => '40%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'hearing_date',  'label' => 'First Session Date & Time',  'x' => '25%', 'y' => '50%', 'w' => '50%', 'h' => 'auto'],
                ...$footerFields,
            ],

            // Officers Return
            'officers_return' => [
                ['name' => 'respondent',    'label' => 'Person Served / To',    'x' => '10%', 'y' => '22%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'case_no',       'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',              'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'served_personal',   'label' => 'Served Personally',    'x' => '10%', 'y' => '40%', 'w' => '30px','h' => '30px', 'type' => 'checkbox', 'class' => 'bg-transparent flex items-center justify-center font-bold text-xl'],
                ['name' => 'served_substituted','label' => 'Served via Substitution','x' => '10%','y' => '46%', 'w' => '30px','h' => '30px', 'type' => 'checkbox', 'class' => 'bg-transparent flex items-center justify-center font-bold text-xl'],
                ['name' => 'body_text',     'label' => 'Return Details',        'x' => '10%', 'y' => '55%', 'w' => '80%', 'h' => '20%', 'type' => 'textarea',
                    'default' => 'I hereby certify that I served the above notice/summons on the person named above.'],
                ...$footerFields,
            ],

            // Letter of Demand
            'letter_of_demand' => [
                ['name' => 'respondent',    'label' => 'Addressee (Debtor/Obligor)', 'x' => '10%', 'y' => '22%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'complainant',   'label' => 'Sender (Creditor/Obligee)',  'x' => '10%', 'y' => '28%', 'w' => '50%', 'h' => 'auto'],
                ['name' => 'case_no',       'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',                  'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body_text',     'label' => 'Demand Details',            'x' => '10%', 'y' => '38%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea',
                    'default' => 'You are hereby formally demanded to fulfill your obligation within _____ days from receipt of this letter.'],
                ...$footerFields,
            ],

            // Katunayan ng Pagkakasundo (Tagalog Certificate of Agreement)
            'katunayan_pagkakasundo' => [
                ['name' => 'complainant', 'label' => 'Nagrereklamo (Complainant)', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Inirereklamo (Respondent)', 'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Bilang ng Kaso (Case No.)', 'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'agreement',   'label' => 'Mga Tuntunin ng Kasunduan (Terms of Agreement)', 'x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
                ...$footerFields,
            ],

            // Fallback / Legacy keys
            'hearing_notice'              => [], // Will fall through to default
            'certification_bar_action'    => [], // Will fall through to default
            'certification_to_file_action'=> [], // Will fall through to default
            'notice_of_hearing'           => [], // Will fall through to default
            'notice_for_constitution'     => [], // Will fall through to default
            'notice_chosen_pangkat'       => [], // Will fall through to default

            // Generic Default
            'default' => [
                ['name' => 'complainant', 'label' => 'Complainant (Full Name)', 'placeholder' => 'Full legal name of the complainant', 'x' => '10%', 'y' => '22%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'respondent',  'label' => 'Respondent / Addressee', 'placeholder' => 'Full legal name of the respondent',  'x' => '10%', 'y' => '27%', 'w' => '40%', 'h' => 'auto'],
                ['name' => 'case_no',     'label' => 'Case Number', 'placeholder' => 'e.g. 2024-001',    'x' => '75%', 'y' => '22.5%','w' => '15%','h' => 'auto', 'class' => 'text-right'],
                ['name' => 'body_text',   'label' => 'Content',     'x' => '10%', 'y' => '40%', 'w' => '80%', 'h' => '30%', 'type' => 'textarea'],
                ...$footerFields,
            ]
        ];

        // If the requested layout is empty (legacy fallback key), use default
        $layout = $layouts[$type] ?? null;
        if ($layout === null || $layout === []) {
            return $layouts['default'];
        }

        return $layout;
    }
}
