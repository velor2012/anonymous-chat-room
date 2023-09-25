
import { supportsScreenSharing } from '@livekit/components-core';
import { mergeProps } from '@/livekit-react-offical/utils';

import { ScreenSharePresets, Track, VideoPreset } from 'livekit-client';
import * as React from 'react';
import { ChatIcon, LeaveIcon } from '@/livekit-react-offical/assets/icons';
import { ChatToggle, StartAudio, TrackToggle, DisconnectButton, useMaybeLayoutContext } from '@livekit/components-react';
import { isMobileBrowser } from '@livekit/components-core';
import { useLocalParticipantPermissions } from '@livekit/components-react';
// import { useMediaQuery } from '../hooks/internal';
import { useMediaQuery, useObservableState } from '@/livekit-react-offical/hooks/internal';
import { MediaDeviceMenu } from '@/components/MyMediaDeviceMenu';
// import { MediaDeviceMenu } from '@livekit/components-react';
import { v_preset } from '@/lib/const';
import { OptionPanel } from './OptionPannel';
import { ShareVideoPannel } from './VideoShare/VideoSharePannel';
import CameraMicIcon from './Icons/CameraMicIcon';
import { useTranslation } from 'react-i18next';


/** @public */
export type ControlBarControls = {
  microphone?: boolean;
  camera?: boolean;
  chat?: boolean;
  screenShare?: boolean;
  leave?: boolean;
  shareVideo?: boolean;
};

/** @public */
export interface ControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  variation?: 'minimal' | 'verbose' | 'textOnly';
  controls?: ControlBarControls;
}

/**
 * The `ControlBar` prefab gives the user the basic user interface to control their
 * media devices (camera, microphone and screen share), open the `Chat` and leave the room.
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
 * @public
 */
export function ControlBar({ variation, controls, ...props }: ControlBarProps) {
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const layoutContext = useMaybeLayoutContext();
  
  React.useEffect(() => {
    if (layoutContext?.widget.state?.showChat !== undefined) {
      setIsChatOpen(layoutContext?.widget.state?.showChat);
    }
  }, [layoutContext?.widget.state?.showChat]);
  const isTooLittleSpace = useMediaQuery(`(max-width: ${isChatOpen ? 1000 : 760}px)`);

  const defaultVariation = isTooLittleSpace ? 'minimal' : 'verbose';
  variation ??= defaultVariation;

  const visibleControls = { leave: true, ...controls };

  const localPermissions = useLocalParticipantPermissions();

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
  const { t, i18n } = useTranslation()
  const isMobile = React.useMemo(() => isMobileBrowser(), []);
  const browserSupportsScreenSharing = supportsScreenSharing();

  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);

  const onScreenShareChange = (enabled: boolean) => {
    setIsScreenShareEnabled(enabled);
  };

  const htmlProps = mergeProps({ className: 'lk-control-bar' }, props);

  return (
    <div className=" z-1 lk-control-bar" {...props}>
        {/* use in mobile */}
        {isMobile && (
            <div className="dropdown dropdown-top">
            <label tabIndex={0} className="btn btn-primary text-white">
                <CameraMicIcon/>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu shadow rounded-box">
                <li>
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
                </li>
                <li>
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
                </li>
            </ul>
            </div>
        )}
        {/* use in pc */}
      {visibleControls.microphone && !isMobile && (
        <div className="bg-primary rounded-lg">
        <div className="flex">
          <TrackToggle className=' btn btn-primary' 
          style={{ color:"white"}}
          source={Track.Source.Microphone} showIcon={showIcon}
          >
            {showText && t('mic')}
          </TrackToggle>
          <div className=" relative flex-shrink-0 btn bg-primary border-none hover:bg-opacity-50 p-0">
            <MediaDeviceMenu kind="audioinput" />
          </div>
        </div>
        </div>
      )}
      {visibleControls.camera && browserSupportsScreenSharing && !isMobile && (
        <div className="bg-primary rounded-lg">
        <div className="flex">
          <TrackToggle
           className=' btn btn-primary' 
           style={{ color:"white"}}
          source={Track.Source.Camera} showIcon={showIcon}>
            {showText && t('camera')}
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
          {showText && (isScreenShareEnabled ? t('stopShare') : t('screenShare'))}
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
          {showText && t('chat')}
        </ChatToggle>
        </div>
      )}

        <OptionPanel showIcon={showIcon} showText={showText}/>

      {visibleControls.leave && (
        <DisconnectButton  className=' btn bg-red-600 border-none hover:bg-red-700' 
        style={{ color:"white"}}
        >
          {showIcon && <LeaveIcon />}
          {showText && t('leave')}
        </DisconnectButton>
      )}
      <StartAudio label="Start Audio"  className='btn btn-primary'/>
    </div>
  );
}
