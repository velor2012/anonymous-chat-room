// import { SpeexWorkletNode, RnnoiseWorkletNode } from '@sapphi-red/web-noise-suppressor';
// import { Participant, RemoteAudioTrack } from 'livekit-client';
import * as React from 'react';
import { rnnWorkletPath, rnnoiseWasmPath, rnnoiseWasmSimdPath, speexWasmPath, speexWorkletPath } from '../const';
// import DetectRTC from "detectrtc";


export function useSetContext() {
    const [ctx, setCtx] = React.useState<AudioContext>()

    React.useEffect(() => {

        const setUpContext = () => {
            let mctx = null
            if (!ctx || ctx.state === 'closed') {
                
                const mmctx = new AudioContext();
                setCtx(mmctx)
                mctx = mmctx
            } else {
                mctx = ctx
                mctx.resume()
            }
            return mctx
        }
        const mctx = setUpContext();
        const  DetectRTC = require('detectrtc');
        if(DetectRTC.browser.isChrome || DetectRTC.browser.isFirefox || DetectRTC.browser.isEdge){
            mctx.audioWorklet.addModule(speexWorkletPath)
            mctx.audioWorklet.addModule(rnnWorkletPath)
        }
        return () => {
            if(ctx && ctx.state === 'running') ctx.suspend()
        }
    }, []);
    return { ctx};
}
