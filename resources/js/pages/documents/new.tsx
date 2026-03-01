import { Head, Link, useForm } from '@inertiajs/react';
import {
    Upload, FileText, Plus, Trash2, GripVertical,
    Type, AlignLeft, CheckSquare, FileCheck, AlertCircle, Sparkles, RotateCcw,
    ChevronUp, ChevronDown, ArrowUpDown, CalendarDays
} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

// Set worker path from CDN for easiest integration in Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type FieldType = 'text' | 'textarea' | 'checkbox' | 'date';

interface FormField {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    required: boolean;
}

interface DocumentData {
    id: number;
    title: string;
    description: string;
    fields: FormField[];
    file_path: string | null;
}

export default function NewDocument({ existingTemplate }: { existingTemplate?: DocumentData }) {
    const isEdit = !!existingTemplate;

    const breadcrumbs = [
        { title: 'Documents', href: '/documents' },
        { title: isEdit ? 'Edit Template' : 'New Document', href: isEdit ? `/documents/edit-template/${existingTemplate.id}` : '/documents/new' },
    ];

    // ── PDF upload state ──────────────────────────────────────────────────────
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // ── Form builder state ────────────────────────────────────────────────────
    const [fields, setFields] = useState<FormField[]>(existingTemplate?.fields || []);
    const [quickAddLabel, setQuickAddLabel] = useState('');

    // ── Drag-and-drop reorder state ──────────────────────────────────────────
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // ── Inertia form ──────────────────────────────────────────────────────────
    const { data, setData, post, processing, errors } = useForm<{
        pdf: File | null;
        title: string;
        description: string;
        fields: string;
    }>({
        pdf: null,
        title: existingTemplate?.title || '',
        description: existingTemplate?.description || '',
        fields: JSON.stringify(existingTemplate?.fields || []),
    });

    // ── Helpers ───────────────────────────────────────────────────────────────
    const generateId = () => {
        try {
            return crypto.randomUUID();
        } catch {
            return 'field_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        }
    };

    const syncFields = (updated: FormField[]) => {
        setFields(updated);
        setData('fields', JSON.stringify(updated));
    };

    const addField = (type: FieldType) => {
        syncFields([...fields, {
            id: generateId(),
            type,
            label: type === 'text' ? 'Short Answer' : type === 'textarea' ? 'Paragraph' : type === 'date' ? 'Date' : 'Checkbox Option',
            required: false,
        }]);
    };

    const handleQuickAdd = () => {
        const val = quickAddLabel.trim();
        if (val) {
            syncFields([...fields, { id: generateId(), type: 'text', label: val, required: true }]);
            setQuickAddLabel('');
        } else {
            addField('text');
        }
    };

    const removeField = (id: string) => syncFields(fields.filter(f => f.id !== id));

    const moveField = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= fields.length) return;
        const updated = [...fields];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        syncFields(updated);
    };

    const handleDragStart = (index: number) => (e: React.DragEvent) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
        // Make the drag image slightly transparent
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleDragOver = (index: number) => (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
        e.preventDefault();
        const fromIndex = Number(e.dataTransfer.getData('text/plain'));
        if (!isNaN(fromIndex) && fromIndex !== toIndex) {
            moveField(fromIndex, toIndex);
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const updateLabel = (id: string, label: string) =>
        syncFields(fields.map(f => f.id === id ? { ...f, label } : f));

    const updatePlaceholder = (id: string, placeholder: string) =>
        syncFields(fields.map(f => f.id === id ? { ...f, placeholder } : f));

    const toggleRequired = (id: string) =>
        syncFields(fields.map(f => f.id === id ? { ...f, required: !f.required } : f));

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file?.type === 'application/pdf') setData('pdf', file);
    };

    const [isScanning, setIsScanning] = useState(false);

    const autofillCommonFields = async () => {
        if (!data.pdf) return;

        setIsScanning(true);
        try {
            const arrayBuffer = await data.pdf.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

            let detectedText = "";
            const numPages = Math.min(pdf.numPages, 2);
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                detectedText += textContent.items.map((item: any) => item.str).join(" ") + " ";
            }

            const coreFields: FormField[] = [
                { id: 'case_no', type: 'text', label: 'Case Number', required: true },
                { id: 'complainant', type: 'text', label: 'Complainant Name', required: true },
                { id: 'respondent', type: 'text', label: 'Respondent Name', required: true },
                { id: 'made_this_day', type: 'text', label: 'Day', required: true },
                { id: 'made_this_month', type: 'text', label: 'Month', required: true },
                { id: 'made_this_year', type: 'text', label: 'Year', required: true },
            ];

            const newFields: FormField[] = [];
            const addedLabels = new Set(fields.map(f => f.label.toLowerCase()));

            const checkAndAdd = (label: string, id: string, type: FieldType = 'text') => {
                if (!addedLabels.has(label.toLowerCase())) {
                    newFields.push({ id, type, label, required: true });
                    addedLabels.add(label.toLowerCase());
                }
            };

            coreFields.forEach(cf => checkAndAdd(cf.label, cf.id, cf.type));

            if (detectedText.match(/Nature of/i) || detectedText.match(/For:/i)) checkAndAdd('Nature of Case', 'For');
            if (detectedText.match(/Hearing/i)) checkAndAdd('Hearing Date/Time', 'hearing_info');

            const fieldPatterns = [
                /([A-Z][a-zA-Z\s]{2,25})(?::|\.|\s)\s*(?:_{2,}|\.{3,})/g,
                /([A-Z][A-Z\s]{2,20})(?::)\s*/g,
                /([A-Z][a-z\s]{2,20})(?::)\s+/g
            ];

            const ignoredWords = ['The', 'This', 'Republic', 'Philippines', 'Office', 'Barangay', 'Province', 'City', 'Region', 'Lupon', 'Pangkat', 'Form'];

            for (const pattern of fieldPatterns) {
                let match;
                while ((match = pattern.exec(detectedText)) !== null) {
                    const label = match[1].trim();
                    if (label.length > 2 &&
                        !/^\d+$/.test(label) &&
                        !ignoredWords.some(w => label.toLowerCase() === w.toLowerCase())
                    ) {
                        checkAndAdd(label, label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
                    }
                    if (newFields.length > 18) break;
                }
            }

            if (detectedText.match(/Signature/i) && !addedLabels.has('signature')) checkAndAdd('Signature Line', 'signature');
            if (detectedText.match(/Witness/i)) checkAndAdd('Witness Name', 'witness');

            syncFields([...fields, ...newFields]);
        } catch (error) {
            console.error("PDF Scan Error:", error);
            const fallback: FormField[] = [
                { id: 'case_no', type: 'text', label: 'Case Number', required: true },
                { id: 'complainant', type: 'text', label: 'Complainant Name', required: true },
                { id: 'respondent', type: 'text', label: 'Respondent Name', required: true },
                { id: 'made_this_day', type: 'text', label: 'Day', required: true },
                { id: 'made_this_month', type: 'text', label: 'Month', required: true },
                { id: 'made_this_year', type: 'text', label: 'Year', required: true },
            ];
            const existingLabels = new Set(fields.map(f => f.label.toLowerCase()));
            const toAdd = fallback.filter(f => !existingLabels.has(f.label.toLowerCase()));
            syncFields([...fields, ...toAdd]);
        } finally {
            setIsScanning(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // If it's a standard template (id: 0), we treat it as a new creation
        if (isEdit && existingTemplate.id > 0) {
            post(`/documents/update-custom/${existingTemplate.id}`, { forceFormData: true });
        } else {
            post('/documents/store-custom', { forceFormData: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? `Edit Questions: ${existingTemplate.title}` : "Create Custom Template"} />

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-20 p-4">

                {/* ── Header ── */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Template Questions' : 'Create Custom Template'}</h1>
                    <p className="text-sm text-muted-foreground">{isEdit ? 'Modify the questions for this document.' : 'Upload a PDF and define the questions for your answer sheet.'}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">

                    {/* ── Left Column: Config ── */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="shadow-sm border-border">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Template Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Document Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="e.g. Barangay Clearance"
                                        className="w-full text-sm rounded-lg border-slate-200 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                    {errors.title && <p className="text-[10px] text-red-500">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Brief purpose of this document…"
                                        rows={3}
                                        className="w-full text-sm rounded-lg border-slate-200 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-slate-400" />
                                    Background PDF
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleFileDrop}
                                    className={`
                                        relative group cursor-pointer border-2 border-dashed rounded-xl p-6 transition-all duration-200
                                        flex flex-col items-center justify-center gap-3
                                        ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                                        ${data.pdf ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
                                    `}
                                >
                                    <input
                                        type="file"
                                        ref={fileRef}
                                        onChange={e => e.target.files && setData('pdf', e.target.files[0])}
                                        accept=".pdf"
                                        className="hidden"
                                    />

                                    {data.pdf ? (
                                        <>
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                                <FileCheck className="h-7 w-7 text-green-600" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-sm text-green-700 max-w-[200px] truncate">{data.pdf.name}</p>
                                                <p className="text-xs text-green-600/70 mt-1">Ready to upload</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setData('pdf', null); }}
                                                className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Upload className="h-7 w-7 text-slate-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium">Upload Background PDF</p>
                                                <p className="text-xs text-muted-foreground">PDF only, max 20MB</p>
                                                {isEdit && existingTemplate.file_path && (
                                                    <div className="mt-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1.5 font-medium">
                                                        <FileCheck className="h-3 w-3" />
                                                        Has background. Upload new to replace.
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {data.pdf && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-4 h-10 border-dashed border-primary text-primary hover:bg-primary/5"
                                        onClick={autofillCommonFields}
                                        disabled={isScanning}
                                    >
                                        {isScanning ? (
                                            <>Scanning Document...</>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                AI Smart Autofill Questions
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Right Column: Builder ── */}
                    <div className="lg:col-span-7 space-y-4">
                        <Card className="shadow-sm border-t-4 border-t-primary border-border">
                            <CardHeader className="pb-3 border-b bg-muted/40">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Build Answer Sheet
                                    </CardTitle>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-tight">
                                        {fields.length} Answer Fields
                                    </span>
                                </div>
                                <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                                        <strong>Instructions:</strong> Fill in all required fields below. Your answers will be printed directly onto the official form. Fields marked with <span className="text-red-500 font-bold">*</span> are required.
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">

                                {/* Quick-Add */}
                                <div className="space-y-4">
                                    <div className="flex gap-2 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                        <div className="relative flex-1">
                                            <input
                                                id="quick-add-label"
                                                type="text"
                                                value={quickAddLabel}
                                                onChange={(e) => setQuickAddLabel(e.target.value)}
                                                placeholder="Quick add: Type label..."
                                                className="w-full h-10 pl-3 pr-4 text-sm rounded-lg border-border bg-background focus:ring-primary/20 focus:border-primary transition-all"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleQuickAdd();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-10 bg-primary px-4 shadow-sm"
                                            onClick={handleQuickAdd}
                                        >
                                            <Plus className="h-4 w-4 mr-1.5" />
                                            Add Question
                                        </Button>
                                    </div>

                                    {fields.length === 0 && (
                                        <div className="p-4 rounded-xl border border-border bg-muted/20">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3 tracking-wider">Suggested Templates</p>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const noticeFields: FormField[] = [
                                                            { id: 'complainant', type: 'text', label: 'Complainant (Full Name)', placeholder: 'Full legal name of the complainant', required: true },
                                                            { id: 'respondent', type: 'text', label: 'Respondent / Addressee', placeholder: 'Full legal name of the respondent', required: true },
                                                            { id: 'case_no', type: 'text', label: 'Case Number', placeholder: 'e.g. 2024-001', required: true },
                                                            { id: 'hearing_date', type: 'text', label: 'Hearing Date & Time', placeholder: 'e.g. February 28, 2026 at 9:00 AM', required: true },
                                                            { id: 'place', type: 'text', label: 'Place (City/Municipality)', required: true },
                                                            { id: 'province', type: 'text', label: 'Province', required: true }
                                                        ];
                                                        syncFields(noticeFields);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs font-bold hover:bg-secondary/70 transition-colors shadow-sm"
                                                >
                                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                                    Load "Notice Execution" Fields
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Fields List */}
                                <div className="space-y-3">
                                    {fields.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                                            <AlertCircle className="h-10 w-10 mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No fields added yet</p>
                                        </div>
                                    )}

                                    {fields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            draggable
                                            onDragStart={handleDragStart(index)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={handleDragOver(index)}
                                            onDrop={handleDrop(index)}
                                            className={`group relative flex flex-col gap-3 p-4 rounded-xl border bg-card shadow-sm transition-all ${dragIndex === index
                                                ? 'opacity-50 border-primary/50 scale-[0.98]'
                                                : dragOverIndex === index && dragIndex !== null && dragIndex !== index
                                                    ? 'border-primary border-2 shadow-lg ring-2 ring-primary/20'
                                                    : 'border-border hover:border-primary/30 hover:shadow-md'
                                                }`}
                                        >
                                            {/* Drop indicator line */}
                                            {dragOverIndex === index && dragIndex !== null && dragIndex !== index && (
                                                <div className="absolute -top-1 left-4 right-4 h-0.5 bg-primary rounded-full" />
                                            )}

                                            <div className="flex items-start gap-3">
                                                {/* Drag handle + move buttons */}
                                                <div className="flex flex-col items-center gap-0.5 mt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveField(index, index - 1)}
                                                        disabled={index === 0}
                                                        className={`p-0.5 rounded transition-colors ${index === 0
                                                            ? 'text-slate-200 cursor-not-allowed'
                                                            : 'text-slate-400 hover:text-primary hover:bg-primary/10'
                                                            }`}
                                                        title="Move up"
                                                    >
                                                        <ChevronUp className="h-3.5 w-3.5" />
                                                    </button>
                                                    <div
                                                        className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-primary p-0.5 rounded transition-colors"
                                                        title="Drag to reorder"
                                                    >
                                                        <GripVertical className="h-4 w-4" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveField(index, index + 1)}
                                                        disabled={index === fields.length - 1}
                                                        className={`p-0.5 rounded transition-colors ${index === fields.length - 1
                                                            ? 'text-slate-200 cursor-not-allowed'
                                                            : 'text-slate-400 hover:text-primary hover:bg-primary/10'
                                                            }`}
                                                        title="Move down"
                                                    >
                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <FileText className="h-3 w-3 text-primary" />
                                                                <span className="text-[10px] font-extrabold uppercase text-foreground/70">Question Title (Label)</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-muted-foreground/30">#{index + 1}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center bg-muted/30 p-1 rounded-lg border border-border/50">
                                                            <div className="p-1 px-2 rounded bg-background border border-border text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 shadow-sm">
                                                                {field.type === 'text' && <Type className="h-2.5 w-2.5" />}
                                                                {field.type === 'textarea' && <AlignLeft className="h-2.5 w-2.5" />}
                                                                {field.type === 'checkbox' && <CheckSquare className="h-2.5 w-2.5" />}
                                                                {field.type === 'date' && <CalendarDays className="h-2.5 w-2.5" />}
                                                                {field.type}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={field.label}
                                                                onChange={e => updateLabel(field.id, e.target.value)}
                                                                className="flex-1 text-sm font-bold border-transparent focus:ring-0 bg-transparent p-1 px-2 rounded-lg"
                                                                placeholder="e.g. Complainant (Full Name)"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <AlignLeft className="h-3 w-3 text-primary/60" />
                                                            <span className="text-[10px] font-bold uppercase text-foreground/60">Question Description (Hint)</span>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={field.placeholder || ''}
                                                            onChange={e => updatePlaceholder(field.id, e.target.value)}
                                                            className="w-full text-xs font-medium text-foreground border border-border bg-secondary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 p-2 rounded-lg transition-all"
                                                            placeholder="e.g. Full legal name of the person filing the complaint..."
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                                        <div className="flex gap-1.5">
                                                            {(['text', 'textarea', 'checkbox', 'date'] as FieldType[]).map(t => (
                                                                <button
                                                                    key={t}
                                                                    type="button"
                                                                    onClick={() => syncFields(fields.map(f => f.id === field.id ? { ...f, type: t } : f))}
                                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${field.type === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/70'}`}
                                                                >
                                                                    {t}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold uppercase text-slate-400">Required</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleRequired(field.id)}
                                                                className={`relative w-8 h-4 rounded-full transition-all ${field.required ? 'bg-emerald-500' : 'bg-muted'}`}
                                                            >
                                                                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${field.required ? 'left-4.5' : 'left-0.5'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeField(field.id)}
                                                    className="p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 flex-wrap pt-2">
                                    {[
                                        { type: 'text' as FieldType, label: 'Short Answer', Icon: Type },
                                        { type: 'textarea' as FieldType, label: 'Paragraph', Icon: AlignLeft },
                                        { type: 'checkbox' as FieldType, label: 'Checkbox', Icon: CheckSquare },
                                        { type: 'date' as FieldType, label: 'Date Picker', Icon: CalendarDays },
                                    ].map(({ type, label, Icon }) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => addField(type)}
                                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border border-dashed border-border bg-secondary/50 text-muted-foreground hover:border-primary hover:text-primary transition-all"
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                            </CardContent>
                        </Card>

                        {/* Bottom Bar */}
                        <div className="flex items-center justify-end gap-3 pt-8 pb-10 border-t border-border mt-8">
                            <Link href="/documents">
                                <Button variant="secondary" type="button" className="h-11 px-8 font-bold">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing || !data.title.trim()}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-10 font-bold shadow-md shadow-primary/10 transition-all active:scale-[0.98]"
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    isEdit ? 'Update Template' : 'Save Template'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout >
    );
}
