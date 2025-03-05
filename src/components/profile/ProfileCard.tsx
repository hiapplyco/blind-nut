
import React from 'react';
import { Card } from '@/components/ui/card';
import { ProfileHeader } from './ProfileHeader';
import { ProfileActions } from './ProfileActions';
import { useProfileEnrichment } from './useProfileEnrichment';
import ContactInfoModal from '../ContactInfoModal';

interface ProfileProps {
  profile: {
    profile_name: string;
    profile_title: string;
    profile_location: string;
    profile_url: string;
    relevance_score?: number;
  };
}

export const ProfileCard: React.FC<ProfileProps> = ({ profile }) => {
  const { 
    enrichedData, 
    loading, 
    error, 
    showModal, 
    setShowModal, 
    enrichProfile 
  } = useProfileEnrichment();
  
  const handleEnrichProfile = () => {
    enrichProfile(profile.profile_url);
  };
  
  return (
    <>
      <Card className="hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all p-4 mb-4 border-2 border-black relative">
        <ProfileHeader 
          name={profile.profile_name}
          title={profile.profile_title}
          location={profile.profile_location}
          score={profile.relevance_score}
        />
        
        <ProfileActions 
          profileUrl={profile.profile_url}
          onGetContactInfo={handleEnrichProfile}
          isLoading={loading}
        />
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

// Export the ProfilesList component with the refactored ProfileCard
export const ProfilesList: React.FC<{ profiles: ProfileProps['profile'][] }> = ({ profiles }) => {
  return (
    <div className="space-y-4">
      {profiles.map((profile, index) => (
        <ProfileCard key={index} profile={profile} />
      ))}
    </div>
  );
};
