
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
      setIsLoading(true);
      setError(null);
      
      console.log("Requesting media with video:", isVideoEnabled, "audio:", isAudioEnabled);
      
      // Check if videoRef is available before proceeding
      if (!videoRef.current) {
        console.log("Video ref not available yet, waiting for it to be created");
        
        // Wait a short time for the ref to be available
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check again if videoRef is available
        if (!videoRef.current) {
          console.error("Video ref still null after waiting");
          setError('Video element not found. Please try refreshing the page.');
          setIsLoading(false);
          return false;
        }
      }
      
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      console.log("Stream received:", stream);
      mediaStreamRef.current = stream;
      
      // Set stream to video element
      videoRef.current.srcObject = stream;
      console.log("Video ref set with stream");
      
      // Try playing right away
      try {
        await videoRef.current.play();
        console.log("Video playback started immediately");
      } catch (err) {
        console.log("Couldn't play immediately, setting up onloadedmetadata event");
        
        // If immediate play fails, set up the onloadedmetadata handler
        videoRef.current.onloadedmetadata = async () => {
          console.log("Video metadata loaded");
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              console.log("Video playback started after metadata load");
            } catch (playErr) {
              console.error("Error playing video after metadata load:", playErr);
            }
          }
        };
      }
      
      setIsConnected(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      
      // Provide a more helpful error message based on the error
      let errorMessage = 'Could not access camera or microphone.';
      
      if (err instanceof DOMException) {
        if (err.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. Please check your device.';
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Permission to access camera or microphone was denied. Please check your browser permissions.';
        } else if (err.name === 'AbortError') {
          errorMessage = 'Hardware error occurred. Please try again or use a different device.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Could not access your media device. It may be in use by another application.';
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
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
      mediaStreamRef.current.getTracks().forEach(track => {
        console.log("Stopping track:", track.kind, track.label);
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsConnected(false);
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0];
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        console.log("Audio track toggled:", !isAudioEnabled);
      } else {
        toast.error("No audio track found");
      }
    } else {
      toast.error("No media stream available");
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const videoTrack = videoTracks[0];
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        console.log("Video track toggled:", !isVideoEnabled);
      } else {
        toast.error("No video track found");
      }
    } else {
      toast.error("No media stream available");
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
