import { useEffect, useState } from 'react';
import MicSpeakerRecorderPolyFill from '../func/LocalRecoderPolyFill';

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
                        invokeSaveAsDialog(blobData, 'recording.mp4');
                    } 
                    else{
                        invokeSaveAsDialog(blobData, 'recording.webm');
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

                {/* 选项 */}
                <div className="ml-4 form-control border rounded-md bg-white bg-opacity-10   w-[200px]">
                    <label className="cursor-pointer label">
                        <span className="label-text text-white">录制麦克风</span>
                        <input
                            type="checkbox"
                            checked={recordConfig.mic}
                            onChange={() => {
                                setRecordConfig({ ...recordConfig, mic: !recordConfig.mic });
                            }}
                            className="checkbox checkbox-accent"
                        />
                    </label>
                    <label className="cursor-pointer label">
                        <span className="label-text text-white">录制扬声器</span>
                        <input
                            type="checkbox"
                            checked={recordConfig.speaker}
                            onChange={() => {
                                setRecordConfig({
                                    ...recordConfig,
                                    speaker: !recordConfig.speaker,
                                });
                            }}
                            className="checkbox checkbox-accent"
                        />
                    </label>
                    <label className="cursor-pointer label">
                        <span className="label-text text-white">录制屏幕</span>
                        <input
                            type="checkbox"
                            checked={recordConfig.screen}
                            onChange={() => {
                                setRecordConfig({
                                    ...recordConfig,
                                    screen: !recordConfig.screen,
                                });
                            }}
                            className="checkbox checkbox-accent"
                        />
                    </label>
                </div>

                <button
                    id="btn-start-recording"
                    className="s-rounded btn mt-2 bg-yellow-600  hover:bg-yellow-800 border-none"
                    onClick={onClickHandle}
                >
                    {recording ? 'Stop' : 'Start'} Recording
                </button>
            </div>

                
                {/* <video
                    autoPlay
                    muted={true}
                    poster="./poster.png"
                    className="video-feedback z-20 mb-4 mx-auto bg-black max-w-7xl w-[600px] h-[500px]"
                ></video> */}
        </div>
    );
};

export default LocalRecorderComponent;
