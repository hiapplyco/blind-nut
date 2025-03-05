
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EnrichedProfileData } from "../types";

interface ContactCardProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: EnrichedProfileData | null;
  isLoading: boolean;
  error: string | null;
  profileName: string;
}

export const ContactCard = ({
  isOpen,
  onClose,
  profileData,
  isLoading,
  error,
  profileName
}: ContactCardProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#8B5CF6]">{profileName || "Contact Information"}</DialogTitle>
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
              <section>
                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2">
                  {profileData.work_email && (
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <span className="text-gray-500 w-24">Work Email:</span>
                        <a href={`mailto:${profileData.work_email}`} className="text-[#8B5CF6] hover:underline">
                          {profileData.work_email}
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(profileData.work_email)}
                        className="ml-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {profileData.personal_emails && profileData.personal_emails.length > 0 && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-24">Personal:</span>
                      <div className="flex flex-col">
                        {profileData.personal_emails.map((email, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <a href={`mailto:${email}`} className="text-[#8B5CF6] hover:underline">
                              {email}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(email)}
                              className="ml-2"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profileData.mobile_phone && (
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <span className="text-gray-500 w-24">Phone:</span>
                        <a href={`tel:${profileData.mobile_phone}`} className="text-[#8B5CF6] hover:underline">
                          {profileData.mobile_phone}
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(profileData.mobile_phone)}
                        className="ml-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </section>
              
              {(profileData.job_title || profileData.job_company_name || profileData.industry) && (
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
                  </div>
                </section>
              )}
              
              {profileData.skills && profileData.skills.length > 0 && (
                <section>
                  <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {profileData.skills.map((skill, i) => (
                      <span key={i} className="bg-[#FEF7CD] px-2 py-1 rounded text-sm border border-black">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              
              {profileData.profiles && profileData.profiles.length > 0 && (
                <section>
                  <h3 className="font-medium text-gray-900 mb-2">Social Profiles</h3>
                  <div className="space-y-2">
                    {profileData.profiles.map((profile, i) => (
                      <div key={i} className="flex items-start">
                        <span className="text-gray-500 w-24 capitalize">{profile.network}:</span>
                        <a 
                          href={profile.url.startsWith('http') ? profile.url : `https://${profile.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8B5CF6] hover:underline"
                        >
                          {profile.username}
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
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
