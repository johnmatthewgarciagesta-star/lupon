<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document for PDF</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @page {
            size: A4;
            margin: 0;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .page-container {
            width: 210mm;
            /* 8.5 inches */
            height: 297mm;
            /* 11 inches */
            position: relative;
            overflow: hidden;
            background-color: white;

            margin: 0 auto;
            /* Center horizontally if there's space */
        }

        #background-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            object-fit: fill;
            /* Ensure it fills the page exactly, stretching if necessary */
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
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
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            font-weight: bold;
            color: #000;
        }

        /* Highlight user data */
    </style>
</head>

<body>
    <div class="page-container">
        <!-- Render the Ghostscript-generated Image -->
        @if(isset($imagePath))
            <img id="background-image" src="{{ $imagePath }}" alt="Form Background">
        @else
            <img id="background-image" src="data:image/png;base64,{{ $imageBase64 ?? '' }}" alt="Form Background">
        @endif

        <div class="data-layer">
            @if(isset($fields) && is_array($fields))
                @foreach($fields as $field)
                    <div id="field-{{ $field['name'] }}" class="data-field {{ $field['class'] ?? '' }}"
                        style="top: {{ $field['y'] }}; left: {{ $field['x'] }}; width: {{ $field['w'] }}; height: {{ $field['h'] ?? 'auto' }}; white-space: pre-wrap;">
                        {{ $data[$field['name']] ?? ($field['default'] ?? '') }}
                    </div>
                @endforeach
            @endif
        </div>
    </div>

    <!-- Real-time Sync Script -->
    <script>
        window.addEventListener('message', function (event) {
            const data = event.data;
            if (data.type === 'updateField') {
                const element = document.getElementById('field-' + data.name);
                if (element) {
                    element.textContent = data.value;
                }
            }
        });
    </script>
    <script>
        window.addEventListener('message', function (event) {
            const data = event.data;
            if (data.type === 'updateField') {
                const element = document.getElementById('field-' + data.name);
                if (element) {
                    element.textContent = data.value;
                }
            }
        });
    </script>
</body>

</html>