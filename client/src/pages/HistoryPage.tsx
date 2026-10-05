import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { advisoryApi } from '../services/api';
import { Advisory } from '@shared/schemas';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  Bug,
  FlaskConical,
  Sprout,
  Droplets,
  Calendar,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [typeFilter, severityFilter, statusFilter]);

  const fetchHistory = () => {
    setLoading(true);
    advisoryApi
      .getAll({
        advisory_type: typeFilter || undefined,
        severity_rating: severityFilter || undefined,
        status: statusFilter || undefined,
      })
      .then((res) => setAdvisories(res.advisories))
      .catch((err) => console.error('Fetch advisory history error:', err))
      .finally(() => setLoading(false));
  };

  const filteredAdvisories = advisories.filter((a) => {
    const term = searchQuery.toLowerCase();
    const title = a.ai_raw_response?.diagnosisName?.toLowerCase() || '';
    const field = a.field_name?.toLowerCase() || '';
    const crop = a.crop_name?.toLowerCase() || '';
    return title.includes(term) || field.includes(term) || crop.includes(term);
  });

  const getAdvisoryIcon = (type: string) => {
    switch (type) {
      case 'PEST_DISEASE':
        return <Bug className="w-4 h-4 text-red-400" />;
      case 'SOIL_NUTRIENT':
        return <FlaskConical className="w-4 h-4 text-emerald-400" />;
      case 'CROP_SELECTION':
        return <Sprout className="w-4 h-4 text-amber-400" />;
      case 'IRRIGATION_SCHEDULE':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-heading">Advisory Consultation History</h1>
          <p className="text-xs text-slate-400 mt-0.5">Archive of all past AI diagnostic reports and outcome trackings</p>
        </div>
        <Link
          to="/advisory/new"
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Consultation</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diagnosis or plot..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filters:</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Advisory Types</option>
            <option value="PEST_DISEASE">Pest & Disease</option>
            <option value="SOIL_NUTRIENT">Soil Nutrient</option>
            <option value="CROP_SELECTION">Crop Selection</option>
            <option value="IRRIGATION_SCHEDULE">Irrigation Plan</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading consultation records...</div>
      ) : filteredAdvisories.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
          <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Consultations Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">No past advisories match your current filter settings</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Diagnosis & Summary</th>
                  <th className="p-4">Field Plot</th>
                  <th className="p-4">Advisory Category</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Consultation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAdvisories.map((adv) => (
                  <tr
                    key={adv.id}
                    onClick={() => navigate(`/advisory/${adv.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center space-x-2">
                        {getAdvisoryIcon(adv.advisory_type)}
                        <span>{adv.ai_raw_response.diagnosisName}</span>
                      </div>
                      {adv.crop_name && (
                        <div className="text-[10px] text-slate-400 mt-0.5">Crop: {adv.crop_name} ({adv.growth_stage || 'N/A'})</div>
                      )}
                    </td>
                    <td className="p-4 text-emerald-400 font-semibold">{adv.field_name}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold">
                        {adv.advisory_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
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
  );
};
