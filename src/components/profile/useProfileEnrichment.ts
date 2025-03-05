
import { useState } from 'react';
import { toast } from 'sonner';

export interface EnrichedProfileData {
  work_email?: string;
  personal_emails?: string[];
  mobile_phone?: string;
  job_company_name?: string;
  industry?: string;
  job_title?: string;
  skills?: string[];
  profiles?: Array<{
    network: string;
    url: string;
    username: string;
  }>;
}

export interface Profile {
  profile_name: string;
  profile_title: string;
  profile_location: string;
  profile_url: string;
  relevance_score?: number;
}

export const useProfileEnrichment = () => {
  const [enrichedData, setEnrichedData] = useState<EnrichedProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const enrichProfile = async (profileUrl: string) => {
    if (!enrichedData && !loading) {
      setLoading(true);
      setError(null);
      
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
        setEnrichedData(data.data || null);
        
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
        setError(typeof err === 'object' && err !== null && 'message' in err 
          ? (err as Error).message 
          : 'Error retrieving contact information');
        toast.error("Could not retrieve contact information");
      } finally {
        setLoading(false);
      }
    }
    
    setShowModal(true);
  };

  return { 
    enrichedData, 
    loading, 
    error, 
    showModal, 
    setShowModal, 
    enrichProfile 
  };
};
