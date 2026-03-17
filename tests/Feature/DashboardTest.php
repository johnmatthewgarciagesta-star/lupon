<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    \Spatie\Permission\Models\Role::create(['name' => 'Admin']);
    $user = User::factory()->create(['role' => 'Admin']);
    $user->assignRole('Admin');

    $this->actingAs($user);

    $this->get(route('dashboard'))->assertOk();
});
