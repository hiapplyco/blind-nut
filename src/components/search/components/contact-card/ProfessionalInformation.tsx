
import { EnrichedProfileData } from "../../types";

interface ProfessionalInformationProps {
  profileData: EnrichedProfileData;
}

export const ProfessionalInformation = ({ profileData }: ProfessionalInformationProps) => {
  return (
    <section>
      <h3 className="font-medium text-gray-900 mb-2">Professional Information</h3>
      <div className="space-y-2">
        {profileData.job_company_name && (
          <div className="flex items-start">
            <span className="text-gray-500 w-24">Company:</span>
            <span>{profileData.job_company_name}</span>
          </div>
        )}
        
        {profileData.industry && (
          <div className="flex items-start">
            <span className="text-gray-500 w-24">Industry:</span>
            <span>{profileData.industry}</span>
          </div>
        )}
        
        {profileData.job_title && (
          <div className="flex items-start">
            <span className="text-gray-500 w-24">Title:</span>
            <span>{profileData.job_title}</span>
          </div>
        )}
        
        {profileData.company_size && (
          <div className="flex items-start">
            <span className="text-gray-500 w-24">Company Size:</span>
            <span>{profileData.company_size}</span>
          </div>
        )}
      </div>
    </section>
  );
};
