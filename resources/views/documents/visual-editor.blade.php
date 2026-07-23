<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Visual Editor: {{ ucwords(str_replace('_', ' ', $type)) }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Material Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <!-- Font for the document text (Times New Roman) -->
    <link href="https://fonts.googleapis.com/css2?family=Times+New+Roman:wght@400;700&display=swap" rel="stylesheet">
    <style>
        /* Google Docs Theme Variables */
        :root {
            --docs-gray: #F9FBFD;
            --docs-toolbar-bg: #EDF2FA;
            --docs-toolbar-hover: #E1E5EA;
            --docs-icon-color: #444746;
        }

        body {
            background-color: var(--docs-gray);
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Roboto', sans-serif;
            /* UI Font */
        }

        /* --- Toolbar --- */
        .toolbar-container {
            background: var(--docs-toolbar-bg);
            border-bottom: 1px solid #c7c7c7;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-radius: 24px;
            margin: 8px 16px;
        }

        .toolbar-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            color: var(--docs-icon-color);
            transition: background 0.2s;
            border: none;
            background: transparent;
            cursor: pointer;
        }

        .toolbar-btn:hover {
            background-color: var(--docs-toolbar-hover);
        }

        .toolbar-btn.active {
            background-color: #D3E3FD;
            color: #0B57D0;
        }

        .toolbar-separator {
            width: 1px;
            height: 20px;
            background-color: #c7c7c7;
            margin: 0 4px;
        }

        /* --- Ruler (Visual Only for now) --- */
        .ruler-container {
            height: 20px;
            background: #fff;
            border-bottom: 1px solid #c7c7c7;
            display: flex;
            align-items: center;
            padding-left: calc(50% - 105mm);
            /* Center align with page */
            font-size: 10px;
            color: #5f6368;
            overflow: hidden;
        }

        /* --- Workspace --- */
        .workspace {
            flex: 1;
            overflow: auto;
            display: flex;
            justify-content: center;
            padding: 24px;
        }

        .page-container {
            width: 210mm;
            height: 297mm;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            position: relative;
            container-type: inline-size;
            container-name: page;
            /* Important for absolute positioning */
        }

        #background-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
            user-select: none;
        }

        /* --- Editable Fields --- */
        .field-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
        }

        .doc-field {
            position: absolute;
            font-family: Arial, sans-serif;
            font-size: 1.6cqw;
            font-weight: bold;
            color: #000000;
            line-height: 1.2;
            background: transparent;
            outline: none;
            cursor: text;
            transition: background 0.2s, box-shadow 0.2s;
            overflow: visible;
            padding: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        /* Interaction States */
        .doc-field:hover,
        .doc-field:focus {
            /* Google Docs-like focus: subtle outline or background */
            /* box-shadow: 0 0 0 1px #4285f4; */
            /* Optional: Blue outline */
        }

        /* Layout Edit Mode */
        body.edit-layout-mode .doc-field {
            border: 1px dashed #999;
            background: rgba(255, 255, 0, 0.1);
            cursor: move !important;
            /* Remove native resize */
            resize: none !important;
            overflow: visible !important;
        }

        /* Custom Resizers */
        .resizer-r,
        .resizer-b,
        .resizer-l,
        .resizer-t {
            display: none;
            position: absolute;
            z-index: 100;
        }

        body.edit-layout-mode .resizer-r {
            display: block;
            width: 8px;
            height: 100%;
            right: -4px;
            top: 0;
            cursor: e-resize;
            background: rgba(0, 0, 255, 0.1);
        }

        body.edit-layout-mode .resizer-r:hover {
            background: rgba(0, 0, 255, 0.3);
        }

        body.edit-layout-mode .resizer-b {
            display: block;
            height: 8px;
            width: 100%;
            bottom: -4px;
            left: 0;
            cursor: s-resize;
            background: rgba(0, 0, 255, 0.1);
        }

        body.edit-layout-mode .resizer-b:hover {
            background: rgba(0, 0, 255, 0.3);
        }

        body.edit-layout-mode .resizer-l {
            display: block;
            width: 8px;
            height: 100%;
            left: -4px;
            top: 0;
            cursor: w-resize;
            background: rgba(0, 0, 255, 0.1);
        }

        body.edit-layout-mode .resizer-l:hover {
            background: rgba(0, 0, 255, 0.3);
        }

        body.edit-layout-mode .resizer-t {
            display: block;
            height: 8px;
            width: 100%;
            top: -4px;
            left: 0;
            cursor: n-resize;
            background: rgba(0, 0, 255, 0.1);
        }

        body.edit-layout-mode .resizer-t:hover {
            background: rgba(0, 0, 255, 0.3);
        }

        body.edit-layout-mode .doc-field:focus {
            border: 2px solid #3b82f6;
            z-index: 50;
        }

        /* Placeholder Logic (CSS only hack for contenteditable) */
        .doc-field:empty:before {
            content: attr(placeholder);
            color: #aaa;
            pointer-events: none;
            display: block;
            /* For Firefox */
        }

        /* Locked Field Styles */
        body.edit-layout-mode .doc-field[data-locked="true"] {
            border: 1.5px solid #ef4444 !important;
            background: rgba(239, 68, 68, 0.08) !important;
            cursor: not-allowed !important;
        }

        body.edit-layout-mode .doc-field[data-locked="true"] .resizer-r,
        body.edit-layout-mode .doc-field[data-locked="true"] .resizer-b,
        body.edit-layout-mode .doc-field[data-locked="true"] .resizer-l,
        body.edit-layout-mode .doc-field[data-locked="true"] .resizer-t {
            display: none !important;
        }
    </style>
</head>

<body>

    <!-- Document Header Info & Floating Google Docs Toolbar (Matching Screenshot) -->
    <div class="fixed top-3 left-4 right-4 z-50 flex items-center justify-between pointer-events-none print:hidden">
        <!-- Left Document Info Badge -->
        <div class="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-gray-200/80 flex items-center gap-3 pointer-events-auto">
            <div class="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center shadow-sm">
                <span class="material-icons-outlined text-base">description</span>
            </div>
            <div class="flex flex-col justify-center">
                <h1 class="text-xs font-bold text-gray-800 leading-tight">{{ ucwords(str_replace('_', ' ', $type)) }}</h1>
                @if(isset($case) && $case)
                    <p class="text-[11px] text-blue-600 font-semibold opacity-90" title="{{ $case->title }}">Case No: {{ $case->case_number }}</p>
                @else
                    <p class="text-[11px] text-gray-500 font-medium">Standalone Document</p>
                @endif
            </div>
        </div>

        <!-- Middle Top Toolbar Pill (Google Docs Style) -->
        <div class="bg-[#EDF2FA]/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-gray-300/80 flex items-center gap-2 pointer-events-auto flex-wrap">
            <!-- Undo / Redo -->
            <button type="button" onclick="document.execCommand('undo')" title="Undo" class="p-1 hover:bg-gray-200/80 rounded text-gray-700 text-xs font-medium flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                <span>Undo</span>
            </button>
            <button type="button" onclick="document.execCommand('redo')" title="Redo" class="p-1 hover:bg-gray-200/80 rounded text-gray-700 text-xs font-medium flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
                <span>Redo</span>
            </button>

            <span class="w-px h-4 bg-gray-300"></span>

            <!-- Align -->
            <span class="text-[11px] font-semibold text-gray-500">Align:</span>
            <button type="button" onclick="execCmd('justifyLeft')" title="Left Align" class="p-1 hover:bg-gray-200/80 rounded text-gray-700">
                <span class="material-icons-outlined text-sm">format_align_left</span>
            </button>
            <button type="button" onclick="execCmd('justifyCenter')" title="Center Align" class="p-1 hover:bg-gray-200/80 rounded text-gray-700">
                <span class="material-icons-outlined text-sm">format_align_center</span>
            </button>
            <button type="button" onclick="execCmd('justifyRight')" title="Right Align" class="p-1 hover:bg-gray-200/80 rounded text-gray-700">
                <span class="material-icons-outlined text-sm">format_align_right</span>
            </button>
            <button type="button" onclick="execCmd('justifyFull')" title="Justify" class="p-1 hover:bg-gray-200/80 rounded text-gray-700">
                <span class="material-icons-outlined text-sm">format_align_justify</span>
            </button>

            <span class="w-px h-4 bg-gray-300"></span>

            <!-- ✨ Auto-Align AI -->
            <button type="button" onclick="triggerAIAlign()" id="aiAlignBtn" title="Auto-Align Fields with Gemini AI" class="bg-[#0B57D0] hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm transition-all">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Auto-Align AI</span>
            </button>

            <span class="w-px h-4 bg-gray-300"></span>

            <!-- Zoom -->
            <select id="zoom-select" onchange="setZoom(this.value)" class="bg-transparent border border-gray-300 text-[11px] font-semibold rounded px-1.5 py-0.5 cursor-pointer outline-none text-gray-700">
                <option value="50">50%</option>
                <option value="75">75%</option>
                <option value="90">90%</option>
                <option value="100" selected>100%</option>
                <option value="125">125%</option>
                <option value="150">150%</option>
            </select>

            <!-- Text Block -->
            <select onchange="execCmd('formatBlock', this.value)" class="bg-transparent border border-gray-300 text-[11px] font-semibold rounded px-1.5 py-0.5 cursor-pointer outline-none text-gray-700">
                <option value="p" selected>Normal text</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
            </select>

            <!-- Font Family -->
            <select id="font-family-select" onchange="applyFontFamily(this.value)" class="bg-transparent border border-gray-300 text-[11px] font-semibold rounded px-1.5 py-0.5 cursor-pointer outline-none text-gray-700">
                <option value="Arial" selected>Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Arial Black">Arial Black</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Garamond">Garamond</option>
                <option value="Georgia">Georgia</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Verdana">Verdana</option>
            </select>

            <!-- Font Size Stepper -->
            <div class="flex items-center border border-gray-300 rounded px-1 py-0.5 gap-0.5 bg-white/60">
                <button type="button" onclick="decreaseFontSize()" class="w-3.5 h-3.5 flex items-center justify-center hover:bg-gray-200 rounded text-xs font-bold text-gray-700">−</button>
                <input type="text" id="font-size-num" value="11" onchange="setNumericFontSize(this.value)" class="w-5 text-center bg-transparent text-[11px] font-semibold border-none outline-none text-gray-800">
                <button type="button" onclick="increaseFontSize()" class="w-3.5 h-3.5 flex items-center justify-center hover:bg-gray-200 rounded text-xs font-bold text-gray-700">+</button>
            </div>

            <!-- Size Preset -->
            <select id="font-size-preset" onchange="applyPresetFontSize(this.value)" class="bg-transparent border border-gray-300 text-[11px] font-semibold rounded px-1.5 py-0.5 cursor-pointer outline-none text-gray-700">
                <option value="small">Small</option>
                <option value="normal" selected>Normal</option>
                <option value="large">Large</option>
                <option value="huge">Huge</option>
            </select>

            <span class="w-px h-4 bg-gray-300"></span>

            <!-- B I U -->
            <div class="flex items-center gap-0.5">
                <button type="button" onclick="execCmd('bold')" class="px-1.5 py-0.5 hover:bg-gray-200/80 rounded font-bold text-xs text-gray-800" title="Bold">B</button>
                <button type="button" onclick="execCmd('italic')" class="px-1.5 py-0.5 hover:bg-gray-200/80 rounded italic font-serif text-xs text-gray-800" title="Italic">I</button>
                <button type="button" onclick="execCmd('underline')" class="px-1.5 py-0.5 hover:bg-gray-200/80 rounded underline text-xs text-gray-800" title="Underline">U</button>
            </div>
        </div>

        <div></div>
    </div>

    <!-- Floating Controls Group -->
    <!-- Floating Controls Group -->
    <div id="floating-container" class="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50">

        <!-- Action Buttons -->
        <div id="floating-actions" class="flex flex-col gap-3 transition-all duration-300 origin-bottom items-end">
            @if($readonly ?? false)
                {{-- Process / Status Updater Inline (Encoder and Admin) --}}
                <div class="bg-white p-4 rounded-xl shadow-lg border border-gray-200 w-64 mb-1 text-left">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Process / Status</label>
                    <div class="flex flex-col gap-2">
                        <select id="case-status-select" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-sm py-2 px-3 border">
                            <option value="Pending" {{ ($case->status ?? '') == 'Pending' ? 'selected' : '' }}>Pending</option>
                            <option value="Mediation" {{ ($case->status ?? '') == 'Mediation' ? 'selected' : '' }}>Mediation</option>
                            <option value="Resolved" {{ ($case->status ?? '') == 'Resolved' ? 'selected' : '' }}>Resolved</option>
                            <option value="Dismissed" {{ ($case->status ?? '') == 'Dismissed' ? 'selected' : '' }}>Dismissed</option>
                            <option value="Certified" {{ ($case->status ?? '') == 'Certified' ? 'selected' : '' }}>Certified</option>
                        </select>
                        <button type="button" onclick="updateStatus()" id="btn-update-status"
                            class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm flex justify-center items-center gap-2 transition-all shadow-sm">
                            <span class="material-icons-outlined text-sm">save</span>
                            <span>Update Status</span>
                        </button>
                    </div>
                </div>
                <button type="button" onclick="submitForm()"
                    class="px-6 py-3 bg-[#1c2434] hover:bg-[#2c3a4f] text-white rounded-full shadow-lg font-medium flex items-center justify-center w-full gap-2 transition-transform hover:scale-105">
                    <span class="material-icons-outlined">print</span>
                    <span>Print Document</span>
                </button>
                <button type="button" onclick="if(window.opener || window.history.length === 1) { window.close(); } else { window.history.back(); }"
                    class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg font-medium flex items-center justify-center w-full gap-2 transition-transform hover:scale-105">
                    <span class="material-icons-outlined">close</span>
                    <span>Close</span>
                </button>
            @else
                <button type="button" onclick="toggleLayoutMode()" id="layout-toggle-btn"
                    class="px-4 py-3 bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-all">
                    <span class="material-icons-outlined">square_foot</span>
                    <span class="font-medium">Layout</span>
                </button>

                <!-- Dynamic Field Buttons (Visible in Layout Mode) -->
                <button type="button" onclick="addField('text')" id="btn-add-text" style="display: none;"
                    class="px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-all">
                    <span class="material-icons-outlined">add</span>
                    <span class="font-medium">Add Text</span>
                </button>
                <button type="button" onclick="deleteSelectedField()" id="btn-delete-field" style="display: none;"
                    class="px-4 py-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 flex items-center gap-2 transition-all">
                    <span class="material-icons-outlined">delete</span>
                    <span class="font-medium">Delete</span>
                </button>

                <button type="button" onclick="toggleLockSelectedField()" id="btn-lock-field" style="display: none;"
                    class="px-4 py-3 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 flex items-center gap-2 transition-all">
                    <span class="material-icons-outlined" id="lock-icon">lock</span>
                    <span class="font-medium" id="lock-text">Lock</span>
                </button>

                <button type="button" onclick="copyLayoutConfig()" id="copy-layout-btn" title="Copy PHP Config"
                    style="display: none;"
                    class="px-4 py-3 bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center">
                    <span class="material-icons-outlined">code</span>
                </button>

                <button type="button" onclick="saveLayout()" id="btn-save-layout" style="display: none;"
                    class="px-4 py-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 flex items-center gap-2 transition-all">
                    <span class="material-icons-outlined">save</span>
                    <span class="font-medium">Save Layout</span>
                </button>

                <button type="button" onclick="submitToCase()" id="btn-submit-case"
                    class="px-6 py-3 bg-[#0F8C55] hover:bg-[#0D7A4A] text-white rounded-full shadow-lg font-medium flex items-center gap-2 transition-transform hover:scale-105">
                    <span class="material-icons-outlined">check_circle</span>
                    <span>Submit to Case</span>
                </button>

                <button type="button" onclick="submitForm()"
                    class="px-6 py-3 bg-[#e37400] hover:bg-[#d66c00] text-white rounded-full shadow-lg font-medium flex items-center gap-2 transition-transform hover:scale-105">
                    <span class="material-icons-outlined">picture_as_pdf</span>
                    <span>Download PDF</span>
                </button>
            @endif
        </div>

        <!-- Toggle Checkbox -->
        <label
            class="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 text-sm text-gray-600 select-none mt-2">
            <input type="checkbox" id="toggle-controls" checked onchange="toggleFloatingControls()"
                class="accent-blue-600 w-4 h-4 cursor-pointer">
            <span>Show Options</span>
        </label>

    </div>
    <!-- Read Only Controls (Handled above inside floating-container) -->

    <!-- Script for Toggle -->
    <script>

    </script>

    <style>
        /* Hide scrollbar for Chrome, Safari and Opera */
        .workspace::-webkit-scrollbar {
            display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .workspace {
            -ms-overflow-style: none;
            /* IE and Edge */
            scrollbar-width: none;
            /* Firefox */
        }

        @media print {
            @page {
                margin: 0;
                size: auto;
            }

            body {
                margin: 0;
                padding: 0;
                background: white !important;
                height: 100vh;
                /* Ensure full height */
            }

            #floating-container {
                display: none !important;
            }

            .workspace {
                display: block !important;
                /* Disable flex centering */
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
                height: auto !important;
                width: 100%;
            }

            .page-container {
                box-shadow: none !important;
                margin: 0 !important;
                width: 210mm;
                /* Force A4 width */
                height: 297mm;
                /* Force A4 height */
                overflow: hidden;
                /* clean edges */
                position: relative;
                left: 0 !important;
                top: 0 !important;
            }

            /* Optional: Hide header/footer if browser allows */
        }
    </style>

    <!-- Workspace -->
    <div class="workspace">
        <div class="page-container" id="page-canvas">
            <!-- Background Image -->
            @if(!empty($imageBase64))
                <img id="background-image" src="data:image/png;base64,{{ $imageBase64 }}" alt="Form Background">
            @else
                <div class="flex items-center justify-center h-full text-red-500">
                    Background not loaded.
                </div>
            @endif

            <!-- Field Layer -->
            <div class="field-layer" id="field-layer">
                @if(isset($fields) && is_array($fields))
                    @foreach($fields as $field)
                        @php
                            $fieldName = $field['name'] ?? 'field_' . $loop->index;
                            $fieldDefault = $field['default'] ?? '';
                            $rawH = $field['h'] ?? 'auto';
                            $hVal = ($rawH === 'auto' || $rawH === '' || $rawH === null || ($readonly ?? false)) ? 'auto' : $rawH;
                            $styles = "top: {$field['y']}; left: {$field['x']}; width: {$field['w']}; height: {$hVal}; min-height: 1.2em;";
                            
                            if (isset($field['font_family'])) {
                                $styles .= " font-family: '{$field['font_family']}', Arial, sans-serif;";
                            } else {
                                $styles .= " font-family: Arial, sans-serif;";
                            }

                            if (isset($field['font_size'])) {
                                $fontSize = $field['font_size'];
                                if (str_contains($fontSize, 'cqw')) {
                                    $num = floatval($fontSize);
                                    $ptSize = ($num > 0) ? number_format($num / 0.15, 1) . 'pt' : '11pt';
                                    $styles .= " font-size: {$ptSize}; font-size: {$fontSize};";
                                } else {
                                    $styles .= " font-size: {$fontSize};";
                                }
                            } else {
                                $styles .= " font-size: 1.6cqw;";
                            }

                            if (isset($field['class'])) {
                                if (str_contains($field['class'], 'text-right'))
                                    $styles .= " text-align: right;";
                                if (str_contains($field['class'], 'text-center'))
                                    $styles .= " text-align: center;";
                            }
                            $isLocked = !empty($field['locked']);
                        @endphp

                        @if(isset($field['type']) && $field['type'] === 'checkbox')
                            <!-- Checkbox Field -->
                            <div class="doc-field cursor-pointer {{ $field['class'] ?? '' }}" style="{{ $styles }}"
                                id="field-{{ $fieldName }}" data-name="{{ $fieldName }}" data-type="checkbox"
                                data-x="{{ $field['x'] }}" data-y="{{ $field['y'] }}" data-w="{{ $field['w'] }}" data-h="{{ $hVal }}"
                                data-locked="{{ $isLocked ? 'true' : 'false' }}"
                                onclick="{{ ($readonly ?? false) ? '' : 'toggleCheckbox(this)' }}">{!! $fieldDefault !!}
                                @if(!($readonly ?? false))
                                    <div class="resizer-r"></div>
                                    <div class="resizer-b"></div>
                                    <div class="resizer-l"></div>
                                    <div class="resizer-t"></div>
                                @endif
                            </div>
                        @else
                            <!-- Content Editable Div -->
                            <div class="doc-field {{ $field['class'] ?? '' }}" style="{{ $styles }}"
                                contenteditable="{{ ($readonly ?? false) ? 'false' : 'true' }}" id="field-{{ $fieldName }}"
                                data-name="{{ $fieldName }}" placeholder="{{ $field['label'] ?? '' }}"
                                data-x="{{ $field['x'] }}" data-y="{{ $field['y'] }}" data-w="{{ $field['w'] }}" data-h="{{ $hVal }}"
                                data-locked="{{ $isLocked ? 'true' : 'false' }}">
                                {!! $fieldDefault !!}
                                @if(!($readonly ?? false))
                                    <div class="resizer-r" contenteditable="false"></div>
                                    <div class="resizer-b" contenteditable="false"></div>
                                    <div class="resizer-l" contenteditable="false"></div>
                                    <div class="resizer-t" contenteditable="false"></div>
                                @endif
                            </div>
                        @endif
                    @endforeach
                @endif
            </div>
        </div>
    </div>

    <!-- Hidden Form for Submission -->
    <form id="doc-form" action="{{ route('documents.generate') }}" method="POST" target="_blank" class="hidden">
        @csrf
        <input type="hidden" name="type" value="{{ $type }}">
        <input type="hidden" name="action" value="preview">
        <input type="hidden" name="layout_overrides" id="layout-overrides">
        <div id="hidden-inputs-container"></div>
    </form>


    <!-- Scripts -->
    <script>
        // --- Toolbar Formatting Helpers ---
        function execCmd(command, value = null) {
            document.execCommand(command, false, value);
        }

        function applyFontFamily(font) {
            document.execCommand('fontName', false, font);
        }

        function increaseFontSize() {
            const numInput = document.getElementById('font-size-num');
            let val = parseInt(numInput.value) || 11;
            val += 1;
            numInput.value = val;
            setNumericFontSize(val);
        }

        function decreaseFontSize() {
            const numInput = document.getElementById('font-size-num');
            let val = parseInt(numInput.value) || 11;
            if (val > 6) val -= 1;
            numInput.value = val;
            setNumericFontSize(val);
        }

        function setNumericFontSize(val) {
            const pt = parseInt(val) || 11;
            document.execCommand('fontSize', false, '3');
            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const fontEls = range.commonAncestorContainer.parentElement ? range.commonAncestorContainer.parentElement.querySelectorAll('font[size="3"]') : [];
                fontEls.forEach(el => {
                    el.removeAttribute('size');
                    el.style.fontSize = pt + 'pt';
                });
            }
        }

        function applyPresetFontSize(preset) {
            let pt = 11;
            if (preset === 'small') pt = 9;
            if (preset === 'normal') pt = 11;
            if (preset === 'large') pt = 14;
            if (preset === 'huge') pt = 18;
            const numInput = document.getElementById('font-size-num');
            if (numInput) numInput.value = pt;
            setNumericFontSize(pt);
        }

        function setZoom(zoomPercent) {
            const canvas = document.getElementById('page-canvas');
            if (canvas) {
                canvas.style.transform = `scale(${zoomPercent / 100})`;
                canvas.style.transformOrigin = 'top center';
            }
        }

        function triggerAIAlign() {
            const btn = document.getElementById('aiAlignBtn');
            if (!btn) return;
            const orig = btn.innerHTML;
            btn.innerHTML = '✨ Aligning...';
            btn.disabled = true;

            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            fetch('/api/ai/align-layout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify({ type: '{{ $type }}' })
            })
            .then(r => r.json())
            .then(data => {
                btn.innerHTML = '✨ Aligned!';
                if (data.success && data.layout) {
                    // Update field positions live if returned
                    window.location.reload();
                } else {
                    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1500);
                }
            })
            .catch(() => {
                btn.innerHTML = orig;
                btn.disabled = false;
            });
        }


        const isReadonly = {{ ($readonly ?? false) ? 'true' : 'false' }};
        const caseId = {{ $case->id ?? 'null' }};
        let isEditing = false;

        function updateStatus() {
            const status = document.getElementById('case-status-select').value;
            const btn = document.getElementById('btn-update-status');
            const originalContent = btn.innerHTML;

            btn.innerHTML = '<span class="material-icons-outlined animate-spin text-sm">refresh</span> <span class="text-sm">Updating...</span>';
            btn.disabled = true;
            btn.classList.add('opacity-75');

            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            fetch(`/cases/${caseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify({
                    status: status
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    btn.innerHTML = '<span class="material-icons-outlined text-sm">check</span> <span class="text-sm">Updated</span>';
                    btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                    btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    alert('Error: ' + data.message);
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                btn.innerHTML = originalContent;
                btn.disabled = false;
                btn.classList.remove('opacity-75', 'bg-emerald-600', 'hover:bg-emerald-700');
                btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            });
        }

        // Disable editing in readonly mode (initial)
        if (isReadonly) {
            document.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('.doc-field').forEach(el => {
                    el.setAttribute('contenteditable', 'false');
                    el.style.cursor = 'default';
                });
            });
        }

        // --- Checkbox Logic ---
        function toggleCheckbox(el) {
            if (isReadonly && !isEditing) return; // Allow if editing
            if (isLayoutMode) return;
            el.innerText = el.innerText.trim() === 'X' ? '' : 'X';
        }


        // --- Form Submission ---
        function submitForm() {
            const container = document.getElementById('hidden-inputs-container');
            container.innerHTML = ''; // Clear previous

            if (caseId && caseId !== 'null') {
                const caseInput = document.createElement('input');
                caseInput.type = 'hidden';
                caseInput.name = 'case_id';
                caseInput.value = caseId;
                container.appendChild(caseInput);
            }

            const fields = document.querySelectorAll('.doc-field');
            const parent = document.getElementById('page-canvas');
            const parentW = parent.offsetWidth;
            const parentH = parent.offsetHeight;

            let overrides = {};

            fields.forEach(field => {
                const name = field.getAttribute('data-name');
                const value = field.innerText.trim(); // Trim whitespace

                // Create hidden input for value
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                container.appendChild(input);

                // Use explicit stored attributes unless in layout mode
                let x = field.getAttribute('data-x');
                let y = field.getAttribute('data-y');
                let w = field.getAttribute('data-w');
                let h = field.getAttribute('data-h') || 'auto';

                if (!x || isLayoutMode) {
                    x = (field.offsetLeft / parentW * 100).toFixed(2) + '%';
                }
                if (!y || isLayoutMode) {
                    y = (field.offsetTop / parentH * 100).toFixed(2) + '%';
                }
                if (!w || isLayoutMode) {
                    w = (field.offsetWidth / parentW * 100).toFixed(2) + '%';
                }
                if (isLayoutMode && field.style.height && field.style.height !== 'auto') {
                    h = (field.offsetHeight / parentH * 100).toFixed(2) + '%';
                }

                overrides[name] = { x, y, w, h };
            });

            // Store overrides in hidden input
            document.getElementById('layout-overrides').value = JSON.stringify(overrides);

            document.getElementById('doc-form').submit();
        }

        // --- Layout Editing Logic ---
        let isLayoutMode = false;
        let selectedEls = []; // Array of selected fields

        function toggleLayoutMode() {
            isLayoutMode = !isLayoutMode;
            document.body.classList.toggle('edit-layout-mode', isLayoutMode);

            const btn = document.getElementById('layout-toggle-btn');
            const copyBtn = document.getElementById('copy-layout-btn');
            const addTextBtn = document.getElementById('btn-add-text');
            const deleteBtn = document.getElementById('btn-delete-field');
            const saveBtn = document.getElementById('btn-save-layout');
            const lockBtn = document.getElementById('btn-lock-field');

            const fields = document.querySelectorAll('.doc-field');

            if (isLayoutMode) {
                btn.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-300');
                btn.innerHTML = '<span class="material-icons-outlined text-base">check</span> Done Editing';

                if (copyBtn) copyBtn.style.display = 'flex';
                if (addTextBtn) addTextBtn.style.display = 'flex';
                if (saveBtn) saveBtn.style.display = 'flex';

                updateLockBtnState();
                enableDragAndResize();

                // Disable content editing while in layout mode to prevent focus stealing
                fields.forEach(el => {
                    if (el.getAttribute('data-type') !== 'checkbox') {
                        el.setAttribute('contenteditable', 'false');
                    }
                });

            } else {
                btn.classList.remove('bg-blue-50', 'text-blue-700', 'border-blue-300');
                btn.innerHTML = '<span class="material-icons-outlined text-base">square_foot</span> Edit Layout';

                if (copyBtn) copyBtn.style.display = 'none';
                if (addTextBtn) addTextBtn.style.display = 'none';
                if (deleteBtn) deleteBtn.style.display = 'none';
                if (saveBtn) saveBtn.style.display = 'none';
                if (lockBtn) lockBtn.style.display = 'none';

                disableDragAndResize();
                deselectField();

                // Re-enable content editing
                fields.forEach(el => {
                    if (el.getAttribute('data-type') !== 'checkbox') {
                        el.setAttribute('contenteditable', 'true');
                    }
                });
            }
        }

        // Set background click handlers to deselect when clicking canvas or workspace
        document.addEventListener('DOMContentLoaded', () => {
            const fieldLayer = document.getElementById('field-layer');
            if (fieldLayer) {
                fieldLayer.addEventListener('mousedown', function(e) {
                    if (e.target === this) {
                        deselectField();
                    }
                });
            }
            const workspace = document.querySelector('.workspace');
            if (workspace) {
                workspace.addEventListener('mousedown', function(e) {
                    if (e.target === this) {
                        deselectField();
                    }
                });
            }
        });

        function addField(type) {
            const id = 'custom_' + Date.now();
            const parent = document.getElementById('field-layer');
            const layer = document.querySelector('.field-layer') || document.querySelector('.workspace');

            const div = document.createElement('div');
            div.id = 'field-' + id;
            div.setAttribute('data-name', id);
            div.className = 'doc-field';
            div.style.top = '50px';
            div.style.left = '50px';
            div.setAttribute('data-locked', 'false');

            if (type === 'checkbox') {
                // Removed per user request
            } else {
                div.contentEditable = true;
                div.style.width = '150px';
                div.style.height = 'auto';
                div.style.minHeight = '20px';
                div.innerText = 'New Text';
                div.setAttribute('placeholder', 'Label');
            }

            // Add Resizers
            const rR = document.createElement('div'); rR.className = 'resizer-r'; rR.contentEditable = false; div.appendChild(rR);
            const rB = document.createElement('div'); rB.className = 'resizer-b'; rB.contentEditable = false; div.appendChild(rB);
            const rL = document.createElement('div'); rL.className = 'resizer-l'; rL.contentEditable = false; div.appendChild(rL);
            const rT = document.createElement('div'); rT.className = 'resizer-t'; rT.contentEditable = false; div.appendChild(rT);

            layer.appendChild(div);

            if (isLayoutMode) {
                makeDraggable(div);
                selectField(div, false);
            }
        }

        function deleteSelectedField() {
            if (selectedEls.length > 0) {
                const count = selectedEls.length;
                if (confirm(`Delete ${count} selected field${count > 1 ? 's' : ''}?`)) {
                    selectedEls.forEach(el => {
                        el.remove();
                    });
                    selectedEls = [];
                    updateLockBtnState();
                }
            } else {
                alert('Click a field to select it first.');
            }
        }

        function selectField(el, append = false) {
            if (!append) {
                selectedEls.forEach(item => {
                    item.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
                });
                selectedEls = [el];
            } else {
                const index = selectedEls.indexOf(el);
                if (index > -1) {
                    el.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
                    selectedEls.splice(index, 1);
                    updateLockBtnState();
                    return;
                } else {
                    selectedEls.push(el);
                }
            }

            el.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
            updateLockBtnState();
        }

        function deselectField() {
            selectedEls.forEach(item => {
                item.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
            });
            selectedEls = [];
            updateLockBtnState();
        }

        function toggleLockSelectedField() {
            if (selectedEls.length === 0) return;

            const anyLocked = selectedEls.some(el => el.getAttribute('data-locked') === 'true');
            const targetState = anyLocked ? 'false' : 'true';

            selectedEls.forEach(el => {
                el.setAttribute('data-locked', targetState);
            });

            updateLockBtnState();
        }

        function updateLockBtnState() {
            const lockBtn = document.getElementById('btn-lock-field');
            const lockIcon = document.getElementById('lock-icon');
            const lockText = document.getElementById('lock-text');
            const deleteBtn = document.getElementById('btn-delete-field');

            if (!lockBtn) return;

            if (selectedEls.length === 0 || !isLayoutMode) {
                lockBtn.style.display = 'none';
                if (deleteBtn) deleteBtn.style.display = 'none';
                return;
            }

            lockBtn.style.display = 'flex';
            if (deleteBtn) deleteBtn.style.display = 'flex';

            const anyLocked = selectedEls.some(el => el.getAttribute('data-locked') === 'true');
            if (anyLocked) {
                lockIcon.innerText = 'lock_open';
                lockText.innerText = 'Unlock';
                lockBtn.classList.remove('bg-amber-600', 'hover:bg-amber-700');
                lockBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            } else {
                lockIcon.innerText = 'lock';
                lockText.innerText = 'Lock';
                lockBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                lockBtn.classList.add('bg-amber-600', 'hover:bg-amber-700');
            }
        }

        function makeDraggable(el) {
            el.onmousedown = onMouseDown;
            const rR = el.querySelector('.resizer-r');
            const rB = el.querySelector('.resizer-b');
            const rL = el.querySelector('.resizer-l');
            const rT = el.querySelector('.resizer-t');

            if (rR) rR.onmousedown = (e) => onResizeStart(e, 'w'); // w = width (right)
            if (rB) rB.onmousedown = (e) => onResizeStart(e, 'h'); // h = height (bottom)
            if (rL) rL.onmousedown = (e) => onResizeStart(e, 'l'); // l = left
            if (rT) rT.onmousedown = (e) => onResizeStart(e, 't'); // t = top
        }

        function enableDragAndResize() {
            document.querySelectorAll('.doc-field').forEach(el => {
                makeDraggable(el);
            });
        }

        function disableDragAndResize() {
            document.querySelectorAll('.doc-field').forEach(el => {
                el.onmousedown = null;
                const rR = el.querySelector('.resizer-r');
                const rB = el.querySelector('.resizer-b');
                const rL = el.querySelector('.resizer-l');
                const rT = el.querySelector('.resizer-t');
                if (rR) rR.onmousedown = null;
                if (rB) rB.onmousedown = null;
                if (rL) rL.onmousedown = null;
                if (rT) rT.onmousedown = null;
            });
        }

        // Resize State
        let resizingEl = null;
        let resizingFields = [];
        let resizeRefX, resizeRefY, resizeMode;

        function onResizeStart(e, mode) {
            if (!isLayoutMode) return;
            
            const clickedField = e.currentTarget.parentElement;
            if (clickedField.getAttribute('data-locked') === 'true') return;

            e.preventDefault();
            e.stopPropagation(); // Prevent drag

            resizingEl = clickedField;
            resizeMode = mode;
            resizeRefX = e.clientX;
            resizeRefY = e.clientY;

            // Make sure the clicked field is part of the selection.
            if (!selectedEls.includes(resizingEl)) {
                selectField(resizingEl, false);
            }

            resizingFields = [];
            selectedEls.forEach(el => {
                if (el.getAttribute('data-locked') !== 'true') {
                    resizingFields.push({
                        el: el,
                        startW: el.offsetWidth,
                        startH: el.offsetHeight,
                        startLeft: el.offsetLeft,
                        startTop: el.offsetTop
                    });
                }
            });

            document.addEventListener('mousemove', onResizeMove);
            document.addEventListener('mouseup', onResizeEnd);
        }

        function onResizeMove(e) {
            if (!resizingEl || resizingFields.length === 0) return;
            e.preventDefault();

            const dx = e.clientX - resizeRefX;
            const dy = e.clientY - resizeRefY;

            resizingFields.forEach(item => {
                if (resizeMode === 'w') {
                    item.el.style.width = (item.startW + dx) + 'px';
                } else if (resizeMode === 'h') {
                    item.el.style.height = (item.startH + dy) + 'px';
                } else if (resizeMode === 'l') {
                    item.el.style.width = (item.startW - dx) + 'px';
                    item.el.style.left = (item.startLeft + dx) + 'px';
                } else if (resizeMode === 't') {
                    item.el.style.height = (item.startH - dy) + 'px';
                    item.el.style.top = (item.startTop + dy) + 'px';
                }
            });
        }

        function updateFieldDataPos(el) {
            const parent = document.getElementById('page-canvas');
            if (!parent) return;
            const parentW = parent.offsetWidth;
            const parentH = parent.offsetHeight;
            if (parentW && parentH) {
                const x = ((el.offsetLeft / parentW) * 100).toFixed(2) + '%';
                const y = ((el.offsetTop / parentH) * 100).toFixed(2) + '%';
                const w = ((el.offsetWidth / parentW) * 100).toFixed(2) + '%';
                let h = 'auto';
                if (el.style.height && el.style.height !== 'auto') {
                    h = ((el.offsetHeight / parentH) * 100).toFixed(2) + '%';
                }
                el.setAttribute('data-x', x);
                el.setAttribute('data-y', y);
                el.setAttribute('data-w', w);
                el.setAttribute('data-h', h);
            }
        }

        function onResizeEnd() {
            if (resizingFields.length > 0) {
                resizingFields.forEach(item => {
                    updateFieldDataPos(item.el);
                });
            }
            resizingEl = null;
            resizingFields = [];
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('mouseup', onResizeEnd);
        }

        // Draggable State
        let draggedEl = null;
        let draggedFields = [];
        let startX, startY;

        function onMouseDown(e) {
            if (!isLayoutMode) return;

            // Ignore if clicking on resizers
            if (e.target.classList.contains('resizer-r') ||
                e.target.classList.contains('resizer-b') ||
                e.target.classList.contains('resizer-l') ||
                e.target.classList.contains('resizer-t')) return;

            // Prevent default to stop text selection or focus
            e.preventDefault();

            const clickedEl = e.currentTarget;

            // Toggle/append with Ctrl key
            if (e.ctrlKey) {
                selectField(clickedEl, true);
            } else {
                if (!selectedEls.includes(clickedEl)) {
                    selectField(clickedEl, false);
                }
            }

            // Locked fields cannot be dragged
            if (clickedEl.getAttribute('data-locked') === 'true') {
                return;
            }

            draggedEl = clickedEl;
            startX = e.clientX;
            startY = e.clientY;

            // Collect starting positions for all selected, unlocked fields
            draggedFields = [];
            selectedEls.forEach(el => {
                if (el.getAttribute('data-locked') !== 'true') {
                    el.style.zIndex = 1000; // Bring to front during drag
                    draggedFields.push({
                        el: el,
                        startLeft: el.offsetLeft,
                        startTop: el.offsetTop
                    });
                }
            });

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(e) {
            if (!draggedEl || draggedFields.length === 0) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            draggedFields.forEach(item => {
                item.el.style.left = (item.startLeft + dx) + 'px';
                item.el.style.top = (item.startTop + dy) + 'px';
            });
        }

        function onMouseUp() {
            if (draggedFields.length > 0) {
                draggedFields.forEach(item => {
                    item.el.style.zIndex = ''; // Reset z-index
                    updateFieldDataPos(item.el);
                });
            }
            draggedEl = null;
            draggedFields = [];
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        // --- Simulate Submission ---
        function submitToCase() {
            // Gather all data, including dynamic fields
            const fields = document.querySelectorAll('.doc-field');
            let formData = {};

            fields.forEach(el => {
                const name = el.getAttribute('data-name');
                const type = el.getAttribute('data-type');
                let key = name;

                // Simple mapping for demo (ensure backend keys match)
                if (key === 'case_no') key = 'case_no';
                if (key === 'complainant') key = 'complainant';
                if (key === 'respondent') key = 'respondent';
                // ... map others or trust frontend names match backend validation

                let value = el.innerText.trim();
                if (type === 'checkbox') {
                    value = el.innerText.trim() === 'X' ? 1 : 0;
                }
                formData[name] = value;
            });

            // Add document type for nature of case
            formData['document_type'] = document.querySelector('input[name="type"]').value;

            // Capture Layout Overrides (Positions)
            const overrides = {};
            const parent = document.getElementById('field-layer');
            const parentW = parent.offsetWidth;
            const parentH = parent.offsetHeight;

            fields.forEach(el => {
                const name = el.getAttribute('data-name');
                const x = (el.offsetLeft / parentW * 100).toFixed(2) + '%';
                const y = (el.offsetTop / parentH * 100).toFixed(2) + '%';
                const w = (el.offsetWidth / parentW * 100).toFixed(2) + '%';
                let h = 'auto';
                if (el.style.height && el.style.height !== 'auto') {
                    h = (el.offsetHeight / parentH * 100).toFixed(2) + '%';
                }
                overrides[name] = { x, y, w, h };
            });
            formData['layout_overrides'] = overrides;

            console.log("Submitting Data to Case System:", formData);
            // Debugging: Check specific fields
            if (!formData['document_type']) console.warn('Warning: document_type is missing');
            if (!formData['complainant']) console.warn('Warning: complainant is missing');
            if (!formData['respondent']) console.warn('Warning: respondent is missing');

            const btn = document.querySelector('#btn-submit-case');
            const originalContent = btn.innerHTML;

            const isUpdate = caseId && caseId !== 'null';
            const url = isUpdate ? `/cases/${caseId}` : '/cases';
            const method = isUpdate ? 'PUT' : 'POST';

            btn.innerHTML = '<span class="material-icons-outlined animate-spin">refresh</span> ' + (isUpdate ? 'Updating...' : 'Submitting...');
            btn.disabled = true;
            btn.classList.add('opacity-75');

            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        btn.innerHTML = '<span class="material-icons-outlined">check</span> ' + (isUpdate ? 'Updated' : 'Submitted');
                        btn.classList.remove('bg-[#0F8C55]', 'hover:bg-[#0D7A4A]');
                        btn.classList.add('bg-gray-500', 'cursor-default');

                        alert('Success! ' + data.message);

                        // improved feedback
                        setTimeout(() => {
                            if (isUpdate) {
                                // Reload to view mode (remove edit query param)
                                window.location.href = window.location.pathname;
                            } else {
                                // Optional: Redirect to cases index or dashboard?
                                // window.location.href = '/cases'; 
                            }
                        }, 1000);
                    } else {
                        throw new Error(data.message || 'Unknown error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert((isUpdate ? 'Update' : 'Submission') + ' Failed: ' + error.message);

                    // Reset button
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75', 'bg-gray-500', 'cursor-default');
                    btn.classList.add('bg-[#0F8C55]', 'hover:bg-[#0D7A4A]');
                });
        }

        // --- Export Config ---
        function copyLayoutConfig() {
            const fields = document.querySelectorAll('.doc-field');
            const parent = document.getElementById('page-canvas');
            const parentW = parent.offsetWidth;
            const parentH = parent.offsetHeight;

            let output = "[\n";
            fields.forEach(el => {
                const name = el.getAttribute('data-name');
                const label = el.getAttribute('placeholder');

                // Convert px to %
                const x = (el.offsetLeft / parentW * 100).toFixed(1) + '%';
                const y = (el.offsetTop / parentH * 100).toFixed(1) + '%';
                const w = (el.offsetWidth / parentW * 100).toFixed(1) + '%';
                const h = el.style.height.includes('%') ? el.style.height : 'auto';

                // Detect classes
                let classes = [];
                if (el.style.textAlign === 'right') classes.push('text-right');
                if (el.style.textAlign === 'center') classes.push('text-center');

                let classStr = classes.length ? `, 'class' => '${classes.join(' ')}'` : '';
                let typeStr = el.style.height !== 'auto' && parseInt(el.style.height) > 30 ? ", 'type' => 'textarea'" : "";
                let lockedStr = el.getAttribute('data-locked') === 'true' ? ", 'locked' => true" : "";

                output += `    ['name' => '${name}', 'label' => '${label}', 'x' => '${x}', 'y' => '${y}', 'w' => '${w}', 'h' => '${h}'${classStr}${typeStr}${lockedStr}],\n`;
            });
            output += "]";

            // Copy to clipboard
            navigator.clipboard.writeText(output).then(() => {
                alert("PHP Array Configuration copied to clipboard! Paste it into FormLayouts.php");
            });
            console.log(output);
        }

        function saveLayout() {
            const fields = document.querySelectorAll('.doc-field');
            const layout = [];
            const container = document.getElementById('page-canvas');

            // Use getBoundingClientRect for more accurate relative positioning
            const containerRect = container.getBoundingClientRect();
            const parentW = containerRect.width;
            const parentH = containerRect.height;

            if (parentW === 0 || parentH === 0) {
                alert('Error: Canvas dimensions are zero. Cannot save layout.');
                return;
            }

            fields.forEach(field => {
                const fieldRect = field.getBoundingClientRect();
                const name = field.getAttribute('data-name');

                // Calculate relative position based on viewport rects
                const relativeLeft = fieldRect.left - containerRect.left;
                const relativeTop = fieldRect.top - containerRect.top;

                const x = (relativeLeft / parentW * 100).toFixed(4) + '%';
                const y = (relativeTop / parentH * 100).toFixed(4) + '%';
                const w = (fieldRect.width / parentW * 100).toFixed(4) + '%';

                let h = field.style.height;
                if (!h || h === 'auto') {
                    if (field.style.height && field.style.height !== 'auto') {
                        h = field.style.height;
                    } else {
                        h = 'auto';
                    }
                } else if (h.includes('px')) {
                    h = (parseFloat(h) / parentH * 100).toFixed(4) + '%';
                }

                layout.push({
                    name: name,
                    x: x,
                    y: y,
                    w: w,
                    h: h,
                    class: field.className.replace('doc-field', '').replace('cursor-pointer', '').replace('ring-2', '').replace('ring-blue-500', '').replace('bg-blue-50', '').trim(),
                    type: field.getAttribute('data-type') || 'text',
                    default: field.innerHTML,
                    locked: field.getAttribute('data-locked') === 'true'
                });
            });

            const btn = document.getElementById('btn-save-layout');
            const originalContent = btn.innerHTML;

            btn.innerHTML = '<span class="material-icons-outlined animate-spin">refresh</span> Saving...';
            btn.disabled = true;
            btn.classList.add('opacity-75');

            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            fetch('/documents/save-layout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify({
                    document_type: '{{ $type }}',
                    layout: layout
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        btn.innerHTML = '<span class="material-icons-outlined">check_circle</span> Saved!';
                        setTimeout(() => {
                            btn.innerHTML = originalContent;
                            btn.disabled = false;
                            btn.classList.remove('opacity-75');
                        }, 2000);
                    } else {
                        alert('Error saving layout: ' + (data.message || 'Unknown error'));
                        btn.innerHTML = originalContent;
                        btn.disabled = false;
                        btn.classList.remove('opacity-75');
                    }
                })
                .catch(error => {
                    console.error('Save Error:', error);
                    alert('Connection error while saving.');
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75');
                });
        }

    </script>
</body>

</html>