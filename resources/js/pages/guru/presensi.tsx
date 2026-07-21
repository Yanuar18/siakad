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

type Student = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
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

type Props = {
    assignedClasses: AssignedClass[];
    selectedClassId: number | null;
    selectedDate: string;
    students: ClassroomStudent[];
    attendances: Record<number, Attendance>;
};

export default function Absensi({ assignedClasses, selectedClassId, selectedDate, students, attendances }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

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
                toast.success('Absensi siswa berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan absensi.');
            }
        });
    };

    // Client-side student filtering by name
    const filteredStudents = students.filter(cs => {
        if (!searchQuery) return true;
        return cs.student?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const activeClass = assignedClasses.find(ac => ac.id === selectedClassId);

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            present: 'Hadir',
            sick: 'Sakit',
            permission: 'Izin',
            absent: 'Alpa'
        };
        return labels[status] || status;
    };

    return (
        <AppLayout>
            <Head title="Presensi Siswa" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Presensi Siswa</h1>
                    <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Kelola daftar kehadiran harian siswa di kelas Anda.</p>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm">
                    <div>
                        <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 mb-2 font-poppins">Kelas & Mata Pelajaran</label>
                        <select
                            value={selectedClassId || ''}
                            onChange={e => handleClassChange(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-[#fbfcfe] dark:bg-[#0f172a] text-[13.5px] outline-none text-[#182449] dark:text-white focus:border-[#00cca3]"
                        >
                            {assignedClasses.length === 0 ? (
                                <option value="">Tidak ada kelas ditugaskan</option>
                            ) : (
                                assignedClasses.map((ac) => (
                                    <option key={ac.id} value={ac.id}>
                                        {ac.classroom.name} - {ac.subject.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 mb-2 font-poppins">Tanggal Presensi</label>
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
                                placeholder="Cari nama siswa..."
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
                                    <div className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium">
                                        Tanggal: <span className="font-semibold text-zinc-800 dark:text-white">{selectedDate}</span>
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
                                        <Table.Head id="student" label="Nama Siswa" />
                                        <Table.Head id="email" label="Email" />
                                        <Table.Head id="status" label="Status Kehadiran" className="text-center" />
                                    </Table.Header>

                                    <Table.Body items={filteredStudents}>
                                        {(cs, index) => {
                                            const activeStatus = data.attendances[cs.id] || 'present';
                                            return (
                                                <Table.Row id={cs.id}>
                                                    <Table.Cell className="text-center text-zinc-500 font-medium">
                                                        {(index ?? 0) + 1}
                                                    </Table.Cell>
                                                    <Table.Cell className="font-semibold text-[#182449] dark:text-white">
                                                        {cs.student?.name}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-zinc-500 dark:text-zinc-400 font-mono text-[12.5px]">
                                                        {cs.student?.email}
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
                                        {processing ? 'Menyimpan...' : 'Simpan Absensi'}
                                    </button>
                                </div>
                            )}
                        </TableCard.Root>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
