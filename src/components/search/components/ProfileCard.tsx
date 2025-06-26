
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Briefcase, 
  ExternalLink, 
  Mail, 
  User,
  Building,
  Calendar,
  Star,
  Phone,
  Copy,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { SearchResult } from '../types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface ContactInfo {
  work_email?: string;
  personal_emails?: string[];
  mobile_phone?: string;
  linkedin_username?: string;
  location_name?: string;
  job_title?: string;
  job_company_name?: string;
}

interface ProfileCardProps {
  result: SearchResult;
  index: number;
  onGetContactInfo: (profileUrl: string, profileName: string) => Promise<ContactInfo | null>;
  onSearchContacts: (name: string, company: string, location: string) => void;
  contactInfo?: ContactInfo | null;
  isLoadingContact?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  result, 
  onGetContactInfo,
  onSearchContacts,
  contactInfo
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localContactInfo, setLocalContactInfo] = useState<ContactInfo | null>(contactInfo || null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Update local contact info when prop changes
  React.useEffect(() => {
    if (contactInfo) {
      setLocalContactInfo(contactInfo);
    }
  }, [contactInfo]);

  // Extract profile information with better parsing
  const extractProfileInfo = () => {
    // Extract name from title, removing LinkedIn suffix
    let rawName = result.name || result.title || 'Unknown Professional';
    rawName = rawName.replace(/\s*\|\s*LinkedIn.*$/i, '').trim();
    
    // Initialize variables
    let name = rawName;
    let jobTitle = '';
    let company = '';
    let location = '';
    
    // Check if name contains a dash (name - company pattern)
    const dashIndex = rawName.indexOf(' - ');
    if (dashIndex > 0) {
      name = rawName.substring(0, dashIndex).trim();
      company = rawName.substring(dashIndex + 3).trim();
    }
    
    // Parse the snippet for detailed information
    if (result.snippet) {
      const snippet = result.snippet;
      
      // Try different parsing patterns
      // Pattern 1: "Job Title at Company · Location"
      const pattern1 = snippet.match(/^([^·]+?)\s+at\s+([^·]+?)(?:\s*·\s*(.+))?/);
      if (pattern1) {
        jobTitle = pattern1[1].trim();
        company = pattern1[2].trim();
        if (pattern1[3]) {
          location = pattern1[3].trim();
        }
      }
      // Pattern 2: "Job Title | Skills | Location · Experience"
      else {
        const parts = snippet.split(/[·|]/).map(s => s.trim());
        if (parts.length > 0) {
          // First part is usually job title
          jobTitle = parts[0];
          
          // Look for location patterns
          for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            // Check if this part looks like a location (contains city/state/country patterns)
            if (part.match(/\b(City|State|USA|US|United States|Canada|UK|United Kingdom|[A-Z][a-z]+,\s*[A-Z]{2})/i) ||
                part.match(/^[A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*$/)) {
              location = part;
              break;
            }
          }
          
          // If we still don't have a company, check for common patterns
          if (!company) {
            // Look for "at Company" pattern anywhere in snippet
            const atMatch = snippet.match(/\bat\s+([^·|,]+?)(?:\s*[·|,]|$)/);
            if (atMatch) {
              company = atMatch[1].trim();
            }
          }
        }
      }
      
      // Clean up extracted data
      // Remove skills/technologies from job title if they're appended
      if (jobTitle) {
        // Remove everything after first slash or pipe that contains programming keywords
        jobTitle = jobTitle.split(/[/|]/).filter(part => 
          !part.match(/\b(Kotlin|Java|Python|JavaScript|React|Angular|Vue|AWS|Firebase|Android|iOS|Flutter)\b/i)
        )[0] || jobTitle;
        
        // Also clean up "Job Title, Technology" patterns
        const titleParts = jobTitle.split(',');
        if (titleParts.length > 1 && titleParts[1].match(/\b(Kotlin|Java|Python|JavaScript|React|Angular|Vue|AWS|Firebase|Android|iOS|Flutter)\b/i)) {
          jobTitle = titleParts[0].trim();
        }
      }
      
      // Clean up company name - remove extra job titles or skills
      if (company) {
        // Remove "Job Title - Company" pattern if job title is duplicated
        const companyParts = company.split(' - ');
        if (companyParts.length > 1) {
          // Take the last part as it's more likely to be the company
          company = companyParts[companyParts.length - 1].trim();
        }
      }
      
      // Clean up location - remove skills that might be misidentified as location
      if (location && location.match(/\b(Kotlin|Java|Python|JavaScript|React|Angular|Vue|AWS|Firebase|Android|iOS|Flutter|Engineer|Developer|Software)\b/i)) {
        location = ''; // Reset if it's clearly not a location
      }
    }
    
    // Use the direct fields if available and we haven't found better data
    jobTitle = jobTitle || result.jobTitle || '';
    company = company || result.company || '';
    location = location || result.location || '';

    // Extract seniority level
    const seniorityLevel = jobTitle?.toLowerCase().includes('senior') ? 'Senior' :
                          jobTitle?.toLowerCase().includes('lead') ? 'Lead' :
                          jobTitle?.toLowerCase().includes('principal') ? 'Principal' :
                          jobTitle?.toLowerCase().includes('director') ? 'Director' :
                          jobTitle?.toLowerCase().includes('manager') ? 'Manager' : 'Mid-Level';

    return { name, jobTitle, company, location, experience: '', seniorityLevel };
  };

  const { name, jobTitle, company, location, seniorityLevel } = extractProfileInfo();

  // Only show match score if we have actual matching data (future feature)
  // For now, we'll show a profile completeness indicator instead
  const calculateProfileCompleteness = () => {
    let completeness = 0;
    const fields = [jobTitle, company, location, result.snippet];
    const filledFields = fields.filter(field => field && field.length > 0).length;
    completeness = Math.round((filledFields / fields.length) * 100);
    return completeness;
  };

  const profileCompleteness = calculateProfileCompleteness();
  const showCompleteness = profileCompleteness > 0; // Only show if we have some data

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Handle saving candidate
  const handleSaveCandidate = async () => {
    if (!user) {
      toast.error('Please sign in to save candidates');
      return;
    }

    setIsSaving(true);
    try {
      // Extract all necessary data
      const profileData = extractProfileInfo();
      
      // Prepare the candidate data
      const candidateData = {
        user_id: user.id,
        job_id: jobId || null,
        name: profileData.name,
        linkedin_url: result.link,
        job_title: profileData.jobTitle,
        company: profileData.company,
        location: profileData.location,
        seniority_level: profileData.seniorityLevel,
        work_email: localContactInfo?.work_email || null,
        personal_emails: localContactInfo?.personal_emails || [],
        mobile_phone: localContactInfo?.mobile_phone || null,
        profile_summary: result.snippet,
        profile_completeness: profileCompleteness,
        search_string: searchString || null,
        source: 'linkedin'
      };

      const { error } = await supabase
        .from('saved_candidates')
        .upsert(candidateData, {
          onConflict: 'user_id,linkedin_url'
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success('Candidate saved successfully');
    } catch (error) {
      console.error('Error saving candidate:', error);
      if (error?.code === '23505') {
        // Unique constraint violation
        setIsSaved(true);
        toast.info('Candidate already saved');
      } else {
        toast.error('Failed to save candidate');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle contact enrichment
  const handleEnrichProfile = async () => {
    if (!result.link?.includes('linkedin.com/in/')) return;
    
    setIsEnriching(true);
    try {
      const contactData = await onGetContactInfo(result.link, name);
      setLocalContactInfo(contactData);
      
      if (!contactData) {
        // Profile not found in Nymeria
        const shouldSearch = await new Promise<boolean>((resolve) => {
          toast('No contact information found', {
            description: 'Would you like to search for this person manually?',
            action: {
              label: 'Search',
              onClick: () => {
                resolve(true);
              }
            },
            cancel: {
              label: 'Cancel',
              onClick: () => {
                resolve(false);
              }
            },
            duration: 10000
          });
        });
        
        if (shouldSearch) {
          onSearchContacts(name, company, location);
        }
      }
    } catch (error) {
      console.error('Error enriching profile:', error);
      toast.error('Failed to enrich profile');
    } finally {
      setIsEnriching(false);
    }
  };

  // Handle saving candidate
  const handleSaveCandidate = async () => {
    if (!user) {
      toast.error('Please sign in to save candidates');
      return;
    }

    setIsSaving(true);
    try {
      // Extract all necessary data
      const profileData = extractProfileInfo();
      
      // Prepare the candidate data
      const candidateData = {
        user_id: user.id,
        job_id: jobId || null,
        name: profileData.name,
        linkedin_url: result.link,
        job_title: profileData.jobTitle,
        company: profileData.company,
        location: profileData.location,
        seniority_level: profileData.seniorityLevel,
        work_email: localContactInfo?.work_email || null,
        personal_emails: localContactInfo?.personal_emails || [],
        mobile_phone: localContactInfo?.mobile_phone || null,
        profile_summary: result.snippet,
        profile_completeness: profileCompleteness,
        search_string: searchString || null,
        source: 'linkedin'
      };

      const { error } = await supabase
        .from('saved_candidates')
        .upsert(candidateData, {
          onConflict: 'user_id,linkedin_url'
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success('Candidate saved successfully');
    } catch (error) {
      console.error('Error saving candidate:', error);
      if (error?.code === '23505') {
        // Unique constraint violation
        setIsSaved(true);
        toast.info('Candidate already saved');
      } else {
        toast.error('Failed to save candidate');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-2 border-gray-200 hover:border-purple-300 transition-all duration-200 hover:shadow-lg">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Header Row */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {name}
                    </h3>
                  </div>
                  {showCompleteness && (
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                      {profileCompleteness}% Complete
                    </Badge>
                  )}
                </div>

                {/* Title & Company Row */}
                {(jobTitle || company) && (
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="flex items-center gap-2 text-sm text-gray-700 truncate">
                      {jobTitle && (
                        <>
                          <span className="font-medium">{jobTitle}</span>
                          {seniorityLevel !== 'Mid-Level' && (
                            <Badge variant="secondary" className="text-xs">
                              {seniorityLevel}
                            </Badge>
                          )}
                        </>
                      )}
                      {jobTitle && company && <span className="text-gray-400">at</span>}
                      {company && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {company}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Location Row */}
                {location && (
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{location}</span>
                  </div>
                )}

                {/* Quick Preview */}
                {result.snippet && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                    {result.snippet}
                  </p>
                )}

                {/* Inline Contact Info - Show only if we have actual contact data */}
                {localContactInfo && (localContactInfo.work_email || localContactInfo.personal_emails?.length || localContactInfo.mobile_phone) && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Contact Information Available</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {localContactInfo.work_email && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{localContactInfo.work_email}</span>
                        </div>
                      )}
                      {localContactInfo.personal_emails && localContactInfo.personal_emails.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{localContactInfo.personal_emails[0]}</span>
                        </div>
                      )}
                      {localContactInfo.mobile_phone && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Phone className="w-3 h-3" />
                          <span>{localContactInfo.mobile_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Expand/Collapse Icon */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="pt-4 space-y-4">
              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Information Section - Show in expanded view if available */}
                {localContactInfo && (
                  <div className="space-y-3 col-span-2 mb-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      {localContactInfo.work_email && (
                        <div className="space-y-1">
                          <span className="text-sm text-gray-500">Work Email:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{localContactInfo.work_email}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(localContactInfo.work_email!, 'work_email')}
                              className="h-6 w-6 p-0"
                            >
                              {copiedField === 'work_email' ? 
                                <CheckCircle className="w-3 h-3 text-green-600" /> : 
                                <Copy className="w-3 h-3" />
                              }
                            </Button>
                          </div>
                        </div>
                      )}
                      {localContactInfo.personal_emails && localContactInfo.personal_emails.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-sm text-gray-500">Personal Email:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{localContactInfo.personal_emails[0]}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(localContactInfo.personal_emails![0], 'personal_email')}
                              className="h-6 w-6 p-0"
                            >
                              {copiedField === 'personal_email' ? 
                                <CheckCircle className="w-3 h-3 text-green-600" /> : 
                                <Copy className="w-3 h-3" />
                              }
                            </Button>
                          </div>
                        </div>
                      )}
                      {localContactInfo.mobile_phone && (
                        <div className="space-y-1">
                          <span className="text-sm text-gray-500">Phone:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{localContactInfo.mobile_phone}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(localContactInfo.mobile_phone!, 'phone')}
                              className="h-6 w-6 p-0"
                            >
                              {copiedField === 'phone' ? 
                                <CheckCircle className="w-3 h-3 text-green-600" /> : 
                                <Copy className="w-3 h-3" />
                              }
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Profile Details */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile Details
                  </h4>
                  
                  {jobTitle && (
                    <div className="pl-6">
                      <span className="text-sm text-gray-500">Current Role:</span>
                      <p className="text-sm font-medium text-gray-900">{jobTitle}</p>
                    </div>
                  )}
                  
                  {company && (
                    <div className="pl-6">
                      <span className="text-sm text-gray-500">Company:</span>
                      <p className="text-sm font-medium text-gray-900">{company}</p>
                    </div>
                  )}

                  {location && (
                    <div className="pl-6">
                      <span className="text-sm text-gray-500">Location:</span>
                      <p className="text-sm font-medium text-gray-900">{location}</p>
                    </div>
                  )}

                  <div className="pl-6">
                    <span className="text-sm text-gray-500">Seniority Level:</span>
                    <p className="text-sm font-medium text-gray-900">{seniorityLevel}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Profile Details
                  </h4>
                  
                  <div className="pl-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Profile Completeness:</span>
                      <span className="text-sm font-medium text-gray-600">
                        {profileCompleteness}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gray-400"
                        style={{ width: `${profileCompleteness}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Snippet */}
              {result.snippet && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Profile Summary</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {result.snippet}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View LinkedIn
                  </a>
                </Button>


                {result.link?.includes('linkedin.com/in/') && !localContactInfo && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEnrichProfile}
                    disabled={isEnriching}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {isEnriching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting Contact Info...
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        Get Contact Info
                      </>
                    )}
                  </Button>
                )}

                {localContactInfo && (localContactInfo.work_email || localContactInfo.personal_emails?.length || localContactInfo.mobile_phone) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Contact Info Available
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Save Candidate
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
