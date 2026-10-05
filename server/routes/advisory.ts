import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { GenerateAdvisorySchema, UpdateAdvisoryStatusSchema, Advisory, Field } from '../../shared/schemas.js';
import { generateAgronomicAdvice } from '../services/aiEngine.js';

const router = Router();

// POST /api/advisory/generate - Generate AI Advisory with Gemini
router.post('/generate', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = GenerateAdvisorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    }

    const {
      field_id,
      advisory_type,
      crop_name,
      growth_stage,
      user_notes,
      image_base64,
      symptoms,
      affected_area_pct,
    } = parseResult.data;

    // Verify Field Ownership (RLS Rule 1 & Rule 3)
    const fieldRes = await query<Field>('SELECT * FROM fields WHERE id = $1', [field_id]);
    if (fieldRes.rows.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    const field = fieldRes.rows[0];
    if (field.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: Access denied to field' });
    }

    // Call Gemini AI Engine
    const aiResponse = await generateAgronomicAdvice({
      advisoryType: advisory_type,
      field: {
        ...field,
        area_hectares: Number(field.area_hectares),
        ph_level: field.ph_level !== null ? Number(field.ph_level) : null,
        nitrogen_ppm: field.nitrogen_ppm !== null ? Number(field.nitrogen_ppm) : null,
        phosphorus_ppm: field.phosphorus_ppm !== null ? Number(field.phosphorus_ppm) : null,
        potassium_ppm: field.potassium_ppm !== null ? Number(field.potassium_ppm) : null,
        organic_matter_pct: field.organic_matter_pct !== null ? Number(field.organic_matter_pct) : null,
      },
      cropName: crop_name,
      growthStage: growth_stage,
      userNotes: user_notes,
      imageBase64: image_base64,
      symptoms: symptoms,
      affectedAreaPct: affected_area_pct,
    });

    const severityRating = aiResponse.severityRating || 'MEDIUM';
    const imageUrl = image_base64 ? (image_base64.length > 200000 ? image_base64.substring(0, 500) + '...[truncated]' : image_base64) : null;

    // Save Advisory into PostgreSQL
    const insertRes = await query<Advisory>(
      `INSERT INTO advisories (
        field_id, user_id, advisory_type, crop_name, growth_stage,
        user_notes, image_url, ai_raw_response, severity_rating, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        field_id,
        req.user!.id,
        advisory_type,
        crop_name || null,
        growth_stage || null,
        user_notes || null,
        imageUrl,
        JSON.stringify(aiResponse),
        severityRating,
        'ACTIVE',
      ]
    );

    const advisory = insertRes.rows[0];
    return res.status(201).json({
      advisory: {
        ...advisory,
        field_name: field.name,
      },
    });
  } catch (err: any) {
    console.error('Generate advisory error:', err);
    return res.status(500).json({ error: 'Failed to generate advisory: ' + err.message });
  }
});

// GET /api/advisory - Fetch all advisories for authenticated user (RLS Rule 2)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { field_id, advisory_type, severity_rating, status } = req.query;

    let sql = `
      SELECT a.*, f.name as field_name
      FROM advisories a
      JOIN fields f ON a.field_id = f.id
      WHERE a.user_id = $1
    `;
    const params: any[] = [req.user!.id];
    let paramIdx = 2;

    if (field_id) {
      sql += ` AND a.field_id = $${paramIdx++}`;
      params.push(field_id);
    }
    if (advisory_type) {
      sql += ` AND a.advisory_type = $${paramIdx++}`;
      params.push(advisory_type);
    }
    if (severity_rating) {
      sql += ` AND a.severity_rating = $${paramIdx++}`;
      params.push(severity_rating);
    }
    if (status) {
      sql += ` AND a.status = $${paramIdx++}`;
      params.push(status);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const advisoriesRes = await query<Advisory & { field_name: string }>(sql, params);

    const advisories = advisoriesRes.rows.map((adv) => ({
      ...adv,
      ai_raw_response: typeof adv.ai_raw_response === 'string' ? JSON.parse(adv.ai_raw_response) : adv.ai_raw_response,
    }));

    return res.json({ advisories });
  } catch (err: any) {
    console.error('Fetch advisories error:', err);
    return res.status(500).json({ error: 'Failed to fetch advisory history' });
  }
});

// GET /api/advisory/:id - Fetch single advisory with RLS check
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const advisoryRes = await query<Advisory & { field_name: string }>(
      `SELECT a.*, f.name as field_name
       FROM advisories a
       JOIN fields f ON a.field_id = f.id
       WHERE a.id = $1`,
      [id]
    );

    if (advisoryRes.rows.length === 0) {
      return res.status(404).json({ error: 'Advisory not found' });
    }

    const advisory = advisoryRes.rows[0];

    // Data isolation rule check
    if (advisory.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: Access denied to advisory' });
    }

    const formattedAdvisory = {
      ...advisory,
      ai_raw_response: typeof advisory.ai_raw_response === 'string' ? JSON.parse(advisory.ai_raw_response) : advisory.ai_raw_response,
    };

    return res.json({ advisory: formattedAdvisory });
  } catch (err: any) {
    console.error('Fetch single advisory error:', err);
    return res.status(500).json({ error: 'Failed to fetch advisory detail' });
  }
});

// PATCH /api/advisory/:id/status - Update advisory status
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const parseResult = UpdateAdvisoryStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    }

    const { status } = parseResult.data;

    // Ownership check
    const checkRes = await query<Advisory>('SELECT user_id FROM advisories WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Advisory not found' });
    }
    if (checkRes.rows[0].user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    const updateRes = await query<Advisory>(
      `UPDATE advisories SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, id, req.user!.id]
    );

    const updated = updateRes.rows[0];
    return res.json({
      advisory: {
        ...updated,
        ai_raw_response: typeof updated.ai_raw_response === 'string' ? JSON.parse(updated.ai_raw_response) : updated.ai_raw_response,
      },
    });
  } catch (err: any) {
    console.error('Update advisory status error:', err);
    return res.status(500).json({ error: 'Failed to update advisory status' });
  }
});

export default router;
