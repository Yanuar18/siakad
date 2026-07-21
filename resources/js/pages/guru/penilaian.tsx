import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Table, TableCard } from '@/components/application/table/table';
import guru from '@/routes/guru';
import { toast } from 'sonner';

type Subject = {
    id: number;
    name: string;
    code: string;
};

type AcademicYear = {
    id: number;
    year: string;
    semester: string;
    is_active: boolean;
};

type Classroom = {
    id: number;
    name: string;
    academic_year: AcademicYear;
};

type AssignedClass = {
    id: number;
    classroom: Classroom;
    subject: Subject;
};

type StudentDetail = {
    id: number;
    user_id: number;
    nis: string;
};

type Student = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    student_detail?: StudentDetail;
};

type ClassroomStudent = {
    id: number;
    classroom_id: number;
    student_id: number;
    student: Student;
};

type ReportCard = {
    id: number;
    classroom_student_id: number;
    classroom_subject_teacher_id: number;
    score: number;
    grade: string;
    notes: string;
};

type HistoryItem = {
    id: number;
    classroom_student_id: number;
    classroom_subject_teacher_id: number;
    score: number;
    grade: string;
    notes: string;
    classroom_student?: {
        id: number;
        student?: Student;
    };
    classroom_subject_teacher?: {
        classroom?: Classroom;
        subject?: Subject;
    };
};

