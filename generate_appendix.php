<?php

/**
 * Source Code Appendix Generator
 * For Capstone / Thesis Manuscript:
 * LUPON TAGAPAMAYAPA CASE MANAGEMENT AND DISPUTE RESOLUTION INFORMATION SYSTEM (LUPON CMS)
 * National Aviation Academy of the Philippines - Institute of Computer Studies
 */

require_once __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;

echo "=== Lupon CMS Source Code Appendix Generator ===\n";

// Define the modules and their target files
$modules = [
    'MODULE 1: ROUTING & ENDPOINT CONFIGURATION' => [
        'description' => 'Defines all web endpoints, middleware assignments, resource routes, authentication wrappers, and administrative route groups.',
        'files' => [
            'routes/web.php',
            'routes/settings.php',
            'routes/console.php',
        ]
    ],
    'MODULE 2: DATABASE MIGRATIONS & SCHEMA DEFINITIONS' => [
        'description' => 'Database structural definitions including tables for cases, parties, documents, versions, audit logs, system settings, LTIA tracking, and RBAC permissions.',
        'files' => [
            'database/migrations/2026_02_08_143843_create_cases_table.php',
            'database/migrations/2026_02_08_143845_create_parties_table.php',
            'database/migrations/2026_02_08_143847_create_documents_table.php',
            'database/migrations/2026_02_08_143849_create_case_party_table.php',
            'database/migrations/2026_02_08_234048_create_form_layouts_table.php',
            'database/migrations/2026_02_18_224721_create_audit_logs_table.php',
            'database/migrations/2026_07_24_000000_create_system_settings_table.php',
            'database/migrations/2026_07_24_010000_create_ltia_events_and_phases_tables.php',
            'database/migrations/2026_08_04_224500_create_document_versions_table.php',
            'database/migrations/2026_08_10_220500_add_soft_deletes_to_documents_table.php',
            'database/migrations/2026_08_14_000000_create_notifications_table.php',
            'database/migrations/2026_08_15_000000_add_soft_deletes_to_users_table.php',
            'database/seeders/DatabaseSeeder.php',
            'database/seeders/RoleAndPermissionSeeder.php',
            'database/seeders/AdminSeeder.php',
        ]
    ],
    'MODULE 3: ELOQUENT DATA MODELS & RELATIONSHIPS' => [
        'description' => 'ORM models encapsulating domain logic, relationships (hasMany, belongsTo, morphMany), scopes, and soft deletes.',
        'files' => [
            'app/Models/LuponCase.php',
            'app/Models/Document.php',
            'app/Models/DocumentVersion.php',
            'app/Models/User.php',
            'app/Models/AuditLog.php',
            'app/Models/LtiaEvent.php',
            'app/Models/LtiaPhase.php',
            'app/Models/Notification.php',
            'app/Models/SystemSetting.php',
            'app/Models/FormLayout.php',
        ]
    ],
    'MODULE 4: APPLICATION CONTROLLERS & BUSINESS LOGIC' => [
        'description' => 'Main HTTP request handlers implementing CRUD operations, case dispatching, document generation, PDF rendering, audit logging, and RBAC enforcement.',
        'files' => [
            'app/Http/Controllers/CaseController.php',
            'app/Http/Controllers/DocumentController.php',
            'app/Http/Controllers/DashboardController.php',
            'app/Http/Controllers/AnalyticsController.php',
            'app/Http/Controllers/LTIAController.php',
            'app/Http/Controllers/ReportController.php',
            'app/Http/Controllers/AuditController.php',
            'app/Http/Controllers/UserController.php',
            'app/Http/Controllers/RolePermissionController.php',
            'app/Http/Controllers/RoleController.php',
            'app/Http/Controllers/SettingsBackupController.php',
            'app/Http/Controllers/NotificationController.php',
            'app/Http/Controllers/Settings/PasswordController.php',
            'app/Http/Controllers/Settings/ProfileController.php',
            'app/Http/Controllers/Settings/TwoFactorAuthenticationController.php',
        ]
    ],
    'MODULE 5: DOMAIN SERVICES, ACTIONS & MIDDLEWARE' => [
        'description' => 'Core application services handling transaction-safe database backups, automated audit trailing, Inertia shared props, and role authorization gates.',
        'files' => [
            'app/Services/AuditService.php',
            'app/Services/DocumentBackupService.php',
            'app/Http/Middleware/RoleMiddleware.php',
            'app/Http/Middleware/HandleInertiaRequests.php',
            'app/Http/Middleware/HandleAppearance.php',
            'app/Providers/AppServiceProvider.php',
            'app/Providers/FortifyServiceProvider.php',
        ]
    ],
    'MODULE 6: BLADE PRINT TEMPLATES & SERVER VIEWS' => [
        'description' => 'Server-side templates for official legal document generation, court certifications, notices, and PDF export stylesheets.',
        'files' => [
            'resources/views/app.blade.php',
            'resources/views/documents/templates/print.blade.php',
            'resources/views/documents/form-fill.blade.php',
            'resources/views/documents/visual-editor.blade.php',
            'resources/views/reports/pdf.blade.php',
            'resources/views/errors/custom.blade.php',
        ]
    ],
    'MODULE 7: FRONTEND APPLICATION CORE & CLIENT PAGES' => [
        'description' => 'React (TypeScript) pages rendered via Inertia.js for case management, documents drive, LTIA milestones, analytics, user administration, and system settings.',
        'files' => [
            'resources/js/app.tsx',
            'resources/js/pages/dashboard.tsx',
            'resources/js/pages/welcome.tsx',
            'resources/js/pages/cases/index.tsx',
            'resources/js/pages/cases/archive.tsx',
            'resources/js/pages/documents/index.tsx',
            'resources/js/pages/documents/folders.tsx',
            'resources/js/pages/documents/new.tsx',
            'resources/js/pages/documents/templates.tsx',
            'resources/js/pages/analytics/index.tsx',
            'resources/js/pages/audit/index.tsx',
            'resources/js/pages/ltia/index.tsx',
            'resources/js/pages/reports/index.tsx',
            'resources/js/pages/users/index.tsx',
            'resources/js/pages/settings/backup.tsx',
            'resources/js/pages/settings/appearance.tsx',
            'resources/js/pages/settings/password.tsx',
            'resources/js/pages/settings/profile.tsx',
            'resources/js/pages/settings/two-factor.tsx',
            'resources/js/pages/auth/login.tsx',
            'resources/js/pages/auth/register.tsx',
        ]
    ],
    'MODULE 8: CLIENT DOMAIN DIALOGS & MODAL COMPONENTS' => [
        'description' => 'Specialized interactive components for case filing, status updates, legal document generation, document version inspection, and LTIA event scheduling.',
        'files' => [
            'resources/js/components/cases/create-case-dialog.tsx',
            'resources/js/components/cases/edit-case-status-dialog.tsx',
            'resources/js/components/documents/document-version-history-modal.tsx',
            'resources/js/components/documents/generate-document-dialog.tsx',
            'resources/js/components/ltia/event-dialog.tsx',
            'resources/js/components/ltia/edit-phase-dialog.tsx',
            'resources/js/components/ltia/submit-application-dialog.tsx',
        ]
    ]
];

