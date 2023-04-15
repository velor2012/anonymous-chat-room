import { useObservableState } from "@/lib/livekit-react-offical/hooks/internal";
import { roominfo$ } from "@/lib/observe/RoomInfoObs";
import { RoomMetadata } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";
type MyConfig = {
    channelCount: number,
    echoCancellation: boolean,
    noiseSuppression: boolean,
    autoGainControl: boolean,
}
// TODO需要在此页面添加设置密码的选项
export function OptionPanel() {
    const [config, setConfig] = useState<MyConfig | null>({
        channelCount: 2,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
    });
    const roominfo_after_enter = useObservableState(roominfo$, {
        room_name:"",
        participant_num:0,
        max_participant_num: -1
    });
    const [passwd, setPasswd] = useState("");
    const [capacity, setCapacity] = useState("");
    const isnumber = (nubmer: string) => {
        const re = /^[1-9]\d*$/;//判断字符串是否为数字//判断正整数/[1−9]+[0−9]∗]∗/ 
        if (!re.test(nubmer)) {
            return false
        }
        return true
    }
    const isnumber2 = (nubmer: string) => {
        const re = /^[1-9]\d?$/;//判断字符串是否为数字//判断正整数/[1−9]+[0−9]∗]∗/ 
        if (!re.test(nubmer)) {
            return false
        }
        return true
    }

    const handleSubmit = (e: any)=>{
        // TODO 设置metadata,同时在prejoin的时候检查密码
        debugger
        if(roominfo_after_enter.room_name == undefined && roominfo_after_enter.room_name == "") return
        updateRoomMeta(roominfo_after_enter.room_name).catch(e=>{
            console.log(e)
            // setShowError(true)
            // setErrorMsg(e)
            // setTimeout(() => {
            //     router.push('/');
            // }, 2000);
        })
        if (capacity !== "" && !isnumber(capacity)) {
            alert("please type a number or leave it blank")
            e.preventDefault();
        }
        if (capacity !== "" && !isnumber2(capacity)) {
            alert("please type a number smaller than 100 or leave it blank")
            e.preventDefault();
        }
    }

    const updateRoomMeta = useCallback(
        async (roomName: string) => {
            const url = '/api/roomMetadata'
            if(roomName === undefined) return undefined
            if(!url) return undefined
            const body = {
                metadata: {
                    passwd: passwd,
                    time: new Date().getTime(),
                    maxParticipants: Number(capacity)
                } as RoomMetadata,
                roomName: roomName
            };
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (response.status === 200) {
                return await response.json();
            }
    
            const { error } = await response.json();
            throw error;
        },
        [roominfo_after_enter.room_name, passwd, capacity]
    );


    return (
        <div className=" flex text-center justify-center items-center ">
            <label htmlFor="optionModel" className="btn  border-none btn-primary text-white">Setting</label>

            <input type="checkbox" id="optionModel" className="modal-toggle" />
            <div className="modal ">
                <div className="modal-box relative bg-primary">
                    <label htmlFor="optionModel" className="btn btn-accent btn-sm btn-circle absolute right-2 top-2 ">✕</label>

                    <div className="pl-4 pr-12">
                        <div className="form-control">
                            <label className="label cursor-pointer justify-between">
                                <span className="label-text text-white sm:text-lg">设置密码</span>
                                <input
                                    className=" w-[10rem] input-sm sm:input-md rounded-lg border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus: ring-secondary-focus"
                                    id="passwd"
                                    name="passwd"
                                    type="text"
                                    placeholder="set room passwd"
                                    onChange={(inputEl) => setPasswd(inputEl.target.value)}
                                    autoComplete="off"
                                />
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer justify-between">
                                <span className="label-text text-white sm:text-lg">房间容量</span>
                                <input
                                    className=" w-[10rem] input-sm sm:input-md rounded-lg border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus: ring-secondary-focus"
                                    id="capacity"
                                    name="capacity"
                                    type="text"
                                    placeholder="set room capacity"
                                    onChange={(inputEl) => {
                                        setCapacity(inputEl.target.value)
                                    }}
                                    autoComplete="off"
                                />
                            </label>
                        </div>
                    </div>
                    <label  htmlFor="optionModel" className="btn btn-secondary border-none mt-2" onClick={handleSubmit}>
                        Done
                    </label>
                </div>
            </div>
        </div>

    );
}