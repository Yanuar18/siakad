import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { DashboardInvitation, User } from '@/types';
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

type Props = {
    pendingInvitations?: DashboardInvitation[];
    classroom: {
        id: number;
        name: string;
    } | null;
    todayClasses: Array<{
        id: number | null;
        day: string;
        start_time: string | null;
        end_time: string | null;
        subject: {
            name: string;
            code: string;
        };
        teacher: {
            name: string;
            avatar_url: string | null;
        };
    }>;
    attendanceStats: {
        present: number;
        sick: number;
        permission: number;
        absent: number;
        total: number;
    };
    activePeriod: {
        id: number;
        year: string;
        semester: string;
    } | null;
};

const MathIllustration = () => (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }}>
        <rect width="200" height="120" fill="#e6fcf6" />
        <path d="M 0 20 L 200 20 M 0 40 L 200 40 M 0 60 L 200 60 M 0 80 L 200 80 M 0 100 L 200 100" stroke="#bfeee5" strokeWidth="0.5" />
        <path d="M 20 0 L 20 120 M 40 0 L 40 120 M 60 0 L 60 120 M 80 0 L 80 120 M 100 0 L 100 120 M 120 0 L 120 120 M 140 0 L 140 120 M 160 0 L 160 120 M 180 0 L 180 120" stroke="#bfeee5" strokeWidth="0.5" />
        <polygon points="50,90 110,90 80,40" fill="none" stroke="#ff7e67" strokeWidth="4" strokeLinejoin="round" />
        <path d="M 120,40 L 140,85 M 120,40 L 100,85 M 120,30 L 120,40" stroke="#4b5563" strokeWidth="3" strokeLinecap="round" />
        <circle cx="120" cy="30" r="4" fill="#374151" />
        <text x="30" y="40" fill="#00cca3" fontSize="16" fontWeight="bold" fontFamily="sans-serif">+</text>
        <text x="160" y="45" fill="#10b981" fontSize="16" fontWeight="bold" fontFamily="sans-serif">÷</text>
        <text x="160" y="90" fill="#f59e0b" fontSize="16" fontWeight="bold" fontFamily="sans-serif">%</text>
        <text x="35" y="85" fill="#8b5cf6" fontSize="14" fontWeight="bold" fontFamily="sans-serif">x</text>
    </svg>
);

const ScienceIllustration = () => (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }}>
        <rect width="200" height="120" fill="#e0f2fe" />
        <circle cx="40" cy="30" r="2" fill="#fff" />
        <circle cx="160" cy="40" r="1.5" fill="#fff" />
        <circle cx="80" cy="20" r="1" fill="#fff" />
        <circle cx="50" cy="90" r="1.5" fill="#fff" />
        <circle cx="150" cy="30" r="14" fill="#fed7aa" />
        <circle cx="145" cy="25" r="3" fill="#fdba74" />
        <circle cx="154" cy="34" r="2" fill="#fdba74" />
        <g transform="translate(70, 20) rotate(15)">
            <path d="M 15,65 Q 20,80 20,90 Q 15,80 15,65" fill="#f97316" />
            <path d="M 25,65 Q 20,80 20,90 Q 25,80 25,65" fill="#f97316" />
            <rect x="18" y="25" width="4" height="40" fill="#cbd5e1" rx="1" />
            <path d="M 10,65 L 30,65 L 34,90 C 35,95 5,95 6,90 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
            <ellipse cx="20" cy="78" rx="7" ry="4" fill="#38bdf8" />
            <ellipse cx="16" cy="84" rx="9" ry="5" fill="#0284c7" />
        </g>
        <g transform="translate(30, 45)">
            <line x1="0" y1="30" x2="30" y2="0" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
            <line x1="10" y1="30" x2="40" y2="0" stroke="#93c5fd" strokeWidth="2" />
            <line x1="20" y1="30" x2="50" y2="0" stroke="#93c5fd" strokeWidth="1" />
        </g>
    </svg>
);

