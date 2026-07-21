import React from 'react';

export default function Footer() {
    return (
        <footer className="mt-auto py-6 border-t border-[#e8ecf5] dark:border-[#1f2937] flex flex-col md:flex-row justify-between items-center text-[13px] text-[#7c869c] dark:text-[#94a3b8] gap-4 bg-white dark:bg-[#111827] px-7 w-full transition-colors duration-200">
            <div className="mb-0">
                <p>2026 &copy; Octagram.Siakad</p>
            </div>
            <div>
                <p className="flex items-center gap-1.5 justify-center md:justify-end flex-wrap">
                    <span>Dibuat oleh</span>
                    <a
                        href="https://github.com/Yanuar18"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00cca3] hover:text-[#009e7e] hover:underline font-semibold transition-colors"
                    >
                        Yanuar
                    </a>
                    <span>by</span>
                    <a
                        href="https://github.com/Yanuar18"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00cca3] hover:text-[#009e7e] hover:underline font-semibold transition-colors"
                    >
                        Octagram
                    </a>
                    <span>phone</span>
                    <a
                        href="https://wa.me/6285183880875"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00cca3] hover:text-[#009e7e] hover:underline font-semibold transition-colors"
                    >
                        085183880875
                    </a>
                </p>
            </div>
        </footer>
    );
}
