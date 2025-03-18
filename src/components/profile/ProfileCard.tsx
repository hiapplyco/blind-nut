
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ContactInfoModal from '../ContactInfoModal';
import { Profile, EnrichedProfileData } from '@/components/search/types';

// Profile Card Component
export const ProfileCard = ({ profile: originalProfile }) => {
  const [showModal, setShowModal] = useState(false);
  const [enrichedData, setEnrichedData] = useState<EnrichedProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  
  // Convert the original profile to the Profile type
  const profile: Profile = {
    name: originalProfile.profile_name,
    title: originalProfile.profile_title,
    location: originalProfile.profile_location,
    profile_name: originalProfile.profile_name,
    profile_title: originalProfile.profile_title,
    profile_location: originalProfile.profile_location,
    profile_url: originalProfile.profile_url,
    snippet: originalProfile.snippet || ''
  };
  
  const handleEnrichProfile = async () => {
    setShowModal(true);
    
    if (!enrichedData && !loading) {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('https://kxghaajojntkqrmvsngn.supabase.co/functions/v1/enrich-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileUrl: profile.profile_url
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to enrich profile');
        }
        
        const data = await response.json();
        
        // Create an enriched profile data object with the required format
        const enrichedProfileData: EnrichedProfileData = {
          name: profile.profile_name,
          profile: profile,
          ...(data.data || {}),
        };
        
        setEnrichedData(enrichedProfileData);
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
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <>
      <Card 
        className={`hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all p-4 mb-4 border-2 border-black relative
                   ${expanded ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] bg-[#F5F0ED]' : 'hover:bg-[#F5F0ED]'}`}
      >
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-medium text-[#8B5CF6]">{profile.profile_name}</h3>
            <p className="text-sm font-medium text-[#8B5CF6]/80">{profile.profile_title}</p>
            {profile.profile_location && (
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1 text-emerald-600" />
                {profile.profile_location}
              </p>
            )}
          </div>
          <Button
            onClick={toggleExpand}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-black/10"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {expanded && profile.snippet && (
          <div className="mt-3 text-sm text-gray-700 bg-white/50 p-3 rounded-md border border-gray-200 animate-fade-in">
            {profile.snippet}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <a 
            href={profile.profile_url && profile.profile_url.startsWith('http') ? profile.profile_url : `https://${profile.profile_url}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-[#8B5CF6] hover:underline flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Profile
          </a>
          <Button 
            onClick={handleEnrichProfile}
            disabled={loading}
            className="border-2 border-black z-20 bg-[#FEF7CD] hover:bg-[#FEF7CD]/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)] transition-all"
            variant="secondary"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Get Contact Info'
            )}
          </Button>
        </div>
      </Card>
      
      <ContactInfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        profile={profile}
        enrichedData={enrichedData}
        isLoading={loading}
        error={error}
        handleCardClick={handleEnrichProfile}
      />
    </>
  );
};

// Profiles List Component
export const ProfilesList = ({ profiles }) => {
  return (
    <div className="space-y-4">
      {profiles.map((profile, index) => (
        <ProfileCard key={index} profile={profile} />
      ))}
    </div>
  );
};
