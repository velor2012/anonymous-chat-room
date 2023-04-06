"use strict";

import MultiStreamsMixer from "./MultiStreamsMixer";
import RecordRTC from "recordrtc";

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
    successCallback = () => {},
    stopCallback = () => {},
    errorCallback = () => {}
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
    return mediaDevices.getUserMedia({ audio: {echoCancellation:true}, video: false });
  }

  /**
   * Capture Speaker
   * @private
   * @param {MediaDevices} mediaDevices
   * @returns {MediaStream}
   */
  captureSpeaker(mediaDevices) {
    return mediaDevices.getDisplayMedia({ audio: this.speaker, video: {height:window.screen.height,width:window.screen.width} });
  }

  /**
   * Stop listener
   * @private
   */
  stopListener() {
    let isExecuted = false;
    const executedOnce = () => {
      if (isExecuted === false) {
        this.recorder.stopRecording(() => {
          this.callbackStreamStop(this.recorder.getBlob());
          this.recorder.destroy();
          this.recorder = null;
          this.stop();
        });
      }
      isExecuted = true;
    };

    if(this.mediaStream){
        this.mediaStream.addEventListener("ended", executedOnce, false);
        this.mediaStream.addEventListener("inactive", executedOnce, false);
        this.mediaStream.getTracks().forEach((track) => {
          track.addEventListener("ended", executedOnce, false);
          track.addEventListener("inactive", executedOnce, false);
        });
    }
    if(this.mediaStreamMic){
        this.mediaStreamMic.addEventListener("ended", executedOnce, false);
        this.mediaStreamMic.addEventListener("inactive", executedOnce, false);
        this.mediaStreamMic.getTracks().forEach((track) => {
          track.addEventListener("ended", executedOnce, false);
          track.addEventListener("inactive", executedOnce, false);
        });
    } 
  }

  // Function to display the live preview of what is being recorded
 setupVideoFeedback(stream) {
    if (stream) {
      const video = document.querySelector(".video-feedback");
      if(!video) return
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

    try{
        let streamSpeaker = null
        let streamMic = null
        const tracks = []
        if(this.screen || this.speaker) streamSpeaker = await this.captureSpeaker(mediaDevices)
        if(this.mic) streamMic = await this.captureMicrophone(mediaDevices)
        if(this.screen){
            tracks.push(...streamSpeaker.getVideoTracks())
            this.setupVideoFeedback(streamSpeaker);
        }

        const audioStream = [];
        if (this.mic && streamMic) {
          audioStream.push(streamMic);
        }
        if (this.speaker && streamSpeaker) {
          audioStream.push(streamSpeaker);
        }
        
        // // console.log(MultiStreamsMixer)
        const audioMixer = new MultiStreamsMixer(audioStream);
        const audioMixedStream = audioMixer.getMixedStream();
        tracks.push(...audioMixedStream.getTracks())
        let mixedStream = new MediaStream(tracks);
        let config = {type : "audio", mimeType: "audio/webm"}
        if(this.screen) config = {
            type: "video",
            mimeType : 'video/webm\;codecs=h264',
              // used by CanvasRecorder and WhammyRecorder
              canvas: {
                  width: window.screen.width,
                  height: window.screen.height
              },
              video:{
                  width: window.screen.width,
                  height: window.screen.height
              }
          }

        this.recorder = RecordRTC(mixedStream, config);
        this.mediaStream = streamSpeaker;
        this.mediaStreamMic = streamMic;
        this.recorder.startRecording();
        this.stopListener();
        this.callbackStreamSuccess(mixedStream, streamSpeaker, this.recorder);
        
    }catch(error){
        console.error(error);
        this.callbackStreamError();
    }
  }

  /**
   * Stop recording
   * @public
   */
  stop() {
    if(this.mediaStream) this.mediaStream.stop();
    if(this.mediaStreamMic)this.mediaStreamMic.stop();
    this.mediaStream = null;
    this.mediaStreamMic = null;
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
        } catch (e) {}
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
