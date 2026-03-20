import { createClient } from '@supabase/supabase-js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Generate unique Case ID: e.g. CASE-20250319-4821
function generateCaseId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `CASE-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// POST /api/complaints — Plaza submits new complaint
router.post('/', async (req, res) => {
  const { toll_plaza_id, fastag_id, vrn, lane_id, crossing_datetime, image_url } = req.body;
  const prefix = fastag_id.substring(0, 6);
  const { data: mapping } = await supabase
    .from('tag_bank_mapping')
    .select('bank_id')
    .eq('tag_id_prefix', prefix)
    .single();

  const { data, error } = await supabase
    .from('complaints')
    .insert({
      case_id: generateCaseId(),
      toll_plaza_id, fastag_id, vrn, lane_id,
      crossing_datetime, image_url,
      assigned_bank_id: mapping?.bank_id || null,
      status: 'Pending'
    })
    .select().single();

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// GET /api/complaints — Fetch complaints with optional filters
// Query params: ?bank_id=xxx  or  ?plaza_id=xxx
router.get('/', async (req, res) => {
  let query = supabase
    .from('complaints')
    .select(`*, toll_plazas(name, plaza_code), issuer_banks(name, bank_code)`) // issuer_banks per your schema
    .order('created_at', { ascending: false });

  if (req.query.bank_id)  query = query.eq('assigned_bank_id', req.query.bank_id);
  if (req.query.plaza_id) query = query.eq('toll_plaza_id', req.query.plaza_id);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// PATCH /api/complaints/:id — Bank takes action
router.patch('/:id', async (req, res) => {
  const { status, bank_action_reason } = req.body;
  const { data, error } = await supabase
    .from('complaints')
    .update({ status, bank_action_reason, bank_acted_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select().single();

  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;
