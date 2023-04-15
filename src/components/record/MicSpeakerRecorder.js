"use strict";

import MultiStreamsMixer from "./MultiStreamsMixer";
import RecordRTC from "recordrtc";
import DetectRTC from "detectrtc";



/**
 * Mic and/or Speaker Recorder
 * @module MicSpeakerRecorder
 */
export default class MicSpeakerRecorder {
    /**
     * @constructor
     * @param {object} config
     */
    constructor(
        config = { mic: true, speaker: true, screen: false },
        successCallback = () => { },
        stopCallback = () => { },
        errorCallback = () => { }
    ) {
        /**
         * @private
         * @type {RecordRTC}
         */
        this.recorder = [];
        /**
         * @private
         * @type {MediaStream}
         */
        this.mediaStream = null;
        /**
         * @private
         * @type {MediaStream}
         */
        this.mediaStreamMic = null;
        /**
         * @private
         * @type {boolean}
         */
        this.mic = config.mic;
        if (typeof config.mic === "undefined") {
            this.mic = true;
        }
        /**
         * @private
         * @type {boolean}
         */
        this.speaker = config.speaker;
        if (typeof config.speaker === "undefined") {
            this.speaker = true;
        }
        /**
     * @private
     * @type {boolean}
     */
        this.screen = config.screen;
        if (typeof config.screen === "undefined") {
            this.screen = false;
        }
        /**
         * Callback success
         * @private
         * @type {function}
         */
        this.callbackStreamSuccess = successCallback;
        /**
         * Callback error
         * @private
         * @type {function}
         */
        this.callbackStreamError = errorCallback;
        /**
         * Callback stop
         * @private
         * @type {function}
         */
        this.callbackStreamStop = stopCallback;
    }

    /**
     * Get popup permission display media
     * @private
     * @returns {MediaDevices}|null
     */
    getMediaDevices() {
        if (navigator.mediaDevices.getDisplayMedia) {
            return navigator.mediaDevices;
        }
        if (navigator.getDisplayMedia) {
            return navigator;
        }
        return null;
    }

    /**
     * Capture Microphone
     * @private
     * @param {MediaDevices} mediaDevices
     * @returns {MediaStream}
     */
    captureMicrophone(mediaDevices) {
        // return mediaDevices.getUserMedia({ audio: {echoCancellation:true}, video: false });
        return captureUserMedia({ audio: true });
    }

    /**
     * Capture Speaker
     * @private
     * @param {MediaDevices} mediaDevices
     * @returns {MediaStream}
     */
    captureSpeaker(mediaDevices) {
        if (DetectRTC.browser.isChrome || DetectRTC.browser.isOpera
            || DetectRTC.browser.isFirefox || DetectRTC.browser.isEdge) return mediaDevices.getDisplayMedia({ audio: this.speaker, video: { height: window.screen.height, width: window.screen.width } });
        return captureScreen({video: true });
    }

    /**
     * Stop listener
     * @private
     */
    stopListener() {
        let isExecuted = false;
        const executedOnce = () => {
            debugger
            if (isExecuted === false) {
                // this.recorder.stopRecording((url) => {
                //   this.callbackStreamStop(url);
                //   this.recorder.destroy();
                //   this.recorder = null;
                  this.stop();
                // });
            }
            isExecuted = true;
        };
        if (this.mediaStream) {
            debugger
            this.mediaStream.addEventListener("ended", executedOnce, false);
            this.mediaStream.addEventListener("inactive", executedOnce, false);
            this.mediaStream.getTracks().forEach((track) => {
                track.addEventListener("ended", executedOnce, false);
                track.addEventListener("inactive", executedOnce, false);
            });
        }
        if (this.mediaStreamMic) {
            debugger
            this.mediaStreamMic.addEventListener("ended", executedOnce, false);
            this.mediaStreamMic.addEventListener("inactive", executedOnce, false);
            this.mediaStreamMic.getTracks().forEach((track) => {
                track.addEventListener("ended", executedOnce, false);
                track.addEventListener("inactive", executedOnce, false);
            });
        }
        if (this.mixedStream) {
            debugger
            this.mixedStream.addEventListener("ended", executedOnce, false);
            this.mixedStream.addEventListener("inactive", executedOnce, false);
            this.mixedStream.getTracks().forEach((track) => {
                track.addEventListener("ended", executedOnce, false);
                track.addEventListener("inactive", executedOnce, false);
            });
        }
    }

