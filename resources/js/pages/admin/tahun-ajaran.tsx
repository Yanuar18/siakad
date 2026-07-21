import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Table, TableCard } from '@/components/application/table/table';
import admin from '@/routes/admin';
import { toast } from 'sonner';

type AcademicYear = {
    id: number;
    code: string;
    year: string;
    semester: 'odd' | 'even';
    is_active: boolean;
};

type Props = {
    academicYears: AcademicYear[];
};

export default function TahunAjaran({ academicYears }: Props) {
    const [editingPeriod, setEditingPeriod] = useState<AcademicYear | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingPeriod, setDeletingPeriod] = useState<AcademicYear | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const createForm = useForm({
        code: '',
        year: '',
        semester: 'odd' as 'odd' | 'even',
        is_active: false,
    });

    const editForm = useForm({
        code: '',
        year: '',
        semester: 'odd' as 'odd' | 'even',
        is_active: false,
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(admin.tahunAjaran.store.url(), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
                toast.success('Tahun ajaran berhasil didaftarkan!');
            },
            onError: () => {
                toast.error('Gagal mendaftarkan tahun ajaran. Silakan periksa formulir.');
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPeriod) return;
        editForm.patch(admin.tahunAjaran.update.url(editingPeriod.id), {
            onSuccess: () => {
                editForm.reset();
                setEditingPeriod(null);
                toast.success('Tahun ajaran berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui tahun ajaran. Silakan periksa formulir.');
            }
        });
    };

    const openEdit = (period: AcademicYear) => {
        setEditingPeriod(period);
        editForm.setData({
            code: period.code || '',
            year: period.year,
            semester: period.semester,
            is_active: period.is_active,
        });
    };

    const handleToggleActive = (id: number) => {
        router.post(admin.tahunAjaran.toggle.url(id), {}, {
            onSuccess: () => {
                toast.success('Tahun ajaran aktif berhasil dialihkan!');
            },
            onError: () => {
                toast.error('Gagal mengalihkan tahun ajaran aktif.');
            }
        });
    };

    const filteredPeriods = academicYears.filter(period => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const code = (period.code || '').toLowerCase();
        const year = period.year.toLowerCase();
        const semesterText = (period.semester === 'odd' ? 'ganjil odd' : 'genap even').toLowerCase();
        const statusText = period.is_active ? 'active aktif' : 'set active';
        return code.includes(q) || year.includes(q) || semesterText.includes(q) || statusText.includes(q);
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage);
    const paginatedPeriods = filteredPeriods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <AppLayout>
            <Head title="Kelola Tahun Ajaran" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Kelola Tahun Ajaran</h1>
                        <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Atur periode tahun ajaran dan semester aktif.</p>
                    </div>

                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="w-full sm:w-auto h-11 px-5 rounded-[10px] bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14.5px] cursor-pointer flex items-center justify-center gap-2 transition-colors self-stretch sm:self-auto"
                    >
                        <i className="fa-solid fa-plus text-[13px]"></i> Tambah Tahun Ajaran
                    </button>
                </div>

                {/* Full Width Table: Periods List */}
                <TableCard.Root>
                    <TableCard.Header
                        title="Daftar Tahun Ajaran"
                        badge={`${filteredPeriods.length} periode`}
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
                    <Table aria-label="Academic Periods list">
                        <Table.Header>
                            <Table.Head id="code" label="Kode" />
                            <Table.Head id="year" label="Tahun Ajaran" />
                            <Table.Head id="semester" label="Semester" />
                            <Table.Head id="status" label="Status" />
                            <Table.Head id="actions" className="text-center" label="Aksi" />
                        </Table.Header>

                        <Table.Body items={paginatedPeriods}>
                            {(period) => (
                                <Table.Row id={period.id}>
                                    <Table.Cell className="font-mono text-zinc-600 dark:text-zinc-400">
                                        {period.code || '-'}
                                    </Table.Cell>
                                    <Table.Cell className="font-semibold text-[#182449] dark:text-white">
                                        {period.year}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {period.semester === 'odd' ? 'Ganjil' : 'Genap'}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {period.is_active ? (
                                             <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] border border-[#00cca3]/20 dark:border-[#00cca3]/30">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-[#00cca3] animate-pulse"></span> Aktif
                                             </span>
                                        ) : (
                                            <button
                                                onClick={() => handleToggleActive(period.id)}
                                                className="text-[13px] font-semibold text-zinc-500 hover:text-[#00cca3] transition-colors cursor-pointer"
                                                title="Aktifkan"
                                            >
                                                Non Aktif
                                            </button>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell className="text-center whitespace-nowrap">
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => openEdit(period)}
                                                className="p-1.5 text-zinc-400 hover:text-[#00cca3] transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-pen text-sm"></i>
                                            </button>
                                            {!period.is_active && (
                                                <button
                                                    onClick={() => setDeletingPeriod(period)}
                                                    className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <i className="fa-solid fa-trash text-sm"></i>
                                                </button>
                                            )}
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
                                    <i className="fa-solid fa-calendar-plus text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Tambah Tahun Ajaran</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Tambahkan periode tahun ajaran</p>
                                </div>
                                <button onClick={() => setIsCreateOpen(false)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submitCreate} className="px-6 py-4 flex flex-col">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Kode</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={createForm.data.code}
                                            onChange={e => createForm.setData('code', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: TA2627GJ"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Tahun Ajaran</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={createForm.data.year}
                                            onChange={e => createForm.setData('year', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: 2026/2027"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Semester</label>
                                    <div className="md:col-span-2">
                                        <select
                                            value={createForm.data.semester}
                                            onChange={e => createForm.setData('semester', e.target.value as 'odd' | 'even')}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white dark:bg-[#0c101b]"
                                        >
                                            <option value="odd">Ganjil (1)</option>
                                            <option value="even">Genap (2)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Status</label>
                                    <div className="md:col-span-2 flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            id="is_active_create"
                                            checked={createForm.data.is_active}
                                            onChange={e => createForm.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 rounded border-zinc-300 text-[#00cca3] focus:ring-[#00cca3] dark:border-zinc-800"
                                        />
                                        <label htmlFor="is_active_create" className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400 select-none">
                                            Atur sebagai Periode Aktif
                                        </label>
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
                {editingPeriod && (
                    <div onClick={() => setEditingPeriod(null)} className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-2xl rounded-xl shadow-lg overflow-hidden transition-all duration-200 my-1">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start gap-4 relative">
                                <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                    <i className="fa-solid fa-pen text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Tahun Ajaran</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Perbarui data tahun ajaran</p>
                                </div>
                                <button onClick={() => setEditingPeriod(null)} className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submitEdit} className="px-6 py-4 flex flex-col">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Kode</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={editForm.data.code}
                                            onChange={e => editForm.setData('code', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: TA2627GJ"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Tahun Ajaran</label>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={editForm.data.year}
                                            onChange={e => editForm.setData('year', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                            placeholder="Contoh: 2026/2027"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Semester</label>
                                    <div className="md:col-span-2">
                                        <select
                                            value={editForm.data.semester}
                                            onChange={e => editForm.setData('semester', e.target.value as 'odd' | 'even')}
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white dark:bg-[#0c101b]"
                                        >
                                            <option value="odd">Ganjil (1)</option>
                                            <option value="even">Genap (2)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <label className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">Status</label>
                                    <div className="md:col-span-2 flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            id="is_active_edit"
                                            checked={editForm.data.is_active}
                                            onChange={e => editForm.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 rounded border-zinc-300 text-[#00cca3] focus:ring-[#00cca3] dark:border-zinc-800"
                                        />
                                        <label htmlFor="is_active_edit" className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400 select-none">
                                            Atur sebagai Periode Aktif
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-between gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-900/50 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingPeriod(null)}
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
                {deletingPeriod && (
                    <div onClick={() => setDeletingPeriod(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md rounded-xl p-6 space-y-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                        <i className="fa-regular fa-trash-can text-lg"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Hapus Tahun Ajaran</h3>
                                </div>
                                <button onClick={() => setDeletingPeriod(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Apakah Anda yakin ingin menghapus tahun ajaran <span className="font-semibold text-zinc-900 dark:text-zinc-50">{deletingPeriod.year} - {deletingPeriod.semester === 'odd' ? 'Ganjil' : 'Genap'}</span> ?
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeletingPeriod(null)}
                                    className="flex-1 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[14px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        router.delete(admin.tahunAjaran.destroy.url(deletingPeriod.id), {
                                            onSuccess: () => {
                                                setDeletingPeriod(null);
                                                toast.success('Tahun ajaran berhasil dihapus!');
                                            },
                                            onError: () => {
                                                toast.error('Gagal menghapus tahun ajaran.');
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
