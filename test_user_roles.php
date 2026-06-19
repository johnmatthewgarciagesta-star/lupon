<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = \App\Models\User::all();
foreach ($users as $user) {
    echo "User: {$user->name} ({$user->email})\n";
    echo "  Role (from column): {$user->role}\n";
    echo "  Roles (Spatie): " . implode(', ', $user->getRoleNames()->toArray()) . "\n";
}
