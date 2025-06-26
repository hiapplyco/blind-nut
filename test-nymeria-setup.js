// Test script to check Nymeria API setup
// Run this in your browser console while on your app

async function testNymeriaSetup() {
  console.log('🔍 Testing Nymeria API setup...\n');
  
  try {
    // Import supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Test 1: Check if edge function is responding
    console.log('1️⃣ Testing edge function connectivity...');
    const testProfile = 'https://www.linkedin.com/in/williamhgates/';
    
    const { data, error } = await supabase.functions.invoke('enrich-profile', {
      body: {
        profileUrl: testProfile
      }
    });
    
    if (error) {
      console.error('❌ Edge function error:', error);
      console.log('Error details:', error.message);
      
      // If it's a 500 error, the function is running but failing internally
      if (error.message.includes('500')) {
        console.log('⚠️  Function is deployed but failing internally');
        console.log('This usually means:');
        console.log('  - Missing NYMERIA_API_KEY environment variable');
        console.log('  - Invalid API key');
        console.log('  - Nymeria API issues');
      }
    } else {
      console.log('✅ Edge function responded successfully!');
      console.log('Response data:', data);
    }
    
    // Test 2: Try the test endpoint if it exists
    console.log('\n2️⃣ Testing test-nymeria function (if deployed)...');
    const { data: testData, error: testError } = await supabase.functions.invoke('test-nymeria');
    
    if (testError) {
      console.log('⚠️  test-nymeria function not deployed or errored:', testError.message);
    } else {
      console.log('✅ Test function results:', testData);
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Check Supabase Dashboard > Settings > Edge Functions');
  console.log('2. Verify NYMERIA_API_KEY is set');
  console.log('3. Check function logs in dashboard');
}

// Run the test
testNymeriaSetup();