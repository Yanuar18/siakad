import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import type { User } from '@/types';
import { logout } from '@/routes';
import Footer from '@/components/footer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { toast } from 'sonner';

type StudentDetail = {
    id: number;
    user_id: number;
    nis: string;
};

type Student = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url: string;
    student_detail?: StudentDetail;
};

type Props = {
    student: Student;
    status?: string;
};

export default function Profile({ student, status }: Props) {
    const { auth, activeAcademicYear } = usePage().props as unknown as { auth: { user: User }; activeAcademicYear: { id: number; year: string; semester: string } | null };
    const user = auth?.user;

    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Form for basic info & avatar
    const profileForm = useForm({
        name: student.name || '',
        email: student.email || '',
        nis: student.student_detail?.nis || '',
        avatar: null as File | null,
    });

    // Form for password update
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/profile', {
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
        passwordForm.put('/profile/password', {
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

    const handleToggleSidebar = () => {
        if (window.innerWidth <= 760) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    const dashboardUrl = '/siswa/dashboard';
    const classUrl = '/siswa/jadwal';
    const absenUrl = '/siswa/absen';
    const nilaiUrl = '/siswa/nilai';
    const profileUrl = '/siswa/profile';

    return (
        <>
            <Head>
                <title>Profil Saya</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>

            <div className="flex min-h-screen bg-[#f4f6fb] dark:bg-[#0b0f19] text-[#182449] dark:text-[#f8fafc] font-sans transition-colors duration-200">
                {/* Mobile Sidebar Backdrop Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-20 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* ================= SIDEBAR ================= */}
                <aside className={`sticky top-0 h-screen overflow-y-auto flex flex-col bg-white dark:bg-[#111827] border-r border-[#e8ecf5] dark:border-[#1f2937] py-6 transition-all duration-200 z-20 max-md:fixed max-md:left-0 max-md:top-0 max-md:h-screen ${sidebarCollapsed ? 'w-[76px] px-2.5' : 'w-[250px] px-[18px]'} ${sidebarOpen ? 'max-md:translate-x-0 max-md:shadow-[20px_0_40px_rgba(20,30,60,0.15)]' : 'max-md:-translate-x-full'}`} id="sidebar">
                    <div className={`flex items-center gap-2.5 px-1.5 pb-7 ${sidebarCollapsed ? 'justify-center px-0 pb-7' : ''}`}>
                        <div className="flex items-center shrink-0" style={{ marginRight: sidebarCollapsed ? '0px' : '4px' }}>
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="w-8 h-8 object-contain"
                            />
                        </div>
                        {!sidebarCollapsed && <div className="text-[20px] font-bold text-[#182449] dark:text-white font-poppins">Octagram</div>}
                    </div>

                    {!sidebarCollapsed && <div className="text-[11px] font-bold tracking-[0.08em] text-[#a7afc2] dark:text-[#4b5563] mt-4 mx-2.5 mb-2 uppercase">MENU UTAMA</div>}
                    <Link href={dashboardUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] font-medium mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} text-[#5b6478] dark:text-[#94a3b8]`} title={sidebarCollapsed ? 'Home' : undefined}>
                        <i className={`fa-solid fa-house text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                        {!sidebarCollapsed && <span>Home</span>}
                    </Link>
                    <Link href={classUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] font-medium mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} text-[#5b6478] dark:text-[#94a3b8]`} title={sidebarCollapsed ? 'Jadwal' : undefined}>
                        <i className={`fa-solid fa-book-open text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                        {!sidebarCollapsed && <span>Jadwal</span>}
                    </Link>
                    <Link href={absenUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] font-medium mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} text-[#5b6478] dark:text-[#94a3b8]`} title={sidebarCollapsed ? 'Absensi' : undefined}>
                        <i className={`fa-solid fa-calendar-days text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                        {!sidebarCollapsed && <span>Absensi</span>}
                    </Link>
                    <Link href={nilaiUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] font-medium mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} text-[#5b6478] dark:text-[#94a3b8]`} title={sidebarCollapsed ? 'Nilai' : undefined}>
                        <i className={`fa-solid fa-file-invoice text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                        {!sidebarCollapsed && <span>Nilai</span>}
                    </Link>
                    <Link href={profileUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold`} title={sidebarCollapsed ? 'Profil Saya' : undefined}>
                        <i className={`fa-solid fa-user text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                        {!sidebarCollapsed && <span>Profil Saya</span>}
                    </Link>

                    <div className="mt-auto">
                        <Link
                            href={logout()}
                            method="post"
                            as="button"
                            className={`flex items-center gap-3 rounded-[10px] text-[14.5px] font-medium mb-[2px] cursor-pointer transition-colors text-[#e35d6a] w-full bg-transparent border-none text-left hover:bg-[#fdeeef] dark:hover:bg-[#e35d6a]/10 ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'}`}
                            data-test="logout-button"
                            title={sidebarCollapsed ? 'Logout' : undefined}
                        >
                            <i className={`fa-solid fa-right-from-bracket text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Logout</span>}
                        </Link>
                    </div>
                </aside>

                <div className="flex-1 min-w-0 flex flex-col">
                    {/* ================= TOPBAR ================= */}
                    <header className="sticky top-0 z-[5] bg-white dark:bg-[#111827] border-b border-[#e8ecf5] dark:border-[#1f2937] flex items-center gap-4 py-3.5 px-7 transition-colors duration-200">
                        <button
                            className="w-9.5 h-9.5 rounded-full border border-[#e8ecf5] dark:border-[#1f2937] bg-white dark:bg-[#111827] flex items-center justify-center text-[#7c869c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#f8fafc] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors"
                            id="menuToggle"
                            onClick={handleToggleSidebar}
                        >
                            <i className="fa-solid fa-bars"></i>
                        </button>

                        <div className="ml-1 shrink-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6fcf6] dark:bg-[#00cca3]/15 text-[#00cca3] text-xs font-bold font-poppins">
                            <i className="fa-regular fa-calendar-days text-[11px]"></i>
                            {activeAcademicYear ? (
                                <>
                                    <span className="hidden md:inline">Tahun Ajaran : {activeAcademicYear.year} - {activeAcademicYear.semester === 'odd' ? 'Ganjil' : 'Genap'}</span>
                                    <span className="md:hidden">TA : {activeAcademicYear.year} - {activeAcademicYear.semester === 'odd' ? '1' : '2'}</span>
                                </>
                            ) : <span>Belum ada TA aktif</span>}
                        </div>
                        </div>

                        <div className="ml-auto flex items-center gap-5">
                            <button
                                onClick={toggleTheme}
                                className="relative w-9.5 h-9.5 rounded-full border border-[#e8ecf5] dark:border-[#1f2937] bg-white dark:bg-[#111827] flex items-center justify-center text-[#7c869c] dark:text-[#94a3b8] hover:bg-[#f8fafc] dark:hover:bg-[#1f2937] cursor-pointer transition-colors"
                                title={resolvedAppearance === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {resolvedAppearance === 'dark' ? (
                                    <i className="fa-regular fa-sun text-[16px]"></i>
                                ) : (
                                    <i className="fa-regular fa-moon text-[16px]"></i>
                                )}
                            </button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2.5 pl-4 border-l border-[#e8ecf5] dark:border-[#1f2937] cursor-pointer hover:opacity-80 focus:outline-none">
                                        <img
                                            className="w-10 h-10 rounded-full object-cover bg-[#dbe3f7]"
                                            src={user?.avatar_url || 'https://i.pravatar.cc/120?img=47'}
                                            alt={`${user?.name || 'Siswa'} avatar`}
                                        />
                                        <div className="max-sm:hidden text-left">
                                            <div className="text-[14px] font-bold leading-tight text-[#182449] dark:text-white">{user?.name || 'Siswa'}</div>
                                            <div className="text-[12px] text-[#7c869c] dark:text-[#94a3b8] capitalize">{user?.role === 'student' ? 'Siswa' : (user?.role || 'siswa')}</div>
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 bg-white dark:bg-[#111827] text-[#182449] dark:text-white border border-[#e8ecf5] dark:border-[#1f2937] rounded-[12px] shadow-lg mt-1 p-1" align="end">
                                     <div className="sm:hidden px-3 py-2 border-b border-[#e8ecf5] dark:border-[#1f2937] mb-1">
                                         <div className="text-[14px] font-bold text-[#182449] dark:text-white">{user?.name || 'Siswa'}</div>
                                         <div className="text-[12px] text-[#7c869c] dark:text-[#94a3b8] capitalize">{user?.role === 'student' ? 'Siswa' : (user?.role || 'siswa')}</div>
                                     </div>
                                     <DropdownMenuItem asChild className="focus:bg-[#e6fcf6] dark:focus:bg-[#00cca3]/10 focus:text-[#00cca3] hover:bg-[#e6fcf6] dark:hover:bg-[#00cca3]/10 hover:text-[#00cca3] text-[#5b6478] dark:text-[#94a3b8] cursor-pointer rounded-[8px]">
                                         <Link
                                             href="/profile"
                                             className="flex items-center gap-2 px-3 py-2 text-[14px] text-[#5b6478] dark:text-[#94a3b8] hover:text-[#00cca3] w-full text-left"
                                         >
                                             <i className="fa-solid fa-user text-[14px] w-4"></i>
                                             <span>Profile</span>
                                         </Link>
                                     </DropdownMenuItem>
                                     <DropdownMenuItem asChild className="focus:bg-[#fdeeef] dark:focus:bg-[#e35d6a]/10 focus:text-[#e35d6a] hover:bg-[#fdeeef] dark:hover:bg-[#e35d6a]/10 hover:text-[#e35d6a] text-[#e35d6a] cursor-pointer rounded-[8px]">
                                         <Link
                                             href="/logout"
                                             method="post"
                                             as="button"
                                             className="flex items-center gap-2 px-3 py-2 text-[14px] text-[#e35d6a] hover:text-[#e35d6a] w-full text-left bg-transparent border-none"
                                         >
                                             <i className="fa-solid fa-right-from-bracket text-[14px] w-4"></i>
                                             <span>Logout</span>
                                         </Link>
                                     </DropdownMenuItem>
                                 </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* ================= CONTENT MAIN ================= */}
                    <main className="flex flex-col gap-[22px] p-7">
                        <div>
                            <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Profil Saya</h1>
                            <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">Kelola data informasi siswa dan pengaturan keamanan akun Anda.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Avatar & Basic Information */}
                            <div className="lg:col-span-2 space-y-6">
                                <form onSubmit={submitProfile} className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-6 py-5 border-b border-[#e8ecf5] dark:border-[#1f2937] bg-zinc-50 dark:bg-zinc-900/50">
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 font-poppins">Data Diri Siswa</h3>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Avatar Upload Section */}
                                        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                                            <div className="relative h-24 w-24 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0">
                                                <img
                                                    src={avatarPreview || student.avatar_url || 'https://i.pravatar.cc/120?img=47'}
                                                    alt={student.name}
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
                                                <label className="block text-[13px] font-bold text-[#182449] dark:text-zinc-300 font-poppins">Nomor Induk Siswa (NIS)</label>
                                                <input
                                                    type="text"
                                                    value={profileForm.data.nis}
                                                    onChange={e => profileForm.setData('nis', e.target.value)}
                                                    required
                                                    placeholder="NIS"
                                                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[13.5px] focus:outline-none focus:border-[#00cca3] dark:text-white font-mono"
                                                />
                                                {profileForm.errors.nis && (
                                                    <p className="text-xs text-red-500 font-medium">{profileForm.errors.nis}</p>
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
                                <form onSubmit={submitPassword} className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-6 py-5 border-b border-[#e8ecf5] dark:border-[#1f2937] bg-zinc-50 dark:bg-zinc-900/50">
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
                    </main>

                    <Footer />
                </div>
            </div>
        </>
    );
}
