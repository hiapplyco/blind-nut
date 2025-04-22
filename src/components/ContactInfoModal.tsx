
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnrichedProfileData, Profile } from "../types";
import { EnrichedInfoModal } from "./enriched-info-modal/EnrichedInfoModal";

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  enrichedData: EnrichedProfileData | null;
  isLoading: boolean;
  error: string | null;
  handleCardClick: () => void;
}

const ContactInfoModal = ({
  isOpen,
  onClose,
  profile,
  enrichedData,
  isLoading,
  error,
  handleCardClick
}: ContactInfoModalProps) => {
  // Use the EnrichedInfoModal component for rendering
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
