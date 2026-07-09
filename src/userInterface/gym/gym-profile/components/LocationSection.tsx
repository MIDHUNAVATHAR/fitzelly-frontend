import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

interface LocationSectionProps {
    hasLocation: boolean;
    loadingLocation: boolean;
    onUpdateLocation: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
    hasLocation,
    loadingLocation,
    onUpdateLocation,
}) => {
    return (
        <div className="border-t border-zinc-800 py-3">
            <div className="px-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${hasLocation ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location</h3>
                        <span className="text-xs text-zinc-400">
                            {hasLocation ? '✓ Verified' : 'Not set'}
                        </span>
                    </div>
                    <button
                        onClick={onUpdateLocation}
                        disabled={loadingLocation}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        {loadingLocation ? "Updating..." : "Update"}
                    </button>
                </div>
                {!hasLocation && (
                    <div className="flex items-start gap-1.5 mt-1.5 text-xs text-amber-500/80">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>Update only while inside the gym</span>
                    </div>
                )}
            </div>
        </div>
    );
};