// 1. Generate text compilation (APPENDIX_SOURCE_CODE.txt)
echo "Generating APPENDIX_SOURCE_CODE.txt...\n";

$txtFile = __DIR__ . '/APPENDIX_SOURCE_CODE.txt';
$txtHandle = fopen($txtFile, 'w');

$header = <<<EOT
================================================================================
                       REPUBLIC OF THE PHILIPPINES
               NATIONAL AVIATION ACADEMY OF THE PHILIPPINES
                   The National Professional Institution
                       INSTITUTE OF COMPUTER STUDIES
================================================================================
                    CAPSTONE PROJECT SOURCE CODE APPENDIX
 LUPON TAGAPAMAYAPA CASE MANAGEMENT AND DISPUTE RESOLUTION INFORMATION SYSTEM
                               (LUPON CMS)
================================================================================
Date Compiled: 2026-10-26
Technology Stack: Laravel 11 (PHP 8.2), React (TypeScript), Inertia.js, MySQL
Total Key Modules: 8
================================================================================

TABLE OF CONTENTS
--------------------------------------------------------------------------------
EOT;

fwrite($txtHandle, $header . "\n");

$itemNumber = 1;
foreach ($modules as $moduleName => $data) {
    fwrite($txtHandle, "\n" . $moduleName . "\n");
    fwrite($txtHandle, "  " . $data['description'] . "\n");
    foreach ($data['files'] as $relPath) {
        $fullPath = __DIR__ . '/' . $relPath;
        if (file_exists($fullPath)) {
            $lineCount = count(file($fullPath));
            $fileSize = round(filesize($fullPath) / 1024, 1);
            fwrite($txtHandle, sprintf("    [%02d] %-60s (%4d lines, %5.1f KB)\n", $itemNumber++, $relPath, $lineCount, $fileSize));
        } else {
            fwrite($txtHandle, sprintf("    [%02d] %-60s [NOT FOUND]\n", $itemNumber++, $relPath));
        }
    }
}

