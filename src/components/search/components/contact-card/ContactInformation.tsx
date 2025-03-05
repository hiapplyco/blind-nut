
import { Button } from "@/components/ui/button";
import { Copy, Phone, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { EnrichedProfileData } from "../../types";

interface ContactInformationProps {
  profileData: EnrichedProfileData;
}

export const ContactInformation = ({ profileData }: ContactInformationProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const hasPhoneNumbers = profileData?.mobile_phone || (profileData?.phone_numbers && profileData.phone_numbers.length > 0);

  return (
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
  );
};
