const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const bucketName = process.env.SUPABASE_BUCKET || 'doctor-photos';

console.log('\n🔍 Checking Supabase Storage...\n');
console.log('URL:', supabaseUrl);
console.log('Bucket:', bucketName);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
    try {
        // List all buckets
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.error('\n❌ Error listing buckets:', error.message);
            return;
        }

        console.log('\n📦 Available buckets:');
        if (buckets && buckets.length > 0) {
            buckets.forEach(bucket => {
                const isPublic = bucket.public ? '🌐 Public' : '🔒 Private';
                const isCurrent = bucket.name === bucketName ? '👈 CURRENT' : '';
                console.log(`  - ${bucket.name} (${isPublic}) ${isCurrent}`);
            });
        } else {
            console.log('  No buckets found!');
        }

        // Check if our bucket exists
        const bucketExists = buckets && buckets.some(b => b.name === bucketName);
        
        console.log('\n' + '='.repeat(50));
        if (bucketExists) {
            console.log('✅ Bucket "' + bucketName + '" EXISTS!');
            const bucket = buckets.find(b => b.name === bucketName);
            if (bucket.public) {
                console.log('✅ Bucket is PUBLIC - uploads will work!');
            } else {
                console.log('⚠️  Bucket is PRIVATE - you need to make it public!');
            }
        } else {
            console.log('❌ Bucket "' + bucketName + '" DOES NOT EXIST!');
            console.log('\n📝 To create it:');
            console.log('1. Go to: https://supabase.com/dashboard/project/jrjhefeemjpttqzaykhf/storage/buckets');
            console.log('2. Click "New Bucket"');
            console.log('3. Name: ' + bucketName);
            console.log('4. Enable "Public bucket" ✅');
            console.log('5. Click "Create bucket"');
        }
        console.log('='.repeat(50) + '\n');

    } catch (err) {
        console.error('\n❌ Error:', err.message);
    }
}

checkBucket();
