import { useObservableState } from "@/livekit-react-offical/hooks/internal";
import { RoomInfo } from "@/pages/api/info";
import { useCallback, useEffect, useMemo, useState } from "react";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
import { roominfo$ } from "../lib/observe/RoomInfoObs";
import { curState, curState$ } from "@/lib/observe/CurStateObs";
import { useRoomInfo } from "@/lib/hooks/useRoomInfo";
import { useTranslation } from "react-i18next";

type Props = {
    roomName: string;
    join?: boolean
};

const DEFAULT_ROOM_INFO: RoomInfo = { num_participants: 0, hasPasswd: false, maxParticipants: 0 };

export function RoomInfo({ roomName, join }: Props) {
    const [roomInfo, setRoomInfo] = useState<RoomInfo>(DEFAULT_ROOM_INFO);
    const roominfo_after_enter = useRoomInfo()
    const { t, i18n } = useTranslation()
    const cs : curState = {
        join: false,
        isAdmin: false,
        hassPass: false
    }
    
    const fetchRoomInfo = useCallback(async () => {
            const res = await fetch(`/api/info?roomName=${roomName}`);
            const _roomInfo = (await res.json()) as RoomInfo;
            
            setRoomInfo(_roomInfo);
            if(_roomInfo.hasPasswd != roomInfo.hasPasswd){
                curState$.next({...cs, hassPass: _roomInfo.hasPasswd})
            }
        // }
    }, [roomName]);

    const humanRoomName = useMemo(() => {
        return decodeURI(roomName);
    }, [roomName]);
    
    useEffect(() => {
        if(!roomName) return
        if(join != undefined && join) {
            setRoomInfo({num_participants: roominfo_after_enter.participant_num,
                hasPasswd: roominfo_after_enter.passwd != undefined &&  roominfo_after_enter.passwd != "",
                maxParticipants: roominfo_after_enter.max_participant_num
            })
        }else{
            fetchRoomInfo()
            const interval = setIntervalAsync(fetchRoomInfo, 5000);
            return () => {
                clearIntervalAsync(interval);
            };
        }
    }, [join, roominfo_after_enter, fetchRoomInfo]);
    
    if(!roomName) return null

    return (
        <div className="flex justify-around w-full">

            <div className="flex flex-col items-center">
                <span className="text-lg">
                {t('room.roomName')}
                </span>

                <span className=" font-bold text-6xl font-mono">{humanRoomName}</span>

            </div>

            <div className="pl-2  flex flex-col items-center">
                <span className="text-lg">
                {t('room.membersNum')}
                </span>

                <span className=" text-6xl font-mono countdown">
                    <span  style={{ "--value": roomInfo? roomInfo.num_participants: 0 } as any}></span>
                </span>
            </div>

            {
                roomInfo.maxParticipants > 0 && (
                <div className="pl-2  flex flex-col items-center">
                    <span className="text-lg">
                        {t('room.capacity')}
                    </span>

                    <span className=" text-6xl font-mono countdown">
                        <span  style={{ "--value": roomInfo.maxParticipants } as any}></span>
                    </span>
                </div>
                )
            }

            {
            roomInfo.hasPasswd && (
                <div className="pl-2 flex flex-col justify-center items-center">
                    <span className="text-lg text-primary ">
                        ⚠️ {t('room.needPasswd')}
                    </span>
                </div>
            )}
        </div>
    );
}