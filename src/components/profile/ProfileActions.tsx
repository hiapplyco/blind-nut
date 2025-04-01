
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ProfileActionsProps {
  profileUrl: string;
  onGetContactInfo: () => void;
  isLoading?: boolean;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({ 
  profileUrl,
  onGetContactInfo,
  isLoading = false
}) => {
  return (
    <div className="flex flex-col space-y-2 mt-2">
      <div className="flex justify-between items-center">
        <a 
          href={profileUrl.startsWith('http') ? profileUrl : `https://${profileUrl}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-[#8B5CF6] hover:underline"
        >
          View on LinkedIn
        </a>
      </div>
      
      <div className="flex justify-end z-10 relative">
        <Button 
          onClick={onGetContactInfo}
          disabled={isLoading}
          className="border-2 border-black z-20 bg-[#FEF7CD] hover:bg-[#FEF7CD]/80"
          variant="secondary"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Get Contact Info'
          )}
        </Button>
      </div>
    </div>
  );
};
