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

const InformaticsIllustration = () => (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }}>
        <rect width="200" height="120" fill="#e0f2fe" />
        <g transform="translate(45, 20)">
            {/* Monitor */}
            <rect x="10" y="10" width="90" height="60" fill="#1e293b" rx="6" />
            {/* Screen */}
            <rect x="16" y="16" width="78" height="42" fill="#0f172a" rx="2" />
            {/* Code lines */}
            <line x1="22" y1="24" x2="45" y2="24" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <line x1="22" y1="34" x2="65" y2="34" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
            <line x1="22" y1="44" x2="35" y2="44" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            {/* Stand */}
            <rect x="45" y="70" width="20" height="12" fill="#475569" />
            {/* Base */}
            <ellipse cx="55" cy="82" rx="25" ry="4" fill="#334155" />
        </g>
    </svg>
);

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

const EnglishIllustration = () => (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }}>
        <rect width="200" height="120" fill="#fef2f2" />
        <g transform="translate(45, 25)">
            <rect x="0" y="0" width="70" height="75" fill="#f43f5e" rx="6" />
            <rect x="12" y="8" width="50" height="58" fill="#fff" rx="2" />
            <line x1="20" y1="20" x2="52" y2="20" stroke="#fda4af" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="20" y1="32" x2="44" y2="32" stroke="#fda4af" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="20" y1="44" x2="48" y2="44" stroke="#fda4af" strokeWidth="3.5" strokeLinecap="round" />
            
            <path d="M 0,15 C -4,15 -4,22 0,22" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
            <path d="M 0,27 C -4,27 -4,34 0,34" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
            <path d="M 0,39 C -4,39 -4,46 0,46" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
            <path d="M 0,51 C -4,51 -4,58 0,58" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
        </g>
        <g transform="translate(110, 40) rotate(-35)">
            <rect x="0" y="0" width="65" height="14" fill="#fbbf24" rx="2" />
            <line x1="8" y1="0" x2="8" y2="5" stroke="#78350f" strokeWidth="1.5" />
            <line x1="16" y1="0" x2="16" y2="5" stroke="#78350f" strokeWidth="1.5" />
            <line x1="24" y1="0" x2="24" y2="5" stroke="#78350f" strokeWidth="1.5" />
            <line x1="32" y1="0" x2="32" y2="5" stroke="#78350f" strokeWidth="1.5" />
            <line x1="40" y1="0" x2="40" y2="5" stroke="#78350f" strokeWidth="1.5" />
            <line x1="48" y1="0" x2="48" y2="5" stroke="#78350f" strokeWidth="1.5" />
            <line x1="56" y1="0" x2="56" y2="5" stroke="#78350f" strokeWidth="1.5" />
        </g>
    </svg>
);

const JavaneseIllustration = () => (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }}>
        <rect width="200" height="120" fill="#eff6ff" />
        <g transform="translate(55, 20)">
            <rect x="0" y="0" width="85" height="80" fill="#2563eb" rx="8" />
            <rect x="75" y="0" width="10" height="80" fill="#1d4ed8" rx="2" />
            <rect x="14" y="14" width="46" height="52" fill="#3b82f6" rx="4" />
            <line x1="24" y1="28" x2="50" y2="28" stroke="#eff6ff" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="24" y1="44" x2="42" y2="44" stroke="#eff6ff" strokeWidth="4.5" strokeLinecap="round" />
        </g>
    </svg>
);

const SocialStudiesIllustration = () => (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }}>
        <rect width="200" height="120" fill="#f0fdf4" />
        <g transform="translate(50, 15)">
            <path d="M 40,10 C 60,35 60,70 40,80 C 20,70 20,35 40,10" fill="#3b82f6" />
            <path d="M 40,10 C 47,25 47,55 40,65 C 33,55 33,25 40,10" fill="#60a5fa" />
            <circle cx="40" cy="35" r="7" fill="#fff" />
            <circle cx="40" cy="35" r="4" fill="#f59e0b" />
            <path d="M 24,55 L 8,72 L 23,72 Z" fill="#ef4444" />
            <path d="M 56,55 L 72,72 L 57,72 Z" fill="#ef4444" />
            <path d="M 33,80 L 40,96 L 47,80 Z" fill="#f97316" />
            <path d="M 36,80 L 40,90 L 44,80 Z" fill="#fbbf24" />
        </g>
    </svg>
);

const VisualArtsIllustration = () => (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }}>
        <rect width="200" height="120" fill="#faf5ff" />
        <g transform="translate(40, 15)">
            <path d="M 30,10 C 70,-5 120,25 110,65 C 100,100 45,95 20,80 C -5,65 5,20 30,10" fill="#e9d5ff" />
            <ellipse cx="60" cy="50" rx="35" ry="25" fill="#fff" />
            <circle cx="45" cy="45" r="6.5" fill="#f43f5e" />
            <circle cx="75" cy="40" r="5.5" fill="#3b82f6" />
            <circle cx="62" cy="65" r="6" fill="#10b981" />
            <circle cx="48" cy="60" r="5" fill="#f59e0b" />
            
            <rect x="95" y="10" width="8" height="75" fill="#78350f" rx="2" transform="rotate(35 99 47)" />
            <path d="M 125,75 L 140,92 L 130,96 Z" fill="#1f2937" />
        </g>
    </svg>
);

