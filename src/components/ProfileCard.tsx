
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, MapPin, Award } from 'lucide-react';
import { toast } from "sonner";
import ContactInfoModal from './ContactInfoModal';

// Profile Card Component
export const ProfileCard = ({ profile }) => {
  const [showModal, setShowModal] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleEnrichProfile = async () => {
    setShowModal(true);
    
    if (!enrichedData && !loading) {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${window.location.origin}/functions/v1/enrich-profile`, {
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
        setEnrichedData(data.data || null);
        toast.success("Contact information retrieved!");
      } catch (err) {
        console.error('Error enriching profile:', err);
        setError(err.message || 'Error retrieving contact information');
        toast.error("Could not retrieve contact information");
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <>
      <Card 
        className="hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all p-4 mb-4 border-2 border-black relative"
      >
        <h3 className="text-lg font-medium text-[#8B5CF6]">{profile.profile_name}</h3>
        <p className="text-sm font-medium text-[#8B5CF6]/80">{profile.profile_title}</p>
        
        {profile.profile_location && (
          <p className="text-sm text-gray-600 mt-1 flex items-center">
            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
            {profile.profile_location}
          </p>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <a 
            href={profile.profile_url && profile.profile_url.startsWith('http') ? profile.profile_url : `https://${profile.profile_url || ''}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-[#8B5CF6] hover:underline flex items-center"
          >
            View on LinkedIn <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          
          {profile.relevance_score && (
            <span className="text-sm bg-[#FEF7CD] text-gray-900 px-2 py-1 rounded-full border border-black flex items-center">
              <Award className="h-3 w-3 mr-1 text-amber-500" />
              Score: {profile.relevance_score}
            </span>
          )}
        </div>
        
        <div className="mt-3 flex justify-end z-10 relative">
          <Button 
            onClick={handleEnrichProfile}
            disabled={loading}
            className="border-2 border-black z-20 bg-[#FEF7CD] hover:bg-[#FEF7CD]/80"
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
  if (!profiles || profiles.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">No profiles to display</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {profiles.map((profile, index) => (
        <ProfileCard key={index} profile={profile} />
      ))}
    </div>
  );
};
