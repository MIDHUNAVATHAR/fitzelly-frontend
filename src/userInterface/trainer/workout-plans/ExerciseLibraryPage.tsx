import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Video, 
    Link as LinkIcon, 
    X, 
    Loader2, 
    Search, 
    Dumbbell, 
    CheckCircle2, 
    Upload,
    Play
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../../api/axios';
import { TRAINER_ROUTES } from '../../../constants/routes';

interface IExercise {
    id: string;
    name: string;
    instructions: string;
    reps: string;
    sets: string;
    videoUrl?: string;
}

const ExerciseLibraryPage: React.FC = () => {
    const [exercises, setExercises] = useState<IExercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingEx, setEditingEx] = useState<IExercise | null>(null);
    
    // Form state
    const [form, setForm] = useState({
        name: '',
        instructions: '',
        reps: '',
        sets: '',
        videoUrl: '',
        videoFile: null as File | null
    });
    const [uploading, setUploading] = useState(false);

    // Fetch exercises
    const fetchExercises = async () => {
        try {
            const response = await axiosInstance.get(TRAINER_ROUTES.GET_EXERCISES);
            setExercises(response.data.data || []);
        } catch {
            toast.error("Failed to load exercise library");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    const handleOpenAdd = () => {
        setModalMode('add');
        setEditingEx(null);
        setForm({ name: '', instructions: '', reps: '', sets: '', videoUrl: '', videoFile: null });
        setShowModal(true);
    };

    const handleOpenEdit = (ex: IExercise) => {
        setModalMode('edit');
        setEditingEx(ex);
        setForm({
            name: ex.name,
            instructions: ex.instructions || '',
            reps: ex.reps || '',
            sets: ex.sets || '',
            videoUrl: ex.videoUrl || '',
            videoFile: null
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this exercise?")) return;
        try {
            await axiosInstance.delete(TRAINER_ROUTES.DELETE_EXERCISE(id));
            setExercises(exercises.filter(e => e.id !== id));
            toast.success("Exercise deleted from library");
        } catch {
            toast.error("Failed to delete exercise");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Name is required");

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('instructions', form.instructions);
            formData.append('reps', form.reps);
            formData.append('sets', form.sets);
            
            if (form.videoFile) {
                formData.append('video', form.videoFile);
            } else if (form.videoUrl) {
                formData.append('videoUrl', form.videoUrl);
            }

            if (modalMode === 'add') {
                const response = await axiosInstance.post(TRAINER_ROUTES.ADD_EXERCISE, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setExercises([response.data.data, ...exercises]);
                toast.success("Exercise added to library!");
            } else {
                const response = await axiosInstance.patch(TRAINER_ROUTES.UPDATE_EXERCISE(editingEx!.id), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setExercises(exercises.map(e => e.id === editingEx!.id ? response.data.data : e));
                toast.success("Exercise updated!");
            }
            setShowModal(false);
        } catch {
            toast.error("Failed to save exercise");
        } finally {
            setUploading(false);
        }
    };

    const filteredExercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Dumbbell className="text-emerald-400" />
                        Exercise Library
                    </h1>
                    <p className="text-zinc-400 mt-1">Manage your reusable exercise database for client programs.</p>
                </div>
                <button 
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-400/20 active:scale-95"
                >
                    <Plus size={20} />
                    Add Exercise
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search exercises by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="text-zinc-500">Loading your library...</p>
                </div>
            ) : filteredExercises.length === 0 ? (
                <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                        <Dumbbell className="w-10 h-10 text-zinc-700" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Exercises Found</h3>
                    <p className="text-zinc-500 max-w-sm">
                        {searchTerm ? "No results match your search." : "Your exercise library is empty. Start by adding a new exercise!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredExercises.map((ex) => (
                        <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-all flex flex-col h-full">
                            {/* Card Content */}
                            <div className="p-6 space-y-4 flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{ex.name}</h3>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleOpenEdit(ex)}
                                            className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ex.id)}
                                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-zinc-950 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-zinc-500 uppercase border border-zinc-800">
                                        {ex.sets || '0'} SETS
                                    </span>
                                    <span className="bg-zinc-950 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-zinc-500 uppercase border border-zinc-800">
                                        {ex.reps || '0'} REPS
                                    </span>
                                    {ex.videoUrl && (
                                        <span className="bg-emerald-400/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-emerald-400 uppercase border border-emerald-400/20 flex items-center gap-1">
                                            <Play size={10} fill="currentColor" /> VIDEO
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Instructions</span>
                                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 italic">
                                        {ex.instructions || 'No instructions provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
                        <form onSubmit={handleSave}>
                            {/* Modal Header */}
                            <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                        {modalMode === 'add' ? <Plus className="text-emerald-400" /> : <Edit2 className="text-emerald-400" />}
                                        {modalMode === 'add' ? 'New Exercise' : 'Edit Exercise'}
                                    </h2>
                                    <p className="text-zinc-500 text-xs mt-1">Fill in the details to save to your library.</p>
                                </div>
                                <button type="button" onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Exercise Name</label>
                                    <input 
                                        type="text" 
                                        value={form.name}
                                        onChange={(e) => setForm({...form, name: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                        placeholder="e.g. Chest Press"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Sets</label>
                                        <input 
                                            type="text" 
                                            value={form.sets}
                                            onChange={(e) => setForm({...form, sets: e.target.value})}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                            placeholder="e.g. 4"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Reps</label>
                                        <input 
                                            type="text" 
                                            value={form.reps}
                                            onChange={(e) => setForm({...form, reps: e.target.value})}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                            placeholder="e.g. 12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Instructions</label>
                                    <textarea 
                                        value={form.instructions}
                                        onChange={(e) => setForm({...form, instructions: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 min-h-[120px] resize-none"
                                        placeholder="Step by step execution details..."
                                    />
                                </div>

                                <div className="space-y-4 pt-2 border-t border-zinc-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Video size={16} className="text-emerald-400" />
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Demo Video</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-600 uppercase flex items-center gap-2">
                                                <LinkIcon size={12} /> External Video URL
                                            </label>
                                            <input 
                                                type="text" 
                                                value={form.videoUrl}
                                                onChange={(e) => setForm({...form, videoUrl: e.target.value})}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                                                placeholder="https://youtube.com/..."
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 py-2">
                                            <div className="flex-1 h-px bg-zinc-800"></div>
                                            <span className="text-[10px] font-bold text-zinc-700 uppercase">OR</span>
                                            <div className="flex-1 h-px bg-zinc-800"></div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-600 uppercase flex items-center gap-2">
                                                <Upload size={12} /> Upload Video File
                                            </label>
                                            <div className="relative group/upload">
                                                <input 
                                                    type="file" 
                                                    accept="video/*"
                                                    onChange={(e) => setForm({...form, videoFile: e.target.files?.[0] || null})}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="w-full bg-zinc-950 border-2 border-dashed border-zinc-800 group-hover/upload:border-emerald-500/30 rounded-xl p-6 flex flex-col items-center justify-center transition-all">
                                                    {form.videoFile ? (
                                                        <div className="flex items-center gap-3 text-emerald-400">
                                                            <CheckCircle2 size={20} />
                                                            <span className="text-sm font-bold truncate max-w-[200px]">{form.videoFile.name}</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={(e) => { e.stopPropagation(); setForm({...form, videoFile: null}) }}
                                                                className="text-zinc-500 hover:text-red-400"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload size={24} className="text-zinc-600 mb-2" />
                                                            <p className="text-sm text-zinc-500 font-medium">Click to select or drag video</p>
                                                            <p className="text-[10px] text-zinc-600 mt-1 uppercase font-bold tracking-tighter">MP4, WEBM up to 50MB</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-zinc-900 text-zinc-400 font-bold py-3.5 rounded-xl hover:bg-zinc-800 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 bg-emerald-400 text-black font-black py-3.5 rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-400/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            SAVING...
                                        </>
                                    ) : (
                                        <>
                                            {modalMode === 'add' ? 'ADD EXERCISE' : 'UPDATE CHANGES'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExerciseLibraryPage;
