import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import type { User } from '@/types';
import admin from '@/routes/admin';
import { Table, TableCard } from '@/components/application/table/table';
import { toast } from 'sonner';

type Props = {
    admins: User[];
};

export default function Profile({ admins }: Props) {
    const { auth } = usePage().props as unknown as { auth: { user: User } };
    const currentUser = auth.user;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
    const [deletingAdmin, setDeletingAdmin] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Profile Edit Form (Currently authenticated admin)
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: currentUser.name,
        email: currentUser.email,
        password: '',
        password_confirmation: '',
        avatar: null as File | null,
        _method: 'PATCH',
    });

    // Create Admin Form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        avatar: null as File | null,
    });

    // Edit Other Admin Form
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        avatar: null as File | null,
        _method: 'PATCH',
    });

    const submitProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.profile.update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setData(d => ({
                    ...d,
                    password: '',
                    password_confirmation: '',
                    avatar: null,
                }));
                toast.success('Pengaturan profil Anda berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui pengaturan profil.');
            }
        });
    };

    const submitCreateAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/profile/admins', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
                toast.success('Administrator baru berhasil didaftarkan!');
            },
            onError: (errs) => {
                toast.error(errs.error || 'Gagal mendaftarkan administrator.');
            }
        });
    };

    const submitEditAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAdmin) return;
        editForm.post(`/admin/profile/admins/${editingAdmin.id}`, {
            onSuccess: () => {
                editForm.reset();
                setEditingAdmin(null);
                toast.success('Profil admin berhasil diperbarui!');
            },
            onError: (errs) => {
                toast.error(errs.error || 'Gagal memperbarui profil admin.');
            }
        });
    };

    const openEditAdmin = (adminUser: User) => {
        setEditingAdmin(adminUser);
        editForm.setData({
            name: adminUser.name,
            email: adminUser.email,
            password: '',
            avatar: null,
            _method: 'PATCH',
        });
    };

    const itemsPerPage = 10;
    const totalPages = Math.ceil(admins.length / itemsPerPage);
    const paginatedAdmins = admins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <AppLayout>
            <Head title="Profil Admin" />

            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Profile</h1>
                    <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Kelola akun admin anda.</p>
                </div>

                {/* Section 1: Edit Profile Form */}
                <div className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                    <h2 className="text-[17px] font-bold text-[#182449] dark:text-white mb-4">Profile Anda</h2>

                    <form onSubmit={submitProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-[13px] font-semibold text-[#5b6478] dark:text-[#94a3b8] mb-1.5">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full h-11 px-4 rounded-[10px] border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14.5px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                required
                            />
                            {errors.name && <div className="text-red-500 text-[13px] mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-[#5b6478] dark:text-[#94a3b8] mb-1.5">Foto Profil</label>
                             <input
                                 type="file"
                                 onChange={e => setData('avatar', e.target.files?.[0] || null)}
                                 className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e6fcf6] file:text-[#00cca3] dark:file:bg-[#00cca3]/10 dark:file:text-[#00cca3] hover:file:bg-[#00cca3]/15 dark:hover:file:bg-[#00cca3]/20 cursor-pointer"
                                 accept="image/*"
                             />
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-[#5b6478] dark:text-[#94a3b8] mb-1.5">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full h-11 px-4 rounded-[10px] border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14.5px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                required
                            />
                            {errors.email && <div className="text-red-500 text-[13px] mt-1">{errors.email}</div>}
                        </div>

                        <div className="border-t border-zinc-200 dark:border-zinc-850 pt-4 mt-6">
                            <h3 className="text-[15px] font-bold text-[#182449] dark:text-white mb-3">Ubah Password (Opsional)</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#5b6478] dark:text-[#94a3b8] mb-1.5">Password Baru</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full h-11 px-4 rounded-[10px] border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14.5px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                        placeholder="Minimal 6 karakter"
                                    />
                                    {errors.password && <div className="text-red-500 text-[13px] mt-1">{errors.password}</div>}
                                </div>

                                <div>
                                    <label className="block text-[13px] font-semibold text-[#5b6478] dark:text-[#94a3b8] mb-1.5">Konfirmasi Password</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        className="w-full h-11 px-4 rounded-[10px] border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14.5px] focus:outline-none focus:border-[#00cca3] transition-colors dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row-reverse sm:justify-start items-center gap-4 pt-2 w-full">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto h-11 px-6 rounded-[10px] bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14.5px] cursor-pointer transition-colors flex items-center justify-center"
                            >
                                {processing ? 'Memperbarui...' : 'Perbarui Profile'}
                            </button>

                            {recentlySuccessful && (
                                <span className="text-[13.5px] text-[#00cca3] font-semibold flex items-center justify-center gap-1.5 animate-fade-in text-center sm:text-left">
                                    <i className="fa-solid fa-circle-check"></i> Profil berhasil diperbarui!
                                </span>
                            )}
                        </div>
                    </form>
                </div>

                {/* Section 2: Manage Admin Users List */}
                <TableCard.Root>
                    <TableCard.Header
                        title="Data Admin"
                        badge={`${admins.length} Akun`}
                        contentTrailing={
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="w-full sm:w-auto h-9 px-4.5 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[13.5px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <i className="fa-solid fa-plus text-[11px]" /> Tambah Admin
                            </button>
                        }
                    />
                    <Table aria-label="Admins user management list">
                        <Table.Header>
                            <Table.Head id="name" label="Name" />
                            <Table.Head id="email" label="Email" />
                            <Table.Head id="role" label="Role" />
                            <Table.Head id="actions" className="text-center" label="Aksi" />
                        </Table.Header>

                        <Table.Body items={paginatedAdmins}>
                            {(adm) => (
                                <Table.Row id={adm.id}>
                                    <Table.Cell className="font-semibold text-[#182449] dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={adm.avatar_url || 'https://i.pravatar.cc/120?img=47'}
                                                alt=""
                                                className="w-8 h-8 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                                            />
                                            <span>{adm.name}</span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {adm.email}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                                            {adm.role}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className="text-center whitespace-nowrap">
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => openEditAdmin(adm)}
                                                className="p-1.5 text-zinc-400 hover:text-[#00cca3] transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-pen text-sm"></i>
                                            </button>
                                            {adm.id !== currentUser.id && (
                                                <button
                                                    onClick={() => setDeletingAdmin(adm)}
                                                    className="p-1.5 text-zinc-400 hover:text-red-655 dark:hover:text-red-400 transition-colors cursor-pointer"
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

                        <form onSubmit={submitCreateAdmin} className="px-6 py-4 flex flex-col">
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

                        <form onSubmit={submitEditAdmin} className="px-6 py-4 flex flex-col">
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