const MusicIllustration = () => (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }}>
        <rect width="200" height="120" fill="#fffbeb" />
        <g transform="translate(60, 25)">
            <rect x="0" y="0" width="80" height="55" fill="#1e293b" rx="4" />
            <rect x="5" y="5" width="70" height="45" fill="#fff" />
            
            <line x1="15" y1="5" x2="15" y2="50" stroke="#64748b" strokeWidth="1" />
            <line x1="25" y1="5" x2="25" y2="50" stroke="#64748b" strokeWidth="1" />
            <line x1="35" y1="5" x2="35" y2="50" stroke="#64748b" strokeWidth="1" />
            <line x1="45" y1="5" x2="45" y2="50" stroke="#64748b" strokeWidth="1" />
            <line x1="55" y1="5" x2="55" y2="50" stroke="#64748b" strokeWidth="1" />
            <line x1="65" y1="5" x2="65" y2="50" stroke="#64748b" strokeWidth="1" />
            
            <rect x="11" y="5" width="8" height="28" fill="#1e293b" />
            <rect x="21" y="5" width="8" height="28" fill="#1e293b" />
            <rect x="38" y="5" width="8" height="28" fill="#1e293b" />
            <rect x="48" y="5" width="8" height="28" fill="#1e293b" />
            <rect x="58" y="5" width="8" height="28" fill="#1e293b" />
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

const indonesianDays: Record<string, string> = {
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    sunday: 'Minggu'
};

const getCurrentDayEnglish = (): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
};

const getIllustration = (title: string) => {
    const t = (title || '').toLowerCase();
    if (t.includes('math') || t.includes('matematika')) return <MathIllustration />;
    if (t.includes('chem') || t.includes('kimia')) return <ChemistryIllustration />;
    if (t.includes('science') || t.includes('ipa') || t.includes('alam') || t.includes('sains')) return <ScienceIllustration />;
    if (t.includes('jawa')) return <JavaneseIllustration />;
    if (t.includes('indonesia') || t.includes('english') || t.includes('inggris') || t.includes('bahasa')) return <EnglishIllustration />;
    if (t.includes('social') || t.includes('ips') || t.includes('sejarah') || t.includes('geografi')) return <SocialStudiesIllustration />;
    if (t.includes('art') || t.includes('seni') || t.includes('visual')) return <VisualArtsIllustration />;
    if (t.includes('music') || t.includes('musik')) return <MusicIllustration />;
    if (t.includes('informatika') || t.includes('komputer') || t.includes('ict') || t.includes('tik')) return <InformaticsIllustration />;
    return <ScienceIllustration />;
};

