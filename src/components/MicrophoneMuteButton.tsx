import { TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";

export function MicrophoneMuteButton() {
  return (
    <div className="flex items-center">
      <TrackToggle
        source={Track.Source.Microphone}
        className="btn button-circle w-8  p-0 my-1 mx-1 border btn-sm  border-none bg-yellow-600 hover:bg-yellow-800" 
      />
    </div>
  );
}
