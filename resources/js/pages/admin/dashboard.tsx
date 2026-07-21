import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Table, TableCard } from '@/components/application/table/table';
import { toast } from 'sonner';

type UserDetail = {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar_url?: string | null;
    student_detail?: { nis: string } | null;
    teacher_detail?: { nip: string } | null;
};

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
    classroom_students: { student: UserDetail }[];
    classroom_subject_teachers: { subject: Subject; teacher: UserDetail }[];
};

type Props = {
    users: UserDetail[];
    subjects: Subject[];
    academicYears: AcademicYear[];
    classrooms: Classroom[];
};

export default function AdminDashboard({ users, subjects, academicYears, classrooms }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<UserDetail | null>(null);
    const [deletingAdmin, setDeletingAdmin] = useState<UserDetail | null>(null);

    // Calculate statistics
    const totalStudents = users.filter((u) => u.role === 'student').length;
    const totalTeachers = users.filter((u) => u.role === 'teacher').length;
    const totalSubjects = subjects.length;
    const totalClassrooms = classrooms.length;

    // Get active period
    const activePeriod = academicYears.find((ay) => ay.is_active) || academicYears[0];

    // Filter Top 3 Classrooms by enrollment count descending
    const topClassrooms = [...classrooms]
        .sort((a, b) => (b.classroom_students?.length || 0) - (a.classroom_students?.length || 0))
        .slice(0, 3);

    // Filter Recent 3 Admins (latest created admins)
    const recentAdmins = [...users]
        .filter((u) => u.role === 'admin')
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);

    // Forms
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        avatar: null as File | null,
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        avatar: null as File | null,
        _method: 'PATCH',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/profile/admins', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
                toast.success('Pengguna admin berhasil didaftarkan!');
            },
            onError: (errs) => {
                toast.error(errs.error || 'Gagal mendaftarkan admin. Silakan periksa formulir.');
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAdmin) return;
        editForm.post(`/admin/profile/admins/${editingAdmin.id}`, {
            onSuccess: () => {
                editForm.reset();
                setEditingAdmin(null);
                toast.success('Profil admin berhasil diperbarui!');
            },
            onError: (errs) => {
                toast.error(errs.error || 'Gagal memperbarui profil admin. Silakan periksa formulir.');
            }
        });
    };

    const openEdit = (adminUser: UserDetail) => {
        setEditingAdmin(adminUser);
        editForm.setData({
            name: adminUser.name,
            email: adminUser.email,
            password: '',
            avatar: null,
            _method: 'PATCH',
        });
    };

    return (
        <AppLayout>
            <Head title="Dashboard Admin" />

            <div className="space-y-8">
                {/* Header Welcome Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                    <div>
                        <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Dashboard Admin</h1>
                        <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Selamat datang di dashboard admin Octagram.</p>
                    </div>

                    {activePeriod && (
                        <div className="flex items-center gap-3.5 px-4.5 py-3 rounded-xl bg-[#e6fcf6] dark:bg-[#00cca3]/10 border border-[#bfeee5] dark:border-[#00cca3]/20 w-full md:w-auto">
                            <div className="w-10 h-10 rounded-lg bg-[#00cca3] flex items-center justify-center text-white text-lg">
                                <i className="fa-solid fa-calendar-days"></i>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-[#00b38f] dark:text-[#00cca3] tracking-wide uppercase">Tahun Ajaran</div>
                                <div className="text-[14.5px] font-bold text-[#182449] dark:text-white">
                                    {activePeriod.year} - <span className="capitalize">{activePeriod.semester === 'odd' ? 'Ganjil' : 'Genap'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Metrics Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Students Card */}
                    <Link
                        href="/admin/siswa"
                        className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-[#00cca3] dark:hover:border-[#00cca3] hover:-translate-y-1 hover:shadow-sm transition-all duration-200 flex items-center justify-between group"
                    >
                        <div className="space-y-2.5">
                            <div className="text-[13px] font-semibold text-[#7c869c] dark:text-[#94a3b8]">Total Siswa</div>
                            <div className="text-3xl font-extrabold text-[#182449] dark:text-white font-poppins">{totalStudents}</div>
                            <div className="text-[12px] font-medium text-[#00b38f] dark:text-[#00cca3] flex items-center gap-1.5">
                                Kelola Siswa <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center text-xl shrink-0">
                            <i className="fa-solid fa-user-graduate"></i>
                        </div>
                    </Link>

                    {/* Teachers Card */}
                    <Link
                        href="/admin/guru"
                        className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-[#00cca3] dark:hover:border-[#00cca3] hover:-translate-y-1 hover:shadow-sm transition-all duration-200 flex items-center justify-between group"
                    >
                        <div className="space-y-2.5">
                            <div className="text-[13px] font-semibold text-[#7c869c] dark:text-[#94a3b8]">Total Guru</div>
                            <div className="text-3xl font-extrabold text-[#182449] dark:text-white font-poppins">{totalTeachers}</div>
                            <div className="text-[12px] font-medium text-[#00b38f] dark:text-[#00cca3] flex items-center gap-1.5">
                                Kelola Guru <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0">
                            <i className="fa-solid fa-chalkboard-user"></i>
                        </div>
                    </Link>

                    {/* Classrooms Card */}
                    <Link
                        href="/admin/kelas"
                        className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-[#00cca3] dark:hover:border-[#00cca3] hover:-translate-y-1 hover:shadow-sm transition-all duration-200 flex items-center justify-between group"
                    >
                        <div className="space-y-2.5">
                            <div className="text-[13px] font-semibold text-[#7c869c] dark:text-[#94a3b8]">Total Kelas</div>
                            <div className="text-3xl font-extrabold text-[#182449] dark:text-white font-poppins">{totalClassrooms}</div>
                            <div className="text-[12px] font-medium text-[#00b38f] dark:text-[#00cca3] flex items-center gap-1.5">
                                Kelola Kelas <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
                            <i className="fa-solid fa-school"></i>
                        </div>
                    </Link>

                    {/* Subjects Card */}
                    <Link
                        href="/admin/mapel"
                        className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-[#00cca3] dark:hover:border-[#00cca3] hover:-translate-y-1 hover:shadow-sm transition-all duration-200 flex items-center justify-between group"
                    >
                        <div className="space-y-2.5">
                            <div className="text-[13px] font-semibold text-[#7c869c] dark:text-[#94a3b8]">Total Mata Pelajaran</div>
                            <div className="text-3xl font-extrabold text-[#182449] dark:text-white font-poppins">{totalSubjects}</div>
                            <div className="text-[12px] font-medium text-[#00b38f] dark:text-[#00cca3] flex items-center gap-1.5">
                                Kelola Mapel <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
                            <i className="fa-solid fa-book"></i>
                        </div>
                    </Link>
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Enrolled Classrooms */}
                    <TableCard.Root>
                        <TableCard.Header title="Kelas dengan Siswa Terbanyak" />
                        <Table aria-label="Top classrooms">
                            <Table.Header>
                                <Table.Head id="name" label="Kelas" />
                                <Table.Head id="period" label="Tahun Ajaran" />
                                <Table.Head id="students" label="Jumlah" />
                            </Table.Header>
                            <Table.Body items={topClassrooms}>
                                {(c) => (
                                    <Table.Row id={c.id}>
                                        <Table.Cell className="font-bold text-[#182449] dark:text-white">
                                            {c.name}
                                        </Table.Cell>
                                        <Table.Cell className="text-zinc-600 dark:text-zinc-400">
                                            {c.academic_year?.year} ({c.academic_year?.semester === 'odd' ? 'Ganjil' : 'Genap'})
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6fcf6] text-[#00b38f] dark:bg-[#00cca3]/10 dark:text-[#00cca3] border border-[#bfeee5] dark:border-[#00cca3]/20">
                                                {c.classroom_students?.length || 0} siswa
                                            </span>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                    </TableCard.Root>

                    {/* Recent Admins Accounts */}
                    <TableCard.Root>
                        <TableCard.Header
                            title="Data Admin"
                            contentTrailing={
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="w-full sm:w-auto h-8.5 px-3 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <i className="fa-solid fa-plus text-[11px]" /> Tambah Admin
                                </button>
                            }
                        />
                        <Table aria-label="Recent admin users">
                            <Table.Header>
                                <Table.Head id="name" label="Nama & Email" />
                                <Table.Head id="role" label="Peran" />
                                <Table.Head id="actions" className="text-center" label="Aksi" />
                            </Table.Header>
                            <Table.Body items={recentAdmins}>
                                {(u) => (
                                    <Table.Row id={u.id}>
                                        <Table.Cell className="font-semibold text-[#182449] dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={u.avatar_url || 'https://i.pravatar.cc/120?img=47'}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                                                />
                                                <div className="flex flex-col">
                                                    <span>{u.name}</span>
                                                    <span className="text-[11px] text-zinc-450 dark:text-zinc-500 font-normal">{u.email}</span>
                                                </div>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                                                {u.role}
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell className="text-center whitespace-nowrap">
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="p-1.5 text-zinc-400 hover:text-[#00cca3] transition-colors cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <i className="fa-solid fa-pen text-xs"></i>
                                                </button>
                                                <button
                                                    onClick={() => setDeletingAdmin(u)}
                                                    className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                    </TableCard.Root>
                </div>
            </div>

            {/* Create Admin Modal */}
            {isCreateOpen && (
                <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-lg rounded-xl shadow-lg overflow-hidden my-1">
                        <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                            <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                <i className="fa-solid fa-user-gear text-lg"></i>
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Tambah Admin</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Daftarkan administrator baru</p>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="px-6 py-4 flex flex-col">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap</label>
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                        placeholder="Contoh: Yanuar Riziq"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Foto Profil</label>
                                <div className="md:col-span-2">
                                    <input
                                        type="file"
                                        onChange={(e) => createForm.setData('avatar', e.target.files?.[0] || null)}
                                        className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e6fcf6] file:text-[#00cca3] dark:file:bg-[#00cca3]/10 dark:file:text-[#00cca3] hover:file:bg-[#00cca3]/15 dark:hover:file:bg-[#00cca3]/20 cursor-pointer"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Email</label>
                                <div className="md:col-span-2">
                                    <input
                                        type="email"
                                        required
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                        placeholder="Contoh: admin@gmail.com"
                                    />
                                    {createForm.errors.email && <div className="text-red-500 text-[13px] mt-1">{createForm.errors.email}</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi</label>
                                <div className="md:col-span-2">
                                    <input
                                        type="password"
                                        required
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                        placeholder="Minimal 6 karakter"
                                    />
                                    {createForm.errors.password && <div className="text-red-500 text-[13px] mt-1">{createForm.errors.password}</div>}
                                </div>
                            </div>

                            <div className="flex justify-between gap-3 pt-6 border-t border-zinc-150 dark:border-zinc-800/80 mt-4">
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
                    </div>
                </div>
            )}

            {/* Edit Admin Modal */}
            {editingAdmin && (
                <div onClick={() => setEditingAdmin(null)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-lg rounded-xl shadow-lg overflow-hidden my-1">
                        <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                            <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-550 dark:text-zinc-400 shrink-0">
                                <i className="fa-solid fa-pen text-lg"></i>
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Profil Admin</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Perbarui data administrator.</p>
                            </div>
                            <button onClick={() => setEditingAdmin(null)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="px-6 py-4 flex flex-col">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap</label>
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Foto Profil</label>
                                <div className="md:col-span-2">
                                    <input
                                        type="file"
                                        onChange={(e) => editForm.setData('avatar', e.target.files?.[0] || null)}
                                        className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e6fcf6] file:text-[#00cca3] dark:file:bg-[#00cca3]/10 dark:file:text-[#00cca3] hover:file:bg-[#00cca3]/15 dark:hover:file:bg-[#00cca3]/20 cursor-pointer"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Email</label>
                                <div className="md:col-span-2">
                                    <input
                                        type="email"
                                        required
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                    />
                                    {editForm.errors.email && <div className="text-red-500 text-[13px] mt-1">{editForm.errors.email}</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi (Kosongkan jika tidak ingin diubah)</label>
                                <div className="md:col-span-2">
                                    <input
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                        placeholder="Minimal 6 karakter"
                                    />
                                    {editForm.errors.password && <div className="text-red-500 text-[13px] mt-1">{editForm.errors.password}</div>}
                                </div>
                            </div>

                            <div className="flex justify-between gap-3 pt-6 border-t border-zinc-150 dark:border-zinc-800/80 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingAdmin(null)}
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

            {/* Delete Admin Modal */}
            {deletingAdmin && (
                <div onClick={() => setDeletingAdmin(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-6 shadow-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                    <i className="fa-regular fa-trash-can text-lg"></i>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Hapus Admin</h3>
                            </div>
                            <button onClick={() => setDeletingAdmin(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Apakah Anda yakin ingin menghapus akun <span className="font-semibold text-zinc-900 dark:text-zinc-50">{deletingAdmin.name}</span> ?
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeletingAdmin(null)}
                                className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    router.delete(`/admin/profile/admins/${deletingAdmin.id}`, {
                                        onSuccess: () => {
                                            setDeletingAdmin(null);
                                            toast.success('Akun admin berhasil dihapus!');
                                        },
                                        onError: (errs) => {
                                            setDeletingAdmin(null);
                                            toast.error(errs.error || 'Gagal menghapus akun admin.');
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
        </AppLayout>
    );
}
