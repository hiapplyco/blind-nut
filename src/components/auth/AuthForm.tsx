import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { SocialAuthButtons } from "./SocialAuthButtons";

interface AuthFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

export function AuthForm({ redirectTo, onSuccess }: AuthFormProps) {
  return (
    <div className="space-y-6">
      {/* Social Auth Buttons - Google, etc. */}
      <SocialAuthButtons onSuccess={onSuccess} redirectTo={redirectTo} />
      
      {/* Supabase Auth UI for Email/Password */}
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          style: {
            button: {
              background: '#8B5CF6',
              border: '2px solid black',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
              borderRadius: '4px',
              color: 'white',
              fontWeight: 'bold',
              padding: '10px 20px',
            },
            input: {
              border: '2px solid black',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
              borderRadius: '4px',
              padding: '10px',
            },
            label: {
              color: '#44332A',
              fontWeight: 'medium',
            },
            loader: {
              color: '#8B5CF6',
            },
            message: {
              color: '#ef4444',
              fontSize: '14px',
              marginTop: '4px',
            },
          },
          variables: {
            default: {
              colors: {
                brand: '#8B5CF6',
                brandAccent: '#7c4ef3',
              },
            },
          },
        }}
        theme="light"
        providers={[]} // We're handling social providers ourselves
        redirectTo={redirectTo || `${window.location.origin}/reset-password`}
        onlyThirdPartyProviders={false}
        socialLayout="vertical"
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email address',
              password_label: 'Password',
              button_label: 'Sign in with Email',
              loading_button_label: 'Signing in...',
              social_provider_text: 'Sign in with {{provider}}',
              link_text: "Don't have an account? Sign up",
            },
            sign_up: {
              email_label: 'Email address',
              password_label: 'Create a password',
              button_label: 'Sign up',
              loading_button_label: 'Creating account...',
              social_provider_text: 'Sign up with {{provider}}',
              link_text: 'Already have an account? Sign in',
            },
            forgotten_password: {
              link_text: 'Forgot your password?',
              button_label: 'Send reset instructions',
              loading_button_label: 'Sending instructions...',
            },
          },
        }}
      />
    </div>
  );
}