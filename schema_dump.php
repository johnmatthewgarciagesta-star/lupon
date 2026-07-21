<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

$tables = Schema::getTableListing();
$schema = [];
foreach ($tables as $t) {
    $schema[$t] = [
        'columns' => Schema::getColumnListing($t),
        'foreign_keys' => Schema::getForeignKeys($t)
    ];
}
echo json_encode($schema, JSON_PRETTY_PRINT);
