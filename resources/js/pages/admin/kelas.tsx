import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Table, TableCard } from '@/components/application/table/table';
import admin from '@/routes/admin';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/ui/multi-select';

type AcademicPeriod = {
    id: number;
    year: string;
    semester: string;
};

type Subject = {
    id: number;
    name: string;
    code: string;
};

type UserDetail = {
    id: number;
    name: string;
    email: string;
    student_detail?: {
        nis: string;
    } | null;
    teacher_detail?: {
        nip: string;
    } | null;
};

type ClassroomStudent = {
    id: number;
    student: UserDetail;
};

type ClassroomSubjectTeacher = {
    id: number;
    subject: Subject;
    teacher: UserDetail;
};

type Classroom = {
    id: number;
    name: string;
    academic_year: AcademicPeriod;
    classroom_students: ClassroomStudent[];
    classroom_subject_teachers: ClassroomSubjectTeacher[];
};

type Props = {
    classrooms: Classroom[];
    academicYears: AcademicPeriod[];
    subjects: Subject[];
    teachers: UserDetail[];
    students: UserDetail[];
};

export default function Kelas({ classrooms, academicYears, subjects, teachers, students }: Props) {
    const [selectedClassForDetails, setSelectedClassForDetails] = useState<Classroom | null>(null);
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);
    const [unenrollStudentId, setUnenrollStudentId] = useState<number | null>(null);
    const [dismissTeacherId, setDismissTeacherId] = useState<number | null>(null);
    const [expandedClassIds, setExpandedClassIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

    const toggleExpandClass = (id: number) => {
        setExpandedClassIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const classForm = useForm({
        name: '',
        academic_year_id: academicYears[0]?.id || '',
    });

    const editClassForm = useForm({
        name: '',
        academic_year_id: '',
    });

    const enrollForm = useForm({
        classroom_id: '',
        student_ids: [] as number[],
    });

    const assignForm = useForm({
        classroom_id: '',
        subject_ids: [] as number[],
        teacher_ids: [] as number[],
    });

    const submitClassroom = (e: React.FormEvent) => {
        e.preventDefault();
        classForm.post(admin.kelas.store.url(), {
            onSuccess: () => {
                classForm.reset('name');
                setIsCreateOpen(false);
                toast.success('Kelas berhasil dibuat!');
            },
            onError: () => {
                toast.error('Gagal membuat kelas. Silakan periksa formulir.');
            }
        });
    };

    const submitEditClassroom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClassroom) return;
        editClassForm.patch(admin.kelas.update.url(editingClassroom.id), {
            onSuccess: () => {
                editClassForm.reset();
                setEditingClassroom(null);
                toast.success('Kelas berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui kelas. Silakan periksa formulir.');
            }
        });
    };

    const openEdit = (c: Classroom) => {
        setEditingClassroom(c);
        editClassForm.setData({
            name: c.name,
            academic_year_id: c.academic_year?.id.toString() || '',
        });
    };

    const submitEnroll = (e: React.FormEvent) => {
        e.preventDefault();
        enrollForm.post(admin.kelas.enroll.url(), {
            onSuccess: () => {
                enrollForm.reset('student_ids');
                toast.success('Siswa berhasil didaftarkan ke kelas!');
                // Refresh detail modal view state from fresh page props
                if (selectedClassForDetails) {
                    const freshClass = classrooms.find(c => c.id === selectedClassForDetails.id);
                    if (freshClass) setSelectedClassForDetails(freshClass);
                }
            },
            onError: () => {
                toast.error('Gagal mendaftarkan siswa.');
            }
        });
    };

    const submitAssign = (e: React.FormEvent) => {
        e.preventDefault();
        assignForm.post(admin.kelas.assignTeacher.url(), {
            onSuccess: () => {
                assignForm.reset('subject_ids', 'teacher_ids');
                toast.success('Mata pelajaran berhasil ditugaskan!');
                if (selectedClassForDetails) {
                    const freshClass = classrooms.find(c => c.id === selectedClassForDetails.id);
                    if (freshClass) setSelectedClassForDetails(freshClass);
                }
            },
            onError: () => {
                toast.error('Gagal menugaskan mata pelajaran.');
            }
        });
    };

    const openDetails = (c: Classroom) => {
        setSelectedClassForDetails(c);
        enrollForm.setData({
            classroom_id: c.id.toString(),
            student_ids: [],
        });
        assignForm.setData({
            classroom_id: c.id.toString(),
            subject_ids: [],
            teacher_ids: [],
        });
    };

    const filteredClassrooms = classrooms.filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = c.name.toLowerCase();
        const year = (c.academic_year?.year || '').toLowerCase();
        const semesterText = c.academic_year?.semester === 'odd' ? 'ganjil odd' : 'genap even';
        const enrolledText = `${c.classroom_students?.length || 0} enrolled`;

        const studentsMatch = c.classroom_students?.some(cs =>
            cs.student.name.toLowerCase().includes(q) ||
            (cs.student.student_detail?.nis || '').toLowerCase().includes(q)
        );

        const teachersMatch = c.classroom_subject_teachers?.some(cst =>
            cst.subject.name.toLowerCase().includes(q) ||
            cst.teacher.name.toLowerCase().includes(q)
        );

        return name.includes(q) ||
            year.includes(q) ||
            semesterText.includes(q) ||
            enrolledText.toLowerCase().includes(q) ||
            studentsMatch ||
            teachersMatch;
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredClassrooms.length / itemsPerPage);
    const paginatedClassrooms = filteredClassrooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleImport = async () => {
        if (!importFile) return;
        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('_token', (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '');
        try {
            const res = await fetch('/admin/kelas/import', {
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
                router.reload({ only: ['classrooms'] });
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
        }
    };



    return (
        <AppLayout>
            <Head title="Kelola Ruang Kelas" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Kelola Ruang Kelas</h1>
                        <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Atur ruang kelas dengan menambahkan siswa, mapel dan pengajar.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <a
                            href="/admin/kelas/template"
                            className="flex-1 sm:flex-none h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <i className="fa-solid fa-file-arrow-down text-[12px]"></i> Template
                        </a>
                        <button
                            onClick={() => { setIsImportOpen(true); setImportFile(null); setImportResult(null); }}
                            className="flex-1 sm:flex-none h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <i className="fa-solid fa-file-import text-[12px]"></i> Import
                        </button>
                        <a
                            href="/admin/kelas/export"
                            className="flex-1 sm:flex-none h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <i className="fa-solid fa-file-export text-[12px]"></i> Export
                        </a>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex-1 sm:flex-none h-9 px-4 rounded-[10px] bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <i className="fa-solid fa-plus text-[11px]"></i> Tambah Kelas
                        </button>
                    </div>
                </div>

                {/* Full Width Table: Classrooms List */}
                <TableCard.Root>
                    <TableCard.Header
                        title="Daftar Kelas"
                        badge={`${filteredClassrooms.length} kelas`}
                        contentTrailing={
                            <div className="relative w-full sm:max-w-[240px]">
                                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search"
                                    className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                />
                            </div>
                        }
                    />
                    <Table aria-label="Classrooms list">
                        <Table.Header>
                            <Table.Head id="expand" className="w-[50px]" label="" />
                            <Table.Head id="name" label="Kelas" />
                            <Table.Head id="period" label="Periode" />
                            <Table.Head id="students" label="Jumlah" />
                            <Table.Head id="actions" className="text-center" label="Aksi" />
                        </Table.Header>

                        <Table.Body items={paginatedClassrooms}>
                            {(c) => {
                                const isExpanded = expandedClassIds.includes(c.id);
                                return (
                                    <React.Fragment key={c.id}>
                                        <Table.Row id={c.id}>
                                            <Table.Cell>
                                                <button
                                                    onClick={() => toggleExpandClass(c.id)}
                                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                                                    title={isExpanded ? "Collapse" : "Expand"}
                                                >
                                                    <i className={`fa-solid fa-chevron-down transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                            </Table.Cell>
                                            <Table.Cell className="font-semibold text-[#182449] dark:text-white">
                                                {c.name}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {c.academic_year?.year} ({(c.academic_year?.semester === 'odd' ? 'Ganjil' : 'Genap')})
                                            </Table.Cell>
                                            <Table.Cell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                                                    {c.classroom_students?.length} siswa
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell className="text-center whitespace-nowrap">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => openDetails(c)}
                                                        className="p-1.5 text-zinc-400 hover:text-[#00cca3] transition-colors cursor-pointer"
                                                        title="Setup & Details"
                                                    >
                                                        <i className="fa-solid fa-sliders text-sm"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(c)}
                                                        className="p-1.5 text-zinc-400 hover:text-[#00cca3] transition-colors cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <i className="fa-solid fa-pen text-sm"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingClassroom(c)}
                                                        className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <i className="fa-solid fa-trash text-sm"></i>
                                                    </button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                        {isExpanded && (
                                            <tr className="bg-zinc-50/20 dark:bg-zinc-950/10 border-b border-zinc-150 dark:border-zinc-800">
                                                <td colSpan={5} className="py-4 px-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
                                                        {/* Left Side: Enrolled Students List */}
                                                        <div>
                                                            <h4 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center justify-between">
                                                                <span>Data Siswa ({c.classroom_students?.length || 0})</span>
                                                            </h4>
                                                            <div className="max-h-60 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-[#0c101b]">
                                                                {c.classroom_students?.length === 0 ? (
                                                                    <div className="p-4 text-center text-[13px] text-zinc-400">Belum ada siswa.</div>
                                                                ) : (
                                                                    c.classroom_students.map(cs => (
                                                                        <div key={cs.id} className="p-3 text-[13.5px] text-zinc-700 dark:text-zinc-300 flex justify-between items-center bg-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                                                                            <div>
                                                                                <div className="font-medium text-zinc-900 dark:text-zinc-50">{cs.student.name}</div>
                                                                                <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400 font-medium">NIS: {cs.student.student_detail?.nis || '-'}</div>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => setUnenrollStudentId(cs.id)}
                                                                                className="p-1.5 text-zinc-400 hover:text-red-650 dark:hover:text-red-400 transition-colors cursor-pointer"
                                                                                title="Hapus"
                                                                            >
                                                                                <i className="fa-regular fa-trash-can text-sm"></i>
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Right Side: Course Assignments List */}
                                                        <div>
                                                            <h4 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200 mb-3">
                                                                Data Mapel dan Pengajar ({c.classroom_subject_teachers?.length || 0})
                                                            </h4>
                                                            <div className="max-h-60 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-[#0c101b]">
                                                                {c.classroom_subject_teachers?.length === 0 ? (
                                                                    <div className="p-4 text-center text-[13px] text-zinc-400">Belum ada Mapel dan Pengajar.</div>
                                                                ) : (
                                                                    c.classroom_subject_teachers.map(cst => (
                                                                        <div key={cst.id} className="p-3 text-[13.5px] text-zinc-700 dark:text-zinc-300 flex justify-between items-center bg-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                                                                            <div>
                                                                                <div className="font-semibold text-zinc-900 dark:text-zinc-50">{cst.subject.name}</div>
                                                                                <div className="text-[12px] text-zinc-500 dark:text-zinc-400">Pengajar: {cst.teacher.name}</div>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => setDismissTeacherId(cst.id)}
                                                                                className="p-1.5 text-zinc-400 hover:text-red-655 dark:hover:text-red-400 transition-colors cursor-pointer"
                                                                                title="Hapus"
                                                                            >
                                                                                <i className="fa-regular fa-trash-can text-sm"></i>
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            }}
                        </Table.Body>
                    </Table>
                    <TableCard.Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </TableCard.Root>

                {/* Create Classroom Modal */}
                {isCreateOpen && (
                    <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-2xl rounded-xl shadow-lg overflow-hidden transition-all duration-200 my-1">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-school text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Tambah Kelas</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Tambahkan kelas, siswa, mapel dan pengajar</p>
                                </div>
                                <button onClick={() => setIsCreateOpen(false)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submitClassroom} className="px-6 py-4 flex flex-col">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Nama Kelas</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={classForm.data.name}
                                            onChange={e => classForm.setData('name', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: 8A"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Tahun Ajaran</label>
                                    <div className="md:col-span-2">
                                        <select
                                            value={classForm.data.academic_year_id}
                                            onChange={e => classForm.setData('academic_year_id', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white dark:bg-[#0c101b]"
                                        >
                                            {academicYears.map(ay => (
                                                <option key={ay.id} value={ay.id}>
                                                    {ay.year} - {ay.semester === 'odd' ? 'Ganjil' : 'Genap'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

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
                                        disabled={classForm.processing}
                                        className="h-11 px-5 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14px] cursor-pointer transition-colors"
                                    >
                                        {classForm.processing ? 'Menambahkan...' : 'Tambah'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Classroom Modal */}
                {editingClassroom && (
                    <div onClick={() => setEditingClassroom(null)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-2xl rounded-xl shadow-lg overflow-hidden transition-all duration-200 my-1">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-pen text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Kelas</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Perbarui kelas, siswa, mapel dan pengajar</p>
                                </div>
                                <button onClick={() => setEditingClassroom(null)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submitEditClassroom} className="px-6 py-4 flex flex-col">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Nama Kelas</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={editClassForm.data.name}
                                            onChange={e => editClassForm.setData('name', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="e.g. Class 10-A"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Tahun Ajaran</label>
                                    <div className="md:col-span-2">
                                        <select
                                            value={editClassForm.data.academic_year_id}
                                            onChange={e => editClassForm.setData('academic_year_id', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white dark:bg-[#0c101b]"
                                        >
                                            {academicYears.map(ay => (
                                                <option key={ay.id} value={ay.id}>
                                                    {ay.year} - {ay.semester === 'odd' ? 'Ganjil' : 'Genap'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-900/50 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingClassroom(null)}
                                        className="h-11 px-5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editClassForm.processing}
                                        className="h-11 px-5 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14px] cursor-pointer transition-colors"
                                    >
                                        {editClassForm.processing ? 'Memperbarui...' : 'Perbarui'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Details / Management Modal */}
                {selectedClassForDetails && (
                    <div onClick={() => setSelectedClassForDetails(null)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-4xl rounded-xl shadow-lg overflow-hidden transition-all duration-200 my-1">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-sliders text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-poppins">Detail Kelas {selectedClassForDetails.name}</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Tahun Ajaran: {selectedClassForDetails.academic_year?.year} - {selectedClassForDetails.academic_year?.semester === 'odd' ? 'Ganjil' : 'Genap'}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedClassForDetails(null)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                                {/* Left Side: Enroll Student Form */}
                                <div className="space-y-4">
                                    <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                                        <h4 className="text-[15px] font-bold text-zinc-850 dark:text-zinc-200 mb-3.5 flex items-center justify-between">
                                            <span>Tambahkan Siswa</span>
                                        </h4>
                                        <form onSubmit={submitEnroll} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <MultiSelect
                                                    options={students
                                                        .filter(s => !selectedClassForDetails.classroom_students.some(cs => cs.student.id === s.id))
                                                        .map(s => ({
                                                            id: s.id,
                                                            name: s.name,
                                                            description: s.student_detail?.nis ? `(NIS: ${s.student_detail.nis})` : ''
                                                        }))
                                                    }
                                                    selectedValues={enrollForm.data.student_ids}
                                                    onChange={vals => enrollForm.setData('student_ids', vals)}
                                                    placeholder="Pilih Siswa"
                                                    label="siswa"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={enrollForm.processing || enrollForm.data.student_ids.length === 0}
                                                className="w-full h-11 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14px] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {enrollForm.processing ? 'Menambahkan...' : 'Tambah'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Right Side: Assign Subject & Teacher Form */}
                                <div className="space-y-4">
                                    <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                                        <h4 className="text-[15px] font-bold text-zinc-850 dark:text-zinc-200 mb-3.5">Tambahkan Mapel dan Pengajar</h4>
                                        <form onSubmit={submitAssign} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <MultiSelect
                                                    options={subjects.map(sub => ({
                                                        id: sub.id,
                                                        name: sub.name,
                                                        description: sub.code
                                                    }))}
                                                    selectedValues={assignForm.data.subject_ids}
                                                    onChange={vals => assignForm.setData('subject_ids', vals)}
                                                    placeholder="Pilih Mapel"
                                                    label="mapel"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <MultiSelect
                                                    options={teachers.map(t => ({
                                                        id: t.id,
                                                        name: t.name,
                                                        description: t.teacher_detail?.nip ? `(NIP: ${t.teacher_detail.nip})` : ''
                                                    }))}
                                                    selectedValues={assignForm.data.teacher_ids}
                                                    onChange={vals => assignForm.setData('teacher_ids', vals)}
                                                    placeholder="Pilih Guru"
                                                    label="guru"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={assignForm.processing || assignForm.data.subject_ids.length === 0 || assignForm.data.teacher_ids.length === 0}
                                                className="w-full h-11 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14px] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {assignForm.processing ? 'Menambahkan...' : 'Tambah'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deletingClassroom && (
                    <div onClick={() => setDeletingClassroom(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                        <i className="fa-regular fa-trash-can text-lg"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Hapus Kelas</h3>
                                </div>
                                <button onClick={() => setDeletingClassroom(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Apakah Anda yakin ingin menghapus kelas <span className="font-semibold text-zinc-900 dark:text-zinc-50">{deletingClassroom.name}</span> ? Semua data siswa yang terdaftar dan mata pelajaran di kelas ini akan dihapus.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeletingClassroom(null)}
                                    className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        router.delete(admin.kelas.destroy.url(deletingClassroom.id), {
                                            onSuccess: () => {
                                                setDeletingClassroom(null);
                                                toast.success('Kelas berhasil dihapus!');
                                            },
                                            onError: () => {
                                                toast.error('Gagal menghapus kelas.');
                                            }
                                        });
                                    }}
                                    className="flex-1 h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px] cursor-pointer transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Unenroll Student Confirmation Modal */}
                {unenrollStudentId && (
                    <div onClick={() => setUnenrollStudentId(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                        <i className="fa-regular fa-trash-can text-lg"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Keluarkan Siswa</h3>
                                </div>
                                <button onClick={() => setUnenrollStudentId(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Apakah Anda yakin ingin mengeluarkan siswa ini dari kelas? Tindakan ini akan menghapus seluruh data kehadiran dan nilai rapor siswa di kelas ini.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setUnenrollStudentId(null)}
                                    className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        router.delete(admin.kelas.unenroll.url(unenrollStudentId), {
                                            onSuccess: () => {
                                                setUnenrollStudentId(null);
                                                toast.success('Siswa berhasil dikeluarkan dari kelas!');
                                                if (selectedClassForDetails) {
                                                    const freshClass = classrooms.find(c => c.id === selectedClassForDetails.id);
                                                    if (freshClass) setSelectedClassForDetails(freshClass);
                                                }
                                            },
                                            onError: () => {
                                                toast.error('Gagal mengeluarkan siswa dari kelas.');
                                            }
                                        });
                                    }}
                                    className="flex-1 h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px] cursor-pointer transition-colors"
                                >
                                    Keluarkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dismiss Teacher Assignment Confirmation Modal */}
                {dismissTeacherId && (
                    <div onClick={() => setDismissTeacherId(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                        <i className="fa-regular fa-trash-can text-lg"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Hapus Pelajaran Kelas</h3>
                                </div>
                                <button onClick={() => setDismissTeacherId(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Apakah Anda yakin ingin menghapus konfigurasi mata pelajaran dan pengajar ini? Tindakan ini akan menghapus seluruh data jadwal pelajaran, presensi siswa, dan nilai rapor terkait.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDismissTeacherId(null)}
                                    className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        router.delete(admin.kelas.dismissTeacher.url(dismissTeacherId), {
                                            onSuccess: () => {
                                                setDismissTeacherId(null);
                                                toast.success('Penugasan pelajaran berhasil dihapus!');
                                                if (selectedClassForDetails) {
                                                    const freshClass = classrooms.find(c => c.id === selectedClassForDetails.id);
                                                    if (freshClass) setSelectedClassForDetails(freshClass);
                                                }
                                            },
                                            onError: () => {
                                                toast.error('Gagal menghapus penugasan pelajaran.');
                                            }
                                        });
                                    }}
                                    className="flex-1 h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px] cursor-pointer transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isImportOpen && (
                <div onClick={() => setIsImportOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-5 shadow-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-file-import text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Import Data Kelas</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Upload file CSV / XLSX untuk impor massal</p>
                                </div>
                            </div>
                            <button onClick={() => setIsImportOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-[12px] text-zinc-500 dark:text-zinc-400 space-y-1">
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300">Format kolom:</p>
                            <p className="font-mono bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded text-[11px] leading-relaxed">
                                Kolom A: Nama Kelas<br />
                                Kolom B: Kode Tahun Ajaran<br />
                                Kolom C: (Kosong)<br />
                                Kolom D: NIS (Siswa)<br />
                                Kolom E: (Kosong)<br />
                                Kolom F: Kode Mapel<br />
                                Kolom G: NIP (Guru)
                            </p>
                            <p className="text-[11px] text-zinc-450 dark:text-zinc-550 pt-1">Unduh template untuk melihat contoh format yang benar.</p>
                        </div>

                        <div>
                            <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">File CSV / XLSX</label>
                            <input
                                type="file"
                                accept=".csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
                                onChange={(e) => { setImportFile(e.target.files?.[0] || null); }}
                                className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e6fcf6] file:text-[#00cca3] dark:file:bg-[#00cca3]/10 dark:file:text-[#00cca3] hover:file:bg-[#00cca3]/15 dark:hover:file:bg-[#00cca3]/20 cursor-pointer"
                            />
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => setIsImportOpen(false)}
                                className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!importFile || isImporting}
                                className="flex-1 h-11 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14px] cursor-pointer transition-colors"
                            >
                                {isImporting ? 'Mengimpor...' : 'Import'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
