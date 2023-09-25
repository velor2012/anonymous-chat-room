import * as React from 'react';
import type { Participant, TrackPublication } from 'livekit-client';
import { Track } from 'livekit-client';
import type { ParticipantClickEvent, TrackReferenceOrPlaceholder, isParticipantSourcePinned } from '@livekit/components-core';
import { isTrackReference, isTrackReferencePinned, isLocal } from '@livekit/components-core';

import {ParticipantPlaceholder} from '@/livekit-react-offical/assets/images'
import { ScreenShareIcon } from '@/livekit-react-offical/assets/icons';
import LockLockedIcon from './Icons/LockLockedIcon';
import { usePagination, ConnectionQualityIndicator, ParticipantName, TrackMutedIndicator,
    useMaybeParticipantContext,
    ParticipantContext,
    useEnsureParticipant,
    useMaybeLayoutContext,
    useParticipantTile,
    FocusToggle,
    usePinnedTracks,
    VideoTrack,
    // AudioTrack,
    TrackRefContext,
    useFeatureContext,
    useMaybeTrackRefContext,
    // AudioVisualizer,
    useTracks
} from '@livekit/components-react';
import { useIsEncrypted } from '@/livekit-react-offical/hooks/useIsEncrypted';
import FullIcon from './Icons/FullIcon';
import {AudioVisualizer} from "@/components/MyAudioVisualizer"
import {AudioTrack} from "@/components/MyAudioTrack"
import { VolumeMuteIndicator } from './VolumeMuteIndicator';

/**
 * The `ParticipantContextIfNeeded` component only creates a `ParticipantContext`
 * if there is no `ParticipantContext` already.
 * @example
 * ```tsx
 * <ParticipantContextIfNeeded participant={trackReference.participant}>
 *  ...
 * </ParticipantContextIfNeeded>
 * ```
 * @public
 */
export function ParticipantContextIfNeeded(
  props: React.PropsWithChildren<{
    participant?: Participant;
  }>,
) {
  const hasContext = !!useMaybeParticipantContext();
  return props.participant && !hasContext ? (
    <ParticipantContext.Provider value={props.participant}>
      {props.children}
    </ParticipantContext.Provider>
  ) : (
    <>{props.children}</>
  );
}

/**
 * Only create a `TrackRefContext` if there is no `TrackRefContext` already.
 */
function TrackRefContextIfNeeded(
  props: React.PropsWithChildren<{
    trackRef?: TrackReferenceOrPlaceholder;
  }>,
) {
  const hasContext = !!useMaybeTrackRefContext();
  return props.trackRef && !hasContext ? (
    <TrackRefContext.Provider value={props.trackRef}>{props.children}</TrackRefContext.Provider>
  ) : (
    <>{props.children}</>
  );
}

/** @public */
export interface ParticipantTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The track reference to display. */
  trackRef?: TrackReferenceOrPlaceholder;
  disableSpeakingIndicator?: boolean;
  /** @deprecated This parameter will be removed in a future version use `trackRef` instead. */
  participant?: Participant;
  /** @deprecated This parameter will be removed in a future version use `trackRef` instead. */
  source?: Track.Source;
  /** @deprecated This parameter will be removed in a future version use `trackRef` instead. */
  publication?: TrackPublication;
  onParticipantClick?: (event: ParticipantClickEvent) => void;
}

/**
 * The `ParticipantTile` component is the base utility wrapper for displaying a visual representation of a participant.
 * This component can be used as a child of the `TrackLoop` component or by passing a track reference as property.
 *
 * @example Using the `ParticipantTile` component with a track reference:
 * ```tsx
 * <ParticipantTile trackRef={trackRef} />
 * ```
 * @example Using the `ParticipantTile` component as a child of the `TrackLoop` component:
 * ```tsx
 * <TrackLoop>
 *  <ParticipantTile />
 * </TrackLoop>
 * ```
 * @public
 */
