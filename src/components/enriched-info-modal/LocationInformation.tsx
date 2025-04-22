
import { MapPin, Globe, Building } from "lucide-react";
import { EnrichedProfileData } from "../search/types";

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
            <span className="text-gray-500 w-24 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Location:
            </span>
            <span>{profileData.location}</span>
          </div>
        )}
        
        {profileData.city && (
          <div className="flex items-start">
            <span className="text-gray-500 w-24 flex items-center">
              <Building className="h-4 w-4 mr-1" />
              City:
            </span>
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
            <span className="text-gray-500 w-24 flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              Country:
            </span>
            <span>{profileData.country}</span>
          </div>
        )}
      </div>
    </section>
  );
};
