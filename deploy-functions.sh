#!/bin/bash

# Deploy Supabase Edge Functions using the Management API
# This is an alternative when the CLI times out

echo "🚀 Deploying Supabase Edge Functions..."

# You'll need to get these from your Supabase dashboard
PROJECT_ID="kxghaajojntkqrmvsngn"
SUPABASE_ACCESS_TOKEN="your_access_token_here"

# Deploy enrich-profile
echo "Deploying enrich-profile..."
curl -X POST "https://api.supabase.com/v1/projects/${PROJECT_ID}/functions/enrich-profile/deploy" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

# Deploy test-nymeria
echo "Deploying test-nymeria..."
curl -X POST "https://api.supabase.com/v1/projects/${PROJECT_ID}/functions/test-nymeria/deploy" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

echo "✅ Deployment requests sent!"