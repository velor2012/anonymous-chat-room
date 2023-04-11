import { RoomInfo } from "@/pages/api/room_info/[roomId]";
import { theme } from "@/tools/setting";
import { useCallback, useEffect, useMemo, useState } from "react";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";

type Props = {
    roomName: string;
};

const DEFAULT_ROOM_INFO: RoomInfo = { num_participants: 0, hasPasswd: false };

export function RoomInfo({ roomName }: Props) {
    const [roomInfo, setRoomInfo] = useState<RoomInfo>(DEFAULT_ROOM_INFO);

    const fetchRoomInfo = useCallback(async () => {
        const res = await fetch(`/api/room_info/${roomName}`);
        const roomInfo = (await res.json()) as RoomInfo;
        setRoomInfo(roomInfo);
    }, [roomName]);

    const humanRoomName = useMemo(() => {
        return decodeURI(roomName);
    }, [roomName]);

    useEffect(() => {
        fetchRoomInfo();
        const interval = setIntervalAsync(fetchRoomInfo, 3000);
        return () => {
            clearIntervalAsync(interval);
        };
    }, [fetchRoomInfo]);

    return (
        <div className="flex justify-around w-full">

            <div className="flex flex-col items-center">
                <span className="text-lg">
                    房间名
                </span>

                <span className=" text-6xl font-mono">{humanRoomName}</span>

            </div>

            <div className="pl-2  flex flex-col items-center">
                <span className="text-lg">
                    当前人数
                </span>

                <span className=" text-6xl font-mono countdown">
                    <span  style={{ "--value": roomInfo.num_participants } as any}></span>
                </span>
            </div>

            {
            roomInfo.hasPasswd && (
                <div className="pl-2 flex flex-col justify-center items-center">
                    <span className="text-lg" style={{color: theme.color4}}>
                        ⚠️ 需要密码
                    </span>
                </div>
            )}
        </div>
    );
}
