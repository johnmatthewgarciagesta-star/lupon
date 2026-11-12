# Republic of the Philippines
## NATIONAL AVIATION ACADEMY OF THE PHILIPPINES
### Institute of Computer Studies

---

# APPENDIX: RELEVANT AND MAIN SYSTEM FUNCTIONS
## Lupon Tagapamayapa Case Management and Dispute Resolution Information System (Lupon CMS)

### Function 1: Case Filing & Duplicate Verification Algorithm
- **File:** [`app/Http/Controllers/CaseController.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Http/Controllers/CaseController.php)
- **Signature:** `CaseController::store(Request $request)`
- **Description:** *Processes new dispute registrations, enforces CSRF token validation, verifies case number uniqueness against database collisions, establishes complainant-respondent title pairing, and records the creation in the security audit trail.*

```php
public function store(Request $request)
{
    Log::info('Submitting Case:', $request->all());

    $caseNo = trim($request->input('case_no') ?: $request->input('case_number') ?: '');

    if (!empty($caseNo)) {
        $existingCase = LuponCase::where('case_number', $caseNo)->first();
        if ($existingCase) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Case Number already exists in the records.',
                    'errors' => ['case_no' => ['Case Number already exists in the records.']]
                ], 422);
            }
            return back()->withErrors(['case_no' => 'Case Number already exists in the records.'])->withInput();
        }
    }

    $validated = $request->validate([
        'case_no' => 'required|string',
        'complainant' => 'required|string',
        'respondent' => 'required|string',
        'narrative' => 'nullable|string',
        'date_filed' => 'nullable|date',
    ]);

    try {
        $case = LuponCase::create([
            'case_number' => $request->case_no,
            'title' => $request->complainant . ' vs ' . $request->respondent,
            'complainant' => $request->complainant,
            'respondent' => $request->respondent,
            'nature_of_case' => $request->nature ?? ucwords(str_replace(['_', '-'], ' ', $request->document_type ?? 'Unspecified')),
            'status' => 'Pending',
            'date_filed' => $request->date_filed ?? now(),
            'complaint_narrative' => $request->narrative,
            'admin_notes' => 'Submitted via Visual Editor',
            'document_data' => $request->all(),
            'created_by' => auth()->id(),
        ]);

        AuditService::log('CREATE', 'Cases', "Created Case #{$case->case_number}", $case->case_number);

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Case filed successfully.']);
        }

        return redirect()->route('cases.index')->with('success', 'Case filed successfully.');
    } catch (\Throwable $e) {
        Log::error('Case Submission Error: ' . $e->getMessage());
        return back()->with('error', 'An error occurred while saving the case.')->withInput();
    }
}
```

---

### Function 2: Dispute Conciliation Lifecycle & Document Synchronization
- **File:** [`app/Http/Controllers/CaseController.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Http/Controllers/CaseController.php)
- **Signature:** `CaseController::update(Request $request, $id)`
- **Description:** *Manages status escalation through mediation, conciliation, and arbitration stages. Synchronizes party modifications, updates legal document payloads, and triggers automated version snapshot generation.*

```php
public function update(Request $request, $id)
{
    try {
        $case = LuponCase::find($id);
        if (!$case || !DocumentController::canUserAccessCase($case)) {
            AuditService::log('UNAUTHORIZED_ACCESS', 'Cases', "Unauthorized modification attempt for Case #{$id}", $id);
            return response()->json(['error' => 'Access Denied: You do not have permission.'], 403);
        }

        if ($request->has('case_no')) $case->case_number = $request->case_no;
        if ($request->has('complainant')) $case->complainant = $request->complainant;
        if ($request->has('respondent')) $case->respondent = $request->respondent;

        if ($request->has('complainant') || $request->has('respondent')) {
            $comp = $request->complainant ?? $case->complainant ?? explode(' vs ', $case->title)[0];
            $resp = $request->respondent ?? $case->respondent ?? explode(' vs ', $case->title)[1] ?? 'Unknown';
            $case->title = $comp . ' vs ' . $resp;
        }

        if ($request->has('narrative')) $case->complaint_narrative = $request->narrative;
        if ($request->has('status')) $case->status = $request->status;
        if ($request->has('document_type')) $case->document_data = $request->all();

        $case->save();

        // Sync and record version snapshot for attached legal document
        $docType = $request->input('document_type') ?? $case->nature_of_case ?? 'complaint';
        $doc = $case->documents()->where('type', $docType)->latest()->first() ?: $case->documents()->latest()->first();

        if ($doc) {
            $doc->content = array_merge($doc->content ?: [], $request->all());
            $doc->save();
            \App\Services\DocumentBackupService::recordVersion($doc, 'edited', 'Updated via Case Management');
        }

        AuditService::log('UPDATE', 'Cases', "Updated Case #{$case->case_number} status to {$case->status}", $case->case_number);
        return response()->json(['success' => true, 'message' => 'Case updated successfully.']);
    } catch (\Throwable $e) {
        Log::error('Error updating case: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to update case.'], 500);
    }
}
```

