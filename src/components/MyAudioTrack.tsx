import type { Participant, Track, TrackPublication } from 'livekit-client';
import * as React from 'react';
import type { TrackReference } from '@livekit/components-core';
import { log } from '@livekit/components-core';
import { useEnsureParticipant, useMaybeTrackRefContext } from '@livekit/components-react';
import { RemoteAudioTrack } from 'livekit-client';

import { useMediaTrackBySourceOrName } from '@/livekit-react-offical/hooks/useMediaTrackBySourceOrName';
import { useWebAudioContext } from '@/lib/context/webAudioContex';
import { defaultAudioSetting, rnnoiseWasmPath, rnnoiseWasmSimdPath, speexWasmPath } from '@/lib/const';
import { SpeexWorkletNode, RnnoiseWorkletNode } from '@sapphi-red/web-noise-suppressor';
import { useObservableState } from '@/livekit-react-offical/hooks/internal';
import { denoiseMethod$} from '@/lib/observe/DenoiseMethodObs';
import { useMainBrowser } from "@/lib/hooks/useMainBrowser";

/** @public */
export interface AudioTrackProps<T extends HTMLMediaElement = HTMLMediaElement>
  extends React.HTMLAttributes<T> {
  /** The track reference of the track from which the audio is to be rendered. */
  trackRef?: TrackReference;
  /** @deprecated This property will be removed in a future version use `trackRef` instead. */
  source?: Track.Source;
  /** @deprecated This property will be removed in a future version use `trackRef` instead. */
  name?: string;
  /** @deprecated This property will be removed in a future version use `trackRef` instead. */
  participant?: Participant;
  /** @deprecated This property will be removed in a future version use `trackRef` instead. */
  publication?: TrackPublication;
  onSubscriptionStatusChanged?: (subscribed: boolean) => void;
  /** by the default the range is between 0 and 1 */
  volume?: number;
}

/**
 * The AudioTrack component is responsible for rendering participant audio tracks.
 * This component must have access to the participant's context, or alternatively pass it a `Participant` as a property.
 *
 * @example
 * ```tsx
 *   <ParticipantTile>
 *     <AudioTrack trackRef={trackRef} />
 *   </ParticipantTile>
 * ```
 *
 * @see `ParticipantTile` component
 * @public
 */
export function AudioTrack({
  trackRef,
  onSubscriptionStatusChanged,
  volume,
  source,
  name,
  publication,
  participant: p,
  ...props
}: AudioTrackProps) {
  // TODO: Remove and refactor all variables with underscore in a future version after the deprecation period.
  const maybeTrackRef = useMaybeTrackRefContext();
  const [speex, setSpeex] = React.useState<SpeexWorkletNode>()
  const [rnn, setRNN] = React.useState<RnnoiseWorkletNode>()

  const ctx = useWebAudioContext()
  // add cwy 查看当前选择的降噪方法是否为join
const denoiseMethod = useObservableState(denoiseMethod$, {...defaultAudioSetting.denoiseMethod});
const isMainBrowser  = useMainBrowser()

  const _name = trackRef?.publication?.trackName ?? maybeTrackRef?.publication?.trackName ?? name;
  const _source = trackRef?.source ?? maybeTrackRef?.source ?? source;
  const _publication = trackRef?.publication ?? maybeTrackRef?.publication ?? publication;
  const _participant = trackRef?.participant ?? maybeTrackRef?.participant ?? p;
  if (_source === undefined) {
    throw new Error('The AudioTrack component expects a trackRef or source property.');
  }

  const mediaEl = React.useRef<HTMLAudioElement>(null);
  const participant = useEnsureParticipant(_participant);

  const { elementProps, isSubscribed, track } = useMediaTrackBySourceOrName(
    { source: _source, name: _name, participant, publication: _publication },
    {
      element: mediaEl,
      props,
    },
  );

  React.useEffect(() => {
    onSubscriptionStatusChanged?.(!!isSubscribed);
  }, [isSubscribed, onSubscriptionStatusChanged]);

  React.useEffect(() => {
    if (track === undefined || volume === undefined) {
      return;
    }
    if (track instanceof RemoteAudioTrack) {
      track.setVolume(volume);
    } else {
      log.warn('volume can only be set on remote audio tracks');
    }
  }, [volume, track]);

  React.useEffect(() => {
    if(!isMainBrowser || !track || !(track instanceof RemoteAudioTrack)) return
    
    const mdenoiseTools = require('@sapphi-red/web-noise-suppressor')

    try{
        // 清除之前的降噪模块
        if (speex) {
            speex.destroy()
            speex.disconnect()
        }
        if (rnn) {
            rnn.destroy()
            rnn.disconnect()
        }
        track.setWebAudioPlugins([])

        // 添加降噪模块
        if (denoiseMethod.speex) {
            mdenoiseTools.loadSpeex({ url: speexWasmPath }).then((speexWasmBinary: any) => {
                
                const speexn = new mdenoiseTools.SpeexWorkletNode(ctx, {
                    wasmBinary: speexWasmBinary,
                    maxChannels: 2
                })
                setSpeex(speexn)
    
    
                if(speexn && track instanceof RemoteAudioTrack){
                    track.setWebAudioPlugins([
                        speexn
                    ])
                }
            })
        }else if(denoiseMethod.rnn){

            mdenoiseTools.loadRnnoise({    
                url: rnnoiseWasmPath,
                simdUrl: rnnoiseWasmSimdPath
              }).then((RNNWasmBinary: any) => {
        
                
                const mrnnoise =  new mdenoiseTools.RnnoiseWorkletNode(ctx, {
                    wasmBinary: RNNWasmBinary,
                    maxChannels: 2
                  })
                  setRNN(mrnnoise)

                  if(mrnnoise && track instanceof RemoteAudioTrack){
                    track.setWebAudioPlugins([
                        mrnnoise
                    ])
                }
            })
        }
    }catch(e){
        console.log(e)
    }
    return ()=>{
        speex?.disconnect()
        rnn?.disconnect()
    }
}, [denoiseMethod, track, ctx, isMainBrowser])

  return (
    <audio ref={mediaEl} {...elementProps}></audio>
  )
}
