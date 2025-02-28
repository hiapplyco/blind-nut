
import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { UserCircle2 } from "lucide-react";

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
}

export const VideoDisplay = ({ videoRef, isVideoEnabled }: VideoDisplayProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset loaded state when video enabled state changes
    setIsLoaded(false);
  }, [isVideoEnabled]);

  return (
    <div className="relative w-full h-[70vh] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
      {isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoadedData={() => setIsLoaded(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center bg-gray-900 w-full h-full">
          <Avatar className="h-32 w-32 mb-4">
            <UserCircle2 className="h-32 w-32 text-gray-400" />
          </Avatar>
          <p className="text-gray-300 text-xl">Camera is turned off</p>
        </div>
      )}
      
      {isVideoEnabled && !isLoaded && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};