export default function Jadwal() {
    interface ScheduleItem {
        id: number | null;
        day: string;
        start_time: string | null;
        end_time: string | null;
        subject: { name: string; code: string; };
        teacher: { name: string; avatar_url: string | null; };
    }

    const { auth, schedules = [], classroom, activePeriod, activeAcademicYear } = usePage().props as unknown as {
        auth: { user: User };
        schedules: ScheduleItem[];
        classroom: { id: number; name: string; } | null;
        activePeriod: { id: number; year: string; semester: string; } | null;
        activeAcademicYear: { id: number; year: string; semester: string } | null;
    };
    const user = auth?.user;

    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'today'>('all');
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

    const dashboardUrl = '/siswa/dashboard';
    const classUrl = '/siswa/jadwal';
    const absenUrl = '/siswa/absen';
    const nilaiUrl = '/siswa/nilai';
    const profileUrl = '/siswa/profile';

    const classesList = schedules.map(item => {
        const dayLower = (item.day || '').toLowerCase();
        const indonesianDay = indonesianDays[dayLower] || (dayLower === 'unscheduled' ? 'Belum Dijadwalkan' : item.day);
        const currentDay = getCurrentDayEnglish();
        const isToday = dayLower === currentDay;

        let timeRange = 'Waktu Belum Diatur';
        if (item.start_time && item.end_time) {
            const formatTime = (timeStr: string) => {
                const parts = timeStr.split(':');
                if (parts.length >= 2) {
                    return `${parts[0]}.${parts[1]}`;
                }
                return timeStr;
            };
            timeRange = `${formatTime(item.start_time)} - ${formatTime(item.end_time)} WIB`;
        }

        return {
            title: item.subject.name,
            date: indonesianDay,
            time: timeRange,
            illustration: getIllustration(item.subject.name),
            teacher: {
                name: item.teacher.name,
                avatar: item.teacher.avatar_url || 'https://i.pravatar.cc/80?img=47',
            },
            today: isToday,
            isUnscheduled: dayLower === 'unscheduled'
        };
    });

    const filteredClasses = activeTab === 'all' 
        ? classesList 
        : classesList.filter(c => c.today);

    return (
        <>
            <Head>
                <title>Jadwal Pelajaran</title>
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
                    <Link href={classUrl} className={`flex items-center gap-3 rounded-[10px] text-[14.5px] mb-[2px] cursor-pointer hover:bg-[#f2f4fa] dark:hover:bg-[#1f2937] hover:text-[#182449] dark:hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'} bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00cca3] font-semibold`} title={sidebarCollapsed ? 'Jadwal' : undefined}>
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
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-6 transition-all duration-200 shadow-sm">
                            <div>
                                <h1 className="text-2xl font-bold text-[#182449] dark:text-white font-poppins">Jadwal Pelajaran</h1>
                                <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] mt-1">
                                    {classroom
                                        ? `Daftar jadwal mata pelajaran Anda di kelas ${classroom.name}.`
                                        : 'Informasi kelas dan jadwal pelajaran akademik Anda.'}
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

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-6 py-2.5 rounded-full text-[14.5px] font-semibold border transition-all cursor-pointer ${
                                    activeTab === 'all'
                                        ? 'bg-[#00cca3] text-white border-[#00cca3]'
                                        : 'bg-white dark:bg-[#111827] text-[#7c869c] dark:text-[#94a3b8] border-[#e8ecf5] dark:border-[#1f2937] hover:bg-[#f8fafc] dark:hover:bg-[#1f2937]'
                                }`}
                            >
                                Semua Jadwal
                            </button>
                            <button
                                onClick={() => setActiveTab('today')}
                                className={`px-6 py-2.5 rounded-full text-[14.5px] font-semibold border transition-all cursor-pointer ${
                                    activeTab === 'today'
                                        ? 'bg-[#00cca3] text-white border-[#00cca3]'
                                        : 'bg-white dark:bg-[#111827] text-[#7c869c] dark:text-[#94a3b8] border-[#e8ecf5] dark:border-[#1f2937] hover:bg-[#f8fafc] dark:hover:bg-[#1f2937]'
                                }`}
                            >
                                Jadwal Hari Ini
                            </button>
                        </div>

                        {/* Class cards grid */}
                        <div className="grid grid-cols-4 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, idx) => (
                                    <CardSkeleton key={idx} />
                                ))
                            ) : filteredClasses.length === 0 ? (
                                <div className="col-span-4 bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-[#f2f4fa] dark:bg-[#1f2937] flex items-center justify-center text-[#00cca3] text-2xl">
                                        <i className="fa-solid fa-calendar-xmark"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-poppins text-lg font-bold text-[#182449] dark:text-white mb-1">
                                            Tidak Ada Jadwal Pelajaran
                                        </h4>
                                        <p className="text-sm text-[#7c869c] dark:text-[#94a3b8] max-w-md mx-auto">
                                            {activeTab === 'today'
                                                ? 'Tidak ada jadwal pelajaran untuk hari ini. Silakan periksa tab "Semua Kelas".'
                                                : 'Anda belum terdaftar di kelas mana pun atau tidak ada jadwal mengajar pada tahun ajaran ini.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                filteredClasses.map((cls, idx) => (
                                    <div
                                        className="bg-white dark:bg-[#111827] border border-[#e8ecf5] dark:border-[#1f2937] rounded-[16px] p-4 flex flex-col gap-3 hover:shadow-lg transition-all duration-200"
                                        key={idx}
                                    >
                                        <div className="rounded-[12px] overflow-hidden aspect-[5/3]">
                                            {cls.illustration}
                                        </div>
                                        <h4 className="font-poppins text-[16px] font-bold text-[#182449] dark:text-[#f8fafc] m-0">
                                            {cls.title}
                                        </h4>
                                        <div className="flex flex-col gap-1.5 text-[12.5px] text-[#7c869c] dark:text-[#94a3b8]">
                                            <div className="flex items-center gap-2">
                                                <i className="fa-solid fa-calendar-days" style={{ color: cls.isUnscheduled ? '#94a3b8' : '#ff7e67' }}></i>
                                                <span className={cls.isUnscheduled ? 'text-zinc-400 dark:text-zinc-500 font-medium' : ''}>{cls.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <i className="fa-regular fa-clock" style={{ color: cls.isUnscheduled ? '#94a3b8' : '#ffcc00' }}></i>
                                                <span className={cls.isUnscheduled ? 'text-zinc-400 dark:text-zinc-500' : ''}>{cls.time}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 border-t border-[#e8ecf5] dark:border-[#1f2937] pt-3 mt-1">
                                            <img
                                                src={cls.teacher.avatar}
                                                alt="Teacher"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div className="text-left">
                                                <div className="text-[13px] font-semibold text-[#182449] dark:text-[#f8fafc]">
                                                    {cls.teacher.name}
                                                </div>
                                                <div className="text-[11px] text-[#7c869c] dark:text-[#94a3b8]">Pengajar</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </main>

                    <Footer />
                </div>
            </div>
        </>
    );
}
