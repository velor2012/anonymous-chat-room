import { isLocal } from '@livekit/components-core';
import { Track } from 'livekit-client';
import * as React from 'react';
import { useTracks } from '@livekit/components-react';
import { volumes$ } from '@/lib/observe/volumeObs';
import { useObservableState } from '@/livekit-react-offical/hooks/internal';
import {AudioTrack} from '@/components/MyAudioTrack'
/**
 * The RoomAudioRenderer component is a drop-in solution for adding audio to your LiveKit app.
 * It takes care of handling remote participants’ audio tracks and makes sure that microphones and screen share are audible.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <RoomAudioRenderer />
 * </LiveKitRoom>
 * ```
 */
export const RoomAudioRenderer = () => {
  const tracks = useTracks([Track.Source.Microphone, Track.Source.ScreenShareAudio], {
    updateOnlyOn: [],
  }).filter((ref) => !isLocal(ref.participant));

// 订阅volumes改变音量
const volumeState = useObservableState(volumes$, {
    volume:1,
    participantId:""
});

const [volumesMap, setVolumeMap] = React.useState(new Map<string, number>())

React.useEffect(() => {
    volumesMap.set(volumeState.participantId, volumeState.volume)
    setVolumeMap(new Map<string, number>(volumesMap))
}, [volumeState])

  return (
    <div style={{ display: 'none' }}>
      {tracks.map((trackRef) => 
      {
        const v = volumesMap.get(trackRef.participant.identity)
        // console.log(`set volume ${v} for ${trackRef.participant.identity}`)
        return (
            v != 0 &&
            <AudioTrack hidden key={trackRef.publication.trackSid} {...trackRef} volume={volumesMap.get(trackRef.participant.identity)} />
          )
      })}
      {/* (
        <AudioTrack key={trackRef.publication.trackSid} {...trackRef} volume={volumesMap.get(trackRef.participant.identity)} />
        // <MyAudioTrack trackRef={trackRef}/>
      ))} */}
    </div>
  );
};