/**
 * Database Migration Runner
 * 
 * This script runs all SQL migrations in order against the Supabase database.
 * Requires: @supabase/supabase-js and dotenv packages
 * 
 * Usage: node run-migrations.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check if Supabase packages are installed
try {
    require('@supabase/supabase-js');
} catch (error) {
    console.error('Error: @supabase/supabase-js is not installed.');
    console.error('Please run: npm install @supabase/supabase-js dotenv');
    process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing required environment variables.');
    console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env file');
    process.exit(1);
}

// Initialize Supabase client with service role key (required for schema changes)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Migration files in order
const migrations = [
    '001_create_students_table.sql',
    '002_create_attendance_logs_table.sql',
    '003_create_rooms_table.sql',
    '004_create_timetable_table.sql',
    '005_create_users_table.sql'
];

/**
 * Execute a SQL migration file
 */
async function runMigration(filename) {
    const filePath = path.join(__dirname, 'migrations', filename);
    
    console.log(`\n📄 Running migration: ${filename}`);
    
    try {
        // Read SQL file
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Execute SQL using Supabase RPC
        // Note: Supabase doesn't have a direct SQL execution method via JS client
        // This is a placeholder - actual implementation would use Supabase REST API
        console.log(`   SQL content loaded (${sql.length} characters)`);
        console.log('   ⚠️  Please run this migration manually in Supabase SQL Editor');
        console.log(`   Or use: supabase db execute --file migrations/${filename}`);
        
        return true;
    } catch (error) {
        console.error(`   ❌ Error reading migration file: ${error.message}`);
        return false;
    }
}

/**
 * Main migration runner
 */
async function runAllMigrations() {
    console.log('🚀 Starting database migrations...\n');
    console.log('Database:', process.env.SUPABASE_URL);
    console.log('='.repeat(60));
    
    let successCount = 0;
    
    for (const migration of migrations) {
        const success = await runMigration(migration);
        if (success) {
            successCount++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Migration check complete: ${successCount}/${migrations.length} files processed`);
    console.log('\n📝 IMPORTANT: To actually run these migrations:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste each migration file content');
    console.log('   4. Execute them in order\n');
    console.log('   OR use Supabase CLI:');
    console.log('   supabase link --project-ref your-project-ref');
    console.log('   supabase db push\n');
}

// Run migrations
runAllMigrations().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
