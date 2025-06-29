#!/bin/bash

# Deploy only the send-password-reset function
echo "🚀 Deploying send-password-reset function..."

# First, try the normal deployment
echo "Attempting standard deployment..."
supabase functions deploy send-password-reset --no-verify-jwt

# If that doesn't work, you can try these alternatives:

# Alternative 1: Deploy with increased timeout
# supabase functions deploy send-password-reset --no-verify-jwt --timeout 300

# Alternative 2: Deploy all functions (sometimes helps with shared dependencies)
# supabase functions deploy

# Alternative 3: Use the Supabase Dashboard
# 1. Go to your Supabase Dashboard
# 2. Navigate to Functions
# 3. Click "New function" or update existing
# 4. Copy the contents of supabase/functions/send-password-reset/index.ts
# 5. Set environment variables:
#    - SENDGRID_API_KEY
#    - SENDER_EMAIL
#    - SENDER_NAME

echo "✅ Deployment command sent!"
echo ""
echo "If deployment is stuck, try:"
echo "1. Check Supabase Dashboard > Functions > Logs for errors"
echo "2. Ensure all environment variables are set in the dashboard"
echo "3. Try deploying via the Supabase Dashboard UI instead"