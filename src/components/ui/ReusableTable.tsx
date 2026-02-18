import React from "react";
import { Loader2, Inbox } from "lucide-react";

export interface Column<T>{
    header:string;
    accessor:keyof T | ((item:T)=>React.ReactNode);
    className?:string;
    style?:React.CSSProperties;
}

interface ReusableTableProps<T>{
    columns:Column<T>[];
    data:T[];
    isLoading?:boolean;
    emptyMessage?:string;
    actions?:(item:T)=>React.ReactNode;
    onRowClick?:(item:T)=>void;
    className?:string;
}

const ReusableTable = <T extends { id: string | number }>({
    columns,
    data,
    isLoading,
    emptyMessage = 'No data found',
    actions,
    onRowClick,
    className
}: ReusableTableProps<T>) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
                <p>Loading data...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50">
                <Inbox className="w-12 h-12 mb-3 text-zinc-600" />
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-zinc-900 border-b border-zinc-800">
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={`px-6 py-4 font-semibold text-zinc-300 ${col.className || ''}`}
                                        style={col.style}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="px-6 py-4 font-semibold text-zinc-300 text-right">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {data.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    className={`
                        group transition-colors hover:bg-zinc-800/50
                        ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                                >
                                    {columns.map((col, index) => (
                                        <td
                                            key={index}
                                            className={`px-6 py-4 text-zinc-300 ${col.className || ''}`}
                                        >
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(item)
                                                : (item[col.accessor] as React.ReactNode)}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                {actions(item)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {data.map((item) => (
                    <div
                        key={item.id}
                        className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3"
                        onClick={() => onRowClick && onRowClick(item)}
                    >
                        {columns.map((col, index) => (
                            <div key={index} className="flex justify-between items-start border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    {col.header}
                                </span>
                                <span className="text-sm text-zinc-300 text-right">
                                    {typeof col.accessor === 'function'
                                        ? col.accessor(item)
                                        : (item[col.accessor] as React.ReactNode)}
                                </span>
                            </div>
                        ))}
                        {actions && (
                            <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800" onClick={(e) => e.stopPropagation()}>
                                {actions(item)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReusableTable;
