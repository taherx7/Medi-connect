const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not found in .env - Photo uploads will not work');
    console.warn('   Add SUPABASE_URL and SUPABASE_KEY to enable photo uploads');
} else {
    console.log('✅ Supabase configured');
}

const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey)
    : null;

module.exports = supabase;
