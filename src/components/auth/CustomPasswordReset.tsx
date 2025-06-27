
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomPasswordResetProps {
  onBack?: () => void;
}

export function CustomPasswordReset({ onBack }: CustomPasswordResetProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      // Generate reset URL - this will be the URL users click in the email
      const resetUrl = `${window.location.origin}/reset-password`;
      
      // Call our custom edge function to send branded email
      const { error: emailError } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email,
          resetUrl,
          companyName: 'Blind Nut' // Customize this to your app name
        }
      });

      if (emailError) {
        console.error('Error sending custom email:', emailError);
        // Fallback to Supabase's built-in reset if custom email fails
        const { error: fallbackError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetUrl
        });
        
        if (fallbackError) {
          throw fallbackError;
        }
        
        toast.success('Password reset email sent (using fallback method)');
      } else {
        // Also trigger Supabase's password reset to generate the actual reset token
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetUrl
        });
        
        toast.success('Password reset email sent! Check your inbox.');
      }

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Reset Your Password</h2>
        <p className="text-gray-600 mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      {onBack && (
        <Button variant="ghost" onClick={onBack} className="w-full">
          Back to Sign In
        </Button>
      )}
    </div>
  );
}
