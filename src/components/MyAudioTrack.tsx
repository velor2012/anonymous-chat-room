import type { Participant, Track, TrackPublication } from 'livekit-client';
import * as React from 'react';
import { useMediaTrackBySourceOrName } from '@/livekit-react-offical/hooks/useMediaTrackBySourceOrName';
import { log } from '@livekit/components-core';
import { useEnsureParticipant } from '@livekit/components-react';
import { RemoteAudioTrack } from 'livekit-client';
import { useWebAudioContext } from '@/lib/context/webAudioContex';
import { defaultAudioSetting, rnnoiseWasmPath, rnnoiseWasmSimdPath, speexWasmPath } from '@/lib/const';
import { SpeexWorkletNode, RnnoiseWorkletNode } from '@sapphi-red/web-noise-suppressor';
import { useObservableState } from '@/livekit-react-offical/hooks/internal';
import { denoiseMethod$} from '@/lib/observe/DenoiseMethodObs';
import { useMainBrowser } from "@/lib/hooks/useMainBrowser";

export type AudioTrackProps<T extends HTMLMediaElement = HTMLMediaElement> =
  React.HTMLAttributes<T> & {
    source: Track.Source;
    name?: string;
    participant?: Participant;
    publication?: TrackPublication;
    onSubscriptionStatusChanged?: (subscribed: boolean) => void;
    /** by the default the range is between 0 and 1 */
    volume?: number;
  };

/**
 * The AudioTrack component is responsible for rendering participant audio tracks.
 * This component must have access to the participant's context, or alternatively pass it a `Participant` as a property.
 *
 * @example
 * ```tsx
 *   <ParticipantTile>
 *     <AudioTrack source={Track.Source.Microphone} />
 *   </ParticipantTile>
 * ```
 *
 * @see `ParticipantTile` component
 */
export function AudioTrack({ onSubscriptionStatusChanged, volume, ...props }: AudioTrackProps) {
  const { source, name, publication } = props;
  const mediaEl = React.useRef<HTMLAudioElement>(null);
  const participant = useEnsureParticipant(props.participant);
  const [speex, setSpeex] = React.useState<SpeexWorkletNode>()
  const [rnn, setRNN] = React.useState<RnnoiseWorkletNode>()

  const ctx = useWebAudioContext()
  // add cwy 查看当前选择的降噪方法是否为join
const denoiseMethod = useObservableState(denoiseMethod$, {...defaultAudioSetting.denoiseMethod});
const isMainBrowser  = useMainBrowser()
  const { elementProps, isSubscribed, track } = useMediaTrackBySourceOrName(
    { source, name, participant, publication },
    {
      element: mediaEl,
      props,
    },
  );

  React.useEffect(() => {
    onSubscriptionStatusChanged?.(!!isSubscribed);
  }, [isSubscribed, onSubscriptionStatusChanged]);

  React.useEffect(() => {
    if (volume && track instanceof RemoteAudioTrack) {
      track.setVolume(volume);
    } else {
      log.warn('volume can only be set on remote audio tracks');
    }
  }, [volume, track]);

  React.useEffect(() => {
    if(!isMainBrowser) return
    
    const mdenoiseTools = require('@sapphi-red/web-noise-suppressor')

    try{
        if (speex) {
            speex.destroy()
            speex.disconnect()
        }
        if (rnn) {
            rnn.destroy()
            rnn.disconnect()
        }
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
