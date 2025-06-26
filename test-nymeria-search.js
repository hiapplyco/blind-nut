// Test script for Nymeria Person Search
// Run this in your browser console while on your app

async function testNymeriaSearch() {
  console.log('🔍 Testing Nymeria Person Search...\n');
  
  try {
    // Import supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Test 1: Search by name and company
    console.log('1️⃣ Testing search by name and company...');
    const searchParams = {
      first_name: 'steve',
      last_name: 'jobs',
      company: 'apple'
    };
    
    const { data, error } = await supabase.functions.invoke('search-contacts', {
      body: { searchParams }
    });
    
    if (error) {
      console.error('❌ Search error:', error);
    } else if (data?.error) {
      console.error('❌ API error:', data.error);
      if (data.error.includes('401') || data.error.includes('Invalid')) {
        console.log('⚠️  The Nymeria API key is invalid');
        console.log('📝 Update it with: supabase secrets set NYMERIA_API_KEY=your_valid_key');
      }
    } else {
      console.log('✅ Search successful!');
      console.log(`Found ${data.total || 0} results`);
      if (data.data && data.data.length > 0) {
        console.log('\nFirst result:');
        const person = data.data[0];
        console.log(`Name: ${person.name}`);
        console.log(`Title: ${person.job_title} at ${person.company}`);
        console.log(`Location: ${person.location}`);
        console.log(`Work Email: ${person.work_email || 'Not available'}`);
        console.log(`Personal Emails: ${person.personal_emails?.join(', ') || 'Not available'}`);
        console.log(`Phone: ${person.mobile_phone || 'Not available'}`);
      }
    }
    
    // Test 2: Search with minimal params
    console.log('\n2️⃣ Testing search with just company...');
    const { data: companyData, error: companyError } = await supabase.functions.invoke('search-contacts', {
      body: { 
        searchParams: {
          company: 'microsoft',
          limit: 5
        } 
      }
    });
    
    if (companyError) {
      console.error('❌ Company search error:', companyError);
    } else if (companyData?.data) {
      console.log(`✅ Found ${companyData.total || 0} people at Microsoft`);
      console.log('Credits used:', companyData.credits_used);
      console.log('Credits remaining:', companyData.credits_remaining);
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
  
  console.log('\n📋 How to use the new search:');
  console.log('1. Click "Search Contact Info" button on any profile');
  console.log('2. Fill in search criteria (name, company, location, etc.)');
  console.log('3. Select a person from results to see contact info');
  console.log('4. Use "Enrich Profile" for direct LinkedIn enrichment');
}

// Run the test
testNymeriaSearch();