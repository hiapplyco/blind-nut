
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UseMediaStreamOptions {
  initialAudioEnabled?: boolean;
  initialVideoEnabled?: boolean;
}

interface UseMediaStreamReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isRecording: boolean;
  startMedia: () => Promise<boolean>;
  stopMedia: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  startRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
}

export const useMediaStream = ({
  initialAudioEnabled = true,
  initialVideoEnabled = true,
}: UseMediaStreamOptions = {}): UseMediaStreamReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(initialAudioEnabled);
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialVideoEnabled);
  const [isRecording, setIsRecording] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, []);

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
      }
      
      setIsConnected(true);
      return true;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone');
      return false;
    }
  };

  const stopMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsConnected(false);
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const startRecording = () => {
    if (!mediaStreamRef.current) {
      toast.error("No media stream available for recording");
      return;
    }
    
    try {
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(mediaStreamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event listeners
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      toast.success("Recording started");
    } catch (err) {
      console.error('Error starting recording:', err);
      toast.error("Failed to start recording");
    }
  };
  
  const stopRecording = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }
      
      mediaRecorderRef.current.onstop = () => {
        // Create blob from chunks
        const blob = new Blob(audioChunksRef.current, { type: 'video/webm' });
        audioChunksRef.current = [];
        setIsRecording(false);
        toast.success("Recording stopped");
        resolve(blob);
      };
      
      mediaRecorderRef.current.stop();
    });
  };

  return {
    videoRef,
    isConnected,
    isLoading,
    error,
    isAudioEnabled,
    isVideoEnabled,
    isRecording,
    startMedia,
    stopMedia,
    toggleAudio,
    toggleVideo,
    startRecording,
    stopRecording
  };
};
