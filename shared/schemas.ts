import { z } from 'zod';

// User Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(['FARMER', 'AGRONOMIST', 'ADMIN']).default('FARMER'),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Field Schema
export const SoilTypeEnum = z.enum(['Clay', 'Sandy', 'Loamy', 'Silt', 'Peat', 'Chalky', 'Saline']);

export const CreateFieldSchema = z.object({
  name: z.string().min(2, "Field name must be at least 2 characters"),
  location_name: z.string().optional(),
  area_hectares: z.number({ invalid_type_error: "Area must be a number" }).positive("Area must be positive"),
  soil_type: SoilTypeEnum,
  ph_level: z.number().min(3.0, "pH must be at least 3.0").max(10.0, "pH must be at most 10.0").optional(),
  nitrogen_ppm: z.number().min(0, "Nitrogen must be non-negative").optional(),
  phosphorus_ppm: z.number().min(0, "Phosphorus must be non-negative").optional(),
  potassium_ppm: z.number().min(0, "Potassium must be non-negative").optional(),
  organic_matter_pct: z.number().min(0, "Organic matter must be non-negative").max(100, "Organic matter max 100%").optional(),
});

export const UpdateFieldSchema = CreateFieldSchema.partial();

// Advisory Request Schema
export const AdvisoryTypeEnum = z.enum([
  'CROP_SELECTION',
  'SOIL_NUTRIENT',
  'PEST_DISEASE',
  'IRRIGATION_SCHEDULE'
]);

export const GrowthStageEnum = z.enum([
  'SEEDLING',
  'VEGETATIVE',
  'FLOWERING',
  'FRUITING',
  'HARVEST_READY'
]);

export const GenerateAdvisorySchema = z.object({
  field_id: z.string().uuid("Invalid Field ID"),
  advisory_type: AdvisoryTypeEnum,
  crop_name: z.string().optional(),
  growth_stage: GrowthStageEnum.optional(),
  user_notes: z.string().optional(),
  image_base64: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  affected_area_pct: z.number().min(0).max(100).optional(),
});

export const UpdateAdvisoryStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'RESOLVED', 'ARCHIVED']),
});

// Inferred TypeScript Types
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateFieldInput = z.infer<typeof CreateFieldSchema>;
export type GenerateAdvisoryInput = z.infer<typeof GenerateAdvisorySchema>;

// DB Entity Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'FARMER' | 'AGRONOMIST' | 'ADMIN';
  created_at: string;
}

export interface Field {
  id: string;
  user_id: string;
  name: string;
  location_name?: string | null;
  area_hectares: number;
  soil_type: 'Clay' | 'Sandy' | 'Loamy' | 'Silt' | 'Peat' | 'Chalky' | 'Saline';
  ph_level?: number | null;
  nitrogen_ppm?: number | null;
  phosphorus_ppm?: number | null;
  potassium_ppm?: number | null;
  organic_matter_pct?: number | null;
  created_at: string;
}

export interface ActionableStep {
  timeframe: string;
  action: string;
  type: 'ORGANIC' | 'CHEMICAL' | 'CULTURAL';
}

export interface AdvisoryAIResponse {
  diagnosisName: string;
  confidenceScore: number;
  category: 'FUNGAL' | 'BACTERIAL' | 'VIRAL' | 'INSECT' | 'NUTRIENT_DEFICIENCY' | 'CROP_RECOMMENDATION' | 'IRRIGATION_PLAN' | 'UNKNOWN';
  severityRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary?: string;
  primaryCauses: string[];
  actionableSteps: ActionableStep[];
  preventativeMeasures: string[];
  fertilizerFormulation?: {
    recommendedNPKRatio: string;
    chemicalFertilizerDoseKgPerHa: string;
    organicAmendmentsKgPerHa: string;
    applicationSchedule: string[];
  };
  irrigationSchedule?: {
    waterVolumeLitersPerDay: number;
    frequency: string;
    bestTimeOfDay: string;
    efficiencyTips: string[];
  };
  cropRecommendations?: Array<{
    cropName: string;
    suitabilityScore: number;
    reasoning: string;
    expectedYieldEstimate: string;
  }>;
}

export interface Advisory {
  id: string;
  field_id: string;
  user_id: string;
  advisory_type: 'CROP_SELECTION' | 'SOIL_NUTRIENT' | 'PEST_DISEASE' | 'IRRIGATION_SCHEDULE';
  crop_name?: string | null;
  growth_stage?: string | null;
  user_notes?: string | null;
  image_url?: string | null;
  ai_raw_response: AdvisoryAIResponse;
  severity_rating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
  created_at: string;
  field_name?: string;
}
