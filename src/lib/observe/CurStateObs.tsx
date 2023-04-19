
import { BehaviorSubject, Subject, scan, map, takeUntil } from 'rxjs';
export type curState = {
    join: boolean
    isAdmin: boolean,
    roomName?: string,
    hassPass?: boolean,
}

export const curState$ = new Subject<curState>();
