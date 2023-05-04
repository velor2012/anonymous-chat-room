import { useObservableState } from "@/livekit-react-offical/hooks/internal";
import { useEffect, useState } from "react";
import { curState$ } from "../observe/CurStateObs";

export function useCurState() {
    const mcurState = useObservableState(curState$, {
        join: false,
        isAdmin: false
    });
    return mcurState
}

