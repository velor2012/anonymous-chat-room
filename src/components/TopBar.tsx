import { useEffect, useMemo, useState } from 'react';
import LocalRecorderComponent from './Record/LocalRecoder';
import React from 'react';
import { RoomInfo } from './RoomInfo';
import { useCurState } from '@/lib/hooks/useCurState';
import { useRoomInfo } from '@/lib/hooks/useRoomInfo';
import { isMobileBrowser } from '@livekit/components-core';
import { useRouter } from 'next/router';
import { useTranslation, Trans } from 'react-i18next'
import LanguageIcon from './Icons/LanguageIcon';
import { MyInfoToast } from './Toast';
export interface TopBarProps extends React.HTMLAttributes<SVGElement> {
  roomName?: string;
}
export default function TopBar() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [TostMsg, setTostMsg] = useState<string>("");
  const [TostTimer, setTostTimer] = useState<any>(null);

const roominfo_after_enter = useRoomInfo()

const router = useRouter();
const mcurState = useCurState()
const { t, i18n } = useTranslation()

const switchLanguage = () => {
    i18n.changeLanguage(i18n.language=='en'?'zh':'en')
    setTostMsg(i18n.language=='zh'?'切换为中文':'Switch to English')
    if(TostTimer != null){
        setShowToast(false)
        clearTimeout(TostTimer)
    }
    setShowToast(true)
    const mTostTimer = setTimeout(() => {
        setShowToast(false)
    }, 1000);
    setTostTimer(mTostTimer)
  };

useEffect(() => {
    setIsMobile(isMobileBrowser())
}, [mcurState.join]);
const isjoin = useMemo(() => {
    return mcurState.join
}, [mcurState.join])

  const recordingChange = (r: boolean) => {
    setIsRecording(r);
  };
  const humanRoomName = useMemo(() => {
    return roominfo_after_enter && roominfo_after_enter.room_name ? decodeURI(roominfo_after_enter.room_name) : undefined;
  }, [roominfo_after_enter.room_name]);
  return (
    <div className="navbar flex fixed h-16 bg-base-100 bg-transparent z-10 backdrop-blur-lg">
      <div className="flex-1 z-10">
          <span className="btn btn-ghost normal-case text-xl"
          onClick={()=>{
            // console.log("go home")
            const el = document.getElementsByClassName("lk-disconnect-button")[0]
            if(!el) {
                router.push('/');
                return
            }
            // console.log("click")
            // 创建一个新的鼠标点击事件
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            
            // 分派（dispatch）点击事件到元素
            el.dispatchEvent(clickEvent);
        }}
          >
            <svg
              className="icon text-primary-focus"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="2746"
              width="32"
              height="32"
            >
              <path
                d="M947.2 422.4L572.8 115.2c-32-25.6-86.4-25.6-118.4 0L76.8 425.6c-12.8 6.4-16 22.4-9.6 35.2 3.2 12.8 16 19.2 28.8 19.2h32v364.8C128 892.8 163.2 928 211.2 928H416c19.2 0 32-12.8 32-32v-147.2c0-22.4 35.2-44.8 64-44.8 28.8 0 67.2 22.4 67.2 44.8V896c0 19.2 12.8 32 32 32h208c48 0 80-32 80-83.2V480h32c12.8 0 25.6-9.6 28.8-22.4 3.2-12.8 0-25.6-12.8-35.2z"
                fill="currentColor"
                p-id="2747"
              ></path>
            </svg>
          </span>
      </div>
      <div className=" absolute w-full text-center flex justify-center">
        {isjoin && !isMobile && humanRoomName && (
          <div>
            <span className=' text-xl sm:text-3xl font-bold'> { t('room.roomName') + ': ' + humanRoomName}</span>
          </div>
        )}
      </div>


        {/* Language Switch */}
        <div className=" animate__animated  animate__fadeIn">
        <div className="btn btn-ghost normal-case  text-center text-xl " onClick={switchLanguage}>
            <LanguageIcon className='icon  text-primary-focus' fill="currentColor"/>
        </div>
        </div>

      <div className="flex-none z-10">
        {/* The button to open record modal */}
        {
            !isMobile && 
            (
                <label
                htmlFor="topBarModal"
                className="btn btn-ghost normal-case  text-center text-xl"
                >
                    <svg className="icon  text-primary-focus" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2607" width="32" height="32"><path fill={isRecording? "red" : "currentColor"} d="M943.488 260c-10.176-5.632-22.592-5.312-32.48 0.864L800 330.368 800 288c0-52.928-43.072-96-96-96L160 192C107.072 192 64 235.072 64 288l0 448c0 52.928 43.072 96 96 96l544 0c52.928 0 96-43.072 96-96l0-38.88 111.648 66.368C916.672 766.496 922.336 768 928 768c5.472 0 10.912-1.408 15.808-4.192C953.824 758.112 960 747.488 960 736L960 288C960 276.352 953.696 265.632 943.488 260zM256 448c-35.296 0-64-28.704-64-64s28.704-64 64-64 64 28.704 64 64S291.296 448 256 448z"  p-id="2608"></path></svg>
                </label>
            )
        }

        {/* 房间信息 */}
        {isjoin && humanRoomName && (
            <div className=" animate__animated  animate__fadeIn">
            <label htmlFor="infoModal" className="btn btn-ghost normal-case  text-center text-xl ">
                <svg  className="icon text-primary-focus" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3570" width="32" height="32"><path fill="currentColor" d="M512 97.52381c228.912762 0 414.47619 185.563429 414.47619 414.47619s-185.563429 414.47619-414.47619 414.47619S97.52381 740.912762 97.52381 512 283.087238 97.52381 512 97.52381z m36.571429 341.333333h-73.142858v292.571428h73.142858V438.857143z m0-121.904762h-73.142858v73.142857h73.142858v-73.142857z" p-id="3571"></path></svg>
            </label>
            </div>
        )}

        {/* Put this part before </body> tag */}
        <input type="checkbox" id="topBarModal" className="modal-toggle" />
        <div className="modal h-screen">
          <div
            className="modal-box max-w-[1000px] max-h-[100%] bg-neutral-content"
          >
            <label
              htmlFor="topBarModal"
              className="btn btn-sm btn-circle absolute right-2 top-2 bg-transparent border-none cursor-pointer hover:bg-black hover:bg-opacity-10 text-accent-focus"
            >
              ✕
            </label>
            <LocalRecorderComponent
              recordingChange={recordingChange}
            ></LocalRecorderComponent>
          </div>
        </div>

        {isjoin && humanRoomName && (
        <div>
            <input type="checkbox" id="infoModal" className="modal-toggle" />
            <label htmlFor='infoModal' className="modal h-screen">
            <label
                className="modal-box relative bg-primary"
                htmlFor=''
            >

                <div>
                    <RoomInfo roomName={humanRoomName} join={isjoin}/>
                    <div className=' divider'></div>
                    <span className=' text-lg'>{ t('room.isAdmin') + ": " + (mcurState.isAdmin ? "yes": "no")}</span>
                    <br/>
                    <span className=' text-lg'>{  t('room.passwd') + ": " + (roominfo_after_enter.passwd? roominfo_after_enter.passwd: "no passwd")}</span>
                    <br/>
                </div>

            </label>
            </label>
        </div>
        )}
      </div>

        {/* toast */}
        {
        showToast && <MyInfoToast>
            {TostMsg}
        </MyInfoToast>
      }
    </div>
  );
}