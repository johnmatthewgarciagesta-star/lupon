<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Fill Out: {{ ucwords(str_replace('_', ' ', $type)) }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --brand: #2563eb;
            --brand-dark: #1e40af;
            --brand-light: #eff6ff;
            --brand-accent: #0ea5e9;
            --surface: #ffffff;
            --surface-alt: #f8fafc;
            --border: #e2e8f0;
            --border-focus: #3b82f6;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-placeholder: #94a3b8;
            --danger: #ef4444;
            --success: #10b981;
            --success-bg: #ecfdf5;
            --form-theme: #4f46e5;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background: #f1f5f9;
            font-family: 'Inter', 'Google Sans', sans-serif;
            color: var(--text-primary);
            min-height: 100vh;
            padding-bottom: 80px;
        }

        /* ===== HEADER BANNER ===== */
        .page-header {
            background: #0f172a;
            color: #fff;
            padding: 0;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .header-inner {
            max-width: 1000px;
            margin: 0 auto;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .header-logo {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .header-logo svg {
            width: 22px;
            height: 22px;
            fill: #fff;
        }

        .header-title-group {
            flex: 1;
        }

        .header-subtitle {
            font-size: 10px;
            font-weight: 700;
            opacity: 0.6;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header-title {
            font-size: 19px;
            font-weight: 700;
            letter-spacing: -0.4px;
            line-height: 1.1;
        }

        .header-actions {
            display: flex;
            gap: 10px;
        }

        .btn-header {
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-header-outline {
            background: rgba(255,255,255,0.05);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.2);
        }

        .btn-header-outline:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.4);
        }

        .btn-header-amber {
            background: #0ea5e9;
            color: #fff;
            border: none;
            font-weight: 700;
            box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);
        }

        .btn-header-amber:hover {
            background: #0284c7;
            transform: translateY(-1px);
        }

        /* ===== CALIBRATION OVERLAY (GOOGLE DOCS STYLE) ===== */
        .calibration-overlay {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 5000;
            background: #F9FBFD;
            flex-direction: column;
        }

        .calibration-overlay.active {
            display: flex;
        }

        .calibration-toolbar {
            background: #F9FBFD;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            flex-shrink: 0;
        }
        
        .calibration-toolbar-title {
            font-size: 18px;
            font-weight: 400;
            color: #1f1f1f;
            margin-bottom: 2px;
        }

        .calibration-toolbar-hint {
            font-size: 13px;
            color: #444746;
            display: flex;
            gap: 12px;
            cursor: pointer;
        }

        .calibration-body {
            flex: 1;
            overflow: auto;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 28px;
            gap: 0;
        }

        .calibration-paper {
            width: 595px;
            height: 842px;
            position: relative;
            background: white;
            box-shadow: 0 8px 40px rgba(0,0,0,0.6);
            flex-shrink: 0;
        }

        .calibration-paper img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: fill;
            pointer-events: none;
        }

        .calib-field {
            position: absolute;
            font-family: Arial, sans-serif;
            font-size: 11pt;
            font-weight: normal;
            color: #000;
            background: transparent;
            border: 1.5px dashed transparent;
            border-radius: 3px;
            padding: 2px 4px;
            white-space: pre-wrap;
            box-sizing: border-box;
            min-width: 40px;
            min-height: 20px;
            line-height: 1.2;
            transition: border-color 0.2s;
            outline: none;
            /* remove native resize */
        }

        .calib-field:hover, .calib-field:focus {
            background: rgba(26,115,232,0.04);
            border-color: #1a73e8;
        }

        .calib-field.dragging {
            border-color: #0B57D0;
            background: rgba(11,87,208,0.1);
            z-index: 100;
        }

        /* Top-right Drag Handle */
        .calib-drag-handle {
            position: absolute;
            top: -12px;
            right: -12px;
            width: 24px;
            height: 24px;
            background: #0B57D0;
            color: white;
            border-radius: 50%;
            cursor: grab;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            pointer-events: auto;
            user-select: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .calib-field:hover .calib-drag-handle, .calib-field:focus .calib-drag-handle {
            display: flex;
        }

        /* Bottom-right Resize Handle */
        .calib-resize-handle {
            position: absolute;
            bottom: -5px;
            right: -5px;
            width: 12px;
            height: 12px;
            background: #fff;
            border: 2px solid #0B57D0;
            cursor: nwse-resize;
            display: none;
            pointer-events: auto;
            user-select: none;
            z-index: 10;
        }

        .calib-field:hover .calib-resize-handle, .calib-field:focus .calib-resize-handle {
            display: block;
        }

        .calib-label-tag {
            position: absolute;
            top: -18px;
            left: 0;
            font-size: 10px;
            font-family: 'Inter', sans-serif;
            background: #0B57D0;
            color: #fff;
            padding: 2px 6px;
            border-radius: 3px 3px 0 0;
            white-space: nowrap;
            pointer-events: none;
            display: none;
        }

        .calib-field:hover .calib-label-tag, .calib-field:focus .calib-label-tag {
            display: block;
        }

        .calib-pos-readout {
            position: fixed;
            bottom: 80px;
            right: 24px;
            background: rgba(0,0,0,0.75);
            color: #fff;
            font-size: 11px;
            font-family: monospace;
            padding: 8px 12px;
            border-radius: 6px;
            display: none;
            z-index: 6000;
        }

        .calib-toast {
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background: #137333;
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            opacity: 0;
            transition: all 0.3s;
            z-index: 7000;
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: none;
        }

        .calib-toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        .btn-calib-save {
            background: #C2E7FF;
            color: #001D35;
            border: none;
            padding: 9px 24px;
            border-radius: 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .btn-calib-save:hover { background: #A2D9FF; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

        .btn-calib-cancel {
            background: transparent;
            color: #444746;
            border: none;
            padding: 9px 24px;
            border-radius: 24px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-calib-cancel:hover { background: #E1E5EA; }

        /* ===== PROGRESS BAR ===== */
        .progress-bar-wrap {
            background: rgba(255,255,255,0.1);
            height: 3px;
        }

        .progress-bar-fill {
            height: 100%;
            background: #fbbc04;
            transition: width 0.4s ease;
        }

        /* ===== LAYOUT ===== */
        .container {
            max-width: 760px;
            margin: 0 auto;
            padding: 28px 16px 100px;
        }

        /* ===== FORM CARD ===== */
        .form-card {
            background: var(--surface);
            border-radius: 12px;
            box-shadow: var(--shadow-sm);
            overflow: hidden;
            margin-bottom: 20px;
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }

        .form-card:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--border-focus);
        }

        /* ===== TITLE CARD ===== */
        .title-card {
            border-top: 10px solid var(--form-theme);
        }

        .title-card-inner {
            padding: 32px;
        }

        .form-doc-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #eef2ff;
            color: #4f46e5;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .form-doc-title {
            font-size: 28px;
            font-weight: 800;
            color: var(--text-primary);
            line-height: 1.1;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .form-doc-description {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.6;
        }

        .form-doc-divider {
            height: 1px;
            background: var(--border);
            margin: 24px 0 0;
        }

        /* ===== CASE INFO BANNER ===== */
        .case-banner {
            background: #f0fdf4;
            border: 1px solid #dcfce7;
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin-bottom: 20px;
        }

        .case-banner-icon {
            width: 22px;
            height: 22px;
            color: #16a34a;
            flex-shrink: 0;
            margin-top: 1px;
        }

        .case-banner-text strong {
            color: #166534;
            font-size: 14px;
            font-weight: 700;
            display: block;
            margin-bottom: 2px;
        }

        .case-banner-text span {
            font-size: 13px;
            color: #15803d;
        }

        /* ===== QUESTION CARD ===== */
        .question-card-inner {
            padding: 24px 32px;
        }

        .question-label {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            letter-spacing: -0.2px;
        }

        .question-label .required-star {
            color: var(--danger);
            font-size: 13px;
        }

        .question-hint {
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: -10px;
            margin-bottom: 12px;
        }

        /* ===== INPUTS ===== */
        .input-wrap {
            position: relative;
        }

        .form-input {
            width: 100%;
            border: 0;
            border-bottom: 1.5px solid var(--border);
            border-radius: 0;
            padding: 8px 2px;
            font-size: 14px;
            font-family: inherit;
            color: var(--text-primary);
            background: transparent;
            outline: none;
            transition: border-color 0.2s;
        }

        .form-input::placeholder {
            color: var(--text-placeholder);
        }

        .form-input:focus {
            border-bottom-color: var(--brand);
            border-bottom-width: 2px;
        }

        .form-input:focus ~ .input-line {
            transform: scaleX(1);
        }

        .form-textarea {
            width: 100%;
            border: 1.5px solid var(--border);
            border-radius: 6px;
            padding: 12px 14px;
            font-size: 14px;
            font-family: inherit;
            color: var(--text-primary);
            background: #fafafa;
            outline: none;
            resize: vertical;
            min-height: 120px;
            transition: border-color 0.2s, background 0.2s;
            line-height: 1.6;
        }

        .form-textarea::placeholder {
            color: var(--text-placeholder);
        }

        .form-textarea:focus {
            border-color: var(--brand);
            background: #fff;
        }

        /* ===== CHECKBOX ===== */
        .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 14px;
            cursor: pointer;
            padding: 10px 14px;
            border-radius: 8px;
            border: 1.5px solid transparent;
            transition: all 0.15s;
        }

        .checkbox-label:hover {
            background: var(--surface-alt);
        }

        .checkbox-label input[type="checkbox"] {
            display: none;
        }

        .checkbox-custom {
            width: 20px;
            height: 20px;
            border: 2px solid #5f6368;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.15s;
            background: #fff;
        }

        .checkbox-label input[type="checkbox"]:checked ~ .checkbox-custom {
            background: var(--brand);
            border-color: var(--brand);
        }

        .checkbox-label input[type="checkbox"]:checked ~ .checkbox-custom::after {
            content: '';
            width: 5px;
            height: 9px;
            border: 2px solid #fff;
            border-top: none;
            border-left: none;
            transform: rotate(45deg);
            margin-top: -2px;
        }

        .checkbox-label input[type="checkbox"]:checked ~ .checkbox-text {
            color: var(--brand);
            font-weight: 500;
        }

        .checkbox-text {
            font-size: 14px;
            color: var(--text-primary);
        }

        /* ===== SECTION DIVIDER ===== */
        .section-card {
            background: var(--surface);
            border-radius: 12px;
            box-shadow: var(--shadow-sm);
            overflow: hidden;
            margin-bottom: 16px;
            border-left: 6px solid var(--brand);
        }

        .section-card-inner {
            padding: 18px 28px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--brand);
            margin-bottom: 2px;
        }

        .section-desc {
            font-size: 13px;
            color: var(--text-secondary);
        }

        /* ===== PREVIEW PANEL ===== */
        .preview-panel {
            background: rgba(255,255,255,0.8);
            backdrop-filter: blur(8px);
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.4);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            margin-bottom: 24px;
            overflow: hidden;
        }

        .preview-header {
            padding: 16px 24px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .preview-title {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .preview-frame-wrap {
            padding: 20px;
            background: #f1f3f4;
            display: flex;
            justify-content: center;
        }

        .preview-frame {
            width: 100%;
            max-width: 595px;
            aspect-ratio: 210/297;
            background: white;
            position: relative;
            box-shadow: 0 2px 12px rgba(0,0,0,0.15);
            overflow: hidden;
            border-radius: 2px;
        }

        .preview-frame img.bg {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            object-fit: fill;
        }

        .preview-overlay {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
        }

        .preview-field-text {
            position: absolute;
            font-family: Arial, sans-serif;
            font-size: 9pt; /* Slightly larger for screen preview */
            font-weight: 500;
            font-style: normal;
            color: #000000;
            text-decoration: none;
            background: rgba(26,115,232,0.04); /* Subtle highlight to see where text will be */
            border-bottom: 1px dashed rgba(26,115,232,0.2);
            white-space: pre-wrap;
            line-height: 1.2;
            word-wrap: break-word;
            min-height: 1.2em;
            z-index: 50;
        }

        .preview-field-text:not(:empty) {
            background: rgba(26,115,232,0.08);
            border-bottom-style: solid;
        }

        /* ===== STICKY SUBMIT BAR ===== */
        .submit-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            border-top: 1px solid var(--border);
            padding: 16px 24px;
            z-index: 200;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
        }

        .submit-bar-inner {
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .submit-info {
            font-size: 13px;
            color: var(--text-secondary);
            font-weight: 500;
        }

        .submit-info strong {
            color: #1e293b;
            font-weight: 700;
        }

        .btn-submit {
            background: #0f172a;
            color: #ffffff;
            padding: 12px 32px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 15px;
            border: none;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .btn-submit:hover {
            background: var(--brand-dark);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(26,115,232,0.45);
        }

        .btn-submit:active {
            transform: translateY(0);
        }

        .btn-submit.loading {
            opacity: 0.8;
            cursor: not-allowed;
        }

        .btn-submit svg {
            width: 18px;
            height: 18px;
        }

        .btn-clear {
            background: transparent;
            color: var(--text-secondary);
            border: 1.5px solid var(--border);
            padding: 11px 20px;
            border-radius: 24px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-clear:hover {
            border-color: var(--danger);
            color: var(--danger);
            background: #fce8e6;
        }

        .btn-word {
            background: transparent;
            color: #217346;
            border: 1.5px solid #217346;
            padding: 11px 18px;
            border-radius: 24px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }

        .btn-word:hover {
            background: #217346;
            color: #fff;
        }

        /* ===== LOADER OVERLAY ===== */
        .loader-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            backdrop-filter: blur(4px);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 18px;
        }

        .loader-overlay.active {
            display: flex;
        }

        .loader-spinner {
            width: 52px;
            height: 52px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .loader-text {
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
        }

        .loader-subtext {
            color: rgba(255,255,255,0.7);
            font-size: 13px;
            margin-top: -12px;
        }

        /* ===== SCROLL INDICATOR ===== */
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: #fbbc04;
            z-index: 9998;
            transition: width 0.1s;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 600px) {
            .container { padding: 16px 10px 100px; }
            .question-card-inner { padding: 18px 18px; }
            .title-card-inner { padding: 20px 18px 18px; }
            .form-doc-title { font-size: 20px; }
            .header-inner { padding: 12px 16px; }
        }

        /* ===== PRINT (Ctrl+P) ===== */
        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }

            html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                width: 210mm;
                height: 297mm;
            }

            /* Hide ALL page chrome */
            .scroll-progress,
            .loader-overlay,
            .page-header,
            .case-banner,
            .title-card,
            .section-card,
            .submit-bar,
            .form-card,
            .preview-header {
                display: none !important;
            }

            /* Reset container to full page */
            .container {
                max-width: 100% !important;
                width: 210mm !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            /* Show preview panel as the only element */
            .preview-panel {
                display: block !important;
                width: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                page-break-inside: avoid;
            }

            /* Full A4 frame */
            .preview-frame-wrap {
                padding: 0 !important;
                background: white !important;
                width: 210mm !important;
            }

            .preview-frame {
                width: 210mm !important;
                height: 297mm !important;
                max-width: 100% !important;
                aspect-ratio: auto !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                overflow: hidden !important;
                position: relative !important;
            }

            /* Text overlay printed black, Arial, no decoration */
            .preview-field-text {
                color: #000000 !important;
                font-family: Arial, sans-serif !important;
                font-weight: normal !important;
                font-style: normal !important;
                text-decoration: none !important;
                border: none !important;
                background: transparent !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            /* Background image must print */
            .preview-frame img.bg {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    </style>
</head>

<body>

<!-- Scroll Progress -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- Loader Overlay -->
<div class="loader-overlay" id="loaderOverlay">
    <div class="loader-spinner"></div>
    <div class="loader-text">Generating PDF...</div>
    <div class="loader-subtext">Please wait, your document is being prepared</div>
</div>

<!-- Header -->
<header class="page-header">
    <div class="header-inner">
        <div class="header-logo">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>
        </div>
        <div class="header-title-group">
            <div class="header-subtitle">Lupon ng Tagapamayapa</div>
            <div class="header-title">{{ ucwords(str_replace('_', ' ', $type)) }}</div>
        </div>
        <div class="header-actions">
            <button class="btn-header btn-header-amber" onclick="openCalibration()" title="Open Word Editor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Word Editor
            </button>
            <button class="btn-header btn-header-outline" onclick="window.close()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Close
            </button>
        </div>
    </div>
</header>

<!-- Main Container -->
<div class="container">

    @if($case)
    <div class="case-banner">
        <svg class="case-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="case-banner-text">
            <strong>Linked to Case #{{ $case->case_number }}</strong>
            <span>{{ $case->title ?? ($case->complainant . ' vs ' . $case->respondent) }}</span>
        </div>
    </div>
    @endif

    <!-- Title Card -->
    <div class="form-card title-card">
        <div class="title-card-inner">
            <div class="form-doc-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8zm0-4h8v2H8z"/>
                </svg>
                Official Lupon Form
            </div>
            <h1 class="form-doc-title">{{ ucwords(str_replace('_', ' ', $type)) }}</h1>
            <p class="form-doc-description">
                Fill in all required fields below. Your answers will be printed directly onto the official form.
                Fields marked with <span style="color:#d93025;font-weight:600;">*</span> are required.
            </p>
            <div class="form-doc-divider"></div>
        </div>
    </div>

    <!-- THE FORM -->
    <form id="doc-form" action="{{ route('documents.generate') }}" method="POST" target="_blank">
        @csrf
        <input type="hidden" name="type" value="{{ $type }}">
        <input type="hidden" name="action" value="download">
        <input type="hidden" name="layout_overrides" id="layout-overrides" value="">
        @if($case)
            <input type="hidden" name="case_id" value="{{ $case->id }}">
        @endif

        @php
            // Group fields into sections - some are "footer" fields
            $footerNames = ['made_this_1','made_this_2','made_this_3','made_this_day','made_this_month','year','notary'];
            $mainFields = array_filter($fields, fn($f) => !in_array($f['name'], $footerNames));
            $footerFields = array_filter($fields, fn($f) => in_array($f['name'], $footerNames));

            $fieldLabels = [
                'case_no'           => 'Case Number',
                'complainant'       => 'Complainant (Full Name)',
                'respondent'        => 'Respondent (Full Name)',
                'For'               => 'Nature of Complaint / For',
                'narrative'         => 'Complaint Narrative',
                'agreement'         => 'Terms of Settlement',
                'award_details'     => 'Award / Decision Details',
                'hearing_date'      => 'Hearing Date & Time',
                'hearing_date_time' => 'Hearing Date & Time',
                'hearing_schedule'  => 'Hearing Schedule',
                'served_personal'   => 'Served Personally',
                'served_substituted'=> 'Served via Substitution',
                'scan_content'      => 'Statement / Content',
                'cert_body'         => 'Certification Text',
                'body'              => 'Notice Body',
                'body_text'         => 'Content / Details',
                'pangkat_names'     => 'Pangkat Member Names',
                'respondent'        => 'Respondent / Addressee',
                'made_this_1'       => 'Place (City/Municipality)',
                'made_this_2'       => 'Province',
                'made_this_3'       => 'Philippines',
                'made_this_day'     => 'Day',
                'made_this_month'   => 'Month',
                'year'              => 'Year',
                'notary'            => 'Subscribed & Sworn Before',
            ];

            $fieldHints = [
                'case_no'       => 'e.g. 2024-001',
                'complainant'   => 'Full legal name of the complainant',
                'respondent'    => 'Full legal name of the respondent',
                'For'           => 'Brief description of the nature of the complaint',
                'narrative'     => 'Describe the facts and circumstances of the complaint',
                'agreement'     => 'State the specific terms agreed upon by both parties',
                'award_details' => 'State the decision or award granted by the Pangkat',
                'hearing_date'  => 'e.g. February 28, 2026 at 9:00 AM',
                'hearing_date_time' => 'e.g. February 28, 2026 at 9:00 AM',
                'cert_body'     => 'Enter the full certification text',
                'pangkat_names' => 'List each member on a new line',
            ];
        @endphp

        <!-- Main Fields Section -->
        @if(count($mainFields) > 0)
        <div class="section-card">
            <div class="section-card-inner">
                <div class="section-title">📋 Form Details</div>
                <div class="section-desc">Fill in the information for this document</div>
            </div>
        </div>

        @foreach($mainFields as $field)
            @php
                $fieldName = $field['name'] ?? 'field_' . $loop->index;
                $fieldDefault = $field['default'] ?? '';
                // Prioritize the label from the field object itself if it exists
                $label = $field['label'] ?? $fieldLabels[$fieldName] ?? ucwords(str_replace('_', ' ', $fieldName));
                // Prioritize placeholder/hint from the field object
                $hint = $field['placeholder'] ?? $field['hint'] ?? $fieldHints[$fieldName] ?? '';
                $isTextarea = isset($field['type']) && $field['type'] === 'textarea';
                $isCheckbox = isset($field['type']) && $field['type'] === 'checkbox';
                $isDate = isset($field['type']) && $field['type'] === 'date';
            @endphp

            @if($isCheckbox)
            <div class="form-card">
                <div class="question-card-inner">
                    <div class="question-label">{{ $label }}</div>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="{{ $fieldName }}" value="X" id="field-{{ $fieldName }}"
                                {{ $fieldDefault === 'X' || $fieldDefault == 1 ? 'checked' : '' }}>
                            <div class="checkbox-custom"></div>
                            <span class="checkbox-text">{{ $label }}</span>
                        </label>
                    </div>
                </div>
            </div>

            @elseif($isTextarea)
            <div class="form-card">
                <div class="question-card-inner">
                    <div class="question-label">
                        {{ $label }}
                        <span class="required-star">*</span>
                    </div>
                    @if($hint)
                        <div class="question-hint">{{ $hint }}</div>
                    @endif
                    <textarea
                        class="form-textarea"
                        name="{{ $fieldName }}"
                        id="field-{{ $fieldName }}"
                        placeholder="Enter {{ strtolower($label) }}..."
                        rows="5"
                    >{{ $fieldDefault }}</textarea>
                </div>
            </div>

            @elseif($isDate)
            <div class="form-card">
                <div class="question-card-inner">
                    <div class="question-label">
                        {{ $label }}
                        <span class="required-star">*</span>
                    </div>
                    @if($hint)
                        <div class="question-hint">{{ $hint }}</div>
                    @endif
                    <div class="input-wrap">
                        <input type="hidden" name="{{ $fieldName }}" id="field-{{ $fieldName }}" value="{{ $fieldDefault }}">
                        <input
                            type="date"
                            class="form-input"
                            id="date-picker-{{ $fieldName }}"
                            style="cursor: pointer; color: var(--text-primary);"
                            onchange="
                                var d = new Date(this.value + 'T00:00:00');
                                if (!isNaN(d)) {
                                    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                                    var formatted = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
                                    document.getElementById('field-{{ $fieldName }}').value = formatted;
                                    this.nextElementSibling && (this.nextElementSibling.textContent = formatted);
                                }
                            "
                        >
                        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 6px; min-height: 20px;" id="date-display-{{ $fieldName }}">{{ $fieldDefault }}</div>
                    </div>
                </div>
            </div>

            @else
            <div class="form-card">
                <div class="question-card-inner">
                    <div class="question-label">
                        {{ $label }}
                        @if(!in_array($fieldName, ['case_no', 'For']))
                            <span class="required-star">*</span>
                        @endif
                    </div>
                    @if($hint)
                        <div class="question-hint">{{ $hint }}</div>
                    @endif
                    <div class="input-wrap">
                        <input
                            type="text"
                            class="form-input"
                            name="{{ $fieldName }}"
                            id="field-{{ $fieldName }}"
                            value="{{ $fieldDefault }}"
                            placeholder="{{ $hint ?: 'Your answer' }}"
                            autocomplete="off"
                        >
                    </div>
                </div>
            </div>
            @endif
        @endforeach
        @endif

        <!-- Footer Section -->
        @if(count($footerFields) > 0)
        <div class="section-card" style="border-left-color: #5f6368;">
            <div class="section-card-inner">
                <div class="section-title" style="color:#5f6368;">📅 Certification Details</div>
                <div class="section-desc">Information for the "Done at" / "Made this" section of the form</div>
            </div>
        </div>

        @foreach($footerFields as $field)
            @php
                $fieldName = $field['name'] ?? 'field_' . $loop->index;
                $fieldDefault = $field['default'] ?? '';
                // Prioritize the label from the field object itself
                $label = $field['label'] ?? $fieldLabels[$fieldName] ?? ucwords(str_replace('_', ' ', $fieldName));
                $hint = $field['placeholder'] ?? $field['hint'] ?? $fieldHints[$fieldName] ?? '';
            @endphp
            <div class="form-card">
                <div class="question-card-inner">
                    <div class="question-label">{{ $label }}</div>
                    @if($hint)
                        <div class="question-hint">{{ $hint }}</div>
                    @endif
                    <div class="input-wrap">
                        <input
                            type="text"
                            class="form-input"
                            name="{{ $fieldName }}"
                            id="field-{{ $fieldName }}"
                            value="{{ $fieldDefault }}"
                            placeholder="{{ $hint ?: 'Your answer' }}"
                            autocomplete="off"
                        >
                    </div>
                </div>
            </div>
        @endforeach
        @endif

        <!-- Preview Section -->
        @if(!empty($imageBase64))
        <div class="section-card" style="border-left-color: var(--form-purple);">
            <div class="section-card-inner">
                <div class="section-title" style="color:var(--form-purple);">👁 Live Form Preview</div>
                <div class="section-desc">This is how your data will appear on the official form</div>
            </div>
        </div>

        <div class="preview-panel">
            <div class="preview-header">
                <div class="preview-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Form Preview
                </div>
                <span style="font-size:12px;color:#9aa0a6;">Updates as you type</span>
            </div>
            <div class="preview-frame-wrap">
                <div class="preview-frame" id="previewFrame">
                    <img class="bg" src="data:image/png;base64,{{ $imageBase64 }}" alt="Form">
                    <div class="preview-overlay" id="previewOverlay">
                        @foreach($fields as $field)
                            @php
                                $fn = $field['name'] ?? $field['id'] ?? 'field_' . $loop->index;
                                $fd = $field['default'] ?? '';
                                $styles = "top:{$field['y']};left:{$field['x']};width:{$field['w']};";
                                if(isset($field['class'])) {
                                    if(str_contains($field['class'],'text-right')) $styles .= 'text-align:right;';
                                    if(str_contains($field['class'],'text-center')) $styles .= 'text-align:center;';
                                }
                            @endphp
                            <div class="preview-field-text" id="preview-{{ $fn }}" style="{{ $styles }}">{{ $fd }}</div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
        @endif

    </form>

</div>

<!-- Sticky Submit Bar -->
<div class="submit-bar">
    <div class="submit-bar-inner">
        <div class="submit-info">
            Filled fields: <strong id="filledCount">0</strong> / <strong>{{ count($fields) }}</strong>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <button class="btn-clear" type="button" onclick="clearAll()">
                Clear All
            </button>

            <button class="btn-submit" type="button" onclick="submitFormNow()" id="submitBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/>
                    <path d="M9 21h6M12 17v4"/>
                </svg>
                Generate & Print PDF
            </button>
        </div>
    </div>
</div>

{{-- Hidden form for Word .docx generation --}}
<form id="word-form" action="{{ route('documents.generate-word') }}" method="POST" style="display:none;">
    @csrf
    <input type="hidden" name="type" value="{{ $type }}">
    <input type="hidden" name="action" value="download">
    @if($case)
        <input type="hidden" name="case_id" value="{{ $case->id }}">
    @endif
    {{-- Field values injected by JS at download time --}}
</form>

<script>
    // ============================
    // LAYOUT OVERRIDES — pass field positions to PDF generator
    // ============================
    const fieldLayouts = @json($fields);

    function buildLayoutOverrides() {
        // We pass the original layout positions so the PDF generator knows where to place text
        const overrides = {};
        fieldLayouts.forEach(f => {
            overrides[f.name] = {
                x: f.x,
                y: f.y,
                w: f.w,
                h: f.h || 'auto'
            };
        });
        return overrides;
    }

    // ============================
    // LIVE PREVIEW — update preview as user types
    // ============================
    function updatePreview(name, value) {
        const el = document.getElementById('preview-' + name);
        if (el) {
            el.textContent = value;
        }
    }

    // Attach live preview listeners
    document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
        const name = input.name;
        // Set initial preview
        updatePreview(name, input.value);

        input.addEventListener('input', function() {
            updatePreview(name, this.value);
            updateFilledCount();
        });
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function() {
            updatePreview(this.name, this.checked ? 'X' : '');
            updateFilledCount();
        });
    });

    // ============================
    // FILLED COUNT
    // ============================
    function updateFilledCount() {
        let count = 0;
        document.querySelectorAll('.form-input, .form-textarea').forEach(el => {
            if (el.value.trim() !== '') count++;
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.checked) count++;
        });
        document.getElementById('filledCount').textContent = count;
    }

    updateFilledCount(); // Initial count

    // ============================
    // SUBMIT FORM → Generate PDF
    // ============================
    function submitFormNow() {
        // Set layout overrides
        document.getElementById('layout-overrides').value = JSON.stringify(buildLayoutOverrides());

        // Show loader
        document.getElementById('loaderOverlay').classList.add('active');

        // Submit form (opens PDF in new tab)
        document.getElementById('doc-form').submit();

        // Hide overlay after a bit
        setTimeout(() => {
            document.getElementById('loaderOverlay').classList.remove('active');
        }, 5000);
    }

    // ============================
    // CLEAR ALL
    // ============================
    function clearAll() {
        if (!confirm('Clear all fields? This cannot be undone.')) return;
        document.querySelectorAll('.form-input, .form-textarea').forEach(el => {
            el.value = '';
            updatePreview(el.name, '');
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            updatePreview(cb.name, '');
        });
        updateFilledCount();
    }

    // ============================
    // DOWNLOAD AS WORD (.docx)
    // ============================
    function downloadWord() {
        const wordForm = document.getElementById('word-form');

        // Remove any previously injected value inputs
        wordForm.querySelectorAll('.injected-field').forEach(el => el.remove());

        // Copy all filled values from the main form into the word-form
        document.querySelectorAll('#doc-form .form-input, #doc-form .form-textarea').forEach(el => {
            if (el.name && el.value.trim() !== '') {
                const hidden = document.createElement('input');
                hidden.type  = 'hidden';
                hidden.name  = el.name;
                hidden.value = el.value;
                hidden.classList.add('injected-field');
                wordForm.appendChild(hidden);
            }
        });

        // Copy checked checkboxes
        document.querySelectorAll('#doc-form input[type="checkbox"]:checked').forEach(cb => {
            const hidden = document.createElement('input');
            hidden.type  = 'hidden';
            hidden.name  = cb.name;
            hidden.value = cb.value;
            hidden.classList.add('injected-field');
            wordForm.appendChild(hidden);
        });

        // Submit — browser will prompt to open/save the .docx
        wordForm.submit();
    }

    // ============================
    // SCROLL PROGRESS
    // ============================
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('scrollProgress').style.width = scrolled + '%';
    });
