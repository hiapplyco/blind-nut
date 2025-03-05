
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Phone, PhoneOff } from "lucide-react";
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

  const hasPhoneNumbers = profileData?.mobile_phone || (profileData?.phone_numbers && profileData.phone_numbers.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white max-h-[80vh] overflow-y-auto">
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
              {/* Contact Information Section */}
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
                      <div className="flex flex-col w-full">
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
                  
                  {/* Phone Numbers Section */}
                  {hasPhoneNumbers ? (
                    <>
                      {/* Mobile Phone (if available) */}
                      {profileData.mobile_phone && (
                        <div className="flex items-start justify-between">
                          <div className="flex">
                            <span className="text-gray-500 w-24">Mobile:</span>
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
                      
                      {/* Additional Phone Numbers (if available) */}
                      {profileData.phone_numbers && profileData.phone_numbers.length > 0 && (
                        <>
                          {profileData.phone_numbers.map((phone, i) => (
                            // Only display phone numbers that are different from the mobile_phone
                            phone !== profileData.mobile_phone && (
                              <div key={i} className="flex items-start justify-between">
                                <div className="flex">
                                  <span className="text-gray-500 w-24">Phone {i+1}:</span>
                                  <a href={`tel:${phone}`} className="text-[#8B5CF6] hover:underline">
                                    {phone}
                                  </a>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(phone)}
                                  className="ml-2"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          ))}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-24">Phone:</span>
                      <div className="flex items-center text-gray-500">
                        <PhoneOff className="h-4 w-4 mr-2" />
                        <span>No phone number available</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
              
              {/* Professional Information Section */}
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
                    
                    {profileData.company_size && (
                      <div className="flex items-start">
                        <span className="text-gray-500 w-24">Company Size:</span>
                        <span>{profileData.company_size}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}
              
              {/* Location Information */}
              {(profileData.location || profileData.city || profileData.state || profileData.country) && (
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
              )}
              
              {/* Education Section */}
              {profileData.education && profileData.education.length > 0 && (
                <section>
                  <h3 className="font-medium text-gray-900 mb-2">Education</h3>
                  <div className="space-y-3">
                    {profileData.education.map((edu, i) => (
                      <div key={i} className="border-l-2 border-[#8B5CF6] pl-3">
                        <p className="font-medium">{edu.school}</p>
                        {edu.degree && <p className="text-sm">{edu.degree}</p>}
                        {edu.field_of_study && <p className="text-sm">{edu.field_of_study}</p>}
                        {(edu.start_date || edu.end_date) && (
                          <p className="text-xs text-gray-500">
                            {edu.start_date && edu.start_date}{edu.start_date && edu.end_date && ' - '}{edu.end_date && edu.end_date}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {/* Experience Section */}
              {profileData.experience && profileData.experience.length > 0 && (
                <section>
                  <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                  <div className="space-y-3">
                    {profileData.experience.map((exp, i) => (
                      <div key={i} className="border-l-2 border-[#8B5CF6] pl-3">
                        <p className="font-medium">{exp.title}</p>
                        {exp.company && <p className="text-sm">{exp.company}</p>}
                        {(exp.start_date || exp.end_date) && (
                          <p className="text-xs text-gray-500">
                            {exp.start_date && exp.start_date}{exp.start_date && exp.end_date && ' - '}{exp.end_date && exp.end_date}
                          </p>
                        )}
                        {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {/* Skills Section */}
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
              
              {/* Languages Section */}
              {profileData.languages && profileData.languages.length > 0 && (
                <section>
                  <h3 className="font-medium text-gray-900 mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-1">
                    {profileData.languages.map((language, i) => (
                      <span key={i} className="bg-[#F3E8FF] px-2 py-1 rounded text-sm border border-black">
                        {language}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              
              {/* Social Profiles Section */}
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

