import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';

interface Props { hasLocation: boolean; loadingLocation: boolean; onUpdateLocation: () => void; }

export const LocationSection: React.FC<Props> = ({ hasLocation, loadingLocation, onUpdateLocation }) => (
    <section className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
            <div>
                <h3 className="text-lg font-semibold text-white">Gym Location</h3>
                <p className="text-sm text-zinc-400">{hasLocation ? 'Verified location is set' : 'Set location when you are at the gym'}</p>
            </div>
            <button onClick={onUpdateLocation} disabled={loadingLocation} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50">
                <MapPin className="w-4 h-4" /> {loadingLocation ? 'Updating...' : 'Update'}
            </button>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-sm text-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Only update this while standing at your gym location.</span>
        </div>
    </section>
);
