
import { assert } from "https://deno.land/std@0.168.0/assert/mod.ts";

Deno.test("Integration Test: firecrawl-url function", async () => {
  const functionUrl = "http://localhost:54321/functions/v1/firecrawl-url";
  const testUrl = "https://www.google.com"; // A simple, reliable URL for testing

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({ url: testUrl }),
  });

  const result = await response.json();

  assert(response.ok, `Request failed with status: ${response.status}`);
  assert(result.success, `Function returned an error: ${result.error}`);
  assert(result.text && typeof result.text === 'string', "Summarized text is missing or not a string");
  assert(result.rawContent && typeof result.rawContent === 'string', "Raw content is missing or not a string");
});

Deno.test("Integration Test: process-job-requirements function", async () => {
  const functionUrl = "http://localhost:54321/functions/v1/process-job-requirements";
  const jobDescription = "Software engineer with 5 years of experience in TypeScript and React.";

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({ jobDescription }),
  });

  const result = await response.json();

  assert(response.ok, `Request failed with status: ${response.status}`);
  assert(result.success, `Function returned an error: ${result.error}`);
  assert(result.data, "No data returned from the function");
});
