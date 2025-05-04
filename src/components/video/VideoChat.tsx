
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { VideoCall, createVideoCallConnection } from "@/lib/webrtc";

interface VideoChatProps {
  roomId: string;
  localUserId: string;
  remoteUserId: string;
  remoteUserName: string;
  isInitiator: boolean;
  onEndCall: () => void;
}

const VideoChat: React.FC<VideoChatProps> = ({
  roomId,
  localUserId,
  remoteUserId,
  remoteUserName,
  isInitiator,
  onEndCall,
}) => {
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const videoCallRef = useRef<VideoCall | null>(null);
  
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
      } catch (error) {
        console.error('Failed to initialize video call:', error);
        toast.error('Failed to start video call');
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

  return (
    <div className="flex flex-col w-full h-full">
      {/* Main video display area */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        {isConnecting && (
          <div className="absolute inset-0 bg-gray-800/80 flex flex-col items-center justify-center z-10">
            <div className="animate-pulse flex flex-col items-center">
              <PhoneCall className="w-12 h-12 text-white/50 mb-3" />
              <p className="text-white text-lg">Connecting to {remoteUserName}...</p>
              <p className="text-white/70 text-sm mt-2">Please wait</p>
            </div>
          </div>
        )}
        
        <video 
          ref={remoteVideoRef}
          autoPlay 
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Self video view */}
        <div className="absolute bottom-4 right-4 w-1/4 max-w-[180px] aspect-video bg-gray-800 rounded-md overflow-hidden border-2 border-white">
          <video 
            ref={localVideoRef}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          
          {!videoEnabled && (
            <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-white/70" />
            </div>
          )}
        </div>
      </div>
      
      {/* Video call controls */}
      <div className="flex justify-center gap-4 mt-6">
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full w-12 h-12 ${!audioEnabled ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white' : ''}`}
          onClick={handleToggleAudio}
        >
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant="destructive" 
          size="lg"
          onClick={handleEndCall}
          className="rounded-full px-8"
        >
          <PhoneCall className="mr-2 h-5 w-5" />
          End Call
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full w-12 h-12 ${!videoEnabled ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white' : ''}`}
          onClick={handleToggleVideo}
        >
          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
