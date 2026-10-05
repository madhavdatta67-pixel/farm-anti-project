import React, { useState } from 'react';
import { Advisory, ActionableStep } from '@shared/schemas';
import { advisoryApi } from '../services/api';
import {
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Clock,
  FlaskConical,
  Droplets,
  Sprout,
  Tag,
  Share2,
  Sparkles,
  Archive,
} from 'lucide-react';

interface DiagnosticReportViewProps {
  advisory: Advisory;
  onStatusUpdate?: (updated: Advisory) => void;
}

export const DiagnosticReportView: React.FC<DiagnosticReportViewProps> = ({ advisory, onStatusUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(advisory.status);
  const [updating, setUpdating] = useState(false);

  const report = advisory.ai_raw_response;

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED') => {
    setUpdating(true);
    try {
      const res = await advisoryApi.updateStatus(advisory.id, newStatus);
      setCurrentStatus(res.advisory.status);
      if (onStatusUpdate) onStatusUpdate(res.advisory);
    } catch (err) {
      console.error('Failed to update advisory status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return { label: 'LOW SEVERITY', bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' };
      case 'MEDIUM':
        return { label: 'MEDIUM RISK', bg: 'bg-amber-950/80 text-amber-400 border-amber-500/30' };
      case 'HIGH':
        return { label: 'HIGH THREAT', bg: 'bg-orange-950/80 text-orange-400 border-orange-500/30' };
      case 'CRITICAL':
        return { label: 'CRITICAL EMERGENCY', bg: 'bg-red-950/90 text-red-400 border-red-500/50 animate-pulse' };
      default:
        return { label: severity, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const getActionTypeBadge = (type: 'ORGANIC' | 'CHEMICAL' | 'CULTURAL') => {
    switch (type) {
      case 'ORGANIC':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
      case 'CHEMICAL':
        return 'bg-sky-950/60 text-sky-300 border-sky-800/40';
      case 'CULTURAL':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/40';
    }
  };

  const severityBadge = getSeverityBadge(advisory.severity_rating);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Navigation & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={currentStatus}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="ACTIVE">🟢 Active Treatment</option>
            <option value="RESOLVED">✅ Resolved / Cured</option>
            <option value="ARCHIVED">📁 Archived</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        {/* Title Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wider border ${severityBadge.bg}`}>
              {severityBadge.label}
            </span>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confidence Score: <strong className="text-white">{(report.confidenceScore * 100).toFixed(0)}%</strong></span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(advisory.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            {report.diagnosisName}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
            <span>Field Plot: <strong className="text-emerald-400">{advisory.field_name || 'Registered Field'}</strong></span>
            {advisory.crop_name && <span>• Crop: <strong className="text-white">{advisory.crop_name}</strong></span>}
            {advisory.growth_stage && <span>• Stage: <strong className="text-slate-300">{advisory.growth_stage}</strong></span>}
          </div>
        </div>

        {/* Base64 Leaf Photo Preview if available */}
        {advisory.image_url && (
          <div className="rounded-xl overflow-hidden border border-slate-800 max-h-64 bg-slate-900">
            <img src={advisory.image_url} alt="Crop pathology upload" className="w-full h-64 object-cover" />
          </div>
        )}

        {/* Summary Block */}
        {report.summary && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 leading-relaxed">
            <strong className="text-white font-semibold block mb-1">Agronomic Diagnostic Summary:</strong>
            {report.summary}
          </div>
        )}

        {/* Primary Causes Section */}
        {report.primaryCauses && report.primaryCauses.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Primary Pathological & Environmental Causes</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {report.primaryCauses.map((cause: string, idx: number) => (
                <li key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actionable Steps Timeline */}
        {report.actionableSteps && report.actionableSteps.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Actionable Remediation & Treatment Plan</span>
            </h3>
            <div className="space-y-3">
              {report.actionableSteps.map((stepItem: ActionableStep, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionTypeBadge(stepItem.type)}`}>
                        {stepItem.type}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{stepItem.timeframe}</span>
                      </span>
                    </div>
                    <p className="text-sm text-slate-100 font-medium leading-normal">{stepItem.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fertilizer Formulation Box (If Present) */}
        {report.fertilizerFormulation && (
          <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-3">
            <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Recommended Stoichiometric Fertilizer Plan</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Target NPK Ratio</span>
                <span className="text-emerald-400 font-extrabold text-base">{report.fertilizerFormulation.recommendedNPKRatio}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Chemical Dose</span>
                <span className="text-slate-100 font-semibold">{report.fertilizerFormulation.chemicalFertilizerDoseKgPerHa}</span>
              </div>
            </div>
            {report.fertilizerFormulation.organicAmendmentsKgPerHa && (
              <div className="text-xs text-slate-300">
                <strong className="text-slate-200">Organic Soil Amendments:</strong> {report.fertilizerFormulation.organicAmendmentsKgPerHa}
              </div>
            )}
          </div>
        )}

        {/* Irrigation Schedule Box (If Present) */}
        {report.irrigationSchedule && (
          <div className="p-5 rounded-xl bg-sky-950/30 border border-sky-800/40 space-y-3">
            <h3 className="text-sm font-bold text-sky-300 uppercase tracking-wider flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Irrigation & Water Conservation Plan</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Daily Volume</span>
                <span className="text-sky-400 font-extrabold text-base">{report.irrigationSchedule.waterVolumeLitersPerDay} L/day</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Frequency</span>
                <span className="text-slate-100 font-semibold">{report.irrigationSchedule.frequency}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Optimal Time</span>
                <span className="text-slate-100 font-semibold">{report.irrigationSchedule.bestTimeOfDay}</span>
              </div>
            </div>
          </div>
        )}

        {/* Crop Recommendations (If Present) */}
        {report.cropRecommendations && report.cropRecommendations.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Sprout className="w-4 h-4 text-amber-400" />
              <span>Optimal Crop Selection Recommendations</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.cropRecommendations.map((rec: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-emerald-400">{rec.cropName}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {(rec.suitabilityScore * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{rec.reasoning}</p>
                  <div className="text-[11px] text-amber-300 font-semibold pt-1 border-t border-slate-800">
                    Est. Yield: {rec.expectedYieldEstimate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preventative Measures Section */}
        {report.preventativeMeasures && report.preventativeMeasures.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Preventative Biosecurity & Soil Management</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {report.preventativeMeasures.map((measure: string, idx: number) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{measure}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
