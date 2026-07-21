import React, { useState, useRef, useEffect } from 'react';

export interface Option {
    id: number | string;
    name: string;
    description?: string;
}

interface MultiSelectProps {
    options: Option[];
    selectedValues: (number | string)[];
    onChange: (values: any[]) => void;
    placeholder?: string;
    label?: string; // e.g. "users", "students"
}

export function MultiSelect({
    options,
    selectedValues,
    onChange,
    placeholder = 'Pilih opsi',
    label = 'item',
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (optionId: number | string) => {
        if (selectedValues.includes(optionId)) {
            onChange(selectedValues.filter(id => id !== optionId));
        } else {
            onChange([...selectedValues, optionId]);
        }
    };

    const handleReset = () => {
        onChange([]);
    };

    const handleSelectAll = () => {
        const filteredOptionIds = filteredOptions.map(opt => opt.id);
        // Union of currently selected and filtered options
        const newSelection = Array.from(new Set([...selectedValues, ...filteredOptionIds]));
        onChange(newSelection);
    };

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCount = selectedValues.length;
    const totalCount = options.length;

    const displayLabel = selectedCount > 0
        ? `${selectedCount} dari ${totalCount} ${label} terpilih`
        : placeholder;

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Dropdown Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-3.5 rounded-lg border text-[14px] flex items-center justify-between transition-colors bg-white dark:bg-[#0c101b] cursor-pointer text-left focus:outline-none ${
                    isOpen
                        ? 'border-[#00cca3] ring-2 ring-[#00cca3]/20'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                }`}
            >
                <span className="truncate">{displayLabel}</span>
                <i className={`fa-solid fa-chevron-down text-zinc-400 text-[12px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#0c101b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
                    {/* Search Area */}
                    <div className="p-2 border-b border-zinc-100 dark:border-zinc-900/50 relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-4.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Cari..."
                            className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[14px] focus:outline-none focus:border-[#00cca3] dark:text-white"
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto py-1 divide-y divide-zinc-50 dark:divide-zinc-900/20">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-[13.5px] text-zinc-400 text-center">Opsi tidak ditemukan</div>
                        ) : (
                            filteredOptions.map(option => {
                                const isSelected = selectedValues.includes(option.id);
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => toggleOption(option.id)}
                                        className="w-full px-4 py-2.5 text-[14px] flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 cursor-pointer select-none"
                                    >
                                        {/* Custom Checkbox */}
                                        <div
                                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? 'bg-[#00cca3] border-[#00cca3] text-white'
                                                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-transparent'
                                            }`}
                                        >
                                            {isSelected && <i className="fa-solid fa-check text-[9px]" />}
                                        </div>
                                        {/* Option Label and Description */}
                                        <div className="flex-1 truncate">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{option.name}</span>
                                            {option.description && (
                                                <span className="text-[12px] text-zinc-400 ml-1.5 font-normal">
                                                    {option.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-150 dark:border-zinc-850 flex justify-between gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="px-4.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                        >
                            Pilih semua
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
