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
        $user = $request->user();
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
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $notification->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read for current user.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Clear read notifications for current user.
     */
    public function clear(Request $request)
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)
            ->whereNotNull('read_at')
            ->delete();

        return response()->json(['success' => true]);
    }
}
