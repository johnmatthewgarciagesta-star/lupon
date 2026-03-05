<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$tables = ['users', 'cases', 'documents', 'parties', 'case_party', 'audit_logs', 'form_layouts'];
$res = [];
foreach($tables as $t) {
    try {
        $res[$t] = Illuminate\Support\Facades\DB::select("SHOW CREATE TABLE $t")[0]->{'Create Table'};
    } catch(Exception $e) { $res[$t] = 'Error: ' . $e->getMessage(); }
}
echo json_encode($res, JSON_PRETTY_PRINT);
