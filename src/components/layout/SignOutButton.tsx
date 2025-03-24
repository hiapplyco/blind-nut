
import { memo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SignOutButton = memo(function SignOutButton() {
  const navigate = useNavigate();
  
  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }, [navigate]);
  
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-[#F1F0FB]/50"
      onClick={handleSignOut}
    >
      Sign Out
    </Button>
  );
});
