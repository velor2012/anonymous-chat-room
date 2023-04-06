import { TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";

export function MicrophoneMuteButton() {
  return (
    <div className="flex items-center w-[42px] justify-center">
      <TrackToggle
        source={Track.Source.Microphone}
        className="btn button-circle w-full h-full  p-0 my-0 mx-1 border btn-sm  border-none bg-yellow-600 text-white hover:bg-yellow-800" 
      />
    </div>
  );
}
