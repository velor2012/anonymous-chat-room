import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
export interface SessionProps {
  roomName: string;
  identity: string;
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
  region?: string;
  turnServer?: RTCIceServer;
  forceRelay?: boolean;
}

export interface TokenResult {
  identity: string;
  accessToken: string;
  isAdmin: boolean;
}

export interface RoomMetadata  {
    passwd: string,
    time: number,
    maxParticipants: number,
    videoShareUrl?: string
}

export interface DenoiseMethod {
    speex: boolean
    rnn: boolean
}

export interface AudioSetting  { 
    autoGainControl: boolean, 
    channelCount: number, 
    echoCancellation: boolean,
     noiseSuppression: boolean,
     denoiseMethod: DenoiseMethod
}