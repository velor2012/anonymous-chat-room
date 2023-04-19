import { SpeexWorkletNode, RnnoiseWorkletNode } from '@sapphi-red/web-noise-suppressor';
import { Participant, RemoteAudioTrack } from 'livekit-client';
import * as React from 'react';
import { rnnWorkletPath, rnnoiseWasmPath, rnnoiseWasmSimdPath, speexWasmPath, speexWorkletPath } from '../const';


type DenoiseMethod = {
  speex: boolean
  rnn: boolean
}

export function useSetContext() {
    // const [speex, setSpeex] = React.useState<SpeexWorkletNode>()
    // const [rnn, setRNN] = React.useState<RnnoiseWorkletNode>()
    // const [speexWasmBinary, setSpeexWasmBinary] = React.useState<ArrayBuffer>()
    // const [RNNWasmBinary, setRNNWasmBinary] = React.useState<ArrayBuffer>()
    // const [denoiseTools, setDenoiseTools] = React.useState<any>()
    // const [denoiseMethod, setDenoiseMethod] = React.useState<DenoiseMethod>({
    //     speex: true,
    //     rnn: false
    // })
    const [ctx, setCtx] = React.useState<AudioContext>()

    React.useEffect(() => {

        const setUpContext = () => {
            let mctx = null
            if (!ctx || ctx.state === 'closed') {
                debugger
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
        mctx.audioWorklet.addModule(speexWorkletPath)
        mctx.audioWorklet.addModule(rnnWorkletPath)
        return () => {
            if(ctx && ctx.state === 'running') ctx.suspend()
        }
    }, []);
    return { ctx};
}