export function ParticipantTile({
  trackRef,
  participant,
  children,
  source = Track.Source.Camera,
  onParticipantClick,
  publication,
  disableSpeakingIndicator,
  ...htmlProps
}: ParticipantTileProps) {
  // TODO: remove deprecated props and refactor in a future version.
  const maybeTrackRef = useMaybeTrackRefContext();
  const p = useEnsureParticipant(participant);
  const curEl = React.useRef<HTMLDivElement>(null)
  const trackReference: TrackReferenceOrPlaceholder = React.useMemo(() => {
    return {
      participant: trackRef?.participant ?? maybeTrackRef?.participant ?? p,
      source: trackRef?.source ?? maybeTrackRef?.source ?? source,
      publication: trackRef?.publication ?? maybeTrackRef?.publication ?? publication,
    };
  }, [maybeTrackRef, p, publication, source, trackRef]);

  const { elementProps } = useParticipantTile<HTMLDivElement>({
    participant: trackReference.participant,
    htmlProps,
    source: trackReference.source,
    publication: trackReference.publication,
    disableSpeakingIndicator,
    onParticipantClick,
  });
  const isEncrypted = useIsEncrypted(p);
  const layoutContext = useMaybeLayoutContext();
  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const autoManageSubscription = useFeatureContext()?.autoSubscription;

  const handleSubscribe = React.useCallback(
    (subscribed: boolean) => {
      if (
        trackReference.source &&
        !subscribed &&
        layoutContext &&
        layoutContext.pin.dispatch &&
        isTrackReferencePinned(trackReference, layoutContext.pin.state)
      ) {
        layoutContext.pin.dispatch({ msg: 'clear_pin' });
      }
    },
    [trackReference, layoutContext],
  );

  const [isAdmin, setIsAdmin] = React.useState(false)
  React.useEffect(()=>{
        if(p && p.metadata != undefined && p.metadata != ""){
            const met = JSON.parse(p.metadata as string)
            setIsAdmin(met.admin)
        }
  },[])

  const fullscreen = React.useCallback(() => {
    // console.log("get!~")
    if (
        source &&
        layoutContext &&
        layoutContext.pin.dispatch &&
        isTrackReferencePinned(trackReference, layoutContext.pin.state)){
        console.log("get!~")
        const t = curEl.current?.getElementsByTagName('video')
        if(!t) return
        for (let el of t) {
            el.requestFullscreen()
        }
    }
    }, [layoutContext, p, source]);

  return (
    <div style={{ position: 'relative' }} {...elementProps}>
      <TrackRefContextIfNeeded trackRef={trackReference}>
        <ParticipantContextIfNeeded participant={trackReference.participant}>
          {children ?? (
            <div style={{display: 'contents'}} ref={curEl}>
              {isTrackReference(trackReference) &&
              (trackReference.publication?.kind === 'video' ||
                trackReference.source === Track.Source.Camera ||
                trackReference.source === Track.Source.ScreenShare) ? (
                <VideoTrack
                  trackRef={trackReference}
                  onSubscriptionStatusChanged={handleSubscribe}
                  manageSubscription={autoManageSubscription}
                />
              ) : (
                <>
                
                    <AudioVisualizer/>
                </>
              )}
              {/* 只有播放视频时才显示头像 */}
              {
                // isTrackReference(trackReference) &&
                (trackReference.publication?.kind === 'video' ||
                  trackReference.source === Track.Source.Camera ||
                  trackReference.source === Track.Source.ScreenShare) && (
                    <div className="lk-participant-placeholder">
                    <ParticipantPlaceholder />
                  </div>
                )
              }
              <div className="lk-participant-metadata">
                <div className="lk-participant-metadata-item">
                  {trackReference.source === Track.Source.Camera ? (
                    <>
                      {isEncrypted && <LockLockedIcon style={{ marginRight: '0.25rem' }} />}
                      <TrackMutedIndicator
                        source={Track.Source.Microphone}
                        show={'muted'}
                      ></TrackMutedIndicator>
                      <ParticipantName />
                    </>
                  ) : (
                    <>
                      <ScreenShareIcon style={{ marginRight: '0.25rem' }} />
                      <ParticipantName>&apos;s screen</ParticipantName>
                    </>
                  )}
                </div>
                {/* !p.isLocal && */}
                {
                    !p.isLocal &&  source != Track.Source.ScreenShare
                    && source != Track.Source.ScreenShareAudio &&
                    <VolumeMuteIndicator className="lk-participant-metadata-item hover:cursor-pointer opacity-0 volume-muter" />
                }
                <ConnectionQualityIndicator className="lk-participant-metadata-item" />
              </div>
            </div>
          )}
        {
          isAdmin && source != Track.Source.ScreenShare
          && source != Track.Source.ScreenShareAudio &&
          <div className=' absolute top-1 left-1 bg-black bg-opacity-50 rounded-sm px-1' >Admin</div>
        }
        <FocusToggle trackRef={trackReference} />
        {
           focusTrack &&  source !== Track.Source.Camera && <FullIcon onClick={fullscreen} className='volume-muter opacity-0 absolute top-1 left-1 cursor-pointer bg-black bg-opacity-50 rounded-sm ' />
        }
        </ParticipantContextIfNeeded>
      </TrackRefContextIfNeeded>
    </div>
  );
}
