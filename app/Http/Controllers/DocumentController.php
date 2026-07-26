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
    public function folders(Request $request)
    {
        try {
            $caseFolders = \App\Models\LuponCase::with(['documents.creator', 'creator'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($case) {
                    $folderName = $case->folder_name ?: ('case-' . str_pad($case->id, 3, '0', STR_PAD_LEFT));
                    return [
                        'id' => $case->id,
                        'case_number' => $case->case_number,
                        'folder_name' => $folderName,
                        'complainant' => $case->complainant,
                        'respondent' => $case->respondent,
                        'nature_of_case' => $case->nature_of_case,
                        'status' => $case->status,
                        'date_filed' => $case->date_filed,
                        'documents' => $case->documents->map(function ($doc) {
                            return [
                                'id' => $doc->id,
                                'type' => $doc->type,
                                'file_path' => $doc->file_path,
                                'status' => $doc->status,
                                'created_at' => $doc->created_at ? $doc->created_at->format('M d, Y H:i') : null,
                                'creator' => $doc->creator ? ['name' => $doc->creator->name] : null,
                            ];
                        })->values(),
                    ];
                });

            return \Inertia\Inertia::render('documents/folders', [
                'caseFolders' => $caseFolders,
            ]);
        } catch (\Exception $e) {
            \Log::error('Documents folders view failed: ' . $e->getMessage());
            return \Inertia\Inertia::render('documents/folders', [
                'caseFolders' => [],
            ]);
        }
    }

    public function templates(Request $request)
    {
        try {
            $query = \App\Models\Document::with(['case', 'creator'])
                ->where(function ($q) {
                    $q->whereNull('content->is_scanned')
                      ->orWhere('content->is_scanned', false);
                });

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

            $hiddenTemplates = \App\Models\FormLayout::where('is_hidden', true)
                ->pluck('document_type')
                ->toArray();

            $customCount = \App\Models\Document::where('type', 'custom_form')->count();
            $standardCount = 14;

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

            return \Inertia\Inertia::render('documents/templates', [
                'documents' => $documents,
                'stats' => $stats,
                'customTemplates' => $customTemplates,
                'hiddenTemplates' => $hiddenTemplates,
            ]);
        } catch (\Exception $e) {
            \Log::error('Documents templates view failed: ' . $e->getMessage());
            return \Inertia\Inertia::render('documents/templates', [
                'documents' => [],
                'stats' => ['total' => 0, 'summons' => 0, 'settlements' => 0, 'recent' => 0],
                'customTemplates' => [],
                'hiddenTemplates' => [],
            ]);
        }
    }

    public function index(Request $request)
    {
        return redirect()->route('documents.folders');
    }

    public function createFolder(Request $request)
    {
        $request->validate([
            'folder_name' => 'required|string|max:255',
            'case_number' => 'nullable|string|max:255',
            'complainant' => 'nullable|string|max:255',
            'respondent' => 'nullable|string|max:255',
            'nature_of_case' => 'nullable|string|max:255',
        ]);

        $folderName = trim($request->folder_name);
        
        $case = \App\Models\LuponCase::where('folder_name', $folderName)->first();

        if (!$case) {
            $caseNo = $request->case_number ?: ('KP-' . date('Y') . '-' . rand(100, 999));
            $case = \App\Models\LuponCase::create([
                'folder_name' => $folderName,
                'case_number' => $caseNo,
                'title' => ($request->complainant ?: 'Complainant') . ' vs. ' . ($request->respondent ?: 'Respondent'),
                'nature_of_case' => $request->nature_of_case ?: 'Amicable Settlement / Civil',
                'complainant' => $request->complainant ?: 'Complainant',
                'respondent' => $request->respondent ?: 'Respondent',
                'status' => 'Pending',
                'date_filed' => now()->format('Y-m-d'),
                'created_by' => auth()->id(),
            ]);
        } else {
            if ($request->filled('complainant')) $case->complainant = $request->complainant;
            if ($request->filled('respondent')) $case->respondent = $request->respondent;
            if ($request->filled('nature_of_case')) $case->nature_of_case = $request->nature_of_case;
            $case->save();
        }

        AuditService::log('CREATE_CASE_FOLDER', 'Document Management', "Created case folder {$folderName}", $case->id);

        return redirect()->back()->with('success', "Case folder {$folderName} created successfully.");
    }

    public function uploadToFolder(Request $request)
    {
        $request->validate([
            'case_id' => 'required|exists:cases,id',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'document_type' => 'nullable|string',
        ]);

        $case = \App\Models\LuponCase::findOrFail($request->case_id);
        $file = $request->file('file');
        $path = $file->store('case_documents', 'public');

        $docType = $request->input('document_type', $file->getClientOriginalName());

        $document = \App\Models\Document::create([
            'case_id' => $case->id,
            'folder_name' => $case->folder_name ?: ('case-' . str_pad($case->id, 3, '0', STR_PAD_LEFT)),
            'type' => $docType,
            'file_path' => '/storage/' . $path,
            'status' => 'Uploaded',
            'issued_at' => now(),
            'created_by' => auth()->id(),
            'content' => [
                'original_name' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ],
        ]);

        AuditService::log('UPLOAD_DOCUMENT_TO_FOLDER', 'Document Management', "Uploaded document {$docType} into folder {$case->folder_name}", $case->id);

        return redirect()->back()->with('success', "Document uploaded into folder {$case->folder_name}.");
    }

    public function destroyFolder($id)
    {
        $case = \App\Models\LuponCase::find($id);
        if (!$case) {
            return redirect()->back()->with('error', 'Folder not found.');
        }

        $folderName = $case->folder_name ?: ('case-' . str_pad($case->id, 3, '0', STR_PAD_LEFT));

        // Purge or unlink document records associated with this folder
        \App\Models\Document::where('case_id', $case->id)
            ->orWhere('folder_name', $folderName)
            ->delete();

        // Delete case record
        $case->delete();

        AuditService::log('DELETE_CASE_FOLDER', 'Document Management', "Deleted case folder {$folderName} and purged attached documents", $case->id);

        return redirect()->back()->with('success', "Folder {$folderName} deleted successfully.");
    }

    public function create($type)
    {
        // Optional: pre-link to a case when opened via ?case_id=X
        $caseId = request('case_id');
        $case = $caseId ? \App\Models\LuponCase::find($caseId) : null;

        // Fetch case folders for "Select Target Folder" dropdown
        $caseFolders = \App\Models\LuponCase::orderBy('created_at', 'desc')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'folder_name' => $c->folder_name ?: ('case-' . str_pad($c->id, 3, '0', STR_PAD_LEFT)),
                'complainant' => $c->complainant,
                'respondent' => $c->respondent,
                'case_number' => $c->case_number,
            ];
        });

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

        return view('documents.form-fill', compact('type', 'imageBase64', 'fields', 'case', 'caseFolders'));
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
        $sessionKey = 'viewed_document_' . $id;
        if (!session()->has($sessionKey)) {
            \App\Services\AuditService::log(
                'READ', 
                'Documents', 
                "Viewed Document ({$type})" . ($case ? " for Case #{$case->case_number}" : ""), 
                $document->id
            );
            session()->put($sessionKey, true);
        }

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
        $case = \App\Models\LuponCase::withTrashed()->where('id', $id)->orWhere('case_number', $id)->firstOrFail();
        $data = $case->document_data ?? [];
        $latestDoc = $case->documents()->latest()->first();
        $type = $latestDoc->type ?? $data['document_type'] ?? $data['type'] ?? 'complaint';

        // I-log sa Audit Trail kapag binuksan ang detalye/dokumento ng kaso
        $sessionKey = 'viewed_case_' . $id;
        if (!session()->has($sessionKey)) {
            \App\Services\AuditService::log(
                'READ', 
                'Cases', 
                "Viewed documents/details for Case #{$case->case_number}", 
                $case->case_number
            );
            session()->put($sessionKey, true);
        }

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

        // Populate fields with saved data
        foreach ($fields as &$field) {
            if (isset($data[$field['name']])) {
                $field['default'] = $data[$field['name']];
            }
        }
        unset($field);

        $imageBase64 = $this->generateBackgroundImage($type);
        $readonly = request('mode') !== 'edit';
        $missingData = empty($data);

        if (request('mode') === 'edit') {
            return view('documents.form-fill', compact('type', 'imageBase64', 'fields', 'data', 'case'));
        }

        return view('documents.templates.print', compact('type', 'imageBase64', 'fields', 'data', 'case'));
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

                $folderName = $request->input('folder_name');
                if ($folderName) {
                    $targetCase = \App\Models\LuponCase::where('folder_name', $folderName)->first();
                    if ($targetCase) {
                        $caseId = $targetCase->id;
                    }
                } elseif ($caseId) {
                    $targetCase = \App\Models\LuponCase::find($caseId);
                    if ($targetCase && $targetCase->folder_name) {
                        $folderName = $targetCase->folder_name;
                    } elseif ($caseId) {
                        $folderName = 'case-' . str_pad($caseId, 3, '0', STR_PAD_LEFT);
                    }
                }

                \App\Models\Document::create([
                    'case_id' => $caseId,
                    'folder_name' => $folderName,
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

        // Ghostscript Command resolved dynamically
        $gsPath = $this->getGhostscriptPath();
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
            $browsershot = Browsershot::html($html);
            if (env('CHROME_PATH')) {
                $browsershot->setChromePath(env('CHROME_PATH'));
            }

            $pdf = $browsershot
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
        $layout = $request->input('layout');
        $content = $request->input('content');
        $caseId = $request->input('case_id') ?: null;

        if (!$type) {
            return response()->json(['error' => 'Invalid data'], 422);
        }

        // Convert layout to positions if it exists (from visual-editor)
        if (is_array($layout)) {
            $positions = [];
            foreach ($layout as $field) {
                if (isset($field['name'])) {
                    $positions[$field['name']] = [
                        'x' => $field['x'] ?? '0%',
                        'y' => $field['y'] ?? '0%',
                        'w' => $field['w'] ?? '10%',
                        'h' => $field['h'] ?? 'auto',
                        'class' => $field['class'] ?? '',
                        'type' => $field['type'] ?? 'text',
                        'default' => $field['default'] ?? '',
                        'locked' => !empty($field['locked']),
                    ];
                }
            }
        }

        if (!is_array($positions)) {
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

            if (is_array($layout)) {
                $existingFieldMap = [];
                foreach ($fields as $field) {
                    $existingFieldMap[$field['name']] = $field;
                }
                
                $newFields = [];
                foreach ($layout as $field) {
                    $name = $field['name'];
                    $orig = $existingFieldMap[$name] ?? [];
                    $newFields[] = array_merge($orig, [
                        'name' => $name,
                        'x' => $field['x'],
                        'y' => $field['y'],
                        'w' => $field['w'],
                        'h' => $field['h'],
                        'class' => $field['class'] ?? ($orig['class'] ?? ''),
                        'type' => $field['type'] ?? ($orig['type'] ?? 'text'),
                        'default' => $field['default'] ?? ($orig['default'] ?? ''),
                        'locked' => !empty($field['locked']),
                    ]);
                }
                $fields = $newFields;
            } else {
                foreach ($fields as &$field) {
                    if (isset($positions[$field['name']])) {
                        $pos = $positions[$field['name']];
                        $field['x'] = $pos['x'];
                        $field['y'] = $pos['y'];
                        $field['w'] = $pos['w'] ?? ($field['w'] ?? '30%');
                        $field['h'] = $pos['h'] ?? ($field['h'] ?? 'auto');
                        if (isset($pos['locked'])) {
                            $field['locked'] = !empty($pos['locked']);
                        }
                        if (isset($pos['font_family'])) $field['font_family'] = $pos['font_family'];
                        if (isset($pos['font_size'])) $field['font_size'] = $pos['font_size'];
                    }
                }
                unset($field);
            }

            $content['fields'] = $fields;
            $template->update(['content' => $content]);

            return response()->json(['success' => true, 'message' => 'Custom layout saved!']);
        }

        // Merge incoming positions onto the base config layout
        // Check if there is already a saved layout in the database first
        $savedLayout = FormLayout::where('document_type', $type)->first();
        if ($savedLayout) {
            $baseFields = $savedLayout->layout_json;
        } else {
            $baseFields = FormLayouts::getLayout($type);
        }

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
                if (isset($pos['class'])) $baseFields[$idx]['class'] = $pos['class'];
                if (isset($pos['type'])) $baseFields[$idx]['type'] = $pos['type'];
                if (isset($pos['default'])) $baseFields[$idx]['default'] = $pos['default'];
                if (isset($pos['locked'])) $baseFields[$idx]['locked'] = !empty($pos['locked']);
                if (isset($pos['font_family'])) $baseFields[$idx]['font_family'] = $pos['font_family'];
                if (isset($pos['font_size'])) $baseFields[$idx]['font_size'] = $pos['font_size'];
            } else {
                $baseFields[] = [
                    'name' => $name,
                    'label' => $pos['label'] ?? '',
                    'x' => $pos['x'],
                    'y' => $pos['y'],
                    'w' => $pos['w'],
                    'h' => $pos['h'],
                    'class' => $pos['class'] ?? '',
                    'type' => $pos['type'] ?? 'text',
                    'default' => $pos['default'] ?? '',
                    'locked' => !empty($pos['locked']),
                ];
            }
        }

        // Upsert into DB & FormLayouts config
        FormLayout::updateOrCreate(
            ['document_type' => $type],
            ['layout_json' => $baseFields]
        );
        FormLayouts::saveLayoutToFile($type, $baseFields);

        return response()->json(['success' => true, 'message' => 'Layout saved to database and FormLayouts.php!']);
    }

    /**
     * Trigger manual AI-powered layout auto-alignment for standard or custom forms.
     * Accessible via the "Auto-Align with AI" button on the calibration overlay.
     */
    public function autoAlignAI(Request $request)
    {
        $type = $request->input('document_type');
        
        if (!$type) {
            return response()->json(['success' => false, 'error' => 'Missing document type'], 422);
        }

        // Get current fields structure
        $fields = [];
        $filePath = null;
        
        if (str_starts_with($type, 'custom_')) {
            $id = str_replace('custom_', '', $type);
            $template = \App\Models\Document::findOrFail($id);
            $fields = $template->content['fields'] ?? [];
            $filePath = $template->file_path;
        } else {
            // Standard Form Layout from config/db
            $savedLayout = FormLayout::where('document_type', $type)->first();
            if ($savedLayout) {
                $fields = $savedLayout->layout_json;
            } else {
                $fields = FormLayouts::getLayout($type);
            }
            // Resolve relative path for standard forms in public/forms
            $filePath = public_path("forms/{$type}.pdf");
            // If public file does not exist, use relative placeholder path
            if (!file_exists($filePath)) {
                $filePath = "forms/{$type}.pdf";
            }
        }

        // Map IDs to names
        foreach ($fields as &$f) {
            if (!isset($f['name']) && isset($f['id'])) {
                $f['name'] = $f['id'];
            }
        }
        unset($f);

        // Run Gemini AI Alignment
        if ($filePath) {
            if (str_contains($filePath, public_path('forms'))) {
                // Pass standard forms by passing absolute path directly as third param
                $this->alignCustomTemplateWithAI(basename($filePath), $fields, $filePath);
            } else {
                $this->alignCustomTemplateWithAI($filePath, $fields);
            }
        }

        // Save layout to DB to persist positions immediately
        if (str_starts_with($type, 'custom_')) {
            $id = str_replace('custom_', '', $type);
            $template = \App\Models\Document::findOrFail($id);
            $content = $template->content;
            $content['fields'] = $fields;
            $template->update(['content' => $content]);
        } else {
            FormLayout::updateOrCreate(
                ['document_type' => $type],
                ['layout_json' => $fields]
            );
        }

        return response()->json([
            'success' => true, 
            'fields' => $fields,
            'message' => 'AI successfully aligned layout positions and matched styles!'
        ]);
    }

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    /**
     * Resolve the Ghostscript executable path dynamically.
     */
    private function getGhostscriptPath(): string
    {
        $gsPath = env('GHOSTSCRIPT_PATH');
        if ($gsPath) {
            return $gsPath;
        }

        // Try to auto-detect in standard C:\Program Files\gs directory
        $gsDir = 'C:\\Program Files\\gs';
        if (is_dir($gsDir)) {
            $folders = scandir($gsDir);
            if (is_array($folders)) {
                // Sort descending so newer versions are checked first
                rsort($folders);
                foreach ($folders as $folder) {
                    if (str_starts_with($folder, 'gs')) {
                        $candidate = "{$gsDir}\\{$folder}\\bin\\gswin64c.exe";
                        if (file_exists($candidate)) {
                            return '"' . $candidate . '"';
                        }
                    }
                }
            }
        }

        // Fallback to default path or command name if not found/accessible
        return 'gswin64c';
    }

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
        $gsPath = $this->getGhostscriptPath();
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
     * Use Gemini AI to automatically estimate layout alignment coordinates (x, y, w, h)
     * and match the dominant font family and font size of the uploaded template document.
     */
    private function alignCustomTemplateWithAI(string $filePath, array &$fields, string $customPath = null)
    {
        $apiKey = env('GEMINI_API_KEY');
        $alignedViaGemini = false;

        // Valid Google Gemini API keys start with AIza...
        if (!empty($apiKey) && str_starts_with($apiKey, 'AIza')) {
            // Generate base64 image of the uploaded PDF template page 1
            $imageBase64 = $this->generateBackgroundImage('custom_temp', $customPath ?? storage_path('app/public/' . $filePath));
            
            if (!empty($imageBase64)) {
                $fieldNames = [];
                foreach ($fields as $f) {
                    $fieldNames[] = $f['name'] ?? $f['id'] ?? '';
                }
                $fieldNames = array_filter($fieldNames);

                try {
                    $promptInstruction = "You are an expert document layout analysis system. " .
                                         "We have an uploaded template form image (A4 paper). We want to overlay fillable text fields onto this form. " .
                                         "Analyze the document layout, locate the blank fillable lines or spaces for the following fields, and estimate their coordinates as percentages of the A4 page width (x, w) and height (y, h). " .
                                         "Also, analyze the surrounding printed text on the page, detect the dominant Font Family (e.g., Arial, Times New Roman, Calibri, Courier) and the average Font Size (in pt, e.g. 10pt, 11pt, 12pt). " .
                                         "Here is the list of fields to detect: " . json_encode($fieldNames) . "\n\n" .
                                         "Return your response strictly as a JSON object matching this schema: " .
                                         "{" .
                                         "  \"font_family\": \"Detected font name (e.g., Arial, Times New Roman, Calibri)\"," .
                                         "  \"font_size\": \"Detected size in pt (e.g. 10pt)\"," .
                                         "  \"layout\": [" .
                                         "    { \"name\": \"field_name\", \"x\": \"X%\", \"y\": \"Y%\", \"w\": \"Width%\", \"h\": \"Height%\" }" .
                                         "  ]" .
                                         "}";

                    $geminiModel = env('GEMINI_MODEL', 'gemini-3.6-flash');
                    $response = \Illuminate\Support\Facades\Http::withHeaders([
                        'Content-Type' => 'application/json'
                    ])->timeout(30)->post("https://generativelanguage.googleapis.com/v1beta/models/{$geminiModel}:generateContent?key={$apiKey}", [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $promptInstruction],
                                    [
                                        'inlineData' => [
                                            'mimeType' => 'image/png',
                                            'data' => $imageBase64
                                        ]
                                    ]
                                ]
                            ]
                        ],
                        'generationConfig' => [
                            'responseMimeType' => 'application/json'
                        ]
                    ]);

                    if ($response->successful()) {
                        $rawTextResponse = $response->json('candidates.0.content.parts.0.text');
                        $aiData = json_decode($rawTextResponse, true);

                        if (is_array($aiData)) {
                            $fontFamily = $aiData['font_family'] ?? 'Arial';
                            $fontSize = $aiData['font_size'] ?? '9.5pt';
                            
                            $layoutMap = [];
                            if (isset($aiData['layout']) && is_array($aiData['layout'])) {
                                foreach ($aiData['layout'] as $l) {
                                    if (isset($l['name'])) {
                                        $layoutMap[$l['name']] = $l;
                                    }
                                }
                            }

                            foreach ($fields as &$field) {
                                $name = $field['name'] ?? $field['id'];
                                $field['font_family'] = $fontFamily;
                                
                                $fontSizePt = floatval($fontSize);
                                if ($fontSizePt > 0) {
                                    $field['font_size'] = number_format($fontSizePt * 0.168, 2) . 'cqw';
                                } else {
                                    $field['font_size'] = '1.6cqw';
                                }

                                if (isset($layoutMap[$name])) {
                                    $field['x'] = $layoutMap[$name]['x'];
                                    $field['y'] = $layoutMap[$name]['y'];
                                    $field['w'] = $layoutMap[$name]['w'];
                                    $field['h'] = $layoutMap[$name]['h'] ?? 'auto';
                                }
                            }
                            unset($field);
                            $alignedViaGemini = true;
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('AI Layout Analysis failed: ' . $e->getMessage());
                }
            }
        }

        // If Gemini API was missing or unfulfilled, run Built-in Smart Precision Aligner
        if (!$alignedViaGemini) {
            foreach ($fields as $index => &$field) {
                $name = strtolower($field['name'] ?? $field['id'] ?? '');
                
                $field['font_family'] = $field['font_family'] ?? 'Arial';
                $field['font_size'] = $field['font_size'] ?? '1.6cqw';

                if (str_contains($name, 'complainant') || str_contains($name, 'nagrereklamo') || str_contains($name, 'plaintiff')) {
                    $field['x'] = '22%';
                    $field['y'] = '18.5%';
                    $field['w'] = '36%';
                    $field['h'] = 'auto';
                } elseif (str_contains($name, 'respondent') || str_contains($name, 'isinusumbong') || str_contains($name, 'defendant')) {
                    $field['x'] = '22%';
                    $field['y'] = '23.8%';
                    $field['w'] = '36%';
                    $field['h'] = 'auto';
                } elseif (str_contains($name, 'case_no') || str_contains($name, 'case_num') || str_contains($name, 'kaso')) {
                    $field['x'] = '65%';
                    $field['y'] = '18.5%';
                    $field['w'] = '25%';
                    $field['h'] = 'auto';
                } elseif (str_contains($name, 'for') || str_contains($name, 'nature') || str_contains($name, 'ukol')) {
                    $field['x'] = '65%';
                    $field['y'] = '23.8%';
                    $field['w'] = '25%';
                    $field['h'] = 'auto';
                } elseif (str_contains($name, 'body') || str_contains($name, 'narrative') || str_contains($name, 'reklamo') || str_contains($name, 'statement')) {
                    $field['x'] = '15%';
                    $field['y'] = '32.0%';
                    $field['w'] = '72%';
                    $field['h'] = '30%';
                } elseif (str_contains($name, 'day') || str_contains($name, 'month') || str_contains($name, 'year') || str_contains($name, 'date')) {
                    $field['x'] = $field['x'] ?? '25%';
                    $field['y'] = $field['y'] ?? '68.0%';
                    $field['w'] = $field['w'] ?? '20%';
                    $field['h'] = 'auto';
                } elseif (str_contains($name, 'sig') || str_contains($name, 'lupon') || str_contains($name, 'captain') || str_contains($name, 'chairman')) {
                    $field['x'] = '55%';
                    $field['y'] = '80.0%';
                    $field['w'] = '35%';
                    $field['h'] = 'auto';
                } else {
                    $yPos = 25.0 + ($index * 5.0);
                    $field['x'] = $field['x'] ?? '20%';
                    $field['y'] = sprintf('%.1f%%', min($yPos, 85.0));
                    $field['w'] = $field['w'] ?? '40%';
                    $field['h'] = $field['h'] ?? 'auto';
                }
            }
            unset($field);
        }
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

    // ── Upload scanned document for AI parsing (Temporary stage) ───────────────
    public function upload(Request $request)
    {
        $file = $request->file('file');
        $fileName = $file ? $file->getClientOriginalName() : ($request->has('file') ? 'Invalid File' : 'No File');

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'file' => 'required|file|max:15360|mimes:png,jpg,jpeg,pdf',
        ]);

        if ($validator->fails()) {
            $errors = implode(', ', $validator->errors()->all());
            $fileSize = $file ? round($file->getSize() / 1024, 2) : 0;
            $mimeType = $file ? $file->getMimeType() : 'unknown';

            \App\Services\AuditService::log(
                'UPLOAD_FAILED',
                'Documents',
                "Failed scanned document upload: {$fileName} (Size: {$fileSize} KB, Type: {$mimeType}). Validation errors: {$errors}",
                null
            );

            return response()->json([
                'success' => false,
                'message' => 'Validation errors: ' . $errors
            ], 422);
        }

        $apiKey = env('GEMINI_API_KEY');
        if (empty($apiKey)) {
            $fileSize = round($file->getSize() / 1024, 2);
            $mimeType = $file->getMimeType();
            \App\Services\AuditService::log('UPLOAD_FAILED', 'Documents', "Failed scanned document upload: {$fileName} (Size: {$fileSize} KB, Type: {$mimeType}). Reason: Gemini API Key missing.", null);
            return response()->json([
                'success' => false,
                'message' => 'Gemini API Key is not configured in the system (.env). Please add GEMINI_API_KEY to proceed.'
            ], 400);
        }

        try {
            // Store temporarily in scans/temp
            $tempPath = $file->store('scans/temp', 'public');
            $mimeType = $file->getMimeType();

            // If uploaded file is a PDF, render Page 1 as PNG image using Ghostscript if available
            if ($file->getClientOriginalExtension() === 'pdf' || $mimeType === 'application/pdf') {
                $gsPath = $this->getGhostscriptPath();
                $pdfFullPath = Storage::disk('public')->path($tempPath);
                $pngTempPath = 'scans/temp/' . uniqid('pdf_page_') . '.png';
                $pngFullPath = Storage::disk('public')->path($pngTempPath);

                $cmd = "{$gsPath} -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r300 -dFirstPage=1 -dLastPage=1 -sOutputFile=\"{$pngFullPath}\" \"{$pdfFullPath}\" 2>&1";
                exec($cmd, $gsOutput, $returnCode);

                if ($returnCode === 0 && file_exists($pngFullPath)) {
                    $imageBinary = file_get_contents($pngFullPath);
                    $base64Image = base64_encode($imageBinary);
                    $mimeType = 'image/png';
                    @unlink($pngFullPath);
                } else {
                    // Fallback to sending native PDF binary directly to Gemini 2.5 Flash
                    $imageBinary = Storage::disk('public')->get($tempPath);
                    $base64Image = base64_encode($imageBinary);
                    $mimeType = 'application/pdf';
                }
            } else {
                $imageBinary = Storage::disk('public')->get($tempPath);
                $base64Image = base64_encode($imageBinary);
            }

             // Construct the prompt for Gemini AI scanning (translates output into Tagalog/Filipino)
            $promptInstruction = "Analyze this scanned legal document from the Barangay Lupon Tagapamayapa. " .
                                 "Identify and extract the following details precisely. IMPORTANT: Translate all narrative summaries, details, and nature of case into Tagalog/Filipino language. " .
                                 "Return your output strictly as a flat JSON object matching this schema: " .
                                 "{" .
                                 "  \"complainant\": \"Name of the complainant(s) or null\"," .
                                 "  \"respondent\": \"Name of the respondent(s) or null\"," .
                                 "  \"case_no\": \"The formal case number or null\"," .
                                 "  \"nature_of_case\": \"The issue/reason translated in Tagalog (e.g. Paninirang-puri, Pag-aaway sa lupa, Utang, Pambubugbog). For an Affidavit of Withdrawal, set this field to exactly 'Affidavit of Withdrawal'\"," .
                                 "  \"summary\": \"A short, objective summary of the narrative/statement written on the page, translated into clear Tagalog/Filipino.\"," .
                                 "  \"document_type\": \"Must be either 'complaint' (if it is a complaint form, statement of dispute, or complaint narrative) or 'affidavit_withdrawal' (if it is an affidavit of withdrawal, request for dismissal, or withdrawal statement)\"" .
                                 "}";

            // Send POST request to Google AI Studio
             $geminiModel = env('GEMINI_MODEL', 'gemini-3.6-flash');
             $response = \Illuminate\Support\Facades\Http::withHeaders([
                 'Content-Type' => 'application/json'
             ])->timeout(45)->post("https://generativelanguage.googleapis.com/v1beta/models/{$geminiModel}:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $promptInstruction],
                            [
                                'inlineData' => [
                                    'mimeType' => $mimeType,
                                    'data' => $base64Image
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json'
                ]
            ]);

            if ($response->failed()) {
                // Cleanup temp file
                Storage::disk('public')->delete($tempPath);
                throw new \Exception("Gemini API request failed: " . $response->body());
            }

            $rawTextResponse = $response->json('candidates.0.content.parts.0.text');
            $extractedData = json_decode($rawTextResponse, true);

            // Log successful upload & parse in Audit Trail
            $fileSize = round($file->getSize() / 1024, 2);
            \App\Services\AuditService::log(
                'UPLOAD',
                'Documents',
                "Successfully scanned and parsed image: {$fileName} ({$fileSize} KB, {$mimeType}) via Gemini AI.",
                null
            );

            return response()->json([
                'success' => true,
                'temp_file' => $tempPath,
                'data' => $extractedData
            ]);

        } catch (\Exception $e) {
            if (isset($tempPath)) {
                Storage::disk('public')->delete($tempPath);
            }
            \Log::error('AI Scan Ingestion Error: ' . $e->getMessage());

            // Log failed upload & parse in Audit Trail
            $fileSize = isset($file) ? round($file->getSize() / 1024, 2) : 0;
            $mimeType = isset($file) ? $file->getMimeType() : 'unknown';
            \App\Services\AuditService::log(
                'UPLOAD_FAILED',
                'Documents',
                "Failed scanned document upload: {$fileName} (Size: {$fileSize} KB, Type: {$mimeType}). Reason: " . $e->getMessage(),
                null
            );

            return response()->json([
                'success' => false,
                'message' => 'Error parsing document: ' . $e->getMessage()
            ], 500);
        }
    }

    // ── Save confirmed scanned document and link to Case ──────────────────────
    public function storeScanned(Request $request)
    {
        $request->validate([
            'temp_file' => 'required|string',
            'type' => 'required|string', // e.g. complaint, summons, amicable_settlement, etc.
            'complainant' => 'required|string',
            'respondent' => 'required|string',
            'case_no' => 'nullable|string',
            'nature_of_case' => 'nullable|string',
            'summary' => 'nullable|string',
            'case_id' => 'nullable|integer',
        ]);

        $rawTemp = $request->input('temp_file');
        $tempPath = str_replace('\\', '/', $rawTemp);
        $fileName = basename($tempPath);
        $permanentPath = "scans/{$fileName}";

        if (Storage::disk('public')->exists($tempPath)) {
            try {
                if (Storage::disk('public')->exists($permanentPath)) {
                    Storage::disk('public')->delete($permanentPath);
                }
                Storage::disk('public')->move($tempPath, $permanentPath);
            } catch (\Exception $e) {
                @Storage::disk('public')->copy($tempPath, $permanentPath);
            }
        } elseif (!Storage::disk('public')->exists($permanentPath)) {
            $permanentPath = $tempPath;
        }

        try {

            $caseId = $request->input('case_id');
            $caseNo = $request->input('case_no');
            $complainant = $request->input('complainant');
            $respondent = $request->input('respondent');
            $natureOfCase = $request->input('nature_of_case') ?? 'Unspecified';
            $summary = $request->input('summary');
            $type = $request->input('type');

            // Trim and sanitize case number
            $caseNo = trim((string)$caseNo);

            // Dynamically associate, update, or create Case
            if (!$caseId && !empty($caseNo)) {
                $existingCase = \App\Models\LuponCase::withTrashed()
                    ->whereRaw('LOWER(case_number) = ?', [strtolower($caseNo)])
                    ->first();
                if ($existingCase) {
                    $caseId = $existingCase->id;
                }
            }

            // If creating a new case, ensure case_number is unique
            if (!$caseId && !empty($caseNo)) {
                $count = 1;
                $originalCaseNo = $caseNo;
                while (\App\Models\LuponCase::withTrashed()->where('case_number', $caseNo)->exists()) {
                    $caseNo = $originalCaseNo . '-' . $count;
                    $count++;
                }
            }

            $dateFiled = $request->input('date_filed');
            $timestamp = !empty($dateFiled) ? strtotime($dateFiled) : time();
            $docContentMap = [
                'case_no' => $caseNo,
                'complainant' => $complainant,
                'respondent' => $respondent,
                'nature_of_case' => $natureOfCase,
                'narrative' => $summary,
                'For' => $natureOfCase,
                'made_this_month' => date('F', $timestamp),
                'made_this_day' => date('jS', $timestamp),
                'year' => date('y', $timestamp),
                'type' => $type,
                'is_scanned' => true
            ];

            if ($caseId) {
                $case = \App\Models\LuponCase::withTrashed()->find($caseId);
                if ($case) {
                    if ($case->trashed()) {
                        $case->restore();
                    }
                    $case->update([
                        'case_number' => $caseNo ?: $case->case_number,
                        'complainant' => $complainant,
                        'respondent' => $respondent,
                        'nature_of_case' => $natureOfCase,
                        'title' => "{$complainant} vs {$respondent}",
                        'complaint_narrative' => $summary ?: $case->complaint_narrative,
                        'date_filed' => now(),
                        'document_data' => $docContentMap,
                    ]);
                    \App\Services\AuditService::log('UPDATE', 'Cases', "Updated Case #{$case->case_number} details from AI scan", $case->case_number);
                }
            } else {
                if (empty($caseNo)) {
                    $caseNo = 'CAS-' . date('YmdHis');
                    $docContentMap['case_no'] = $caseNo;
                }

                $case = \App\Models\LuponCase::create([
                    'case_number' => $caseNo,
                    'title' => "{$complainant} vs {$respondent}",
                    'complainant' => $complainant,
                    'respondent' => $respondent,
                    'nature_of_case' => $natureOfCase,
                    'status' => 'Pending',
                    'date_filed' => now(),
                    'complaint_narrative' => $summary,
                    'admin_notes' => 'Created via Scanned AI Ingestion',
                    'document_data' => $docContentMap,
                    'created_by' => auth()->id(),
                ]);
                $caseId = $case->id;
                
                \App\Services\AuditService::log('CREATE', 'Cases', "Auto-created Case #{$caseNo} from AI scan", $caseNo);
            }

            // Create Document record
            $document = \App\Models\Document::create([
                'case_id' => $caseId,
                'type' => $type,
                'status' => 'Issued',
                'file_path' => $permanentPath,
                'content' => [
                    'complainant' => $complainant,
                    'respondent' => $respondent,
                    'case_no' => $caseNo,
                    'body_text' => $summary,
                    'is_scanned' => true
                ],
                'issued_at' => now(),
                'created_by' => auth()->id(),
            ]);

            \App\Services\AuditService::log('CREATE', 'Documents', "Saved scanned {$type} document for Case #{$caseId}", $caseId);

            return redirect()->route('cases.index')
                ->with('success', "Scanned document and Case #{$caseNo} saved to database successfully!");

        } catch (\Exception $e) {
            \Log::error('AI Scan Save Error: ' . $e->getMessage());

            $fileName = basename($tempPath ?? 'unknown');
            \App\Services\AuditService::log(
                'SAVE_SCANNED_FAILED',
                'Documents',
                "Failed saving scanned document {$fileName} to database. Reason: " . $e->getMessage(),
                null
            );

            return back()->withErrors([
                'error' => 'Error saving scanned document: ' . $e->getMessage()
            ]);
        }
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

        // Map builder 'id' to 'name' so visual-editor and form-fill can load them correctly
        foreach ($fields as &$f) {
            if (!isset($f['name']) && isset($f['id'])) {
                $f['name'] = $f['id'];
            }
        }
        unset($f);

        // Analyze and align layout and match fonts from the uploaded PDF
        if ($filePath) {
            $this->alignCustomTemplateWithAI($filePath, $fields);
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
