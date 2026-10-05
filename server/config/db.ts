import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let pgliteInstance: PGlite | null = null;
let pgPoolInstance: pg.Pool | null = null;

const dbDir = path.resolve(process.cwd(), 'data/db');

// Ensure data directory exists for embedded PGlite persistence
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export async function getDb() {
  if (pgPoolInstance || pgliteInstance) {
    return;
  }

  // If DATABASE_URL is provided (and not placeholder), try standard PostgreSQL pool
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql://') && !process.env.DATABASE_URL.includes('localhost:5432/agri_advisory_db')) {
    try {
      console.log('Connecting to PostgreSQL database via DATABASE_URL...');
      pgPoolInstance = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      });
      await pgPoolInstance.query('SELECT 1');
      console.log('PostgreSQL connected successfully.');
      return;
    } catch (err) {
      console.warn('PostgreSQL connection failed, falling back to embedded PGlite engine:', (err as Error).message);
      pgPoolInstance = null;
    }
  }

  // Fallback to Embedded PGlite engine (Persistent local PostgreSQL WASM)
  console.log('Initializing embedded persistent PGlite engine at:', dbDir);
  pgliteInstance = new PGlite(dbDir);
  await pgliteInstance.waitReady;
  console.log('PGlite embedded database ready.');
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[] }> {
  await getDb();

  if (pgPoolInstance) {
    const res = await pgPoolInstance.query(sql, params);
    return { rows: res.rows as T[] };
  } else if (pgliteInstance) {
    // PGlite query execution
    const res = await pgliteInstance.query(sql, params);
    return { rows: res.rows as T[] };
  } else {
    throw new Error('Database not initialized');
  }
}

export async function initDbSchema() {
  await getDb();

  console.log('Running Database Schema Migrations...');

  // Enable UUID extension if using live postgres
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  } catch (e) {
    // PGlite supports gen_random_uuid() natively
  }

  // Create USERS table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT ${pgliteInstance ? 'gen_random_uuid()' : 'uuid_generate_v4()'},
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'AGRONOMIST', 'ADMIN')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create FIELDS table
  await query(`
    CREATE TABLE IF NOT EXISTS fields (
      id UUID PRIMARY KEY DEFAULT ${pgliteInstance ? 'gen_random_uuid()' : 'uuid_generate_v4()'},
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      location_name VARCHAR(255),
      area_hectares NUMERIC(8,2) NOT NULL,
      soil_type VARCHAR(50) NOT NULL,
      ph_level NUMERIC(3,1),
      nitrogen_ppm NUMERIC(6,2),
      phosphorus_ppm NUMERIC(6,2),
      potassium_ppm NUMERIC(6,2),
      organic_matter_pct NUMERIC(4,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create ADVISORIES table
  await query(`
    CREATE TABLE IF NOT EXISTS advisories (
      id UUID PRIMARY KEY DEFAULT ${pgliteInstance ? 'gen_random_uuid()' : 'uuid_generate_v4()'},
      field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      advisory_type VARCHAR(50) NOT NULL CHECK (advisory_type IN ('CROP_SELECTION', 'SOIL_NUTRIENT', 'PEST_DISEASE', 'IRRIGATION_SCHEDULE')),
      crop_name VARCHAR(100),
      growth_stage VARCHAR(50),
      user_notes TEXT,
      image_url TEXT,
      ai_raw_response JSONB NOT NULL,
      severity_rating VARCHAR(20) CHECK (severity_rating IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'ARCHIVED')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create performance indexes
  try {
    await query(`CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_advisories_field_id ON advisories(field_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_advisories_user_id ON advisories(user_id);`);
  } catch (e) {
    // Ignore index creation errors if exists
  }

  console.log('Database Schema Migrations Completed Successfully.');
}
