
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneCall, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { VideoCall, createVideoCallConnection } from "@/lib/webrtc";
import { AnimatePresence, motion } from "framer-motion";

interface VideoChatProps {
  roomId: string;
  localUserId: string;
  remoteUserId: string;
  remoteUserName: string;
  isInitiator: boolean;
  onEndCall: () => void;
  onSkipMatch: () => void;
}

const CONVERSATION_STARTERS = [
  "What classes are you taking this semester?",
  "Are you involved in any student organizations?",
  "What's your favorite spot on campus?",
  "Any exciting research or projects you're working on?"
];

const VideoChat: React.FC<VideoChatProps> = ({
  roomId,
  localUserId,
  remoteUserId,
  remoteUserName,
  isInitiator,
  onEndCall,
  onSkipMatch,
}) => {
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [currentStarterIndex, setCurrentStarterIndex] = useState<number>(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const videoCallRef = useRef<VideoCall | null>(null);
  
  // Set up animated conversation starters
  useEffect(() => {
    if (!isConnecting && connectionState === 'connected') {
      const interval = setInterval(() => {
        setCurrentStarterIndex(prev => {
          const next = prev + 1;
          return next < CONVERSATION_STARTERS.length ? next : 0;
        });
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isConnecting, connectionState]);
  
  useEffect(() => {
    // Initialize the WebRTC connection
    const initializeVideoCall = async () => {
      try {
        setIsConnecting(true);
        const videoCall = await createVideoCallConnection({
          roomId,
          localUserId,
          remoteUserId,
          onRemoteStream: (stream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          },
          onLocalStream: (stream) => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          },
          onConnectionStateChange: (state) => {
            setConnectionState(state);
            if (state === 'connected') {
              toast.success('Connected successfully!');
              setIsConnecting(false);
            } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
              toast.error('Connection lost');
              onEndCall();
            }
          },
          isInitiator,
        });
        
        videoCallRef.current = videoCall;
        setPermissionDenied(false);
      } catch (error) {
        console.error('Failed to initialize video call:', error);
        
        // Check if the error is related to permission denial
        if (error instanceof DOMException && 
            (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
          toast.error('Camera or microphone access denied. Please check your browser permissions.');
          setPermissionDenied(true);
        } else {
          toast.error('Failed to start video call');
        }
        setIsConnecting(false);
      }
    };

    initializeVideoCall();

    // Clean up the WebRTC connection when component unmounts
    return () => {
      if (videoCallRef.current) {
        videoCallRef.current.close();
        videoCallRef.current = null;
      }
    };
  }, [roomId, localUserId, remoteUserId, isInitiator, onEndCall]);

  const handleToggleVideo = () => {
    if (videoCallRef.current) {
      const newState = !videoEnabled;
      videoCallRef.current.toggleVideo(newState);
      setVideoEnabled(newState);
    }
  };

  const handleToggleAudio = () => {
    if (videoCallRef.current) {
      const newState = !audioEnabled;
      videoCallRef.current.toggleAudio(newState);
      setAudioEnabled(newState);
    }
  };

  const handleEndCall = () => {
    if (videoCallRef.current) {
      videoCallRef.current.close();
      videoCallRef.current = null;
    }
    onEndCall();
  };

  const handleSkipMatch = () => {
    if (videoCallRef.current) {
      videoCallRef.current.close();
      videoCallRef.current = null;
    }
    toast.info(`Skipping match with ${remoteUserName}. Looking for another match...`);
    onSkipMatch();
  };

  const retryConnection = () => {
    // Reset permission denied state and try again
    setPermissionDenied(false);
    setIsConnecting(true);
    // Re-initialize the connection
    if (videoCallRef.current) {
      videoCallRef.current.close();
      videoCallRef.current = null;
    }
    // The useEffect will get triggered again due to the dependency on isInitiator
    // So we need to toggle it briefly
    onEndCall();
    setTimeout(() => {
      onSkipMatch();
    }, 500);
  };

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <div className="flex flex-col gap-4 flex-grow">
        {/* Remote video (top) */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center aspect-video w-full h-2/3">
          {isConnecting && !permissionDenied && (
            <div className="absolute inset-0 bg-gray-800/80 flex flex-col items-center justify-center z-10">
              <div className="animate-pulse flex flex-col items-center">
                <PhoneCall className="w-12 h-12 text-white/50 mb-3" />
                <p className="text-white text-lg">Connecting to {remoteUserName}...</p>
                <p className="text-white/70 text-sm mt-2">Please wait</p>
              </div>
            </div>
          )}
          
          {permissionDenied && (
            <div className="absolute inset-0 bg-gray-800/80 flex flex-col items-center justify-center z-10">
              <div className="flex flex-col items-center text-center">
                <VideoOff className="w-12 h-12 text-red-400 mb-3" />
                <p className="text-white text-lg">Camera or microphone access denied</p>
                <p className="text-white/70 text-sm mt-2 max-w-xs">
                  Please check your browser permissions and allow access to your camera and microphone
                </p>
                <Button 
                  variant="secondary" 
                  className="mt-4"
                  onClick={retryConnection}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          <video 
            ref={remoteVideoRef}
            autoPlay 
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-sm rounded">
            {remoteUserName}
          </div>
          
          {/* Animated conversation starter */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStarterIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg"
            >
              <p className="text-sm font-medium">💬 {CONVERSATION_STARTERS[currentStarterIndex]}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Local video (bottom) */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video w-full h-1/3">
          <video 
            ref={localVideoRef}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          
          {!videoEnabled && (
            <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center">
              <VideoOff className="w-10 h-10 text-white/70" />
            </div>
          )}
          
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-sm rounded">
            You
          </div>
        </div>
      </div>
      
      {/* Video call controls */}
      <div className="flex justify-center gap-3 mt-2">
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full w-12 h-12 ${!audioEnabled ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white' : ''}`}
          onClick={handleToggleAudio}
          disabled={permissionDenied}
        >
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full w-12 h-12 ${!videoEnabled ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white' : ''}`}
          onClick={handleToggleVideo}
          disabled={permissionDenied}
        >
          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant="destructive" 
          size="icon"
          onClick={handleEndCall}
          className="rounded-full w-12 h-12"
        >
          <PhoneCall className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="secondary" 
          size="icon"
          onClick={handleSkipMatch}
          className="rounded-full w-12 h-12"
          title="Skip to next match"
          disabled={permissionDenied}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
