import React from 'react';
import { Plus, FileText, Trash2, Eye } from 'lucide-react';
import type { GymProfile } from '../../../../dtos/gym-profile.resDTO';

interface CertificatesSectionProps {
    profile: GymProfile | null;
    certInputRef: React.RefObject<HTMLInputElement>;
    onCertFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteCert: (key: string) => void;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({
    profile,
    certInputRef,
    onCertFileChange,
    onDeleteCert,
}) => {
    const certificates = profile?.certificates || [];

    return (
        <div className="border-t border-zinc-800 py-3">
            <div className="px-1">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Certificates
                        </h3>
                        {certificates.length > 0 && (
                            <span className="text-xs text-zinc-400">({certificates.length})</span>
                        )}
                    </div>
                    <button
                        onClick={() => certInputRef.current?.click()}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 rounded-lg text-xs font-medium transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </button>
                    <input
                        type="file"
                        ref={certInputRef}
                        className="hidden"
                        onChange={onCertFileChange}
                        accept="application/pdf,image/*"
                    />
                </div>

                {certificates.length > 0 ? (
                    <div className="space-y-1.5">
                        {certificates.map((cert) => (
                            <div
                                key={cert.key}
                                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                    <span className="text-sm text-zinc-300 truncate">{cert.name}</span>
                                    <span className="text-[10px] text-zinc-500 flex-shrink-0">
                                        {cert.type === 'PDF' ? 'PDF' : 'Image'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <a
                                        href={cert.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                        onClick={() => onDeleteCert(cert.key)}
                                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-xs text-zinc-500">No certificates added yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};