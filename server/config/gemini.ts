import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.google_api_key;

if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY environment variable is missing.');
}

export const ai = new GoogleGenAI({
  apiKey: apiKey || 'dummy-key',
});

// Primary Gemini models specified in requirements (gemini-2.5-pro or gemini-2.5-flash / gemini-2.0-flash)
export const GEMINI_MODEL = 'gemini-2.5-pro';
