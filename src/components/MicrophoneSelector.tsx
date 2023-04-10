import {
  useMediaDeviceSelect,
  useRoomContext,
} from "@livekit/components-react";
import { defaultConfig, getLocalStore } from "@/tools/utils";
import { useEffect, useMemo, useState } from "react";
import { MyConfig } from "@/types/global";

export function MicrophoneSelector() {
  const roomContext = useRoomContext();
  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({ kind: "audioinput", room: roomContext });
    const [conf, setConf] = useState<MyConfig | null>(null);
    const deviceId2label = useMemo(() => {
        const map = new Map<string, string>();
        devices.forEach((d) => {
            map.set(d.deviceId, d.label);
        });
        return map;
    }, [devices]);
    const [actIdx, setActIdx] = useState<number>(0);

    useEffect(() => {
        const st = getLocalStore()
        if(st!=null){
            const cf = st.getItem("config")
            if(cf != null || cf != undefined) setConf(JSON.parse(cf))
        }
    },[]);

  return (
    <div className="mx-2 flex flex-col items-center dropdown dropdown-top dropdown-end  relative ">
        <label tabIndex={0} className="btn border-none bg-yellow-600 text-white hover:bg-yellow-800">{devices.length > 0 && devices[actIdx].label}</label>
        <ul tabIndex={0} className=" bg-white dropdown-content menu p-2 shadow rounded-box w-100 text-black">
            {devices.map((m, k) => (
            <li className="bg-white" value={m.deviceId} key={k} onClick={
                ()=>{
                    debugger
                    roomContext.localParticipant.setMicrophoneEnabled(false);
                    let cf = defaultConfig
                    if (conf != null ){
                        cf = conf
                    }
                    roomContext.localParticipant.setMicrophoneEnabled(true, {
                        deviceId:m.deviceId,
                        ...cf
                    });
                    // setActiveMediaDevice(m.deviceId);
                    setActIdx(k)
                }
            }>
              <a>{m.label}</a>
            </li>
          ))}
        </ul>

      {/* <div className="flex items-center">
        <select
          onChange={(e) => {
            setActiveMediaDevice(e.currentTarget.value);
          }}
          value={activeDeviceId}
          className="select select-sm w-full sm:max-w-[200px] max-w-[100px] m-2 select-none"
        >
          <option value={-1} disabled>
            Choose your microphone
          </option>
          {devices.map((m) => (
            <option value={m.deviceId} key={m.deviceId}>
              {m.label}
            </option>
          ))}
        </select>
      </div> */}

    </div>
  );
}
