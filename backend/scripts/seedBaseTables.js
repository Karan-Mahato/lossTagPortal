import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedBaseTables() {
  try {
    console.log('🔄 Seeding toll plazas and issuer banks...\n');

    // Seed Toll Plazas
    const plazasData = [
      { name: 'DME 001 - Pune', plaza_code: 'DME001' },
      { name: 'NH 48 - Belgaum', plaza_code: 'NH48' },
      { name: 'NH 44 - Hyderabad', plaza_code: 'NH44' },
    ];

    console.log('📍 Adding toll plazas...');
    for (const plaza of plazasData) {
      const { data: existingPlaza } = await supabase
        .from('toll_plazas')
        .select('id')
        .eq('plaza_code', plaza.plaza_code)
        .single();

      if (existingPlaza) {
        console.log(`  ⏭️  Plaza ${plaza.plaza_code} already exists`);
        continue;
      }

      const { data, error } = await supabase
        .from('toll_plazas')
        .insert([plaza])
        .select();

      if (error) {
        console.error(`  ❌ Error adding plaza ${plaza.plaza_code}:`, error.message);
      } else {
        console.log(`  ✅ Added plaza: ${plaza.name}`);
      }
    }

    // Seed Issuer Banks
    const banksData = [
      { name: 'ICICI Bank', bank_code: 'ICICI' },
      { name: 'HDFC Bank', bank_code: 'HDFC' },
      { name: 'State Bank of India', bank_code: 'SBI' },
      { name: 'Axis Bank', bank_code: 'AXIS' },
    ];

    console.log('\n🏦 Adding issuer banks...');
    for (const bank of banksData) {
      const { data: existingBank } = await supabase
        .from('issuer_banks')
        .select('id')
        .eq('bank_code', bank.bank_code)
        .single();

      if (existingBank) {
        console.log(`  ⏭️  Bank ${bank.bank_code} already exists`);
        continue;
      }

      const { data, error } = await supabase
        .from('issuer_banks')
        .insert([bank])
        .select();

      if (error) {
        console.error(`  ❌ Error adding bank ${bank.bank_code}:`, error.message);
      } else {
        console.log(`  ✅ Added bank: ${bank.name}`);
      }
    }

    // Seed Tag-Bank Mapping
    console.log('\n🏷️  Adding tag-bank mappings...');
    const mappings = [
      { tag_id_prefix: 'BH', bank_id: null }, // Will be updated to first bank
      { tag_id_prefix: 'MH', bank_id: null }, // Will be updated to second bank
      { tag_id_prefix: 'KA', bank_id: null }, // Will be updated to third bank
    ];

    // Fetch banks to get their IDs
    const { data: allBanks } = await supabase
      .from('issuer_banks')
      .select('id, bank_code');

    if (allBanks && allBanks.length > 0) {
      for (let i = 0; i < mappings.length && i < allBanks.length; i++) {
        mappings[i].bank_id = allBanks[i].id;
      }
    }

    for (const mapping of mappings) {
      const { data: existingMapping } = await supabase
        .from('tag_bank_mapping')
        .select('tag_id_prefix')
        .eq('tag_id_prefix', mapping.tag_id_prefix)
        .single();

      if (existingMapping) {
        console.log(`  ⏭️  Mapping for ${mapping.tag_id_prefix} already exists`);
        continue;
      }

      const { data, error } = await supabase
        .from('tag_bank_mapping')
        .insert([mapping])
        .select();

      if (error) {
        console.error(`  ❌ Error adding mapping for ${mapping.tag_id_prefix}:`, error.message);
      } else {
        console.log(`  ✅ Added mapping for prefix: ${mapping.tag_id_prefix}`);
      }
    }

    console.log('\n✅ Base tables seeding complete!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedBaseTables();
