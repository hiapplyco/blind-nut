// Test utility to check Nymeria setup directly from the browser
import { supabase } from "@/integrations/supabase/client";

export async function testNymeriaSetup() {
  console.log('🔍 Testing Nymeria API setup...\n');
  
  const results = {
    edgeFunctionTest: null as any,
    directApiTest: null as any,
    recommendations: [] as string[]
  };
  
  // Test 1: Check if edge function is responding
  console.log('1️⃣ Testing edge function connectivity...');
  try {
    const testProfile = 'https://www.linkedin.com/in/williamhgates/';
    
    const { data, error } = await supabase.functions.invoke('enrich-profile', {
      body: {
        profileUrl: testProfile
      }
    });
    
    if (error) {
      console.error('❌ Edge function error:', error);
      results.edgeFunctionTest = {
        success: false,
        error: error.message,
        details: error
      };
      
      if (error.message.includes('500')) {
        console.log('⚠️  Function is deployed but failing internally');
        results.recommendations.push('Check NYMERIA_API_KEY in Supabase environment variables');
      }
    } else {
      console.log('✅ Edge function responded successfully!');
      console.log('Response data:', data);
      results.edgeFunctionTest = {
        success: true,
        data: data
      };
    }
  } catch (err) {
    console.error('❌ Edge function test failed:', err);
    results.edgeFunctionTest = {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
  
  // Test 2: Direct API test (for comparison)
  console.log('\n2️⃣ Testing Nymeria API directly (requires API key)...');
  console.log('Note: This will fail due to CORS, but shows the request format');
  
  const nymeriaUrl = 'https://www.nymeria.io/api/v4/person/enrich?profile=https://www.linkedin.com/in/williamhgates/';
  console.log('Nymeria API URL:', nymeriaUrl);
  console.log('Required header: X-Api-Key: YOUR_API_KEY');
  
  // Summary
  console.log('\n📋 Test Results Summary:');
  console.log('Edge Function Test:', results.edgeFunctionTest);
  
  console.log('\n🔧 Next Steps:');
  if (!results.edgeFunctionTest.success) {
    console.log('1. Go to Supabase Dashboard > Settings > Edge Functions');
    console.log('2. Add NYMERIA_API_KEY environment variable');
    console.log('3. Deploy the latest version of enrich-profile function');
    console.log('4. Check function logs for detailed errors');
  }
  
  return results;
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).testNymeriaSetup = testNymeriaSetup;
}