
import React, { Component } from 'react';
import { useRouter } from 'next/router'
import {
    ConnectionDetails,
    ConnectionDetailsBody,
} from "@/pages/api/connection_details";
import { Track } from 'livekit-client';
// import {AudioConference} from "@/components/TestCom"
// import { LiveKitRoom } from "@livekit/components-react";
import { LiveKitRoom, AudioConference, StartAudio } from "@livekit/components-react";
import { useCallback, useEffect, useMemo, useState } from "react"
import { WebAudioContext } from '@/tools/webAudio';
import { RoomInfo } from '@/components/RoomInfo';
import { UsernameInput } from '@/components/UsernameInput';
import { toast, Toaster } from "react-hot-toast";
import { BottomBar } from '@/components/BottomBar';
import { Room as LRoom } from 'livekit-client';
import { MeetingPanel } from '@/components/MeetingPanel';
import { getLocalStore } from '@/tools/utils';
import { theme } from '@/tools/setting';
// TODO需要在此页面验证密码
export default function Room() {
    const [connectionDetails, setConnectionDetails] =
        useState<ConnectionDetails | null>(null);
    const [isCheckLocalStroe, setIsCheckLocalStroe] = useState<boolean>(false);
    const router = useRouter()
    // const [roomId, setRoomId] = useState<string>(router.query.roomId as string);

    // const [room] = useState(new LRoom());
    let username= router.query.username as string | undefined
    const roomId = router.query.roomId as string
    const [store, setStore] = useState<Storage | null>(null);

    useEffect(() => {
        async function fetchData() {
            let store = getLocalStore() as Storage;
            if(store == undefined ){
                debugger
            }
            if( roomId == undefined) return;
            setStore(store)
            let str_latest_info =  store.getItem("latest_info")
            let cond = false;
            if(str_latest_info != undefined){
                let latest_info: ConnectionDetails = JSON.parse(str_latest_info)
                if(latest_info.time > Date.now() - 1000 * 60 * 10 && roomId == latest_info.roomId && 
                (latest_info.username == username || username == undefined || username == "") ){
                    cond = true
                    setConnectionDetails(latest_info)
                }
            }
            if(cond == false && username != undefined && username != "" ){
                try {
                    const connectionDetails = await requestConnectionDetails(
                        username as string
                    );
                    setConnectionDetails(connectionDetails);
                } catch (e: any) {
                    toast.error(e);
                }
            }
            setIsCheckLocalStroe(true)
        }
        fetchData();
      }, [roomId]);

    const requestConnectionDetails = useCallback(
        async (username: string) => {
            const body: ConnectionDetailsBody = {
                roomId,
                username,
            };
            const response = await fetch("/api/connection_details", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (response.status === 200) {
                return response.json();
            }

            const { error } = await response.json();
            throw error;
        },
        [roomId]
    );

    if (!roomId || !isCheckLocalStroe) {
        return (<div className='w-screen h-screen flex flex-col items-center justify-center pt-10'></div>);
    }

    // If we don't have any connection details yet, show the username form
    if (connectionDetails === null) {

        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center pt-10">
                <Toaster />
                <div>
                    <RoomInfo roomName={roomId} />
                    <div className="divider mb-10"></div>
                    <UsernameInput
                        submitText="Join Room"
                        onSubmit={async (username) => {
                            try {
                                const connectionDetails = await requestConnectionDetails(
                                    username
                                );
                                setConnectionDetails(connectionDetails);
                            } catch (e: any) {
                                toast.error(e);
                            }
                        }}
                    />
                </div>
            </div>
        );
    }

    // save user profile
    const l = store?.getItem("latest_info")
    const ll = l && JSON.parse(l)
    if(ll == undefined || ll == null ||  ll.username != connectionDetails.username || ll.roomId != connectionDetails.roomId){
        console.log("record latest_info")
        store?.setItem("latest_info", JSON.stringify(connectionDetails))
        const str_store_history = store?.getItem("history")
        if(str_store_history){
            const store_history: Array<ConnectionDetails> = JSON.parse(str_store_history)
            while(store_history.length > 3){
                store_history.shift()
            }
            store_history.push(connectionDetails)
            store?.setItem("history", JSON.stringify(store_history)) 
        }else{
            store?.setItem("history", JSON.stringify([connectionDetails]))
        }
    }
    
    // Show the room UI
    return (
        <div className="w-screen h-screen">
            <LiveKitRoom
            className='pt-16'
            style={{height: "90%"}}
                token={connectionDetails.token}
                serverUrl={connectionDetails.ws_url}
                connect={true}
                connectOptions={{ autoSubscribe: true }}
                // options={{ expWebAudioMix: { audioContext } }}
            >
                    <div className="flex h-full">
                             <MeetingPanel/>
                            {/*<AudioConference/> */}
                    </div>

                {/* <div className="fixed bottom-0  w-full flex justify-center items-center" style={{backgroundColor: "#5A9367"}}> */}
                <div className="fixed bottom-0  w-full flex justify-center items-center border-t-2" style={{backgroundColor: theme.color3}}>
                    <BottomBar />
                </div>
            </LiveKitRoom>
        </div>
    );
}
