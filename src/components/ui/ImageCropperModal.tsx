import React from 'react';
import Cropper from 'react-easy-crop';
import { X } from 'lucide-react';
import type { Area } from 'react-easy-crop';

interface ImageCropperModalProps {
    imageSrc: string;
    crop: { x: number; y: number };
    zoom: number;
    isUploading: boolean;
    onCropChange: (crop: { x: number; y: number }) => void;
    onZoomChange: (zoom: number) => void;
    onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
    onUpload: () => void;
    onCancel: () => void;
    title?: string;
    aspectRatio?: number;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    imageSrc,
    crop,
    zoom,
    isUploading,
    onCropChange,
    onZoomChange,
    onCropComplete,
    onUpload,
    onCancel,
    title = "Crop Image",
    aspectRatio = 1
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-xl overflow-hidden border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h3 className="font-bold text-white text-lg">{title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">Adjust and crop your image</p>
                    </div>
                    <button 
                        onClick={onCancel}
                        className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                        disabled={isUploading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative w-full h-[350px] bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onCropComplete={onCropComplete}
                        onZoomChange={onZoomChange}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                            <span>Zoom Level</span>
                            <span className="text-emerald-400">{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => onZoomChange(Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            disabled={isUploading}
                            className="flex-1 px-4 py-3 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onUpload}
                            disabled={isUploading}
                            className="flex-1 px-4 py-3 bg-emerald-400 text-black font-bold rounded-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Use Image'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;