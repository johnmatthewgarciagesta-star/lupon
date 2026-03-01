<?php

namespace App\Http\Controllers;

use App\Config\FormLayouts;
use App\Models\FormLayout;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\TblWidth;
use Spatie\Browsershot\Browsershot;

class DocumentController extends Controller
{
    public function index()
    {
        try {
            // Load all documents as a plain array — frontend does instant client-side filtering
            $documents = \App\Models\Document::with(['case', 'creator'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'type' => $doc->type,
                        'status' => $doc->status,
                        'date' => ($doc->issued_at ?? $doc->created_at)?->toISOString(),
                        'case_id' => $doc->case_id,
                        'case_number' => $doc->case?->case_number,
                        'creator' => $doc->creator ? ['name' => $doc->creator->name] : null,
                    ];
                })
                ->values()
                ->toArray();

            // Stats — count per type across the whole table
            $allDocs = \App\Models\Document::selectRaw('type, COUNT(*) as total')
                ->groupBy('type')
                ->pluck('total', 'type')
                ->toArray();

            $stats = [
                'total' => array_sum($allDocs),
                'complaints' => ($allDocs['complaint'] ?? 0),
                'summons' => ($allDocs['summons'] ?? 0),
                'settlements' => ($allDocs['amicable_settlement'] ?? 0)
                    + ($allDocs['arbitration_award'] ?? 0)
                    + ($allDocs['katunayan_pagkakasundo'] ?? 0),
                'certificates' => ($allDocs['cert_file_action'] ?? 0)
                    + ($allDocs['cert_file_action_court'] ?? 0)
                    + ($allDocs['cert_bar_action'] ?? 0)
                    + ($allDocs['cert_bar_counterclaim'] ?? 0),
                'notices' => ($allDocs['notice_of_hearing'] ?? 0)
                    + ($allDocs['notice_to_appear'] ?? 0)
                    + ($allDocs['hearing_conciliation'] ?? 0)
                    + ($allDocs['hearing_mediation'] ?? 0)
                    + ($allDocs['hearing_failure_appear'] ?? 0)
                    + ($allDocs['hearing_failure_appear_counterclaim'] ?? 0)
                    + ($allDocs['notice_execution'] ?? 0)
                    + ($allDocs['notice_constitution'] ?? 0)
                    + ($allDocs['notice_chosen_member'] ?? 0),
                'others' => ($allDocs['minutes_of_hearing'] ?? 0)
                    + ($allDocs['letter_of_demand'] ?? 0)
                    + ($allDocs['subpoena'] ?? 0)
                    + ($allDocs['repudiation'] ?? 0)
                    + ($allDocs['affidavit_desistance'] ?? 0)
                    + ($allDocs['affidavit_withdrawal'] ?? 0)
                    + ($allDocs['motion_execution'] ?? 0)
                    + ($allDocs['officers_return'] ?? 0)
                    + ($allDocs['custom_form'] ?? 0),
            ];

            // Fetch custom-built forms to show in the "Templates" grid
            $customTemplates = \App\Models\Document::where('type', 'custom_form')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'title' => $doc->content['title'] ?? 'Custom Form',
                        'description' => $doc->content['description'] ?? 'Custom uploaded document',
                        'type' => 'custom_template',
                        'icon_name' => 'FileSignature',
                    ];
                });

            // Fetch hidden templates
            $hiddenTemplates = \App\Models\FormLayout::where('is_hidden', true)
                ->pluck('document_type')
                ->toArray();

            return \Inertia\Inertia::render('documents/index', [
                'documents' => $documents,
                'stats' => $stats,
                'customTemplates' => $customTemplates,
                'hiddenTemplates' => $hiddenTemplates,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Documents loading error: ' . $e->getMessage());

            return \Inertia\Inertia::render('documents/index', [
                'error' => 'A database error occurred while loading the documents. Please contact the administrator. Details: ' . $e->getMessage(),
                'documents' => [],
                'stats' => ['total' => 0, 'complaints' => 0, 'summons' => 0, 'settlements' => 0, 'certificates' => 0, 'notices' => 0, 'others' => 0],
                'customTemplates' => [],
                'hiddenTemplates' => [],
            ]);
        }
    }

    public function create($type)
    {
        // Optional: pre-link to a case when opened via ?case_id=X
        $caseId = request('case_id');
        $case = $caseId ? \App\Models\LuponCase::find($caseId) : null;

        // Get Layout from DB or Config
        $savedLayout = FormLayout::where('document_type', $type)->first();
        if ($savedLayout) {
            $fields = $savedLayout->layout_json;
        } else {
            $fields = FormLayouts::getLayout($type);
        }

        // Pre-fill complainant/respondent from case if available
        if ($case) {
            foreach ($fields as &$field) {
                if ($field['name'] === 'complainant' && $case->complainant) {
                    $field['default'] = $case->complainant;
                }
                if ($field['name'] === 'respondent' && $case->respondent) {
                    $field['default'] = $case->respondent;
                }
                if ($field['name'] === 'case_no' && $case->case_number) {
                    $field['default'] = $case->case_number;
                }
            }
            unset($field);
        }

        $imageBase64 = $this->generateBackgroundImage($type);

        return view('documents.form-fill', compact('type', 'imageBase64', 'fields', 'case'));
    }

    /**
     * View a Document record (from documents table) in the visual editor.
     * Called by the Eye button on the /documents list.
     */
    /**
     * Fill out a custom uploaded document template.
     */
    public function fillCustom($id)
    {
        $template = \App\Models\Document::findOrFail($id);
        $type = 'custom_' . $id;
        $caseId = request('case_id');
        $case = $caseId ? \App\Models\LuponCase::find($caseId) : null;

        // Custom fields from form builder
        $fields = $template->content['fields'] ?? [];

        // Ensure fields have default positions and 'name' if not set
        foreach ($fields as &$field) {
            // Map builder 'id' to 'name' for the visual editor
            if (!isset($field['name']) && isset($field['id'])) {
                $field['name'] = $field['id'];
            }
            if (!isset($field['x'])) {
                $field['x'] = '10%';
            }
            if (!isset($field['y'])) {
                $field['y'] = '10%';
            }
            if (!isset($field['w'])) {
                $field['w'] = '30%';
            }
            if (!isset($field['h'])) {
                $field['h'] = 'auto';
            }
        }
        unset($field);

        // Generate background from uploaded PDF
        $imageBase64 = $this->generateBackgroundImage($type, storage_path('app/public/' . $template->file_path));

        return view('documents.form-fill', [
            'type' => $type,
            'imageBase64' => $imageBase64,
            'fields' => $fields,
            'case' => $case,
            'isCustom' => true,
            'templateId' => $id,
        ]);
    }

    public function show($id)
    {
        $document = \App\Models\Document::with(['case', 'creator'])->findOrFail($id);
        $data = $document->content ?? [];
        $type = $document->type;
        $case = $document->case;

        // Get Layout
        $savedLayout = FormLayout::where('document_type', $type)->first();
        $fields = $savedLayout ? $savedLayout->layout_json : FormLayouts::getLayout($type);

        // Populate fields with saved form data
        foreach ($fields as &$field) {
            if (isset($data[$field['name']])) {
                $field['default'] = $data[$field['name']];
            }
            // Apply layout overrides if stored
            if (isset($data['layout_overrides'][$field['name']])) {
                $override = $data['layout_overrides'][$field['name']];
                $field['x'] = $override['x'];
                $field['y'] = $override['y'];
                $field['w'] = $override['w'];
                if (isset($override['h']) && $override['h'] !== 'auto') {
                    $field['h'] = $override['h'];
                }
            }
        }
        unset($field);

        $imageBase64 = $this->generateBackgroundImage($type);
        $readonly = request('mode') !== 'edit';
        $missingData = empty($data);

        return view('documents.visual-editor', compact('type', 'imageBase64', 'fields', 'readonly', 'case', 'missingData'));
    }

    /**
     * View a case's document_data in the visual editor (legacy — used from within case management).
     */
    public function viewCase($id)
    {
        $case = \App\Models\LuponCase::where('id', $id)->orWhere('case_number', $id)->firstOrFail();
        $data = $case->document_data ?? [];

        $type = $data['document_type'] ?? $data['type'] ?? 'complaint';

        // Get Layout
        $savedLayout = FormLayout::where('document_type', $type)->first();
        $fields = $savedLayout ? $savedLayout->layout_json : FormLayouts::getLayout($type);

        // Populate fields with saved data and apply overrides
        foreach ($fields as &$field) {
            if (isset($data[$field['name']])) {
                $field['default'] = $data[$field['name']];
            }
            if (isset($data['layout_overrides'][$field['name']])) {
                $override = $data['layout_overrides'][$field['name']];
                $field['x'] = $override['x'];
                $field['y'] = $override['y'];
                $field['w'] = $override['w'];
                if (isset($override['h']) && $override['h'] !== 'auto') {
                    $field['h'] = $override['h'];
                }
            }
        }
        unset($field);

        $imageBase64 = $this->generateBackgroundImage($type);
        $readonly = request('mode') !== 'edit';
        $missingData = empty($data);

        return view('documents.visual-editor', compact('type', 'imageBase64', 'fields', 'readonly', 'case', 'missingData'));
    }

    public function generate(Request $request)
    {
        $data = $request->all();
        $type = $data['type'] ?? 'complaint';

        $pdfPath = public_path("forms/{$type}.pdf");
        $fields = [];

        // Handle Custom Templates
        if (str_starts_with($type, 'custom_')) {
            $id = str_replace('custom_', '', $type);
            $template = \App\Models\Document::findOrFail($id);
            $pdfPath = storage_path('app/public/' . $template->file_path);
            $fields = $template->content['fields'] ?? [];
        } else {
            // Get Standard Layout
            $fields = FormLayouts::getLayout($type);
        }

        // Apply Layout Overrides from Visual Editor (Session-based)
        if ($request->filled('layout_overrides')) {
            // ... Logic to merge overrides if needed, but if we saved layout,
            // we might rely on DB. However, 'layout_overrides' handles per-submission tweaks.
            // We'll keep the merge logic to allow one-off changes without saving.
            $overrides = json_decode($request->input('layout_overrides'), true);
            if (is_array($overrides)) {
                // ... same logic as before ...
                $fieldMap = [];
                foreach ($fields as $index => $field) {
                    $fieldMap[$field['name']] = $index;
                }

                foreach ($overrides as $name => $override) {
                    if (isset($fieldMap[$name])) {
                        // Update existing field
                        $index = $fieldMap[$name];
                        $fields[$index]['x'] = $override['x'];
                        $fields[$index]['y'] = $override['y'];
                        $fields[$index]['w'] = $override['w'];
                        $fields[$index]['h'] = $override['h'];
                    } else {
                        // Add new dynamic field
                        $fields[] = [
                            'name' => $name,
                            'label' => '', // No default label for new fields
                            'x' => $override['x'],
                            'y' => $override['y'],
                            'w' => $override['w'],
                            'h' => $override['h'],
                            'class' => $override['class'] ?? '',
                            'type' => $override['type'] ?? 'text', // Support type if passed
                        ];
                    }
                }
            }
        }
        $data['fields'] = $fields;

        if (!file_exists($pdfPath)) {
            $pdfPath = public_path('forms/complaint.pdf');
        }

        // Output path for the generated image
        // We use a temporary file or a specific path in storage
        $outputImage = storage_path("app/public/temp_{$type}_" . uniqid() . '.png');

        // Ghostscript Command - Absolute Path
        // Version 10.06.0 detected
        $gsPath = '"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"';
        // On Windows cmd.exe, if the first token is quoted, we might need extra care.
        // We add "2>&1" to capture stderr in output for debugging.
        $cmd = "{$gsPath} -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r300 -dFirstPage=1 -dLastPage=1 -sOutputFile=\"{$outputImage}\" \"{$pdfPath}\" 2>&1";

        // Execute command
        exec($cmd, $output, $returnCode);

        if ($returnCode !== 0 || !file_exists($outputImage)) {
            // Fallback if Ghostscript fails (not installed?)
            // We can return an error or try the PDF.js method as backup.
            // For now, let's log/throw to let user know GS is missing.
            return response("Error: Ghostscript conversion failed. Please ensure Ghostscript (gswin64c) is installed and in your PATH. Command: $cmd", 500);
        }

        // Read the Generated Image
        $imageContent = file_get_contents($outputImage);
        $base64Image = base64_encode($imageContent);

        // Cleanup temp file
        @unlink($outputImage);

        // Build a clean field-name → user-value map for the print template.
        // We skip meta keys so that only actual form field values are passed.
        $skipKeys = ['fields', 'imageBase64', 'action', 'layout_overrides', '_token', 'type', 'case_id'];
        $fieldValues = array_diff_key($data, array_flip($skipKeys));

        // Render the print-friendly view with explicit variables.
        $html = view('documents.templates.print', [
            'type' => $type,
            'fields' => $fields,
            'data' => $fieldValues,        // name → value map
            'imageBase64' => $base64Image,
        ])->render();

        // Generate PDF using Browsershot
        try {
            $pdf = Browsershot::html($html)
                ->format('A4')
                ->margins(0, 0, 0, 0)
                // Lock viewport to exactly one A4 page (210mm × 297mm at 96 DPI ≈ 794×1123 px).
                // Without this, Chromium's default tall viewport generates a blank second page.
                ->windowSize(794, 1123)
                ->emulateMedia('print')  // Trigger @page { margin: 0 } CSS rules
                ->showBackground()
                ->setOption('displayHeaderFooter', false)
                ->setOption('printBackground', true)
                ->waitUntilNetworkIdle()
                ->timeout(120) // Extended timeout
                ->noSandbox() // Crucial for some environments
                ->ignoreHttpsErrors() // Ignore SSL issues
                ->setOption('args', ['--disable-web-security']) // Allow loading local resources if needed
                ->pdf();
        } catch (\Exception $e) {
            return response('PDF Generation Error: ' . $e->getMessage(), 500);
        }

        $filename = "{$type}_" . date('Ymd_His') . '.pdf';
        $disposition = $request->input('action') === 'preview' ? 'inline' : 'attachment';

        // Always save a Document record so it appears in the Documents list
        try {
            $caseId = $request->input('case_id') ?: null;

            // Only persist the user-filled field values — NOT the layout or the base64 image
            // (imageBase64 alone can be hundreds of KB and breaks SQLite inserts silently)
            $skipKeys = ['fields', 'imageBase64', 'action', 'layout_overrides', '_token'];
            $contentToSave = array_diff_key($data, array_flip($skipKeys));

            \App\Models\Document::create([
                'case_id' => $caseId,
                'type' => $type,
                'content' => $contentToSave,
                'status' => 'Issued',
                'issued_at' => now(),
                'created_by' => auth()->id(),
            ]);

            $auditDetail = $caseId
                ? "Generated {$type} for Case #{$caseId}"
                : "Generated standalone {$type}";
            AuditService::log('CREATE', 'Documents', $auditDetail, $caseId);

            // Sync Parties back to parent Case if we have one
            if ($caseId) {
                $case = \App\Models\LuponCase::find($caseId);
                if ($case) {
                    $updated = false;
                    if (!empty($data['complainant'])) {
                        $case->complainant = $data['complainant'];
                        $updated = true;
                    }
                    if (!empty($data['respondent'])) {
                        $case->respondent = $data['respondent'];
                        $updated = true;
                    }
                    if ($updated) {
                        $comp = $case->complainant ?? 'Unknown';
                        $resp = $case->respondent ?? 'Unknown';
                        $case->title = "$comp vs $resp";
                        $case->save();
                    }
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to save document record: ' . $e->getMessage());
            // Don't block the PDF download if DB save fails
        }

        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "{$disposition}; filename=\"{$filename}\"");
    }

    /**
     * Save calibrated field layout positions for a given document type.
     * Called from the form-fill calibration panel via AJAX.
     */
    public function saveLayout(Request $request)
    {
        try {
            $type = $request->input('document_type');
            $positions = $request->input('positions'); // array: name → {x, y, w, h}

            if (!$type || !is_array($positions)) {
                return response()->json(['error' => 'Invalid data'], 422);
            }

            if (str_starts_with($type, 'custom_')) {
                $id = str_replace('custom_', '', $type);
                $template = \App\Models\Document::findOrFail($id);
                $content = $template->content;
                $fields = $content['fields'] ?? [];

                foreach ($fields as &$field) {
                    if (isset($positions[$field['name']])) {
                        $pos = $positions[$field['name']];
                        $field['x'] = $pos['x'];
                        $field['y'] = $pos['y'];
                        $field['w'] = $pos['w'] ?? ($field['w'] ?? '30%');
                        $field['h'] = $pos['h'] ?? ($field['h'] ?? 'auto');
                    }
                }
                unset($field);

                $content['fields'] = $fields;
                $template->update(['content' => $content]);

                return response()->json(['success' => true, 'message' => 'Custom layout saved!']);
            }

            // Merge incoming positions onto the base config layout
            $baseFields = FormLayouts::getLayout($type);
            $fieldMap = [];
            foreach ($baseFields as $i => $f) {
                $fieldMap[$f['name']] = $i;
            }

            foreach ($positions as $name => $pos) {
                if (isset($fieldMap[$name])) {
                    $idx = $fieldMap[$name];
                    $baseFields[$idx]['x'] = $pos['x'];
                    $baseFields[$idx]['y'] = $pos['y'];
                    $baseFields[$idx]['w'] = $pos['w'] ?? $baseFields[$idx]['w'];
                    $baseFields[$idx]['h'] = $pos['h'] ?? $baseFields[$idx]['h'];
                }
            }

            // Upsert into DB
            FormLayout::updateOrCreate(
                ['document_type' => $type],
                ['layout_json' => $baseFields]
            );

            return response()->json(['success' => true, 'message' => 'Layout saved!']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('saveLayout Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'A database error occurred saving the layout. Details: ' . $e->getMessage()], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    /**
     * Use Ghostscript to render page 1 of the form PDF as a base64 PNG.
     * Returns empty string if GS fails (view shows placeholder instead).
     */
    private function generateBackgroundImage(string $type, $customPath = null): string
    {
        $pdfPath = $customPath ?? public_path("forms/{$type}.pdf");
        if (!file_exists($pdfPath)) {
            $pdfPath = public_path('forms/complaint.pdf');
        }

        $outputImage = storage_path('app/public/temp_editor_' . $type . '_' . uniqid() . '.png');
        $gsPath = '"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"';
        $cmd = "{$gsPath} -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r300 -dFirstPage=1 -dLastPage=1"
            . " -sOutputFile=\"{$outputImage}\" \"{$pdfPath}\" 2>&1";

        exec($cmd, $output, $returnCode);

        if ($returnCode === 0 && file_exists($outputImage)) {
            $base64 = base64_encode(file_get_contents($outputImage));
            @unlink($outputImage);

            return $base64;
        }

        \Illuminate\Support\Facades\Log::error('Ghostscript failed for ' . $type . ': ' . implode("\n", $output));

        return '';
    }

    /**
     * Generate a Word (.docx) document from submitted form data.
     */
    public function generateWord(Request $request)
    {
        $type = $request->input('type', 'complaint');
        $fields = FormLayouts::getLayout($type);

        // Only keep actual form field values
        $skipKeys = ['fields', 'imageBase64', 'action', 'layout_overrides', '_token', 'type', 'case_id'];
        $fieldValues = array_diff_key($request->all(), array_flip($skipKeys));

        // Build field name → label map
        $labelMap = [];
        foreach ($fields as $field) {
            $name = $field['name'] ?? '';
            $label = $field['label'] ?? '';
            if ($name && !isset($labelMap[$name])) {
                $labelMap[$name] = $label ?: ucwords(str_replace('_', ' ', $name));
            }
        }

        $formTitle = ucwords(str_replace('_', ' ', $type));
        $filename = $formTitle . '.docx';

        // ── Create PhpWord document ──────────────────────────────────────────
        $phpWord = new PhpWord;
        $phpWord->setDefaultFontName('Calibri');
        $phpWord->setDefaultFontSize(12);

        // A4 page, narrow margins (TWIPs: 1440 = 1 inch)
        $section = $phpWord->addSection([
            'paperSize' => 'A4',
            'marginTop' => 1080,
            'marginBottom' => 1080,
            'marginLeft' => 1080,
            'marginRight' => 1080,
        ]);

        // ── Document heading ─────────────────────────────────────────────────
        $section->addText(
            'Republic of the Philippines',
            ['size' => 10, 'name' => 'Cambria'],
            ['alignment' => 'center']
        );
        $section->addText(
            'Lupong Tagapamayapa',
            ['bold' => true, 'size' => 11, 'name' => 'Cambria'],
            ['alignment' => 'center']
        );
        $section->addTextBreak(1);
        $section->addText(
            strtoupper($formTitle),
            ['bold' => true, 'size' => 14, 'name' => 'Cambria', 'color' => '000000'],
            ['alignment' => 'center', 'spaceAfter' => 200]
        );
        $section->addTextBreak(1);

        // ── Field rows ───────────────────────────────────────────────────────
        $footerNames = ['made_this_1', 'made_this_2', 'made_this_3', 'made_this_day', 'made_this_month', 'year', 'notary'];
        $mainFields = [];
        $footerFields = [];

        foreach ($fields as $field) {
            $name = $field['name'] ?? '';
            if (!$name) {
                continue;
            }
            in_array($name, $footerNames) ? ($footerFields[] = $field) : ($mainFields[] = $field);
        }

        $tableStyle = [
            'borderSize' => 0,
            'cellMargin' => 100,
            'width' => 5000,
            'unit' => TblWidth::PERCENT,
        ];

        $table = $section->addTable($tableStyle);

        foreach ($mainFields as $field) {
            $name = $field['name'] ?? '';
            $isTextarea = isset($field['type']) && $field['type'] === 'textarea';
            $isCheckbox = isset($field['type']) && $field['type'] === 'checkbox';
            $value = $fieldValues[$name] ?? '';
            $label = $labelMap[$name] ?? ucwords(str_replace('_', ' ', $name));

            if (trim((string) $value) === '') {
                continue;
            }

            // Label row
            $table->addRow();
            $labelCell = $table->addCell(9000, ['borderSize' => 0]);
            $labelCell->addText(
                $label . ':',
                ['bold' => true, 'size' => 10, 'name' => 'Times New Roman', 'color' => '333333'],
                ['spaceAfter' => 0]
            );

            // Value row with bottom border
            $table->addRow();
            $valueCell = $table->addCell(9000, [
                'borderSize' => 0,
                'borderBottomSize' => 8,
                'borderBottomColor' => '000000',
                'borderBottomSpace' => 0,
            ]);

            if ($isCheckbox) {
                $checked = ($value === 'X' || $value == 1);
                $valueCell->addText(
                    ($checked ? '☑' : '☐') . '  ' . $label,
                    ['size' => 12, 'name' => 'Times New Roman', 'color' => '000000'],
                    ['spaceAfter' => 0]
                );
            } else {
                $lines = explode("\n", str_replace("\r\n", "\n", (string) $value));
                foreach ($lines as $i => $line) {
                    $valueCell->addText(
                        htmlspecialchars(trim($line)),
                        ['size' => 12, 'name' => 'Calibri', 'color' => '000000'],
                        ['spaceAfter' => 0]
                    );
                }
            }

            // Spacer row
            $table->addRow();
            $table->addCell(9000, ['borderSize' => 0])->addText('');
        }

        // ── Certification / Execution details ─────────────────────────────────
        if (!empty($footerFields)) {
            $section->addTextBreak(1);
            $section->addText(
                'Done this ___ day of _______________, 20___',
                ['size' => 11, 'name' => 'Times New Roman', 'italic' => true],
                ['alignment' => 'center']
            );

            foreach ($footerFields as $field) {
                $name = $field['name'] ?? '';
                $value = $fieldValues[$name] ?? '';
                $label = $labelMap[$name] ?? ucwords(str_replace('_', ' ', $name));
                if (trim((string) $value) === '') {
                    continue;
                }
                $section->addText(
                    $label . ': ' . $value,
                    ['size' => 11, 'name' => 'Times New Roman'],
                    ['alignment' => 'center']
                );
            }
        }

        // ── Signature block ──────────────────────────────────────────────────
        $section->addTextBreak(2);
        $sigTable = $section->addTable(['borderSize' => 0, 'cellMargin' => 80]);
        $sigTable->addRow();

        $sigLeft = $sigTable->addCell(4320, ['borderSize' => 0]);
        $sigLeft->addText('____________________________', ['size' => 11], ['alignment' => 'center']);
        $sigLeft->addText('Complainant Signature', ['size' => 9, 'italic' => true], ['alignment' => 'center']);

        $sigTable->addCell(720, ['borderSize' => 0])->addText('');

        $sigRight = $sigTable->addCell(4320, ['borderSize' => 0]);
        $sigRight->addText('____________________________', ['size' => 11], ['alignment' => 'center']);
        $sigRight->addText('Respondent Signature', ['size' => 9, 'italic' => true], ['alignment' => 'center']);

        $section->addTextBreak(1);
        $section->addText(
            'ATTEST: Punong Barangay / Lupon Chairman',
            ['size' => 10, 'name' => 'Times New Roman', 'italic' => true, 'color' => '555555'],
            ['alignment' => 'center']
        );

        // ── Save to temp and stream ──────────────────────────────────────────
        $tmpPath = storage_path('app/public/word_' . uniqid() . '.docx');
        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tmpPath);

        // Record the document in the DB
        try {
            \App\Models\Document::create([
                'case_id' => $request->input('case_id') ?: null,
                'type' => $type,
                'content' => $fieldValues,
                'status' => 'Issued',
                'issued_at' => now(),
                'created_by' => auth()->id(),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Word doc DB save failed: ' . $e->getMessage());
        }

        return response()->download($tmpPath, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ])->deleteFileAfterSend(true);
    }

    // ── Upload an existing file and save as a Document record ─────────────────
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:20480|mimes:pdf,doc,docx,png,jpg,jpeg',
        ]);

        $file = $request->file('file');
        $origName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $ext = $file->getClientOriginalExtension();
        $path = $file->store('documents/uploads', 'public');

        $document = \App\Models\Document::create([
            'type' => 'upload',
            'status' => 'Draft',
            'file_path' => $path,
            'content' => ['original_name' => $file->getClientOriginalName(), 'extension' => $ext],
            'issued_at' => now(),
            'created_by' => auth()->id(),
        ]);

        try {
            app(\App\Services\AuditService::class)->log(
                'document_uploaded',
                "Uploaded document: {$file->getClientOriginalName()}",
                $document
            );
        } catch (\Exception $e) {
        }

        return redirect()->route('documents.index')
            ->with('success', 'Document uploaded successfully.');
    }

    // ── Save a GForms-style custom answer sheet ───────────────────────────────
    public function createForm(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'fields' => 'required|string', // JSON string
            'type' => 'nullable|string',
        ]);

        $fields = json_decode($request->input('fields'), true) ?? [];

        $document = \App\Models\Document::create([
            'type' => 'custom_form',
            'status' => 'Draft',
            'content' => [
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'fields' => $fields,
                'form_type' => 'answer_sheet',
            ],
            'issued_at' => now(),
            'created_by' => auth()->id(),
        ]);

        try {
            app(\App\Services\AuditService::class)->log(
                'custom_form_created',
                "Created answer sheet: {$request->input('title')}",
                $document
            );
        } catch (\Exception $e) {
        }

        return redirect()->route('documents.index')
            ->with('success', 'Answer sheet created successfully.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Add Document — dedicated page + submission
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /documents/new
     * Renders the React page for creating a custom uploaded document.
     */
    public function newDocument()
    {
        return \Inertia\Inertia::render('documents/new');
    }

    /**
     * POST /documents/store-custom
     * Saves an uploaded PDF + custom question schema as a Document record.
     */
    public function storeCustom(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'pdf' => 'nullable|file|mimes:pdf|max:20480',
            'fields' => 'nullable|string',
        ]);

        $filePath = null;
        if ($request->hasFile('pdf')) {
            $filePath = $request->file('pdf')
                ->store('documents/custom', 'public');
        }

        $fields = json_decode($request->input('fields', '[]'), true) ?? [];

        // Fallback: If no fields were defined, automatically add the most common Lupon fields
        if (empty($fields)) {
            $fields = [
                ['id' => 'case_no', 'type' => 'text', 'label' => 'Case Number', 'required' => true],
                ['id' => 'complainant', 'type' => 'text', 'label' => 'Complainant Name', 'required' => true],
                ['id' => 'respondent', 'type' => 'text', 'label' => 'Respondent Name', 'required' => true],
                ['id' => 'For', 'type' => 'text', 'label' => 'Nature of Case', 'required' => true],
                ['id' => 'hearing_info', 'type' => 'text', 'label' => 'Hearing Date/Time', 'required' => false],
                ['id' => 'made_this_day', 'type' => 'text', 'label' => 'Day', 'required' => false],
                ['id' => 'made_this_month', 'type' => 'text', 'label' => 'Month', 'required' => false],
                ['id' => 'made_this_year', 'type' => 'text', 'label' => 'Year', 'required' => false],
                ['id' => 'witness', 'type' => 'text', 'label' => 'Witness Name', 'required' => false],
                ['id' => 'signature', 'type' => 'text', 'label' => 'Signature Line', 'required' => false],
            ];
        }

        $document = \App\Models\Document::create([
            'type' => 'custom_form',
            'status' => 'Draft',
            'created_by' => auth()->id(),
            'file_path' => $filePath,
            'content' => [
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'fields' => $fields,
            ],
        ]);

        try {
            app(\App\Services\AuditService::class)->log(
                'custom_form_created',
                "Uploaded document: {$request->input('title')}",
                $document
            );
        } catch (\Exception $e) {
        }

        return redirect()->route('documents.index')
            ->with('success', "Document '{$request->input('title')}' saved successfully.");
    }

    /**
     * GET /documents/edit-standard/{type}
     * Loads a standard template's fields into the form builder for customization.
     */
    public function editStandardTemplate($type)
    {
        // Get standard fields from config
        $standardFields = \App\Config\FormLayouts::getLayout($type);

        // Map to builder format
        $fields = array_map(function ($f) {
            return [
                'id' => $f['name'] ?? uniqid(),
                'type' => $f['type'] ?? 'text',
                'label' => $f['label'] ?? ucwords(str_replace(['_', '-'], ' ', $f['name'] ?? '')),
                'placeholder' => $f['placeholder'] ?? '',
                'required' => true,
            ];
        }, $standardFields);

        // Pre-fill metadata based on type
        $title = ucwords(str_replace(['_', '-'], ' ', $type));

        return \Inertia\Inertia::render('documents/new', [
            'existingTemplate' => [
                'id' => 0, // Flag for "new from standard"
                'title' => $title,
                'description' => "Customized version of {$title}",
                'fields' => $fields,
                'file_path' => null,
            ],
        ]);
    }

    /**
     * GET /documents/edit-template/{id}
     * Renders the React page for editing an existing custom template.
     */
    public function editTemplate($id)
    {
        $document = \App\Models\Document::findOrFail($id);

        return \Inertia\Inertia::render('documents/new', [
            'existingTemplate' => [
                'id' => $document->id,
                'title' => $document->content['title'] ?? '',
                'description' => $document->content['description'] ?? '',
                'fields' => $document->content['fields'] ?? [],
                'file_path' => $document->file_path,
            ],
        ]);
    }

    /**
     * POST /documents/update-custom/{id}
     * Updates an existing Document record's questions/schema.
     */
    public function updateCustom($id, Request $request)
    {
        $document = \App\Models\Document::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'pdf' => 'nullable|file|mimes:pdf|max:20480',
            'fields' => 'nullable|string',
        ]);

        $fields = json_decode($request->input('fields', '[]'), true) ?? [];

        $data = $document->content ?? [];
        $data['title'] = $request->input('title');
        $data['description'] = $request->input('description');
        $data['fields'] = $fields;

        $updatePayload = [
            'content' => $data,
        ];

        if ($request->hasFile('pdf')) {
            // Delete old file if exists
            if ($document->file_path && \Storage::disk('public')->exists($document->file_path)) {
                \Storage::disk('public')->delete($document->file_path);
            }
            $updatePayload['file_path'] = $request->file('pdf')->store('documents/custom', 'public');
        }

        $document->update($updatePayload);

        try {
            app(\App\Services\AuditService::class)->log(
                'custom_form_updated',
                "Updated template: {$request->input('title')}",
                $document
            );
        } catch (\Exception $e) {
        }

        return redirect()->route('documents.index')
            ->with('success', "Template '{$request->input('title')}' updated successfully.");
    }

    public function destroy($id)
    {
        // Handle hiding "official" templates (id=0)
        if ($id == 0 && request()->has('document_type')) {
            $type = request('document_type');

            \App\Models\FormLayout::updateOrCreate(
                ['document_type' => $type],
                ['is_hidden' => true]
            );

            return redirect()->route('documents.index')->with('success', 'Template removed from view.');
        }

        $document = \App\Models\Document::findOrFail($id);

        // Delete the file if it exists
        if ($document->file_path && \Storage::disk('public')->exists($document->file_path)) {
            \Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()->route('documents.index')->with('success', 'Document deleted successfully.');
    }
}
