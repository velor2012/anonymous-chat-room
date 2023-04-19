import { useEffect, useState } from "react";

export function useMainBrowser() {
    const [isMainBrowser, setIsMainBrowser] = useState(false);
    useEffect(()=>{
        const  DetectRTC = require('detectrtc');
        if(DetectRTC.browser.isChrome || DetectRTC.browser.isFirefox || DetectRTC.browser.isEdge) setIsMainBrowser(true)
        else setIsMainBrowser(false)    
    })
    return isMainBrowser
}