const CardSkeleton = () => (
    <div className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-4 flex flex-col gap-3 animate-pulse shadow-sm w-full">
        <div className="rounded-[12px] bg-slate-200 dark:bg-slate-800 aspect-[5/3] w-full"></div>
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mt-1"></div>
        <div className="flex flex-col gap-2 mt-1">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div>
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3"></div>
        </div>
        <div className="flex items-center gap-2.5 border-t border-[#e8ecf5] dark:border-[#1f2937] pt-3 mt-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3"></div>
            </div>
        </div>
    </div>
);

const ChemistryIllustration = () => (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }}>
        <rect width="200" height="120" fill="#fdf2f8" />
        <circle cx="150" cy="40" r="12" fill="#fbcfe8" />
        <circle cx="158" cy="35" r="3.5" fill="#f472b6" />
        <circle cx="144" cy="45" r="2.5" fill="#f472b6" />
        <g transform="translate(60, 20)">
            <path d="M 20,10 L 30,10 M 22,10 L 22,25 L 45,60 C 52,70 48,85 25,85 C 2,85 -2,70 5,60 L 28,25 L 28,10" fill="none" stroke="#374151" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="45" r="3" fill="#34d399" />
            <circle cx="32" cy="55" r="4.5" fill="#34d399" />
            <circle cx="25" cy="65" r="3.5" fill="#a7f3d0" />
        </g>
    </svg>
);

