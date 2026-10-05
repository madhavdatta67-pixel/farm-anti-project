import React, { useState, useEffect } from 'react';
import { fieldsApi } from '../services/api';
import { Field, CreateFieldSchema, SoilTypeEnum } from '@shared/schemas';
import { FieldCard } from '../components/FieldCard';
import { Plus, MapPin, X, AlertTriangle, Layers, Sprout, Search } from 'lucide-react';

export const FieldsPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Field Form State
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [areaHectares, setAreaHectares] = useState<number>(2.5);
  const [soilType, setSoilType] = useState<any>('Loamy');
  const [phLevel, setPhLevel] = useState<number>(6.5);
  const [nitrogenPpm, setNitrogenPpm] = useState<number>(140);
  const [phosphorusPpm, setPhosphorusPpm] = useState<number>(45);
  const [potassiumPpm, setPotassiumPpm] = useState<number>(180);
  const [organicMatterPct, setOrganicMatterPct] = useState<number>(3.2);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = () => {
    fieldsApi
      .getAll()
      .then((res) => setFields(res.fields))
      .catch((err) => console.error('Fetch fields error:', err))
      .finally(() => setLoading(false));
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name,
      location_name: locationName || undefined,
      area_hectares: Number(areaHectares),
      soil_type: soilType,
      ph_level: Number(phLevel),
      nitrogen_ppm: Number(nitrogenPpm),
      phosphorus_ppm: Number(phosphorusPpm),
      potassium_ppm: Number(potassiumPpm),
      organic_matter_pct: Number(organicMatterPct),
    };

    const parseResult = CreateFieldSchema.safeParse(payload);
    if (!parseResult.success) {
      setFormError(parseResult.error.errors[0]?.message || 'Validation error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fieldsApi.create(payload);
      setFields([res.field, ...fields]);
      setShowModal(false);

      // Reset form
      setName('');
      setLocationName('');
      setAreaHectares(2.5);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create field plot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this field plot?')) return;
    try {
      await fieldsApi.delete(id);
      setFields(fields.filter((f) => f.id !== id));
    } catch (err) {
      alert('Failed to delete field');
    }
  };

  const filteredFields = fields.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.location_name && f.location_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    f.soil_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-heading">Farm Field Plots</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage geography, plot dimensions, and soil test parameters</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Field</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search plot by name, location, or soil type..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Fields Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading farm fields...</div>
      ) : filteredFields.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
          <Sprout className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-white">No Field Plots Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Add your farm plots to enable tailored AI agronomic advice</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Register Field
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => (
            <FieldCard key={field.id} field={field} onDelete={handleDeleteField} />
          ))}
        </div>
      )}

      {/* Register Field Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold text-white font-heading">Register Farm Plot & Soil Metrics</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateField} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Field Plot Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. North Ridge Cornfield"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / District</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Salinas Valley Sector 4"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Area (Hectares) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0.1"
                    value={areaHectares}
                    onChange={(e) => setAreaHectares(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Soil Texture Class *</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Clay">Clay Soil</option>
                    <option value="Sandy">Sandy Soil</option>
                    <option value="Loamy">Loamy Soil (Optimal)</option>
                    <option value="Silt">Silt Soil</option>
                    <option value="Peat">Peat Soil</option>
                    <option value="Chalky">Chalky Soil</option>
                    <option value="Saline">Saline Soil</option>
                  </select>
                </div>
              </div>

              {/* Soil Test Metrics */}
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Soil Chemical & Nutrient Test Results</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Soil pH (3.0 - 10.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="3.0"
                      max="10.0"
                      value={phLevel}
                      onChange={(e) => setPhLevel(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nitrogen N (ppm)</label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={nitrogenPpm}
                      onChange={(e) => setNitrogenPpm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Phosphorus P (ppm)</label>
                    <input
                      type="number"
                      min="0"
                      max="400"
                      value={phosphorusPpm}
                      onChange={(e) => setPhosphorusPpm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Potassium K (ppm)</label>
                    <input
                      type="number"
                      min="0"
                      max="600"
                      value={potassiumPpm}
                      onChange={(e) => setPotassiumPpm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Organic Matter %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={organicMatterPct}
                      onChange={(e) => setOrganicMatterPct(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  {submitting ? 'Saving...' : 'Save Field Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
