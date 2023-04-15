import { useEffect, useState } from 'react';
import MicSpeakerRecorderPolyFill from './LocalRecoderPolyFill';

let recorder = null;

const LocalRecorderComponent = ({recordingChange}) => {
    const [recording, setRecording] = useState(false);
    const [recordConfig, setRecordConfig] = useState({
        mic: false,
        speaker: false,
        screen: false,
    });

    const initRecoding = () => {
        if (
            typeof window !== 'undefined' &&
            typeof window.MicSpeakerRecorder !== 'undefined'
        ) {
            recorder = new window.MicSpeakerRecorder(
                recordConfig,
                function () {
                    setRecording(true);
                    recordingChange(true);
                },
                function (blobData) {
                    // Stop recording callback here!
                    setRecording(false);
                    recordingChange(false);
                    const url = URL.createObjectURL(blobData);

                    if(recordConfig.screen){
                        invokeSaveAsDialog(blobData, "record.mp4");
                    } 
                    else{
                        invokeSaveAsDialog(blobData, "record.wav");
                    }
                    recorder = null;
                    // window.open(URL.createObjectURL(blobData));
                },
                function () {
                    // Error callback here!
                    console.log('error');
                    recorder = null;
                },
            );
            // setrecorder(recorder);
        }
    };

    const onClickHandle = async () => {
        if (!recorder) initRecoding();
        if (recording) {
            recorder.stop();
        } else {
            recorder.start();
        }
    };
    return (
        <div className="container text-center">
            <MicSpeakerRecorderPolyFill />
            <div className="mb-2 flex w-full justify-center items-center flex-col pt-4">
                <span className=' text-lg font-bold mb-2'>⚠️为了良好的体验，请使用chrome进行录制，safari无法录制扬声器</span>
                {/* 选项 */}
                <div className="ml-4 form-control border rounded-md bg-black bg-opacity-10   w-[200px]">
                    <label className="cursor-pointer label">
                        <span className="label-text ">录制麦克风</span>
                        <input
                            type="checkbox"
                            checked={recordConfig.mic}
                            onChange={() => {
                                setRecordConfig({ ...recordConfig, mic: !recordConfig.mic });
                            }}
                            className="checkbox checkbox-accent bg-white"
                        />
                    </label>
                    <label className="cursor-pointer label">
                        <span className="label-text ">录制扬声器</span>
                        <input
                            type="checkbox"
                            checked={recordConfig.speaker}
                            onChange={() => {
                                setRecordConfig({
                                    ...recordConfig,
                                    speaker: !recordConfig.speaker,
                                });
                            }}
                            className="checkbox checkbox-accent bg-white"
                        />
                    </label>
                    <label className="cursor-pointer label">
                        <span className="label-text ">录制屏幕</span>
                        <input
                            type="checkbox"
                            checked={recordConfig.screen}
                            onChange={() => {
                                setRecordConfig({
                                    ...recordConfig,
                                    screen: !recordConfig.screen,
                                });
                            }}
                            className="checkbox checkbox-accent bg-white"
                        />
                    </label>
                </div>

                <button
                    id="btn-start-recording"
                    className="s-rounded font-bold btn btn-primary  border-none text-white"
                    onClick={onClickHandle}
                >
                    {recording ? 'Stop' : 'Start'} Recording
                </button>
            </div>

                
                <video
                    autoPlay
                    muted={true}
                    // poster="./poster.png"
                    className="hidden md:block video-feedback z-20 mb-4 mx-auto bg-black max-w-7xl w-[600px] h-[500px]"
                ></video>
        </div>
    );
};


/**
 * @param {Blob} file - File or Blob object. This parameter is required.
 * @param {string} fileName - Optional file name e.g. "Recorded-Video.webm"
 * @example
 * invokeSaveAsDialog(blob or file, [optional] fileName);
 * @see {@link https://github.com/muaz-khan/RecordRTC|RecordRTC Source Code}
 */
function invokeSaveAsDialog(file, fileName) {
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


export default LocalRecorderComponent;
