import dynamic from 'next/dynamic';
const MicSpeakerRecorderPoly = dynamic(
    () =>
      import('./MicSpeakerRecorder').then((MicSpeakerRecorder) => {
        console.log('[imported]', MicSpeakerRecorder);
        window.MicSpeakerRecorder = MicSpeakerRecorder.default;
      }),
    { ssr: false },
  );
  
  function hasAudioRecorder() {
      if (typeof window !== "undefined") {
        console.log("[has-audio-record-?]", window.MicSpeakerRecorder);
        if (typeof window.MicSpeakerRecorder === "undefined") {
          return false;
        }
      }
      return true;
    }
    
    const MicSpeakerRecorderPolyFill = () => {
      console.log("[checking-polyfill]");
      if (!hasAudioRecorder()) return <MicSpeakerRecorderPoly />;
      else return null;
    };
export default MicSpeakerRecorderPolyFill