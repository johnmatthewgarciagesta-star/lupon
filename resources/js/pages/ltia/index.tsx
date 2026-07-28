import { Head, router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Save,
    RotateCcw,
    Sparkles,
    CalendarDays,
    Plus,
    Edit2,
    Trash2,
    ListTodo,
    ChevronLeft,
    ChevronRight,
    MousePointerClick,
    Tag,
    Eye,
    ArrowRight,
    Check
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SubmitApplicationDialog } from '@/components/ltia/submit-application-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface TimelineStep {
    id: number;
    step: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    formatted_start_date: string;
    formatted_end_date: string;
    progress: number;
    status: 'in_progress' | 'upcoming' | 'completed' | string;
    status_label: string;
}

interface CalendarEvent {
    id: number;
    title: string;
    notes: string;
    event_date: string;
    formatted_date: string;
    status: 'upcoming' | 'active' | 'overdue' | string;
    status_label: string;
    days_diff: number;
}

interface LTIAProps {
    deadline: {
        date: string;
        formatted_date: string;
        days_remaining: number;
        status_type: 'upcoming' | 'due_today' | 'overdue';
        status_label: string;
        sync_status: string;
    };
    timeline: TimelineStep[];
    events: CalendarEvent[];
}

export default function LTIAPage({ deadline, timeline, events }: LTIAProps) {
    // 1. Primary Bound Deadline Control State (Default: September 08, 2026)
    const [selectedDeadline, setSelectedDeadline] = useState(deadline.date || '2026-09-08');
    const [isUpdatingDeadline, setIsUpdatingDeadline] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // 2. Selection Context & Editor Panel State
    const [activeTab, setActiveTab] = useState<'phase' | 'event'>('phase');
    const [activePhaseId, setActivePhaseId] = useState<number>(timeline[0]?.id || 1);
    
    // Active Phase Reference
    const activePhase = useMemo(
        () => timeline.find((p) => p.id === activePhaseId) || timeline[0],
        [timeline, activePhaseId]
    );

    // Form Controls (100% Unlocked & Interactive Reactive State)
    const [phaseTitle, setPhaseTitle] = useState('');
    const [phaseDescription, setPhaseDescription] = useState('');
    const [phaseStartDate, setPhaseStartDate] = useState('');
    const [phaseEndDate, setPhaseEndDate] = useState('');
    const [phaseStatus, setPhaseStatus] = useState('upcoming');
    const [phaseProgress, setPhaseProgress] = useState(0);
    const [isSavingPhase, setIsSavingPhase] = useState(false);

    // Custom Event Form State
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [eventTitle, setEventTitle] = useState('');
    const [eventNotes, setEventNotes] = useState('');
    const [eventDate, setEventDate] = useState('2026-08-15');
    const [isSavingEvent, setIsSavingEvent] = useState(false);

    // Interactive Month Calendar Grid & Date Inspection State
    const [currentCalMonth, setCurrentCalMonth] = useState(new Date(2026, 7, 1)); // August 2026
    const [selectedCalDate, setSelectedCalDate] = useState('2026-08-15');

    const breadcrumbs = [
        {
            title: 'LTIA',
            href: '/ltia',
        },
    ];

    // Load active phase fields into editor state when selection changes
    useEffect(() => {
        if (activePhase) {
            setPhaseTitle(activePhase.title || '');
            setPhaseDescription(activePhase.description || '');
            setPhaseStartDate(activePhase.start_date || '');
            setPhaseEndDate(activePhase.end_date || '');
            setPhaseStatus(activePhase.status || 'upcoming');
            setPhaseProgress(activePhase.progress ?? 0);
        }
    }, [activePhase]);

    // Click Timeline Phase -> Load into Editor & Focus
    const selectPhaseForEditing = (step: TimelineStep) => {
        setActiveTab('phase');
        setActivePhaseId(step.id);
        setPhaseTitle(step.title);
        setPhaseDescription(step.description || '');
        setPhaseStartDate(step.start_date);
        setPhaseEndDate(step.end_date);
        setPhaseStatus(step.status);
        setPhaseProgress(step.progress);

        // Smooth scroll to Calendar Agenda & Notes Editor panel
        const element = document.getElementById('agenda-notes-panel');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Click Save -> Live Sync Back to Timeline & Inspection Panel
    const handleSavePhase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activePhase) return;

        setIsSavingPhase(true);
        setToastMessage(null);

        router.post(
            `/ltia/phases/${activePhase.id}`,
            {
                title: phaseTitle,
                description: phaseDescription,
                start_date: phaseStartDate,
                end_date: phaseEndDate,
                status: phaseStatus,
                progress: Number(phaseProgress),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSavingPhase(false);
                    setToastMessage(`Milestone Phase #${activePhase.step} "${phaseTitle}" updated & synchronized on Timeline!`);
                    setTimeout(() => setToastMessage(null), 4000);
                },
                onError: (errors) => {
                    setIsSavingPhase(false);
                    setToastMessage(Object.values(errors)[0] || 'Failed to update phase.');
                },
            }
        );
    };

    // Save Custom Event Agenda
    const handleSaveEvent = (e: React.FormEvent) => {
        e.preventDefault();

        setIsSavingEvent(true);
        setToastMessage(null);

        const url = editingEventId ? `/ltia/events/${editingEventId}` : '/ltia/events';

        router.post(
            url,
            {
                title: eventTitle,
                notes: eventNotes,
                event_date: eventDate,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSavingEvent(false);
                    setToastMessage(`Agenda Event "${eventTitle}" saved successfully.`);
                    setTimeout(() => setToastMessage(null), 4000);
                    setEditingEventId(null);
                    setEventTitle('');
                    setEventNotes('');
                },
                onError: (errors) => {
                    setIsSavingEvent(false);
                    setToastMessage(Object.values(errors)[0] || 'Failed to save event.');
                },
            }
        );
    };

    const handleEditEvent = (evt: CalendarEvent) => {
        setActiveTab('event');
        setEditingEventId(evt.id);
        setEventTitle(evt.title);
        setEventNotes(evt.notes || '');
        setEventDate(evt.event_date);

        const element = document.getElementById('agenda-notes-panel');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDeleteEvent = (evt: CalendarEvent) => {
        if (!confirm(`Delete agenda event "${evt.title}"?`)) return;

        router.delete(`/ltia/events/${evt.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setToastMessage(`Agenda event "${evt.title}" deleted.`);
                setTimeout(() => setToastMessage(null), 3000);
            },
        });
    };

    // Update Set Primary Bound Deadline
    const handleUpdateDeadline = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDeadline) return;

        setIsUpdatingDeadline(true);
        setToastMessage(null);

        router.post(
            '/ltia/deadline',
            { deadline_date: selectedDeadline },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsUpdatingDeadline(false);
                    setToastMessage('Primary bound deadline updated & dependent timeline dates recalculated!');
                    setTimeout(() => setToastMessage(null), 4000);
                },
                onError: (errors) => {
                    setIsUpdatingDeadline(false);
                    setToastMessage(errors.deadline_date || 'Failed to update deadline.');
                },
            }
        );
    };

    // Interactive Month Calendar Grid Days Calculation
    const calendarDays = useMemo(() => {
        const year = currentCalMonth.getFullYear();
        const month = currentCalMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startingDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days.push({
                day,
                dateStr,
                isToday: dateStr === new Date().toISOString().split('T')[0],
                isDeadline: dateStr === deadline.date,
                hasEvent: events.some((e) => e.event_date === dateStr),
                hasPhase: timeline.some((p) => dateStr >= p.start_date && dateStr <= p.end_date),
            });
        }
        return days;
    }, [currentCalMonth, deadline.date, events, timeline]);

    // Calculate Active Items Spanning Selected Date for Bottom Inspection Panel
    const inspectedItems = useMemo(() => {
        const targetDate = selectedCalDate;

        const matchingEvents = events.filter((e) => e.event_date === targetDate);
        const matchingPhases = timeline.filter((p) => targetDate >= p.start_date && targetDate <= p.end_date);
        const isTargetDeadline = targetDate === deadline.date;

        return {
            date: targetDate,
            formattedDate: new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
            events: matchingEvents,
            phases: matchingPhases,
            isDeadline: isTargetDeadline,
        };
    }, [selectedCalDate, events, timeline, deadline.date]);

    const prevMonth = () => {
        setCurrentCalMonth(new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentCalMonth(new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() + 1, 1));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="LTIA Calendar & Synchronized Timeline" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Lupong Tagapamayapa Incentives Awards (LTIA)</h2>
                        <p className="text-muted-foreground text-sm">
                            Calendar Agenda & Notes Editor & Synchronized Application Timeline
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <SubmitApplicationDialog />
                    </div>
                </div>

                {/* Deadline Alert Banner (Notification Style UI) */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm ${
                    deadline.status_type === 'overdue'
                        ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300'
                        : deadline.status_type === 'due_today'
                        ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${
                            deadline.status_type === 'overdue'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                                : deadline.status_type === 'due_today'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                        }`}>
                            {deadline.status_type === 'overdue' ? (
                                <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
                            ) : deadline.status_type === 'due_today' ? (
                                <Clock className="h-6 w-6 stroke-[2.5]" />
                            ) : (
                                <CalendarIcon className="h-6 w-6 stroke-[2.5]" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">
                                    {deadline.status_type === 'overdue'
                                        ? 'Submission Deadline Overdue'
                                        : deadline.status_type === 'due_today'
                                        ? 'Submission Deadline Due Today'
                                        : 'Primary Bound Deadline'}
                                </h3>
                                <Badge variant="outline" className={`font-medium ${
                                    deadline.status_type === 'overdue'
                                        ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                        : deadline.status_type === 'due_today'
                                        ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                                        : 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                }`}>
                                    {deadline.status_label}
                                </Badge>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]">
                                    {deadline.sync_status}
                                </Badge>
                            </div>
                            <p className="text-xs opacity-80 mt-0.5">
                                Primary Bound Deadline: <span className="font-bold">{deadline.formatted_date}</span>
                            </p>
                        </div>
                    </div>

                    <div className="text-right sm:text-right w-full sm:w-auto">
                        <div className="text-3xl font-extrabold tracking-tight">
                            {deadline.days_remaining > 0
                                ? `${deadline.days_remaining} Days`
                                : deadline.days_remaining === 0
                                ? 'Today'
                                : `${Math.abs(deadline.days_remaining)} Days Late`}
                        </div>
                        <p className="text-[11px] opacity-75">Remaining System Window</p>
                    </div>
                </div>

                {/* Feedback Toast Banner */}
                {toastMessage && (
                    <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-sm flex items-center justify-between dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span>{toastMessage}</span>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left Column: Interactive Calendar Grid, Set Primary Bound Deadline, and Date Inspection Panel */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* 100% Unlocked Set Primary Bound Deadline Control Card */}
                        <Card className="border-amber-300/80 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-[#dd8b11]" />
                                        Set Primary Bound Deadline
                                    </CardTitle>
                                    <Badge variant="secondary" className="bg-[#dd8b11]/10 text-[#dd8b11] text-[10px]">
                                        Interactive Selector
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    Interactive date selector to update system target deadline (Default: September 08, 2026). Automatically recalculates timeline phases.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateDeadline} className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="primary_deadline_picker" className="text-xs font-semibold">
                                            Set Primary Bound Deadline
                                        </Label>
                                        <Input
                                            id="primary_deadline_picker"
                                            type="date"
                                            value={selectedDeadline}
                                            onChange={(e) => setSelectedDeadline(e.target.value)}
                                            className="w-full h-10 font-bold text-sm bg-white dark:bg-slate-900"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <Button
                                            type="submit"
                                            disabled={isUpdatingDeadline}
                                            className="flex-1 bg-[#1c2434] hover:bg-[#2c3a4f] text-white h-9 text-xs font-semibold"
                                        >
                                            <Save className="mr-1.5 h-3.5 w-3.5" />
                                            {isUpdatingDeadline ? 'Recalculating...' : 'Set Primary Bound Deadline'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setSelectedDeadline('2026-09-08')}
                                            disabled={isUpdatingDeadline}
                                            className="h-9 px-2 text-xs"
                                            title="Reset to default Sept 08, 2026"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Interactive Visual Month Calendar Grid */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5 text-[#dd8b11]" />
                                        <CardTitle className="text-base font-semibold">
                                            {currentCalMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
                                    <span>Sun</span>
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((item, idx) => {
                                        if (!item) {
                                            return <div key={`pad-${idx}`} className="h-9 rounded-md bg-slate-50/30 dark:bg-slate-900/30" />;
                                        }

                                        const isSelected = selectedCalDate === item.dateStr;

                                        return (
                                            <button
                                                key={item.dateStr}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCalDate(item.dateStr);
                                                    setEventDate(item.dateStr);
                                                }}
                                                className={`h-9 rounded-md flex flex-col items-center justify-center text-xs font-medium relative transition-all ${
                                                    isSelected
                                                        ? 'bg-[#1c2434] text-white shadow-sm ring-2 ring-[#dd8b11]'
                                                        : item.isDeadline
                                                        ? 'bg-red-100 text-red-900 border border-red-300 font-bold dark:bg-red-900/50 dark:text-red-200'
                                                        : item.isToday
                                                        ? 'bg-blue-100 text-blue-800 font-bold dark:bg-blue-900/40 dark:text-blue-300'
                                                        : item.hasPhase
                                                        ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
                                                        : 'hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <span>{item.day}</span>
                                                {item.hasEvent && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#dd8b11] absolute bottom-1" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-3 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-600" />
                                        <span>Bound Deadline</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#dd8b11]" />
                                        <span>Agenda Event</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <span>Active Milestone</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interactive Date-Click Inspection Panel (Bottom Detail View Directly Beneath Calendar Grid) */}
                        <Card className="shadow-md border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-[#dd8b11]" />
                                        <CardTitle className="text-sm font-bold">
                                            Event Details for {inspectedItems.formattedDate}
                                        </CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-950 font-semibold">
                                        Selected Date
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {inspectedItems.isDeadline && (
                                    <div className="p-3 rounded-lg border bg-red-100/70 border-red-300 dark:bg-red-950/40 dark:border-red-900 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                                                <CalendarIcon className="h-4 w-4 text-red-600" />
                                                Primary System Bound Deadline
                                            </span>
                                            <Badge variant="secondary" className="bg-red-500 text-white text-[9px]">
                                                Target Deadline
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-red-800 dark:text-red-300">
                                            Official LTIA Application Submission Deadline: {deadline.formatted_date}
                                        </p>
                                    </div>
                                )}

                                {inspectedItems.phases.map((phase) => (
                                    <div
                                        key={`inspect-phase-${phase.id}`}
                                        className="p-3 rounded-lg border bg-white dark:bg-slate-900 shadow-sm space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <Badge className="bg-[#1c2434] text-white text-[9px]">
                                                        Phase #{phase.step}
                                                    </Badge>
                                                    <h5 className="text-xs font-bold">{phase.title}</h5>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                                                    📅 {phase.formatted_start_date} – {phase.formatted_end_date}
                                                </p>
                                            </div>
                                            <Badge variant="secondary" className="text-[9px]">
                                                {phase.status_label}
                                            </Badge>
                                        </div>
                                        {phase.description && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded leading-relaxed">
                                                {phase.description}
                                            </p>
                                        )}
                                        <div className="pt-1 flex justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs font-semibold text-[#dd8b11] border-[#dd8b11]/40 hover:bg-amber-50"
                                                onClick={() => selectPhaseForEditing(phase)}
                                            >
                                                Edit in Agenda Editor <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {inspectedItems.events.map((evt) => (
                                    <div
                                        key={`inspect-evt-${evt.id}`}
                                        className="p-3 rounded-lg border bg-white dark:bg-slate-900 shadow-sm space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                    {evt.title}
                                                </h5>
                                                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                                    📅 {evt.formatted_date}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700">
                                                {evt.status_label}
                                            </Badge>
                                        </div>
                                        {evt.notes && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded leading-relaxed">
                                                {evt.notes}
                                            </p>
                                        )}
                                        <div className="pt-1 flex justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={() => handleEditEvent(evt)}
                                            >
                                                Edit in Agenda Editor <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {!inspectedItems.isDeadline && inspectedItems.phases.length === 0 && inspectedItems.events.length === 0 && (
                                    <div className="text-center py-5 space-y-2">
                                        <p className="text-xs text-muted-foreground italic">
                                            No scheduled events or active milestone phases on this date.
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs font-semibold text-[#1c2434] border-slate-300"
                                            onClick={() => {
                                                setActiveTab('event');
                                                setEditingEventId(null);
                                                setEventTitle('');
                                                setEventNotes('');
                                                setEventDate(selectedCalDate);
                                                const el = document.getElementById('agenda-notes-panel');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Agenda Event for this Date
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle & Right Column: Synchronized Timeline & Calendar Agenda & Notes Editor */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Synchronized Application Timeline */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                            Synchronized Application Timeline
                                        </CardTitle>
                                        <CardDescription className="text-xs mt-0.5">
                                            Click any milestone card to load & edit it directly in the Calendar Agenda & Notes Editor
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-semibold">
                                        Live Synchronized
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {timeline.map((step) => {
                                        const isStepCompleted = step.status === 'completed';
                                        const isStepCurrent = step.status === 'in_progress';
                                        const isSelected = activePhaseId === step.id && activeTab === 'phase';

                                        return (
                                            <div
                                                key={step.id}
                                                onClick={() => selectPhaseForEditing(step)}
                                                className={`flex gap-4 group rounded-xl p-3.5 border cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'bg-amber-50/70 border-[#dd8b11] shadow-md ring-2 ring-[#dd8b11]/40 dark:bg-amber-950/20 dark:border-[#dd8b11]'
                                                        : 'hover:border-[#dd8b11]/70 hover:bg-slate-50/80 dark:hover:bg-slate-900/80'
                                                }`}
                                            >
                                                {/* Step Badge */}
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                                            isStepCompleted
                                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                                : isStepCurrent
                                                                ? 'bg-[#1c2434] text-white ring-4 ring-slate-100 dark:ring-slate-800'
                                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}
                                                    >
                                                        {isStepCompleted ? '✓' : step.step}
                                                    </div>
                                                    {step.step < timeline.length && (
                                                        <div className={`h-full w-0.5 my-1.5 transition-colors ${
                                                            isStepCompleted
                                                                ? 'bg-emerald-500'
                                                                : 'bg-slate-200 dark:bg-slate-800'
                                                        }`} />
                                                    )}
                                                </div>

                                                {/* Milestone Details */}
                                                <div className="flex-1 pb-1">
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                                {step.title}
                                                            </h4>
                                                            <span className="text-[10px] text-[#dd8b11] font-semibold flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                                                                <MousePointerClick className="h-3 w-3" /> Click to Edit in Editor
                                                            </span>
                                                        </div>
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-[10px] font-semibold ${
                                                                isStepCompleted
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                    : isStepCurrent
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                            }`}
                                                        >
                                                            {step.status_label}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                        {step.description}
                                                    </p>

                                                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                                        <span>
                                                            {step.step === 4
                                                                ? `Target Deadline: ${step.formatted_end_date}`
                                                                : `${step.formatted_start_date} – ${step.formatted_end_date}`}
                                                        </span>
                                                        <span>{step.progress}% Complete</span>
                                                    </div>

                                                    <Progress
                                                        value={step.progress}
                                                        className={`h-2 mt-1.5 rounded-full ${
                                                            isStepCompleted
                                                                ? '[&>div]:bg-emerald-600'
                                                                : isStepCurrent
                                                                ? '[&>div]:bg-[#1c2434]'
                                                                : '[&>div]:bg-slate-300 dark:[&>div]:bg-slate-700'
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Calendar Agenda & Notes Editor (100% Unlocked Form Controls) */}
                        <div id="agenda-notes-panel" className="scroll-mt-6">
                            <Card className="shadow-md border-amber-300/80 dark:border-slate-800">
                                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                <ListTodo className="h-5 w-5 text-[#dd8b11]" />
                                                Calendar Agenda & Notes Editor
                                            </CardTitle>
                                            <CardDescription className="text-xs mt-0.5">
                                                Synchronized editor for milestone phases and custom agenda events
                                            </CardDescription>
                                        </div>

                                        {/* Editor Mode Switcher */}
                                        <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('phase')}
                                                className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                                                    activeTab === 'phase'
                                                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                                                        : 'text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                Edit Milestone Phase
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveTab('event');
                                                    setEditingEventId(null);
                                                    setEventTitle('');
                                                    setEventNotes('');
                                                }}
                                                className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                                                    activeTab === 'event'
                                                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                                                        : 'text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                + Custom Agenda
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-5">
                                    {/* Selection Context Indicator Banner */}
                                    <div className="mb-4 p-2.5 rounded-lg border bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200 flex items-center gap-2 text-xs font-medium">
                                        <Tag className="h-4 w-4 text-[#dd8b11]" />
                                        <span>
                                            <strong className="font-bold">Selection Context:</strong>{' '}
                                            {activeTab === 'phase'
                                                ? `Editing Timeline Milestone Phase #${activePhase?.step}: "${activePhase?.title}"`
                                                : editingEventId
                                                ? `Editing Custom Agenda Event: "${eventTitle}"`
                                                : 'Creating New Custom Agenda Event'}
                                        </span>
                                    </div>

                                    {/* Mode 1: Edit Milestone Phase Form (100% Editable & Interactive) */}
                                    {activeTab === 'phase' && (
                                        <form onSubmit={handleSavePhase} className="space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-[#1c2434] text-white">
                                                        Phase #{activePhase?.step}
                                                    </Badge>
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                        Select Phase Context:
                                                    </span>
                                                </div>
                                                <Select
                                                    value={String(activePhaseId)}
                                                    onValueChange={(val) => {
                                                        const target = timeline.find((p) => p.id === Number(val));
                                                        if (target) selectPhaseForEditing(target);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[240px] h-8 text-xs font-semibold bg-white dark:bg-slate-900">
                                                        <SelectValue placeholder="Select phase to edit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {timeline.map((p) => (
                                                            <SelectItem key={p.id} value={String(p.id)}>
                                                                Phase #{p.step}: {p.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="agenda_phase_title" className="text-xs font-semibold">
                                                    LTIA Agenda / Phase Title
                                                </Label>
                                                <Input
                                                    id="agenda_phase_title"
                                                    value={phaseTitle}
                                                    onChange={(e) => setPhaseTitle(e.target.value)}
                                                    className="font-semibold bg-white dark:bg-slate-900"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="agenda_start_date" className="text-xs font-semibold">
                                                        Start Date
                                                    </Label>
                                                    <Input
                                                        id="agenda_start_date"
                                                        type="date"
                                                        value={phaseStartDate}
                                                        onChange={(e) => setPhaseStartDate(e.target.value)}
                                                        className="bg-white dark:bg-slate-900"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="agenda_end_date" className="text-xs font-semibold">
                                                        End Date / Target Deadline
                                                    </Label>
                                                    <Input
                                                        id="agenda_end_date"
                                                        type="date"
                                                        value={phaseEndDate}
                                                        onChange={(e) => setPhaseEndDate(e.target.value)}
                                                        className="bg-white dark:bg-slate-900"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="agenda_notes" className="text-xs font-semibold">
                                                    Event Notes / Scope Description
                                                </Label>
                                                <Textarea
                                                    id="agenda_notes"
                                                    value={phaseDescription}
                                                    onChange={(e) => setPhaseDescription(e.target.value)}
                                                    rows={3}
                                                    className="bg-white dark:bg-slate-900 leading-relaxed"
                                                    placeholder="Specify scope, administrative guidelines, entry requirements, or meeting notes..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="agenda_status" className="text-xs font-semibold">
                                                        Milestone Status
                                                    </Label>
                                                    <Select
                                                        value={phaseStatus}
                                                        onValueChange={setPhaseStatus}
                                                    >
                                                        <SelectTrigger id="agenda_status" className="bg-white dark:bg-slate-900">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="agenda_progress" className="text-xs font-semibold">
                                                        Progress Percentage ({phaseProgress}%)
                                                    </Label>
                                                    <div className="flex items-center gap-3">
                                                        <Input
                                                            id="agenda_progress"
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            value={phaseProgress}
                                                            onChange={(e) => setPhaseProgress(Number(e.target.value))}
                                                            className="w-24 bg-white dark:bg-slate-900"
                                                            required
                                                        />
                                                        <input
                                                            type="range"
                                                            min={0}
                                                            max={100}
                                                            value={phaseProgress}
                                                            onChange={(e) => setPhaseProgress(Number(e.target.value))}
                                                            className="flex-1 accent-[#dd8b11]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={isSavingPhase}
                                                    className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white px-6 font-bold text-xs h-10 shadow-sm"
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    {isSavingPhase ? 'Saving Changes...' : 'Save Changes'}
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Mode 2: Custom Agenda Event Form (100% Editable & Interactive) */}
                                    {activeTab === 'event' && (
                                        <form onSubmit={handleSaveEvent} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="evt_title" className="text-xs font-semibold">
                                                    LTIA Agenda / Event Title
                                                </Label>
                                                <Input
                                                    id="evt_title"
                                                    placeholder="e.g. Pre-Evaluation Alignment Meeting"
                                                    value={eventTitle}
                                                    onChange={(e) => setEventTitle(e.target.value)}
                                                    className="bg-white dark:bg-slate-900 font-semibold"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="evt_date" className="text-xs font-semibold">
                                                    Event Date
                                                </Label>
                                                <Input
                                                    id="evt_date"
                                                    type="date"
                                                    value={eventDate}
                                                    onChange={(e) => setEventDate(e.target.value)}
                                                    className="bg-white dark:bg-slate-900"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="evt_notes" className="text-xs font-semibold">
                                                    Event Notes / Guidelines
                                                </Label>
                                                <Textarea
                                                    id="evt_notes"
                                                    placeholder="Add meeting guidelines, administrative remarks, or action items..."
                                                    value={eventNotes}
                                                    onChange={(e) => setEventNotes(e.target.value)}
                                                    className="bg-white dark:bg-slate-900 leading-relaxed"
                                                    rows={4}
                                                />
                                            </div>

                                            <div className="pt-2 flex justify-end gap-2">
                                                {editingEventId && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingEventId(null);
                                                            setEventTitle('');
                                                            setEventNotes('');
                                                        }}
                                                    >
                                                        Cancel Edit
                                                    </Button>
                                                )}
                                                <Button
                                                    type="submit"
                                                    disabled={isSavingEvent}
                                                    className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white px-6 font-bold text-xs h-10 shadow-sm"
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    {isSavingEvent ? 'Saving Changes...' : 'Save Changes'}
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Existing Agenda Events List */}
                                    <div className="mt-8 pt-6 border-t space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                            <span>Scheduled Agenda Events ({events.length})</span>
                                        </h4>
                                        {events.length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">No custom agenda events added yet.</p>
                                        ) : (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {events.map((evt) => (
                                                    <div
                                                        key={evt.id}
                                                        className="p-3 rounded-lg border bg-white dark:bg-slate-900 flex flex-col justify-between gap-2 shadow-sm"
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h5 className="text-xs font-bold">{evt.title}</h5>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-[9px] font-semibold ${
                                                                        evt.status === 'overdue'
                                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                                            : evt.status === 'active'
                                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                                                    }`}
                                                                >
                                                                    {evt.status_label}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                                📅 {evt.formatted_date}
                                                            </p>
                                                            {evt.notes && (
                                                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800 p-2 rounded leading-relaxed">
                                                                    {evt.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-end gap-1 pt-1 border-t">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-slate-600"
                                                                onClick={() => handleEditEvent(evt)}
                                                            >
                                                                <Edit2 className="h-3 w-3 mr-1" /> Edit
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDeleteEvent(evt)}
                                                            >
                                                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
