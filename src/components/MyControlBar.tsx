import { ScreenSharePresets, Track, VideoPreset } from 'livekit-client';
import * as React from 'react';
import { ChatIcon, LeaveIcon } from '@/livekit-react-offical/assets/icons';
import { ChatToggle, StartAudio, TrackToggle, DisconnectButton, useRoomContext } from '@livekit/components-react';
import { isMobileBrowser } from '@livekit/components-core';
import { useLocalParticipantPermissions } from '@livekit/components-react';
// import { useMediaQuery } from '../hooks/internal';
import { useMediaQuery, useObservableState } from '@/livekit-react-offical/hooks/internal';
import { MediaDeviceMenu } from '@/components/MyMediaDeviceMenu';
// import { MediaDeviceMenu } from '@livekit/components-react';
import { v_preset } from '@/lib/const';
import { OptionPanel } from './OptionPannel';
import { ShareVideoPannel } from './VideoShare/VideoSharePannel';

type ControlBarControls = {
  microphone?: boolean;
  camera?: boolean;
  chat?: boolean;
  screenShare?: boolean;
  leave?: boolean;
  shareVideo?: boolean;
};

export type ControlBarProps = React.HTMLAttributes<HTMLDivElement> & {
  variation?: 'minimal' | 'verbose' | 'textOnly';
  controls?: ControlBarControls;
};

/**
 * The ControlBar prefab component gives the user the basic user interface
 * to control their media devices and leave the room.
 *
 * @remarks
 * This component is build with other LiveKit components like `TrackToggle`,
 * `DeviceSelectorButton`, `DisconnectButton` and `StartAudio`.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <ControlBar />
 * </LiveKitRoom>
 * ```
 */
export function ControlBar({ variation, controls, ...props }: ControlBarProps) {
  const defaultVariation = useMediaQuery(`(max-width: 660px)`) ? 'minimal' : 'verbose';
  const localPermissions = useLocalParticipantPermissions();
  variation ??= defaultVariation;

  const visibleControls = { leave: true, ...controls };

  if (!localPermissions) {
    visibleControls.camera = false;
    visibleControls.chat = false;
    visibleControls.microphone = false;
    visibleControls.screenShare = false;
    visibleControls.shareVideo = false;
  } else {
    visibleControls.camera ??= localPermissions.canPublish;
    visibleControls.microphone ??= localPermissions.canPublish;
    visibleControls.screenShare ??= localPermissions.canPublish;
    visibleControls.chat ??= localPermissions.canPublishData && controls?.chat;
    visibleControls.shareVideo ??= controls?.shareVideo;
  }

  const showIcon = React.useMemo(
    () => variation === 'minimal' || variation === 'verbose',
    [variation],
  );
  const showText = React.useMemo(
    () => variation === 'textOnly' || variation === 'verbose',
    [variation],
  );

  const isMobile = React.useMemo(() => isMobileBrowser(), []);

  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);

  const onScreenShareChange = (enabled: boolean) => {
    setIsScreenShareEnabled(enabled);
  };

  return (
    <div className=" z-10 lk-control-bar" {...props}>
      {visibleControls.microphone && (
        <div className="bg-primary rounded-lg">
        <div className="flex">
          <TrackToggle className=' btn btn-primary' 
          style={{ color:"white"}}
          source={Track.Source.Microphone} showIcon={showIcon}
          >
            {showText && 'Microphone'}
          </TrackToggle>
          <div className=" relative flex-shrink-0 btn bg-primary border-none hover:bg-opacity-50 p-0">
            <MediaDeviceMenu kind="audioinput" />
          </div>
        </div>
        </div>
      )}
      {visibleControls.camera && (
        <div className="bg-primary rounded-lg">
        <div className="flex">
          <TrackToggle
           className=' btn btn-primary' 
           style={{ color:"white"}}
          source={Track.Source.Camera} showIcon={showIcon}>
            {showText && 'Camera'}
          </TrackToggle>
          <div className=" relative flex-shrink-0 btn bg-primary border-none hover:bg-opacity-50 p-0">
            <MediaDeviceMenu kind="videoinput" />
          </div>
        </div>
        </div>
      )}
      {visibleControls.screenShare && !isMobile && (
        <div className="bg-primary rounded-lg">
        <TrackToggle
          className=' btn btn-primary' 
          style={{ color:"white"}}
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: true, selfBrowserSurface: 'include', resolution:v_preset.resolution}}
          showIcon={showIcon}
          onChange={onScreenShareChange}
        >
          {showText && (isScreenShareEnabled ? 'Stop screen share' : 'Share screen')}
        </TrackToggle>
        </div>
      )}
    
    {
        visibleControls.shareVideo && !isMobile && <ShareVideoPannel showIcon={showIcon} showText={showText}/>
      }

      {visibleControls.chat && (
                <div className="bg-primary rounded-lg">
        <ChatToggle
         className=' btn btn-primary' 
         style={{ color:"white"}}
        >
                              
          {showIcon && <ChatIcon />}
          {showText && 'Chat'}
        </ChatToggle>
        </div>
      )}

        <OptionPanel showIcon={showIcon} showText={showText}/>

      {visibleControls.leave && (
        <DisconnectButton  className=' btn bg-red-600 border-none hover:bg-red-700' 
        style={{ color:"white"}}
        >
          {showIcon && <LeaveIcon />}
          {showText && 'Leave'}
        </DisconnectButton>
      )}
      <StartAudio label="Start Audio"  className='btn btn-primary'/>
    </div>
  );
}
