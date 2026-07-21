import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import Footer from '@/components/footer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';

type AttendanceRecord = {
    id: number;
    date: string;
    status: 'present' | 'sick' | 'permission' | 'absent';
    subject: {
        name: string;
        code: string;
    };
    teacher: {
        name: string;
    };
};

type Props = {
    attendances: AttendanceRecord[];
    stats: {
        present: number;
        sick: number;
        permission: number;
        absent: number;
        percentage: number;
    };
    classroom: {
        id: number;
        name: string;
    } | null;
    activePeriod: {
        id: number;
        year: string;
        semester: string;
    } | null;
};

const statusConfig = {
    present: {
        label: 'Hadir',
        color: 'text-[#10b981] bg-[#e6fcf6] dark:bg-[#10b981]/10 border-[#10b981]/20',
        dot: 'bg-[#10b981]',
    },
    sick: {
        label: 'Sakit',
        color: 'text-[#f59e0b] bg-[#fef3c7] dark:bg-[#f59e0b]/10 border-[#f59e0b]/20',
        dot: 'bg-[#f59e0b]',
    },
    permission: {
        label: 'Izin',
        color: 'text-[#3b82f6] bg-[#dbeafe] dark:bg-[#3b82f6]/10 border-[#3b82f6]/20',
        dot: 'bg-[#3b82f6]',
    },
    absent: {
        label: 'Alfa',
        color: 'text-[#ef4444] bg-[#fee2e2] dark:bg-[#ef4444]/10 border-[#ef4444]/20',
        dot: 'bg-[#ef4444]',
    },
};

