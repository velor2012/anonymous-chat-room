import { VideoPresets, TrackPublishDefaults, TrackPublishOptions, ScreenSharePresets, AudioPresets, VideoPreset } from 'livekit-client';
import { AudioSetting } from './types';
export const xs_preset = new VideoPreset(1280, 720, 3_000_000, 30)
export const s_preset = new VideoPreset(1280, 720, 6_000_000, 60)
export const v_preset = new VideoPreset(1920, 1080, 10_000_000, 60)
export const simulcast_set = [xs_preset, v_preset]
export const defaultAudioSetting: AudioSetting = {
    autoGainControl: true,
    channelCount: 2,
    echoCancellation: true,
    noiseSuppression: true,
    denoiseMethod: {
        speex: false,
        rnn: false
    }
}

export const publishDefaults: TrackPublishDefaults = {
    audioBitrate: AudioPresets.musicStereo.maxBitrate,
    dtx: true,
    red: true,
    forceStereo: false,
    simulcast: false,
    // videoSimulcastLayers: simulcast_set,
    // screenShareEncoding: ScreenSharePresets.h1080fps15.encoding,
    screenShareEncoding: s_preset.encoding,
    stopMicTrackOnMute: false,
    videoEncoding: s_preset.encoding ,
    videoCodec: 'vp8',
    backupCodec: { codec: 'vp8', encoding: VideoPresets.h540.encoding },
} as const;

// export const lru = {lru: new LRUCache({ max: 500, ttl:1000 * 60 * 60 * 24 }), time:  new Date() }
export const theme = {
    color1: "#9DC8C8",
    color2: "#58C9B9",
    color3: "#519D9E",
    color4: "#D1B6E1",
}

export const speexWorkletPath = "/denoise/speex/workletProcessor.js"
export const speexWasmPath = "/denoise/speex/speex.wasm"
export const rnnWorkletPath = "/denoise/rnn/workletProcessor.js"
export const rnnoiseWasmPath = "/denoise/rnn/rnnoise.wasm"
export const rnnoiseWasmSimdPath = "/denoise/rnn/rnnoise_simd.wasm"