fwrite($txtHandle, "\n" . str_repeat('=', 80) . "\n\n");

// Write files into txt
$itemNumber = 1;
foreach ($modules as $moduleName => $data) {
    fwrite($txtHandle, "\n\n" . str_repeat('=', 80) . "\n");
    fwrite($txtHandle, "  " . $moduleName . "\n");
    fwrite($txtHandle, "  " . $data['description'] . "\n");
    fwrite($txtHandle, str_repeat('=', 80) . "\n\n");

    foreach ($data['files'] as $relPath) {
        $fullPath = __DIR__ . '/' . $relPath;
        if (!file_exists($fullPath)) continue;

        $content = file_get_contents($fullPath);
        $lines = explode("\n", $content);
        $lineCount = count($lines);
        $fileSize = round(filesize($fullPath) / 1024, 1);

        fwrite($txtHandle, "\n" . str_repeat('-', 80) . "\n");
        fwrite($txtHandle, sprintf("FILE #%02d: %s\n", $itemNumber++, $relPath));
        fwrite($txtHandle, sprintf("Lines: %d | Size: %.1f KB\n", $lineCount, $fileSize));
        fwrite($txtHandle, str_repeat('-', 80) . "\n");

        $ln = 1;
        foreach ($lines as $line) {
            fwrite($txtHandle, sprintf("%4d | %s\n", $ln++, rtrim($line, "\r\n")));
        }
        fwrite($txtHandle, "\n");
    }
}

fclose($txtHandle);
echo "Generated APPENDIX_SOURCE_CODE.txt (" . round(filesize($txtFile) / 1024 / 1024, 2) . " MB)\n";

// 2. Generate Markdown compilation (APPENDIX_SOURCE_CODE.md)
echo "Generating APPENDIX_SOURCE_CODE.md...\n";
$mdFile = __DIR__ . '/APPENDIX_SOURCE_CODE.md';
$mdHandle = fopen($mdFile, 'w');

fwrite($mdHandle, "# Republic of the Philippines\n");
fwrite($mdHandle, "## NATIONAL AVIATION ACADEMY OF THE PHILIPPINES\n");
fwrite($mdHandle, "### Institute of Computer Studies\n\n");
fwrite($mdHandle, "---\n\n");
fwrite($mdHandle, "# APPENDIX: SYSTEM SOURCE CODE\n");
fwrite($mdHandle, "## Lupon Tagapamayapa Case Management and Dispute Resolution Information System (Lupon CMS)\n\n");
fwrite($mdHandle, "**Compiled:** 2026-10-26  \n");
fwrite($mdHandle, "**Architecture:** Laravel 11 (PHP 8.2+), React (TypeScript), Inertia.js, Eloquent ORM, MySQL  \n\n");
fwrite($mdHandle, "---\n\n");
fwrite($mdHandle, "## Table of Contents\n\n");