    // Function to display the live preview of what is being recorded
    setupVideoFeedback(stream) {
        if (stream) {
            const video = document.querySelector(".video-feedback");
            //   if(!video) return
            debugger
            video.srcObject = stream;
            video.play();
        } else {
            console.warn("No stream available!");
            alert("Error: Invalid sources!");
        }
    }

    /**
     * Start recording
     * @public
     */
    async start() {
        const mediaDevices = this.getMediaDevices();
        if (mediaDevices === null) {
            this.callbackStreamError();
            return;
        }

        try {
            let streamSpeaker = null
            let streamMic = null
            const tracks = []
            if (this.screen || this.speaker) streamSpeaker = await this.captureSpeaker(mediaDevices)
            if (this.mic) streamMic = await this.captureMicrophone(mediaDevices)
            debugger
            if (this.screen) {
                tracks.push(...streamSpeaker.getVideoTracks())
                if(!DetectRTC.isMobileDevice) this.setupVideoFeedback(streamSpeaker);
            }

            let mixedStream = null
            debugger
            if (DetectRTC.browser.isSafari) {
                if (this.mic && this.screen) {
                    streamSpeaker.addTrack(streamMic.getTracks()[0]);
                    mixedStream = streamSpeaker

                } else mixedStream = this.mic ? streamMic : streamSpeaker

            } else if (DetectRTC.browser.isChrome || DetectRTC.browser.isOpera
                || DetectRTC.browser.isFirefox || DetectRTC.browser.isEdge) {
                const audioStream = [];
                if (this.mic && streamMic) {
                    audioStream.push(streamMic);
                }
                if (this.speaker && streamSpeaker) {
                    audioStream.push(streamSpeaker);
                }

                const audioMixer = new MultiStreamsMixer(audioStream);
                const audioMixedStream = audioMixer.getMixedStream();
                tracks.push(...audioMixedStream.getTracks())
                mixedStream = new MediaStream(tracks);
            }else return
            // debugger
            let config =
            {
                type: 'audio',
                mimeType: 'audio/wav',
                leftChannel: false,
                disableLogs: false,
                recorderType: RecordRTC.StereoAudioRecorder
            };

            if (this.screen) config = {
                type: 'video',
                mimeType: 'video/webm',
                getNativeBlob: false,
                disableLogs: false,
                ignoreMutedMedia: false
                // used by CanvasRecorder and WhammyRecorder
                //   canvas: {
                //       width: window.screen.width,
                //       height: window.screen.height
                //   },
                //   video:{
                //       width: window.screen.width,
                //       height: window.screen.height
                //   }
            }

            if (DetectRTC.browser.name === 'Edge') {
                config.numberOfAudioChannels = 1;
            }

            config.ignoreMutedMedia = false;

            this.recorder = RecordRTC(mixedStream, config);
            this.mediaStream = streamSpeaker;
            this.mediaStreamMic = streamMic;
            this.mixedStream = mixedStream;
            this.recorder.startRecording();
            this.stopListener();
            this.callbackStreamSuccess(mixedStream, streamSpeaker, this.recorder);

        } catch (error) {
            console.error(error);
            this.callbackStreamError();
        }
    }

    /**
     * Stop recording
     * @public
     */
    stop() {
        this.recorder && this.recorder.stopRecording((url) => {
            if(!this.recorder) return;
            const t = this.recorder.getBlob()
            debugger
            this.callbackStreamStop(t);
            this.recorder.destroy();
            this.recorder = null;
        });
        if (this.mediaStream) {
            this.mediaStream.stop();
        }
        if (this.mixedStream) {
            this.mixedStream.stop();
        }
        if (this.mediaStreamMic) {
            this.mediaStreamMic.stop();
        }
        this.mediaStream = null;
        this.mediaStreamMic = null;
        this.mixedStream = null;
    }
}


function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
    if (mediaConstraints.video == true) {
        mediaConstraints.video = {};
    }

    // setVideoBitrates();

    // mediaConstraints = getVideoResolutions(mediaConstraints);
    // mediaConstraints = getFrameRates(mediaConstraints);

    var isBlackBerry = !!(/BB10|BlackBerry/i.test(navigator.userAgent || ''));
    if (isBlackBerry && !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        return navigator.getUserMedia(mediaConstraints);
    }

    return navigator.mediaDevices.getUserMedia(mediaConstraints);

}

function captureScreen(config) {
    if (navigator.getDisplayMedia) {
        return navigator.getDisplayMedia(config)
    } else if (navigator.mediaDevices.getDisplayMedia) {
        return navigator.mediaDevices.getDisplayMedia(config)
    } else {
        var error = 'getDisplayMedia API are not supported in this browser.';
        config.onMediaCapturingFailed(error);
        alert(error);
    }
}