type Props = {
    assignedClasses: AssignedClass[];
    selectedClassId: number | null;
    students: ClassroomStudent[];
    reportCards: Record<number, ReportCard>;
    history?: HistoryItem[];
};
export default function Penilaian({ assignedClasses, selectedClassId, students, reportCards, history = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
    const [searchQuery, setSearchQuery] = useState('');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [selectedExportIds, setSelectedExportIds] = useState<number[]>([]);
    
    // History filter states
    const [historyClassQuery, setHistoryClassQuery] = useState('');
    const [historyYearQuery, setHistoryYearQuery] = useState('');
    const [historyPage, setHistoryPage] = useState(1);

    const openExportModal = () => {
        setSelectedExportIds(assignedClasses.map(ac => ac.id));
        setIsExportOpen(true);
    };

    const handleExportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedExportIds.length === 0) {
            toast.error('Pilih minimal satu kelas untuk diekspor.');
            return;
        }
        const queryStr = selectedExportIds.map(id => `ids[]=${id}`).join('&');
        window.location.href = `/guru/penilaian/export?${queryStr}`;
        setIsExportOpen(false);
    };

    const toggleExportId = (id: number) => {
        setSelectedExportIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleAllExport = () => {
        if (selectedExportIds.length === assignedClasses.length) {
            setSelectedExportIds([]);
        } else {
            setSelectedExportIds(assignedClasses.map(ac => ac.id));
        }
    };

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('_token', (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '');
        try {
            const res = await fetch('/guru/penilaian/import', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData
            });
            const data = await res.json();
            setIsImportOpen(false);
            if (!res.ok) {
                if (res.status === 422 && data.errors) {
                    const errorList = Object.values(data.errors).flat() as string[];
                    toast.error(
                        <div className="space-y-1 text-red-600 dark:text-red-400">
                            <span className="font-semibold block text-[13.5px]">Gagal mengimpor data</span>
                            <span className="text-xs block opacity-90">{errorList.join(', ')}</span>
                        </div>,
                        {
                            duration: 8000,
                            icon: <i className="fa-solid fa-circle-exclamation text-red-600 dark:text-red-400 text-[17px]"></i>
                        }
                    );
                    return;
                }
                throw new Error();
            }
            if (data.failed > 0) {
                toast.error(
                    <div className="space-y-1 text-red-600 dark:text-red-400">
                        <span className="font-semibold block text-[13.5px]">{data.imported} berhasil, {data.failed} gagal diimpor</span>
                        <span className="text-xs block opacity-90">{data.errors.join(', ')}</span>
                    </div>,
                    {
                        duration: 8000,
                        icon: <i className="fa-solid fa-circle-exclamation text-red-600 dark:text-red-400 text-[17px]"></i>
                    }
                );
            } else {
                toast.success(
                    <span className="font-semibold text-[13.5px]" style={{ color: '#00cca3' }}>
                        {data.imported} data berhasil diimpor!
                    </span>,
                    {
                        icon: <i className="fa-solid fa-circle-check text-[17px]" style={{ color: '#00cca3' }}></i>
                    }
                );
            }
            if (data.imported > 0) {
                router.reload({ only: ['reportCards', 'history', 'students'] });
            }
        } catch {
            setIsImportOpen(false);
            toast.error(
                <span className="font-semibold text-red-600 dark:text-red-400 text-[13.5px]">
                    Terjadi kesalahan saat mengimpor data.
                </span>,
                {
                    icon: <i className="fa-solid fa-circle-exclamation text-red-600 dark:text-red-400 text-[17px]"></i>
                }
            );
        } finally {
            setIsImporting(false);
            setImportFile(null);
        }
    };

    // Pre-initialize scores, grades, and notes from existing database values
    const initialScores = students.reduce((acc, cs) => {
        acc[cs.id] = reportCards[cs.id]?.score ?? '';
        return acc;
    }, {} as Record<number, string | number>);

    const initialGrades = students.reduce((acc, cs) => {
        acc[cs.id] = reportCards[cs.id]?.grade ?? '';
        return acc;
    }, {} as Record<number, string>);

    const initialNotes = students.reduce((acc, cs) => {
        acc[cs.id] = reportCards[cs.id]?.notes ?? '';
        return acc;
    }, {} as Record<number, string>);

    const { data, setData, post, processing } = useForm({
        classroom_subject_teacher_id: selectedClassId || '',
        scores: initialScores,
        grades: initialGrades,
        notes: initialNotes,
    });

    useEffect(() => {
        const nextScores = students.reduce((acc, cs) => {
            acc[cs.id] = reportCards[cs.id]?.score ?? '';
            return acc;
        }, {} as Record<number, string | number>);

        const nextGrades = students.reduce((acc, cs) => {
            acc[cs.id] = reportCards[cs.id]?.grade ?? '';
            return acc;
        }, {} as Record<number, string>);

        const nextNotes = students.reduce((acc, cs) => {
            acc[cs.id] = reportCards[cs.id]?.notes ?? '';
            return acc;
        }, {} as Record<number, string>);

        setData((prev) => ({
            ...prev,
            classroom_subject_teacher_id: selectedClassId || '',
            scores: nextScores,
            grades: nextGrades,
            notes: nextNotes,
        }));
    }, [students, reportCards, selectedClassId]);

    const handleClassChange = (classId: string) => {
        router.get(guru.penilaian.index.url({
            query: {
                classroom_subject_teacher_id: classId
            }
        }));
    };

    const handleScoreChange = (classroomStudentId: number, val: string) => {
        const score = val === '' ? '' : parseInt(val);
        const nextScores = { ...data.scores, [classroomStudentId]: score };

        // Auto calculate grade Predikat
        let calculatedGrade = '';
        if (score !== '') {
            const numScore = Number(score);
            if (numScore >= 85) calculatedGrade = 'A';
            else if (numScore >= 75) calculatedGrade = 'B';
            else if (numScore >= 60) calculatedGrade = 'C';
            else if (numScore >= 50) calculatedGrade = 'D';
            else calculatedGrade = 'E';
        }

        const nextGrades = { ...data.grades, [classroomStudentId]: calculatedGrade };

        // Update multiple fields in Inertia form state
        setData((prev) => ({
            ...prev,
            scores: nextScores,
            grades: nextGrades,
        }));
    };

    const handleGradeOverride = (classroomStudentId: number, gradeVal: string) => {
        setData('grades', {
            ...data.grades,
            [classroomStudentId]: gradeVal,
        });
    };

    const handleNoteChange = (classroomStudentId: number, noteVal: string) => {
        setData('notes', {
            ...data.notes,
            [classroomStudentId]: noteVal,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(guru.penilaian.store.url(), {
            onSuccess: () => {
                toast.success('Penilaian siswa berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan penilaian.');
            }
        });
    };

    const inspectHistory = (item: HistoryItem) => {
        router.get(guru.penilaian.index.url({
            query: {
                classroom_subject_teacher_id: item.classroom_subject_teacher_id.toString()
            }
        }), {}, {
            onSuccess: () => {
                setActiveTab('input');
            }
        });
    };

    // Filter students by Name or NISN for Input tab
    const filteredStudents = students.filter(cs => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = cs.student?.name?.toLowerCase() || '';
        const nisn = cs.student?.student_detail?.nis?.toLowerCase() || '';
        return name.includes(q) || nisn.includes(q);
    });

    // Helper: extract unique classrooms & academic years from assignedClasses for filter selectors
    const uniqueClassrooms = Array.from(new Set(assignedClasses.map(ac => ac.classroom?.id)))
        .map(id => assignedClasses.find(ac => ac.classroom?.id === id)?.classroom)
        .filter((c): c is Classroom => !!c);

    const uniqueAcademicYears = Array.from(new Set(assignedClasses.map(ac => ac.classroom?.academic_year?.id)))
        .map(id => assignedClasses.find(ac => ac.classroom?.academic_year?.id === id)?.classroom?.academic_year)
        .filter((ay): ay is AcademicYear => !!ay);

    // Filter and paginate history tab by Classroom and Academic Year
    const filteredHistory = history.filter(item => {
        const itemClassId = item.classroom_subject_teacher?.classroom?.id;
        const itemYearId = item.classroom_subject_teacher?.classroom?.academic_year?.id;

        if (historyClassQuery && itemClassId !== parseInt(historyClassQuery)) {
            return false;
        }
        if (historyYearQuery && itemYearId !== parseInt(historyYearQuery)) {
            return false;
        }
        return true;
    });

    const historyItemsPerPage = 10;
    const totalHistoryPages = Math.ceil(filteredHistory.length / historyItemsPerPage);
    const paginatedHistory = filteredHistory.slice((historyPage - 1) * historyItemsPerPage, historyPage * historyItemsPerPage);

    const activeClass = assignedClasses.find(ac => ac.id === selectedClassId);

    const getGradeBadgeClass = (grade: string) => {
        const g = grade.toUpperCase();
        if (g === 'A') return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/30';
        if (g === 'B') return 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-500 border border-teal-500/30';
        if (g === 'C') return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-555 border border-amber-500/30';
        if (g === 'D') return 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500/30';
        return 'bg-red-50 dark:bg-red-550/10 text-red-500 border border-red-500/30';
    };

    return (
        <AppLayout>
            <Head title="Penilaian Siswa" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Penilaian Siswa</h1>
                        <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Kelola nilai rapor semester siswa di kelas Anda.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <a
                            href="/guru/penilaian/template"
                            className="flex-1 sm:flex-none h-11 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                        >
                            <i className="fa-solid fa-file-arrow-down text-[12px]"></i> Template
                        </a>
                        <button
                            onClick={() => { setIsImportOpen(true); setImportFile(null); }}
                            className="flex-1 sm:flex-none h-11 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                        >
                            <i className="fa-solid fa-file-import text-[12px]"></i> Import
                        </button>
                        <button
                            onClick={openExportModal}
                            className="flex-1 sm:flex-none h-11 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                        >
                            <i className="fa-solid fa-file-export text-[12px]"></i> Export
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
                    <button
                        onClick={() => setActiveTab('input')}
                        className={`pb-3 text-sm font-bold border-b-2 font-poppins px-2 cursor-pointer transition-colors ${activeTab === 'input' ? 'border-[#00cca3] text-[#00cca3]' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`}
                    >
                        Input Penilaian
                    </button>
                    <button
                        onClick={() => setActiveTab('riwayat')}
                        className={`pb-3 text-sm font-bold border-b-2 font-poppins px-2 cursor-pointer transition-colors ${activeTab === 'riwayat' ? 'border-[#00cca3] text-[#00cca3]' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`}
                    >
                        Riwayat Penilaian
                    </button>
                </div>

                {activeTab === 'input' ? (
                    <>
                        {/* Filters Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm">
                            <div>
                                <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 mb-2 font-poppins">Kelas</label>
                                <select
                                    value={selectedClassId || ''}
                                    onChange={e => handleClassChange(e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#fbfcfe] dark:bg-[#0f172a] text-[13.5px] outline-none text-[#182449] dark:text-zinc-200 focus:border-[#00cca3] transition-colors"
                                >
                                    {assignedClasses.length === 0 ? (
                                        <option className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value="">Tidak ada kelas ditugaskan</option>
                                    ) : (
                                        assignedClasses.map((ac) => (
                                            <option key={ac.id} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value={ac.id}>
                                                {ac.classroom.name} - {ac.subject.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="flex flex-col justify-end">
                                <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 mb-2 font-poppins">Cari Siswa</label>
                                <div className="relative w-full">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px]" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Cari nama atau NIS siswa..."
                                        className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Penilaian Table */}
                        {selectedClassId && (
                            <form onSubmit={submit}>
                                <TableCard.Root>
                                    <TableCard.Header
                                        title={activeClass ? `Penilaian Kelas ${activeClass.classroom.name}` : 'Penilaian Siswa'}
                                        badge={activeClass ? `${activeClass.subject.name}` : ''}
                                        contentTrailing={
                                            <div className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium">
                                                TA: <span className="font-semibold text-zinc-800 dark:text-white">{activeClass?.classroom?.academic_year?.year} - {activeClass?.classroom?.academic_year?.semester === 'odd' ? 'Ganjil' : 'Genap'}</span>
                                            </div>
                                        }
                                    />

                                    {filteredStudents.length === 0 ? (
                                        <div className="py-12 text-center text-[#7c869c] dark:text-[#94a3b8] italic text-sm">
                                            Tidak ada siswa terdaftar di kelas ini.
                                        </div>
                                    ) : (
                                        <Table aria-label="Daftar Nilai Siswa">
                                            <Table.Header>
                                                <Table.Head id="no" label="No" className="w-16 text-center" />
                                                <Table.Head id="student" label="Siswa" />
                                                <Table.Head id="score" label="Nilai" className="w-36 text-center" />
                                                <Table.Head id="grade" label="Predikat" className="w-32 text-center" />
                                                <Table.Head id="notes" label="Catatan" />
                                            </Table.Header>

                                            <Table.Body items={filteredStudents}>
                                                {(cs, index) => {
                                                    const scoreVal = data.scores[cs.id] ?? '';
                                                    const gradeVal = data.grades[cs.id] ?? '';
                                                    const noteVal = data.notes[cs.id] ?? '';

                                                    return (
                                                        <Table.Row id={cs.id}>
                                                            <Table.Cell className="text-center text-zinc-500 font-medium">
                                                                {index + 1}
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-[#182449] dark:text-white">
                                                                        {cs.student?.name}
                                                                    </span>
                                                                    <span className="text-[12px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                                                                        NIS: {cs.student?.student_detail?.nis || '-'}
                                                                    </span>
                                                                </div>
                                                            </Table.Cell>
                                                            <Table.Cell className="text-center py-2">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={scoreVal}
                                                                    onChange={e => handleScoreChange(cs.id, e.target.value)}
                                                                    placeholder="0-100"
                                                                    className="w-24 text-center h-10 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] dark:text-white font-semibold font-mono"
                                                                />
                                                            </Table.Cell>
                                                            <Table.Cell className="text-center py-2">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    {gradeVal ? (
                                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[13px] ${getGradeBadgeClass(gradeVal)}`}>
                                                                            {gradeVal}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-zinc-400 text-sm font-medium">-</span>
                                                                    )}
                                                                    <select
                                                                        value={gradeVal}
                                                                        onChange={e => handleGradeOverride(cs.id, e.target.value)}
                                                                        className="h-8 py-0 px-1 text-[11.5px] rounded bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-[#00cca3]"
                                                                        title="Override Predikat"
                                                                    >
                                                                        <option className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value="">Auto</option>
                                                                        <option className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value="A">A</option>
                                                                        <option className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value="B">B</option>
                                                                        <option className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value="C">C</option>
                                                                        <option className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value="D">D</option>
                                                                        <option className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value="E">E</option>
                                                                    </select>
                                                                </div>
                                                            </Table.Cell>
                                                            <Table.Cell className="py-2 min-w-0">
                                                                <input
                                                                    type="text"
                                                                    value={noteVal}
                                                                    onChange={e => handleNoteChange(cs.id, e.target.value)}
                                                                    placeholder="Catatan..."
                                                                    className="w-full min-w-[140px] h-10 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                                                />
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    );
                                                }}
                                            </Table.Body>
                                        </Table>
                                    )}

                                    {filteredStudents.length > 0 && (
                                        <div className="p-4 border-t border-zinc-150 dark:border-zinc-800/80 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="h-11 px-6 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14.5px] cursor-pointer transition-colors flex items-center justify-center gap-2"
                                            >
                                                <i className="fa-solid fa-save text-[13px]"></i>
                                                {processing ? 'Menyimpan...' : 'Simpan'}
                                            </button>
                                        </div>
                                    )}
                                </TableCard.Root>
                            </form>
                        )}
                    </>
                ) : (
                    /* History Tab */
                    <TableCard.Root>
                        <TableCard.Header
                            title="Riwayat Penilaian"
                            badge={`${filteredHistory.length} penilaian`}
                            contentTrailing={
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <span className="text-[12.5px] text-zinc-400 shrink-0 font-medium font-poppins">Kelas:</span>
                                        <select
                                            value={historyClassQuery}
                                            onChange={e => {
                                                setHistoryClassQuery(e.target.value);
                                                setHistoryPage(1);
                                            }}
                                            className="h-9 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] text-[13px] outline-none text-[#182449] dark:text-zinc-200 focus:border-[#00cca3] w-full sm:w-auto sm:min-w-[130px] flex-1 transition-colors"
                                        >
                                            <option className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value="">Semua Kelas</option>
                                            {uniqueClassrooms.map(c => (
                                                <option key={c.id} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <span className="text-[12.5px] text-zinc-400 shrink-0 font-medium font-poppins">Tahun Ajaran:</span>
                                        <select
                                            value={historyYearQuery}
                                            onChange={e => {
                                                setHistoryYearQuery(e.target.value);
                                                setHistoryPage(1);
                                            }}
                                            className="h-9 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] text-[13px] outline-none text-[#182449] dark:text-zinc-200 focus:border-[#00cca3] w-full sm:w-auto sm:min-w-[160px] flex-1 transition-colors"
                                        >
                                            <option className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value="">Semua Tahun</option>
                                            {uniqueAcademicYears.map(ay => (
                                                <option key={ay.id} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#0f172a]" value={ay.id}>{ay.year} - {ay.semester === 'odd' ? 'Ganjil' : 'Genap'}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            }
                        />

                        {paginatedHistory.length === 0 ? (
                            <div className="py-12 text-center text-[#7c869c] dark:text-[#94a3b8] italic text-sm">
                                Belum ada riwayat penilaian untuk kelas atau tahun ajaran yang dipilih.
                            </div>
                        ) : (
                            <Table aria-label="Riwayat Nilai Rapor Siswa">
                                <Table.Header>
                                    <Table.Head id="no" label="No" className="w-16 text-center" />
                                    <Table.Head id="student" label="Siswa" />
                                    <Table.Head id="classroom" label="Kelas" />
                                    <Table.Head id="subject" label="Mapel" />
                                    <Table.Head id="score" label="Nilai" className="text-center w-24" />
                                    <Table.Head id="grade" label="Predikat" className="text-center w-28" />
                                    <Table.Head id="notes" label="Catatan" />
                                    <Table.Head id="actions" label="Aksi" className="text-center w-24" />
                                </Table.Header>

                                <Table.Body items={paginatedHistory}>
                                    {(item, index) => (
                                        <Table.Row id={item.id}>
                                            <Table.Cell className="text-center text-zinc-500 font-medium">
                                                {(historyPage - 1) * historyItemsPerPage + index + 1}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-800 dark:text-white">
                                                        {item.classroom_student?.student?.name || '-'}
                                                    </span>
                                                    <span className="text-[12px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                                                        NIS: {item.classroom_student?.student?.student_detail?.nis || '-'}
                                                    </span>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                                                        {item.classroom_subject_teacher?.classroom?.name || '-'}
                                                    </span>
                                                    <span className="text-[12px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5" title="Tahun Ajaran">
                                                        TA: {item.classroom_subject_teacher?.classroom?.academic_year?.year || '-'} - {item.classroom_subject_teacher?.classroom?.academic_year?.semester === 'odd' ? 'Ganjil' : 'Genap'}
                                                    </span>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {item.classroom_subject_teacher?.subject?.name || '-'}
                                            </Table.Cell>
                                            <Table.Cell className="text-center font-mono font-bold text-zinc-800 dark:text-zinc-100">
                                                {item.score}
                                            </Table.Cell>
                                            <Table.Cell className="text-center">
                                                <span className={`inline-flex h-8 w-8 rounded-full items-center justify-center font-bold text-[13px] ${getGradeBadgeClass(item.grade)}`}>
                                                    {item.grade}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs truncate">
                                                <span title={item.notes || undefined}>
                                                    {item.notes || '-'}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell className="text-center">
                                                {item.classroom_subject_teacher?.classroom?.academic_year?.is_active ? (
                                                    <button
                                                        onClick={() => inspectHistory(item)}
                                                        className="p-1.5 text-zinc-400 hover:text-[#00cca3] transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
                                                        title="Edit"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-sm"></i>
                                                    </button>
                                                ) : (
                                                    <span
                                                        className="p-1.5 text-zinc-300 dark:text-zinc-700 flex items-center justify-center gap-1 mx-auto"
                                                        title="Tahun ajaran tidak aktif"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-sm"></i>
                                                    </span>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                        )}

                        <TableCard.Pagination
                            currentPage={historyPage}
                            totalPages={totalHistoryPages}
                            onPageChange={setHistoryPage}
                        />
                    </TableCard.Root>
                )}
            </div>

            {/* Import CSV Modal */}
            {isImportOpen && (
                <div onClick={() => setIsImportOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-5 shadow-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-file-import text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Import Nilai Siswa</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Upload file CSV / XLSX untuk impor massal</p>
                                </div>
                            </div>
                            <button onClick={() => setIsImportOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-[12.5px] text-zinc-500 dark:text-zinc-400 space-y-1">
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300">Format kolom:</p>
                            <p><span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Nama Kelas; Tahun Ajaran; Kode Mapel; NIS; Nilai; Catatan</span></p>
                            <p className="text-zinc-400 dark:text-zinc-500">Unduh template untuk mendapatkan daftar murid kelas Anda.</p>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-4">
                            <div>
                                <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">File CSV / XLSX</label>
                                <input
                                    type="file"
                                    accept=".csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
                                    onChange={(e) => { setImportFile(e.target.files?.[0] || null); }}
                                    className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e6fcf6] file:text-[#00cca3] dark:file:bg-[#00cca3]/10 dark:file:text-[#00cca3] hover:file:bg-[#00cca3]/15 dark:hover:file:bg-[#00cca3]/20 cursor-pointer"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsImportOpen(false)}
                                    className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={!importFile || isImporting}
                                    className="flex-1 h-11 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14px] cursor-pointer transition-colors"
                                >
                                    {isImporting ? 'Mengimpor...' : 'Import'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Export Selection Modal */}
            {isExportOpen && (
                <div onClick={() => setIsExportOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-5 shadow-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-file-export text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Ekspor Data Nilai</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Pilih kelas yang ingin diekspor</p>
                                </div>
                            </div>
                            <button onClick={() => setIsExportOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleExportSubmit} className="space-y-4">
                            {/* Select All Checkbox */}
                            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                                <input
                                    type="checkbox"
                                    id="selectAllExport"
                                    checked={selectedExportIds.length === assignedClasses.length && assignedClasses.length > 0}
                                    onChange={toggleAllExport}
                                    className="w-4 h-4 rounded border-zinc-300 text-[#00cca3] focus:ring-[#00cca3] cursor-pointer"
                                />
                                <label htmlFor="selectAllExport" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                    Pilih Semua Kelas ({assignedClasses.length})
                                </label>
                            </div>

                            {/* Class List */}
                            <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1">
                                {assignedClasses.map((ac) => {
                                    const isChecked = selectedExportIds.includes(ac.id);
                                    return (
                                        <div key={ac.id} className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                id={`exportClass-${ac.id}`}
                                                checked={isChecked}
                                                onChange={() => toggleExportId(ac.id)}
                                                className="w-4 h-4 rounded border-zinc-300 text-[#00cca3] focus:ring-[#00cca3] cursor-pointer"
                                            />
                                            <label htmlFor={`exportClass-${ac.id}`} className="text-[13.5px] font-medium text-zinc-650 dark:text-zinc-300 cursor-pointer truncate">
                                                Kelas {ac.classroom.name} - {ac.subject.name}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                <button
                                    type="button"
                                    onClick={() => setIsExportOpen(false)}
                                    className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={selectedExportIds.length === 0}
                                    className="flex-1 h-11 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14px] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Ekspor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
