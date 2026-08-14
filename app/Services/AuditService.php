<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class AuditService
{
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
            Log::error('Failed to create notifications for audit log: ' . $e->getMessage());
        }

        return $log;
    }

    public static function createNotificationsFromAudit(AuditLog $auditLog)
    {
        $title = self::formatTitle($auditLog->action, $auditLog->module);
        $link = self::determineLink($auditLog->module);

        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $now = now();
        $notifications = [];

        $isErrorMessage = str_contains(strtolower($auditLog->module), 'system') ||
                          str_contains(strtolower($auditLog->module), 'kernel') ||
                          str_contains(strtolower($auditLog->action), 'error') ||
                          str_contains(strtolower($auditLog->action), 'not_found') ||
                          str_contains(strtolower($auditLog->action), 'mismatch') ||
                          str_contains(strtolower($auditLog->action), 'failed') ||
                          str_contains(strtolower($auditLog->details), 'error type:');

        foreach ($users as $user) {
            $userIsAdmin = $user->hasRole('Administrator') || $user->hasRole('Admin') || in_array($user->role, ['Administrator', 'Admin']);

            // Non-admin users (Data Encoders) will not receive technical error message notifications
            if (!$userIsAdmin && $isErrorMessage) {
                continue;
            }

            $notifications[] = [
                'user_id' => $user->id,
                'audit_log_id' => $auditLog->id,
                'title' => $title,
                'details' => $auditLog->details,
                'module' => $auditLog->module,
                'action' => $auditLog->action,
                'link' => $link,
                'read_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($notifications)) {
            Notification::insert($notifications);
        }
    }

    private static function formatTitle(string $action, string $module): string
    {
        $cleanModule = strtolower($module);
        if (str_contains($cleanModule, 'case')) {
            return "Case Event: {$action}";
        }
        if (str_contains($cleanModule, 'doc')) {
            return "Document Event: {$action}";
        }
        if (str_contains($cleanModule, 'ltia')) {
            return "LTIA Update: {$action}";
        }
        if (str_contains($cleanModule, 'auth') || str_contains($cleanModule, 'login')) {
            return "Security Alert: {$action}";
        }
        if (str_contains($cleanModule, 'user')) {
            return "User Management: {$action}";
        }

        return "{$module}: {$action}";
    }

    private static function determineLink(string $module): string
    {
        $cleanModule = strtolower($module);
        if (str_contains($cleanModule, 'case')) {
            return '/cases';
        }
        if (str_contains($cleanModule, 'doc')) {
            return '/documents';
        }
        if (str_contains($cleanModule, 'ltia')) {
            return '/ltia';
        }
        if (str_contains($cleanModule, 'user')) {
            return '/users';
        }
        if (str_contains($cleanModule, 'auth') || str_contains($cleanModule, 'login') || str_contains($cleanModule, 'security')) {
            return '/dashboard';
        }

        return '/dashboard';
    }
}

