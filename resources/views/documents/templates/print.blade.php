<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document - {{ ucwords(str_replace('_', ' ', $type ?? 'form')) }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 0mm;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            overflow: hidden;
            background: white;
        }

        .page-container {
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            position: relative;
            overflow: hidden;
            background-color: white;
            /* Prevent Chromium from inserting a blank second page */
            page-break-after: avoid;
            page-break-inside: avoid;
        }

        #background-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            /* Fill the page exactly */
            object-fit: fill;
            display: block;
        }

        .data-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
        }

        .data-field {
            position: absolute;
            font-family: Calibri, 'Cambria', 'Segoe UI', Arial, sans-serif;
            font-size: 13pt;
            font-weight: bold;
            font-style: normal;
            color: #000000;
            text-decoration: none;
            background: transparent;
            border: none;
            outline: none;
            line-height: 1.2;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow: visible;
            padding: 0;
        }

        .data-field.text-right  { text-align: right; }
        .data-field.text-center { text-align: center; }
        .data-field.text-left   { text-align: left; }
    </style>
</head>

<body>
    <div class="page-container">
        <!-- Background: Ghostscript-rasterized form image -->
        @if(!empty($imagePath))
            <img id="background-image" src="{{ $imagePath }}" alt="Form">
        @elseif(!empty($imageBase64))
            <img id="background-image" src="data:image/png;base64,{{ $imageBase64 }}" alt="Form">
        @endif

        <!-- User-entered data, positioned over the form background -->
        <div class="data-layer">
            @if(isset($fields) && is_array($fields))
                @foreach($fields as $field)
                    @php
                        $name    = $field['name'] ?? '';
                        $value   = $data[$name] ?? ($field['default'] ?? '');
                        $x       = $field['x'] ?? '10%';
                        $y       = $field['y'] ?? '10%';
                        $w       = $field['w'] ?? '80%';
                        $rawH    = $field['h'] ?? 'auto';
                        $height  = ($rawH === 'auto' || $rawH === '' || $rawH === null) ? 'auto' : $rawH;
                        $classes = $field['class'] ?? '';
                        // Strip out classes that are visual-editor-only (flex, items-center, etc.)
                        $classes = preg_replace('/\b(flex|items-center|justify-center|bg-transparent|cursor-pointer|font-bold|text-xl)\b/', '', $classes);
                        $classes = trim(preg_replace('/\s+/', ' ', $classes));
                    @endphp

                    @if(!empty(trim((string)$value)))
                        <div
                            class="data-field {{ $classes }}"
                            style="
                                top: {{ $y }};
                                left: {{ $x }};
                                width: {{ $w }};
                                {{ $height !== 'auto' ? 'height: ' . $height . ';' : '' }}
                            "
                        >{{ $value }}</div>
                    @endif
                @endforeach
            @endif
        </div>
    </div>
</body>

</html>