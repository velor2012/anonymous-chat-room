
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
import { theme } from '@/tools/setting';
log.setDefaultLevel(LogLevel.warn)

export function MeetingPanel(props: HTMLAttributes<HTMLSpanElement>) {
    const participants = useParticipants();
    const room = useRoomContext();
    room.removeAllListeners(RoomEvent.Connected)
    room.removeAllListeners(RoomEvent.AudioPlaybackStatusChanged)
    // console.log("MeetingPanel start")
    room.on(
        RoomEvent.Connected, () => {
            room.localParticipant.setMicrophoneEnabled(true)
        }
    ).on(RoomEvent.AudioPlaybackStatusChanged, () => {
        if (!room.canPlaybackAudio) {
            // log.warn("can't playback audio")
            const btn = document.getElementById("allowPlayBack");
            if (!btn) return
            btn.onclick = () => {
                if (room.canPlaybackAudio) return
                // startAudio *must* be called in an click/tap handler.
                room.startAudio().then(() => {
                    // log.warn("start playback audio")
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
            // 防止刚显示按钮，就突然可以播放了
            const timer = window.setTimeout(() => {
                if (!room.canPlaybackAudio) btn.classList.remove("hidden")
                btn.click()
            }, 2000)

            return () => {
                // console.log("cleaning timer");
                clearTimeout(timer)
            }

        }
    });

    let i = 0

    return (
        <div className="h-full w-full">
            <div className='flex h-full w-full flex-wrap justify-center sm:justify-normal mt-2'>
                <button className="btn hidden animate__animated bg-yellow-600 text-white  hover:bg-yellow-800 border-none" id="allowPlayBack">点击此按钮允许播放音频</button>
                <div className=' md:px-12 flex-wrap align-top flex w-3/4 sm:w-2/3 pt-2' style={{alignContent: "start"}}>
                    {
                        participants.map((participant, key) => {
                            let name = ""
                            if (i == 0) name += "(ME)"
                            i++;
                            if (participant == undefined || participant.identity == "") {
                                return <div key={key} ></div>
                            }
                            return (
                                <div className='w-full px-1 sm:px-4 sm:w-auto mb-2 h-fit' key={key}>
                                    <MemberCard participant={participant} isme={i == 1}></MemberCard>
                                </div>
                            )
                        })
                    }
                </div >
                <div id="chatcard" className='hidden h-2/3 sm:h-4/5 w-full sm:w-1/3 sm:pr-2  fixed sm:static   '>
                    <div className='px-2 mx-2 sm:mx-0  h-full  animate__animated animate__fadeIn sm:block rounded-xl  shadow-md' style={{ border: "1px solid #eaeefb", backgroundColor: theme.color1, boxShadow: "rgba(57, 108, 124, 0.5) 0px 6px 18px 0px" }}>
                        <ChatCard />
                    </div>
                </div>

                <div>
                    {
                        floatButton({
                            handleClick: () => {
                                const chatcard = document.getElementById("chatcard")
                                if (!chatcard) return
                                if (chatcard.classList.contains("hidden")) {
                                    chatcard.classList.remove("hidden")
                                } else {
                                    chatcard.classList.add("hidden")
                                }
                            }
                        })
                    }
                </div>
            </div>
        </div>
    );
}

type PropButton = {
    handleClick: MouseEventHandler<HTMLDivElement>
}

export function floatButton({ handleClick }: PropButton) {
    return (
        <div className="fixed  z-50 bottom-[8%] right-0 m-4" onClick={handleClick}>
            <button className="btn btn-circle btn-lg bg-yellow-600 text-white  hover:bg-yellow-800 border-none">
                <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2688" width="32" height="32"><path d="M512 64c259.2 0 469.333333 200.576 469.333333 448s-210.133333 448-469.333333 448a484.48 484.48 0 0 1-232.725333-58.88l-116.394667 50.645333a42.666667 42.666667 0 0 1-58.517333-49.002666l29.76-125.013334C76.629333 703.402667 42.666667 611.477333 42.666667 512 42.666667 264.576 252.8 64 512 64z m0 64C287.488 128 106.666667 300.586667 106.666667 512c0 79.573333 25.557333 155.434667 72.554666 219.285333l5.525334 7.317334 18.709333 24.192-26.965333 113.237333 105.984-46.08 27.477333 15.018667C370.858667 878.229333 439.978667 896 512 896c224.512 0 405.333333-172.586667 405.333333-384S736.512 128 512 128z m-157.696 341.333333a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m159.018667 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m158.997333 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z" fill="white" p-id="2689"></path></svg>
            </button>
        </div>
    )
}