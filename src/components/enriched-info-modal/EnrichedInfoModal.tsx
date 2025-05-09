import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { EnrichedProfileData, Profile } from "../search/types"; // Import Profile type
import { ContactInformation } from "./ContactInformation";
import { ProfessionalInformation } from "./ProfessionalInformation";
import { LocationInformation } from "./LocationInformation";
import { EducationInformation } from "./EducationInformation";
import { ExperienceInformation } from "./ExperienceInformation";
import { SkillsInformation } from "./SkillsInformation";
import { LanguagesInformation } from "./LanguagesInformation";
import { SocialProfiles } from "./SocialProfiles";

interface EnrichedInfoModalProps { // Rename interface
  isOpen: boolean;
  onClose: () => void;
  profile: Profile; // Change prop from profileName to profile
  profileData: EnrichedProfileData | null;
  isLoading: boolean;
  error: string | null;
}

export const EnrichedInfoModal = ({ // Rename component
  isOpen,
  onClose,
  profile, // Use profile prop
  profileData,
  isLoading,
  error,
}: EnrichedInfoModalProps) => { // Use renamed interface
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#8B5CF6]">{profile?.profile_name || "Contact Information"}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-[#8B5CF6] animate-spin mr-2" />
              <span className="text-gray-600">Retrieving contact information...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-black">
              <p>Unable to retrieve contact information: {error}</p>
            </div>
          ) : profileData ? (
            <div className="space-y-4">
              <ContactInformation profileData={profileData} />
              
              {(profileData.title || profileData.job_title || profileData.company || profileData.job_company_name || profileData.industry) && (
                <ProfessionalInformation profileData={profileData} />
              )}
              
              {(profileData.location || profileData.city || profileData.state || profileData.country) && (
                <LocationInformation profileData={profileData} />
              )}
              
              {profileData.education && profileData.education.length > 0 && (
                <EducationInformation education={profileData.education} />
              )}
              
              {profileData.experience && profileData.experience.length > 0 && (
                <ExperienceInformation experience={profileData.experience} />
              )}
              
              {profileData.skills && profileData.skills.length > 0 && (
                <SkillsInformation skills={profileData.skills} />
              )}
              
              {profileData.languages && profileData.languages.length > 0 && (
                <LanguagesInformation languages={profileData.languages} />
              )}
              
              {(profileData.social_profiles || profileData.profiles) && 
                ((profileData.social_profiles && profileData.social_profiles.length > 0) || 
                 (profileData.profiles && profileData.profiles.length > 0)) && (
                <SocialProfiles profiles={(profileData.social_profiles || profileData.profiles)!} />
              )}
            </div>
          ) : (
            <div className="bg-[#FEF7CD] text-gray-900 p-4 rounded-md border border-black">
              <p>No contact information found for this profile.</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};