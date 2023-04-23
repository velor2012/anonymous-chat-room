import React, { useEffect, useState } from 'react';
// import MicSpeakerRecorderPolyFill from './LocalRecoderPolyFill';
export type LocalRecorderComponentProps = {
    recordingChange:any
}
type RecordConfig = {
    mic: boolean,
    speaker: boolean,
    screen: boolean,
    screenW: number | undefined,
    screenH: number | undefined,
}
let invokeSaveAsDialog: ((arg0: Blob, arg1: string) => void) | null = null
const LocalRecorderComponent = React.memo(({recordingChange}: LocalRecorderComponentProps) => {
    const [recording, setRecording] = useState(false);
    const [recorder, setRecorder] = useState(undefined);
    const resolutionBtnRef = React.useRef<HTMLDivElement>(null)
    const [recordConfig, setRecordConfig] = useState<RecordConfig>({
        mic: false,
        speaker: false,
        screen: false,
        screenW: undefined,
        screenH: undefined,
    });
    const initRecoding = (MicSpeakerRecorder: any) => {
        if (MicSpeakerRecorder) {
            const mrecorder = new MicSpeakerRecorder(
                recordConfig,
                function () {
                    setRecording(true);
                    recordingChange(true);
                },
                function (blobData: Blob) {
                    // Stop recording callback here!
                    setRecording(false);
                    recordingChange(false);
                    const url = URL.createObjectURL(blobData);

                    if(recordConfig.screen){
                        (invokeSaveAsDialog as any)(blobData, "record.mp4");
                    } 
                    else{
                        (invokeSaveAsDialog as any)(blobData, "record.wav");
                    }
                    setRecorder(undefined);
                    // window.open(URL.createObjectURL(blobData));
                },
                function () {
                    // Error callback here!
                    console.log('error');
                    setRecorder(undefined);
                },
            );
            setRecorder(mrecorder)
            return mrecorder
        }
    };

    const onClickHandle = async () => {
        let r = null;
        if(!recorder) {
            const mmicSpeakerRecorder = require('./MicSpeakerRecorder')
            invokeSaveAsDialog = mmicSpeakerRecorder.invokeSaveAsDialog
            r = initRecoding(mmicSpeakerRecorder.default)
        }else{
            r = recorder
        }
        if (recording) {
            r.stop();
        } else {
            r.start();
        }
    };
    const handleChange = (e: any, idx: number) => {
        const actBtn = resolutionBtnRef.current?.getElementsByClassName("btn-active")[0]
        actBtn?.classList.remove('btn-active');
        e.target.classList.add('btn-active');
        switch (idx) {
            case 0:
                setRecordConfig({
                    ...recordConfig,
                    screenW: undefined,
                    screenH: undefined,
                });
                break
            case 1:
                setRecordConfig({
                    ...recordConfig,
                    screenW: 1280,
                    screenH: 720,
                });
                break
            case 2:
                setRecordConfig({
                    ...recordConfig,
                    screenW: 1920,
                    screenH: 1080,
                });
                break
            case 3:
                setRecordConfig({
                    ...recordConfig,
                    screenW: 2560,
                    screenH: 1440,
                });
                break
        }
    }
    return (
        <div className="container text-center">
            {/* <MicSpeakerRecorderPolyFill /> */}
            <div className="mb-2 flex w-full justify-center items-center flex-col pt-4">
                <span className=' text-lg font-bold mb-2'>⚠️为了良好的体验，请使用chrome进行录制，safari无法录制扬声器</span>
                {/* 选项 */}
                <div className='flex gap-6 pb-2'>
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
                    <div ref={resolutionBtnRef} className="btn-group btn-group-vertical">
                        <button className="btn btn-active" onClick={(e)=>{handleChange(e, 0)}}>Default</button>
                        <button className="btn" onClick={(e)=>{handleChange(e, 1)}}>720p</button>
                        <button className="btn" onClick={(e)=>{handleChange(e, 2)}}>1080p</button>
                        <button className="btn" onClick={(e)=>{handleChange(e, 3)}}>2k</button>
                    </div>
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
})

LocalRecorderComponent.displayName = 'LocalRecorder';
export default LocalRecorderComponent;
