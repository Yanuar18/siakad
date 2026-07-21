import React, { useEffect, useState } from 'react';

export default function DigitalClock() {
    const [timeStrFull, setTimeStrFull] = useState('');
    const [timeStrShort, setTimeStrShort] = useState('');
    const [dateStrFull, setDateStrFull] = useState('');
    const [dateStrShort, setDateStrShort] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const d = new Date();
            const dateStr = d.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
            const jkt = new Date(dateStr);

            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

            const h = String(jkt.getHours()).padStart(2, '0');
            const m = String(jkt.getMinutes()).padStart(2, '0');
            const s = String(jkt.getSeconds()).padStart(2, '0');

            const dayIdx = jkt.getDay();
            const mIdx = jkt.getMonth();
            const y = jkt.getFullYear();

            const dNum = String(jkt.getDate()).padStart(2, '0');
            const mNum = String(jkt.getMonth() + 1).padStart(2, '0');
            const shortY = String(y).substring(2);

            setTimeStrFull(`${h}:${m}:${s}`);
            setTimeStrShort(`${h}:${m}`);
            setDateStrFull(`${days[dayIdx]}, ${jkt.getDate()} ${months[mIdx]} ${y}`);
            setDateStrShort(`${days[dayIdx]}, ${dNum}/${mNum}/${shortY}`);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="ml-1.5 flex items-center gap-2 sm:gap-3 bg-[#f4f6fb] dark:bg-[#111827] px-4 py-1.5 rounded-full border border-[#e8ecf5] dark:border-[#1f2937] shadow-sm select-none">
            {/* Tampilan Mobile (Hari, Tanggal) */}
            <div className="flex items-center gap-1.5 text-[#182449] dark:text-[#f8fafc] font-semibold text-[13px] whitespace-nowrap sm:hidden">
                <span>{dateStrShort}</span>
            </div>

            {/* Tampilan Desktop (Jam Lengkap & Tanggal Panjang) */}
            <div className="hidden sm:flex items-center gap-1.5 text-[#00cca3] font-bold text-[13px] whitespace-nowrap">
                <i className="fa-regular fa-clock text-[16px] animate-pulse"></i>
                <span>{timeStrFull}</span>
            </div>
            <div className="w-px h-3 bg-[#e8ecf5] dark:bg-[#1f2937] hidden sm:block"></div>
            <div className="text-[#7c869c] dark:text-[#94a3b8] font-medium text-[11px] hidden sm:block whitespace-nowrap">
                {dateStrFull}
            </div>
        </div>
    );
}
