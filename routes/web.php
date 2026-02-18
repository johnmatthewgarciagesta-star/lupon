<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::get('cases', [App\Http\Controllers\CaseController::class, 'index'])->name('cases.index');

    Route::post('cases', [App\Http\Controllers\CaseController::class, 'store'])->name('cases.store');

    Route::get('documents', [App\Http\Controllers\DocumentController::class, 'index'])->name('documents.index');

    Route::get('analytics', function () {
        return Inertia::render('analytics/index');
    })->name('analytics.index');

    Route::get('system-reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/generate', [App\Http\Controllers\ReportController::class, 'generate'])->name('reports.generate');

    Route::resource('users', App\Http\Controllers\UserController::class)->except(['create', 'show', 'edit']);

    Route::get('ltia', function () {
        return Inertia::render('ltia/index');
    })->name('ltia.index');

    Route::get('audit', [App\Http\Controllers\AuditController::class, 'index'])->name('audit.index');


    Route::get('documents/create/{type}', [App\Http\Controllers\DocumentController::class, 'create'])->name('documents.create');
    Route::post('documents/save-layout', [App\Http\Controllers\DocumentController::class, 'saveLayout'])->name('documents.save-layout');

    Route::put('/cases/{id}', [App\Http\Controllers\CaseController::class, 'update'])->name('cases.update');

    Route::get('documents/view/{id}', [App\Http\Controllers\DocumentController::class, 'viewCase'])->name('documents.view');

    Route::post('documents/generate', [App\Http\Controllers\DocumentController::class, 'generate'])->name('documents.generate');
});




require __DIR__ . '/settings.php';