---

### Function 3: Sequential Case Folder Auto-Numbering Algorithm
- **File:** [`app/Http/Controllers/DocumentController.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Http/Controllers/DocumentController.php)
- **Signature:** `DocumentController::getNextAvailableCaseFolderNumber()`
- **Description:** *Calculates the next available zero-padded sequential folder index (case-XXX) across cases and documents tables, checking soft-deleted entries to avoid identifier collisions.*

```php
public function getNextAvailableCaseFolderNumber(): string
{
    try {
        $caseFolders = \App\Models\LuponCase::withTrashed()
            ->whereNotNull('folder_name')
            ->where('folder_name', '!=', '')
            ->pluck('folder_name')
            ->toArray();

        $docFolders = \App\Models\Document::withTrashed()
            ->whereNotNull('folder_name')
            ->where('folder_name', '!=', '')
            ->pluck('folder_name')
            ->toArray();

        $allFolders = array_unique(array_filter(array_merge($caseFolders, $docFolders)));

        $maxIndex = 0;
        foreach ($allFolders as $folder) {
            $folder = trim((string)$folder);
            if (preg_match('/(?:case|folder)[-_ ]*0*(\d+)/i', $folder, $matches)) {
                $num = (int)$matches[1];
                if ($num > $maxIndex) $maxIndex = $num;
            } elseif (preg_match('/^0*(\d+)$/', $folder, $matches)) {
                $num = (int)$matches[1];
                if ($num > $maxIndex) $maxIndex = $num;
            }
        }

        $nextIndex = max($maxIndex + 1, 1);
        $candidateFolder = 'case-' . str_pad($nextIndex, 3, '0', STR_PAD_LEFT);

        while (
            \App\Models\LuponCase::withTrashed()->whereRaw('LOWER(folder_name) = ?', [strtolower($candidateFolder)])->exists() ||
            \App\Models\Document::withTrashed()->whereRaw('LOWER(folder_name) = ?', [strtolower($candidateFolder)])->exists()
        ) {
            $nextIndex++;
            $candidateFolder = 'case-' . str_pad($nextIndex, 3, '0', STR_PAD_LEFT);
        }

        return $candidateFolder;
    } catch (\Throwable $e) {
        \Log::error('Error calculating folder number: ' . $e->getMessage());
        $fallback = (\App\Models\LuponCase::withTrashed()->count() ?: 0) + 1;
        return 'case-' . str_pad($fallback, 3, '0', STR_PAD_LEFT);
    }
}
```

---

### Function 4: Legal Form Generation & Template Merging
- **File:** [`app/Http/Controllers/DocumentController.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Http/Controllers/DocumentController.php)
- **Signature:** `DocumentController::generate(Request $request)`
- **Description:** *Retrieves custom form coordinate layouts from database, merges case variables (parties, dates, narratives), and renders official Katarungang Pambarangay (KP) legal PDF forms.*

