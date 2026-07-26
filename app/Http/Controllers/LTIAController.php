<?php

namespace App\Http\Controllers;

use App\Models\LtiaEvent;
use App\Models\LtiaPhase;
use App\Models\SystemSetting;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LTIAController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // 1. Primary Bound Deadline (Default: September 08, 2026)
        $savedDeadline = SystemSetting::get('ltia_deadline');
        if ($savedDeadline) {
            $deadlineDate = Carbon::parse($savedDeadline)->startOfDay();
        } else {
            $deadlineDate = Carbon::create(2026, 9, 8)->startOfDay();
            SystemSetting::set('ltia_deadline', $deadlineDate->format('Y-m-d'));
        }

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

        // 2. Ensure Default Baseline Timeline Phases Exist
        $this->ensureBaselinePhasesExist();

        // Fetch phases sorted by step
        $phases = LtiaPhase::orderBy('step', 'asc')->get()->map(function ($phase) {
            $startDate = Carbon::parse($phase->start_date);
            $endDate = Carbon::parse($phase->end_date);

            // Format status label for UI
            $statusMap = [
                'in_progress' => 'In Progress',
                'upcoming' => 'Upcoming',
                'completed' => 'Completed',
            ];

            return [
                'id' => $phase->id,
                'step' => $phase->step,
                'title' => $phase->title,
                'description' => $phase->description ?? '',
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'formatted_start_date' => $startDate->format('F d, Y'),
                'formatted_end_date' => $endDate->format('F d, Y'),
                'progress' => (int) $phase->progress,
                'status' => $phase->status,
                'status_label' => $statusMap[$phase->status] ?? ucfirst($phase->status),
            ];
        });

        // 3. Ensure Default Baseline Calendar Events Exist & Fetch
        $this->ensureBaselineEventsExist();

        $events = LtiaEvent::orderBy('event_date', 'asc')->get()->map(function ($event) use ($today) {
            $eventDate = Carbon::parse($event->event_date)->startOfDay();
            $diffDays = (int) $today->diffInDays($eventDate, false);

            if ($diffDays < 0) {
                $eventStatus = 'overdue';
                $eventStatusLabel = 'Overdue';
            } elseif ($diffDays === 0) {
                $eventStatus = 'active';
                $eventStatusLabel = 'Active / Today';
            } else {
                $eventStatus = 'upcoming';
                $eventStatusLabel = 'Upcoming';
            }

            return [
                'id' => $event->id,
                'title' => $event->title,
                'notes' => $event->notes ?? '',
                'event_date' => $eventDate->format('Y-m-d'),
                'formatted_date' => $eventDate->format('F d, Y'),
                'status' => $eventStatus,
                'status_label' => $eventStatusLabel,
                'days_diff' => $diffDays,
            ];
        });

        return Inertia::render('ltia/index', [
            'deadline' => [
                'date' => $deadlineDate->format('Y-m-d'),
                'formatted_date' => $deadlineDate->format('F d, Y'),
                'days_remaining' => $daysRemaining,
                'status_type' => $statusType,
                'status_label' => $statusLabel,
                'sync_status' => 'Live Synchronized',
            ],
            'timeline' => $phases,
            'events' => $events,
        ]);
    }

    /**
     * Action to update the primary system deadline date.
     */
    public function updateDeadline(Request $request)
    {
        $validated = $request->validate([
            'deadline_date' => 'required|date_format:Y-m-d',
        ]);

        $oldDeadlineStr = SystemSetting::get('ltia_deadline', '2026-09-08');
        $oldDeadline = Carbon::parse($oldDeadlineStr)->startOfDay();
        $newDeadline = Carbon::parse($validated['deadline_date'])->startOfDay();

        $diffInDays = (int) $oldDeadline->diffInDays($newDeadline, false);

        // Update stored primary deadline
        SystemSetting::set('ltia_deadline', $validated['deadline_date']);

        // Automatically shift phase dates if primary deadline changes
        if ($diffInDays !== 0) {
            $phases = LtiaPhase::all();
            foreach ($phases as $phase) {
                $newStart = Carbon::parse($phase->start_date)->addDays($diffInDays);
                $newEnd = Carbon::parse($phase->end_date)->addDays($diffInDays);

                $phase->update([
                    'start_date' => $newStart->format('Y-m-d'),
                    'end_date' => $newEnd->format('Y-m-d'),
                ]);
            }
        }

        $formatted = $newDeadline->format('F d, Y');
        AuditService::log('UPDATE', 'LTIA', "Updated primary system deadline to {$formatted}", auth()->id());

        return redirect()->back()->with('success', 'LTIA system deadline updated & application timeline synchronized.');
    }

    /**
     * Action to update a specific timeline phase.
     */
    public function updatePhase(Request $request, $id)
    {
        $phase = LtiaPhase::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
            'status' => 'required|string|in:in_progress,upcoming,completed',
            'progress' => 'required|integer|min:0|max:100',
        ]);

        $phase->update($validated);

        // If editing phase 4 (Final Awarding & Submission Deadline), also sync primary deadline
        if ((int) $phase->step === 4) {
            SystemSetting::set('ltia_deadline', $validated['end_date']);
        }

        AuditService::log('UPDATE', 'LTIA', "Updated Timeline Phase #{$phase->step}: {$phase->title}", auth()->id());

        return redirect()->back()->with('success', "Timeline phase '{$phase->title}' updated successfully.");
    }

    /**
     * Action to create a custom event / agenda.
     */
    public function storeEvent(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'event_date' => 'required|date_format:Y-m-d',
        ]);

        $event = LtiaEvent::create($validated);

        AuditService::log('CREATE', 'LTIA', "Created Calendar Agenda Event: {$event->title}", auth()->id());

        return redirect()->back()->with('success', "Event '{$event->title}' added successfully.");
    }

    /**
     * Action to update an existing event.
     */
    public function updateEvent(Request $request, $id)
    {
        $event = LtiaEvent::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'event_date' => 'required|date_format:Y-m-d',
        ]);

        $event->update($validated);

        AuditService::log('UPDATE', 'LTIA', "Updated Calendar Agenda Event: {$event->title}", auth()->id());

        return redirect()->back()->with('success', "Event '{$event->title}' updated successfully.");
    }

    /**
     * Action to delete an event.
     */
    public function destroyEvent($id)
    {
        $event = LtiaEvent::findOrFail($id);
        $title = $event->title;
        $event->delete();

        AuditService::log('DELETE', 'LTIA', "Deleted Calendar Agenda Event: {$title}", auth()->id());

        return redirect()->back()->with('success', "Event '{$title}' deleted.");
    }

    /**
     * Initialize baseline phases if empty.
     */
    private function ensureBaselinePhasesExist(): void
    {
        if (LtiaPhase::count() > 0) {
            return;
        }

        $baselinePhases = [
            [
                'step' => 1,
                'title' => 'Nomination & Application Period',
                'description' => 'Submission of official Lupon application packages & entry requirements',
                'start_date' => '2026-07-10',
                'end_date' => '2026-08-09',
                'progress' => 43,
                'status' => 'in_progress',
            ],
            [
                'step' => 2,
                'title' => 'Technical Evaluation Period',
                'description' => 'Review of case management compliance and documentation standards',
                'start_date' => '2026-08-10',
                'end_date' => '2026-08-24',
                'progress' => 0,
                'status' => 'upcoming',
            ],
            [
                'step' => 3,
                'title' => 'Committee Deliberation',
                'description' => 'Final review and scoring by the assessment committee',
                'start_date' => '2026-08-25',
                'end_date' => '2026-09-03',
                'progress' => 0,
                'status' => 'upcoming',
            ],
            [
                'step' => 4,
                'title' => 'Final Awarding & Submission Deadline',
                'description' => 'Official system submission deadline and LTIA awarding ceremony',
                'start_date' => '2026-09-08',
                'end_date' => '2026-09-08',
                'progress' => 0,
                'status' => 'upcoming',
            ],
        ];

        foreach ($baselinePhases as $phaseData) {
            LtiaPhase::create($phaseData);
        }
    }

    /**
     * Initialize baseline events if empty.
     */
    private function ensureBaselineEventsExist(): void
    {
        if (LtiaEvent::count() > 0) {
            return;
        }

        $baselineEvents = [
            [
                'title' => 'Pre-Evaluation Alignment Meeting',
                'notes' => 'Review initial barangay submissions and verify compliance documents prior to technical assessment.',
                'event_date' => '2026-08-05',
            ],
            [
                'title' => 'Committee Final Review & Scoring Session',
                'notes' => 'Convene assessment committee to finalize scores and compile evaluation reports.',
                'event_date' => '2026-08-28',
            ],
        ];

        foreach ($baselineEvents as $eventData) {
            LtiaEvent::create($eventData);
        }
    }
}