</script>

{{-- ===== CALIBRATION OVERLAY ===== --}}
<div class="calibration-overlay" id="calibrationOverlay">

    {{-- Toolbar --}}
    <div class="calibration-toolbar">
        <div style="display:flex; align-items:center; gap:16px;">
            <div style="width: 44px; height: 44px; background: #0B57D0; border-radius: 4px; display:flex; align-items:center; justify-content:center;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-2 16H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V8h8v2z"/></svg>
            </div>
            <div>
                <div class="calibration-toolbar-title">
                    {{ ucwords(str_replace('_', ' ', $type)) }} - Word Editor
                </div>
            </div>
        </div>
        <div style="flex:1;"></div>
        <button class="btn-calib-cancel" onclick="closeCalibration()">
            Discard Changes
        </button>
        <button class="btn-calib-save" onclick="saveCalibration()" id="calibSaveBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
            Save Layout & Text
        </button>
    </div>
    
    {{-- Formatting toolbar --}}
    <div style="height: 40px; background: #EDF2FA; border-bottom: 1px solid #c7c7c7; border-radius: 0 0 24px 24px; display:flex; align-items:center; padding: 0 24px; gap:16px; margin: 0 16px 16px 16px;">
         <button onclick="undoCalibration()" title="Undo action & position" style="background:transparent; border:none; cursor:pointer; color:#444746; display:flex; align-items:center; justify-content:center; padding:4px; border-radius:4px;" onmouseover="this.style.background='#E1E5EA'" onmouseout="this.style.background='transparent'">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
         </button>
         <span style="width:1px; height:20px; background:#c7c7c7;"></span>
         <span style="font-size:13px; color:#444746; font-weight:bold; display:flex; align-items:center; gap:4px;">100% <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></span>
         <span style="width:1px; height:20px; background:#c7c7c7;"></span>
         <button onmousedown="event.preventDefault();" onclick="document.execCommand('formatBlock', false, 'p')" title="Normal text" style="background:transparent;border:none;cursor:pointer;font-size:13px;color:#444746;display:flex;align-items:center;gap:4px;">Normal text</button>
         <span style="width:1px; height:20px; background:#c7c7c7;"></span>
         <span style="font-size:13px; color:#444746; display:flex; align-items:center; gap:4px; cursor:default;">Arial</span>
         <span style="width:1px; height:20px; background:#c7c7c7;"></span>
         <span style="font-size:13px; color:#444746; display:flex; align-items:center; gap:10px;">
             <button onmousedown="event.preventDefault();" onclick="changeFontSize(-1)" style="background:transparent;border:none;cursor:pointer;font-size:16px;line-height:1;">-</button>
             <span id="toolbarFontSize" style="border:1px solid #c7c7c7; padding:2px 6px; border-radius:4px;">11</span>
             <button onmousedown="event.preventDefault();" onclick="changeFontSize(1)" style="background:transparent;border:none;cursor:pointer;font-size:16px;line-height:1;">+</button>
         </span>
         <span style="width:1px; height:20px; background:#c7c7c7;"></span>
         <button onmousedown="event.preventDefault();" onclick="document.execCommand('bold', false, null)" style="background:transparent;border:none;cursor:pointer;color:#1f1f1f;font-weight:bold;font-size:14px;" title="Bold">B</button>
         <button onmousedown="event.preventDefault();" onclick="document.execCommand('italic', false, null)" style="background:transparent;border:none;cursor:pointer;color:#1f1f1f;font-style:italic;font-family:serif;font-size:15px;" title="Italic">I</button>
         <button onmousedown="event.preventDefault();" onclick="document.execCommand('underline', false, null)" style="background:transparent;border:none;cursor:pointer;color:#1f1f1f;text-decoration:underline;font-size:14px;" title="Underline">U</button>
    </div>

    {{-- Draggable A4 paper --}}
    <div class="calibration-body">
        <div class="calibration-paper" id="calibPaper">
            {{-- Background image --}}
            @if($imageBase64)
                <img src="data:image/png;base64,{{ $imageBase64 }}" alt="form background" draggable="false">
            @endif
            {{-- Draggable field boxes will be injected here by JS --}}
        </div>
    </div>
