import { RnnoiseWorkletNode, SpeexWorkletNode } from '@sapphi-red/web-noise-suppressor';
import { setupVisualizer } from '@/components/Record/Visualizer';
import { useEffect, useRef, useState } from 'react';
import { rnnWorkletPath, rnnoiseWasmPath, rnnoiseWasmSimdPath, speexWasmPath, speexWorkletPath } from '@/lib/const';

type WebRTCConfig = {
    noise_sup: boolean
    echo_cancel: boolean
}
type DenoiseMethod = {
    speex: boolean
    rnn: boolean
}
export default function Test () {
    const [speex, setSpeex] = useState<SpeexWorkletNode>()
    const [rnn, setRNN] = useState<RnnoiseWorkletNode>()
    const [source, setSource] = useState<MediaStreamAudioSourceNode>()
    const [speexWasmBinary, setSpeexWasmBinary] = useState<ArrayBuffer>()
    const [RNNWasmBinary, setRNNWasmBinary] = useState<ArrayBuffer>()
    const [analyzer, setAnalyzer] = useState<AnalyserNode>()
    const [ctx, setCtx] = useState<AudioContext>()
    const [denoiseTools, setDenoiseTools] = useState<any>()
    const [webrtcConfig, setWebrtcConfig] = useState<WebRTCConfig>({
        noise_sup: true,
        echo_cancel: true
    })
    const [denoiseMethod, setDenoiseMethod] = useState<DenoiseMethod>({
        speex: false,
        rnn: true
    })

    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(()=>{
        if(canvasRef.current){
            const mdenoiseTools = require('@sapphi-red/web-noise-suppressor')
            
            setDenoiseTools(mdenoiseTools)
            // if(denoiseMethod.speex){
                mdenoiseTools.loadSpeex({ url: speexWasmPath }).then((speexWasmBinary: any) => {
                    setSpeexWasmBinary(speexWasmBinary)
                    const mctx = setUpContext();
                    mctx.audioWorklet.addModule(speexWorkletPath)
                })
            // }else if(denoiseMethod.rnn){
                
                mdenoiseTools.loadRnnoise({    
                    url: rnnoiseWasmPath,
                    simdUrl: rnnoiseWasmSimdPath
                  }).then((RNNWasmBinary: any) => {
                    debugger
                    setRNNWasmBinary(RNNWasmBinary)
                    const mctx = setUpContext();
                    mctx.audioWorklet.addModule(rnnWorkletPath)
                })
            // }
        }
    }, [canvasRef.current])
    const setUpContext = ()=>{
        let mctx = null
        if(!ctx){
            const mmctx = new AudioContext();
            setCtx(mmctx)
            mctx = mmctx
        }else{
            mctx = ctx
        }
        const manalyzer = setupVisualizer(canvasRef.current as HTMLCanvasElement, mctx)
        setAnalyzer(manalyzer)
        return mctx
    }
    const handleClick = async (e: any) => {
        
        if(denoiseTools ){
            if(speex) {
                speex.destroy()
                speex.disconnect()
            }
            if(rnn){
                rnn.destroy()
                rnn.disconnect()
            }
            if(source){
                source.disconnect()
            }
            ctx?.resume()
            

            try{

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        noiseSuppression: webrtcConfig.noise_sup,
                        echoCancellation: webrtcConfig.echo_cancel,
                        autoGainControl: false
                    },
                })
                debugger
                const msource = ctx?.createMediaStreamSource(stream)
                setSource(msource)
                if(denoiseMethod.speex){
                    const speexn = new denoiseTools.SpeexWorkletNode(ctx, {
                        wasmBinary: speexWasmBinary,
                        maxChannels: 2
                    })
                    setSpeex(speexn)
                    msource?.connect(speexn)
                    speexn.connect(ctx?.destination)
                    analyzer?.disconnect()
                    
                    speexn.connect(analyzer)
                }else if(denoiseMethod.rnn){
                    debugger
                    const mrnnoise =  new denoiseTools.RnnoiseWorkletNode(ctx, {
                        wasmBinary: RNNWasmBinary,
                        maxChannels: 2
                      })
                      debugger
                      setRNN(mrnnoise)
                      msource?.connect(mrnnoise)
                      mrnnoise.connect(ctx?.destination)
                      analyzer?.disconnect()
                      
                      mrnnoise.connect(analyzer)
                }else{
                    analyzer?.disconnect()
                    
                    msource?.connect(analyzer as AudioNode)
                    msource?.connect(ctx?.destination as AudioNode)
                }
                
                
            }catch(e){
                console.log(e)
            }
   

        }
    }

  return (
    <div   className=" pt-20 flex flex-col items-center justify-center" >
            <h2>Noise suppressor</h2>

            <label className="cursor-pointer label">
                <span className="label-text ">Noise suppression</span>
                <input
                    type="checkbox"
                    checked={webrtcConfig?.noise_sup}
                    onChange={() => {
                        setWebrtcConfig({ ...webrtcConfig, noise_sup: !webrtcConfig?.noise_sup });
                    }}
                    className="checkbox checkbox-accent bg-white"
                />
            </label>

            <label className="cursor-pointer label">
                <span className="label-text ">Echo Cancel</span>
                <input
                    type="checkbox"
                    checked={webrtcConfig?.echo_cancel}
                    onChange={() => {
                        setWebrtcConfig({ ...webrtcConfig, echo_cancel: !webrtcConfig?.echo_cancel });
                    }}
                    className="checkbox checkbox-accent bg-white"
                />
            </label>
            <div className=' divider'></div>
            <label className="cursor-pointer label">
                <span className="label-text ">Speex</span>
                <input
                    type="checkbox"
                    checked={denoiseMethod?.speex}
                    onChange={() => {
                        setDenoiseMethod({ ...denoiseMethod, speex: !denoiseMethod?.speex });
                    }}
                    className="checkbox checkbox-accent bg-white"
                />
            </label>
            <label className="cursor-pointer label">
                <span className="label-text ">RNNDenoise</span>
                <input
                    type="checkbox"
                    checked={denoiseMethod?.rnn}
                    onChange={() => {
                        setDenoiseMethod({ ...denoiseMethod, rnn: !denoiseMethod?.rnn });
                    }}
                    className="checkbox checkbox-accent bg-white"
                />
            </label>
    
    {/* <form id="form" onSubmit={handleSubmit}> */}
      <div className="flex; items-center">
        <button id="start-button" onClick={handleClick}>Start</button>
        <p className="ml-1 text-sx font-bold">
          Press Start button again to apply settings above.
        </p>
      </div>
    {/* </form> */}

    <canvas ref={canvasRef}></canvas>
        {/* <SpeexPolyFill/>     */}
    </div>
  );
};
