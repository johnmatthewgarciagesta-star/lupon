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
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('cases', function () {
        return Inertia::render('cases/index');
    })->name('cases.index');

    Route::get('documents', function () {
        return Inertia::render('documents/index');
    })->name('documents.index');

    Route::get('analytics', function () {
        return Inertia::render('analytics/index');
    })->name('analytics.index');

    Route::get('system-reports', function () {
        return Inertia::render('reports/index');
    })->name('reports.index');

    Route::get('users', function () {
        return Inertia::render('users/index');
    })->name('users.index');

    Route::get('ltia', function () {
        return Inertia::render('ltia/index');
    })->name('ltia.index');

    Route::get('audit', function () {
        return Inertia::render('audit/index');
    })->name('audit.index');

});


require __DIR__ . '/settings.php';
