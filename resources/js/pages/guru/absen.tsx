import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
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

type Attendance = {
    id: number;
    classroom_student_id: number;
    classroom_subject_teacher_id: number;
    date: string;
    status: 'present' | 'sick' | 'permission' | 'absent';
};

type HistoryItem = {
    classroom_subject_teacher_id: number;
    date: string;
    total_students: number;
    present_count: string | number;
    sick_count: string | number;
    permission_count: string | number;
    absent_count: string | number;
    classroom_subject_teacher?: {
        classroom?: Classroom;
        subject?: Subject;
    };
};

type Props = {
    assignedClasses: AssignedClass[];
    selectedClassId: number | null;
    selectedDate: string;
    students: ClassroomStudent[];
    attendances: Record<number, Attendance>;
    history?: HistoryItem[];
};
export default function Absen({ assignedClasses, selectedClassId, selectedDate, students, attendances, history = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
    const [searchQuery, setSearchQuery] = useState('');
    const [historyDateQuery, setHistoryDateQuery] = useState('');
    const [historyPage, setHistoryPage] = useState(1);

    // Pre-initialize form data mapping classroom_student_id to status
    const initialAttendances = students.reduce((acc, cs) => {
        acc[cs.id] = attendances[cs.id]?.status || 'present';
        return acc;
    }, {} as Record<number, string>);

    const { data, setData, post, processing } = useForm({
        classroom_subject_teacher_id: selectedClassId || '',
        date: selectedDate || '',
        attendances: initialAttendances,
    });

    // Handle filter transitions
    const handleClassChange = (classId: string) => {
        router.get(guru.absen.index.url({
            query: {
                classroom_subject_teacher_id: classId,
                date: selectedDate
            }
        }));
    };

    const handleDateChange = (dateStr: string) => {
        router.get(guru.absen.index.url({
            query: {
                classroom_subject_teacher_id: selectedClassId || '',
                date: dateStr
            }
        }));
    };

    const handleStatusChange = (classroomStudentId: number, status: 'present' | 'sick' | 'permission' | 'absent') => {
        setData('attendances', {
            ...data.attendances,
            [classroomStudentId]: status,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(guru.absen.store.url(), {
            onSuccess: () => {
                toast.success('Presensi siswa berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan presensi.');
            }
        });
    };

    const inspectHistory = (item: HistoryItem) => {
        router.get(guru.absen.index.url({
            query: {
                classroom_subject_teacher_id: item.classroom_subject_teacher_id.toString(),
                date: item.date
            }
        }));
    };

    // Client-side student filtering by name or NISN
    const filteredStudents = students.filter(cs => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = cs.student?.name?.toLowerCase() || '';
        const nisn = cs.student?.student_detail?.nis?.toLowerCase() || '';
        return name.includes(q) || nisn.includes(q);
    });

    const activeClass = assignedClasses.find(ac => ac.id === selectedClassId);

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Filter and paginate history tab
    const filteredHistory = history.filter(item => {
        if (!historyDateQuery) return true;
        return item.date === historyDateQuery;
    });

    const historyItemsPerPage = 10;
    const totalHistoryPages = Math.ceil(filteredHistory.length / historyItemsPerPage);
    const paginatedHistory = filteredHistory.slice((historyPage - 1) * historyItemsPerPage, historyPage * historyItemsPerPage);

    return (
        <AppLayout>
            <Head title="Presensi Siswa" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Presensi Siswa</h1>
                    <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Kelola daftar kehadiran harian siswa di kelas Anda.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
                    <button
                        onClick={() => setActiveTab('input')}
                        className={`pb-3 text-sm font-bold border-b-2 font-poppins px-2 cursor-pointer transition-colors ${activeTab === 'input' ? 'border-[#00cca3] text-[#00cca3]' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`}
                    >
                        Input Presensi
                    </button>
                    <button
                        onClick={() => setActiveTab('riwayat')}
                        className={`pb-3 text-sm font-bold border-b-2 font-poppins px-2 cursor-pointer transition-colors ${activeTab === 'riwayat' ? 'border-[#00cca3] text-[#00cca3]' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`}
                    >
                        Riwayat Presensi
                    </button>
                </div>

                {activeTab === 'input' ? (
                    <>
                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm">
                            <div>
                                <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 mb-2 font-poppins">Kelas</label>
                                <select
                                    value={selectedClassId || ''}
                                    onChange={e => handleClassChange(e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] text-[13.5px] outline-none text-[#182449] dark:text-zinc-200 focus:border-[#00cca3] transition-colors"
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

                            <div>
                                <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 mb-2 font-poppins">Tanggal</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => handleDateChange(e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                />
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

                        {/* Attendance Form */}
                        {selectedClassId && (
                            <form onSubmit={submit}>
                                <TableCard.Root>
                                    <TableCard.Header
                                        title={activeClass ? `Presensi Kelas ${activeClass.classroom.name}` : 'Presensi Siswa'}
                                        badge={activeClass ? `${activeClass.subject.name}` : ''}
                                        contentTrailing={
                                            <div className="flex flex-row justify-between gap-4 md:flex-col md:items-end md:gap-0.5 text-[13px] text-zinc-500 dark:text-zinc-400 font-medium w-full md:w-auto">
                                                <div>
                                                    {activeClass?.classroom?.academic_year && (
                                                        <>TA: <span className="font-semibold text-zinc-800 dark:text-white">
                                                            {activeClass.classroom.academic_year.year} - {activeClass.classroom.academic_year.semester === 'odd' ? 'Ganjil' : 'Genap'}
                                                        </span></>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-zinc-800 dark:text-white">{formatDate(selectedDate)}</span>
                                                </div>
                                            </div>
                                        }
                                    />

                                    {filteredStudents.length === 0 ? (
                                        <div className="py-12 text-center text-[#7c869c] dark:text-[#94a3b8] italic text-sm">
                                            Tidak ada siswa terdaftar di kelas ini.
                                        </div>
                                    ) : (
                                        <Table aria-label="Daftar Absensi Siswa">
                                            <Table.Header>
                                                <Table.Head id="no" label="No" className="w-16 text-center" />
                                                <Table.Head id="student" label="Siswa" />
                                                <Table.Head id="status" label="Status Kehadiran" className="text-center" />
                                            </Table.Header>

                                            <Table.Body items={filteredStudents}>
                                                {(cs, index) => {
                                                    const activeStatus = data.attendances[cs.id] || 'present';
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
                                                            <Table.Cell className="text-center py-2.5">
                                                                <div className="flex justify-center items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStatusChange(cs.id, 'present')}
                                                                        className={`h-9 px-3.5 rounded-[8px] font-semibold text-[13px] transition-colors cursor-pointer border ${
                                                                            activeStatus === 'present'
                                                                                ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/15 text-[#00cca3] border-[#00cca3]/40'
                                                                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                                                                        }`}
                                                                    >
                                                                        Hadir
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStatusChange(cs.id, 'sick')}
                                                                        className={`h-9 px-3.5 rounded-[8px] font-semibold text-[13px] transition-colors cursor-pointer border ${
                                                                            activeStatus === 'sick'
                                                                                ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-500 border-amber-500/40'
                                                                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                                                                        }`}
                                                                    >
                                                                        Sakit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStatusChange(cs.id, 'permission')}
                                                                        className={`h-9 px-3.5 rounded-[8px] font-semibold text-[13px] transition-colors cursor-pointer border ${
                                                                            activeStatus === 'permission'
                                                                                ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-500 border-blue-500/40'
                                                                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                                                                        }`}
                                                                    >
                                                                        Izin
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStatusChange(cs.id, 'absent')}
                                                                        className={`h-9 px-3.5 rounded-[8px] font-semibold text-[13px] transition-colors cursor-pointer border ${
                                                                            activeStatus === 'absent'
                                                                                ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-500/40'
                                                                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                                                                        }`}
                                                                    >
                                                                        Alpa
                                                                    </button>
                                                                </div>
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
                            title="Riwayat Absensi Siswa"
                            contentTrailing={
                                <div className="flex items-center gap-3 w-full sm:max-w-[280px]">
                                    <span className="text-[12.5px] text-zinc-400 shrink-0 font-medium font-poppins">Cari Tanggal:</span>
                                    <div className="relative flex-1">
                                        <input
                                            type="date"
                                            value={historyDateQuery}
                                            onChange={e => {
                                                setHistoryDateQuery(e.target.value);
                                                setHistoryPage(1);
                                            }}
                                            className="w-full h-10 px-3 pr-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                        />
                                        {historyDateQuery && (
                                            <button 
                                                onClick={() => {
                                                    setHistoryDateQuery('');
                                                    setHistoryPage(1);
                                                }} 
                                                type="button"
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#00cca3] cursor-pointer"
                                                title="Clear"
                                            >
                                                <i className="fa-solid fa-circle-xmark"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            }
                        />

                        {paginatedHistory.length === 0 ? (
                            <div className="py-12 text-center text-[#7c869c] dark:text-[#94a3b8] italic text-sm">
                                {historyDateQuery ? 'Tidak ada riwayat presensi pada tanggal tersebut.' : 'Belum ada riwayat absensi yang tercatat.'}
                            </div>
                        ) : (
                            <Table aria-label="Riwayat Absensi Siswa">
                                <Table.Header>
                                    <Table.Head id="no" label="No" className="w-16 text-center" />
                                    <Table.Head id="date" label="Tanggal" />
                                    <Table.Head id="classroom" label="Kelas" />
                                    <Table.Head id="subject" label="Mapel" />
                                    <Table.Head id="present" label="Hadir" className="text-center" />
                                    <Table.Head id="sick" label="Sakit" className="text-center" />
                                    <Table.Head id="permission" label="Izin" className="text-center" />
                                    <Table.Head id="absent" label="Alpa" className="text-center" />
                                    <Table.Head id="actions" label="Aksi" className="text-center w-24" />
                                </Table.Header>

                                <Table.Body items={paginatedHistory}>
                                    {(item, index) => (
                                        <Table.Row id={`${item.classroom_subject_teacher_id}-${item.date}`}>
                                            <Table.Cell className="text-center text-zinc-500 font-medium">
                                                {(historyPage - 1) * historyItemsPerPage + index + 1}
                                            </Table.Cell>
                                            <Table.Cell className="font-semibold text-zinc-800 dark:text-white">
                                                {formatDate(item.date)}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {item.classroom_subject_teacher?.classroom?.name || '-'}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {item.classroom_subject_teacher?.subject?.name || '-'}
                                            </Table.Cell>
                                            <Table.Cell className="text-center font-mono font-semibold text-emerald-600 dark:text-emerald-500">
                                                {item.present_count}
                                            </Table.Cell>
                                            <Table.Cell className="text-center font-mono font-semibold text-amber-600 dark:text-amber-500">
                                                {item.sick_count}
                                            </Table.Cell>
                                            <Table.Cell className="text-center font-mono font-semibold text-blue-600 dark:text-blue-500">
                                                {item.permission_count}
                                            </Table.Cell>
                                            <Table.Cell className="text-center font-mono font-semibold text-red-600 dark:text-red-500">
                                                {item.absent_count}
                                            </Table.Cell>
                                            <Table.Cell className="text-center">
                                                <button
                                                    onClick={() => inspectHistory(item)}
                                                    className="p-1.5 text-zinc-400 hover:text-[#00cca3] transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
                                                    title="Lihat / Edit Detail"
                                                >
                                                    <i className="fa-solid fa-eye text-sm"></i>
                                                </button>
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
        </AppLayout>
    );
}
