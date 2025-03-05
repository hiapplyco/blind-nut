
import React from 'react';
import { 
  Button
} from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Loader2, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Profile, EnrichedProfileData } from './search/types';

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  enrichedData: EnrichedProfileData | null;
  isLoading: boolean;
  error: string | null;
  handleCardClick: () => void;
}

const ContactInfoModal: React.FC<ContactInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  profile, 
  enrichedData, 
  isLoading, 
  error, 
  handleCardClick 
}) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#8B5CF6]">{profile.profile_name}</DialogTitle>
          <DialogDescription>
            {profile.profile_title} • {profile.profile_location}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-[#8B5CF6] animate-spin" />
              <span className="ml-2 text-gray-600">Retrieving contact information...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-black">
              <p>Unable to retrieve contact information: {error}</p>
            </div>
          ) : enrichedData ? (
            <div className="space-y-4">
              <section>
                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2">
                  {enrichedData.work_email && (
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <span className="text-gray-500 w-24">Work Email:</span>
                        <a href={`mailto:${enrichedData.work_email}`} className="text-[#8B5CF6] hover:underline">
                          {enrichedData.work_email}
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(enrichedData.work_email)}
                        className="ml-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {enrichedData.personal_emails && enrichedData.personal_emails.length > 0 && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-24">Personal:</span>
                      <div className="flex flex-col">
                        {enrichedData.personal_emails.map((email, i) => (
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
                  
                  {enrichedData.mobile_phone && (
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <span className="text-gray-500 w-24">Phone:</span>
                        <a href={`tel:${enrichedData.mobile_phone}`} className="text-[#8B5CF6] hover:underline">
                          {enrichedData.mobile_phone}
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(enrichedData.mobile_phone)}
                        className="ml-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </section>
              
              <section>
                <h3 className="font-medium text-gray-900 mb-2">Professional Information</h3>
                <div className="space-y-2">
                  {enrichedData.job_company_name && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-24">Company:</span>
                      <span>{enrichedData.job_company_name}</span>
                    </div>
                  )}
                  
                  {enrichedData.industry && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-24">Industry:</span>
                      <span>{enrichedData.industry}</span>
                    </div>
                  )}
                  
                  {enrichedData.job_title && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-24">Title:</span>
                      <span>{enrichedData.job_title}</span>
                    </div>
                  )}
                </div>
              </section>
              
              {enrichedData.skills && enrichedData.skills.length > 0 && (
                <section>
                  <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {enrichedData.skills.map((skill, i) => (
                      <span key={i} className="bg-[#FEF7CD] px-2 py-1 rounded text-sm border border-black">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              
              <section>
                <h3 className="font-medium text-gray-900 mb-2">Social Profiles</h3>
                <div className="space-y-2">
                  {enrichedData.profiles && enrichedData.profiles.map((profile, i) => (
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
            </div>
          ) : (
            <div className="bg-[#FEF7CD] text-gray-900 p-4 rounded-md border border-black">
              <p>Click "Get Contact Info" to retrieve this person's contact details.</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          {!enrichedData && !isLoading && (
            <Button 
              onClick={handleCardClick} 
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Get Contact Info
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactInfoModal;
