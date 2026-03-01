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
    Route::get('cases/archive', [App\Http\Controllers\CaseController::class, 'archives'])->name('cases.archive');

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


    Route::get('documents/new', [App\Http\Controllers\DocumentController::class, 'newDocument'])->name('documents.new');
    Route::post('documents/store-custom', [App\Http\Controllers\DocumentController::class, 'storeCustom'])->name('documents.store-custom');
    Route::get('documents/edit-template/{id}', [App\Http\Controllers\DocumentController::class, 'editTemplate'])->name('documents.edit-template');
    Route::get('documents/edit-standard/{type}', [App\Http\Controllers\DocumentController::class, 'editStandardTemplate'])->name('documents.edit-standard');
    Route::post('documents/update-custom/{id}', [App\Http\Controllers\DocumentController::class, 'updateCustom'])->name('documents.update-custom');
    Route::get('documents/create/{type}', [App\Http\Controllers\DocumentController::class, 'create'])->name('documents.create');
    Route::get('documents/fill-custom/{id}', [App\Http\Controllers\DocumentController::class, 'fillCustom'])->name('documents.fill-custom');
    Route::post('documents/delete/{id}', [App\Http\Controllers\DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::post('documents/save-layout', [App\Http\Controllers\DocumentController::class, 'saveLayout'])->name('documents.save-layout');

    Route::put('/cases/{id}', [App\Http\Controllers\CaseController::class, 'update'])->name('cases.update');
    Route::delete('/cases/{id}', [App\Http\Controllers\CaseController::class, 'destroy'])->name('cases.destroy');
    Route::post('/cases/bulk-destroy', [App\Http\Controllers\CaseController::class, 'bulkDestroy'])->name('cases.bulk-destroy');

    Route::get('documents/view/{id}', [App\Http\Controllers\DocumentController::class, 'show'])->name('documents.show');
    Route::get('documents/view-case/{id}', [App\Http\Controllers\DocumentController::class, 'viewCase'])->name('documents.view');

    Route::post('documents/generate', [App\Http\Controllers\DocumentController::class, 'generate'])->name('documents.generate');
    Route::post('documents/generate-word', [App\Http\Controllers\DocumentController::class, 'generateWord'])->name('documents.generate-word');

    Route::post('documents/upload', [App\Http\Controllers\DocumentController::class, 'upload'])->name('documents.upload');
    Route::post('documents/create-form', [App\Http\Controllers\DocumentController::class, 'createForm'])->name('documents.create-form');
});




require __DIR__ . '/settings.php';
