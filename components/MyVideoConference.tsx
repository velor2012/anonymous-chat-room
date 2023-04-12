import * as React from 'react';
import type { WidgetState } from '@livekit/components-core';
import { isEqualTrackRef, isTrackReference, log } from '@livekit/components-core';
import { Track } from 'livekit-client';;
import { useTracks, usePinnedTracks, Chat, LayoutContextProvider, CarouselView,
    FocusLayout, FocusLayoutContainer, GridLayout, ControlBar, RoomAudioRenderer,
     ConnectionStateToast, MessageFormatter, useCreateLayoutContext, ParticipantAudioTile } from '@livekit/components-react';
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

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [] },
  );

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

  return (
    <div className="lk-video-conference" {...props}>
      <LayoutContextProvider
        value={layoutContext}
        // onPinChange={handleFocusStateChange}
        onWidgetChange={widgetUpdate}
      >
        <div className="lk-video-conference-inner">
          {!focusTrack ? (
            <div className="lk-grid-layout-wrapper">
              <GridLayout tracks={tracks} />
              {/* <GridLayout tracks={tracks} >
                <ParticipantAudioTile />
              </GridLayout> */}
            </div>
          ) : (
            <div className="lk-focus-layout-wrapper">
              <FocusLayoutContainer>
                <CarouselView tracks={carouselTracks} />
                {focusTrack && <FocusLayout track={focusTrack} />}
              </FocusLayoutContainer>
            </div>
          )}
          <ControlBar controls={{ chat: true }} />
        </div>
        <Chat
          style={{ display: widgetState.showChat ? 'flex' : 'none' }}
          messageFormatter={chatMessageFormatter}
        />
      </LayoutContextProvider>
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