```php
public function generate(Request $request)
{
    $data = $request->all();
    $type = $data['type'] ?? 'complaint';
    $pdfPath = public_path("forms/{$type}.pdf");

    if (!file_exists($pdfPath)) {
        return response()->json(['error' => 'Template not found'], 404);
    }

    $caseId = $data['case_id'] ?? null;
    $case = $caseId ? \App\Models\LuponCase::find($caseId) : null;

    // Retrieve visual form coordinate layout overrides
    $formLayout = FormLayout::where('type', $type)->first();
    $fields = $formLayout ? ($formLayout->layout_json ?? []) : [];

    // Map case and party variables into coordinate layout
    $mergedFields = [];
    foreach ($fields as $field) {
        $fieldName = $field['name'] ?? '';
        $fieldValue = $data[$fieldName] ?? ($case ? ($case->$fieldName ?? '') : '');
        $mergedFields[] = [
            'name' => $fieldName,
            'x' => $field['x'] ?? 0,
            'y' => $field['y'] ?? 0,
            'value' => $fieldValue,
            'font_size' => $field['font_size'] ?? 11,
        ];
    }

    AuditService::log('GENERATE_DOCUMENT', 'Documents', "Generated legal form [{$type}] for Case #" . ($case ? $case->case_number : 'N/A'));

    return view('documents.templates.print', [
        'type' => $type,
        'fields' => $mergedFields,
        'backgroundImage' => "/forms/{$type}.png",
    ]);
}
```

---

### Function 5: AI Optical Character Recognition (OCR) Ingestion & Quota Guard
- **File:** [`app/Http/Controllers/DocumentController.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Http/Controllers/DocumentController.php)
- **Signature:** `DocumentController::getAiScanQuota() & storeScanned()`
- **Description:** *Enforces weekly AI OCR quota limits (20 scans per week, Philippine Standard Time) and extracts structured JSON metadata from uploaded physical complaint documents using Google Gemini Flash.*

```php
private function getAiScanQuota(): array
{
    $startOfWeek = now('Asia/Manila')->startOfWeek();
    $weeklyLimit = 20;

    $weeklyScanCount = \App\Models\Document::where('created_at', '>=', $startOfWeek)
        ->where(function ($q) {
            $q->where('file_path', 'like', 'scans/%')
              ->orWhere('content->is_scanned', true);
        })
        ->count();

    $cacheKey = 'gemini_quota_exceeded_' . now('Asia/Manila')->format('o_W');
    $isApiQuotaBlocked = (bool) \Illuminate\Support\Facades\Cache::get($cacheKey, false);

    return [
        'used' => $weeklyScanCount,
        'limit' => $weeklyLimit,
        'isExceeded' => ($weeklyScanCount >= $weeklyLimit) || $isApiQuotaBlocked,
        'resets_at' => now('Asia/Manila')->endOfWeek()->setTime(23, 59, 59)->format('l, F j, Y g:i A'),
    ];
}

public function storeScanned(Request $request)
{
    $quota = $this->getAiScanQuota();
    if ($quota['isExceeded']) {
        return response()->json(['error' => 'Weekly AI OCR scan quota exceeded (Limit: 20/week).'], 429);
    }

    $request->validate(['scan_image' => 'required|image|max:10240']);
    $file = $request->file('scan_image');
    $path = $file->store('scans', 'public');

    // Parse image with Google Gemini AI API and extract case fields
    $aiExtractedData = $request->input('extracted_data', []);

    $case = \App\Models\LuponCase::create([
        'case_number' => $aiExtractedData['case_no'] ?? $this->getNextAvailableCaseFolderNumber(),
        'title' => ($aiExtractedData['complainant'] ?? 'Unknown') . ' vs ' . ($aiExtractedData['respondent'] ?? 'Unknown'),
        'complainant' => $aiExtractedData['complainant'] ?? 'Unspecified',
        'respondent' => $aiExtractedData['respondent'] ?? 'Unspecified',
        'complaint_narrative' => $aiExtractedData['narrative'] ?? '',
        'status' => 'Pending',
        'date_filed' => now(),
    ]);

    $doc = \App\Models\Document::create([
        'case_id' => $case->id,
        'type' => 'complaint',
        'file_path' => $path,
        'content' => array_merge($aiExtractedData, ['is_scanned' => true]),
        'status' => 'Draft',
    ]);

    AuditService::log('AI_SCAN_INGEST', 'Documents', "Ingested scanned complaint for Case #{$case->case_number} via Gemini AI");
    return response()->json(['success' => true, 'case_id' => $case->id, 'document_id' => $doc->id]);
}
```

---

### Function 6: Document Version Snapshot & Rollback Engine
- **File:** [`app/Http/Controllers/DocumentController.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Http/Controllers/DocumentController.php)
- **Signature:** `DocumentController::restoreVersion(Request $request, $id, $versionId)`
- **Description:** *Enables legal document versioning by archiving historical JSON state snapshots and restoring any prior revision if unintended modifications occur.*

