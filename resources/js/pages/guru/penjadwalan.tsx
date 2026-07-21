import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
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

type Schedule = {
    id: number;
    classroom_subject_teacher_id: number;
    day: string;
    start_time: string;
    end_time: string;
    classroom_subject_teacher: {
        classroom: Classroom;
        subject: Subject;
    };
};

type Props = {
    assignedClasses: AssignedClass[];
    schedules: Schedule[];
};

export default function Penjadwalan({ assignedClasses, schedules }: Props) {
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('_token', (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '');
        try {
            const res = await fetch('/guru/penjadwalan/import', {
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
                router.reload({ only: ['schedules'] });
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

    const createForm = useForm({
        classroom_subject_teacher_id: assignedClasses[0]?.id || '',
        day: 'monday',
        start_time: '08:00',
        end_time: '09:30',
    });

    const editForm = useForm({
        classroom_subject_teacher_id: '',
        day: 'monday',
        start_time: '',
        end_time: '',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(guru.penjadwalan.store.url(), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
                toast.success('Jadwal berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan jadwal. Harap periksa input Anda.');
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSchedule) return;
        editForm.patch(guru.penjadwalan.update.url(editingSchedule.id), {
            onSuccess: () => {
                editForm.reset();
                setEditingSchedule(null);
                toast.success('Jadwal berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui jadwal. Harap periksa input Anda.');
            }
        });
    };

    const openEdit = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        editForm.setData({
            classroom_subject_teacher_id: schedule.classroom_subject_teacher_id.toString(),
            day: schedule.day,
            start_time: schedule.start_time.substring(0, 5),
            end_time: schedule.end_time.substring(0, 5),
        });
    };

    const submitDelete = () => {
        if (!deletingSchedule) return;
        router.delete(guru.penjadwalan.destroy.url(deletingSchedule.id), {
            onSuccess: () => {
                setDeletingSchedule(null);
                toast.success('Jadwal berhasil dihapus!');
            },
            onError: () => {
                toast.error('Gagal menghapus jadwal.');
            }
        });
    };

    const mapDay = (day: string) => {
        const days: Record<string, string> = {
            monday: 'Senin',
            tuesday: 'Selasa',
            wednesday: 'Rabu',
            thursday: 'Kamis',
            friday: 'Jumat',
            saturday: 'Sabtu',
            sunday: 'Minggu'
        };
        return days[day.toLowerCase()] || day;
    };

    const getDayStyle = (day: string) => {
        const d = day.toLowerCase();
        if (d === 'monday') {
            return {
                bgClass: 'bg-[#e6fcf6] dark:bg-[#00cca3]/10',
                borderColor: 'border-[#00cca3]/30',
                badgeBg: 'bg-white dark:bg-[#0f172a] text-[#00cca3]',
                icon: 'fa-solid fa-calendar-day'
            };
        }
        if (d === 'tuesday') {
            return {
                bgClass: 'bg-blue-50 dark:bg-blue-500/10',
                borderColor: 'border-blue-500/30',
                badgeBg: 'bg-white dark:bg-[#0f172a] text-blue-500',
                icon: 'fa-solid fa-calendar-day'
            };
        }
        if (d === 'wednesday') {
            return {
                bgClass: 'bg-amber-50 dark:bg-amber-500/10',
                borderColor: 'border-amber-500/30',
                badgeBg: 'bg-white dark:bg-[#0f172a] text-amber-600 dark:text-amber-500',
                icon: 'fa-solid fa-calendar-day'
            };
        }
        if (d === 'thursday') {
            return {
                bgClass: 'bg-purple-50 dark:bg-purple-500/10',
                borderColor: 'border-purple-500/30',
                badgeBg: 'bg-white dark:bg-[#0f172a] text-purple-500',
                icon: 'fa-solid fa-calendar-day'
            };
        }
        if (d === 'friday') {
            return {
                bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
                borderColor: 'border-emerald-500/30',
                badgeBg: 'bg-white dark:bg-[#0f172a] text-emerald-600 dark:text-emerald-500',
                icon: 'fa-solid fa-calendar-day'
            };
        }
        if (d === 'saturday') {
            return {
                bgClass: 'bg-rose-50 dark:bg-rose-500/10',
                borderColor: 'border-rose-500/30',
                badgeBg: 'bg-white dark:bg-[#0f172a] text-rose-500',
                icon: 'fa-solid fa-calendar-day'
            };
        }
        return {
            bgClass: 'bg-zinc-50 dark:bg-zinc-500/10',
            borderColor: 'border-zinc-500/30',
            badgeBg: 'bg-white dark:bg-[#0f172a] text-zinc-600 dark:text-zinc-400',
            icon: 'fa-solid fa-calendar-day'
        };
    };

    // Filter schedules
    const filteredSchedules = (schedules || []).filter(s => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const className = s.classroom_subject_teacher?.classroom?.name?.toLowerCase() || '';
        const subjectName = s.classroom_subject_teacher?.subject?.name?.toLowerCase() || '';
        const dayName = mapDay(s.day || '').toLowerCase();
        return className.includes(q) || subjectName.includes(q) || dayName.includes(q);
    });

    // Group schedules by day
    const groupedSchedules: Record<string, Schedule[]> = {};
    filteredSchedules.forEach(s => {
        const day = s.day.toLowerCase();
        if (!groupedSchedules[day]) {
            groupedSchedules[day] = [];
        }
        groupedSchedules[day].push(s);
    });

    // Sort schedules inside each day by start_time
    Object.keys(groupedSchedules).forEach(day => {
        groupedSchedules[day].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    });

    // Day ordering helper
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Get list of days that have schedules after filters
    const activeDays = dayOrder.filter(day => groupedSchedules[day] && groupedSchedules[day].length > 0);

    return (
        <AppLayout>
            <Head title="Penjadwalan Mengajar" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Penjadwalan Mengajar</h1>
                        <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Kelola hari dan jam mengajar di kelas Anda.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <a
                            href="/guru/penjadwalan/template"
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
                        <a
                            href="/guru/penjadwalan/export"
                            className="flex-1 sm:flex-none h-11 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                        >
                            <i className="fa-solid fa-file-export text-[12px]"></i> Export
                        </a>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex-1 sm:flex-none h-11 px-5 rounded-[10px] bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14.5px] cursor-pointer flex items-center justify-center gap-2 transition-colors"
                        >
                            <i className="fa-solid fa-plus text-[13px]"></i> Tambah Jadwal
                        </button>
                    </div>
                </div>

                {/* Main Content Wrapper */}
                <div className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm space-y-6">
                    {/* Header with Search and Stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <span className="text-[15.5px] font-bold text-[#182449] dark:text-white font-poppins">Daftar Jadwal</span>
                            <span className="h-5 px-2 bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] text-[11.5px] font-bold rounded-full flex items-center justify-center uppercase">{filteredSchedules.length} Jadwal</span>
                        </div>

                        <div className="relative w-full sm:max-w-[280px]">
                            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Cari kelas, mata pelajaran..."
                                className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Cards Grid Grouped by Day */}
                    {activeDays.length === 0 ? (
                        <div className="py-16 text-center text-[#7c869c] dark:text-[#94a3b8] italic text-sm">
                            Tidak ada jadwal mengajar ditemukan.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeDays.map((day) => {
                                const style = getDayStyle(day);
                                const daySchedules = groupedSchedules[day];
                                return (
                                    <div key={day} className={`bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col`}>
                                        {/* Card Header (Day Name) */}
                                        <div className={`p-4 ${style.bgClass} border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between`}>
                                            <div className="flex items-center gap-2.5">
                                                <i className={`${style.icon} text-lg ${style.badgeBg.split(' ').pop()}`}></i>
                                                <h3 className="font-bold text-[16px] text-[#182449] dark:text-white font-poppins">{mapDay(day)}</h3>
                                            </div>
                                            <span className={`h-5 px-2 text-[11px] font-bold rounded-full flex items-center justify-center ${style.badgeBg}`}>
                                                {daySchedules.length} Sesi
                                            </span>
                                        </div>

                                        {/* Day's schedules list */}
                                        <div className="p-4 flex-1 space-y-3.5 max-h-[480px] overflow-y-auto">
                                            {daySchedules.map((schedule) => (
                                                <div key={schedule.id} className="p-3 bg-zinc-50 dark:bg-[#142036] border border-zinc-150 dark:border-zinc-800/60 rounded-lg space-y-2 hover:border-[#00cca3] transition-colors relative group">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-bold text-[14px] text-[#182449] dark:text-white leading-tight truncate" title={schedule.classroom_subject_teacher?.subject?.name}>
                                                                {schedule.classroom_subject_teacher?.subject?.name || '-'}
                                                            </h4>
                                                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">{schedule.classroom_subject_teacher?.subject?.code || '-'}</p>
                                                        </div>
                                                        <div className="text-[12px] text-right font-bold text-[#00cca3] font-mono shrink-0 whitespace-nowrap">
                                                            {(schedule.start_time || '').substring(0, 5)} - {(schedule.end_time || '').substring(0, 5)}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1 text-[12.5px] text-zinc-500 dark:text-zinc-400">
                                                        <div className="flex items-center gap-1.5">
                                                            <i className="fa-solid fa-school w-3.5 text-center text-zinc-400 text-[12px]"></i>
                                                            <span className="truncate">Kelas: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{schedule.classroom_subject_teacher?.classroom?.name || '-'}</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11.5px]">
                                                            <i className="fa-solid fa-calendar-days w-3.5 text-center text-zinc-400 text-[12px]"></i>
                                                            <span className="truncate text-zinc-400 dark:text-zinc-500">
                                                                TA: {schedule.classroom_subject_teacher?.classroom?.academic_year?.year || '-'} - <span className="capitalize">{schedule.classroom_subject_teacher?.classroom?.academic_year?.semester === 'odd' ? 'Ganjil' : 'Genap'}</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Card Actions */}
                                                    <div className="flex justify-end gap-1 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2 mt-1">
                                                        <button
                                                            onClick={() => openEdit(schedule)}
                                                            className="p-1 hover:bg-[#e6fcf6] hover:text-[#00cca3] dark:hover:bg-[#00cca3]/15 text-zinc-400 dark:text-zinc-500 rounded transition-colors cursor-pointer text-[12px]"
                                                            title="Edit"
                                                        >
                                                            <i className="fa-solid fa-pen"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingSchedule(schedule)}
                                                            className="p-1 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/15 text-zinc-400 dark:text-zinc-500 rounded transition-colors cursor-pointer text-[12px]"
                                                            title="Hapus"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {isCreateOpen && (
                    <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-2xl rounded-xl shadow-lg overflow-hidden transition-all duration-200 my-1">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-calendar-days text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Tambah Jadwal</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Tentukan hari dan jam mengajar</p>
                                </div>
                                <button onClick={() => setIsCreateOpen(false)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            {assignedClasses.length === 0 ? (
                                <div className="p-8 text-center text-sm text-[#7c869c] dark:text-[#94a3b8] italic">
                                    Anda belum memiliki kelas yang ditugaskan oleh administrator.
                                </div>
                            ) : (
                                <form onSubmit={submitCreate} className="px-6 py-4 flex flex-col">
                                    {/* Grid fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                        <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Kelas</label>
                                        <div className="md:col-span-2">
                                            <select
                                                value={createForm.data.classroom_subject_teacher_id}
                                                onChange={e => createForm.setData('classroom_subject_teacher_id', e.target.value)}
                                                className="w-full py-2.5 px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-[#fbfcfe] dark:bg-[#0f172a] text-[14px] outline-none text-[#182449] dark:text-white focus:border-[#00cca3]"
                                            >
                                                {assignedClasses.map((ac) => (
                                                    <option key={ac.id} value={ac.id}>
                                                        {ac.classroom.name} - {ac.subject.name} ({ac.classroom.academic_year.year} - {ac.classroom.academic_year.semester === 'odd' ? 'Ganjil' : 'Genap'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                        <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Hari</label>
                                        <div className="md:col-span-2">
                                            <select
                                                value={createForm.data.day}
                                                onChange={e => createForm.setData('day', e.target.value)}
                                                className="w-full py-2.5 px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-[#fbfcfe] dark:bg-[#0f172a] text-[14px] outline-none text-[#182449] dark:text-white focus:border-[#00cca3]"
                                            >
                                                <option value="monday">Senin</option>
                                                <option value="tuesday">Selasa</option>
                                                <option value="wednesday">Rabu</option>
                                                <option value="thursday">Kamis</option>
                                                <option value="friday">Jumat</option>
                                                <option value="saturday">Sabtu</option>
                                                <option value="sunday">Minggu</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                        <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Jam Mulai</label>
                                        <div className="md:col-span-2">
                                            <input
                                                type="time"
                                                value={createForm.data.start_time}
                                                onChange={e => createForm.setData('start_time', e.target.value)}
                                                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                        <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Jam Selesai</label>
                                        <div className="md:col-span-2">
                                            <input
                                                type="time"
                                                value={createForm.data.end_time}
                                                onChange={e => createForm.setData('end_time', e.target.value)}
                                                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Actions footer */}
                                    <div className="flex justify-between gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-900/50 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateOpen(false)}
                                            className="h-11 px-5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createForm.processing}
                                            className="h-11 px-5 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14px] cursor-pointer transition-colors"
                                        >
                                            {createForm.processing ? 'Menambahkan...' : 'Tambah'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingSchedule && (
                    <div onClick={() => setEditingSchedule(null)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-2xl rounded-xl shadow-lg overflow-hidden transition-all duration-200 my-1">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-pen text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Jadwal</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Perbarui hari dan jam mengajar</p>
                                </div>
                                <button onClick={() => setEditingSchedule(null)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submitEdit} className="px-6 py-4 flex flex-col">
                                {/* Grid fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Kelas</label>
                                    <div className="md:col-span-2">
                                        <select
                                            value={editForm.data.classroom_subject_teacher_id}
                                            onChange={e => editForm.setData('classroom_subject_teacher_id', e.target.value)}
                                            className="w-full py-2.5 px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-[#fbfcfe] dark:bg-[#0f172a] text-[14px] outline-none text-[#182449] dark:text-white focus:border-[#00cca3]"
                                        >
                                            {assignedClasses.map((ac) => (
                                                <option key={ac.id} value={ac.id}>
                                                    {ac.classroom.name} - {ac.subject.name} ({ac.classroom.academic_year.year} - {ac.classroom.academic_year.semester === 'odd' ? 'Ganjil' : 'Genap'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Hari</label>
                                    <div className="md:col-span-2">
                                        <select
                                            value={editForm.data.day}
                                            onChange={e => editForm.setData('day', e.target.value)}
                                            className="w-full py-2.5 px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-[#fbfcfe] dark:bg-[#0f172a] text-[14px] outline-none text-[#182449] dark:text-white focus:border-[#00cca3]"
                                        >
                                            <option value="monday">Senin</option>
                                            <option value="tuesday">Selasa</option>
                                            <option value="wednesday">Rabu</option>
                                            <option value="thursday">Kamis</option>
                                            <option value="friday">Jumat</option>
                                            <option value="saturday">Sabtu</option>
                                            <option value="sunday">Minggu</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Jam Mulai</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="time"
                                            value={editForm.data.start_time}
                                            onChange={e => editForm.setData('start_time', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Jam Selesai</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="time"
                                            value={editForm.data.end_time}
                                            onChange={e => editForm.setData('end_time', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Actions footer */}
                                <div className="flex justify-between gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-900/50 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingSchedule(null)}
                                        className="h-11 px-5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="h-11 px-5 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14px] cursor-pointer transition-colors"
                                    >
                                        {editForm.processing ? 'Memperbarui...' : 'Perbarui'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {deletingSchedule && (
                    <div onClick={() => setDeletingSchedule(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                        <i className="fa-regular fa-trash-can text-lg"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Hapus Jadwal</h3>
                                </div>
                                <button onClick={() => setDeletingSchedule(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Apakah Anda yakin ingin menghapus jadwal mengajar untuk kelas{' '}
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">{deletingSchedule.classroom_subject_teacher?.classroom?.name || '-'}</span>
                                    {' '}-{' '}
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">{deletingSchedule.classroom_subject_teacher?.subject?.name || '-'}</span>
                                    {' '}pada hari{' '}
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">{mapDay(deletingSchedule.day || '')}</span>
                                    {' '}({(deletingSchedule.start_time || '').substring(0, 5)} - {(deletingSchedule.end_time || '').substring(0, 5)}) ?
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeletingSchedule(null)}
                                    className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={submitDelete}
                                    className="flex-1 h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px] cursor-pointer transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
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
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Import Jadwal Mengajar</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Upload file CSV / XLSX untuk impor massal</p>
                                </div>
                            </div>
                            <button onClick={() => setIsImportOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-[12.5px] text-zinc-500 dark:text-zinc-400 space-y-1">
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300">Format kolom:</p>
                            <p><span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Nama Kelas; Tahun Ajaran; Kode Mapel; Hari; Jam Mulai; Jam Selesai</span></p>
                            <p className="text-zinc-400 dark:text-zinc-500">Unduh template untuk contoh format yang benar.</p>
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
        </AppLayout>
    );
}