</div>

{{-- Position readout tooltip --}}
<div class="calib-pos-readout" id="calibReadout"></div>

{{-- Success toast --}}
<div class="calib-toast" id="calibToast">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    Positions saved! Future PDFs will be auto-aligned.
</div>

<script>
// ===== CALIBRATION SYSTEM =======================================================
// NOTE: paper dimensions are read live from the DOM (paper.offsetWidth/Height)
// so positions are always accurate regardless of screen size or zoom level.

// Current calibrated positions (name → {x%, y%})
let calibPositions = {};
let calibHistory = []; // Tracks undo state
let currentFontSize = 11; // Editor Base default font size

function changeFontSize(delta) {
    currentFontSize += delta;
    if (currentFontSize < 8) currentFontSize = 8;
    if (currentFontSize > 72) currentFontSize = 72;
    document.getElementById('toolbarFontSize').innerText = currentFontSize;
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
        document.execCommand("fontSize", false, "7");
        const fontElements = document.getElementsByTagName("font");
        for (let i = 0; i < fontElements.length; i++) {
            if (fontElements[i].size == "7") {
                fontElements[i].removeAttribute("size");
                fontElements[i].style.fontSize = currentFontSize + "pt";
            }
        }
    } else {
        const active = document.activeElement;
        if (active && active.classList.contains('calib-field-text')) {
            active.style.fontSize = currentFontSize + "pt";
        }
    }
}

