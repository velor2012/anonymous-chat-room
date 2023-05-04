import { LocalAudioTrack, RemoteAudioTrack, AudioAnalyserOptions } from 'livekit-client';
import { useEffect, useState } from 'react';
import { rnnWorkletPath, rnnoiseWasmPath, rnnoiseWasmSimdPath, speexWasmPath, speexWorkletPath } from './const';
import { DenoiseMethod } from './types';

export function useServerUrl(region?: string) {
  const [serverUrl, setServerUrl] = useState<string | undefined>();
  useEffect(() => {
    let endpoint = `/api/url`;
    if (region) {
      endpoint += `?region=${region}`;
    }
    fetch(endpoint).then(async (res) => {
      if (res.ok) {
        const body = await res.json();
        console.log(body);
        setServerUrl(body.url);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  },[region]);
  return serverUrl;
}


export function createAudioAnalyser(
    track: LocalAudioTrack | RemoteAudioTrack,
    denoiseMethod?: DenoiseMethod,
    options?: AudioAnalyserOptions,
  ) {
    const opts = {
      cloneTrack: false,
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
      minDecibels: -100,
      maxDecibels: -80,
      ...options,
    };
    const audioContext = new AudioContext();

    if (!audioContext) {
      throw new Error('Audio Context not supported on this browser');
    }
    const streamTrack = opts.cloneTrack ? track.mediaStreamTrack.clone() : track.mediaStreamTrack;
    const mediaStreamSource = audioContext.createMediaStreamSource(new MediaStream([streamTrack]));
    const analyser = audioContext.createAnalyser();
    analyser.minDecibels = opts.minDecibels;
    analyser.maxDecibels = opts.maxDecibels;
    analyser.fftSize = opts.fftSize;
    analyser.smoothingTimeConstant = opts.smoothingTimeConstant;

    const mdenoiseTools = require('@sapphi-red/web-noise-suppressor')
    let speex: AudioNode | null = null;
    let rnn: AudioNode | null = null;
    // denoiseMethod = undefined
    
    if(denoiseMethod?.speex){
    
            mdenoiseTools.loadSpeex({ url: speexWasmPath }).then((speexWasmBinary: any) => {
                
                audioContext?.audioWorklet.addModule(speexWorkletPath).then(() => {
                    if(!audioContext || audioContext.state != 'running') return
                    const speexn: AudioNode = new mdenoiseTools.SpeexWorkletNode(audioContext, {
                        wasmBinary: speexWasmBinary,
                        maxChannels: 2
                    })
                    
                    speex = speexn;
                    mediaStreamSource.connect(speex as AudioNode)
                    speex.connect(analyser);
                })
            })
                
    }else if(denoiseMethod?.rnn){

        mdenoiseTools.loadRnnoise({    
            url: rnnoiseWasmPath,
            simdUrl: rnnoiseWasmSimdPath
          }).then((RNNWasmBinary: any) => {
            
                audioContext?.audioWorklet.addModule(rnnWorkletPath).then(() => {
                if(!audioContext || audioContext.state != 'running') return
                
                const mrnnoise: AudioNode =  new mdenoiseTools.RnnoiseWorkletNode(audioContext, {
                    wasmBinary: RNNWasmBinary,
                    maxChannels: 2
                })
                rnn = mrnnoise;
                mediaStreamSource.connect(rnn as AudioNode)
                rnn.connect(analyser);
            })
        })
    }else{
        mediaStreamSource.connect(analyser)
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
    /**
     * Calculates the current volume of the track in the range from 0 to 1
     */
    const calculateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (const amplitude of dataArray) {
        sum += Math.pow(amplitude / 255, 2);
      }
      const volume = Math.sqrt(sum / dataArray.length);
      return volume;
    };
  
    const cleanup = () => {
      audioContext.close();
      if(speex) speex.disconnect()
      if(rnn) rnn.disconnect()
      if (opts.cloneTrack) {
        streamTrack.stop();
      }
    };
  
    return { calculateVolume, analyser, cleanup };
  }
  
 export function compareObjects(obj1: any, obj2: any) {
    // 遍历第一个对象的属性
    for (let key in obj1) {
      // 如果第二个对象没有该属性，则返回false
      if (!(key in obj2)) {
        return false;
      }
      // 如果属性值是对象，则递归调用compareObjects()
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        if (!compareObjects(obj1[key], obj2[key])) {
          return false;
        }
      } else {
        // 比较属性值是否相等
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
    }
    // 遍历第二个对象的属性，查看是否存在未匹配的属性
    for (let key in obj2) {
      if (!(key in obj1)) {
        return false;
      }
    }
    // 如果所有属性都匹配，则返回true
    return true;
  }
  
export  function deepClone(obj:any) {
    // 如果参数是基本类型或 null，则直接返回
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    // 创建新对象
    const clone: any = Array.isArray(obj) ? [] : {};
    
    // 遍历对象的属性并复制
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = deepClone(obj[key]);
      }
    }
    
    return clone;
  }
  
  export function checkIsFlv(filename: string) {
    filename = filename.split('?')[0]; // 去掉问号后面的内容
    return filename.endsWith('.flv');
  }
  export function checkIsHLS(filename: string) {
    filename = filename.split('?')[0]; // 去掉问号后面的内容
    return filename.endsWith('.m3u8');
  }