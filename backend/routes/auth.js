import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { user_name, password } = req.body;
    console.log(`🔐 Login attempt for user: ${user_name}`);

    if (!user_name || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Fetch user from database
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, user_name, password, role, entity_id, plaza_id, bank_id')
      .eq('user_name', user_name)
      .single();

    console.log(`📊 User lookup result:`, { found: !!user, error: fetchError?.message });

    if (fetchError || !user) {
      console.log('❌ User not found or error:', fetchError?.message);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare passwords
    console.log(`🔑 Comparing password for user ${user_name}...`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`✓ Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        user_name: user.user_name,
        role: user.role,
        entity_id: user.entity_id,
        plaza_id: user.plaza_id,
        bank_id: user.bank_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    console.log(`✅ Login successful! Token generated for ${user.user_name}`);

    res.json({
      token,
      user: {
        id: user.id,
        user_name: user.user_name,
        role: user.role,
        entity_id: user.entity_id,
        plaza_id: user.plaza_id,
        bank_id: user.bank_id,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/register - Register new user (optional - can be restricted)
router.post('/register', async (req, res) => {
  try {
    const { user_name, password, role, entity_id } = req.body;

    if (!user_name || !password || !role || !entity_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('user_name', user_name)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          user_name,
          password: hashedPassword,
          role,
          entity_id,
        },
      ])
      .select('id, user_name, role, entity_id')
      .single();

    if (insertError) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        user_name: newUser.user_name,
        role: newUser.role,
        entity_id: newUser.entity_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.json({
      token,
      user: newUser,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

export default router;
