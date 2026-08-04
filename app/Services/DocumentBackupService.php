<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Support\Facades\Log;

class DocumentBackupService
{
    /**
     * Create an immutable backup snapshot version for a document.
     */
    public static function recordVersion(Document $document, string $changeType = 'edited', ?string $customNote = null): ?DocumentVersion
    {
        try {
            $user = auth()->user();
            $nextVersionNumber = DocumentVersion::where('document_id', $document->id)->max('version_number') + 1;

            $version = DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => $nextVersionNumber,
                'edited_by' => $user ? $user->id : null,
                'edited_by_name' => $user ? $user->name : 'System Automated Backup',
                'change_type' => $changeType,
                'content_snapshot' => $document->content ?: [],
                'file_path_snapshot' => $document->file_path,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            // Audit Trail Security Event
            AuditService::log(
                'SECURITY_DOCUMENT_BACKUP',
                'Data Integrity & Anti-Tamper',
                "Created backup version #{$nextVersionNumber} for document ID #{$document->id} ({$document->type}) - Action: {$changeType}" . ($customNote ? " ({$customNote})" : ""),
                $document->id
            );

            return $version;
        } catch (\Exception $e) {
            Log::error('DocumentBackupService recordVersion failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Restore a document to a previous historical version snapshot.
     */
    public static function restoreVersion(Document $document, int $versionId): bool
    {
        try {
            $version = DocumentVersion::where('document_id', $document->id)->where('id', $versionId)->first();
            if (!$version) {
                return false;
            }

            // Revert document fields
            $document->content = $version->content_snapshot;
            if ($version->file_path_snapshot) {
                $document->file_path = $version->file_path_snapshot;
            }
            $document->save();

            // Record a new backup entry for restoration audit trail
            static::recordVersion($document, 'restored', "Restored back to Version #{$version->version_number}");

            // Audit Trail Log
            $user = auth()->user();
            AuditService::log(
                'RESTORE_DOCUMENT_VERSION',
                'Data Security & Recovery',
                "User " . ($user ? $user->name : 'Admin') . " restored document ID #{$document->id} to version #{$version->version_number}",
                $document->id
            );

            return true;
        } catch (\Exception $e) {
            Log::error('DocumentBackupService restoreVersion failed: ' . $e->getMessage());
            return false;
        }
    }
}
