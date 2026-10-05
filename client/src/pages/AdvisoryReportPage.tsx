import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { advisoryApi } from '../services/api';
import { Advisory } from '@shared/schemas';
import { DiagnosticReportView } from '../components/DiagnosticReportView';
import { ChevronLeft, Loader2, AlertTriangle } from 'lucide-react';

export const AdvisoryReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    advisoryApi
      .getById(id)
      .then((res) => setAdvisory(res.advisory))
      .catch((err) => setError(err.message || 'Failed to fetch advisory report'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
        <span className="text-sm text-slate-400">Fetching AI Agronomic Diagnostic Report...</span>
      </div>
    );
  }

  if (error || !advisory) {
    return (
      <div className="glass-panel max-w-md mx-auto p-8 rounded-2xl text-center border border-slate-800">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Report Not Found</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'The requested advisory record could not be loaded.'}</p>
        <Link to="/history" className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold">
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <Link to="/history" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors no-print">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Consultation History</span>
      </Link>

      <DiagnosticReportView advisory={advisory} onStatusUpdate={setAdvisory} />
    </div>
  );
};
