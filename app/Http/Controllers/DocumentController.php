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
    public function index(Request $request)
    {
        try {
            // ... Logic for filtering (already has a query)
            $query = \App\Models\Document::with(['case', 'creator']);

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('type', 'like', "%{$search}%")
                      ->orWhereHas('case', function ($case) use ($search) {
                          $case->where('case_number', 'like', "%{$search}%")
                               ->orWhere('title', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->filled('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            $documents = $query->latest()->limit(15)->get()->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'type' => $doc->type,
                    'status' => $doc->status,
                    'date' => $doc->created_at ? $doc->created_at->toIso8601String() : null,
                    'case_id' => $doc->case_id,
                    'case_number' => $doc->case ? $doc->case->case_number : null,
                    'creator' => $doc->creator ? ['name' => $doc->creator->name] : null,
                ];
            });

            // Document Statistics...
            $allDocs = \App\Models\Document::selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray();

            // Fetch hidden templates
            $hiddenTemplates = \App\Models\FormLayout::where('is_hidden', true)
                ->pluck('document_type')
                ->toArray();

            $customCount = \App\Models\Document::where('type', 'custom_form')->count();
            $standardCount = 14; // Matches TEMPLATES array in index.tsx
            
            $stats = [
                'total' => ($standardCount - count($hiddenTemplates)) + $customCount,
                'summons' => \App\Models\Document::whereNotNull('case_id')
                    ->whereIn('type', ['summons', 'summons_respondent', 'summons_witness', 'notice_to_appear'])
                    ->count(),
                'settlements' => \App\Models\Document::whereNotNull('case_id')
                    ->whereIn('type', ['amicable_settlement', 'arbitration_agreement', 'arbitration_award', 'katunayan_pagkakasundo'])
                    ->count(),
                'recent' => \App\Models\Document::whereNotNull('case_id')->count(),
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
                        'icon_name' => $doc->content['icon_name'] ?? 'FileSignature',
                        'is_view_only' => $doc->content['is_view_only'] ?? false,
                        'file_path' => $doc->file_path,
                        'content' => $doc->content,
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
            \Log::error('Documents listing failed: ' . $e->getMessage());
            
            return \Inertia\Inertia::render('documents/index', [
                'documents' => [],
                'stats' => [
                    'total' => 0,
                    'summons' => 0,
                    'amicable_settlement' => 0,
                    'certificates' => 0,
                    'notices' => 0,
                    'others' => 0,
                ],
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
            // Merge in any footer fields missing from the saved layout (e.g. new date_split field)
            $freshFields = FormLayouts::getLayout($type);
            $savedNames = array_column($fields, 'name');
            foreach ($freshFields as $ff) {
                if (!in_array($ff['name'], $savedNames)) {
                    $fields[] = $ff;
                }
            }
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
        $type = 'custom_'.$id;
        $caseId = request('case_id');
        $case = $caseId ? \App\Models\LuponCase::find($caseId) : null;

        // Custom fields from form builder
        $fields = $template->content['fields'] ?? [];

        // Ensure fields have default positions and 'name' if not set
        foreach ($fields as &$field) {
            // Map builder 'id' to 'name' for the visual editor
            if (! isset($field['name']) && isset($field['id'])) {
                $field['name'] = $field['id'];
            }
            if (! isset($field['x'])) {
                $field['x'] = '10%';
            }
            if (! isset($field['y'])) {
                $field['y'] = '10%';
            }
            if (! isset($field['w'])) {
                $field['w'] = '30%';
            }
            if (! isset($field['h'])) {
                $field['h'] = 'auto';
            }
        }
        unset($field);

        // Generate background from uploaded PDF
        $imageBase64 = $this->generateBackgroundImage($type, storage_path('app/public/'.$template->file_path));

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

        // I-log sa Audit Trail kapag binuksan ang dokumento
        \App\Services\AuditService::log(
            'READ', 
            'Documents', 
            "Viewed Document ({$type})" . ($case ? " for Case #{$case->case_number}" : ""), 
            $document->id
        );

        // Get Layout
        $savedLayout = FormLayout::where('document_type', $type)->first();
        if ($savedLayout) {
            $fields = $savedLayout->layout_json;
            // Merge any missing footer fields (e.g. new date_split)
            $freshFields = FormLayouts::getLayout($type);
            $savedNames = array_column($fields, 'name');
            foreach ($freshFields as $ff) {
                if (!in_array($ff['name'], $savedNames)) {
                    $fields[] = $ff;
                }
            }
        } else {
            $fields = FormLayouts::getLayout($type);
        }

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

        // I-log sa Audit Trail kapag binuksan ang detalye/dokumento ng kaso
        \App\Services\AuditService::log(
            'READ', 
            'Cases', 
            "Viewed documents/details for Case #{$case->case_number}", 
            $case->case_number
        );

        // Get Layout
        $savedLayout = FormLayout::where('document_type', $type)->first();
        if ($savedLayout) {
            $fields = $savedLayout->layout_json;
            // Merge any missing footer fields (e.g. new date_split)
            $freshFields = FormLayouts::getLayout($type);
            $savedNames = array_column($fields, 'name');
            foreach ($freshFields as $ff) {
                if (!in_array($ff['name'], $savedNames)) {
                    $fields[] = $ff;
                }
            }
        } else {
            $fields = FormLayouts::getLayout($type);
        }

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
            $pdfPath = storage_path('app/public/'.$template->file_path);
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

        if ($request->input('action') === 'save_only') {
            try {
                $caseId = $request->input('case_id') ?: null;
                $skipKeys = ['fields', 'imageBase64', 'action', 'layout_overrides', '_token'];
                $contentToSave = array_diff_key($data, array_flip($skipKeys));

                // Dynamically create a case if one doesn't exist
                if (!$caseId) {
                    $caseNo = $contentToSave['case_no'] ?? ('CAS-' . date('YmdHis'));
                    
                    // Check if case already exists by number (even if soft-deleted)
                    $existingCase = \App\Models\LuponCase::withTrashed()->where('case_number', $caseNo)->first();
                    
                    if ($existingCase) {
                        $caseId = $existingCase->id;
                    } else {
                        $complainant = $contentToSave['complainant'] ?? 'Unknown Complainant';
                        $respondent = $contentToSave['respondent'] ?? 'Unknown Respondent';
                        
                        $case = \App\Models\LuponCase::create([
                            'case_number' => $caseNo,
                            'title' => $complainant . ' vs ' . $respondent,
                            'complainant' => $complainant,
                            'respondent' => $respondent,
                            'nature_of_case' => $contentToSave['For'] ?? ucwords(str_replace(['_', '-'], ' ', $type)),
                            'status' => 'Pending',
                            'date_filed' => now(),
                            'complaint_narrative' => $contentToSave['narrative'] ?? '',
                            'admin_notes' => 'Auto-generated from Document',
                            'document_data' => $contentToSave,
                            'created_by' => auth()->id(),
                        ]);
                        $caseId = $case->id;
                        AuditService::log('CREATE', 'Cases', "Auto-created Case #{$case->case_number} from {$type}", $caseNo);
                    }
                }

                \App\Models\Document::create([
                    'case_id' => $caseId,
                    'type' => $type,
                    'content' => $contentToSave,
                    'status' => 'Issued',
                    'issued_at' => now(),
                    'created_by' => auth()->id(),
                ]);

                AuditService::log('CREATE', 'Documents', "Saved {$type} for Case #{$caseId}", $caseId);

                // Sync Parties and Data back to parent Case if we have one
                $case = \App\Models\LuponCase::withTrashed()->find($caseId);
                if ($case) {
                    $updated = false;
                    
                    // Always restore if it was archived
                    if ($case->trashed()) {
                        $case->restore();
                        $updated = true;
                    }

                    if (! empty($data['complainant'])) {
                        $case->complainant = $data['complainant'];
                        $updated = true;
                    }
                    if (! empty($data['respondent'])) {
                        $case->respondent = $data['respondent'];
                        $updated = true;
                    }
                    
                    // Sync the full document data to the case for global functions
                    $case->document_data = $contentToSave;
                    $updated = true;

                    if ($updated) {
                        $comp = $case->complainant ?? 'Unknown';
                        $resp = $case->respondent ?? 'Unknown';
                        $case->title = "$comp vs $resp";
                        $case->save();
                    }
                }

                return response()->json(['success' => true, 'message' => 'Document saved successfully!']);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to save document record: '.$e->getMessage());
                return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
            }
        }


        if (! file_exists($pdfPath)) {
            $pdfPath = public_path('forms/complaint.pdf');
        }

        // Output path for the generated image
        // We use a temporary file or a specific path in storage
        $outputImage = storage_path("app/public/temp_{$type}_".uniqid().'.png');

        // Ghostscript Command - Absolute Path
        // Version 10.06.0 detected
        $gsPath = '"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"';
        // On Windows cmd.exe, if the first token is quoted, we might need extra care.
        // We add "2>&1" to capture stderr in output for debugging.
        $cmd = "{$gsPath} -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r300 -dFirstPage=1 -dLastPage=1 -sOutputFile=\"{$outputImage}\" \"{$pdfPath}\" 2>&1";

        // Execute command
        exec($cmd, $output, $returnCode);

        if ($returnCode !== 0 || ! file_exists($outputImage)) {
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
            return response('PDF Generation Error: '.$e->getMessage(), 500);
        }

        $filename = "{$type}_".date('Ymd_His').'.pdf';
        $disposition = $request->input('action') === 'preview' ? 'inline' : 'attachment';

        // Always save a Document record so it appears in the Documents list
        try {
            $caseId = $request->input('case_id') ?: null;

            // Only persist the user-filled field values — NOT the layout or the base64 image
            // (imageBase64 alone can be hundreds of KB and breaks SQLite inserts silently)
            $skipKeys = ['fields', 'imageBase64', 'action', 'layout_overrides', '_token'];
            $contentToSave = array_diff_key($data, array_flip($skipKeys));

            // Dynamically create a case if one doesn't exist
            if (!$caseId) {
                $caseNo = $contentToSave['case_no'] ?? ('CAS-' . date('YmdHis'));
                
                // Check if case already exists by number (even if soft-deleted)
                $existingCase = \App\Models\LuponCase::withTrashed()->where('case_number', $caseNo)->first();
                
                if ($existingCase) {
                    $caseId = $existingCase->id;
                } else {
                    $complainant = $contentToSave['complainant'] ?? 'Unknown Complainant';
                    $respondent = $contentToSave['respondent'] ?? 'Unknown Respondent';
                    
                    $case = \App\Models\LuponCase::create([
                        'case_number' => $caseNo,
                        'title' => $complainant . ' vs ' . $respondent,
                        'complainant' => $complainant,
                        'respondent' => $respondent,
                        'nature_of_case' => $contentToSave['For'] ?? ucwords(str_replace(['_', '-'], ' ', $type)),
                        'status' => 'Pending',
                        'date_filed' => now(),
                        'complaint_narrative' => $contentToSave['narrative'] ?? '',
                        'admin_notes' => 'Auto-generated from Document',
                        'document_data' => $contentToSave,
                        'created_by' => auth()->id(),
                    ]);
                    $caseId = $case->id;
                    AuditService::log('CREATE', 'Cases', "Auto-created Case #{$case->case_number} from {$type}", $caseNo);
                }
            }

            \App\Models\Document::create([
                'case_id' => $caseId,
                'type' => $type,
                'content' => $contentToSave,
                'status' => 'Issued',
                'issued_at' => now(),
                'created_by' => auth()->id(),
            ]);

            $auditDetail = "Generated {$type} for Case #{$caseId}";
            AuditService::log('CREATE', 'Documents', $auditDetail, $caseId);

            // Sync Parties and Data back to parent Case if we have one
            if ($caseId) {
                $case = \App\Models\LuponCase::withTrashed()->find($caseId);
                if ($case) {
                    $updated = false;

                    // Always restore if it was archived
                    if ($case->trashed()) {
                        $case->restore();
                        $updated = true;
                    }

                    if (! empty($data['complainant'])) {
                        $case->complainant = $data['complainant'];
                        $updated = true;
                    }
                    if (! empty($data['respondent'])) {
                        $case->respondent = $data['respondent'];
                        $updated = true;
                    }

                    // Sync the full document data to the case for global functions
                    $case->document_data = $contentToSave;
                    $updated = true;

                    if ($updated) {
                        $comp = $case->complainant ?? 'Unknown';
                        $resp = $case->respondent ?? 'Unknown';
                        $case->title = "$comp vs $resp";
                        $case->save();
                    }
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to save document record: '.$e->getMessage());
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
        $type = $request->input('document_type');
        $positions = $request->input('positions'); // array: name → {x, y, w, h}
        $content = $request->input('content');
        $caseId = $request->input('case_id') ?: null;

        if (! $type || ! is_array($positions)) {
            return response()->json(['error' => 'Invalid data'], 422);
        }

        // Save a record of the entered text as well so it appears as a Document
        if (is_array($content)) {
            \App\Models\Document::create([
                'case_id' => $caseId,
                'type' => $type,
                'content' => $content,
                'status' => 'Draft',
                'issued_at' => now(),
                'created_by' => auth()->id(),
            ]);
            
            \App\Services\AuditService::log('CREATE', 'Documents', "Saved draft & layout for {$type}", $caseId);
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
        if (! file_exists($pdfPath)) {
            $pdfPath = public_path('forms/complaint.pdf');
        }

        $outputImage = storage_path('app/public/temp_editor_'.$type.'_'.uniqid().'.png');
        $gsPath = '"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"';
        $cmd = "{$gsPath} -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r300 -dFirstPage=1 -dLastPage=1"
                     ." -sOutputFile=\"{$outputImage}\" \"{$pdfPath}\" 2>&1";

        exec($cmd, $output, $returnCode);

        if ($returnCode === 0 && file_exists($outputImage)) {
            $base64 = base64_encode(file_get_contents($outputImage));
            @unlink($outputImage);

            return $base64;
        }

        \Illuminate\Support\Facades\Log::error('Ghostscript failed for '.$type.': '.implode("\n", $output));

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
            if ($name && ! isset($labelMap[$name])) {
                $labelMap[$name] = $label ?: ucwords(str_replace('_', ' ', $name));
            }
        }

        $formTitle = ucwords(str_replace('_', ' ', $type));
        $filename = $formTitle.'.docx';

        // Check if we have a template for this type
        $templatePath = public_path("forms/{$type}.docx");
        $tmpPath = storage_path('app/public/word_'.uniqid().'.docx');

        if (file_exists($templatePath)) {
            // Use the uploaded Word document template from WORD NG LUPON
            $templateProcessor = new \PhpOffice\PhpWord\TemplateProcessor($templatePath);
            
            // Try to replace values formatted as placeholders (e.g. ${complainant})
            foreach ($fieldValues as $name => $value) {
                if (is_scalar($value)) {
                    $templateProcessor->setValue($name, htmlspecialchars((string) $value));
                }
            }
            
            // Also try replacing mapped names like Case Number if formatted that way
            foreach ($labelMap as $name => $label) {
                if (isset($fieldValues[$name]) && is_scalar($fieldValues[$name])) {
                    $templateProcessor->setValue($label, htmlspecialchars((string) $fieldValues[$name]));
                }
            }

            $templateProcessor->saveAs($tmpPath);
        } else {
            // Fallback: If no `.docx` template exists, generate a simple layout
            $phpWord = new PhpWord;
            $phpWord->setDefaultFontName('Calibri');
            $phpWord->setDefaultFontSize(12);

            $section = $phpWord->addSection([
                'paperSize' => 'A4', 'marginTop' => 1080, 'marginBottom' => 1080,
                'marginLeft' => 1080, 'marginRight' => 1080,
            ]);

            $section->addText(strtoupper($formTitle), ['bold' => true, 'size' => 14], ['alignment' => 'center', 'spaceAfter' => 200]);
            
            $table = $section->addTable(['borderSize' => 0, 'cellMargin' => 100, 'width' => 5000, 'unit' => TblWidth::PERCENT]);

            foreach ($fields as $field) {
                $name = $field['name'] ?? '';
                $value = $fieldValues[$name] ?? '';
                $label = $labelMap[$name] ?? ucwords(str_replace('_', ' ', $name));

                if (trim((string) $value) === '') continue;

                $table->addRow();
                $table->addCell(9000, ['borderSize' => 0])->addText($label.':', ['bold' => true, 'size' => 10]);
                $table->addRow();
                $valueCell = $table->addCell(9000, ['borderBottomSize' => 8]);
                $valueCell->addText(htmlspecialchars((string) $value), ['size' => 12]);
                $table->addRow();
                $table->addCell(9000, ['borderSize' => 0])->addText('');
            }

            $writer = IOFactory::createWriter($phpWord, 'Word2007');
            $writer->save($tmpPath);
        }

        // Record the document in the DB
        try {
            $caseId = $request->input('case_id') ?: null;

            if (!$caseId) {
                // Try to infer case details from document
                $caseNo = $fieldValues['case_no'] ?? ('CAS-' . date('YmdHis'));
                
                // Check if case already exists by number
                $existingCase = \App\Models\LuponCase::where('case_number', $caseNo)->first();
                
                if ($existingCase) {
                    $caseId = $existingCase->id;
                } else {
                    $complainant = $fieldValues['complainant'] ?? 'Unknown Complainant';
                    $respondent = $fieldValues['respondent'] ?? 'Unknown Respondent';
                    
                    $case = \App\Models\LuponCase::create([
                        'case_number' => $caseNo,
                        'title' => $complainant . ' vs ' . $respondent,
                        'complainant' => $complainant,
                        'respondent' => $respondent,
                        'nature_of_case' => $fieldValues['For'] ?? ucwords(str_replace(['_', '-'], ' ', $type)),
                        'status' => 'Pending',
                        'date_filed' => now(),
                        'complaint_narrative' => $fieldValues['narrative'] ?? '',
                        'admin_notes' => 'Auto-generated from Word Document',
                        'document_data' => $fieldValues,
                        'created_by' => auth()->id(),
                    ]);
                    $caseId = $case->id;
                    \App\Services\AuditService::log('CREATE', 'Cases', "Auto-created Case #{$case->case_number} from Word Document", $caseNo);
                }
            }

            \App\Models\Document::create([
                'case_id' => $caseId,
                'type' => $type,
                'content' => $fieldValues,
                'status' => 'Issued',
                'issued_at' => now(),
                'created_by' => auth()->id(),
            ]);

            // Sync Case Data
            $case = \App\Models\LuponCase::withTrashed()->find($caseId);
            if ($case) {
                if ($case->trashed()) $case->restore();
                $case->document_data = $fieldValues;
                $case->save();
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Word doc DB save failed: '.$e->getMessage());
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
    public function storeForm(Request $request)
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
            'icon_name' => 'nullable|string',
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
                ['id' => 'case_no',        'type' => 'text', 'label' => 'Case Number',       'required' => true],
                ['id' => 'complainant',    'type' => 'text', 'label' => 'Complainant Name',   'required' => true],
                ['id' => 'respondent',     'type' => 'text', 'label' => 'Respondent Name',    'required' => true],
                ['id' => 'For',            'type' => 'text', 'label' => 'Nature of Case',    'required' => true],
                ['id' => 'hearing_info',   'type' => 'text', 'label' => 'Hearing Date/Time', 'required' => false],
                ['id' => 'made_this_day',  'type' => 'text', 'label' => 'Day',        'required' => false],
                ['id' => 'made_this_month', 'type' => 'text', 'label' => 'Month',      'required' => false],
                ['id' => 'made_this_year',  'type' => 'text', 'label' => 'Year',       'required' => false],
                ['id' => 'witness',        'type' => 'text', 'label' => 'Witness Name',      'required' => false],
                ['id' => 'signature',      'type' => 'text', 'label' => 'Signature Line',    'required' => false],
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
                'icon_name' => $request->input('icon_name', 'FileSignature'),
                'is_view_only' => $request->boolean('is_view_only'),
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
        $isViewOnly = in_array($type, ['complaint', 'affidavit_withdrawal']);

        return \Inertia\Inertia::render('documents/new', [
            'existingTemplate' => [
                'id' => 0, // Flag for "new from standard"
                'title' => $title,
                'description' => "Customized version of {$title}",
                'fields' => $fields,
                'file_path' => null,
                'icon_name' => 'FileSignature',
                'is_view_only' => $isViewOnly,
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
                'icon_name' => $document->content['icon_name'] ?? 'FileSignature',
                'is_view_only' => $document->content['is_view_only'] ?? false,
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
            'icon_name' => 'nullable|string',
        ]);

        $fields = json_decode($request->input('fields', '[]'), true) ?? [];

        $data = $document->content ?? [];
        $data['title'] = $request->input('title');
        $data['description'] = $request->input('description');
        $data['fields'] = $fields;
        $data['icon_name'] = $request->input('icon_name', 'FileSignature');
        $data['is_view_only'] = $request->boolean('is_view_only');

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
