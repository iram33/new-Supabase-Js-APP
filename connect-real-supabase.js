#!/usr/bin/env node

/**
 * Quick script to test real Supabase connection
 * Run this after you set up your real Supabase project
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test connection to real Supabase
async function testRealSupabase() {
  console.log('🔍 Testing Real Supabase Connection...\n');
  
  // Check if environment variables are set
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables!');
    console.log('Please update your .env file with:');
    console.log('SUPABASE_URL=https://your-project.supabase.co');
    console.log('SUPABASE_SERVICE_KEY=your-service-role-key');
    process.exit(1);
  }
  
  console.log('📡 Connecting to:', process.env.SUPABASE_URL);
  
  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    console.log('✅ Supabase client created');
    
    // Test connection by checking if todos table exists
    console.log('\n🔍 Checking todos table...');
    
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "todos" does not exist')) {
        console.log('❌ "todos" table does not exist');
        console.log('\n📝 Please create the todos table in Supabase Dashboard:');
        console.log('1. Go to Table Editor → Create a new table');
        console.log('2. Table name: todos');
        console.log('3. Columns:');
        console.log('   - id (int8, primary key, default: identity)');
        console.log('   - task (text, not null)');
        console.log('   - completed (bool, default: false)');
        console.log('   - created_at (timestamptz, default: now())');
        console.log('4. Enable RLS (Row Level Security)');
        console.log('5. Add RLS policies for anonymous access');
      } else {
        console.log('❌ Error accessing todos table:', error.message);
        console.log('\n🔧 Possible solutions:');
        console.log('1. Check RLS policies - allow anonymous access');
        console.log('2. Verify service_role key has correct permissions');
        console.log('3. Check if project URL is correct');
      }
    } else {
      console.log('✅ "todos" table exists and is accessible');
      console.log('📊 Current todos count:', data.length);
      
      // Test inserting a sample task
      console.log('\n🧪 Testing insert operation...');
      const { data: insertData, error: insertError } = await supabase
        .from('todos')
        .insert([{ task: 'Test task from connection script' }])
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Insert failed:', insertError.message);
        console.log('\n🔧 Check RLS policies for INSERT operations');
      } else {
        console.log('✅ Insert successful:', insertData);
        
        // Clean up test data
        await supabase
          .from('todos')
          .delete()
          .eq('id', insertData.id);
        
        console.log('🧹 Test data cleaned up');
      }
    }
    
    console.log('\n🎉 Real Supabase connection test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your backend server: npm start');
    console.log('2. Test adding tasks in the frontend');
    console.log('3. Check data in Supabase Dashboard');
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify SUPABASE_URL is correct');
    console.log('2. Check SUPABASE_SERVICE_KEY is valid');
    console.log('3. Ensure project is active on supabase.com');
    console.log('4. Check network connectivity');
  }
}

// Run the test
testRealSupabase();
