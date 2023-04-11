import { ConnectionDetails } from "@/pages/api/connection_details"

type MyConfig = {
    channelCount: number,
    echoCancellation: boolean,
    noiseSuppression: boolean,
    autoGainControl: boolean,
}

type AuthCookie={
    latest_info: ConnectionDetails | null,
    history: ConnectionDetails[], //保留最近加入的4个房间的信息
}

type lruItem = {
    passwd: string,
    time: number
}