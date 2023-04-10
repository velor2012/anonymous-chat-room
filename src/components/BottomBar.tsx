
import { useState } from "react";
import { UserDefinedConnectionQualityIndicator } from "./ConnectIndicator";
import { MicrophoneMuteButton } from "./MicrophoneMuteButton";
import { MicrophoneSelector } from "./MicrophoneSelector";
import { PoweredByLiveKit } from "./PoweredByLiveKit";
// import RecorderComponent from "./LocalRecoder"
// import RecordRTC, {invokeSaveAsDialog, StereoAudioRecorder} from 'recordrtc'
import {OptionPanel} from '@/components/OptionPanel'
export function BottomBar() {
    const [recorder, setRecorder] = useState<any | null>(null);
    const [recording, setRecording] = useState<boolean>(false);
    
  return (
    <div className="flex px-2 w-screen h-full justify-between p-0 my-1 items-center   animate__animated  animate__fadeIn">
      <div className="flex h-full">
        <MicrophoneMuteButton />
        <div className="w-[400]">
          <MicrophoneSelector />
        </div>
        <OptionPanel/>
      </div>
      <div className="pr-2 hidden md:block">
        <PoweredByLiveKit />
      </div>
    </div>
  );
}
