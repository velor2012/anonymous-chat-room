
import { BehaviorSubject, Subject, scan, map, takeUntil } from 'rxjs';
export type RoomInfoUseForParticipant = {
    participant_num: number
    room_name: string
    passwd?: string
    max_participant_num: number
}

export const roominfo$ = new BehaviorSubject<RoomInfoUseForParticipant>({
    room_name:"",
    participant_num:0,
    max_participant_num: -1
});
