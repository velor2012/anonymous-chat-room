import { useObservableState } from "@/livekit-react-offical/hooks/internal";
import { roominfo$ } from "../observe/RoomInfoObs";

export function useRoomInfo() {
    const roominfo_after_enter = useObservableState(roominfo$, {
        room_name:"",
        participant_num:0,
        max_participant_num: -1
    });
    return roominfo_after_enter
}
