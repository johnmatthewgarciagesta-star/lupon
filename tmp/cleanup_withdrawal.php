<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$layouts = \App\Models\FormLayout::all();
foreach ($layouts as $f) {
    $l = $f->layout_json;
    $changed = false;
    if (is_array($l)) {
        foreach ($l as &$field) {
            if (isset($field['default']) && str_contains($field['default'], 'voluntarily withdraw')) {
                $field['default'] = '';
                $changed = true;
            }
        }
    }
    if ($changed) {
        $f->layout_json = $l;
        $f->save();
        echo "Updated DB layout for: " . $f->document_type . "\n";
    }
}
echo "Done.\n";
