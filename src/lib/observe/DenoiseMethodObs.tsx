
import { BehaviorSubject, Subject, scan, map, takeUntil } from 'rxjs';
import {DenoiseMethod } from '../types';


export const denoiseMethod$ = new Subject<DenoiseMethod>();
