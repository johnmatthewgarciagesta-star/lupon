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
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            color: #000;
            line-height: normal;
            background: transparent;
            outline: none;
            cursor: text;
            /* Smooth transitions */
            transition: background 0.2s, box-shadow 0.2s;
            overflow: hidden;
            /* Hide overflow */
            padding: 2px;
            white-space: pre-wrap;
            /* Preserve whitespace */
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
    </style>
</head>

<body>

    <!-- Floating Controls Group -->
    <!-- Floating Controls Group -->
    <div id="floating-container" class="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50">

        <!-- Action Buttons -->
        <div id="floating-actions" class="flex flex-col gap-3 transition-all duration-300 origin-bottom">
            @if($readonly ?? false)
                <button type="button" onclick="enableEditing()" id="btn-enable-edit"
                    class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg font-medium flex items-center gap-2 transition-transform hover:scale-105">
                    <span class="material-icons-outlined">edit</span>
                    <span>Edit Case</span>
                </button>
                <button type="button" onclick="submitForm()"
                    class="px-6 py-3 bg-[#1c2434] hover:bg-[#2c3a4f] text-white rounded-full shadow-lg font-medium flex items-center gap-2 transition-transform hover:scale-105">
                    <span class="material-icons-outlined">picture_as_pdf</span>
                    <span>Print / Download</span>
                </button>
                <button type="button" onclick="window.close()"
                    class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg font-medium flex items-center gap-2 transition-transform hover:scale-105">
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
                            $styles = "top: {$field['y']}; left: {$field['x']}; width: {$field['w']}; height: " . ($field['h'] ?? 'auto') . ";";
                            if (isset($field['class'])) {
                                if (str_contains($field['class'], 'text-right'))
                                    $styles .= " text-align: right;";
                                if (str_contains($field['class'], 'text-center'))
                                    $styles .= " text-align: center;";
                            }
                        @endphp

                        @if(isset($field['type']) && $field['type'] === 'checkbox')
                            <!-- Checkbox Field -->
                            <div class="doc-field cursor-pointer {{ $field['class'] ?? '' }}" style="{{ $styles }}"
                                id="field-{{ $fieldName }}" data-name="{{ $fieldName }}" data-type="checkbox"
                                onclick="{{ ($readonly ?? false) ? '' : 'toggleCheckbox(this)' }}">{!! $fieldDefault !!}
                                <div class="resizer-r"></div>
                                <div class="resizer-b"></div>
                                <div class="resizer-l"></div>
                                <div class="resizer-t"></div>
                            </div>
                        @else
                            <!-- Content Editable Div -->
                            <div class="doc-field {{ $field['class'] ?? '' }}" style="{{ $styles }}"
                                contenteditable="{{ ($readonly ?? false) ? 'false' : 'true' }}" id="field-{{ $fieldName }}"
                                data-name="{{ $fieldName }}" placeholder="{{ $field['label'] ?? '' }}">
                                {!! $fieldDefault !!}
                                <div class="resizer-r" contenteditable="false"></div>
                                <div class="resizer-b" contenteditable="false"></div>
                                <div class="resizer-l" contenteditable="false"></div>
                                <div class="resizer-t" contenteditable="false"></div>
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
        <input type="hidden" name="action" value="download">
        <input type="hidden" name="layout_overrides" id="layout-overrides">
        <div id="hidden-inputs-container"></div>
    </form>


    <!-- Scripts -->
    <script>
        @if($missingData ?? false)
            alert('Notice: No document data found for this case. Showing default form.');
        @endif

        const isReadonly = {{ ($readonly ?? false) ? 'true' : 'false' }};
        const caseId = {{ $case->id ?? 'null' }};
        let isEditing = false;

        function enableEditing() {
            isEditing = true;
            // Enable contenteditable
            document.querySelectorAll('.doc-field').forEach(el => {
                if (el.getAttribute('data-type') !== 'checkbox') {
                    el.setAttribute('contenteditable', 'true');
                    el.style.cursor = 'text';
                }
            });

            // Reload page with readonly=false (edit mode)
            window.location.href = window.location.pathname + '?mode=edit';
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

                // Calculate positions for override
                // We send these to the backend to generate the PDF with exact visual positions
                const x = (field.offsetLeft / parentW * 100).toFixed(2) + '%';
                const y = (field.offsetTop / parentH * 100).toFixed(2) + '%';
                const w = (field.offsetWidth / parentW * 100).toFixed(2) + '%';

                let h = 'auto';
                // Check if height is explicitly set (via resize or style)
                if (field.style.height && field.style.height !== 'auto') {
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
        let selectedEl = null;

        function toggleLayoutMode() {
            isLayoutMode = !isLayoutMode;
            document.body.classList.toggle('edit-layout-mode', isLayoutMode);

            const btn = document.getElementById('layout-toggle-btn');
            const copyBtn = document.getElementById('copy-layout-btn');
            const addTextBtn = document.getElementById('btn-add-text');
            const deleteBtn = document.getElementById('btn-delete-field');
            const saveBtn = document.getElementById('btn-save-layout');

            const fields = document.querySelectorAll('.doc-field');

            if (isLayoutMode) {
                btn.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-300');
                btn.innerHTML = '<span class="material-icons-outlined text-base">check</span> Done Editing';

                if (copyBtn) copyBtn.style.display = 'flex';
                if (addTextBtn) addTextBtn.style.display = 'flex';
                if (deleteBtn) deleteBtn.style.display = 'flex';
                if (saveBtn) saveBtn.style.display = 'flex';

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

        // ... addField, deleteSelectedField, selectField, deselectField, makeDraggable ...

        function onMouseDown(e) {
            if (!isLayoutMode) return;

            // Ignore if clicking on resizers
            if (e.target.classList.contains('resizer-r') ||
                e.target.classList.contains('resizer-b') ||
                e.target.classList.contains('resizer-l') ||
                e.target.classList.contains('resizer-t')) return;

            // Prevent default to stop text selection or focus
            e.preventDefault();

            selectField(e.currentTarget);

            draggedEl = e.currentTarget;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = draggedEl.offsetLeft;
            startTop = draggedEl.offsetTop;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

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
                selectField(div);
            }
        }

        function deleteSelectedField() {
            if (selectedEl && confirm('Delete selected field?')) {
                selectedEl.remove();
                selectedEl = null;
            } else if (!selectedEl) {
                alert('Click a field to select it first.');
            }
        }

        function selectField(el) {
            if (selectedEl) {
                selectedEl.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
            }
            selectedEl = el;
            selectedEl.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
        }

        function deselectField() {
            if (selectedEl) {
                selectedEl.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
            }
            selectedEl = null;
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
        let resizeRefX, resizeRefY, resizeStartW, resizeStartH, resizeStartLeft, resizeStartTop, resizeMode;

        function onResizeStart(e, mode) {
            if (!isLayoutMode) return;
            e.preventDefault();
            e.stopPropagation(); // Prevent drag

            resizingEl = e.currentTarget.parentElement;
            resizeMode = mode;
            resizeRefX = e.clientX;
            resizeRefY = e.clientY;
            resizeStartW = resizingEl.offsetWidth;
            resizeStartH = resizingEl.offsetHeight;
            resizeStartLeft = resizingEl.offsetLeft;
            resizeStartTop = resizingEl.offsetTop;

            document.addEventListener('mousemove', onResizeMove);
            document.addEventListener('mouseup', onResizeEnd);
        }

        function onResizeMove(e) {
            if (!resizingEl) return;
            e.preventDefault();

            const dx = e.clientX - resizeRefX;
            const dy = e.clientY - resizeRefY;

            if (resizeMode === 'w') {
                resizingEl.style.width = (resizeStartW + dx) + 'px';
            } else if (resizeMode === 'h') {
                resizingEl.style.height = (resizeStartH + dy) + 'px';
            } else if (resizeMode === 'l') {
                resizingEl.style.width = (resizeStartW - dx) + 'px';
                resizingEl.style.left = (resizeStartLeft + dx) + 'px';
            } else if (resizeMode === 't') {
                resizingEl.style.height = (resizeStartH - dy) + 'px';
                resizingEl.style.top = (resizeStartTop + dy) + 'px';
            }
        }

        function onResizeEnd() {
            resizingEl = null;
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('mouseup', onResizeEnd);
        }

        // Draggable State
        let draggedEl = null;
        let startX, startY, startLeft, startTop;

        function onMouseDown(e) {
            if (!isLayoutMode) return;

            // Ignore if clicking on resizers
            if (e.target.classList.contains('resizer-r') ||
                e.target.classList.contains('resizer-b') ||
                e.target.classList.contains('resizer-l') ||
                e.target.classList.contains('resizer-t')) return;

            // Prevent default to stop text selection or focus
            e.preventDefault();

            selectField(e.currentTarget);

            draggedEl = e.currentTarget;
            draggedEl.style.zIndex = 1000; // Bring to front

            startX = e.clientX;
            startY = e.clientY;
            startLeft = draggedEl.offsetLeft;
            startTop = draggedEl.offsetTop;

            console.log('Drag Start:', { startX, startY, startLeft, startTop, el: draggedEl });

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(e) {
            if (!draggedEl) return;
            console.log('Dragging...');
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            draggedEl.style.left = (startLeft + dx) + 'px';
            draggedEl.style.top = (startTop + dy) + 'px';
        }

        function onMouseUp() {
            if (draggedEl) {
                console.log('Drag End');
                draggedEl.style.zIndex = ''; // Reset z-index
            }
            draggedEl = null;
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

                output += `    ['name' => '${name}', 'label' => '${label}', 'x' => '${x}', 'y' => '${y}', 'w' => '${w}', 'h' => '${h}'${classStr}${typeStr}],\n`;
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
                    class: field.className.replace('doc-field', '').replace('cursor-pointer', '').trim(),
                    type: field.getAttribute('data-type') || 'text',
                    default: field.innerHTML
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