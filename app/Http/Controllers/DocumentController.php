<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Spatie\Browsershot\Browsershot;

use App\Config\FormLayouts;

use App\Models\FormLayout;

class DocumentController extends Controller
{
    public function index()
    {
        $documents = \App\Models\Document::with('case')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return \Inertia\Inertia::render('documents/index', [
            'documents' => $documents
        ]);
    }

    public function create($type)
    {
        // For prototype, we verify if the PDF exists in public/forms/{$type}.pdf
        // If not, we might fallback or show error. For now, valid types are mapped.

        // Get Layout from DB or Config
        $savedLayout = FormLayout::where('document_type', $type)->first();
        if ($savedLayout) {
            $fields = $savedLayout->layout_json;
        } else {
            $fields = FormLayouts::getLayout($type);
        }

        $pdfPath = public_path("forms/{$type}.pdf");
        if (!file_exists($pdfPath)) {
            $pdfPath = public_path("forms/complaint.pdf");
        }

        // Generate Image for Editor Background using Ghostscript
        $outputImage = storage_path("app/public/temp_editor_{$type}_" . uniqid() . ".png");

        // Ghostscript Command - Absolute Path
        // Version 10.06.0 detected
        $gsPath = '"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"';
        // On Windows cmd.exe, if the first token is quoted, we might need extra care.
        // We add "2>&1" to capture stderr in output for debugging.
        $cmd = "{$gsPath} -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r300 -dFirstPage=1 -dLastPage=1 -sOutputFile=\"{$outputImage}\" \"{$pdfPath}\" 2>&1";

        exec($cmd, $output, $returnCode);

        $imageBase64 = '';
        if ($returnCode === 0 && file_exists($outputImage)) {
            $imageContent = file_get_contents($outputImage);
            $imageBase64 = base64_encode($imageContent);
            @unlink($outputImage);
        } else {
            // Log error but proceed (view handles missing image gracefully)
            \Illuminate\Support\Facades\Log::error("Ghostscript failed: " . implode("\n", $output));
        }

        return view('documents.visual-editor', compact('type', 'imageBase64', 'fields'));
    }

    public function viewCase($id)
    {
        $case = \App\Models\LuponCase::where('id', $id)->orWhere('case_number', $id)->firstOrFail();
        $data = $case->document_data;

        if (!$data) {
            abort(404, 'Document data not found for this case.');
        }

        $type = $data['document_type'] ?? 'complaint'; // Ensure this key is saved in frontend
        // Currently frontend sends 'type' input, so it should be in $data['type']
        if (empty($data['document_type']) && isset($data['type'])) {
            $type = $data['type'];
        }

        // Get Layout
        $savedLayout = FormLayout::where('document_type', $type)->first();
        if ($savedLayout) {
            $fields = $savedLayout->layout_json;
        } else {
            $fields = FormLayouts::getLayout($type);
        }

        // Populate fields with saved data and apply overrides
        foreach ($fields as &$field) {
            if (isset($data[$field['name']])) {
                $field['default'] = $data[$field['name']];
            }

            // Apply layout overrides if present
            if (isset($data['layout_overrides']) && isset($data['layout_overrides'][$field['name']])) {
                $override = $data['layout_overrides'][$field['name']];
                $field['x'] = $override['x'];
                $field['y'] = $override['y'];
                $field['w'] = $override['w'];
                if (isset($override['h']) && $override['h'] !== 'auto') {
                    $field['h'] = $override['h'];
                }
            }
        }

        $pdfPath = public_path("forms/{$type}.pdf");
        if (!file_exists($pdfPath)) {
            $pdfPath = public_path("forms/complaint.pdf");
        }

        // Generate Background Image (Might be cached or need regeneration)
        // For simplicity, regenerate (browsershot/ghostscript)
        // ... Code duplication from create method ...
        // To avoid duplication, maybe extract image generation?
        // For now, duplicate for speed, refactor later.

        $outputImage = storage_path("app/public/temp_editor_{$type}_" . uniqid() . ".png");
        $gsPath = '"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"';
        $cmd = "{$gsPath} -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r300 -dFirstPage=1 -dLastPage=1 -sOutputFile=\"{$outputImage}\" \"{$pdfPath}\" 2>&1";
        exec($cmd, $output, $returnCode);

        $imageBase64 = '';
        if ($returnCode === 0 && file_exists($outputImage)) {
            $imageContent = file_get_contents($outputImage);
            $imageBase64 = base64_encode($imageContent);
            @unlink($outputImage);
        }

        $readonly = request('mode') !== 'edit';

        return view('documents.visual-editor', compact('type', 'imageBase64', 'fields', 'readonly', 'case', 'missingData'));
    }

    public function generate(Request $request)
    {
        // Debugging: Check what data is received
        // dd($request->all());
        $data = $request->all();
        $type = $data['type'] ?? 'complaint';

        // Get Layout from Config
        $fields = FormLayouts::getLayout($type);

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

        $pdfPath = public_path("forms/{$type}.pdf");

        if (!file_exists($pdfPath)) {
            $pdfPath = public_path("forms/complaint.pdf");
        }

        // Output path for the generated image
        // We use a temporary file or a specific path in storage
        $outputImage = storage_path("app/public/temp_{$type}_" . uniqid() . ".png");

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

        // Pass Base64 Image to View
        $data['imageBase64'] = $base64Image;

        // Render the print-friendly view
        $html = view('documents.templates.print', $data)->render();

        // Generate PDF using Browsershot
        try {
            $pdf = Browsershot::html($html)
                ->format('A4')
                ->margins(0, 0, 0, 0)
                ->showBackground()
                ->setOption('displayHeaderFooter', false)
                ->waitUntilNetworkIdle()
                ->timeout(120) // Extended timeout
                ->noSandbox() // Crucial for some environments
                ->ignoreHttpsErrors() // Ignore SSL issues
                ->setOption('args', ['--disable-web-security']) // Allow loading local resources if needed
                ->pdf();
        } catch (\Exception $e) {
            return response("PDF Generation Error: " . $e->getMessage(), 500);
        }

        $filename = "{$type}_" . date('Ymd_His') . ".pdf";
        $disposition = $request->input('action') === 'preview' ? 'inline' : 'attachment';

        // Save Document Record
        if ($request->has('case_id')) {
            try {
                \App\Models\Document::create([
                    'case_id' => $request->input('case_id'),
                    'type' => $type,
                    'content' => $data, // Save all form data
                    'status' => 'Issued',
                    'issued_at' => now(),
                    // 'file_path' => $filename, // Consider saving file to storage if needed
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to save document record: " . $e->getMessage());
                // Don't block download if saving record fails, but log it.
            }
        }

        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "{$disposition}; filename=\"{$filename}\"");
    }
}