$itemNumber = 1;
foreach ($modules as $moduleName => $data) {
    fwrite($mdHandle, "### " . $moduleName . "\n");
    fwrite($mdHandle, "*" . $data['description'] . "*\n\n");
    foreach ($data['files'] as $relPath) {
        $fullPath = __DIR__ . '/' . $relPath;
        if (file_exists($fullPath)) {
            $lineCount = count(file($fullPath));
            $anchor = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $relPath));
            fwrite($mdHandle, sprintf("- [%s](#%s) *(%d lines)*\n", $relPath, $anchor, $lineCount));
        }
    }
    fwrite($mdHandle, "\n");
}

fwrite($mdHandle, "---\n\n");

foreach ($modules as $moduleName => $data) {
    fwrite($mdHandle, "# " . $moduleName . "\n\n");
    fwrite($mdHandle, "> " . $data['description'] . "\n\n");

    foreach ($data['files'] as $relPath) {
        $fullPath = __DIR__ . '/' . $relPath;
        if (!file_exists($fullPath)) continue;

        $ext = pathinfo($fullPath, PATHINFO_EXTENSION);
        $lang = 'php';
        if (in_array($ext, ['ts', 'tsx'])) $lang = 'tsx';
        if ($ext === 'js' || $ext === 'jsx') $lang = 'jsx';
        if (str_ends_with($relPath, 'blade.php')) $lang = 'html';

        $content = file_get_contents($fullPath);
        $lineCount = count(explode("\n", $content));

        fwrite($mdHandle, "## `" . $relPath . "`\n");
        fwrite($mdHandle, "**Lines:** " . $lineCount . " | **Size:** " . round(filesize($fullPath) / 1024, 1) . " KB\n\n");
        fwrite($mdHandle, "```" . $lang . "\n");
        fwrite($mdHandle, $content . "\n");
        fwrite($mdHandle, "```\n\n");
    }
}

fclose($mdHandle);
echo "Generated APPENDIX_SOURCE_CODE.md (" . round(filesize($mdFile) / 1024 / 1024, 2) . " MB)\n";

