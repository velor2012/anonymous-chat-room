
import { BehaviorSubject, Subject, scan, map, takeUntil } from 'rxjs';
export type VolumesForParticipant = {
    participantId: string
    volume: number
}

export const volumes$ = new BehaviorSubject<VolumesForParticipant>({
    participantId: "",
    volume: 1
});