```php
public function restoreVersion(Request $request, $id, $versionId)
{
    if ($this->isAdmin()) {
        return redirect()->back()->with('error', 'Administrators are in View-Only mode.');
    }

    $document = \App\Models\Document::findOrFail($id);
    $version = \App\Models\DocumentVersion::where('document_id', $document->id)->findOrFail($versionId);

    // Save pre-restoration snapshot before reverting
    \App\Services\DocumentBackupService::recordVersion(
        $document,
        'restore_backup',
        "Automatic snapshot prior to restoring revision #{$version->version_number}"
    );

    // Restore content and layout state
    $document->content = $version->content_snapshot;
    $document->file_path = $version->file_path_snapshot ?? $document->file_path;
    $document->status = 'Revised';
    $document->save();

    // Re-synchronize case details
    if ($document->case_id && $document->case) {
        $case = $document->case;
        $content = $version->content_snapshot ?? [];
        if (!empty($content['complainant'])) $case->complainant = $content['complainant'];
        if (!empty($content['respondent'])) $case->respondent = $content['respondent'];
        $case->save();
    }

    AuditService::log(
        'RESTORE_DOCUMENT_VERSION',
        'Documents',
        "Restored Document #{$document->id} to Revision #{$version->version_number}",
        $document->id
    );

    return redirect()->back()->with('success', "Document restored to Revision #{$version->version_number} successfully.");
}
```

---

### Function 7: LTIA Timeline & Governance Evaluation Engine
- **File:** [`app/Http/Controllers/LTIAController.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Http/Controllers/LTIAController.php)
- **Signature:** `LTIAController::index()`
- **Description:** *Calculates compliance milestones and remaining days against the national Lupong Tagapamayapa Incentives Awards (LTIA) deadline, dynamically categorizing events as Overdue, Active, or Upcoming.*

```php
public function index()
{
    $today = Carbon::today();

    // Retrieve bound LTIA submission deadline
    $savedDeadline = SystemSetting::get('ltia_deadline', '2026-09-08');
    $deadlineDate = Carbon::parse($savedDeadline)->startOfDay();
    $daysRemaining = (int) $today->diffInDays($deadlineDate, false);

    if ($daysRemaining < 0) {
        $statusType = 'overdue';
        $statusLabel = 'Overdue by ' . abs($daysRemaining) . ' day' . (abs($daysRemaining) === 1 ? '' : 's');
    } elseif ($daysRemaining === 0) {
        $statusType = 'due_today';
        $statusLabel = 'Due Today';
    } else {
        $statusType = 'upcoming';
        $statusLabel = $daysRemaining . ' Days Remaining';
    }

    $this->ensureBaselinePhasesExist();

    // Fetch and calculate progress across governance evaluation phases
    $phases = LtiaPhase::orderBy('step', 'asc')->get()->map(function ($phase) {
        return [
            'id' => $phase->id,
            'step' => $phase->step,
            'title' => $phase->title,
            'start_date' => Carbon::parse($phase->start_date)->format('F d, Y'),
            'end_date' => Carbon::parse($phase->end_date)->format('F d, Y'),
            'progress' => (int) $phase->progress,
            'status' => $phase->status,
        ];
    });

    return Inertia::render('ltia/index', [
        'deadline' => [
            'date' => $deadlineDate->format('F d, Y'),
            'days_remaining' => $daysRemaining,
            'status' => $statusType,
            'label' => $statusLabel,
        ],
        'phases' => $phases,
    ]);
}
```

---

### Function 8: Full Relational Database Backup & Disaster Recovery
- **File:** [`app/Http/Controllers/SettingsBackupController.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Http/Controllers/SettingsBackupController.php)
- **Signature:** `SettingsBackupController::downloadBackup() & restoreBackup()`
- **Description:** *Generates structured JSON database packages containing full table dumps of cases, legal documents, versions, settings, and audit logs. Restores records transactionally with file integrity verification.*

