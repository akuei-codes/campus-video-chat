
import { supabase } from './supabase';

// Define the types we'll use for signaling
export type RTCSignalData = {
  type: 'offer' | 'answer' | 'ice-candidate';
  sender: string;
  receiver: string;
  data: any;
  roomId: string;
};

// ICE servers configuration
const iceServers = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
};

// Class to manage WebRTC connections
export class VideoCall {
  peerConnection: RTCPeerConnection | null = null;
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  roomId: string;
  localUserId: string;
  remoteUserId: string;
  onRemoteStream: (stream: MediaStream) => void;
  onLocalStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  signalChannel: any;

  constructor(
    roomId: string,
    localUserId: string,
    remoteUserId: string,
    onRemoteStream: (stream: MediaStream) => void,
    onLocalStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ) {
    this.roomId = roomId;
    this.localUserId = localUserId;
    this.remoteUserId = remoteUserId;
    this.onRemoteStream = onRemoteStream;
    this.onLocalStream = onLocalStream;
    this.onConnectionStateChange = onConnectionStateChange;
    
    // Setup signaling using Supabase realtime
    this.setupSignaling();
  }

  // Setup signaling channel using Supabase
  setupSignaling() {
    // Subscribe to the signaling channel for this room
    this.signalChannel = supabase
      .channel(`webrtc:${this.roomId}`)
      .on('broadcast', { event: 'signal' }, (payload) => {
        const data = payload.payload as RTCSignalData;
        
        // Only process messages intended for us
        if (data.receiver === this.localUserId) {
          this.handleSignalingData(data);
        }
      })
      .subscribe();
      
    console.log('WebRTC signaling channel set up for room:', this.roomId);
  }

  // Send signaling data through Supabase realtime
  async sendSignalingData(data: RTCSignalData) {
    try {
      await this.signalChannel.send({
        type: 'broadcast',
        event: 'signal',
        payload: data,
      });
    } catch (error) {
      console.error('Error sending signaling data:', error);
    }
  }

  // Handle incoming signaling data
  async handleSignalingData(data: RTCSignalData) {
    if (!this.peerConnection) {
      console.error('PeerConnection not initialized yet');
      return;
    }

    try {
      switch (data.type) {
        case 'offer':
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.data));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          
          this.sendSignalingData({
            type: 'answer',
            sender: this.localUserId,
            receiver: this.remoteUserId,
            data: answer,
            roomId: this.roomId,
          });
          break;
          
        case 'answer':
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.data));
          break;
          
        case 'ice-candidate':
          if (data.data) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.data));
          }
          break;
          
        default:
          console.error('Unknown signal type:', data.type);
      }
    } catch (error) {
      console.error('Error handling signaling data:', error);
    }
  }

  // Initialize local media stream
  async initLocalStream(video = true, audio = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video,
        audio,
      });
      
      this.onLocalStream(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  // Initialize WebRTC peer connection
  async initPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(iceServers);
      
      // Create remote stream to collect remote tracks
      this.remoteStream = new MediaStream();
      this.onRemoteStream(this.remoteStream);

      // Add local tracks to the connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }

      // Handle incoming remote tracks
      this.peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          if (this.remoteStream) {
            this.remoteStream.addTrack(track);
          }
        });
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignalingData({
            type: 'ice-candidate',
            sender: this.localUserId,
            receiver: this.remoteUserId,
            data: event.candidate,
            roomId: this.roomId,
          });
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection) {
          this.onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      console.log('WebRTC peer connection initialized');
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      throw error;
    }
  }

  // Create and send an offer
  async createOffer() {
    if (!this.peerConnection) {
      await this.initPeerConnection();
    }

    try {
      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await this.peerConnection!.setLocalDescription(offer);
      
      this.sendSignalingData({
        type: 'offer',
        sender: this.localUserId,
        receiver: this.remoteUserId,
        data: offer,
        roomId: this.roomId,
      });
      
      console.log('WebRTC offer created and sent');
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Toggle video track
  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Toggle audio track
  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Clean up and close connection
  close() {
    // Close and cleanup local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Unsubscribe from signaling channel
    if (this.signalChannel) {
      this.signalChannel.unsubscribe();
    }
    
    console.log('WebRTC connection closed');
  }
}

// Create a video room connection with the given parameters
export async function createVideoCallConnection(params: {
  roomId: string,
  localUserId: string,
  remoteUserId: string,
  onRemoteStream: (stream: MediaStream) => void,
  onLocalStream: (stream: MediaStream) => void,
  onConnectionStateChange: (state: RTCPeerConnectionState) => void,
  isInitiator: boolean
}) {
  const {
    roomId,
    localUserId,
    remoteUserId,
    onRemoteStream,
    onLocalStream,
    onConnectionStateChange,
    isInitiator
  } = params;
  
  try {
    // Create the video call object
    const videoCall = new VideoCall(
      roomId,
      localUserId,
      remoteUserId,
      onRemoteStream,
      onLocalStream,
      onConnectionStateChange
    );
    
    // Initialize local stream
    await videoCall.initLocalStream();
    
    // Initialize peer connection
    await videoCall.initPeerConnection();
    
    // If this user is the initiator, create and send an offer
    if (isInitiator) {
      await videoCall.createOffer();
    }
    
    return videoCall;
  } catch (error) {
    console.error('Error creating video call connection:', error);
    throw error;
  }
}
