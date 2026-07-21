import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Table, TableCard } from '@/components/application/table/table';
import admin from '@/routes/admin';
import { toast } from 'sonner';

type TeacherDetail = {
    nip: string;
};

type TeacherUser = {
    id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
    teacher_detail: TeacherDetail | null;
};

type Props = {
    teachers: TeacherUser[];
};

export default function Guru({ teachers }: Props) {
    const [editingTeacher, setEditingTeacher] = useState<TeacherUser | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingTeacher, setDeletingTeacher] = useState<TeacherUser | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        nip: '',
        avatar: null as File | null,
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        nip: '',
        avatar: null as File | null,
        _method: 'PATCH',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(admin.guru.store.url(), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
                toast.success('Guru berhasil didaftarkan!');
            },
            onError: () => {
                toast.error('Gagal mendaftarkan guru. Silakan periksa formulir.');
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTeacher) return;
        editForm.post(admin.guru.update.url(editingTeacher.id), {
            onSuccess: () => {
                editForm.reset();
                setEditingTeacher(null);
                toast.success('Profil guru berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui profil guru. Silakan periksa formulir.');
            }
        });
    };

    const openEdit = (teacher: TeacherUser) => {
        setEditingTeacher(teacher);
        editForm.setData({
            name: teacher.name,
            email: teacher.email,
            password: '',
            nip: teacher.teacher_detail?.nip || '',
            avatar: null,
            _method: 'PATCH',
        });
    };

    const filteredTeachers = teachers.filter(t => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = t.name.toLowerCase();
        const nip = (t.teacher_detail?.nip || '').toLowerCase();
        const email = t.email.toLowerCase();
        return name.includes(q) || nip.includes(q) || email.includes(q);
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
    const paginatedTeachers = filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleImport = async () => {
        if (!importFile) return;
        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('_token', (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '');
        try {
            const res = await fetch('/admin/guru/import', {
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
                router.reload({ only: ['teachers'] });
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
            <Head title="Kelola Guru" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Kelola Guru</h1>
                        <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Daftarkan guru dan kelola profil.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <a
                            href="/admin/guru/template"
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
                            href="/admin/guru/export"
                            className="flex-1 sm:flex-none h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <i className="fa-solid fa-file-export text-[12px]"></i> Export
                        </a>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex-1 sm:flex-none h-9 px-4 rounded-[10px] bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <i className="fa-solid fa-plus text-[11px]"></i> Tambah Guru
                        </button>
                    </div>
                </div>

                {/* Table list */}
                <TableCard.Root>
                    <TableCard.Header
                        title="Daftar Guru"
                        badge={`${filteredTeachers.length} guru`}
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
                                    placeholder="Cari"
                                    className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                />
                            </div>
                        }
                    />
                    <Table aria-label="Daftar guru">
                        <Table.Header>
                            <Table.Head id="name" label="Nama" />
                            <Table.Head id="nip" label="NIP" />
                            <Table.Head id="email" label="Email" />
                            <Table.Head id="actions" className="text-center" label="Aksi" />
                        </Table.Header>

                        <Table.Body items={paginatedTeachers}>
                            {(teacher) => (
                                <Table.Row id={teacher.id}>
                                    <Table.Cell className="font-semibold text-[#182449] dark:text-white">
                                        <div className="flex items-center gap-3">
                                            {teacher.avatar_url ? (
                                                <img
                                                    src={teacher.avatar_url}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
                                                    <i className="fa-solid fa-user text-[11px]"></i>
                                                </div>
                                            )}
                                            <span>{teacher.name}</span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell className="font-mono">
                                        {teacher.teacher_detail?.nip || '-'}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {teacher.email}
                                    </Table.Cell>
                                    <Table.Cell className="text-center whitespace-nowrap">
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => openEdit(teacher)}
                                                className="p-1.5 text-zinc-400 hover:text-[#00cca3] transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-pen text-sm"></i>
                                            </button>
                                            <button
                                                onClick={() => setDeletingTeacher(teacher)}
                                                className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                                title="Delete"
                                            >
                                                <i className="fa-solid fa-trash text-sm"></i>
                                            </button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                    <TableCard.Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </TableCard.Root>

                {/* Create Modal */}
                {isCreateOpen && (
                    <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-2xl rounded-xl shadow-lg overflow-hidden transition-all duration-200 my-1">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-chalkboard-user text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Tambah Guru</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Daftarkan profil guru baru</p>
                                </div>
                                <button onClick={() => setIsCreateOpen(false)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submitCreate} className="px-6 py-4 flex flex-col">
                                {/* Grid fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={createForm.data.name}
                                            onChange={e => createForm.setData('name', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: Yanuar Riziq"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Foto Profil</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="file"
                                            onChange={e => createForm.setData('avatar', e.target.files?.[0] || null)}
                                            className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e6fcf6] file:text-[#00cca3] dark:file:bg-[#00cca3]/10 dark:file:text-[#00cca3] hover:file:bg-[#00cca3]/15 dark:hover:file:bg-[#00cca3]/20 cursor-pointer"
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">NIP (Nomor Induk Pegawai)</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={createForm.data.nip}
                                            onChange={e => createForm.setData('nip', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: 19820304"
                                            required
                                        />
                                        {createForm.errors.nip && <div className="text-red-500 text-[13px] mt-1">{createForm.errors.nip}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Email</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={e => createForm.setData('email', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: yanuar@gmail.com"
                                            required
                                        />
                                        {createForm.errors.email && <div className="text-red-500 text-[13px] mt-1">{createForm.errors.email}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="password"
                                            value={createForm.data.password}
                                            onChange={e => createForm.setData('password', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Minimal 6 karakter"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Actions footer */}
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

                {/* Edit Modal */}
                {editingTeacher && (
                    <div onClick={() => setEditingTeacher(null)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-2xl rounded-xl shadow-lg overflow-hidden transition-all duration-200 my-1">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-pen text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Profil Guru</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Perbarui data guru.</p>
                                </div>
                                <button onClick={() => setEditingTeacher(null)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submitEdit} className="px-6 py-4 flex flex-col">
                                {/* Grid fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={editForm.data.name}
                                            onChange={e => editForm.setData('name', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Foto Profil</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="file"
                                            onChange={e => editForm.setData('avatar', e.target.files?.[0] || null)}
                                            className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e6fcf6] file:text-[#00cca3] dark:file:bg-[#00cca3]/10 dark:file:text-[#00cca3] hover:file:bg-[#00cca3]/15 dark:hover:file:bg-[#00cca3]/20 cursor-pointer"
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">NIP (Nomor Induk Pegawai)</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={editForm.data.nip}
                                            onChange={e => editForm.setData('nip', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            required
                                        />
                                        {editForm.errors.nip && <div className="text-red-500 text-[13px] mt-1">{editForm.errors.nip}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Email</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={e => editForm.setData('email', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            required
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
                                            onChange={e => editForm.setData('password', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Minimal 6 karakter"
                                        />
                                    </div>
                                </div>

                                {/* Actions footer */}
                                <div className="flex justify-between gap-3 pt-6 border-t border-zinc-150 dark:border-zinc-800/80 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingTeacher(null)}
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

                {/* Delete Confirmation Modal */}
                {deletingTeacher && (
                    <div onClick={() => setDeletingTeacher(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-red-200 dark:border-red-950/30 bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                        <i className="fa-regular fa-trash-can text-lg"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Hapus Guru</h3>
                                </div>
                                <button onClick={() => setDeletingTeacher(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Apakah Anda yakin ingin menghapus <span className="font-semibold text-zinc-900 dark:text-zinc-50">{deletingTeacher.name}</span> ?
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeletingTeacher(null)}
                                    className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        router.delete(admin.guru.destroy.url(deletingTeacher.id), {
                                            onSuccess: () => {
                                                setDeletingTeacher(null);
                                                toast.success('Guru berhasil dihapus!');
                                            },
                                            onError: () => {
                                                toast.error('Gagal menghapus guru.');
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
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Import Data Guru</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Upload file CSV / XLSX untuk impor massal</p>
                                </div>
                            </div>
                            <button onClick={() => setIsImportOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-[12.5px] text-zinc-500 dark:text-zinc-400 space-y-1">
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300">Format kolom:</p>
                            <p><span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Nama Lengkap; Email; Password; NIP</span></p>
                            <p className="text-zinc-400 dark:text-zinc-500">Unduh template untuk contoh format yang benar.</p>
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
