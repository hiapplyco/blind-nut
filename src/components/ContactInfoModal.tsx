
import { EnrichedInfoModal } from "./enriched-info-modal/EnrichedInfoModal";
import { Profile } from "./search/types";
import { EnrichedProfileData } from "./search/types";

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  enrichedData: EnrichedProfileData | null;
  isLoading: boolean;
  error: string | null;
}

const ContactInfoModal = ({
  isOpen,
  onClose,
  profile,
  enrichedData,
  isLoading,
  error
}: ContactInfoModalProps) => {
  return (
    <EnrichedInfoModal
      isOpen={isOpen}
      onClose={onClose}
      profile={profile}
      profileData={enrichedData}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default ContactInfoModal;
