import React from 'react';

export const TableCard = {
    Root: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
        <div className={`bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-xs overflow-hidden ${className}`}>
            {children}
        </div>
    ),
    Header: ({ title, badge, contentTrailing }: { title: string; badge?: string; contentTrailing?: React.ReactNode }) => (
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 relative">
            <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 font-poppins">{title}</h3>
                {badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#e6fcf6] dark:bg-[#00cca3]/10 text-[#00b38f] dark:text-[#00cca3] border border-[#bfeee5] dark:border-[#00cca3]/20">
                        {badge}
                    </span>
                )}
            </div>
            {contentTrailing}
        </div>
    ),
    Pagination: ({
        currentPage,
        totalPages,
        onPageChange,
    }: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    }) => {
        if (totalPages <= 1) return null;

        const getPages = () => {
            const pages: (number | string)[] = [];
            if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                if (currentPage <= 4) {
                    pages.push(1, 2, 3, 4, 5, '...', totalPages);
                } else if (currentPage >= totalPages - 3) {
                    pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                } else {
                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                }
            }
            return pages;
        };

        return (
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
                >
                    <i className="fa-solid fa-arrow-left text-[11px]" /> Previous
                </button>

                <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
                    {getPages().map((page, idx) => (
                        <button
                            key={idx}
                            type="button"
                            disabled={page === '...'}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            className={`h-9 min-w-[36px] px-2 rounded-lg font-semibold text-[13px] transition-colors shrink-0 ${
                                page === '...'
                                    ? 'text-zinc-400 cursor-default'
                                    : page === currentPage
                                    ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 cursor-pointer'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[13px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
                >
                    Next <i className="fa-solid fa-arrow-right text-[11px]" />
                </button>
            </div>
        );
    }
};

interface TableProps {
    children: React.ReactNode;
    'aria-label'?: string;
    selectionMode?: string;
    sortDescriptor?: any;
    onSortChange?: (d: any) => void;
}

export const Table = ({ children }: TableProps) => (
    <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
            {children}
        </table>
    </div>
);

Table.Header = ({ children }: { children: React.ReactNode }) => (
    <thead>
        <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
            {children}
        </tr>
    </thead>
);

Table.Head = ({ id, label, className = '', allowsSorting }: { id?: string; label?: string; className?: string; isRowHeader?: boolean; allowsSorting?: boolean; tooltip?: string }) => (
    <th className={`py-3 px-6 text-left align-middle font-semibold text-zinc-500 dark:text-zinc-400 select-none ${className}`}>
        <div className={`flex items-center gap-1.5 ${className.includes('text-right') ? 'justify-end' : className.includes('text-center') ? 'justify-center' : ''}`}>
            <span>{label}</span>
            {allowsSorting && <i className="fa-solid fa-sort text-[10px] text-zinc-400 cursor-pointer"></i>}
        </div>
    </th>
);

Table.Body = <T,>({ items, children }: { items: T[]; children: (item: T, index: number) => React.ReactNode }) => (
    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
        {items.map((item, index) => children(item, index))}
    </tbody>
);

Table.Row = ({ id, children }: { id?: any; children: React.ReactNode }) => (
    <tr className="hover:bg-zinc-50/75 dark:hover:bg-zinc-900/30 transition-colors duration-150 text-[14px]">
        {children}
    </tr>
);

Table.Cell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <td className={`py-4 px-6 text-zinc-600 dark:text-zinc-300 align-middle ${className}`}>
        {children}
    </td>
);

