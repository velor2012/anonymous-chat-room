
import { AudioTrack, ConnectionQualityIndicator, ParticipantContext, ParticipantContextIfNeeded, ParticipantName, TrackMutedIndicator, useConnectionQualityIndicator, useMediaTrack, useRoomContext } from "@livekit/components-react";
import { ConnectionQuality, Participant, Track } from "livekit-client";
import AudioVisualizer from "./AudioVisualizer";
import { strToRGB } from "@/tools/utils";
import { useEffect, useMemo, useState } from "react";
import { theme } from "@/tools/setting";

export interface AudioVisualizerProps extends React.HTMLAttributes<SVGElement> {
    participant: Participant;
    isme: boolean,
}

export default function MemberCard({ participant, isme, ...props }: AudioVisualizerProps) {
    let { track } = useMediaTrack(Track.Source.Microphone, participant);
    // let t: any = track?.mediaStream?.clone()
    const [ad, setAd] = useState<any>(undefined);
    let isMute = useState<boolean>(false)
    const { quality } = useConnectionQualityIndicator({ participant: participant});
    const handleOnClicked = () => {
        isMute[1](!isMute[0])
    }
    const volume = useMemo(() => {
        return isMute[0] ? 0 : 1
    }, [isMute[0]])

    function qualityToText(quality: ConnectionQuality): string {
        switch (quality) {
          case ConnectionQuality.Unknown:
            return 'Unknown';
          case ConnectionQuality.Poor:
            return '差';
          case ConnectionQuality.Good:
            return '良好';
          case ConnectionQuality.Excellent:
            return '极佳';
        }
      }
    

    return (
        
        <div className='m-2 rounded-xl  p-4 pb-2 pt-2 text-white  animate__animated  animate__zoomIn' style={{ backgroundColor: theme.color1, boxShadow:"rgba(57, 108, 124, 0.5) 0px 6px 18px 0px"}}>
            {isMute[0] || isme || <AudioTrack volume={volume} source={Track.Source.Microphone} participant={participant}></AudioTrack>}
            
            <ParticipantContextIfNeeded  participant={participant}>
                <div className='flex justify-around'>
                    <ParticipantName />
                    {isme && <span>(ME)</span>}
                </div>
                <div className=' divider my-0'></div>
                <div className='flex justify-around'>
                <div className="tooltip" data-tip={`连接状态: ${qualityToText(quality)}`}>
                        <ConnectionQualityIndicator />
                    </div>
                    {!isme && 
                        <div onClick={handleOnClicked} className=' z-10 hover:cursor-pointer'>
                            {isMute[0] ? <svg  height={16} width={16} fill="currentColor" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2420"><path d="M688.005 509.074c0-70.294-39.076-128.803-97.612-156.12v85.827l97.612 97.612v-27.319z m97.532 0c0 35.148-7.778 70.243-19.46 101.461l58.536 58.613c27.29-46.854 38.997-105.441 38.997-163.977 0-167.852-117.07-308.363-273.217-343.51v82.002c113.221 38.998 195.144 140.51 195.144 265.411M211.76 157.76l-50.756 50.757 183.487 183.488H161.005v234.143h156.119l195.195 195.221V559.832L680.172 727.66c-27.316 19.539-54.633 35.146-89.78 46.854v82.001c54.633-11.758 101.46-35.146 144.44-70.294l78.071 78.047 50.705-50.755-351.29-351.264-300.557-304.489z m300.56 39.05l-81.976 82.002 81.975 81.923V196.809z" p-id="2421"></path></svg>
                            : <svg height={16} width={16} fill="currentColor"  className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2140"><path d="M809.999556 511.195681c0-79.284741-44.049239-145.359622-110.146633-176.25119l0 352.479867C765.950318 656.618748 809.999556 590.516238 809.999556 511.195681M215.197712 379.02136l0 264.378319 176.253236 0 220.302475 220.276892 0-704.95871L391.450948 379.02136 215.197712 379.02136z" p-id="2141"></path></svg>    
                            }
                        </div>
                    }
                    {/* <TrackMutedIndicator source={Track.Source.Microphone}></TrackMutedIndicator> */}
                </div>
                <AudioVisualizer
                    track={track}
                    name={participant.identity}
                    muteState={participant.isMicrophoneEnabled}
                ></AudioVisualizer>
            </ParticipantContextIfNeeded>
        </div>
    );
}
