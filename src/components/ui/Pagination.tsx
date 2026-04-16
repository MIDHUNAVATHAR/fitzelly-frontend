import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages?: number;
    totalItems?: number;
    limit?: number;
    limitOptions?: (number | 'all')[];
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages: propTotalPages,
    totalItems,
    limit = 10,
    limitOptions = [10, 30, 50],
    onPageChange,
    onLimitChange,
}) => {
    const totalPages = (totalItems !== undefined)
        ? Math.ceil(totalItems / limit)
        : (propTotalPages || 1);

    // Helper to get which pages to show
    const getVisiblePages = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5];
        }
        if (currentPage >= totalPages - 2) {
            return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    };

    const visiblePages = getVisiblePages();

    // Calculate row information
    const startRow = (currentPage - 1) * limit + 1;
    const endRow = totalItems !== undefined ? Math.min(currentPage * limit, totalItems) : currentPage * limit;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            {totalItems !== undefined ? (
                <div className="text-sm font-medium text-zinc-400">
                    {totalItems > 0 ? (
                        `Showing ${startRow}–${endRow} of ${totalItems} rows`
                    ) : (
                        "No rows to show"
                    )}
                </div>
            ) : (
                <div className="text-sm font-medium text-zinc-400">
                    Page <span className="text-white">{currentPage}</span> of{' '}
                    <span className="text-white">{totalPages}</span>
                </div>
            )}

            <div className="flex items-center gap-4">
                {onLimitChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">Rows per page:</span>
                        <select
                            value={limit > 1000 ? 'all' : limit}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'all') {
                                    onLimitChange(9999); // Use a large number for 'all'
                                } else {
                                    onLimitChange(Number(val));
                                }
                            }}
                            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 outline-none cursor-pointer"
                        >
                            {limitOptions.map(opt => (
                                <option key={opt} value={opt}>{opt === 'all' ? 'All' : opt}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1 hidden sm:flex">
                        {visiblePages.map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${pageNum === currentPage
                                    ? "bg-emerald-500 text-white"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;