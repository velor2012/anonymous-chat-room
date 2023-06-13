import * as React from 'react';
import type { WidgetState } from '@livekit/components-core';
import { isEqualTrackRef, isTrackReference, log } from '@livekit/components-core';
import { Track } from 'livekit-client';;
import { useTracks, usePinnedTracks, LayoutContextProvider,
    //  CarouselView,
    // FocusLayout,
     FocusLayoutContainer,
     ConnectionStateToast, MessageFormatter, useCreateLayoutContext, Chat, useParticipants, useRoomInfo, useRoomContext } from '@livekit/components-react';
import {GridLayout} from "@/components/MyGridLayout"
import {ControlBar} from "@/components/MyControlBar"
import {ChatCard} from "@/components/MyChat"
import { RoomInfoUseForParticipant, roominfo$ } from '../lib/observe/RoomInfoObs';
import { curState, curState$ } from '@/lib/observe/CurStateObs';
import { RoomAudioRenderer } from './MyRoomAudioRenderer';
import { CarouselView } from './MyCarouselView';
import { useIsShareVideo } from '@/lib/hooks/useIsShareVideo';
import { VideoShareTile } from './VideoShare/VideoShareTile';
import { useCurState } from '@/lib/hooks/useCurState';
import { FocusLayout } from '@/components/MyFocusLayout';

     export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
}

/**
 * This component is the default setup of a classic LiveKit video conferencing app.
 * It provides functionality like switching between participant grid view and focus view.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <VideoConference />
 * <LiveKitRoom>
 * ```
 */
export function VideoConference({ chatMessageFormatter, ...props }: VideoConferenceProps) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({ showChat: false });
  
  //add cwy
  const room = useRoomContext()
  const participants = useParticipants()
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [] },
  )

  const widgetUpdate = (state: WidgetState) => {
    log.debug('updating widget state', state);
    setWidgetState(state);
  };

  const layoutContext = useCreateLayoutContext();

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));
  const isShareVideo = useIsShareVideo()
  const mcurState = useCurState()

  React.useEffect(() => {
    // if screen share tracks are published, and no pin is set explicitly, auto set the screen share
    if (
      (layoutContext.pin.state && layoutContext.pin.state?.length > 0) ||
      screenShareTracks.length === 0
    ) {
      return;
    }
    layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: screenShareTracks[0] });
  }, [JSON.stringify(screenShareTracks.map((ref) => ref.publication.trackSid))]);
  
  //add cwy 监视当前房间的信息，推送给roominfo$
  React.useEffect(() => {
    const cus : curState = {
        join: true,
        isAdmin: false
    }
    let metadataObj = undefined
    if(room.metadata != undefined && room.metadata != ""){
        metadataObj = JSON.parse(room.metadata as string)
        cus.roomMetadata = metadataObj
    }
    
    const roominfo : RoomInfoUseForParticipant = {
        room_name: room.name,
        participant_num: participants.length,
        passwd: metadataObj?.passwd,
        max_participant_num: metadataObj?.maxParticipants,
    }
    roominfo$.next(roominfo)


    const lp = participants[0]
    
    if(lp.metadata != undefined && lp.metadata != ""){
        const met = JSON.parse(lp.metadata as string)
        cus.isAdmin = met.admin
    }
    curState$.next(cus)
}, [participants.length, room.name, room.metadata, room])

  return (
    <div data-lk-theme2="default"  className="lk-video-conference  relative h-full flex items-stretch" {...props}>
      <LayoutContextProvider
       
        value={layoutContext}
        // onPinChange={handleFocusStateChange}
        onWidgetChange={widgetUpdate}
      >
        <div className="lk-video-conference-inner h-full">
          {!focusTrack && !isShareVideo ? (
            <div className="lk-grid-layout-wrapper h-full">
              <GridLayout tracks={tracks} />
            </div>
          ) : (
            <div className="lk-focus-layout-wrapper">
              <FocusLayoutContainer>
                <CarouselView tracks={carouselTracks} />
                {focusTrack && <FocusLayout track={focusTrack} />}
                {!focusTrack && isShareVideo && mcurState.roomMetadata?.videoShareUrl != undefined && mcurState.roomMetadata?.videoShareUrl != "" &&
                    <VideoShareTile
                        muted={false}
                        sharedUrl={mcurState.roomMetadata?.videoShareUrl}
                        className={`contents lk-participant-tile ${isShareVideo? '': 'hidden'}`}
                    ></VideoShareTile>
                }
              </FocusLayoutContainer>
            </div>
          )}
          <ControlBar controls={{ microphone: true, screenShare: !isShareVideo && process.env.NEXT_PUBLIC_USE_SCREEN === "true", 
          camera: process.env.NEXT_PUBLIC_USE_VIDEO === "true", chat: true, shareVideo: process.env.NEXT_PUBLIC_USE_SHAREVIDEO === "true" && !(focusTrack && !isShareVideo) }} />
        </div>
        <ChatCard

            className='fixed  h-[80%] sm:h-full bottom-[4rem] sm:bottom-auto right-0 sm:right-auto sm:relative rounded-lg shadow-xl bg-secondary-focus p-2 flex flex-col-reverse'
          style={{ display: widgetState.showChat ? 'flex' : 'none' }}
          messageFormatter={chatMessageFormatter}
        />
      </LayoutContextProvider>
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
