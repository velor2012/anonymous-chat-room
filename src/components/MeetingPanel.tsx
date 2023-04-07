
import React, { HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { LocalParticipant, ParticipantEvent, RoomEvent, Track } from 'livekit-client';
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

export function MeetingPanel(props: HTMLAttributes<HTMLSpanElement>) {
    const participants = useParticipants();
    const [delays, setDelays] = useState<number[]>([])
    const [delayme, setDelaysMe] = useState<number>(0)
    const [loop, setLoop] = useState<any>(null);
    const room = useRoomContext();
    
    room.on(
        RoomEvent.Connected,()=>{
            room.localParticipant.setMicrophoneEnabled(true)
        }
    )
    let i = 0
    // useMemo(() => {

    // }, [participants.length])
    useEffect(() => {
        setDelays(new Array(participants.length).fill(0))
    }, [participants.length])
    useEffect(() => {
        // var _this = this as any
        if (process.env.PING_URL == undefined || process.env.PING_URL == "")  return;
        else{
            console.log("set up")
            if(loop){
                console.log("cleaning up");
                clearInterval(loop);
            }
            setLoop(
                setInterval(() => {
                    // debugger
                    if (participants.length > 0) {
                        getServerLatency(process.env.PING_URL as string, (delay) => {
                            console.log(`lantency: ${delay}`)
                            const t = new Array(participants.length).fill(0)
                            t[0] = delay
                            setDelays(t)
                        })
                    }
                }, 5000))
        }
    }, [participants.length])

    return (
        <div className='flex justify-center h-full w-full  mt-2'>
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
                                <MemberCard delays={delays} idx={key} participant={participant} isme={i == 1}></MemberCard>
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
