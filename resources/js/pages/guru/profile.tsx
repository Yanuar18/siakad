import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import guru from '@/routes/guru';
import { toast } from 'sonner';

type TeacherDetail = {
    id: number;
    user_id: number;
    nip: string;
};

type Teacher = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url: string;
    teacher_detail?: TeacherDetail;
};

type Props = {
    teacher: Teacher;
    status?: string;
};

export default function Profile({ teacher, status }: Props) {
    // Form for basic info & avatar
    const profileForm = useForm({
        name: teacher.name || '',
        email: teacher.email || '',
        nip: teacher.teacher_detail?.nip || '',
        avatar: null as File | null,
    });

    // Form for password update
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post(guru.profile.update.url(), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Profil Anda berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui profil. Harap periksa input Anda.');
            }
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(guru.profile.password.url(), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                toast.success('Password Anda berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui password. Harap periksa input Anda.');
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Profil Saya" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Profil Saya</h1>
                    <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Kelola data informasi guru dan pengaturan keamanan akun Anda.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Avatar & Basic Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={submitProfile} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50">
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 font-poppins">Data Diri Guru</h3>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Avatar Upload Section */}
                                <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <div className="relative h-24 w-24 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0">
                                        <img
                                            src={avatarPreview || teacher.avatar_url || 'https://i.pravatar.cc/120?img=47'}
                                            alt={teacher.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left space-y-2">
                                        <span className="block text-sm font-bold text-[#182449] dark:text-zinc-200 font-poppins">Foto Profil</span>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500">Ekstensi PNG, JPG, JPEG dengan batas maksimal ukuran 2MB.</p>
                                        <label className="inline-flex h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer items-center gap-1.5 transition-colors">
                                            <i className="fa-solid fa-cloud-arrow-up text-[12px]" />
                                            <span>Unggah Foto</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {profileForm.errors.avatar && (
                                            <p className="text-xs text-red-500 font-medium">{profileForm.errors.avatar}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 font-poppins">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={profileForm.data.name}
                                            onChange={e => profileForm.setData('name', e.target.value)}
                                            required
                                            placeholder="Nama Lengkap"
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                        />
                                        {profileForm.errors.name && (
                                            <p className="text-xs text-red-500 font-medium">{profileForm.errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 font-poppins">Nomor Induk Pegawai (NIP)</label>
                                        <input
                                            type="text"
                                            value={profileForm.data.nip}
                                            onChange={e => profileForm.setData('nip', e.target.value)}
                                            required
                                            placeholder="NIP"
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white font-mono"
                                        />
                                        {profileForm.errors.nip && (
                                            <p className="text-xs text-red-500 font-medium">{profileForm.errors.nip}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 font-poppins">Email</label>
                                        <input
                                            type="email"
                                            value={profileForm.data.email}
                                            onChange={e => profileForm.setData('email', e.target.value)}
                                            required
                                            placeholder="Email"
                                            className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                        />
                                        {profileForm.errors.email && (
                                            <p className="text-xs text-red-500 font-medium">{profileForm.errors.email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-zinc-150 dark:border-zinc-800/80 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="h-11 px-6 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14.5px] cursor-pointer transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-save text-[13px]"></i>
                                    {profileForm.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Change Password */}
                    <div className="space-y-6">
                        <form onSubmit={submitPassword} className="bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50">
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 font-poppins">Keamanan Akun</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Perbarui kata sandi Anda secara berkala.</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 font-poppins">Password Saat Ini</label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={e => passwordForm.setData('current_password', e.target.value)}
                                        required
                                        placeholder="••••••"
                                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                    />
                                    {passwordForm.errors.current_password && (
                                        <p className="text-xs text-red-500 font-medium">{passwordForm.errors.current_password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 font-poppins">Password Baru</label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={e => passwordForm.setData('password', e.target.value)}
                                        required
                                        placeholder="Minimal 6 karakter"
                                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                    />
                                    {passwordForm.errors.password && (
                                        <p className="text-xs text-red-500 font-medium">{passwordForm.errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 font-poppins">Konfirmasi Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                        required
                                        placeholder="••••••"
                                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                                    />
                                    {passwordForm.errors.password_confirmation && (
                                        <p className="text-xs text-red-500 font-medium">{passwordForm.errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-zinc-150 dark:border-zinc-800/80 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="h-11 px-6 rounded-lg bg-[#00cca3] hover:bg-[#00b38f] text-white font-semibold text-[14.5px] cursor-pointer transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-key text-[13px]"></i>
                                    {passwordForm.processing ? 'Memperbarui...' : 'Perbarui'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
