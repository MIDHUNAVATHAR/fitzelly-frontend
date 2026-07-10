import React from 'react';
import { Eye, FileText, Plus, Trash2 } from 'lucide-react';
import type { GymProfile } from '../../../../dtos/gym-profile.resDTO';

interface Props {
    profile: GymProfile | null;
    certInputRef: React.RefObject<HTMLInputElement>;
    onCertFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteCert: (key: string) => void;
}

export const CertificatesSection: React.FC<Props> = ({ profile, certInputRef, onCertFileChange, onDeleteCert }) => {
    const certificates = profile?.certificates || [];
    return (
        <section className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-white">Certificates & Licenses</h3>
                    <p className="text-sm text-zinc-400">Keep documents easy to scan on mobile.</p>
                </div>
                <button onClick={() => certInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-black">
                    <Plus className="w-4 h-4" /> Add
                </button>
                <input type="file" ref={certInputRef} className="hidden" onChange={onCertFileChange} accept="application/pdf,image/*" />
            </div>
            {certificates.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {certificates.map((cert) => (
                        <div key={cert.key} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-zinc-900 p-2 text-emerald-400"><FileText className="w-5 h-5" /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-white">{cert.name}</p>
                                    <p className="text-xs text-zinc-500">{cert.type}</p>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <a href={cert.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200">
                                    <Eye className="w-3.5 h-3.5" /> View
                                </a>
                                <button onClick={() => onDeleteCert(cert.key)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">No certificates added yet.</p>}
        </section>
    );
};
