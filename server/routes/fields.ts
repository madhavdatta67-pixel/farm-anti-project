import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { CreateFieldSchema, UpdateFieldSchema, Field } from '../../shared/schemas.js';

const router = Router();

// GET /api/fields - Enforces RLS Rule 1 (user_id = req.user.id)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const fieldsRes = await query<Field>(
      'SELECT * FROM fields WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.id]
    );

    // Cast numeric fields properly
    const fields = fieldsRes.rows.map(f => ({
      ...f,
      area_hectares: Number(f.area_hectares),
      ph_level: f.ph_level !== null ? Number(f.ph_level) : null,
      nitrogen_ppm: f.nitrogen_ppm !== null ? Number(f.nitrogen_ppm) : null,
      phosphorus_ppm: f.phosphorus_ppm !== null ? Number(f.phosphorus_ppm) : null,
      potassium_ppm: f.potassium_ppm !== null ? Number(f.potassium_ppm) : null,
      organic_matter_pct: f.organic_matter_pct !== null ? Number(f.organic_matter_pct) : null,
    }));

    return res.json({ fields });
  } catch (err: any) {
    console.error('Fetch fields error:', err);
    return res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

// POST /api/fields - Validates body with Zod and creates field plot
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = CreateFieldSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    }

    const {
      name,
      location_name,
      area_hectares,
      soil_type,
      ph_level,
      nitrogen_ppm,
      phosphorus_ppm,
      potassium_ppm,
      organic_matter_pct,
    } = parseResult.data;

    const insertRes = await query<Field>(
      `INSERT INTO fields (
        user_id, name, location_name, area_hectares, soil_type,
        ph_level, nitrogen_ppm, phosphorus_ppm, potassium_ppm, organic_matter_pct
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        req.user!.id,
        name,
        location_name || null,
        area_hectares,
        soil_type,
        ph_level ?? null,
        nitrogen_ppm ?? null,
        phosphorus_ppm ?? null,
        potassium_ppm ?? null,
        organic_matter_pct ?? null,
      ]
    );

    const f = insertRes.rows[0];
    const createdField = {
      ...f,
      area_hectares: Number(f.area_hectares),
      ph_level: f.ph_level !== null ? Number(f.ph_level) : null,
      nitrogen_ppm: f.nitrogen_ppm !== null ? Number(f.nitrogen_ppm) : null,
      phosphorus_ppm: f.phosphorus_ppm !== null ? Number(f.phosphorus_ppm) : null,
      potassium_ppm: f.potassium_ppm !== null ? Number(f.potassium_ppm) : null,
      organic_matter_pct: f.organic_matter_pct !== null ? Number(f.organic_matter_pct) : null,
    };

    return res.status(201).json({ field: createdField });
  } catch (err: any) {
    console.error('Create field error:', err);
    return res.status(500).json({ error: 'Failed to create field' });
  }
});

// GET /api/fields/:id - Enforces Rule 3 (403 Forbidden if owned by another user)
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const fieldRes = await query<Field>('SELECT * FROM fields WHERE id = $1', [id]);

    if (fieldRes.rows.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    const field = fieldRes.rows[0];

    // Data isolation rule check
    if (field.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: Access denied to field' });
    }

    const formattedField = {
      ...field,
      area_hectares: Number(field.area_hectares),
      ph_level: field.ph_level !== null ? Number(field.ph_level) : null,
      nitrogen_ppm: field.nitrogen_ppm !== null ? Number(field.nitrogen_ppm) : null,
      phosphorus_ppm: field.phosphorus_ppm !== null ? Number(field.phosphorus_ppm) : null,
      potassium_ppm: field.potassium_ppm !== null ? Number(field.potassium_ppm) : null,
      organic_matter_pct: field.organic_matter_pct !== null ? Number(field.organic_matter_pct) : null,
    };

    return res.json({ field: formattedField });
  } catch (err: any) {
    console.error('Fetch single field error:', err);
    return res.status(500).json({ error: 'Failed to fetch field' });
  }
});

// PUT /api/fields/:id - Update field parameters
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const checkRes = await query<Field>('SELECT * FROM fields WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }
    if (checkRes.rows[0].user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    const parseResult = UpdateFieldSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    }

    const data = parseResult.data;
    const current = checkRes.rows[0];

    const updateRes = await query<Field>(
      `UPDATE fields SET
        name = $1,
        location_name = $2,
        area_hectares = $3,
        soil_type = $4,
        ph_level = $5,
        nitrogen_ppm = $6,
        phosphorus_ppm = $7,
        potassium_ppm = $8,
        organic_matter_pct = $9
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [
        data.name ?? current.name,
        data.location_name !== undefined ? data.location_name : current.location_name,
        data.area_hectares ?? current.area_hectares,
        data.soil_type ?? current.soil_type,
        data.ph_level !== undefined ? data.ph_level : current.ph_level,
        data.nitrogen_ppm !== undefined ? data.nitrogen_ppm : current.nitrogen_ppm,
        data.phosphorus_ppm !== undefined ? data.phosphorus_ppm : current.phosphorus_ppm,
        data.potassium_ppm !== undefined ? data.potassium_ppm : current.potassium_ppm,
        data.organic_matter_pct !== undefined ? data.organic_matter_pct : current.organic_matter_pct,
        id,
        req.user!.id,
      ]
    );

    const f = updateRes.rows[0];
    const updatedField = {
      ...f,
      area_hectares: Number(f.area_hectares),
      ph_level: f.ph_level !== null ? Number(f.ph_level) : null,
      nitrogen_ppm: f.nitrogen_ppm !== null ? Number(f.nitrogen_ppm) : null,
      phosphorus_ppm: f.phosphorus_ppm !== null ? Number(f.phosphorus_ppm) : null,
      potassium_ppm: f.potassium_ppm !== null ? Number(f.potassium_ppm) : null,
      organic_matter_pct: f.organic_matter_pct !== null ? Number(f.organic_matter_pct) : null,
    };

    return res.json({ field: updatedField });
  } catch (err: any) {
    console.error('Update field error:', err);
    return res.status(500).json({ error: 'Failed to update field' });
  }
});

// DELETE /api/fields/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const checkRes = await query<Field>('SELECT user_id FROM fields WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }
    if (checkRes.rows[0].user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    await query('DELETE FROM fields WHERE id = $1 AND user_id = $2', [id, req.user!.id]);

    return res.json({ message: 'Field deleted successfully' });
  } catch (err: any) {
    console.error('Delete field error:', err);
    return res.status(500).json({ error: 'Failed to delete field' });
  }
});

export default router;
