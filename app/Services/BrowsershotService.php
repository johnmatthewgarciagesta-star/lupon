<?php

namespace App\Services;

use Spatie\Browsershot\Browsershot;

class BrowsershotService
{
    /**
     * Create a preconfigured Browsershot instance from raw HTML.
     */
    public static function html(string $html): Browsershot
    {
        return static::configure(Browsershot::html($html));
    }

    /**
     * Create a preconfigured Browsershot instance from a URL.
     */
    public static function url(string $url): Browsershot
    {
        return static::configure(Browsershot::url($url));
    }

    /**
     * Create a preconfigured Browsershot instance from a Blade view.
     */
    public static function view(string $view, array $data = [], array $mergeData = []): Browsershot
    {
        $rendered = view($view, $data, $mergeData)->render();
        return static::html($rendered);
    }

    /**
     * Configure a Browsershot instance with environment-aware binary paths and defaults.
     */
    public static function configure(Browsershot $browsershot): Browsershot
    {
        // 1. Node Binary
        $nodeBinary = config('browsershot.node_binary') ?: static::detectNodeBinary();
        if ($nodeBinary) {
            $browsershot->setNodeBinary($nodeBinary);
        }

        // 2. NPM Binary
        $npmBinary = config('browsershot.npm_binary') ?: static::detectNpmBinary();
        if ($npmBinary) {
            $browsershot->setNpmBinary($npmBinary);
        }

        // 3. Chrome / Chromium Executable Path
        $chromePath = config('browsershot.chrome_path') ?: static::detectChromePath();
        if ($chromePath) {
            $browsershot->setChromePath($chromePath);
        }

        // 4. Timeouts & Reliability
        $timeout = config('browsershot.timeout', 120);
        $browsershot->timeout($timeout);
        $browsershot->waitUntilNetworkIdle();

        // 5. Sandbox & Security Options
        if (config('browsershot.no_sandbox', true)) {
            $browsershot->noSandbox();
        }

        if (config('browsershot.ignore_https_errors', true)) {
            $browsershot->ignoreHttpsErrors();
        }

        $args = config('browsershot.args', [
            '--disable-web-security',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]);

        if (!empty($args)) {
            $browsershot->setOption('args', $args);
        }

        return $browsershot;
    }

    /**
     * Automatically detect Node.js binary path on Windows / system.
     */
    public static function detectNodeBinary(): ?string
    {
        if (PHP_OS_FAMILY === 'Windows') {
            $commonPaths = [
                'C:\\Program Files\\nodejs\\node.exe',
                'C:\\Program Files (x86)\\nodejs\\node.exe',
            ];

            foreach ($commonPaths as $path) {
                if (file_exists($path)) {
                    return $path;
                }
            }
        }

        return null;
    }

    /**
     * Automatically detect NPM binary path on Windows / system.
     */
    public static function detectNpmBinary(): ?string
    {
        if (PHP_OS_FAMILY === 'Windows') {
            $commonPaths = [
                'C:\\Program Files\\nodejs\\npm.cmd',
                'C:\\Program Files (x86)\\nodejs\\npm.cmd',
            ];

            foreach ($commonPaths as $path) {
                if (file_exists($path)) {
                    return $path;
                }
            }
        }

        return null;
    }

    /**
     * Automatically detect Chrome/Chromium/Edge executable path.
     */
    public static function detectChromePath(): ?string
    {
        if (PHP_OS_FAMILY === 'Windows') {
            // Check Puppeteer cache first
            $home = getenv('USERPROFILE') ?: (getenv('HOMEDRIVE') . getenv('HOMEPATH'));
            if ($home) {
                $puppeteerChrome = glob($home . '/.cache/puppeteer/chrome/win64-*/chrome-win64/chrome.exe');
                if (!empty($puppeteerChrome) && file_exists($puppeteerChrome[0])) {
                    return $puppeteerChrome[0];
                }

                $puppeteerHeadless = glob($home . '/.cache/puppeteer/chrome-headless-shell/win64-*/chrome-headless-shell-win64/chrome-headless-shell.exe');
                if (!empty($puppeteerHeadless) && file_exists($puppeteerHeadless[0])) {
                    return $puppeteerHeadless[0];
                }
            }

            // Standard Windows Chrome and Edge paths
            $candidates = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
            ];

            foreach ($candidates as $candidate) {
                if (file_exists($candidate)) {
                    return $candidate;
                }
            }
        }

        return null;
    }
}
