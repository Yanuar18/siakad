import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import Footer from '@/components/footer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';

type AcademicYear = { id: number; year: string; semester: string; is_active: boolean } | null;

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth, activeAcademicYear } = usePage().props as unknown as {
        auth: { user: User };
        activeAcademicYear: AcademicYear;
    };
    const user = auth?.user;
    const dashboardUrl = user?.role === 'student' ? '/siswa/dashboard' : '/dashboard';
    const classUrl = user?.role === 'student' ? '/siswa/jadwal' : '/jadwal';
    const absenUrl = user?.role === 'student' ? '/siswa/absen' : '/absen';
    const nilaiUrl = user?.role === 'student' ? '/siswa/nilai' : '/nilai';
    const profileUrl = user?.role === 'student' ? '/siswa/profile' : '/profile';

    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const handleToggleSidebar = () => {
        if (window.innerWidth <= 760) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 760);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const page = usePage();
    const isDashboard = page.url.endsWith('/dashboard');
    const isClass = page.url.endsWith('/jadwal');

    return (
        <div className="flex min-h-screen bg-[#f4f6fb] dark:bg-[#0b0f19] text-[#182449] dark:text-[#f8fafc] font-sans transition-colors duration-200">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            {/* Mobile Sidebar Backdrop Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ================= SIDEBAR ================= */}
            <aside className={`sticky top-0 h-screen overflow-y-auto flex flex-col bg-white dark:bg-[#111827] border-r border-[#e8ecf5] dark:border-[#1f2937] py-6 transition-all duration-200 z-50 max-md:fixed max-md:left-0 max-md:top-0 max-md:h-screen ${sidebarCollapsed ? 'w-[76px] px-2.5' : 'w-[250px] px-[18px]'} ${sidebarOpen ? 'max-md:translate-x-0 max-md:shadow-[20px_0_40px_rgba(20,30,60,0.15)]' : 'max-md:-translate-x-full'}`} id="sidebar">
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
                
                {user?.role === 'admin' && (
                    <>
                        <Link href="/admin/dashboard" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.endsWith('/admin/dashboard') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Dashboard' : undefined}>
                            <i className={`fa-solid fa-gauge text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Dashboard</span>}
                        </Link>
                        <Link href="/admin/guru" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/admin/guru') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Guru' : undefined}>
                            <i className={`fa-solid fa-chalkboard-user text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Data Guru</span>}
                        </Link>
                        <Link href="/admin/siswa" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/admin/siswa') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Siswa' : undefined}>
                            <i className={`fa-solid fa-user-graduate text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Data Siswa</span>}
                        </Link>
                        <Link href="/admin/mapel" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/admin/mapel') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Subjects (Mapel)' : undefined}>
                            <i className={`fa-solid fa-book text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Mata Pelajaran</span>}
                        </Link>
                        <Link href="/admin/tahun-ajaran" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/admin/tahun-ajaran') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Academic Year' : undefined}>
                            <i className={`fa-solid fa-calendar-days text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Tahun Ajaran</span>}
                        </Link>
                        <Link href="/admin/kelas" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/admin/kelas') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Classrooms (Kelas)' : undefined}>
                            <i className={`fa-solid fa-school text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Ruang Kelas</span>}
                        </Link>
                        <Link href="/admin/profile" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/admin/profile') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Admin Profile' : undefined}>
                            <i className={`fa-solid fa-user-gear text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Profil Saya</span>}
                        </Link>
                    </>
                )}

                {user?.role === 'teacher' && (
                    <>
                        <Link href="/guru/dashboard" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.endsWith('/guru/dashboard') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Guru Dashboard' : undefined}>
                            <i className={`fa-solid fa-gauge text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Dashboard</span>}
                        </Link>
                        <Link href="/guru/penjadwalan" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/guru/penjadwalan') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Penjadwalan' : undefined}>
                            <i className={`fa-solid fa-calendar-days text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Penjadwalan</span>}
                        </Link>
                        <Link href="/guru/absen" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/guru/absen') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Absensi' : undefined}>
                            <i className={`fa-solid fa-clipboard-user text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Absen</span>}
                        </Link>
                        <Link href="/guru/penilaian" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/guru/penilaian') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Penilaian' : undefined}>
                            <i className={`fa-solid fa-award text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Penilaian</span>}
                        </Link>
                        <Link href="/guru/profile" className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/guru/profile') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Profile' : undefined}>
                            <i className={`fa-solid fa-user-gear text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Profil Saya</span>}
                        </Link>
                    </>
                )}

                {(user?.role === 'student' || !user?.role) && (
                    <>
                        <Link href={dashboardUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/siswa/dashboard') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Home' : undefined}>
                            <i className={`fa-solid fa-house text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Home</span>}
                        </Link>
                        <Link href={classUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/siswa/jadwal') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Jadwal' : undefined}>
                            <i className={`fa-solid fa-book-open text-center ${sidebarCollapsed ? 'text-[18px m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Jadwal Pelajaran</span>}
                        </Link>
                        <Link href={absenUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/siswa/absen') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Absensi' : undefined}>
                            <i className={`fa-solid fa-calendar-days text-center ${sidebarCollapsed ? 'text-[18px m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Absensi</span>}
                        </Link>
                        <Link href={nilaiUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/siswa/nilai') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Nilai' : undefined}>
                            <i className={`fa-solid fa-file-invoice text-center ${sidebarCollapsed ? 'text-[18px m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Nilai</span>}
                        </Link>
                        <Link href={profileUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} ${page.url.includes('/siswa/profile') ? 'bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold' : 'text-[#5b6478] dark:text-[#94a3b8]'}`} title={sidebarCollapsed ? 'Profil Saya' : undefined}>
                            <i className={`fa-solid fa-user text-center ${sidebarCollapsed ? 'text-[18px m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                            {!sidebarCollapsed && <span>Profil Saya</span>}
                        </Link>
                    </>
                )}

                <div className="mt-auto">
                    <Link
                        href="/logout"
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
                <header className="sticky top-0 z-30 bg-white dark:bg-[#111827] border-b border-[#e8ecf5] dark:border-[#1f2937] flex items-center gap-4 py-3.5 px-7 transition-colors duration-200">
                    <button
                        className="w-9.5 h-9.5 rounded-full border border-[#e8ecf5] dark:border-[#1f2937] bg-white dark:bg-[#111827] flex items-center justify-center text-[#7c869c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#f8fafc] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors"
                        id="menuToggle"
                        onClick={handleToggleSidebar}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6fcf6] dark:bg-[#00cca3]/15 text-[#00cca3] text-xs font-bold font-poppins">
                        <i className="fa-regular fa-calendar-days text-[11px]"></i>
                        {activeAcademicYear ? (
                            <>
                                <span className="hidden md:inline">
                                    Tahun Ajaran : {activeAcademicYear.year} - {activeAcademicYear.semester === 'odd' ? 'Ganjil' : 'Genap'}
                                </span>
                                <span className="md:hidden">
                                    TA : {activeAcademicYear.year} - {activeAcademicYear.semester === 'odd' ? '1' : '2'}
                                </span>
                            </>
                        ) : (
                            <span>Belum ada TA aktif</span>
                        )}
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
                                        alt={`${user?.name || 'User'} avatar`}
                                    />
                                    <div className="max-sm:hidden text-left">
                                        <div className="text-[14px] font-bold leading-tight text-[#182449] dark:text-white">{user?.name || 'User'}</div>
                                        <div className="text-[12px] text-[#7c869c] dark:text-[#94a3b8] capitalize">{user?.role || 'student'}</div>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 bg-white dark:bg-[#111827] text-[#182449] dark:text-white border border-[#e8ecf5] dark:border-[#1f2937] rounded-[12px] shadow-lg mt-1 p-1" align="end">
                                 {/* Tampilan Mobile (Nama & Role) */}
                                 <div className="sm:hidden px-3 py-2 border-b border-[#e8ecf5] dark:border-[#1f2937] mb-1">
                                     <div className="text-[14px] font-bold text-[#182449] dark:text-white">{user?.name || 'User'}</div>
                                     <div className="text-[12px] text-[#7c869c] dark:text-[#94a3b8] capitalize">{user?.role || 'student'}</div>
                                 </div>
                                 <DropdownMenuItem asChild className="focus:bg-[#e6fcf6] dark:focus:bg-[#00cca3]/10 focus:text-[#00cca3] hover:bg-[#e6fcf6] dark:hover:bg-[#00cca3]/10 hover:text-[#00cca3] text-[#5b6478] dark:text-[#94a3b8] cursor-pointer rounded-[8px]">
                                     <Link
                                         href={user?.role === 'teacher' ? '/guru/profile' : (user?.role === 'admin' ? '/admin/profile' : '/siswa/profile')}
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

                <main className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex-1 p-7">{children}</div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
