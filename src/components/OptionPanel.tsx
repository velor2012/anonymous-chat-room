import { getLocalStore } from "@/tools/utils";

import { useEffect, useMemo, useState } from "react";
type MyConfig = {
    channelCount: number,
    echoCancellation: boolean,
    noiseSuppression: boolean,
    autoGainControl: boolean,
}
// TODO需要在此页面添加设置密码的选项
export function OptionPanel() {
    const [config, setConfig] = useState<MyConfig | null>(null);
    useEffect(() => {
        let store = getLocalStore();
        if (store == undefined) return;
        const str_config = store.getItem("config");

        if (str_config != undefined){
            setConfig(JSON.parse(str_config))
        }else{
            setConfig({
                channelCount: 2,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            })
        }
    },[]);
    
  return (
    <div className=" flex text-center justify-center items-center ">
        <label htmlFor="optionModel" className="btn  border-none bg-yellow-600 text-white hover:bg-yellow-800">修改设置</label>

        <input type="checkbox" id="optionModel" className="modal-toggle" />
        <div className="modal">
        <div className="modal-box relative">
            <label htmlFor="optionModel" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
            
            <div className="px-4">
                <div className="form-control">
                <label className="label cursor-pointer justify-around">
                    <span className="label-text">噪声抑制</span> 
                    <input type="checkbox" checked={config ?config.noiseSuppression:true}  onChange={(v)=>{
                        if (config == null) return;
                        const new_config = {...config};
                        new_config.noiseSuppression = v.target.checked;
                        setConfig(new_config);
                        let store = getLocalStore();
                        store?.setItem("config", JSON.stringify(new_config))
                    }} className="checkbox" />
                </label>
                </div>
                <div className="form-control">
                <label className="label cursor-pointer justify-around">
                    <span className="label-text" >声音增强</span> 
                    <input type="checkbox" checked={config ?config.autoGainControl:true} onChange={(v)=>{
                        if (config == null) return;
                        const new_config = {...config};
                        new_config.autoGainControl = v.target.checked;
                        setConfig(new_config);
                        let store = getLocalStore();
                        store?.setItem("config", JSON.stringify(new_config))
                    }}  className="checkbox" />
                </label>
                </div>
                <div className="form-control">
                <label className="label cursor-pointer justify-around">
                    <span className="label-text">回声消除</span> 
                    <input type="checkbox" checked={config ?config.echoCancellation:true}  onChange={(v)=>{
                        if (config == null) return;
                        const new_config = {...config};
                        new_config.echoCancellation = v.target.checked;
                        setConfig(new_config);
                        let store = getLocalStore();
                        store?.setItem("config", JSON.stringify(new_config))
                        // console.log("update!~")
                    }}  className="checkbox" />
                </label>
                </div>
            </div>

        </div>
        </div>
    </div>

  );
}