// 3. Generate Word Document (APPENDIX_SOURCE_CODE.docx)
echo "Generating APPENDIX_SOURCE_CODE.docx...\n";
try {
    $phpWord = new PhpWord();

    // Default styles
    $phpWord->setDefaultFontName('Consolas');
    $phpWord->setDefaultFontSize(8.5);

    // Title Section
    $section = $phpWord->addSection([
        'marginTop' => 1000,
        'marginBottom' => 1000,
        'marginLeft' => 1200,
        'marginRight' => 1200,
    ]);

    // Cover Page / Header
    $section->addText("REPUBLIC OF THE PHILIPPINES", ['name' => 'Calibri', 'size' => 11, 'bold' => true], ['alignment' => Jc::CENTER]);
    $section->addText("NATIONAL AVIATION ACADEMY OF THE PHILIPPINES", ['name' => 'Calibri', 'size' => 14, 'bold' => true], ['alignment' => Jc::CENTER]);
    $section->addText("INSTITUTE OF COMPUTER STUDIES", ['name' => 'Calibri', 'size' => 11, 'italic' => true], ['alignment' => Jc::CENTER]);
    $section->addTextBreak(2);

    $section->addText("APPENDIX: SYSTEM SOURCE CODE", ['name' => 'Calibri', 'size' => 20, 'bold' => true, 'color' => '1F497D'], ['alignment' => Jc::CENTER]);
    $section->addTextBreak(1);
    $section->addText("LUPON TAGAPAMAYAPA CASE MANAGEMENT AND DISPUTE RESOLUTION INFORMATION SYSTEM (LUPON CMS)", ['name' => 'Calibri', 'size' => 13, 'bold' => true], ['alignment' => Jc::CENTER]);
    $section->addTextBreak(2);

    $section->addText("This document contains the core application source code listing for the Lupon CMS web-based governance platform, covering routing, database schemas, Eloquent models, controllers, services, official legal print templates, and client-side interfaces.", ['name' => 'Calibri', 'size' => 10], ['alignment' => Jc::BOTH]);
    $section->addTextBreak(2);

    // Table of contents table
    $section->addText("TABLE OF CONTENTS", ['name' => 'Calibri', 'size' => 13, 'bold' => true, 'color' => '1F497D']);
    $tocTable = $section->addTable(['borderSize' => 6, 'borderColor' => 'CCCCCC', 'cellMargin' => 80]);
    $tocTable->addRow();
    $tocTable->addCell(1000, ['bgColor' => 'EEEEEE'])->addText("No.", ['name' => 'Calibri', 'size' => 9, 'bold' => true]);
    $tocTable->addCell(5500, ['bgColor' => 'EEEEEE'])->addText("Module & File Path", ['name' => 'Calibri', 'size' => 9, 'bold' => true]);
    $tocTable->addCell(1200, ['bgColor' => 'EEEEEE'])->addText("Lines", ['name' => 'Calibri', 'size' => 9, 'bold' => true]);
    $tocTable->addCell(1300, ['bgColor' => 'EEEEEE'])->addText("Size", ['name' => 'Calibri', 'size' => 9, 'bold' => true]);

    $fileIdx = 1;
    foreach ($modules as $moduleName => $data) {
        $tocTable->addRow();
        $cell = $tocTable->addCell(9000, ['gridSpan' => 4, 'bgColor' => 'F2F4F7']);
        $cell->addText($moduleName, ['name' => 'Calibri', 'size' => 9.5, 'bold' => true, 'color' => '1F497D']);

        foreach ($data['files'] as $relPath) {
            $fullPath = __DIR__ . '/' . $relPath;
            if (!file_exists($fullPath)) continue;
            $lineCount = count(file($fullPath));
            $fileSize = round(filesize($fullPath) / 1024, 1) . ' KB';

            $tocTable->addRow();
            $tocTable->addCell(1000)->addText($fileIdx++, ['name' => 'Calibri', 'size' => 8.5]);
            $tocTable->addCell(5500)->addText($relPath, ['name' => 'Consolas', 'size' => 8]);
            $tocTable->addCell(1200)->addText($lineCount, ['name' => 'Calibri', 'size' => 8.5]);
            $tocTable->addCell(1300)->addText($fileSize, ['name' => 'Calibri', 'size' => 8.5]);
        }
    }

    $section->addPageBreak();

    // Now write each module's code
    $fileIdx = 1;
    foreach ($modules as $moduleName => $data) {
        $section->addText($moduleName, ['name' => 'Calibri', 'size' => 14, 'bold' => true, 'color' => '1F497D']);
        $section->addText($data['description'], ['name' => 'Calibri', 'size' => 9.5, 'italic' => true]);
        $section->addTextBreak(1);

        foreach ($data['files'] as $relPath) {
            $fullPath = __DIR__ . '/' . $relPath;
            if (!file_exists($fullPath)) continue;

            $lines = file($fullPath);
            $lineCount = count($lines);
            $fileSize = round(filesize($fullPath) / 1024, 1);

            // File Title Banner
            $section->addText("File #" . ($fileIdx++) . ": " . $relPath, ['name' => 'Calibri', 'size' => 11, 'bold' => true, 'color' => '2E6E9E']);
            $section->addText("Total Lines: {$lineCount} | File Size: {$fileSize} KB", ['name' => 'Calibri', 'size' => 8.5, 'color' => '777777']);
            
            // Add code table or preformatted block
            // For PhpWord, writing lines into a table or text runs with monospace font
            $codeTable = $section->addTable(['borderSize' => 4, 'borderColor' => 'D0D0D0', 'bgColor' => 'F8F9FA', 'cellMargin' => 40]);
            $codeTable->addRow();
            $codeCell = $codeTable->addCell(9000);

            // Chunk lines so word document doesn't choke on single giant strings
            $buffer = '';
            $ln = 1;
            foreach ($lines as $line) {
                $buffer .= sprintf("%4d | %s", $ln++, $line);
                if ($ln % 50 === 0) {
                    $codeCell->addText($buffer, ['name' => 'Consolas', 'size' => 7.5]);
                    $buffer = '';
                }
            }
            if ($buffer !== '') {
                $codeCell->addText($buffer, ['name' => 'Consolas', 'size' => 7.5]);
            }

            $section->addTextBreak(1);
        }

        $section->addPageBreak();
    }

    $docxFile = __DIR__ . '/APPENDIX_SOURCE_CODE.docx';
    $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
    $objWriter->save($docxFile);
    echo "Generated APPENDIX_SOURCE_CODE.docx (" . round(filesize($docxFile) / 1024 / 1024, 2) . " MB)\n";
} catch (\Throwable $e) {
    echo "Notice on docx generation: " . $e->getMessage() . "\n";
    echo "Falling back to Word XML or rich text format if needed.\n";
}

