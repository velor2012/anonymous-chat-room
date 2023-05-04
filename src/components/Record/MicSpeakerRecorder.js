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
        config = { mic: true, speaker: true, screen: false, screenW: undefined, screenH: undefined },
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
     * @private
     * @type {number}
     */
        this.screenW = config.screenW || window.screen.width
        /**
     * @private
     * @type {number}
     */
        this.screenH = config.screenH || window.screen.height
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
            || DetectRTC.browser.isFirefox || DetectRTC.browser.isEdge) return mediaDevices.getDisplayMedia({ audio: this.speaker, video: { height: this.screenH, width:  this.screenW } });
        return captureScreen({video: true });
    }

    /**
     * Stop listener
     * @private
     */
    stopListener() {
        let isExecuted = false;
        const executedOnce = () => {
            
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
            
            this.mediaStream.addEventListener("ended", executedOnce, false);
            this.mediaStream.addEventListener("inactive", executedOnce, false);
            this.mediaStream.getTracks().forEach((track) => {
                track.addEventListener("ended", executedOnce, false);
                track.addEventListener("inactive", executedOnce, false);
            });
        }
        if (this.mediaStreamMic) {
            
            this.mediaStreamMic.addEventListener("ended", executedOnce, false);
            this.mediaStreamMic.addEventListener("inactive", executedOnce, false);
            this.mediaStreamMic.getTracks().forEach((track) => {
                track.addEventListener("ended", executedOnce, false);
                track.addEventListener("inactive", executedOnce, false);
            });
        }
        if (this.mixedStream) {
            
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
            
            if (this.screen) {
                tracks.push(...streamSpeaker.getVideoTracks())
                if(!DetectRTC.isMobileDevice) this.setupVideoFeedback(streamSpeaker);
            }

            let mixedStream = null
            
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
                ignoreMutedMedia: false,
                // used by CanvasRecorder and WhammyRecorder
                  canvas: {
                      width:  this.screenW,
                      height: this.screenH 
                  },
                  video:{
                      width: this.screenW,
                      height: this.screenH 
                  }
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

/**
 * @param {Blob} file - File or Blob object. This parameter is required.
 * @param {string} fileName - Optional file name e.g. "Recorded-Video.webm"
 * @example
 * invokeSaveAsDialog(blob or file, [optional] fileName);
 * @see {@link https://github.com/muaz-khan/RecordRTC|RecordRTC Source Code}
 */
export function invokeSaveAsDialog(file, fileName) {
    if (!file) {
        throw 'Blob object is required.';
    }

    if (!file.type) {
        try {
            file.type = 'video/webm';
        } catch (e) { }
    }

    var fileExtension = (file.type || 'video/webm').split('/')[1];
    if (fileExtension.indexOf(';') !== -1) {
        // extended mimetype, e.g. 'video/webm;codecs=vp8,opus'
        fileExtension = fileExtension.split(';')[0];
    }
    if (fileName && fileName.indexOf('.') !== -1) {
        var splitted = fileName.split('.');
        fileName = splitted[0];
        fileExtension = splitted[1];
    }

    var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }

    var hyperlink = document.createElement('a');
    hyperlink.href = URL.createObjectURL(file);
    hyperlink.download = fileFullName;

    hyperlink.style = 'display:none;opacity:0;color:transparent;';
    (document.body || document.documentElement).appendChild(hyperlink);

    if (typeof hyperlink.click === 'function') {
        hyperlink.click();
    } else {
        hyperlink.target = '_blank';
        hyperlink.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));
    }

    URL.revokeObjectURL(hyperlink.href);
}