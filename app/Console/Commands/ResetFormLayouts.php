<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FormLayout;
use App\Config\FormLayouts;

class ResetFormLayouts extends Command
{
    protected $signature = 'forms:reset-layouts';
    protected $description = 'Reset form layouts to default clean configuration';

    public function handle()
    {
        $all = FormLayouts::getAllLayouts();
        foreach ($all as $type => $fields) {
            FormLayout::updateOrCreate(
                ['document_type' => $type],
                ['layout_json' => $fields]
            );
        }
        $this->info('All form layouts have been reset to clean default coordinates!');
        return 0;
    }
}
