import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Github,
  MapPin,
  Building2,
  Briefcase,
  User,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { EnrichedProfileData } from './types';

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: EnrichedProfileData | null;
  isLoading: boolean;
  profileName: string;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  isOpen,
  onClose,
  profileData,
  isLoading,
  profileName
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Debug logging
  React.useEffect(() => {
    console.log('ContactInfoModal state:', { isOpen, profileData, isLoading, profileName });
  }, [isOpen, profileData, isLoading, profileName]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const renderContactField = (icon: React.ReactNode, label: string, value: string | undefined, field: string) => {
    if (!value) return null;

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="text-gray-600">{icon}</div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(value, field)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copiedField === field ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  };

  const renderSocialProfile = (network: string, url: string) => {
    const icons: Record<string, React.ReactNode> = {
      linkedin: <Linkedin className="w-4 h-4" />,
      twitter: <Twitter className="w-4 h-4" />,
      github: <Github className="w-4 h-4" />,
    };

    return (
      <a
        key={network}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        {icons[network.toLowerCase()] || <Globe className="w-4 h-4" />}
        <span className="text-sm capitalize">{network}</span>
        <ExternalLink className="w-3 h-3 ml-auto" />
      </a>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Contact Information Found
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        We couldn't find any contact information for this profile. This might be due to privacy settings or limited data availability.
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
      <p className="text-sm text-gray-600">Enriching profile data...</p>
      <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
    </div>
  );

  // Safety check to prevent rendering issues
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="contact-info-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {profileName ? `Contact Information - ${profileName}` : 'Contact Information'}
          </DialogTitle>
        </DialogHeader>
        <p id="contact-info-description" className="sr-only">
          View and copy contact information for {profileName || 'this profile'}
        </p>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            renderLoadingState()
          ) : !profileData ? (
            renderEmptyState()
          ) : (
            <Tabs defaultValue="contact" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="space-y-2">
                  {/* Primary Email */}
                  {renderContactField(
                    <Mail className="w-4 h-4" />,
                    "Work Email",
                    profileData.work_email,
                    "Work Email"
                  )}

                  {/* Additional Emails */}
                  {profileData.emails?.map((email, index) => (
                    renderContactField(
                      <Mail className="w-4 h-4" />,
                      `Email ${index + 1}`,
                      email,
                      `Email ${index + 1}`
                    )
                  ))}

                  {/* Phone Numbers */}
                  {renderContactField(
                    <Phone className="w-4 h-4" />,
                    "Mobile Phone",
                    profileData.mobile_phone,
                    "Mobile Phone"
                  )}

                  {profileData.phone_numbers?.map((phone, index) => (
                    renderContactField(
                      <Phone className="w-4 h-4" />,
                      `Phone ${index + 1}`,
                      phone,
                      `Phone ${index + 1}`
                    )
                  ))}

                  {/* Location */}
                  {renderContactField(
                    <MapPin className="w-4 h-4" />,
                    "Location",
                    [profileData.city, profileData.state, profileData.country]
                      .filter(Boolean)
                      .join(', ') || profileData.location,
                    "Location"
                  )}

                  {/* Website */}
                  {profileData.website && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500">Website</p>
                          <a
                            href={profileData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {profileData.website}
                          </a>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 mt-4">
                {/* Current Position */}
                {(profileData.job_title || profileData.title) && (
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{profileData.job_title || profileData.title}</h4>
                        {(profileData.company || profileData.job_company_name) && (
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {profileData.company || profileData.job_company_name}
                            </span>
                          </div>
                        )}
                        {profileData.industry && (
                          <Badge variant="secondary" className="mt-2">
                            {profileData.industry}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Skills */}
                {profileData.skills && profileData.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {profileData.summary && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Summary</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {profileData.summary}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="social" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  {/* LinkedIn */}
                  {profileData.linkedin_url && 
                    renderSocialProfile('LinkedIn', profileData.linkedin_url)
                  }

                  {/* Twitter */}
                  {profileData.twitter_url && 
                    renderSocialProfile('Twitter', profileData.twitter_url)
                  }

                  {/* GitHub */}
                  {profileData.github_url && 
                    renderSocialProfile('GitHub', profileData.github_url)
                  }

                  {/* Other Social Profiles */}
                  {profileData.social_profiles?.map((profile) => 
                    renderSocialProfile(profile.network, profile.url)
                  )}

                  {/* Show empty state if no social profiles */}
                  {!profileData.linkedin_url && 
                   !profileData.twitter_url && 
                   !profileData.github_url && 
                   (!profileData.social_profiles || profileData.social_profiles.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No social profiles found
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};