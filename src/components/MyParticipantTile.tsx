import * as React from 'react';
import type { Participant, TrackPublication } from 'livekit-client';
import { Track } from 'livekit-client';
import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { isParticipantSourcePinned, setupParticipantTile } from '@livekit/components-core';
import { usePagination, ConnectionQualityIndicator, MediaTrack, ParticipantName, TrackMutedIndicator,
    useMaybeParticipantContext,
    ParticipantContext,
    useEnsureParticipant,
    useMaybeLayoutContext,
    useIsMuted,
    useIsSpeaking,
    FocusToggle,
    usePinnedTracks,
    
} from '@livekit/components-react';
import {ParticipantPlaceholder} from '@/livekit-react-offical/assets/images'
import {AudioVisualizer} from "@/components/MyAudioVisualizer"
import { mergeProps } from "@/livekit-react-offical/utils"
import { ScreenShareIcon } from '@/livekit-react-offical/assets/icons';
import { VolumeMuteIndicator } from './VolumeMuteIndicator';
import FullIcon from './Icons/FullIcon';

export type ParticipantTileProps = React.HTMLAttributes<HTMLDivElement> & {
  disableSpeakingIndicator?: boolean;
  participant?: Participant;
  source?: Track.Source;
  publication?: TrackPublication;
  onParticipantClick?: (event: ParticipantClickEvent) => void;
};

export type UseParticipantTileProps<T extends React.HTMLAttributes<HTMLElement>> =
  TrackReferenceOrPlaceholder & {
    disableSpeakingIndicator?: boolean;
    publication?: TrackPublication;
    onParticipantClick?: (event: ParticipantClickEvent) => void;
    htmlProps: T;
  };

export function useParticipantTile<T extends React.HTMLAttributes<HTMLElement>>({
  participant,
  source,
  publication,
  onParticipantClick,
  disableSpeakingIndicator,
  htmlProps,
}: UseParticipantTileProps<T>) {
  const p = useEnsureParticipant(participant);
  const mergedProps = React.useMemo(() => {
    const { className } = setupParticipantTile();
    return mergeProps(htmlProps, {
      className,
      onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        htmlProps.onClick?.(event);
        if (typeof onParticipantClick === 'function') {
          const track = publication ?? p.getTrack(source);
          onParticipantClick({ participant: p, track });
        }
      },
    });
  }, [htmlProps, source, onParticipantClick, p, publication]);
  const isVideoMuted = useIsMuted(Track.Source.Camera, { participant });
  const isAudioMuted = useIsMuted(Track.Source.Microphone, { participant });
  const isSpeaking = useIsSpeaking(participant);
  return {
    elementProps: {
      'data-lk-audio-muted': isAudioMuted,
      'data-lk-video-muted': isVideoMuted,
      'data-lk-speaking': disableSpeakingIndicator === true ? false : isSpeaking,
      'data-lk-local-participant': participant.isLocal,
      'data-lk-source': source,
      ...mergedProps,
    },
  };
}

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
 * The ParticipantTile component is the base utility wrapper for displaying a visual representation of a participant.
 * This component can be used as a child of the `ParticipantLoop` component or independently if a participant is passed as a property.
 *
 * @example
 * ```tsx
 * {...}
 *   <ParticipantTile>
 *     {...}
 *   </ParticipantTile>
 * {...}
 * ```
 *
 * @see `ParticipantLoop` component
 */
export const ParticipantTile = ({
  participant,
  children,
  source = Track.Source.Camera,
  onParticipantClick,
  publication,
  disableSpeakingIndicator,
  ...htmlProps
}: ParticipantTileProps) => {
  const p = useEnsureParticipant(participant);
  const curEl = React.useRef<HTMLDivElement>(null)
  const { elementProps } = useParticipantTile({
    participant: p,
    htmlProps,
    source,
    publication,
    disableSpeakingIndicator,
    onParticipantClick,
  });

  const layoutContext = useMaybeLayoutContext();
  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const handleSubscribe = React.useCallback(
    (subscribed: boolean) => {
      if (
        source &&
        !subscribed &&
        layoutContext &&
        layoutContext.pin.dispatch &&
        isParticipantSourcePinned(p, source, layoutContext.pin.state)
      ) {
        layoutContext.pin.dispatch({ msg: 'clear_pin' });
      }
    },
    [p, layoutContext, source],
  );

  const [isAdmin, setIsAdmin] = React.useState(false)
  React.useEffect(()=>{
    if(source !== Track.Source.Camera){
        debugger
    }
        if(p && p.metadata != undefined && p.metadata != ""){
            const met = JSON.parse(p.metadata as string)
            setIsAdmin(met.admin)
        }
  },[])

  const fullscreen = React.useCallback(() => {
    // console.log("get!~")
    if (isParticipantSourcePinned(p, source, layoutContext?.pin.state)){
        console.log("get!~")
        const t = curEl.current?.getElementsByTagName('video')
        if(!t) return
        for (let el of t) {
            el.requestFullscreen()
        }
    }
    }, [layoutContext, p, source]);
  
  return (
    <div style={{ position: 'relative', maxHeight: '100%' }} {...elementProps}>
      <ParticipantContextIfNeeded participant={p}>
        {children ?? (
          <>
            {/** TODO remove MediaTrack in favor of the equivalent Audio/Video Track. need to figure out how to differentiate here */}
            {
                process.env.NEXT_PUBLIC_USE_VIDEO === "true" || source === Track.Source.ScreenShare ||  source === Track.Source.ScreenShareAudio? 
                (<div style={{display: 'contents'}} ref={curEl}>
                    <MediaTrack
                    source={source}
                    publication={publication}
                    participant={participant}
                    onSubscriptionStatusChanged={handleSubscribe}
                    />
                    <div className="lk-participant-placeholder">
                    <ParticipantPlaceholder />
                    </div>
                </div>): <AudioVisualizer/>
            }
            <div className="lk-participant-metadata">
              <div className="lk-participant-metadata-item">
                {source === Track.Source.Camera ? (
                  <>
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
          </>
        )}
        {
          isAdmin && source != Track.Source.ScreenShare
          && source != Track.Source.ScreenShareAudio &&
          <div className=' absolute top-1 left-1 bg-black bg-opacity-50 rounded-sm px-1' >Admin</div>
        }
        <FocusToggle trackSource={source} />
        {
           focusTrack &&  source !== Track.Source.Camera && <FullIcon onClick={fullscreen} className='volume-muter opacity-0 absolute top-1 left-1 cursor-pointer bg-black bg-opacity-50 rounded-sm ' />
        }
      </ParticipantContextIfNeeded>
    </div>
  );
};
