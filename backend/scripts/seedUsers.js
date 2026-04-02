import bcrypt from 'bcryptjs';
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

async function seedUsers() {
  try {
    console.log('🔄 Fetching toll plazas and banks...');

    // Fetch toll plazas
    const { data: plazas, error: plazasError } = await supabase
      .from('toll_plazas')
      .select('id, plaza_code');

    if (plazasError) {
      console.warn('⚠️  Could not fetch toll plazas:', plazasError.message);
    }

    // Fetch issuer banks
    const { data: banks, error: banksError } = await supabase
      .from('issuer_banks')
      .select('id, bank_code');

    if (banksError) {
      console.warn('⚠️  Could not fetch issuer banks:', banksError.message);
    }

    // Log what was fetched
    console.log(`📍 Found ${plazas?.length || 0} toll plazas`);
    console.log(`🏦 Found ${banks?.length || 0} issuer banks\n`);

    // Create test users with correct roles (PLAZA, BANK, IHMCL)
    const testUsers = [
      {
        user_name: 'admin_ihmcl',
        password: 'admin@123',
        role: 'IHMCL',
        entity_id: 0,
      },
      ...(plazas && plazas.length > 0 ? [{
        user_name: 'plaza_dme001',
        password: 'plaza@123',
        role: 'PLAZA',
        entity_id: 1,
        plaza_id: plazas[0].id,
      }] : []),
      ...(plazas && plazas.length > 1 ? [{
        user_name: 'plaza_nh48',
        password: 'plaza@123',
        role: 'PLAZA',
        entity_id: 2,
        plaza_id: plazas[1].id,
      }] : []),
      ...(banks && banks.length > 0 ? [{
        user_name: 'bank_icici',
        password: 'bank@123',
        role: 'BANK',
        entity_id: 1,
        bank_id: banks[0].id,
      }] : []),
      ...(banks && banks.length > 1 ? [{
        user_name: 'bank_hdfc',
        password: 'bank@123',
        role: 'BANK',
        entity_id: 2,
        bank_id: banks[1].id,
      }] : []),
      ...(banks && banks.length > 2 ? [{
        user_name: 'bank_sbi',
        password: 'bank@123',
        role: 'BANK',
        entity_id: 3,
        bank_id: banks[2].id,
      }] : []),
    ];

    console.log('🌱 Starting user seeding...');

    for (const user of testUsers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('user_name', user.user_name)
        .single();

      if (existingUser) {
        console.log(`⏭️  User ${user.user_name} already exists, skipping...`);
        continue;
      }

      // Prepare insert data with all fields
      const insertData = {
        user_name: user.user_name,
        password: hashedPassword,
        role: user.role,
        entity_id: user.entity_id,
        bank_id: user.bank_id || null,  // Explicitly set to null if not provided
        plaza_id: user.plaza_id || null, // Explicitly set to null if not provided
      };

      // Insert user
      const { data, error } = await supabase
        .from('users')
        .insert([insertData])
        .select();

      if (error) {
        console.error(`❌ Error creating user ${user.user_name}:`, error);
      } else {
        console.log(`✅ Created user: ${user.user_name} (role: ${user.role})`);
      }
    }

    console.log('\n✅ User seeding complete!');
    console.log('\n📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach((u) => {
      console.log(`  ${u.user_name.padEnd(18)} → ${u.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedUsers();