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
            background: #f1f5f9;
            font-family: Arial, sans-serif;
        }

        .view-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 16px 40px;
            min-height: 100vh;
        }

        .view-header-bar {
            width: 100%;
            max-width: 210mm;
            background: #0f172a;
            color: #fff;
            padding: 12px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-action {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
        }

        .btn-secondary { background: #334155; color: #f8fafc; }
        .btn-secondary:hover { background: #475569; }
        .btn-primary { background: #2563eb; color: #ffffff; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-success { background: #16a34a; color: #ffffff; }
        .btn-success:hover { background: #15803d; }

        .page-container {
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            position: relative;
            overflow: hidden;
            background-color: white;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
            page-break-after: avoid;
            page-break-inside: avoid;
        }

        @media print {
            .view-wrapper { padding: 0 !important; }
            .view-header-bar { display: none !important; }
            .page-container { box-shadow: none !important; }
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
    <div class="view-wrapper">
        @if(isset($case))
        <div class="view-header-bar">
            <a href="{{ route('cases.index') }}" class="btn-action btn-secondary">
                ← Back to Cases
            </a>
            <div style="display:flex;gap:10px;align-items:center;">
                <a href="?mode=edit" class="btn-action btn-primary">
                    ✏️ Open Word Editor
                </a>
                <button onclick="window.print()" class="btn-action btn-success">
                    🖨️ Print Document
                </button>
            </div>
        </div>
        @endif

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
                        $name       = $field['name'] ?? '';
                        $value      = $data[$name] ?? ($field['default'] ?? '');
                        $x          = $field['x'] ?? '10%';
                        $y          = $field['y'] ?? '10%';
                        $w          = $field['w'] ?? '80%';
                        $rawH       = $field['h'] ?? 'auto';
                        $height     = ($rawH === 'auto' || $rawH === '' || $rawH === null) ? 'auto' : $rawH;
                        $fontFamily = $field['font_family'] ?? 'Arial, sans-serif';
                        
                        $rawFontSize = $field['font_size'] ?? '11pt';
                        if (str_contains($rawFontSize, 'cqw')) {
                            $num = floatval($rawFontSize);
                            $fontSize = ($num > 0) ? number_format($num / 0.15, 1) . 'pt' : '11pt';
                        } else {
                            $fontSize = $rawFontSize;
                        }

                        $classes = $field['class'] ?? '';
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
                                font-family: '{{ $fontFamily }}', Arial, sans-serif;
                                font-size: {{ $fontSize }};
                            "
                        >{{ $value }}</div>
                    @endif
                @endforeach
            @endif
        </div>
    </div>
</body>
</html>