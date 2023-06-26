
import { DenoiseMethod, RoomMetadata } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIsShareVideo } from "@/lib/hooks/useIsShareVideo";
import { useRoomContext } from "@livekit/components-react";
import { useCurState } from "@/lib/hooks/useCurState";
import md5  from 'crypto-js/md5';
import StreamIcon from "../Icons/StreamIcon";
import { useTranslation } from "react-i18next";
export function ShareVideoPannel({showIcon,showText, ...props}: any) {
    const roomctx = useRoomContext();
    const isShareVideo = useIsShareVideo()
    const { t, i18n } = useTranslation()
    const mcurState = useCurState()
    const [shareUrl, setShareUrl] = useState("");
    
    const copyRTMPurl = () =>{
        if(process.env.NEXT_PUBLIC_RTMPKEY){
            const sign = getSign(roomctx.name, process.env.NEXT_PUBLIC_RTMPKEY)
            navigator.clipboard.writeText(process.env.NEXT_PUBLIC_RTMPURL + '/' + roomctx.name + '?sign=' + sign)
        }else{
            navigator.clipboard.writeText(process.env.NEXT_PUBLIC_RTMPURL + '/' + roomctx.name)
        }
    }
    const copyFLVPurl = () =>{
        navigator.clipboard.writeText(process.env.NEXT_PUBLIC_FLVURL + '/' + roomctx.name + '.flv')
    }
    const getSign = (room:string,  key: string)=>{
        var now = new Date();
        console.log(key)
        // 将当前时间加上1小时后，创建一个新的Date对象
        var later = new Date(now.getTime() + 60 * 60 * 20000);
        const later_sec = Math.floor(later.getTime() / 1000)
        console.log(`/live/${room}-${later_sec}` + '-' + `${key}`)
        const HashValue = md5(`/live/${room}-${later_sec}` + '-' + `${key}`).toString()
        return `${later_sec}-${HashValue}`
    }
    const updateVideoShare = async () => {
            const url = '/api/roomMetadata'
            if (roomctx.name === undefined) return undefined
            if (!url) return undefined
            let vsu = shareUrl
            if(isShareVideo || vsu == "") {
              vsu = ""
              setShareUrl("")
            }else{
              vsu = shareUrl
            }
            const body = {
                metadata: {
                  ...mcurState?.roomMetadata,
                  videoShareUrl: vsu
                } as RoomMetadata,
                roomName: roomctx.name
            };
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (response.status === 200) {
               let metadata = mcurState?.roomMetadata ? mcurState?.roomMetadata : {} as RoomMetadata
               metadata.videoShareUrl = vsu
                return await response.json();
            }
  
            const { error } = await response.json();
            throw error;
        }
    ;

    return (
        <div className=" flex text-center justify-center items-center ">
            {
                isShareVideo && 
                <div className="btn  border-none btn-primary text-white" onClick={updateVideoShare}> 
                    {
                        showIcon && 
                        <StreamIcon className="pr-1"/>
                    }
                    {
                        showText && 
                        'Stop Share'
                    }
                    </div>
            }
            {
                !isShareVideo && 
                <div>
                    <label htmlFor="shareVideoPannel" className="btn  border-none btn-primary text-white">
                    {
                        showIcon && 
                        <StreamIcon  className="pr-1"/>
                    }
                    {
                        showText && 
                       t('shareVideo')
                    }
                        </label>

                    <input type="checkbox" id="shareVideoPannel" className="modal-toggle" />
                    <div className="modal ">
                        <div className="modal-box relative bg-primary form-control">
                            <label htmlFor="shareVideoPannel" className="btn btn-accent btn-sm btn-circle absolute right-2 top-2 ">✕</label>
                            {
                                <div className="pl-4 pr-12">
        
                                        <label className="label cursor-pointer justify-between">
                                            <span className="label-text text-white sm:text-lg">Url: </span>
                                            <input
                                                className=" w-[15rem] input-sm sm:input-md rounded-lg border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus: ring-secondary-focus"
                                                id="passwd"
                                                name="passwd"
                                                type="text"
                                                placeholder={
                                                    "set video url"
                                                }
                                                onChange={(inputEl) => setShareUrl(inputEl.target.value)}
                                                autoComplete="off"
                                            />
                                        </label>
                                        {
                                             process.env.NEXT_PUBLIC_RTMPURL &&  process.env.NEXT_PUBLIC_FLVURL &&
                                            <div className=" w-full justify-between flex p-1">
                                                <div className=" text-white sm:text-lg flex items-center"><span>Copy:</span> </div>
                                                <div className="tooltip" data-tip="url to publish your video by rtmp">
                                                    <div className="btn btn-primary text-white" onClick={copyRTMPurl}> publish url</div>
                                                </div>
                                                <div className="tooltip" data-tip="url to share your video by flv">
                                                    <div className="btn btn-primary  text-white" onClick={copyFLVPurl}>share url</div>
                                                </div>
                                            </div>
                                        }
                                </div>
                            }

                            <div className=" w-full flex justify-center">
                                <label htmlFor="shareVideoPannel" className="btn btn-md btn-secondary border-none mt-2" onClick={updateVideoShare}>
                                    Share!
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            }

        </div>

    );
}