export default function SiswaDashboard() {
    const { auth, classroom, todayClasses = [], attendanceStats, activePeriod, activeAcademicYear } = usePage().props as unknown as {
        auth: { user: User };
        activeAcademicYear: { id: number; year: string; semester: string } | null;
    } & Props;
    const user = auth?.user;
    const dashboardUrl = '/siswa/dashboard';
    const classUrl = '/siswa/jadwal';
    const absenUrl = '/siswa/absen';
    const nilaiUrl = '/siswa/nilai';
    const profileUrl = '/siswa/profile';

    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [animateRings, setAnimateRings] = useState(false);

    const [currentClassIndex, setCurrentClassIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);


    const handleToggleSidebar = () => {
        if (window.innerWidth <= 760) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setAnimateRings(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 760);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const R = 40;
    const C = 2 * Math.PI * R;

    const getIllustration = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('math') || lower.includes('matematika')) return <MathIllustration />;
        if (lower.includes('chem') || lower.includes('kimia') || lower.includes('ipa') || lower.includes('science') || lower.includes('sains') || lower.includes('fisika') || lower.includes('biologi')) return <ChemistryIllustration />;
        return <ScienceIllustration />;
    };

    const classes = todayClasses.map(cls => {
        const formatTime = (timeStr: string | null) => {
            if (!timeStr) return '';
            const parts = timeStr.split(':');
            return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : timeStr;
        };
        const timeRange = cls.start_time && cls.end_time 
            ? `${formatTime(cls.start_time)} - ${formatTime(cls.end_time)} WIB`
            : 'Waktu Belum Diatur';
        
        return {
            title: cls.subject.name,
            date: 'Hari Ini',
            time: timeRange,
            illustration: getIllustration(cls.subject.name),
            teacher: {
                name: cls.teacher.name,
                avatar: cls.teacher.avatar_url || 'https://i.pravatar.cc/80?img=47',
            }
        };
    });

    const handlePrevClass = () => {
        if (classes.length === 0) return;
        const step = isMobile ? 1 : 3;
        setCurrentClassIndex((prev) => Math.max(0, prev - step));
    };

    const handleNextClass = () => {
        if (classes.length === 0) return;
        const step = isMobile ? 1 : 3;
        setCurrentClassIndex((prev) => {
            const maxIndex = isMobile ? classes.length - 1 : Math.max(0, classes.length - 3);
            return Math.min(maxIndex, prev + step);
        });
    };

    const rings = [
        { value: attendanceStats?.present || 0, total: attendanceStats?.total || 0, label: 'Hadir', color: '#00cca3' },
        { value: attendanceStats?.sick || 0, total: attendanceStats?.total || 0, label: 'Sakit', color: '#ffcc00' },
        { value: attendanceStats?.permission || 0, total: attendanceStats?.total || 0, label: 'Izin', color: '#38bdf8' },
        { value: attendanceStats?.absent || 0, total: attendanceStats?.total || 0, label: 'Alfa', color: '#e35d6a' },
    ];

    return (
        <>
            <Head>
                <title>Dashboard Siswa</title>
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
                    <Link href={dashboardUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold`} title={sidebarCollapsed ? 'Home' : undefined}>
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
                    <Link href={profileUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] font-medium mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} text-[#5b6478] dark:text-[#94a3b8]`} title={sidebarCollapsed ? 'Profil Saya' : undefined}>
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6fcf6] dark:bg-[#00cca3]/15 text-[#00cca3] text-xs font-bold font-poppins">
                            <i className="fa-regular fa-calendar-days text-[11px]"></i>
                            {activeAcademicYear ? (
                                <>
                                    <span className="hidden md:inline">Tahun Ajaran : {activeAcademicYear.year} - {activeAcademicYear.semester === 'odd' ? 'Ganjil' : 'Genap'}</span>
                                    <span className="md:hidden">TA : {activeAcademicYear.year} - {activeAcademicYear.semester === 'odd' ? '1' : '2'}</span>
                                </>
                            ) : <span>Belum ada TA aktif</span>}
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
                                            <div className="text-[14px] font-bold leading-tight text-[#182449] dark:text-white">{user?.name || 'Aurora'}</div>
                                            <div className="text-[12px] text-[#7c869c] dark:text-[#94a3b8] capitalize">{user?.role === 'student' ? 'Siswa' : (user?.role || 'siswa')}</div>
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 bg-white dark:bg-[#111827] text-[#182449] dark:text-white border border-[#e8ecf5] dark:border-[#1f2937] rounded-[12px] shadow-lg mt-1 p-1" align="end">
                                    <div className="sm:hidden px-3 py-2 border-b border-[#e8ecf5] dark:border-[#1f2937] mb-1">
                                        <div className="text-[14px] font-bold text-[#182449] dark:text-white">{user?.name || 'Aurora'}</div>
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

                    {/* ================= DASHBOARD ================= */}
                    <main className="grid grid-cols-[1fr_330px] gap-[22px] p-7 max-lg:grid-cols-1">
                        <div className="flex flex-col gap-[22px] min-w-0">
                            {/* Welcome banner */}
                            <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#182449] to-[#00cca3] text-white py-8.5 px-9">
                                <div className="absolute rounded-full w-[140px] h-[140px] border-[20px] border-white/10 -top-[30px] right-5"></div>
                                <div className="absolute rounded-full w-[200px] h-[200px] border-[20px] border-white/5 -bottom-[80px] -right-10"></div>
                                <h1 className="font-poppins text-[24px] font-semibold m-0 mb-1.5">Selamat datang, {user ? user.name.split(' ')[0] : '-'} 👋</h1>
                                <p className="m-0 text-[14.5px] text-[#e0fcf7] max-w-[520px] opacity-90 leading-relaxed">Jangan lupa untuk tetap semangat!</p>
                            </div>

                            {/* Today's Class Header & Grid */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-poppins text-[16px] font-bold text-[#182449] dark:text-[#f8fafc] m-0">Jadwal Hari Ini</h3>
                                    {classes.length > (isMobile ? 1 : 3) && (
                                        <div className="flex gap-2">
                                            <button className="w-8.5 h-8.5 rounded-full border border-[#00cca3] bg-[#00cca3] text-white flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-[#009e7e] active:scale-95" onClick={handlePrevClass}>
                                                <i className="fa-solid fa-chevron-left"></i>
                                            </button>
                                            <button className="w-8.5 h-8.5 rounded-full border border-[#00cca3] bg-[#00cca3] text-white flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-[#009e7e] active:scale-95" onClick={handleNextClass}>
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                                    {loading ? (
                                        Array.from({ length: 3 }).map((_, idx) => (
                                            <CardSkeleton key={idx} />
                                        ))
                                    ) : classes.length === 0 ? (
                                        <div className="col-span-3 bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-8 text-center flex flex-col items-center justify-center min-h-[220px] w-full">
                                            <div className="w-14 h-14 rounded-full bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] flex items-center justify-center text-2xl mb-4">
                                                <i className="fa-solid fa-calendar-check"></i>
                                            </div>
                                            <h4 className="font-poppins text-[16px] font-bold text-[#182449] dark:text-[#f8fafc] m-0">Tidak Ada Jadwal Hari Ini</h4>
                                            <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1.5 mb-0">Nikmati waktu luang Anda atau persiapkan diri untuk kelas berikutnya!</p>
                                        </div>
                                    ) : isMobile ? (
                                        <div className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-200 animate-slide-in w-full" key={currentClassIndex}>
                                            <div className="rounded-[12px] overflow-hidden aspect-[5/3]">
                                                {classes[currentClassIndex]?.illustration}
                                            </div>
                                            <h4 className="font-poppins text-[16px] font-bold text-[#182449] dark:text-[#f8fafc] m-0">{classes[currentClassIndex]?.title}</h4>
                                            <div className="flex flex-col gap-1.5 text-[12.5px] text-[#7c869c] dark:text-[#94a3b8]">
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-solid fa-calendar-days" style={{ color: '#ff7e67' }}></i>
                                                    <span>{classes[currentClassIndex]?.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-regular fa-clock" style={{ color: '#ffcc00' }}></i>
                                                    <span>{classes[currentClassIndex]?.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 border-t border-[#e8ecf5] dark:border-[#1f2937] pt-3 mt-1">
                                                <img src={classes[currentClassIndex]?.teacher.avatar} alt="Teacher" className="w-8 h-8 rounded-full object-cover" />
                                                <div className="text-left">
                                                    <div className="text-[13px] font-semibold text-[#182449] dark:text-[#f8fafc]">{classes[currentClassIndex]?.teacher.name}</div>
                                                    <div className="text-[11px] text-[#7c869c] dark:text-[#94a3b8]">Guru</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Desktop: show 3 cards at a time, paginate with currentClassIndex as page offset
                                        classes.slice(currentClassIndex, currentClassIndex + 3).map((cls, idx) => (
                                            <div className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-200" key={currentClassIndex + idx}>
                                                <div className="rounded-[12px] overflow-hidden aspect-[5/3]">
                                                    {cls.illustration}
                                                </div>
                                                <h4 className="font-poppins text-[16px] font-bold text-[#182449] dark:text-[#f8fafc] m-0">{cls.title}</h4>
                                                <div className="flex flex-col gap-1.5 text-[12.5px] text-[#7c869c] dark:text-[#94a3b8]">
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-solid fa-calendar-days" style={{ color: '#ff7e67' }}></i>
                                                        <span>{cls.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-regular fa-clock" style={{ color: '#ffcc00' }}></i>
                                                        <span>{cls.time}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5 border-t border-[#e8ecf5] dark:border-[#1f2937] pt-3 mt-1">
                                                    <img src={cls.teacher.avatar} alt="Teacher" className="w-8 h-8 rounded-full object-cover" />
                                                    <div className="text-left">
                                                        <div className="text-[13px] font-semibold text-[#182449] dark:text-[#f8fafc]">{cls.teacher.name}</div>
                                                        <div className="text-[11px] text-[#7c869c] dark:text-[#94a3b8]">Pengajar</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ============= RIGHT COLUMN ============= */}
                        <div className="flex flex-col gap-[22px]">
                            {/* Attendance Section */}
                            <div className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-5 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-poppins text-[15px] font-bold text-[#182449] dark:text-[#f8fafc]">Kehadiran</h3>
                                    <span className="text-[11.5px] font-semibold text-[#00cca3] bg-[#e6fcf6] dark:bg-[#00cca3]/15 px-2.5 py-1 rounded-full">
                                        Total: {attendanceStats?.total || 0}x
                                    </span>
                                </div>

                                {/* Donut + Percentage */}
                                {(() => {
                                    const total = attendanceStats?.total || 0;
                                    const present = attendanceStats?.present || 0;
                                    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                                    const R = 36;
                                    const C = 2 * Math.PI * R;
                                    const offset = total > 0 ? C - (present / total) * C : C;
                                    return (
                                        <div className="flex items-center gap-5 mb-5 pb-5 border-b border-[#f1f5f9] dark:border-[#1f2937]">
                                            <div className="relative w-[88px] h-[88px] flex items-center justify-center shrink-0">
                                                <svg width="88" height="88" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                                    <circle cx="50" cy="50" r={R} fill="none" stroke="#f1f5f9" className="dark:stroke-[#1f2937]" strokeWidth="10" />
                                                    <circle
                                                        cx="50" cy="50" r={R} fill="none"
                                                        stroke="#00cca3" strokeWidth="10"
                                                        strokeLinecap="round"
                                                        strokeDasharray={C}
                                                        strokeDashoffset={animateRings ? offset : C}
                                                        className="transition-[stroke-dashoffset] duration-1000 ease-in-out"
                                                    />
                                                </svg>
                                                <div className="absolute flex flex-col items-center">
                                                    <span className="text-[18px] font-extrabold text-[#182449] dark:text-white font-poppins leading-none">{pct}%</span>
                                                    <span className="text-[9.5px] text-[#7c869c] dark:text-[#94a3b8] font-medium mt-0.5">Hadir</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-semibold text-[#182449] dark:text-white mb-0.5">{present} dari {total} pertemuan</div>
                                                <div className="text-[12px] text-[#7c869c] dark:text-[#94a3b8]">Tingkat kehadiran semester ini</div>
                                                <div className="mt-2.5 h-2 rounded-full bg-[#f1f5f9] dark:bg-[#1f2937] overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-[#00cca3] transition-[width] duration-1000 ease-in-out"
                                                        style={{ width: animateRings ? `${pct}%` : '0%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Stats List */}
                                <div className="flex flex-col gap-2.5">
                                    {[
                                        { label: 'Hadir', value: attendanceStats?.present || 0, color: '#00cca3', bg: 'bg-[#e6fcf6] dark:bg-[#00cca3]/10', icon: 'fa-solid fa-circle-check' },
                                        { label: 'Sakit', value: attendanceStats?.sick || 0, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: 'fa-solid fa-kit-medical' },
                                        { label: 'Izin', value: attendanceStats?.permission || 0, color: '#38bdf8', bg: 'bg-sky-50 dark:bg-sky-500/10', icon: 'fa-solid fa-file-circle-check' },
                                        { label: 'Alfa', value: attendanceStats?.absent || 0, color: '#e35d6a', bg: 'bg-rose-50 dark:bg-rose-500/10', icon: 'fa-solid fa-circle-xmark' },
                                    ].map((s, i) => (
                                        <div key={i} className={`${s.bg} rounded-[12px] px-4 py-3 flex items-center gap-3.5`}>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}25` }}>
                                                <i className={`${s.icon} text-[13px]`} style={{ color: s.color }} />
                                            </div>
                                            <span className="text-[18px] font-extrabold font-poppins leading-none" style={{ color: s.color }}>{s.value}</span>
                                            <span className="text-[13px] font-semibold text-[#7c869c] dark:text-[#94a3b8]">{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>

                    <Footer />
                </div>
            </div>
        </>
    );
}
