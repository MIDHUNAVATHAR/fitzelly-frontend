
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import ReusableTable from "../../../components/ui/ReusableTable";
import type { Column } from "../../../components/ui/ReusableTable";
import SearchInput from "../../../components/ui/SearchInput";
import Pagination from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { getEquipments, deleteEquipment } from "../../../api/equipment.api";
import type { Equipment } from "../../../api/equipment.api";
import EquipmentModal from "./EquipmentModal";

const EquipmentList: React.FC = () => {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchEquipments = useCallback(async (page: number, currentLimit: number, q: string, append: boolean = false) => {
        try {
            setLoading(true);
            const data = await getEquipments(page, currentLimit, q);
            setTotalItems(data.total || 0);
            setEquipments(prev => append ? [...prev, ...data.equipments] : data.equipments);
        } catch {
            toast.error("Failed to load equipments");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        fetchEquipments(1, limit, search, false);
    }, [search, limit, fetchEquipments]);

    const handleAdd = () => {
        setEditingEquipment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (eq: Equipment, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingEquipment(eq);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setIsDeleting(true);
            await deleteEquipment(deleteId);
            toast.success("Equipment deleted");
            fetchEquipments(1, limit, search, false);
            setCurrentPage(1);
        } catch {
            toast.error("Failed to delete equipment");
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const columns: Column<Equipment>[] = [
        {
            header: "Image",
            accessor: (eq) => (
                <div className="w-10 h-10 rounded overflow-hidden bg-zinc-800 flex items-center justify-center">
                    {eq.image ? (
                        <img src={eq.image} alt={eq.name} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-5 h-5 text-zinc-600" />
                    )}
                </div>
            )
        },
        { header: "Name", accessor: "name" },
        {
            header: "Available Days",
            accessor: (eq) => (
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {eq.availableDays.map(d => (
                        <span key={d} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">
                            {d.substring(0, 3)}
                        </span>
                    ))}
                </div>
            )
        },
        { header: "Time Range", accessor: (eq) => `${eq.availableFrom} - ${eq.availableTo}` },
        { header: "Max Usage", accessor: (eq) => `${eq.maxUsageMinutes}m` },
        { header: "Capacity", accessor: "capacity" },
        { header: "Slot Interval", accessor: (eq) => `${eq.slotIntervalMinutes}m` },
        {
            header: "Status",
            accessor: (eq) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${eq.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-500/20 text-zinc-400"}`}>
                    {eq.isActive ? "Active" : "Inactive"}
                </span>
            )
        },
        {
            header: "Actions",
            accessor: (eq) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => handleEdit(eq, e)}
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-amber-400 transition"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(eq.id); }}
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-red-400 transition"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Equipment &amp; Bookings</h1>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-semibold"
                >
                    <Plus className="w-5 h-5" />
                    Add Equipment
                </button>
            </div>

            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search equipment..."
            />

            <ReusableTable
                data={equipments}
                columns={columns}
                isLoading={loading}
                emptyMessage="No equipment configurations found."
            />

            <div className="flex justify-end">
                <div className="w-full mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        limit={limit}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            fetchEquipments(page, limit, search, false);
                        }}
                        onLimitChange={(newLimit) => {
                            setLimit(newLimit);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Equipment"
                message="Are you sure you want to delete this equipment configuration? This action cannot be undone."
                isProcessing={isDeleting}
            />

            {isModalOpen && (
                <EquipmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    equipment={editingEquipment}
                    onSave={() => {
                        setIsModalOpen(false);
                        fetchEquipments(1, limit, search, false);
                        setCurrentPage(1);
                    }}
                />
            )}
        </div>
    );
};

export default EquipmentList;
