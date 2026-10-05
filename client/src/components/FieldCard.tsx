import React from 'react';
import { Link } from 'react-router-dom';
import { Field } from '@shared/schemas';
import { MapPin, Maximize2, Layers, Sparkles, Trash2, ChevronRight, Activity } from 'lucide-react';

interface FieldCardProps {
  field: Field;
  onDelete?: (id: string) => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field, onDelete }) => {
  const getPhStatus = (ph?: number | null) => {
    if (ph === undefined || ph === null) return { label: 'Not Tested', color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
    if (ph < 5.5) return { label: 'Strongly Acidic', color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' };
    if (ph >= 5.5 && ph <= 7.5) return { label: 'Optimal pH', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' };
    return { label: 'Alkaline Soil', color: 'text-sky-400 bg-sky-950/40 border-sky-800/40' };
  };

  const phStatus = getPhStatus(field.ph_level);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col justify-between group">
      <div>
        {/* Header Title & Actions */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold font-heading text-white group-hover:text-emerald-400 transition-colors">
              {field.name}
            </h3>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{field.location_name || 'Coordinates / Region Unspecified'}</span>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(field.id)}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Delete Field"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Badges Grid */}
        <div className="flex flex-wrap gap-2 my-4">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
            <Maximize2 className="w-3 h-3" />
            <span>{field.area_hectares} Ha</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>{field.soil_type} Soil</span>
          </span>
          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${phStatus.color}`}>
            <Activity className="w-3 h-3" />
            <span>pH {field.ph_level ?? 'N/A'} ({phStatus.label})</span>
          </span>
        </div>

        {/* Soil Metrics Summary Box */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/70 mb-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Nitrogen</div>
            <div className="text-sm font-bold text-emerald-400">{field.nitrogen_ppm ?? '—'} <span className="text-[9px] text-slate-500">ppm</span></div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Phosphorus</div>
            <div className="text-sm font-bold text-sky-400">{field.phosphorus_ppm ?? '—'} <span className="text-[9px] text-slate-500">ppm</span></div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Potassium</div>
            <div className="text-sm font-bold text-purple-400">{field.potassium_ppm ?? '—'} <span className="text-[9px] text-slate-500">ppm</span></div>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
        <Link
          to={`/advisory/new?fieldId=${field.id}`}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium text-xs shadow-md shadow-emerald-950 hover:brightness-110 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Diagnostic</span>
        </Link>
        <Link
          to={`/fields/${field.id}`}
          className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="View Field Soil Details"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
