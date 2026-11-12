<?php

namespace App\Console\Commands;

use App\Services\BrowsershotService;
use Illuminate\Console\Command;

class TestBrowsershotCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'browsershot:test {--url= : Optional URL to screenshot/pdf instead of default HTML}';

    /**
     * The console command description.
     */
    protected $description = 'Test and verify Spatie Browsershot installation, binaries, and PDF/screenshot generation';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('=== Spatie Browsershot Environment Diagnostic ===');

        $nodeBinary = config('browsershot.node_binary') ?: BrowsershotService::detectNodeBinary();
        $npmBinary = config('browsershot.npm_binary') ?: BrowsershotService::detectNpmBinary();
        $chromePath = config('browsershot.chrome_path') ?: BrowsershotService::detectChromePath();

        $this->table(
            ['Setting / Component', 'Detected Path / Value', 'Status'],
            [
                ['OS Family', PHP_OS_FAMILY, 'OK'],
                ['PHP Version', PHP_VERSION, 'OK'],
                ['Node Binary', $nodeBinary ?: 'Default PATH', ($nodeBinary && file_exists($nodeBinary)) ? 'Found' : ($nodeBinary ? 'Configured (Not Found)' : 'System PATH')],
                ['NPM Binary', $npmBinary ?: 'Default PATH', ($npmBinary && file_exists($npmBinary)) ? 'Found' : ($npmBinary ? 'Configured (Not Found)' : 'System PATH')],
                ['Chrome / Chromium', $chromePath ?: 'Default Puppeteer', ($chromePath && file_exists($chromePath)) ? 'Found' : ($chromePath ? 'Configured (Not Found)' : 'Puppeteer Managed')],
            ]
        );

        $url = $this->option('url');
        $html = $url ? null : '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Browsershot Test</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; background: #f8fafc; color: #0f172a; }
                    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
                    h1 { color: #2563eb; margin-top: 0; }
                    .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #15803d; border-radius: 9999px; font-weight: 600; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <span class="badge">Success</span>
                    <h1>Spatie Browsershot is Working!</h1>
                    <p>Generated dynamically by the Lupon system on ' . date('Y-m-d H:i:s') . '</p>
                </div>
            </body>
            </html>
        ';

        $this->newLine();
        $this->info('Testing PDF generation...');
        $startTime = microtime(true);

        try {
            $browsershot = $url 
                ? BrowsershotService::url($url)
                : BrowsershotService::html($html);

            $pdfPath = storage_path('app/browsershot-test.pdf');
            $browsershot->savePdf($pdfPath);

            $pdfDuration = round(microtime(true) - $startTime, 2);
            $pdfSize = file_exists($pdfPath) ? filesize($pdfPath) : 0;

            $this->info("✓ PDF generated successfully in {$pdfDuration}s! Size: " . number_format($pdfSize) . " bytes");
            $this->line("  Saved to: {$pdfPath}");
        } catch (\Throwable $e) {
            $this->error('✗ PDF generation failed: ' . $e->getMessage());
            return 1;
        }

        $this->newLine();
        $this->info('Testing Screenshot generation...');
        $startTime = microtime(true);

        try {
            $browsershot = $url 
                ? BrowsershotService::url($url)
                : BrowsershotService::html($html);

            $pngPath = storage_path('app/browsershot-test.png');
            $browsershot->save($pngPath);

            $pngDuration = round(microtime(true) - $startTime, 2);
            $pngSize = file_exists($pngPath) ? filesize($pngPath) : 0;

            $this->info("✓ Screenshot generated successfully in {$pngDuration}s! Size: " . number_format($pngSize) . " bytes");
            $this->line("  Saved to: {$pngPath}");
        } catch (\Throwable $e) {
            $this->error('✗ Screenshot generation failed: ' . $e->getMessage());
            return 1;
        }

        $this->newLine();
        $this->info('All Spatie Browsershot tests passed successfully!');
        return 0;
    }
}
