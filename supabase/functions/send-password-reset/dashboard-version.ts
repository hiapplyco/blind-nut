// Dashboard-ready version of send-password-reset function
Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl, companyName = "Blind Nut" } = await req.json();
    
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const senderEmail = Deno.env.get('SENDER_EMAIL') || 'hello@apply.codes';
    const senderName = Deno.env.get('SENDER_NAME') || 'Blind Nut';
    
    if (!sendGridApiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const emailData = {
      personalizations: [
        {
          to: [{ email }],
          subject: `Reset your ${companyName} password`
        }
      ],
      from: {
        email: senderEmail,
        name: senderName
      },
      content: [
        {
          type: "text/html",
          value: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${companyName}</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                
                <p>We received a request to reset your password for your ${companyName} account.</p>
                
                <p>Click the button below to reset your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-weight: bold; 
                            display: inline-block;">
                    Reset Password
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="color: #667eea; word-break: break-all; font-size: 14px;">
                  ${resetUrl}
                </p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                
                <p style="color: #666; font-size: 14px;">
                  If you didn't request this password reset, you can safely ignore this email. 
                  Your password will remain unchanged.
                </p>
                
                <p style="color: #666; font-size: 14px;">
                  This link will expire in 1 hour for security reasons.
                </p>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  Best regards,<br>
                  The ${companyName} Team
                </p>
              </div>
            </body>
            </html>
          `
        }
      ]
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid API error:', response.status, errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log('Password reset email sent successfully to:', email);

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset email sent' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending password reset email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})