
import { EnrichedProfileData } from "../../types";

interface LocationInformationProps {
  profileData: EnrichedProfileData;
}

export const LocationInformation = ({ profileData }: LocationInformationProps) => {
  return (
    <section>
      <h3 className="font-medium text-gray-900 mb-2">Location</h3>
      <div className="space-y-2">
        {profileData.location && (
          <div className="flex items-start">
            <span className="text-gray-500 w-24">Location:</span>
            <span>{profileData.location}</span>
          </div>
        )}
        
        {profileData.city && (
          <div className="flex items-start">
            <span className="text-gray-500 w-24">City:</span>
            <span>{profileData.city}</span>
          </div>
        )}
        
        {profileData.state && (
          <div className="flex items-start">
            <span className="text-gray-500 w-24">State:</span>
            <span>{profileData.state}</span>
          </div>
        )}
        
        {profileData.country && (
          <div className="flex items-start">
            <span className="text-gray-500 w-24">Country:</span>
            <span>{profileData.country}</span>
          </div>
        )}
      </div>
    </section>
  );
};
