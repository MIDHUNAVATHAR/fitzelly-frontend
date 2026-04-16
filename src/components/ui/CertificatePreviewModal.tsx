import React from 'react';
import { X } from 'lucide-react';

interface CertificatePreviewModalProps {
    fileUrl: string;
    fileType: 'image' | 'pdf';
    fileName?: string;
    onClose: () => void;
}

const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({ fileUrl, fileType, fileName, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 z-10">
                    <h3 className="text-lg font-semibold text-white truncate max-w-[80%]">
                        {fileName || 'Certificate Preview'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-[50vh]">
                    {fileType === 'pdf' ? (
                        <iframe
                            src={`${fileUrl}#toolbar=0`}
                            className="w-full h-[75vh] rounded-lg bg-zinc-800"
                            title={fileName || 'PDF Preview'}
                        />
                    ) : (
                        <img
                            src={fileUrl}
                            alt="Certificate Preview"
                            className="max-w-full max-h-[75vh] object-contain rounded-lg"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificatePreviewModal;
