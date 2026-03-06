import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, CalendarRange, Edit3, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../../api/plan.api';
import type { Plan, CreatePlanDTO, UpdatePlanDTO } from '../../../api/plan.api';
import Pagination from '../../../components/ui/Pagination';
import PlanFormModal from './PlanFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { isAxiosError } from 'axios';


const PlansPage: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected Data
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPlans = React.useCallback(async (page: number, currentLimit: number, q: string, append: boolean = false) => {
        setIsLoading(true);
        try {
            const data = await getPlans(page, currentLimit, q);
            setTotalItems(data.total || 0);
            setPlans(prev => append ? [...prev, ...data.plans] : data.plans);
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message ?? 'Failed to load plans');
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to load plans');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        fetchPlans(1, limit, searchTerm, false);
    }, [searchTerm, limit, fetchPlans]);

    // Filter Logic - frontend filtering is no longer needed but kept for extra safety or we can remove it.
    // Actually search is now backend so we just use `plans` directly.
    const filteredPlans = plans;

    // Format Validity Display
    const formatValidity = (planType: string, validity: number) => {
        if (planType === 'CATEGORY_BASED') {
            return `${validity} ${validity === 1 ? 'Month' : 'Months'}`;
        }
        return `${validity} ${validity === 1 ? 'Day' : 'Days'}`;
    };

    // Actions
    const handleAddPlan = () => {
        setSelectedPlan(null);
        setIsFormModalOpen(true);
    };

    const handleEditPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (data: CreatePlanDTO | UpdatePlanDTO) => {
        try {
            if (selectedPlan) {
                await updatePlan(selectedPlan.id, data as UpdatePlanDTO);
                toast.success('Plan updated successfully');
            } else {
                await createPlan(data as CreatePlanDTO);
                toast.success('Plan created successfully');
            }
            fetchPlans(currentPage, limit, searchTerm, false); // Refresh List
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message ?? 'Failed to save plan');
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to save plan');
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedPlan) return;
        setIsDeleting(true);
        try {
            await deletePlan(selectedPlan.id);
            toast.success('Plan deleted successfully');
            setIsDeleteModalOpen(false);
            fetchPlans(currentPage, limit, searchTerm, false); // Refresh List
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message ?? 'Failed to delete plan');
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to delete plan');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Membership Plans</h1>
                <button
                    onClick={handleAddPlan}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-semibold shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    Add Plan
                </button>
            </div>

            {/* Note */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200/80 leading-relaxed">
                    <span className="font-bold text-amber-400">Note:</span> Changes made to this membership plan will only apply to new memberships. Existing memberships will not be affected.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search plans by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
            </div>

            {/* Content List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl text-center px-4">
                    <Layers className="w-12 h-12 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No plans found</h3>
                    <p className="text-zinc-400 max-w-sm">
                        {searchTerm ? "No plans match your search query." : "You haven't added any membership plans yet."}
                    </p>
                </div>
            ) : (
                <>
                    {/* Mobile Cards View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden sm:mb-4">
                        {filteredPlans.map((plan) => (
                            <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3 shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">{plan.planName}</h3>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                                            {plan.planType === 'CATEGORY_BASED' ? 'Category' : 'Days'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-emerald-400 text-lg">₹{plan.price}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-0.5 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/50">
                                    <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                        <CalendarRange className="w-4 h-4 text-emerald-400/70" />
                                        {formatValidity(plan.planType, plan.validity)}
                                    </div>
                                    {plan.planType === 'DAY_BASED' && plan.windowPeriod && (
                                        <div className="text-xs text-zinc-500 pl-6">
                                            {plan.windowPeriod} days window period
                                        </div>
                                    )}
                                </div>

                                {plan.description && (
                                    <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
                                        {plan.description}
                                    </p>
                                )}

                                <div className="flex justify-end gap-2 pt-4 mt-1 border-t border-zinc-800/50">
                                    <button
                                        onClick={() => handleEditPlan(plan)}
                                        className="px-3 py-1.5 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors text-sm font-medium"
                                        title="Edit Plan"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(plan)}
                                        className="px-3 py-1.5 flex items-center gap-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm font-medium"
                                        title="Delete Plan"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Plan Name</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Validity</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Plan Fee</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider hidden md:table-cell">Description</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {filteredPlans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-zinc-800/20 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{plan.planName}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                                                {plan.planType === 'CATEGORY_BASED' ? 'Category' : 'Days'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                                    <CalendarRange className="w-4 h-4 text-emerald-400/70" />
                                                    {formatValidity(plan.planType, plan.validity)}
                                                </div>
                                                {plan.planType === 'DAY_BASED' && plan.windowPeriod && (
                                                    <div className="text-xs text-zinc-500 pl-6">
                                                        {plan.windowPeriod} days window period
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-emerald-400">{plan.price}</div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell max-w-[200px]">
                                            <div className="flex items-start gap-2 text-zinc-400 text-sm truncate">
                                                {plan.description ? (
                                                    <span className="truncate" title={plan.description}>{plan.description}</span>
                                                ) : (
                                                    <span className="italic opacity-50">No description</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditPlan(plan)}
                                                    className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                                    title="Edit Plan"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(plan)}
                                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Delete Plan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-end mt-4">
                        <div className="w-full">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={totalItems}
                                limit={limit}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    fetchPlans(page, limit, searchTerm, false);
                                }}
                                onLimitChange={(newLimit) => {
                                    setLimit(newLimit);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Modals */}
            <PlanFormModal
                isOpen={isFormModalOpen}
                initialData={selectedPlan}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                itemName={selectedPlan?.planName || ''}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default PlansPage;
