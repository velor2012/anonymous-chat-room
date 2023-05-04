import * as React from 'react';
import type { Participant } from 'livekit-client';
import {fromEvent, throttleTime} from "rxjs"
import { VolumesForParticipant, volumes$ } from '@/lib/observe/volumeObs';
import { useCallback, useEffect, useMemo, useState } from "react";
import { useEnsureParticipant } from '@livekit/components-react';
export interface VolumeMuteIndicatorOptions {
  participant?: Participant;
}

export type VolumeMuteIndicatorProps = React.HTMLAttributes<HTMLDivElement> &
VolumeMuteIndicatorOptions;


export function VolumeMuteIndicator({ participant, ...props }: VolumeMuteIndicatorProps) {
    const p = useEnsureParticipant(participant);
    const sliderRef = React.useRef<HTMLInputElement>(null);
    const [volume, setVolume] = useState<number>(100);
    const handleOnClicked = useCallback(() => {
        const next_v = volume === 0 ? 100 : 0
        setVolume(next_v);
        volumes$.next({
            volume: next_v / 100,
            participantId: p.identity ?? ""
        })
    }, [p?.identity, volume]);
    const handleOnchage = useCallback((e: any) => {
        setVolume(Number(e.currentTarget.value));
    }, [p?.identity]);

    useEffect(()=>{
        if(!sliderRef.current) return
        const slider$ = fromEvent(sliderRef.current,'change').pipe(
            throttleTime(1000)
          )
          slider$.subscribe(
            _ => {
                const next_v = sliderRef.current?.value
                if(!next_v) return
                volumes$.next({
                    volume: Number(next_v) / 100,
                    participantId: p.identity ?? ""
                })
            }
          )
    },[ sliderRef])

  return (
    <div {...props}>
        <div onClick={handleOnClicked} className=' cursor-pointer'>
            {volume === 0 ? <svg  height={24} width={24} fill="currentColor" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2420"><path d="M688.005 509.074c0-70.294-39.076-128.803-97.612-156.12v85.827l97.612 97.612v-27.319z m97.532 0c0 35.148-7.778 70.243-19.46 101.461l58.536 58.613c27.29-46.854 38.997-105.441 38.997-163.977 0-167.852-117.07-308.363-273.217-343.51v82.002c113.221 38.998 195.144 140.51 195.144 265.411M211.76 157.76l-50.756 50.757 183.487 183.488H161.005v234.143h156.119l195.195 195.221V559.832L680.172 727.66c-27.316 19.539-54.633 35.146-89.78 46.854v82.001c54.633-11.758 101.46-35.146 144.44-70.294l78.071 78.047 50.705-50.755-351.29-351.264-300.557-304.489z m300.56 39.05l-81.976 82.002 81.975 81.923V196.809z" p-id="2421"></path></svg>
            : <svg height={24} width={24} fill="currentColor"  className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2140"><path d="M809.999556 511.195681c0-79.284741-44.049239-145.359622-110.146633-176.25119l0 352.479867C765.950318 656.618748 809.999556 590.516238 809.999556 511.195681M215.197712 379.02136l0 264.378319 176.253236 0 220.302475 220.276892 0-704.95871L391.450948 379.02136 215.197712 379.02136z" p-id="2141"></path></svg>    
            }   
        </div>
        <input ref={sliderRef} type="range" min="0" max="100" value={volume} onChange={handleOnchage} className="range range-xs range-accent" /> 
    </div>
  )
}
