<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Node & NPM Binaries
    |--------------------------------------------------------------------------
    |
    | Define custom paths to the Node.js and NPM executables if they are not
    | in the system PATH or when running in special environments (e.g. Herd on Windows).
    |
    */
    'node_binary' => env('BROWSERSHOT_NODE_PATH', env('NODE_BINARY', null)),

    'npm_binary' => env('BROWSERSHOT_NPM_PATH', env('NPM_BINARY', null)),

    /*
    |--------------------------------------------------------------------------
    | Chrome / Chromium Executable Path
    |--------------------------------------------------------------------------
    |
    | By default, Puppeteer uses its installed Chromium binary in ~/.cache/puppeteer.
    | You can override this with a specific path to Chrome, Chromium, or Edge.
    |
    */
    'chrome_path' => env('CHROME_PATH', env('BROWSERSHOT_CHROME_PATH', null)),

    /*
    |--------------------------------------------------------------------------
    | Execution Defaults
    |--------------------------------------------------------------------------
    |
    | Default configuration options passed to Browsershot instances.
    |
    */
    'timeout' => (int) env('BROWSERSHOT_TIMEOUT', 120),

    'no_sandbox' => (bool) env('BROWSERSHOT_NO_SANDBOX', true),

    'ignore_https_errors' => (bool) env('BROWSERSHOT_IGNORE_HTTPS_ERRORS', true),

    'args' => [
        '--disable-web-security',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
    ],
];
