import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fieldsApi, advisoryApi } from '../services/api';
import { Field, Advisory } from '@shared/schemas';
import { SoilMetricsChart } from '../components/SoilMetricsChart';
import { MapPin, Maximize2, Layers, Sparkles, ChevronLeft, Calendar, ArrowRight, Activity, Trash2 } from 'lucide-react';

export const FieldDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [field, setField] = useState<Field | null>(null);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fieldsApi.getById(id),
      advisoryApi.getAll({ field_id: id }),
    ])
      .then(([fieldRes, advisoriesRes]) => {
        setField(fieldRes.field);
        setAdvisories(advisoriesRes.advisories);
      })
      .catch((err) => setError(err.message || 'Failed to fetch field details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!field || !window.confirm('Delete this field plot permanently?')) return;
    try {
      await fieldsApi.delete(field.id);
      navigate('/fields');
    } catch (err) {
      alert('Failed to delete field');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading plot profile...</div>;
  }

  if (error || !field) {
    return (
      <div className="glass-panel max-w-lg mx-auto p-8 rounded-2xl text-center border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-2">Field Not Found</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'The requested farm plot could not be loaded.'}</p>
        <Link to="/fields" className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold">
          Back to Fields
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <Link to="/fields" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to All Fields</span>
      </Link>

      {/* Field Overview Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold mb-2">
            <MapPin className="w-4 h-4" />
            <span>{field.location_name || 'Geographic Coordinates Unspecified'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">{field.name}</h1>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{field.area_hectares} Hectares</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{field.soil_type} Soil</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>pH Level: {field.ph_level ?? 'N/A'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/advisory/new?fieldId=${field.id}`}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run AI Advisory</span>
          </Link>
          <button
            onClick={handleDelete}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Field Plot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Soil Metrics Breakdown Chart */}
      <SoilMetricsChart field={field} />

      {/* Plot Advisory Consultation History */}
      <div>
        <h3 className="text-xl font-bold text-white font-heading mb-4">Advisory Consultations for this Plot</h3>

        {advisories.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800 text-slate-400 text-xs">
            No advisory consultations recorded for this specific plot yet.
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-800/60">
              {advisories.map((adv) => (
                <Link
                  key={adv.id}
                  to={`/advisory/${adv.id}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors group block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          adv.severity_rating === 'CRITICAL'
                            ? 'bg-red-950 text-red-400 border-red-800'
                            : adv.severity_rating === 'HIGH'
                            ? 'bg-orange-950 text-orange-400 border-orange-800'
                            : adv.severity_rating === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}
                      >
                        {adv.severity_rating}
                      </span>
                      <span className="text-xs text-slate-400">{adv.advisory_type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {adv.ai_raw_response.diagnosisName}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right text-xs text-slate-400">
                      <div>{new Date(adv.created_at).toLocaleDateString()}</div>
                      <div className="text-[10px] text-emerald-400">{adv.status}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
