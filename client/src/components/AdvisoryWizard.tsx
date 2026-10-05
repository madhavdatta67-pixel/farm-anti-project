import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Field, AdvisoryTypeEnum, GrowthStageEnum } from '@shared/schemas';
import { fieldsApi, advisoryApi } from '../services/api';
import { ImageUploader } from './ImageUploader';
import {
  Sparkles,
  Sprout,
  FlaskConical,
  Bug,
  Droplets,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

const SYMPTOM_OPTIONS = [
  'Leaf Yellowing / Chlorosis',
  'Spotting or Brown Lesions',
  'Wilting / Drooping Stems',
  'Stunting / Stunted Growth',
  'Root Rot or Blackening',
  'Insect Damage / Chewed Leaves',
  'Powdery Mildew / White Film',
  'Fruit Rot or Deformity',
];

export const AdvisoryWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFieldId = searchParams.get('fieldId') || '';

  const [fields, setFields] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [step, setStep] = useState(1);

  // Form State
  const [selectedFieldId, setSelectedFieldId] = useState(initialFieldId);
  const [advisoryType, setAdvisoryType] = useState<'CROP_SELECTION' | 'SOIL_NUTRIENT' | 'PEST_DISEASE' | 'IRRIGATION_SCHEDULE'>('PEST_DISEASE');
  const [cropName, setCropName] = useState('');
  const [growthStage, setGrowthStage] = useState<'SEEDLING' | 'VEGETATIVE' | 'FLOWERING' | 'FRUITING' | 'HARVEST_READY'>('VEGETATIVE');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [affectedAreaPct, setAffectedAreaPct] = useState<number>(15);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [userNotes, setUserNotes] = useState('');

  // Processing & Error state
  const [submitting, setSubmitting] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Initializing Gemini Agronomy Engine...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fieldsApi
      .getAll()
      .then((res) => {
        setFields(res.fields);
        if (res.fields.length > 0 && !selectedFieldId) {
          setSelectedFieldId(res.fields[0].id);
        }
      })
      .catch((err) => setError('Failed to load registered fields'))
      .finally(() => setLoadingFields(false));
  }, []);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFieldId) {
      setError('Please select a field to run advisory');
      return;
    }

    setSubmitting(true);
    setError(null);

    const stages = [
      'Ingesting soil N-P-K & pH parameters...',
      'Evaluating local atmospheric humidity & evapotranspiration...',
      'Running Google Gemini multi-modal agronomic pathology analysis...',
      'Synthesizing IPM treatment steps & organic fertilizer schedule...',
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setLoadingStage(stages[stageIdx]);
    }, 1200);

    try {
      const res = await advisoryApi.generate({
        field_id: selectedFieldId,
        advisory_type: advisoryType,
        crop_name: cropName || undefined,
        growth_stage: growthStage,
        user_notes: userNotes || undefined,
        image_base64: imageBase64,
        symptoms: selectedSymptoms,
        affected_area_pct: affectedAreaPct,
      });

      clearInterval(interval);
      navigate(`/advisory/${res.advisory.id}`);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Failed to generate advisory');
      setSubmitting(false);
    }
  };

  if (loadingFields) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
        <span className="text-sm text-slate-400">Loading farm plots...</span>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="glass-panel max-w-xl mx-auto p-8 rounded-2xl border border-slate-800 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white font-heading">No Fields Registered</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          Before requesting an AI advisory consultation, you need to register at least one farm plot with soil test metrics.
        </p>
        <button
          onClick={() => navigate('/fields')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
        >
          Add Your First Field Plot
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 2.5 Agronomy Advisory Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-heading">AI Agricultural Advisory Wizard</h1>
        <p className="text-sm text-slate-400 mt-1">Configure field parameters & symptoms for instant actionable agronomic advice</p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 text-xs font-semibold ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>1</div>
          <span>Category & Field</span>
        </div>
        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
        <div className={`flex items-center space-x-2 text-xs font-semibold ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>2</div>
          <span>Symptoms & Crop</span>
        </div>
        <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
        <div className={`flex items-center space-x-2 text-xs font-semibold ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>3</div>
          <span>Photo Pathology</span>
        </div>
      </div>

      {/* Loading Overlay when generating AI response */}
      {submitting ? (
        <div className="glass-panel p-12 rounded-2xl border border-emerald-500/30 text-center flex flex-col items-center justify-center min-h-[380px]">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
            <Sparkles className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white font-heading mb-2">Analyzing Field Data with Google Gemini</h3>
          <p className="text-sm text-emerald-400 font-medium animate-pulse max-w-md">{loadingStage}</p>
          <p className="text-xs text-slate-500 mt-4">Synthesizing IPM solutions, stoichiometric fertilizer formulas, and irrigation schedules...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT ADVISORY TYPE & TARGET FIELD */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">1. Select Advisory Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'PEST_DISEASE',
                      title: 'Pest & Pathogen Visual Diagnosis',
                      desc: 'Multi-modal image analysis of plant damage to diagnose fungal, bacterial, viral, or insect issues.',
                      icon: Bug,
                      color: 'border-red-500/30 text-red-400 bg-red-950/20',
                    },
                    {
                      id: 'SOIL_NUTRIENT',
                      title: 'Fertilizer & Soil Health Calculator',
                      desc: 'Dynamic calculation of nutrient deficits and chemical/organic fertilizer formulations.',
                      icon: FlaskConical,
                      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
                    },
                    {
                      id: 'CROP_SELECTION',
                      title: 'Crop Selection Advisor',
                      desc: 'Suggest optimal crops given soil N-P-K profile, pH, season, and climate suitability.',
                      icon: Sprout,
                      color: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
                    },
                    {
                      id: 'IRRIGATION_SCHEDULE',
                      title: 'Irrigation & Evapotranspiration Planner',
                      desc: 'Automated water volume and schedule planner based on soil water retention & growth stage.',
                      icon: Droplets,
                      color: 'border-sky-500/30 text-sky-400 bg-sky-950/20',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const selected = advisoryType === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setAdvisoryType(item.id as any)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selected
                            ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/20'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${item.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">2. Target Farm Field Plot</label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.soil_type} Soil, {f.area_hectares} Ha, pH {f.ph_level ?? 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
                >
                  <span>Next: Crop & Symptoms</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CROP & SYMPTOMS INPUT */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Name & Cultivar</label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Tomato (Heirloom), Wheat, Maize"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SEEDLING">Seedling / Germination</option>
                    <option value="VEGETATIVE">Vegetative Growth</option>
                    <option value="FLOWERING">Flowering / Blooming</option>
                    <option value="FRUITING">Fruiting / Grain Filling</option>
                    <option value="HARVEST_READY">Harvest Ready</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Observed Symptoms (Check all that apply)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SYMPTOM_OPTIONS.map((symptom) => {
                    const checked = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        type="button"
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          checked
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${checked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'}`}>
                            {checked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{symptom}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Affected Plot Area Percentage</label>
                  <span className="text-xs font-bold text-emerald-400">{affectedAreaPct}% of field</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={affectedAreaPct}
                  onChange={(e) => setAffectedAreaPct(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
                >
                  <span>Next: Photo & Submit</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTO ATTACHMENT & NOTES */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Attach Plant Photo for Gemini Visual Pathology (Optional)
                </label>
                <ImageUploader value={imageBase64} onChange={setImageBase64} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Observations or Notes</label>
                <textarea
                  rows={3}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Describe recent irrigation frequency, weather events, previous chemical applications, or specific questions..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Advisory</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
