<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// OWASP TOP 10 PROTECTION EXPLANATION:
// 1. Broken Access Control (OWASP #1) - Pinipigilan nito ang mga user na makapasok sa mga pahina na hindi para sa kanila.
// Ang middleware na 'auth' at 'verified' ay sinisiguro na tanging ang nakapag-login lamang ang makakapasok.
Route::middleware(['auth', 'verified'])->group(function () {
    // Shared Routes
    // 2. Role-Based Access Control (Isa pang proteksyon para sa OWASP #1)
    // Ang middleware na 'role' ay sinisiguro na ang 'Administrator' o 'Data Encoder' lang ang makakabukas ng mga route na ito.
    // Kapag sinubukan itong buksan ng ordinaryong user o hacker, sila ay ma-blo-block (403 Forbidden).
    Route::middleware('role:Administrator|Data Encoder')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

        // Views for Cases
        Route::get('cases', [App\Http\Controllers\CaseController::class, 'index'])->name('cases.index');
        Route::get('cases/archive', [App\Http\Controllers\CaseController::class, 'archives'])->name('cases.archive');

        // Views for Documents
        Route::get('documents', [App\Http\Controllers\DocumentController::class, 'index'])->name('documents.index');
        Route::get('documents/view/{id}', [App\Http\Controllers\DocumentController::class, 'show'])->name('documents.show');
        Route::get('documents/view-case/{id}', [App\Http\Controllers\DocumentController::class, 'viewCase'])->name('documents.view');

        // Other Shared Views
        Route::get('analytics', [App\Http\Controllers\AnalyticsController::class, 'index'])->name('analytics.index');

        Route::get('system-reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/generate', [App\Http\Controllers\ReportController::class, 'generate'])->name('reports.generate');

        Route::get('ltia', [App\Http\Controllers\LTIAController::class, 'index'])->name('ltia.index');

        // Case Lookup API
        Route::get('/api/cases/lookup', [App\Http\Controllers\CaseController::class, 'lookup'])->name('api.cases.lookup');
    });

    // Encoder Only Routes (Editing cases, documents, etc.)
    Route::middleware('role:Data Encoder')->group(function () {
        Route::post('cases', [App\Http\Controllers\CaseController::class, 'store'])->name('cases.store');
        Route::put('/cases/{id}', [App\Http\Controllers\CaseController::class, 'update'])->name('cases.update');
        Route::delete('/cases/{id}', [App\Http\Controllers\CaseController::class, 'destroy'])->name('cases.destroy');
        Route::post('/cases/{id}/archive', [App\Http\Controllers\CaseController::class, 'destroy'])->name('cases.archive-single');
        Route::post('/cases/{id}/restore', [App\Http\Controllers\CaseController::class, 'restore'])->name('cases.restore');
        Route::post('/cases/bulk-destroy', [App\Http\Controllers\CaseController::class, 'bulkDestroy'])->name('cases.bulk-destroy');

        Route::get('documents/new', [App\Http\Controllers\DocumentController::class, 'newDocument'])->name('documents.new');
        Route::post('documents/store-custom', [App\Http\Controllers\DocumentController::class, 'storeCustom'])->name('documents.store-custom');
        Route::get('documents/edit-template/{id}', [App\Http\Controllers\DocumentController::class, 'editTemplate'])->name('documents.edit-template');
        Route::get('documents/edit-standard/{type}', [App\Http\Controllers\DocumentController::class, 'editStandardTemplate'])->name('documents.edit-standard');
        Route::post('documents/update-custom/{id}', [App\Http\Controllers\DocumentController::class, 'updateCustom'])->name('documents.update-custom');
        Route::get('documents/create/{type}', [App\Http\Controllers\DocumentController::class, 'create'])->name('documents.create');
        Route::get('documents/fill-custom/{id}', [App\Http\Controllers\DocumentController::class, 'fillCustom'])->name('documents.fill-custom');
        Route::post('documents/delete/{id}', [App\Http\Controllers\DocumentController::class, 'destroy'])->name('documents.destroy');
        Route::post('documents/save-layout', [App\Http\Controllers\DocumentController::class, 'saveLayout'])->name('documents.save-layout');
        Route::post('documents/generate', [App\Http\Controllers\DocumentController::class, 'generate'])->name('documents.generate');
        Route::post('documents/generate-word', [App\Http\Controllers\DocumentController::class, 'generateWord'])->name('documents.generate-word');
        Route::post('documents/upload', [App\Http\Controllers\DocumentController::class, 'upload'])->name('documents.upload');
        Route::post('documents/create-form', [App\Http\Controllers\DocumentController::class, 'storeForm'])->name('documents.create-form');
    });

    // Admin Only Routes (Users and Audit Trail)
    Route::middleware('role:Administrator')->group(function () {
        Route::resource('users', App\Http\Controllers\UserController::class)->except(['create', 'show', 'edit']);
        Route::get('audit', [App\Http\Controllers\AuditController::class, 'index'])->name('audit.index');

        // Role & Permission Management
        Route::get('roles-permissions', [App\Http\Controllers\RolePermissionController::class, 'index'])->name('roles-permissions.index');
        Route::post('roles-permissions/{role}', [App\Http\Controllers\RolePermissionController::class, 'update'])->name('roles-permissions.update');
    });
});

require __DIR__.'/settings.php';
