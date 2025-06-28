
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Mail, Phone, MapPin, Building2, Calendar, ExternalLink, Briefcase, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  company?: string;
  title?: string;
  profileUrl?: string;
  bio?: string;
  experience?: any[];
  education?: any[];
  skills?: string[];
  emails?: string[];
  phone_numbers?: string[];
  social_profiles?: any[];
}

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: ContactInfo | null;
  isLoading: boolean;
}

export const ContactInfoModal = ({ 
  isOpen, 
  onClose, 
  contactInfo, 
  isLoading 
}: ContactInfoModalProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading Contact Information...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!contactInfo) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
            <DialogDescription>
              No contact information available for this profile.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {contactInfo.name}
          </DialogTitle>
          <DialogDescription>
            Detailed contact and profile information
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Details */}
                  <div className="space-y-3">
                    {contactInfo.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contactInfo.email}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(contactInfo.email!, 'Email')}
                          className="h-6 px-2"
                        >
                          {copied === 'Email' ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    )}
                    
                    {contactInfo.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contactInfo.phone}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(contactInfo.phone!, 'Phone')}
                          className="h-6 px-2"
                        >
                          {copied === 'Phone' ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    )}
                    
                    {contactInfo.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contactInfo.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Professional Info */}
                  <div className="space-y-3">
                    {contactInfo.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contactInfo.company}</span>
                      </div>
                    )}
                    
                    {contactInfo.title && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contactInfo.title}</span>
                      </div>
                    )}
                    
                    {contactInfo.profileUrl && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={contactInfo.profileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {contactInfo.bio && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">{contactInfo.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Contact Methods */}
            {((contactInfo.emails && contactInfo.emails.length > 0) || 
              (contactInfo.phone_numbers && contactInfo.phone_numbers.length > 0)) && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Additional Contact Methods
                  </h3>
                  
                  <div className="space-y-3">
                    {contactInfo.emails && contactInfo.emails.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Email Addresses:</p>
                        <div className="space-y-1">
                          {contactInfo.emails.map((email, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm">{email}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(email, `Email ${index + 1}`)}
                                className="h-6 px-2"
                              >
                                {copied === `Email ${index + 1}` ? 'Copied!' : 'Copy'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {contactInfo.phone_numbers && contactInfo.phone_numbers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Phone Numbers:</p>
                        <div className="space-y-1">
                          {contactInfo.phone_numbers.map((phone, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm">{phone}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(phone, `Phone ${index + 1}`)}
                                className="h-6 px-2"
                              >
                                {copied === `Phone ${index + 1}` ? 'Copied!' : 'Copy'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {contactInfo.skills && contactInfo.skills.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {contactInfo.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {contactInfo.experience && contactInfo.experience.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Experience
                  </h3>
                  <div className="space-y-4">
                    {contactInfo.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{exp.title}</h4>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                            {exp.description && (
                              <p className="text-sm mt-1">{exp.description}</p>
                            )}
                          </div>
                          {(exp.start_date || exp.end_date) && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {exp.start_date && formatDate(exp.start_date)}
                                {exp.start_date && exp.end_date && ' - '}
                                {exp.end_date ? formatDate(exp.end_date) : exp.start_date && 'Present'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {contactInfo.education && contactInfo.education.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Education
                  </h3>
                  <div className="space-y-3">
                    {contactInfo.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <h4 className="font-medium">{edu.degree || edu.field_of_study}</h4>
                        <p className="text-sm text-muted-foreground">{edu.school}</p>
                        {(edu.start_date || edu.end_date) && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {edu.start_date && formatDate(edu.start_date)}
                              {edu.start_date && edu.end_date && ' - '}
                              {edu.end_date && formatDate(edu.end_date)}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Profiles */}
            {contactInfo.social_profiles && contactInfo.social_profiles.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Social Profiles
                  </h3>
                  <div className="space-y-2">
                    {contactInfo.social_profiles.map((profile, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline">{profile.network}</Badge>
                        <a 
                          href={profile.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {profile.username || profile.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
