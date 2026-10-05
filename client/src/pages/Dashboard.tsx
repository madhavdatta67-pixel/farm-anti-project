import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fieldsApi, advisoryApi, fetchAgriculturalWeather, WeatherData } from '../services/api';
import { Field, Advisory } from '@shared/schemas';
import { FieldCard } from '../components/FieldCard';
import {
  Sprout,
  Sparkles,
  MapPin,
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Plus,
  ChevronRight,
  Bug,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState<Field[]>([]);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fieldsApi.getAll(),
      advisoryApi.getAll(),
      fetchAgriculturalWeather(),
    ])
      .then(([fieldsRes, advisoriesRes, weatherRes]) => {
        setFields(fieldsRes.fields);
        setAdvisories(advisoriesRes.advisories);
        setWeather(weatherRes);
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalArea = fields.reduce((acc, f) => acc + Number(f.area_hectares || 0), 0);
  const activeAdvisories = advisories.filter((a) => a.status === 'ACTIVE');
  const criticalThreats = advisories.filter((a) => a.severity_rating === 'HIGH' || a.severity_rating === 'CRITICAL');

  const handleDeleteField = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this field plot?')) return;
    try {
      await fieldsApi.delete(id);
      setFields(fields.filter((f) => f.id !== id));
    } catch (err) {
      alert('Failed to delete field');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sprout className="w-3.5 h-3.5" />
              <span>Precision Agriculture Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              AgriTech AI Assistant actively monitoring <strong className="text-white">{fields.length} field plots</strong> across <strong className="text-emerald-400">{totalArea.toFixed(1)} hectares</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/advisory/new"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 hover:brightness-110 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>New AI Advisory</span>
            </Link>
            <Link
              to="/fields"
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Field Plot</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview & Weather Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Registered Plots</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-heading">{fields.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Total farm plots</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Area</span>
              <MapPin className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-heading">{totalArea.toFixed(1)} <span className="text-sm font-normal text-slate-400">Ha</span></div>
            <div className="text-[11px] text-slate-400 mt-1">Arable land profile</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Advisories</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-heading">{activeAdvisories.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Under remediation</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Critical Threats</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-extrabold text-red-400 font-heading">{criticalThreats.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">High severity pathogens</div>
          </div>

          {/* Quick Advisory Launchers Banner */}
          <div className="col-span-2 sm:col-span-4 glass-card p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Quick AI Diagnostic Launcher</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/advisory/new?type=PEST_DISEASE"
                className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 hover:border-red-500/60 transition-all flex items-center space-x-3 group"
              >
                <div className="p-2 rounded-lg bg-red-900/40 text-red-400 group-hover:scale-110 transition-transform">
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Pest & Disease</div>
                  <div className="text-[10px] text-slate-400">Photo Pathology</div>
                </div>
              </Link>

              <Link
                to="/advisory/new?type=SOIL_NUTRIENT"
                className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 hover:border-emerald-500/60 transition-all flex items-center space-x-3 group"
              >
                <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-400 group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Fertilizer Calc</div>
                  <div className="text-[10px] text-slate-400">NPK Formulation</div>
                </div>
              </Link>

              <Link
                to="/advisory/new?type=CROP_SELECTION"
                className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 hover:border-amber-500/60 transition-all flex items-center space-x-3 group"
              >
                <div className="p-2 rounded-lg bg-amber-900/40 text-amber-400 group-hover:scale-110 transition-transform">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Crop Selector</div>
                  <div className="text-[10px] text-slate-400">Soil Matching</div>
                </div>
              </Link>

              <Link
                to="/advisory/new?type=IRRIGATION_SCHEDULE"
                className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 hover:border-sky-500/60 transition-all flex items-center space-x-3 group"
              >
                <div className="p-2 rounded-lg bg-sky-900/40 text-sky-400 group-hover:scale-110 transition-transform">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Irrigation Plan</div>
                  <div className="text-[10px] text-slate-400">Evapotranspiration</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Real-Time Agricultural Weather Widget */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <CloudSun className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Field Atmospheric Weather</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                LIVE OPEN-METEO
              </span>
            </div>

            {weather ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white font-heading">{weather.temperature}°C</div>
                    <div className="text-xs text-slate-300 font-semibold mt-0.5">{weather.condition}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Evapotranspiration (ET0)</div>
                    <div className="text-base font-bold text-sky-400">{weather.evapotranspiration} mm/day</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Humidity</div>
                      <div className="font-bold text-white">{weather.humidity}%</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Wind Speed</div>
                      <div className="font-bold text-white">{weather.windSpeed} km/h</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">Loading weather forecast...</div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Location: Regional Farm Plot</span>
            <span className="text-emerald-400">Optimal Dew Point</span>
          </div>
        </div>
      </div>

      {/* Farm Plots Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Registered Field Plots</h2>
            <p className="text-xs text-slate-400">Soil test records & geographic plot parameters</p>
          </div>
          <Link
            to="/fields"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>Manage All Fields</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {fields.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
            <Sprout className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-base font-bold text-white">No Registered Plots</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">Add your farm plots to enable AI soil nutrient calculations</p>
            <Link
              to="/fields"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Field</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.slice(0, 3).map((field) => (
              <FieldCard key={field.id} field={field} onDelete={handleDeleteField} />
            ))}
          </div>
        )}
      </div>

      {/* Recent AI Advisories Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Recent AI Advisory Consultations</h2>
            <p className="text-xs text-slate-400">Diagnostic history and structured agronomic reports</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>View Full History</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {advisories.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
            <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-base font-bold text-white">No AI Consultations Yet</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">Run an AI diagnostic to generate crop recommendations and IPM solutions</p>
            <Link
              to="/advisory/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run First AI Diagnostic</span>
            </Link>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Diagnosis / Advisory</th>
                    <th className="p-4">Plot</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {advisories.slice(0, 5).map((adv) => (
                    <tr
                      key={adv.id}
                      onClick={() => navigate(`/advisory/${adv.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-bold text-white flex items-center space-x-2">
                        <span>{adv.ai_raw_response.diagnosisName}</span>
                      </td>
                      <td className="p-4 text-emerald-400">{adv.field_name}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                          {adv.advisory_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
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
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] font-semibold text-slate-300">
                          {adv.status === 'ACTIVE' ? '🟢 Active' : adv.status === 'RESOLVED' ? '✅ Resolved' : '📁 Archived'}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-400">
                        {new Date(adv.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
