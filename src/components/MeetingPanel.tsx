
import React, { HTMLAttributes, MouseEventHandler, useEffect, useMemo, useState } from 'react';
import { LocalParticipant, LogLevel, ParticipantEvent, RoomEvent, Track } from 'livekit-client';
import MemberCard from "@/components/MemberCard"
import {
    ParticipantContext, ConnectionQualityIndicator, useParticipants, ParticipantName, AudioTrack,
    TrackMutedIndicator,
    useMediaTrack,
    Chat,
    useLocalParticipant,
    useRoomContext
} from "@livekit/components-react";
import { ChatCard } from './ChatCard';
import { getServerLatency } from '@/tools/utils';
import { log } from "@livekit/components-core"
log.setDefaultLevel(LogLevel.warn)

export function MeetingPanel(props: HTMLAttributes<HTMLSpanElement>) {
    const participants = useParticipants();
    const [delays, setDelays] = useState<number[]>([])
    const [delayme, setDelaysMe] = useState<number>(0)
    const [loop, setLoop] = useState<any>(null);
    const room = useRoomContext();

    room.on(
        RoomEvent.Connected, () => {
            room.localParticipant.setMicrophoneEnabled(true)
        }
    ).on(RoomEvent.AudioPlaybackStatusChanged, () => {
        if (!room.canPlaybackAudio) {
            log.warn("can't playback audio")
            const btn = document.getElementById("allowPlayBack");
            if (!btn) return
            btn.onclick = () => {
                if(room.canPlaybackAudio) return
                // startAudio *must* be called in an click/tap handler.
                room.startAudio().then(() => {
                    log.warn("start playback audio")
                    // successful, UI can be removed now
                    if (btn) {
                        btn.classList.add("animate__slideOutLeft")
                        setTimeout(() => {
                            btn.classList.add("hidden")
                            btn.remove()
                        }, 500)
                    }
                });
            }
            btn.classList.remove("hidden")
        }
    });

    let i = 0
    // useMemo(() => {

    // }, [participants.length])
    useEffect(() => {
        setDelays(new Array(participants.length).fill(0))
    }, [participants.length])

    // 代码可能有问题，会造成许多定时器启动
    // useEffect(() => {
    //     // var _this = this as any
    //     if (process.env.PING_URL == undefined || process.env.PING_URL == "") return;
    //     else {
    //         console.log("set up")
    //         if (loop) {
    //             console.log("cleaning up");
    //             clearInterval(loop);
    //         }
    //         setLoop(
    //             setInterval(() => {
    //                 // debugger
    //                 if (participants.length > 0) {
    //                     getServerLatency(process.env.PING_URL as string, (delay) => {
    //                         // console.log(`lantency: ${delay}`)
    //                         const t = new Array(participants.length).fill(0)
    //                         t[0] = delay
    //                         setDelays(t)
    //                     })
    //                 }
    //             }, 5000))
    //     }
    // }, [participants.length])

    return (
        <div className='flex justify-center h-full w-full  mt-2'>
            <button className="btn hidden animate__animated bg-yellow-600 text-white  hover:bg-yellow-800 border-none" id="allowPlayBack">点击此按钮允许播放音频</button>
            <div className=' md:px-12  flex w-full md:w-3/4'>
                {
                    participants.map((participant, key) => {

                        let name = ""
                        if (i == 0) name += "(ME)"
                        i++;
                        // let { track } = useMediaTrack(Track.Source.Microphone, participant);
                        // let t : any= track?.mediaStream?.clone()
                        if (participant == undefined || participant.identity == "") {
                            return <div key={key} ></div>
                        }
                        return (
                            <div className='w-full px-4 sm:px-0 sm:w-auto' key={key}>
                                <MemberCard  participant={participant} isme={i == 1}></MemberCard>
                            </div>
                        )
                    })
                }
            </div >
            <div className='hidden sm:block rounded-xl overflow-hidden mr-12  text-center backdrop-blur-lg bg-transparent shadow-md' style={{ width: "600px", border: "1px solid #eaeefb", boxShadow: "rgba(57, 108, 124, 0.5) 0px 6px 18px 0px" }}>
                <ChatCard />
            </div>
        </div>
    );
}
