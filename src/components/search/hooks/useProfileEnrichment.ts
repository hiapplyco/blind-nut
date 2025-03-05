
import { toast } from "sonner";

export const useProfileEnrichment = () => {
  const enrichProfile = async (profileUrl: string) => {
    try {
      toast.loading("Fetching contact information...");
      
      const response = await fetch('https://kxghaajojntkqrmvsngn.supabase.co/functions/v1/enrich-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to enrich profile');
      }
      
      const data = await response.json();
      
      toast.dismiss();
      
      if (data.data) {
        toast.success("Contact information found!");
        if (data.data.work_email) {
          toast.success(`Email: ${data.data.work_email}`);
        }
        if (data.data.mobile_phone) {
          toast.success(`Phone: ${data.data.mobile_phone}`);
        }
      } else {
        toast.error("No contact information found");
      }
    } catch (err) {
      console.error('Error enriching profile:', err);
      toast.error("Could not retrieve contact information");
    }
  };

  return { enrichProfile };
};
