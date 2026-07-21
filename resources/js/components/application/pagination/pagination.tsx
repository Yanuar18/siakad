import React from 'react';

export const PaginationPageMinimalCenter = ({ page, total, className = '' }: { page: number; total: number; className?: string }) => (
    <div className={`flex items-center justify-between border-t border-[#e8ecf5] dark:border-[#1f2937] ${className}`}>
        <button className="h-9 px-4 rounded-[8px] border border-[#e2e8f0] dark:border-[#1f2937] text-[13.5px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-850 text-[#5b6478] dark:text-[#94a3b8] cursor-pointer">
            Previous
        </button>
        <span className="text-[13.5px] text-[#7c869c] dark:text-[#94a3b8]">
            Page {page} of {total}
        </span>
        <button className="h-9 px-4 rounded-[8px] border border-[#e2e8f0] dark:border-[#1f2937] text-[13.5px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-850 text-[#5b6478] dark:text-[#94a3b8] cursor-pointer">
            Next
        </button>
    </div>
);
