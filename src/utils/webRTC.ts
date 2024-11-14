
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export interface Participant {
  userId: string;
  username: string;
  stream?: MediaStream;
  muted: boolean;
  videoOff: boolean;
}

// WebRTC configuration
export const RTCConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection>;
  private localStream: MediaStream | null;
  private socket: Socket;
  private chatId: string;

  constructor(socket: Socket, chatId: string) {
    this.peerConnections = new Map();
    this.localStream = null;
    this.socket = socket;
    this.chatId = chatId;
  }

  /**
   * Initialize local media stream
   * @param isVideo Whether to include video
   */
  async initializeLocalStream(isVideo: boolean): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: isVideo,
      };
      console.log('Requesting media with constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      return stream;
    } catch (error: any) {
      console.error('Error accessing media devices:', error);

      // Add detailed error handling
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.error('Please grant permission to access your microphone' + (isVideo ? ' and camera.' : '.'));
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast.error('No media devices found.');
      } else {
        toast.error('An error occurred while accessing media devices.');
      }

      throw error;
    }
  }

  /**
   * Create a new peer connection for a target user
   */
  async createPeerConnection(
    targetUserId: string,
    onTrack: (userId: string, stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ): Promise<RTCPeerConnection> {
    try {
      const peerConnection = new RTCPeerConnection(RTCConfig);

      // Add local tracks to the connection
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, this.localStream!);
        });
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('ice-candidate', {
            chatId: this.chatId,
            targetUserId,
            candidate: event.candidate,
          });
        }
      };

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log(`Received remote track from user ${targetUserId}`);
        onTrack(targetUserId, event.streams[0]);
      };

      // Monitor connection state
      peerConnection.onconnectionstatechange = () => {
        onConnectionStateChange(peerConnection.connectionState);
      };

      this.peerConnections.set(targetUserId, peerConnection);
      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  /**
   * Handle incoming offer
   */
  async handleOffer(
    userId: string,
    offer: RTCSessionDescriptionInit,
    onTrack: (userId: string, stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ): Promise<void> {
    try {
      const peerConnection = await this.createPeerConnection(userId, onTrack, onConnectionStateChange);

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.socket.emit('answer', {
        chatId: this.chatId,
        targetUserId: userId,
        answer: peerConnection.localDescription,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(userId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(userId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  /**
   * Clean up connections and streams
   */
  cleanup(): void {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.peerConnections.forEach((connection) => connection.close());
    this.peerConnections.clear();
  }

  /**
   * Toggle local audio
   */
  toggleAudio(muted: boolean): void {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  /**
   * Toggle local video
   */
  toggleVideo(videoOff: boolean): void {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !videoOff;
    });
  }

  /**
   * Remove peer connection for a user
   */
  removeConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
  }
}