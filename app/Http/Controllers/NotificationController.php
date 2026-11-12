<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get recent notifications and unread count for current user.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['notifications' => [], 'unread_count' => 0]);
            }

            $isAdmin = $user->hasRole('Administrator') || $user->hasRole('Admin') || in_array($user->role, ['Administrator', 'Admin']);

            $query = Notification::where('user_id', $user->id);

            if (!$isAdmin) {
                // Data Encoders do not see system/frontend error messages
                $query->where('action', 'NOT LIKE', '%ERROR%')
                      ->where('action', 'NOT LIKE', '%NOT_FOUND%')
                      ->where('action', 'NOT LIKE', '%MISMATCH%')
                      ->where('action', 'NOT LIKE', '%FAILED%')
                      ->where('module', 'NOT LIKE', '%kernel%')
                      ->where('module', 'NOT LIKE', '%system%')
                      ->where(function ($q) {
                          $q->whereNull('details')
                            ->orWhere('details', 'NOT LIKE', '%Error Type:%');
                      });
            }

            $notifications = (clone $query)
                ->recent()
                ->limit(25)
                ->get();

            $unreadCount = (clone $query)
                ->unread()
                ->count();

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Notifications fetch failed: ' . $e->getMessage());
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
            ]);
        }
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false], 401);
            }

            $notification = Notification::where('user_id', $user->id)
                ->where('id', $id)
                ->first();

            if ($notification) {
                $notification->update(['read_at' => now()]);
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            \Log::error('Error marking notification as read: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'An error has occurred.'], 500);
        }
    }

    /**
     * Mark all notifications as read for current user.
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false], 401);
            }

            Notification::where('user_id', $user->id)
                ->unread()
                ->update(['read_at' => now()]);

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            \Log::error('Error marking all notifications as read: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'An error has occurred.'], 500);
        }
    }

    /**
     * Clear read notifications for current user.
     */
    public function clear(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false], 401);
            }

            Notification::where('user_id', $user->id)
                ->whereNotNull('read_at')
                ->delete();

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            \Log::error('Error clearing notifications: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'An error has occurred.'], 500);
        }
    }
}