// Undo logic
function pushCalibState() {
    let state = [];
    const paperW = document.getElementById('calibPaper').offsetWidth;
    const paperH = document.getElementById('calibPaper').offsetHeight;

    document.querySelectorAll('.calib-field').forEach(el => {
        let name = el.dataset.name;
        // Keep precise size state 
        if (paperW && paperH) {
             calibPositions[name].w = ((el.offsetWidth / paperW) * 100).toFixed(2) + '%';
             calibPositions[name].h = ((el.offsetHeight / paperH) * 100).toFixed(2) + '%';
        }

        const textEl = el.querySelector('.calib-field-text');
        state.push({
            name: name,
            x: calibPositions[name].x,
            y: calibPositions[name].y,
            w: calibPositions[name].w,
            h: calibPositions[name].h,
            left: el.style.left,
            top: el.style.top,
            width: el.style.width,
            height: el.style.height,
            html: textEl ? textEl.innerHTML : '',
            value: document.getElementById('field-' + name)?.value || ''
        });
    });
    
    let stateString = JSON.stringify(state);
    if (calibHistory.length === 0 || JSON.stringify(calibHistory[calibHistory.length - 1]) !== stateString) {
        calibHistory.push(state);
    }
}

function undoCalibration() {
    if (calibHistory.length <= 1) return;
    calibHistory.pop(); // discard current state
    const prevState = calibHistory[calibHistory.length - 1]; // get previous
    
    prevState.forEach(s => {
        calibPositions[s.name].x = s.x;
        calibPositions[s.name].y = s.y;
        calibPositions[s.name].w = s.w;
        calibPositions[s.name].h = s.h;
        
        let el = document.querySelector('.calib-field[data-name="' + s.name + '"]');
        if (el) {
            el.style.left = s.x + '%';
            el.style.top = s.y + '%';
            el.style.width = s.w;
            if (s.h && s.h !== 'auto') {
                el.style.height = s.h;
            } else {
                el.style.height = 'auto';
            }
            
            const textEl = el.querySelector('.calib-field-text');
            if (textEl) {
                textEl.innerHTML = s.html;
            }
        }
        
        // Sync to underlying form
        let input = document.getElementById('field-' + s.name);
        if (input) {
            input.value = s.value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Live preview sync
        const previewEl = document.getElementById('preview-' + s.name);
        if (previewEl) {
            previewEl.style.left = s.x + '%';
            previewEl.style.top  = s.y + '%';
        }
    });
}

// Build initial positions from PHP layout
const baseLayouts = @json($fields);
baseLayouts.forEach(f => {
    // Convert percent string like "10%" to number 10
    const px = parseFloat((f.x || '10%').replace('%',''));
    const py = parseFloat((f.y || '10%').replace('%',''));
    calibPositions[f.name] = { x: px, y: py, w: f.w || '40%', h: f.h || 'auto' };
});

function openCalibration() {
    const overlay = document.getElementById('calibrationOverlay');
    const paper   = document.getElementById('calibPaper');

    // Clear old boxes
    paper.querySelectorAll('.calib-field').forEach(el => el.remove());
    calibHistory = []; // Reset undo stack

    // First show the overlay so the paper has a real rendered size
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Use requestAnimationFrame so the DOM has laid out before we measure
    requestAnimationFrame(function() {
        const paperW = paper.offsetWidth;
        const paperH = paper.offsetHeight;

        // Build a draggable box for each field
        baseLayouts.forEach(function(f) {
            const name  = f.name;
            const el    = document.getElementById('field-' + name);
            const value = el ? (el.value || el.textContent || '') : (f.default || f.label || name);
            const displayText = (value && value.trim()) ? value.trim() : ('[ ' + (f.label || name) + ' ]');

            const pos = calibPositions[name];
            // Convert saved % positions → pixels in the actual rendered paper
            const xPx = (pos.x / 100) * paperW;
            const yPx = (pos.y / 100) * paperH;
            const wPx = pos.w && pos.w !== 'auto' ? (parseFloat(pos.w) / 100) * paperW : 140;

            const box = document.createElement('div');
            box.className    = 'calib-field';
            box.dataset.name = name;
            box.style.left   = xPx + 'px';
            box.style.top    = yPx + 'px';
            box.style.width  = wPx + 'px';
            
            
            // Inner text container to protect resizers/drag-handles from getting overridden!
            const textEl = document.createElement('div');
            textEl.className = 'calib-field-text';
            textEl.contentEditable = 'true';
            textEl.style.width = '100%';
            textEl.style.height = '100%';
            textEl.style.outline = 'none';
            textEl.innerHTML = displayText;

            // Live sync back to inputs
            textEl.addEventListener('input', function() {
                const targetInput = document.getElementById('field-' + name);
                if (targetInput) {
                    targetInput.value = this.textContent;
                    // Trigger input event to update forms preview as well
                    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            
            textEl.addEventListener('blur', pushCalibState);
            
            box.appendChild(textEl);

            // Label tag above box showing field name
            const tag = document.createElement('span');
            tag.className   = 'calib-label-tag';
            tag.textContent = f.label || name;
            tag.contentEditable = 'false';
            box.appendChild(tag);
            
            // Drag handle to move the box
            const handle = document.createElement('div');
            handle.className = 'calib-drag-handle';
            handle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M2 12h20M12 2v20"/></svg>';
            handle.contentEditable = 'false';
            box.appendChild(handle);

            // Setup Custom Resizer
            const resizer = document.createElement('div');
            resizer.className = 'calib-resize-handle';
            resizer.contentEditable = 'false';
            box.appendChild(resizer);

            makeDraggable(box, handle);
            makeResizable(box, resizer);
            
            paper.appendChild(box);
        });
        
        // Initial state capture
        pushCalibState();
    });
}


function closeCalibration() {
    document.getElementById('calibrationOverlay').classList.remove('active');
    document.getElementById('calibReadout').style.display = 'none';
    document.body.style.overflow = '';
}

function makeDraggable(el, handle) {
    const paper   = document.getElementById('calibPaper');
    const readout = document.getElementById('calibReadout');

    handle.addEventListener('mousedown', function(e) {
        // Only respond to left-button clicks
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        el.classList.add('dragging');
        readout.style.display = 'block';

        // Capture how far inside the element the user clicked.
        // This prevents the box from "jumping" to have its corner at the cursor.
        const elRect    = el.getBoundingClientRect();
        const clickOffX = e.clientX - elRect.left;
        const clickOffY = e.clientY - elRect.top;

        function onMove(e) {
            // Get the paper's current screen position on every move.
            // This stays accurate even when the calibration body is scrolled.
            const paperRect = paper.getBoundingClientRect();
            const paperW    = paper.offsetWidth;   // actual rendered width
            const paperH    = paper.offsetHeight;  // actual rendered height

            // Desired top-left of the element in paper-local pixels
            let newL = e.clientX - paperRect.left - clickOffX;
            let newT = e.clientY - paperRect.top  - clickOffY;

            // Clamp so the element stays fully inside the paper
            newL = Math.max(0, Math.min(paperW  - el.offsetWidth,  newL));
            newT = Math.max(0, Math.min(paperH  - el.offsetHeight, newT));

            // Convert px → % using the ACTUAL rendered paper size
            const xPct = ((newL / paperW) * 100).toFixed(2);
            const yPct = ((newT / paperH) * 100).toFixed(2);

            el.style.left = xPct + '%';
            el.style.top  = yPct + '%';

            // Update readout
            readout.textContent = '📍 ' + el.dataset.name
                + '   x: ' + xPct + '%'
                + '   y: ' + yPct + '%';

            // Keep calibPositions in sync
            calibPositions[el.dataset.name].x = parseFloat(xPct);
            calibPositions[el.dataset.name].y = parseFloat(yPct);

            // Mirror to the live preview panel in real-time
            const previewEl = document.getElementById('preview-' + el.dataset.name);
            if (previewEl) {
                previewEl.style.left = xPct + '%';
                previewEl.style.top  = yPct + '%';
            }
        }

        function onUp() {
            el.classList.remove('dragging');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup',   onUp);
            setTimeout(function() { readout.style.display = 'none'; }, 2000);
            pushCalibState(); // Save state after drag
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup',   onUp);
    });
}

function makeResizable(el, resizer) {
    const paper = document.getElementById('calibPaper');

    resizer.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(el).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(el).height, 10);

        function onResizeMove(e) {
            const paperRect = paper.getBoundingClientRect();
            // Constraint inside paper bounds
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);
            
            // Min sizes
            if (newWidth < 40) newWidth = 40;
            if (newHeight < 20) newHeight = 20;

            // Maximum allowed
            const maxW = paperRect.width - el.offsetLeft;
            const maxH = paperRect.height - el.offsetTop;
            
            if (newWidth > maxW) newWidth = maxW;
            if (newHeight > maxH) newHeight = maxH;

            // Convert to % for responsiveness
            const wPct = ((newWidth / paperRect.width) * 100).toFixed(2);
            const hPct = ((newHeight / paperRect.height) * 100).toFixed(2);

            el.style.width = wPct + '%';
            el.style.height = hPct + '%';
        }

        function onResizeUp() {
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('mouseup', onResizeUp);
            pushCalibState();
        }

        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
    });
}


function saveCalibration() {
    const btn = document.getElementById('calibSaveBtn');
    btn.textContent = 'Saving...';
    btn.disabled    = true;
    
    // Ensure all sizes are properly captured in % before saving
    const paperW = document.getElementById('calibPaper').offsetWidth;
    const paperH = document.getElementById('calibPaper').offsetHeight;
    document.querySelectorAll('.calib-field').forEach(el => {
        const name = el.dataset.name;
        if (paperW && paperH) {
             calibPositions[name].w = ((el.offsetWidth / paperW) * 100).toFixed(2) + '%';
             calibPositions[name].h = ((el.offsetHeight / paperH) * 100).toFixed(2) + '%';
        }
    });

    // Build positions payload: name → { x: "12.5%", y: "22.1%", w, h }
    const positions = {};
    Object.entries(calibPositions).forEach(([name, pos]) => {
        positions[name] = {
            x: pos.x.toFixed(2) + '%',
            y: pos.y.toFixed(2) + '%',
            w: pos.w,
            h: pos.h,
        };
    });

    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    // Build content payload to save document data to database
    const contentToSave = {};
    document.querySelectorAll('[id^="field-"]').forEach(el => {
        const n = el.id.replace('field-', '');
        contentToSave[n] = el.value || el.textContent || '';
    });

    fetch('{{ route("documents.save-layout") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            document_type: '{{ $type }}',
            case_id: '{{ $case->id ?? "" }}',
            positions: positions,
            content: contentToSave,
        }),
    })
    .then(r => r.json())
    .then(data => {
        btn.textContent = 'Save Positions';
        btn.disabled    = false;

        if (data.success) {
            showCalibToast();
            // Update the live preview overlay positions to match
            Object.entries(positions).forEach(([name, pos]) => {
                const previewEl = document.getElementById('preview-' + name);
                if (previewEl) {
                    previewEl.style.left = pos.x;
                    previewEl.style.top  = pos.y;
                }
            });
            setTimeout(() => closeCalibration(), 1200);
        } else {
            alert('Error saving: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(err => {
        btn.textContent = 'Save Positions';
        btn.disabled    = false;
        alert('Network error: ' + err.message);
    });
}

function showCalibToast() {
    const toast = document.getElementById('calibToast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}
// ===== END CALIBRATION SYSTEM ===================================================
</script>

</body>
</html>
