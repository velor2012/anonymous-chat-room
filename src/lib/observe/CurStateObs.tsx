
import { BehaviorSubject, Subject, scan, map, takeUntil } from 'rxjs';
import { RoomMetadata } from '../types';
export type curState = {
    join: boolean
    isAdmin: boolean,
    roomName?: string,
    hassPass?: boolean,
    roomMetadata?: RoomMetadata
}

export const curState$ = new Subject<curState>();
