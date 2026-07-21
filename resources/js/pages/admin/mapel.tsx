import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Table, TableCard } from '@/components/application/table/table';
import admin from '@/routes/admin';
import { toast } from 'sonner';

type Subject = {
    id: number;
    name: string;
    code: string;
};

type Props = {
    subjects: Subject[];
};

export default function Mapel({ subjects }: Props) {
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const createForm = useForm({
        name: '',
        code: '',
    });

    const editForm = useForm({
        name: '',
        code: '',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(admin.mapel.store.url(), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
                toast.success('Mata pelajaran berhasil dibuat!');
            },
            onError: () => {
                toast.error('Gagal membuat mata pelajaran. Silakan periksa formulir.');
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubject) return;
        editForm.patch(admin.mapel.update.url(editingSubject.id), {
            onSuccess: () => {
                editForm.reset();
                setEditingSubject(null);
                toast.success('Mata pelajaran berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui mata pelajaran. Silakan periksa formulir.');
            }
        });
    };

    const openEdit = (subject: Subject) => {
        setEditingSubject(subject);
        editForm.setData({
            name: subject.name,
            code: subject.code,
        });
    };

    const filteredSubjects = subjects.filter(sub => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = sub.name.toLowerCase();
        const code = sub.code.toLowerCase();
        return name.includes(q) || code.includes(q);
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
    const paginatedSubjects = filteredSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <AppLayout>
            <Head title="Kelola Mata Pelajaran" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Kelola Mata Pelajaran</h1>
                        <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Tambahkan mata pelajaran untuk akademik sekolah.</p>
                    </div>

                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="w-full sm:w-auto h-11 px-5 rounded-[10px] bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14.5px] cursor-pointer flex items-center justify-center gap-2 transition-colors self-stretch sm:self-auto"
                    >
                        <i className="fa-solid fa-plus text-[13px]"></i> Tambah Mapel
                    </button>
                </div>

                {/* Subjects list Table */}
                <TableCard.Root>
                    <TableCard.Header
                        title="Daftar Mata Pelajaran"
                        badge={`${filteredSubjects.length} mapel`}
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
                    <Table aria-label="Daftar mata pelajaran">
                        <Table.Header>
                            <Table.Head id="code" label="Kode Mapel" />
                            <Table.Head id="name" label="Nama Mapel" />
                            <Table.Head id="actions" className="text-center" label="Aksi" />
                        </Table.Header>

                        <Table.Body items={paginatedSubjects}>
                            {(subject) => (
                                <Table.Row id={subject.id}>
                                    <Table.Cell className="font-mono">
                                        {subject.code}
                                    </Table.Cell>
                                    <Table.Cell className="font-semibold text-[#182449] dark:text-white">
                                        {subject.name}
                                    </Table.Cell>
                                    <Table.Cell className="text-center whitespace-nowrap">
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => openEdit(subject)}
                                                className="p-1.5 text-zinc-400 hover:text-[#00cca3] transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-pen text-sm"></i>
                                            </button>
                                            <button
                                                onClick={() => setDeletingSubject(subject)}
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
                                    <i className="fa-solid fa-book text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Tambah Mapel</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Tambahkan kode dan nama mapel</p>
                                </div>
                                <button onClick={() => setIsCreateOpen(false)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submitCreate} className="px-6 py-4 flex flex-col">
                                {/* Grid fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Nama Mapel</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={createForm.data.name}
                                            onChange={e => createForm.setData('name', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: Informatika"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-150 dark:border-zinc-800/80">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Kode Mapel</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={createForm.data.code}
                                            onChange={e => createForm.setData('code', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: TIK-01"
                                            required
                                        />
                                        {createForm.errors.code && <div className="text-red-500 text-[13px] mt-1">{createForm.errors.code}</div>}
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
                {editingSubject && (
                    <div onClick={() => setEditingSubject(null)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-2xl rounded-xl shadow-lg overflow-hidden transition-all duration-200 my-1">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-pen text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Mapel</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Perbarui kode dan nama mapel</p>
                                </div>
                                <button onClick={() => setEditingSubject(null)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submitEdit} className="px-6 py-4 flex flex-col">
                                {/* Grid fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Nama Mapel</label>
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
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Kode Mapel</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={editForm.data.code}
                                            onChange={e => editForm.setData('code', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            required
                                        />
                                        {editForm.errors.code && <div className="text-red-500 text-[13px] mt-1">{editForm.errors.code}</div>}
                                    </div>
                                </div>

                                {/* Actions footer */}
                                <div className="flex justify-between gap-3 pt-6 border-t border-zinc-150 dark:border-zinc-800/80 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingSubject(null)}
                                        className="h-11 px-5 rounded-lg border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
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
                {deletingSubject && (
                    <div onClick={() => setDeletingSubject(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                        <i className="fa-regular fa-trash-can text-lg"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Hapus Mapel</h3>
                                </div>
                                <button onClick={() => setDeletingSubject(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Apakah Anda yakin ingin menghapus <span className="font-semibold text-zinc-900 dark:text-zinc-50">{deletingSubject.name}</span> ({deletingSubject.code}) ?
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeletingSubject(null)}
                                    className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        router.delete(admin.mapel.destroy.url(deletingSubject.id), {
                                            onSuccess: () => {
                                                setDeletingSubject(null);
                                                toast.success('Mata pelajaran berhasil dihapus!');
                                            },
                                            onError: () => {
                                                toast.error('Gagal menghapus mata pelajaran.');
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
        </AppLayout>
    );
}
