import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import type { User } from '@/types';

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
    classroom_students: { id: number; student: { id: number; name: string } }[];
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
        classroom: { name: string };
        subject: { name: string };
    };
};

type Attendance = {
    id: number;
    classroom_student_id: number;
    classroom_subject_teacher_id: number;
    date: string;
    status: string;
    classroom_student: {
        student: { name: string };
    };
};

type ReportCard = {
    id: number;
    classroom_student_id: number;
    classroom_subject_teacher_id: number;
    score: number;
    grade: string;
    notes: string;
    classroom_student: {
        student: { id: number; name: string };
    };
};

type Props = {
    assignedClasses: AssignedClass[];
    schedules: Schedule[];
    attendances: Attendance[];
    reportCards: ReportCard[];
    activeAcademicYear: AcademicYear | null;
};
export default function GuruDashboard({ assignedClasses = [], schedules = [], attendances = [], reportCards = [], activeAcademicYear = null }: Props) {
    const { auth } = usePage().props as unknown as { auth: { user: User } };
    const user = auth?.user;

    // Calculate dynamic stats
    const totalClasses = assignedClasses.length;
    const totalSchedules = schedules.length;
    
    // Count total unique students across all assigned classes
    const studentIds = new Set<number>();
    assignedClasses.forEach(ac => {
        ac.classroom.classroom_students.forEach(cs => {
            if (cs.student) {
                studentIds.add(cs.student.id);
            }
        });
    });
    const totalStudents = studentIds.size;

    const totalGraded = reportCards.length;

    const classAverages = assignedClasses.map(ac => {
        const classReports = reportCards.filter(rc => rc.classroom_subject_teacher_id === ac.id);
        const totalScores = classReports.reduce((sum, rc) => sum + rc.score, 0);
        const studentCount = classReports.length;
        const average = studentCount > 0 ? Math.round((totalScores / studentCount) * 10) / 10 : 0;
        
        return {
            id: ac.id,
            className: ac.classroom.name,
            subjectName: ac.subject.name,
            average,
            studentCount,
        };
    });

    // Group schedules by day for a cleaner schedule overview
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const daysIndonesian: Record<string, string> = {
        monday: 'Senin',
        tuesday: 'Selasa',
        wednesday: 'Rabu',
        thursday: 'Kamis',
        friday: 'Jumat',
        saturday: 'Sabtu',
        sunday: 'Minggu'
    };

    const getDayNameIndonesian = (dayStr: string) => {
        return daysIndonesian[dayStr.toLowerCase()] || dayStr;
    };

    const sortedSchedules = [...schedules].sort((a, b) => {
        const dayA = daysOrder.indexOf(a.day.toLowerCase());
        const dayB = daysOrder.indexOf(b.day.toLowerCase());
        if (dayA !== dayB) return dayA - dayB;
        return a.start_time.localeCompare(b.start_time);
    });

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

    return (
        <AppLayout>
            <Head title="Dashboard Guru" />

            <div className="space-y-6">
                    {/* Modern Welcoming Hero Banner */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2.5 z-10">
                            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6fcf6] dark:bg-[#00cca3]/15 text-[#00cca3] text-xs font-bold font-poppins">
                                <i className="fa-regular fa-calendar-days text-[11px]"></i>
                                {activeAcademicYear
                                    ? `TA ${activeAcademicYear.year} - ${activeAcademicYear.semester === 'odd' ? 'Ganjil' : 'Genap'}`
                                    : 'Belum ada tahun ajaran aktif'
                                }
                            </div> */}
                            <h1 className="text-2xl md:text-3xl font-extrabold text-[#182449] dark:text-white font-poppins tracking-tight">
                                Selamat Datang Kembali, <span className="text-[#00cca3]">{user?.name}</span>
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                                Kelola jadwal kelas, rekap absensi harian, dan penilaian rapot siswa.
                            </p>
                        </div>

                        {/* Right side shortcuts */}
                        <div className="flex flex-col gap-3 z-10 shrink-0 w-full md:w-auto">
                            <Link
                                href="/guru/absensi"
                                className="h-11 px-5 rounded-xl bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[13.5px] cursor-pointer transition-colors flex items-center justify-center gap-2 w-full md:w-48"
                            >
                                <i className="fa-solid fa-clipboard-user text-[13px]"></i>
                                <span>Absen Siswa</span>
                            </Link>
                            <Link
                                href="/guru/penilaian"
                                className="h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-[#182449] dark:text-zinc-200 font-semibold text-[13.5px] cursor-pointer transition-colors flex items-center justify-center gap-2 w-full md:w-48"
                            >
                                <i className="fa-solid fa-award text-[13px]"></i>
                                <span>Input Nilai</span>
                            </Link>
                        </div>
                    </div>

                    {/* Minimalist Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Stat 1 */}
                        <div className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-[#00cca3] flex items-center justify-center shrink-0 text-xl">
                                <i className="fa-solid fa-school"></i>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-poppins">Kelas Diajar</span>
                                <span className="text-2xl font-black text-[#182449] dark:text-white font-mono mt-0.5 block">{totalClasses}</span>
                            </div>
                        </div>

                        {/* Stat 2 */}
                        <div className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0 text-xl">
                                <i className="fa-solid fa-calendar-week"></i>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-poppins">Jadwal</span>
                                <span className="text-2xl font-black text-[#182449] dark:text-white font-mono mt-0.5 block">{totalSchedules}</span>
                            </div>
                        </div>

                        {/* Stat 3 */}
                        <div className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center shrink-0 text-xl">
                                <i className="fa-solid fa-user-graduate"></i>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-poppins">Total Siswa</span>
                                <span className="text-2xl font-black text-[#182449] dark:text-white font-mono mt-0.5 block">{totalStudents}</span>
                            </div>
                        </div>

                        {/* Stat 4 */}
                        <div className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0 text-xl">
                                <i className="fa-solid fa-medal"></i>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-poppins">Siswa Dinilai</span>
                                <span className="text-2xl font-black text-[#182449] dark:text-white font-mono mt-0.5 block">{totalGraded}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Dashboard Layout Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Weekly Agenda & schedules */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                                    <div>
                                        <h3 className="text-md font-bold text-[#182449] dark:text-zinc-100 font-poppins">Jadwal Mengajar</h3>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Daftar jadwal mengajar anda.</p>
                                    </div>
                                    <Link
                                        href="/guru/penjadwalan"
                                        className="text-xs font-semibold text-[#00cca3] hover:text-[#00b38f] transition-colors"
                                    >
                                        Kelola Jadwal →
                                    </Link>
                                </div>

                                {sortedSchedules.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 italic text-sm">
                                        Belum ada jadwal mengajar yang ditambahkan.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                        {sortedSchedules.map((s) => (
                                            <div key={s.id} className="p-5 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-[#182449] dark:text-zinc-100 font-poppins">
                                                            Kelas {s.classroom_subject_teacher.classroom.name}
                                                        </span>
                                                        <span className="px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded">
                                                            {s.classroom_subject_teacher.subject.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                        <i className="fa-solid fa-clock text-[10.5px]"></i>
                                                        <span className="font-mono">{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-center">
                                                    <span className="inline-block text-xs font-bold text-[#00cca3] bg-[#e6fcf6] dark:bg-[#00cca3]/15 px-3 py-1 rounded-full font-poppins">
                                                        {getDayNameIndonesian(s.day)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Class Average Scores Chart */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50">
                                    <div>
                                        <h3 className="text-md font-bold text-[#182449] dark:text-zinc-100 font-poppins">Rata-rata Nilai Kelas</h3>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Rata-rata nilai rapor per kelas & mapel.</p>
                                    </div>
                                </div>

                                <div className="p-5 space-y-6">
                                    {classAverages.length === 0 ? (
                                        <div className="text-center text-zinc-400 dark:text-zinc-500 italic text-sm py-4">
                                            Belum ada data nilai rapor untuk kelas yang diampu.
                                        </div>
                                    ) : (
                                        classAverages.map((ca) => (
                                            <div key={ca.id} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <span className="text-xs font-bold text-[#182449] dark:text-zinc-100 font-poppins">
                                                            Kelas {ca.className}
                                                        </span>
                                                        <span className="ml-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                                                            ({ca.subjectName})
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-bold text-[#00cca3] font-mono bg-[#e6fcf6] dark:bg-[#00cca3]/10 px-2 py-0.5 rounded">
                                                        {ca.average}
                                                    </span>
                                                </div>
                                                
                                                {/* Bar Chart Indicator */}
                                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900/60 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#00cca3] rounded-full transition-all duration-500"
                                                        style={{ width: `${ca.average}%` }}
                                                    />
                                                </div>

                                                {/* Detailed Caption */}
                                                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                                                    <i className="fa-solid fa-circle-info text-[10px] text-zinc-400"></i>
                                                    <span>Rata-rata {ca.average} dari {ca.studentCount} siswa</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </AppLayout>
    );
}
