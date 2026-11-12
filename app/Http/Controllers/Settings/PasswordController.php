<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        try {
            $request->user()->update([
                'password' => $request->password,
            ]);

            return back()->with('success', 'Password updated successfully.');
        } catch (\Throwable $e) {
            \Log::error('Password update failed: ' . $e->getMessage());
            return back()->with('error', 'An error has occurred while updating your password. Please reload your page or try again.');
        }
    }
}
