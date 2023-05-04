import { useEffect, useMemo, useState } from "react";
import { useRoomContext } from "@livekit/components-react";

export function useIsShareVideo() {
    const roomctx = useRoomContext()
    let metadataObj = undefined
    const [isShareVideo,setIsShareVideo] = useState(false)
    useMemo(() => {
        if(roomctx.metadata != undefined && roomctx.metadata != ""){
            metadataObj = JSON.parse(roomctx.metadata as string)
            metadataObj
            const t =metadataObj.videoShareUrl != undefined && metadataObj.videoShareUrl != "";
            setIsShareVideo(t)
        }
    },[roomctx.metadata])
    return isShareVideo
}