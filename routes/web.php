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
        Route::put('/cases/{id}', [App\Http\Controllers\CaseController::class, 'update'])->name('cases.update');
        Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

        // Views for Cases
        Route::get('cases', [App\Http\Controllers\CaseController::class, 'index'])->name('cases.index');
        Route::get('cases/archive', [App\Http\Controllers\CaseController::class, 'archives'])->name('cases.archive');

        // Views for Documents
        Route::get('documents', function () { return redirect()->route('documents.folders'); })->name('documents.index');
        Route::get('documents/folders', [App\Http\Controllers\DocumentController::class, 'folders'])->name('documents.folders');
        Route::get('documents/templates', [App\Http\Controllers\DocumentController::class, 'templates'])->name('documents.templates');
        Route::get('documents/view/{id}', [App\Http\Controllers\DocumentController::class, 'show'])->name('documents.show');
        Route::get('documents/view-case/{id}', [App\Http\Controllers\DocumentController::class, 'viewCase'])->name('documents.view');

        // Other Shared Views
        Route::get('analytics', [App\Http\Controllers\AnalyticsController::class, 'index'])->name('analytics.index');

        Route::get('system-reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/generate', [App\Http\Controllers\ReportController::class, 'generate'])->name('reports.generate');

        Route::get('ltia', [App\Http\Controllers\LTIAController::class, 'index'])->name('ltia.index');
        Route::post('ltia/deadline', [App\Http\Controllers\LTIAController::class, 'updateDeadline'])->name('ltia.update-deadline');
        Route::post('ltia/phases/{id}', [App\Http\Controllers\LTIAController::class, 'updatePhase'])->name('ltia.update-phase');
        Route::post('ltia/events', [App\Http\Controllers\LTIAController::class, 'storeEvent'])->name('ltia.store-event');
        Route::post('ltia/events/{id}', [App\Http\Controllers\LTIAController::class, 'updateEvent'])->name('ltia.update-event');
        Route::delete('ltia/events/{id}', [App\Http\Controllers\LTIAController::class, 'destroyEvent'])->name('ltia.destroy-event');

        // Case Lookup API
        Route::get('/api/cases/lookup', [App\Http\Controllers\CaseController::class, 'lookup'])->name('api.cases.lookup');
    });

    // Encoder and Admin Routes (Editing cases, documents, etc.)
    Route::middleware('role:Administrator|Data Encoder')->group(function () {
        Route::post('cases', [App\Http\Controllers\CaseController::class, 'store'])->name('cases.store');
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
        Route::post('documents/auto-align-ai', [App\Http\Controllers\DocumentController::class, 'autoAlignAI'])->name('documents.auto-align-ai');
        Route::post('documents/generate', [App\Http\Controllers\DocumentController::class, 'generate'])->name('documents.generate');
        Route::post('documents/generate-word', [App\Http\Controllers\DocumentController::class, 'generateWord'])->name('documents.generate-word');
        Route::post('documents/upload', [App\Http\Controllers\DocumentController::class, 'upload'])->name('documents.upload');
        Route::post('documents/store-scanned', [App\Http\Controllers\DocumentController::class, 'storeScanned'])->name('documents.store-scanned');
        Route::post('documents/create-form', [App\Http\Controllers\DocumentController::class, 'storeForm'])->name('documents.store-form');
        Route::post('documents/create-folder', [App\Http\Controllers\DocumentController::class, 'createFolder'])->name('documents.create-folder');
        Route::post('documents/upload-to-folder', [App\Http\Controllers\DocumentController::class, 'uploadToFolder'])->name('documents.upload-to-folder');
        Route::delete('documents/folders/{id}', [App\Http\Controllers\DocumentController::class, 'destroyFolder'])->name('documents.destroy-folder');
    });

    // Dynamic Permission-based & Admin Routes (Users, Audit, Roles & Permissions)
    Route::middleware('role_or_permission:Administrator|view users|manage users|view_users|manage_users')->group(function () {
        Route::resource('users', App\Http\Controllers\UserController::class)->except(['create', 'show', 'edit']);
    });

    Route::middleware('role_or_permission:Administrator|view audit trail|view_audit_trail')->group(function () {
        Route::get('audit', [App\Http\Controllers\AuditController::class, 'index'])->name('audit.index');
    });

    Route::middleware('role_or_permission:Administrator|manage roles|manage_roles')->group(function () {
        Route::get('roles-permissions', [App\Http\Controllers\RolePermissionController::class, 'index'])->name('roles-permissions.index');
        Route::post('roles-permissions/{role}', [App\Http\Controllers\RolePermissionController::class, 'update'])->name('roles-permissions.update');
    });
});

// Capture Frontend Crashes to Audit Trail (Defense Sabotage Tracker)
Route::post('/api/system-error', function (\Illuminate\Http\Request $request) {
    try {
        \App\Services\AuditService::log(
            'FRONTEND_ERROR',
            'React UI Interface',
            substr('Browser Crash: ' . $request->input('message') . ' at ' . $request->input('url'), 0, 1000),
            null,
            \Illuminate\Support\Facades\Auth::check() ? \Illuminate\Support\Facades\Auth::id() : null
        );
    } catch (\Exception $e) {}
    return response()->json(['status' => 'logged']);
})->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

require __DIR__.'/settings.php';