// 4. Generate Complete All-Files Dump (APPENDIX_ALL_FILES_SOURCE_CODE.txt)
echo "Generating APPENDIX_ALL_FILES_SOURCE_CODE.txt (All 262 custom files)...\n";
$allDumpFile = __DIR__ . '/APPENDIX_ALL_FILES_SOURCE_CODE.txt';
$allHandle = fopen($allDumpFile, 'w');

fwrite($allHandle, "================================================================================\n");
fwrite($allHandle, "   LUPON CMS - FULL COMPREHENSIVE SOURCE CODE ARCHIVE (ALL 262 FILES)\n");
fwrite($allHandle, "================================================================================\n\n");

$scanDirs = ['app', 'routes', 'database', 'resources/views', 'resources/js'];
$allFiles = [];
foreach ($scanDirs as $dir) {
    $dirPath = __DIR__ . '/' . $dir;
    if (!is_dir($dirPath)) continue;
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dirPath));
    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $ext = $file->getExtension();
            if (in_array($ext, ['php', 'ts', 'tsx', 'js', 'jsx', 'blade.php', 'css'])) {
                $rel = str_replace('\\', '/', substr($file->getPathname(), strlen(__DIR__) + 1));
                $allFiles[] = $rel;
            }
        }
    }
}
sort($allFiles);

fwrite($allHandle, "TOTAL FILES INDEXED: " . count($allFiles) . "\n\n");
$idx = 1;
foreach ($allFiles as $f) {
    fwrite($allHandle, sprintf("[%03d] %s\n", $idx++, $f));
}
fwrite($allHandle, "\n" . str_repeat('=', 80) . "\n\n");

$idx = 1;
foreach ($allFiles as $rel) {
    $full = __DIR__ . '/' . $rel;
    if (!file_exists($full)) continue;
    $content = file_get_contents($full);
    $lines = explode("\n", $content);
    
    fwrite($allHandle, "\n" . str_repeat('=', 80) . "\n");
    fwrite($allHandle, sprintf("FILE #%03d: %s\n", $idx++, $rel));
    fwrite($allHandle, sprintf("Lines: %d | Size: %.1f KB\n", count($lines), round(filesize($full) / 1024, 1)));
    fwrite($allHandle, str_repeat('=', 80) . "\n\n");
    
    $ln = 1;
    foreach ($lines as $line) {
        fwrite($allHandle, sprintf("%4d | %s\n", $ln++, rtrim($line, "\r\n")));
    }
}
fclose($allHandle);
echo "Generated APPENDIX_ALL_FILES_SOURCE_CODE.txt (" . round(filesize($allDumpFile) / 1024 / 1024, 2) . " MB)\n";

echo "=== Generation Complete ===\n";
