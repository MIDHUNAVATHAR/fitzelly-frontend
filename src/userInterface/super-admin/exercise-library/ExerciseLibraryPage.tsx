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
    AlertCircle, 
    Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../../api/axios';
import { SUPER_ADMIN } from '../../../constants/routes';

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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [exToDelete, setExToDelete] = useState<IExercise | null>(null);
    const [activeVideo, setActiveVideo] = useState<{ url: string, name: string } | null>(null);
    
    // Form state
    const [form, setForm] = useState({
        name: '',
        instructions: '',
        reps: '',
        sets: '',
        videoUrl: ''
    });
    const [saving, setSaving] = useState(false);

    // Fetch exercises
    const fetchExercises = async () => {
        try {
            const response = await axiosInstance.get(SUPER_ADMIN.GET_EXERCISES);
            setExercises(response.data.data || []);
        } catch (error) {
            console.error("Error fetching library:", error);
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
        setForm({ name: '', instructions: '', reps: '', sets: '', videoUrl: '' });
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
            videoUrl: ex.videoUrl || ''
        });
        setShowModal(true);
    };

    const handleOpenDelete = (ex: IExercise) => {
        setExToDelete(ex);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!exToDelete) return;
        try {
            await axiosInstance.delete(SUPER_ADMIN.DELETE_EXERCISE(exToDelete.id));
            setExercises(exercises.filter(e => e.id !== exToDelete.id));
            toast.success("Exercise deleted from library");
            setShowDeleteModal(false);
            setExToDelete(null);
        } catch (error) {
            toast.error("Failed to delete exercise");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Name is required");

        try {
            setSaving(true);
            const payload = {
                name: form.name,
                instructions: form.instructions,
                reps: form.reps,
                sets: form.sets,
                videoUrl: form.videoUrl
            };

            if (modalMode === 'add') {
                const response = await axiosInstance.post(SUPER_ADMIN.ADD_EXERCISE, payload);
                setExercises([response.data.data, ...exercises]);
                toast.success("Exercise added to library!");
            } else {
                const response = await axiosInstance.patch(SUPER_ADMIN.UPDATE_EXERCISE(editingEx!.id), payload);
                setExercises(exercises.map(e => e.id === editingEx!.id ? response.data.data : e));
                toast.success("Exercise updated!");
            }
            setShowModal(false);
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save exercise");
        } finally {
            setSaving(false);
        }
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/').split('&')[0];
        }
        if (url.includes('youtube.com/shorts/')) {
            return url.replace('shorts/', 'embed/');
        }
        if (url.includes('youtu.be/')) {
            const id = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        if (url.includes('vimeo.com/')) {
            const id = url.split('vimeo.com/')[1].split('?')[0];
            return `https://player.vimeo.com/video/${id}`;
        }
        return null;
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
                    <p className="text-zinc-400 mt-1">Manage the global database. YouTube and external links are supported.</p>
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
                        placeholder="Search exercises..." 
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
                    <p className="text-zinc-500">Loading library...</p>
                </div>
            ) : filteredExercises.length === 0 ? (
                <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                        <Dumbbell className="w-10 h-10 text-zinc-700" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Exercises Found</h3>
                    <p className="text-zinc-500 max-w-sm">
                        {searchTerm ? "No results match your search." : "Start by adding a new exercise!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredExercises.map((ex) => (
                        <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-all flex flex-col h-full shadow-lg">
                            {/* Thumbnail Section */}
                            <div 
                                className="relative aspect-video w-full bg-zinc-950 cursor-pointer overflow-hidden border-b border-zinc-800 flex items-center justify-center"
                                onClick={() => ex.videoUrl && setActiveVideo({ url: ex.videoUrl, name: ex.name })}
                            >
                                {ex.videoUrl ? (
                                    <div className="flex flex-col items-center justify-center gap-3 opacity-60 group-hover:opacity-100 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Wach Demo Video</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-800">
                                        <Video size={32} />
                                        <span className="text-[10px] font-bold uppercase">No Video</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Card Content */}
                            <div className="p-6 space-y-4 flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{ex.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleOpenEdit(ex)} className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"><Edit2 size={16} /></button>
                                        <button onClick={() => handleOpenDelete(ex)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-zinc-950 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-zinc-500 uppercase border border-zinc-800">{ex.sets || '0'} SETS</span>
                                    <span className="bg-zinc-950 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-zinc-500 uppercase border border-zinc-800">{ex.reps || '0'} REPS</span>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <form onSubmit={handleSave}>
                            <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    {modalMode === 'add' ? <Plus className="text-emerald-400" /> : <Edit2 className="text-emerald-400" />}
                                    {modalMode === 'add' ? 'New Exercise' : 'Edit Exercise'}
                                </h2>
                                <button type="button" onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Exercise Name</label>
                                    <input 
                                        type="text" 
                                        value={form.name}
                                        onChange={(e) => setForm({...form, name: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                        placeholder="e.g. Bicep Curls"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sets</label>
                                        <input type="text" value={form.sets} onChange={(e) => setForm({...form, sets: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" placeholder="e.g. 3" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Reps</label>
                                        <input type="text" value={form.reps} onChange={(e) => setForm({...form, reps: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" placeholder="e.g. 10-12" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Instructions</label>
                                    <textarea 
                                        value={form.instructions}
                                        onChange={(e) => setForm({...form, instructions: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 min-h-[100px] resize-none"
                                        placeholder="How to perform..."
                                    />
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <LinkIcon size={14} className="text-red-500" /> YouTube Video URL
                                    </label>
                                    <input 
                                        type="url"
                                        value={form.videoUrl}
                                        onChange={(e) => setForm({...form, videoUrl: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                    <p className="text-[10px] text-zinc-600 italic">Supports YouTube, Vimeo, and Shorts.</p>
                                </div>
                            </div>

                            <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-900 text-zinc-400 font-bold py-3.5 rounded-xl hover:bg-zinc-800">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-emerald-400 text-black font-black py-3.5 rounded-xl hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader2 size={18} className="animate-spin" />}
                                    {modalMode === 'add' ? 'ADD EXERCISE' : 'UPDATE CHANGES'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-400/10 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Delete from Library?</h2>
                            <p className="text-zinc-400 text-sm">This will permanently remove <span className="text-white font-bold">"{exToDelete?.name}"</span>.</p>
                        </div>
                        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 text-zinc-400 font-bold">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600">DELETE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveVideo(null)}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                                <h3 className="font-black text-white flex items-center gap-3 uppercase tracking-widest text-[10px]">
                                    <Video className="w-4 h-4 text-emerald-400" />
                                    {activeVideo.name} — Library Demo
                                </h3>
                                <button onClick={() => setActiveVideo(null)} className="text-zinc-500 hover:text-white transition-colors bg-zinc-800 rounded-full p-2">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="aspect-video bg-black rounded-b-[2.5rem] overflow-hidden">
                                {getEmbedUrl(activeVideo.url) ? (
                                    <iframe 
                                        src={getEmbedUrl(activeVideo.url)!} 
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        title="Exercise Library Demo Video"
                                    />
                                ) : (
                                    <video 
                                        src={activeVideo.url} 
                                        className="w-full h-full object-contain" 
                                        controls 
                                        autoPlay
                                        crossOrigin="anonymous"
                                    />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExerciseLibraryPage;