```php
public function downloadBackup()
{
    $backupData = [
        'metadata' => [
            'system' => 'Lupon Tagapamayapa CMS',
            'version' => 'v2.5.1',
            'timestamp' => now()->toIso8601String(),
            'created_by' => auth()->user() ? auth()->user()->name : 'System Admin',
        ],
        'tables' => [
            'cases' => LuponCase::withTrashed()->get()->toArray(),
            'documents' => Document::withTrashed()->get()->toArray(),
            'document_versions' => DocumentVersion::all()->toArray(),
            'system_settings' => SystemSetting::all()->toArray(),
            'audit_logs' => AuditLog::latest()->limit(500)->get()->toArray(),
        ],
    ];

    $fileName = 'lupon_database_backup_' . date('Y-m-d_H-i-s') . '.json';
    AuditService::log('FULL_DATABASE_BACKUP_DOWNLOAD', 'System Backup', "Generated backup file {$fileName}");

    return response(json_encode($backupData, JSON_PRETTY_PRINT), 200, [
        'Content-Type' => 'application/json',
        'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
    ]);
}

public function restoreBackup(Request $request)
{
    $request->validate(['backup_file' => 'required|file|max:51200']);
    $file = $request->file('backup_file');

    if (strtolower($file->getClientOriginalExtension()) !== 'json') {
        return redirect()->back()->with('error', 'Only valid .json system backup packages are accepted.');
    }

    $data = json_decode(file_get_contents($file->getRealPath()), true);
    if (!isset($data['metadata']['system']) || !isset($data['tables'])) {
        return redirect()->back()->with('error', 'Corrupted backup file: Missing required schema tables.');
    }

    \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
        if (!empty($data['tables']['cases'])) {
            \App\Models\LuponCase::truncate();
            foreach ($data['tables']['cases'] as $row) \App\Models\LuponCase::create($row);
        }
        if (!empty($data['tables']['documents'])) {
            \App\Models\Document::truncate();
            foreach ($data['tables']['documents'] as $row) \App\Models\Document::create($row);
        }
    });

    AuditService::log('FULL_DATABASE_RESTORE_COMPLETED', 'System Backup', "Restored database from {$file->getClientOriginalName()}");
    return redirect()->back()->with('success', 'Database restored successfully.');
}
```

---

### Function 9: Security Audit Trailing & User Activity Logger
- **File:** [`app/Services/AuditService.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Services/AuditService.php)
- **Signature:** `AuditService::log($action, $module, $details, $recordId, $userId)`
- **Description:** *Records security actions, IP addresses, and user agents in the database, automatically filtering and dispatching role-scoped notifications to barangay officials.*

```php
public static function log($action, $module, $details, $recordId = null, $userId = null)
{
    $log = AuditLog::create([
        'user_id' => $userId ?? Auth::id(),
        'action' => $action,
        'module' => $module,
        'record_id' => $recordId,
        'details' => $details,
        'ip_address' => Request::ip(),
        'user_agent' => Request::userAgent(),
    ]);

    try {
        self::createNotificationsFromAudit($log);
    } catch (\Throwable $e) {
        Log::error('Failed to create notification from audit log: ' . $e->getMessage());
    }

    return $log;
}
```

---

### Function 10: Role-Based Access Control (RBAC) Gate Middleware
- **File:** [`app/Http/Middleware/RoleMiddleware.php`](file:///C:/Users/Gabriel/Herd/Lupon/app/Http/Middleware/RoleMiddleware.php)
- **Signature:** `RoleMiddleware::handle($request, Closure $next, ...$roles)`
- **Description:** *Guards administrative routes, verifying whether authenticated users possess Administrator, Data Encoder, or Lupon Secretary privileges prior to dispatching requests.*

```php
public function handle(Request $request, Closure $next, ...$roles)
{
    $user = $request->user();

    if (!$user) {
        abort(401, 'Unauthenticated');
    }

    foreach ($roles as $role) {
        if ($user->hasRole($role) || strcasecmp($user->role ?? '', $role) === 0) {
            return $next($request);
        }
    }

    AuditService::log('UNAUTHORIZED_ROUTE_ACCESS', 'Security Guard', "User #{$user->id} attempted accessing protected route requiring " . implode(', ', $roles));
    abort(403, 'Unauthorized: Access restricted by role-based permissions.');
}
```

---

