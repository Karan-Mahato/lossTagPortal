import { createClient } from '@supabase/supabase-js';
import express from 'express';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) in backend/.env'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Generate unique Case ID: e.g. CASE-20250319-4821
function generateCaseId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `CASE-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// POST /api/complaints — Plaza submits new complaint
router.post('/', verifyToken, async (req, res) => {
  try {
    const { toll_plaza_id, fastag_id, vrn, lane_id, crossing_datetime, image_url } = req.body;
    
    // Validate required fields
    if (!toll_plaza_id || !fastag_id || !vrn) {
      console.log('❌ Missing required fields:', { toll_plaza_id, fastag_id, vrn });
      return res.status(400).json({ error: 'Missing required fields: toll_plaza_id, fastag_id, vrn' });
    }

    console.log('📝 Creating complaint for FASTag:', fastag_id);
    
    const prefix = fastag_id.substring(0, 6);
    const { data: mapping, error: mappingError } = await supabase
      .from('tag_bank_mapping')
      .select('bank_id')
      .eq('tag_id_prefix', prefix)
      .single();

    if (mappingError) {
      console.log('⚠️  Tag mapping not found for prefix:', prefix);
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        case_id: generateCaseId(),
        toll_plaza_id, 
        fastag_id, 
        vrn, 
        lane_id,
        crossing_datetime, 
        image_url,
        assigned_bank_id: mapping?.bank_id || null,
        status: 'Pending'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Complaint creation error:', error);
      return res.status(400).json({ error: error.message || 'Failed to create complaint' });
    }

    console.log('✅ Complaint created:', data.case_id);
    res.json(data);
  } catch (err) {
    console.error('❌ POST /complaints error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/complaints — Fetch complaints with optional filters
// Query params: ?bank_id=xxx  or  ?plaza_id=xxx
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('📋 Fetching complaints. Query:', req.query);
    
    let query = supabase
      .from('complaints')
      .select(`*, toll_plazas(name, plaza_code), issuer_banks(name, bank_code)`)
      .order('created_at', { ascending: false });

    if (req.query.bank_id) {
      console.log('🏦 Filtering by bank_id:', req.query.bank_id);
      query = query.eq('assigned_bank_id', req.query.bank_id);
    }
    
    if (req.query.plaza_id) {
      console.log('📍 Filtering by plaza_id:', req.query.plaza_id);
      query = query.eq('toll_plaza_id', req.query.plaza_id);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ GET complaints error:', error);
      return res.status(400).json({ error: error.message || 'Failed to fetch complaints' });
    }

    console.log(`✅ Found ${data.length} complaints`);
    res.json(data);
  } catch (err) {
    console.error('❌ GET /complaints error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// PATCH /api/complaints/:id — Bank takes action
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { status, bank_action_reason } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    console.log(`📝 Updating complaint ${req.params.id} with status: ${status}`);
    
    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        status, 
        bank_action_reason, 
        bank_acted_at: new Date().toISOString() 
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Complaint update error:', error);
      return res.status(400).json({ error: error.message || 'Failed to update complaint' });
    }

    console.log('✅ Complaint updated:', data.id);
    res.json(data);
  } catch (err) {
    console.error('❌ PATCH /complaints error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

export default router;