export default function Absen() {
    const { auth, attendances = [], stats, classroom, activePeriod, activeAcademicYear } = usePage().props as unknown as {
        auth: { user: User };
        activeAcademicYear: { id: number; year: string; semester: string } | null;
    } & Props;
    const user = auth?.user;

    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    };

    const filteredRecords = attendances.filter(record => {
        const query = searchQuery.trim();
        if (!query) return true;
        return record.date === query;
    });

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

    return (
        <>
            <Head>
                <title>Absensi</title>
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
                    <Link href={absenUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold`} title={sidebarCollapsed ? 'Absensi' : undefined}>
                        <i className={`fa-solid fa-calendar-days text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                        {!sidebarCollapsed && <span>Absensi</span>}
                    </Link>
                    <Link href={nilaiUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] font-medium mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} text-[#5b6478] dark:text-[#94a3b8]`} title={sidebarCollapsed ? 'Nilai' : undefined}>
                        <i className={`fa-solid fa-file-invoice text-center ${sidebarCollapsed ? 'text-[18px] m-0 w-auto' : 'text-[15px] w-[18px]'}`}></i>
                        {!sidebarCollapsed && <span>Nilai</span>}
                    </Link>
                    <Link href={profileUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} text-[#5b6478] dark:text-[#94a3b8]`} title={sidebarCollapsed ? 'Profil Saya' : undefined}>
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
                                             href={user?.role === 'teacher' ? '/guru/profile' : (user?.role === 'admin' ? '/admin/profile' : '/profile')}
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
                        {/* Welcome Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-6 transition-all duration-200 shadow-sm">
                            <div>
                                <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Laporan Presensi</h1>
                                <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">
                                    {classroom
                                        ? `Rekapitulasi kehadiran Anda di kelas ${classroom.name}.`
                                        : 'Informasi kelas dan rekapitulasi kehadiran akademik Anda.'}
                                </p>
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

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                            {/* Present Card */}
                            <div className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#10b981] flex items-center justify-center text-xl shrink-0">
                                    <i className="fa-solid fa-circle-check"></i>
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold text-[#7c869c] dark:text-[#94a3b8]">Hadir</div>
                                    <div className="text-[24px] font-bold text-[#182449] dark:text-white mt-0.5">{stats?.present}</div>
                                </div>
                            </div>

                            {/* Sick Card */}
                            <div className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/20 text-[#f59e0b] flex items-center justify-center text-xl shrink-0">
                                    <i className="fa-solid fa-file-medical"></i>
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold text-[#7c869c] dark:text-[#94a3b8]">Sakit</div>
                                    <div className="text-[24px] font-bold text-[#182449] dark:text-white mt-0.5">{stats?.sick}</div>
                                </div>
                            </div>

                            {/* Permission Card */}
                            <div className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/20 text-[#3b82f6] flex items-center justify-center text-xl shrink-0">
                                    <i className="fa-solid fa-envelope-open-text"></i>
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold text-[#7c869c] dark:text-[#94a3b8]">Izin</div>
                                    <div className="text-[24px] font-bold text-[#182449] dark:text-white mt-0.5">{stats?.permission}</div>
                                </div>
                            </div>

                            {/* Absent Card */}
                            <div className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-[#ef4444] flex items-center justify-center text-xl shrink-0">
                                    <i className="fa-solid fa-circle-xmark"></i>
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold text-[#7c869c] dark:text-[#94a3b8]">Alfa</div>
                                    <div className="text-[24px] font-bold text-[#182449] dark:text-white mt-0.5">{stats?.absent}</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Attendance Records */}
                        <div className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#e8ecf5] dark:border-[#1f2937]">
                                <div>
                                    <h3 className="font-poppins text-lg font-bold text-[#182449] dark:text-white">Riwayat Kehadiran</h3>
                                    <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-0.5">Daftar riwayat presensi kehadiran Anda.</p>
                                </div>

                                {/* Search bar */}
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <span className="text-[14px] font-semibold text-[#182449] dark:text-[#94a3b8] shrink-0">Cari Tanggal:</span>
                                    <div className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-[#e8ecf5] dark:border-[#1f2937] bg-white dark:bg-[#0b0f19] focus-within:border-[#00cca3] focus-within:ring-1 focus-within:ring-[#00cca3] transition-all w-full sm:w-auto flex-1">
                                        <input
                                            type="date"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-[13.5px] text-[#182449] dark:text-white cursor-pointer font-medium focus:ring-0 p-0"
                                            style={{ colorScheme: resolvedAppearance === 'dark' ? 'dark' : 'light' }}
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="w-5 h-5 rounded-full bg-[#e8ecf5] dark:bg-[#1f2937] hover:bg-red-100 dark:hover:bg-red-950/40 text-[#182449] dark:text-[#f8fafc] hover:text-[#ef4444] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1.5"
                                                title="Hapus filter"
                                            >
                                                <i className="fa-solid fa-xmark text-[10px]"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse mt-3">
                                    <thead>
                                        <tr className="border-b border-[#e8ecf5] dark:border-[#1f2937]">
                                            <th className="py-4 text-[13px] font-bold text-[#7c869c] dark:text-[#94a3b8] uppercase tracking-wide">Tanggal</th>
                                            <th className="py-4 px-4 text-[13px] font-bold text-[#7c869c] dark:text-[#94a3b8] uppercase tracking-wide">Mapel</th>
                                            <th className="py-4 px-4 text-[13px] font-bold text-[#7c869c] dark:text-[#94a3b8] uppercase tracking-wide">Pengajar</th>
                                            <th className="py-4 text-[13px] font-bold text-[#7c869c] dark:text-[#94a3b8] uppercase tracking-wide">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            Array.from({ length: 3 }).map((_, idx) => (
                                                <tr key={idx} className="border-b border-[#e8ecf5] dark:border-[#1f2937] animate-pulse">
                                                    <td className="py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                                                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40"></div></td>
                                                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                                                    <td className="py-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div></td>
                                                </tr>
                                            ))
                                        ) : currentRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center">
                                                    <div className="w-12 h-12 rounded-full bg-[#f2f4fa] dark:bg-[#1f2937] text-[#a7afc2] dark:text-[#4b5563] flex items-center justify-center text-lg mx-auto mb-3">
                                                        <i className="fa-solid fa-inbox"></i>
                                                    </div>
                                                    <h4 className="font-poppins text-[15px] font-bold text-[#182449] dark:text-white">Tidak ada data presensi</h4>
                                                    <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-0.5">Belum ada riwayat kehadiran tercatat atau tidak cocok dengan pencarian.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentRecords.map((record) => {
                                                const status = statusConfig[record.status] || { label: record.status, color: 'text-zinc-500 bg-zinc-100', dot: 'bg-zinc-400' };
                                                return (
                                                    <tr key={record.id} className="border-b border-[#e8ecf5] dark:border-[#1f2937] hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                                                        <td className="py-4 text-[14px] font-medium text-[#182449] dark:text-zinc-200">
                                                            {formatDate(record.date)}
                                                        </td>
                                                        <td className="py-4 px-4 text-[14px]">
                                                            <div className="font-semibold text-[#182449] dark:text-white">{record.subject.name}</div>
                                                            <div className="text-[11.5px] text-[#7c869c] dark:text-[#94a3b8] mt-0.5">{record.subject.code}</div>
                                                        </td>
                                                        <td className="py-4 px-4 text-[14px] text-[#7c869c] dark:text-[#94a3b8]">
                                                            {record.teacher.name}
                                                        </td>
                                                        <td className="py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border ${status.color}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                                                {status.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-5 mt-4 border-t border-[#e8ecf5] dark:border-[#1f2937]">
                                    <div className="text-[13px] text-[#7c869c] dark:text-[#94a3b8]">
                                        Menampilkan <span className="font-semibold text-[#182449] dark:text-white">{indexOfFirstRecord + 1}</span> sampai{' '}
                                        <span className="font-semibold text-[#182449] dark:text-white">
                                            {Math.min(indexOfLastRecord, filteredRecords.length)}
                                        </span>{' '}
                                        dari <span className="font-semibold text-[#182449] dark:text-white">{filteredRecords.length}</span> data
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="h-9 px-3 rounded-lg border border-[#e8ecf5] dark:border-[#1f2937] text-[#7c869c] dark:text-[#94a3b8] bg-white dark:bg-[#111827] text-[13px] font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-[#182449] dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            <i className="fa-solid fa-chevron-left mr-1"></i> Prev
                                        </button>

                                        {Array.from({ length: totalPages }).map((_, idx) => {
                                            const pageNum = idx + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-9 h-9 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                                                        currentPage === pageNum
                                                            ? 'bg-[#00cca3] text-white'
                                                            : 'border border-[#e8ecf5] dark:border-[#1f2937] text-[#7c869c] dark:text-[#94a3b8] bg-white dark:bg-[#111827] hover:bg-zinc-50 dark:hover:bg-[#1f2937]'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="h-9 px-3 rounded-lg border border-[#e8ecf5] dark:border-[#1f2937] text-[#7c869c] dark:text-[#94a3b8] bg-white dark:bg-[#111827] text-[13px] font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-[#182449] dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            Next <i className="fa-solid fa-chevron-right ml-1"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>

                    <Footer />
                </div>
            </div>
        </>
    );
}
