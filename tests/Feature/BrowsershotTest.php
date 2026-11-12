<?php

use App\Services\BrowsershotService;
use Spatie\Browsershot\Browsershot;

test('browsershot service configures a browsershot instance', function () {
    $browsershot = BrowsershotService::html('<h1>Unit Test</h1>');

    expect($browsershot)->toBeInstanceOf(Browsershot::class);
});

test('browsershot generates a valid pdf document', function () {
    $pdf = BrowsershotService::html('<h2>Testing Lupon Browsershot PDF</h2>')->pdf();

    expect($pdf)
        ->toBeString()
        ->not->toBeEmpty()
        ->toStartWith('%PDF-');
});

test('browsershot test artisan command executes successfully', function () {
    $this->artisan('browsershot:test')
        ->assertSuccessful();
});
