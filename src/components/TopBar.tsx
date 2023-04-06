import { useMemo, useState } from 'react';
import { Router, useRouter } from 'next/router';
import { theme } from '@/tools/setting';
import Link from 'next/link';
import LocalRecorderComponent from './func/LocalRecoder';
import React from 'react';
export interface TopBarProps extends React.HTMLAttributes<SVGElement> {
  roomName?: string;
}
export default function TopBar() {
  const router = useRouter();
  const roomId = router.query.roomId as string;
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleHomeClick = () => {
    router.push('/');
  };
  const recordingChange = (r: boolean) => {
    setIsRecording(r);
  };
  const humanRoomName = useMemo(() => {
    return roomId ? decodeURI(roomId) : undefined;
  }, [roomId]);
  return (
    <div className="navbar flex fixed bg-base-100 bg-transparent z-10 backdrop-blur-lg">
      <div className="flex-1 z-10">
        <Link href="/">
          <span className="btn btn-ghost normal-case text-xl">
            <svg
              className="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="2746"
              width="32"
              height="32"
            >
              <path
                d="M947.2 422.4L572.8 115.2c-32-25.6-86.4-25.6-118.4 0L76.8 425.6c-12.8 6.4-16 22.4-9.6 35.2 3.2 12.8 16 19.2 28.8 19.2h32v364.8C128 892.8 163.2 928 211.2 928H416c19.2 0 32-12.8 32-32v-147.2c0-22.4 35.2-44.8 64-44.8 28.8 0 67.2 22.4 67.2 44.8V896c0 19.2 12.8 32 32 32h208c48 0 80-32 80-83.2V480h32c12.8 0 25.6-9.6 28.8-22.4 3.2-12.8 0-25.6-12.8-35.2z"
                fill={theme.color4}
                p-id="2747"
              ></path>
            </svg>
          </span>
        </Link>
      </div>
      <div className=" absolute w-full text-center flex justify-center">
        {humanRoomName && (
          <div>
            <span className=' text-3xl font-bold'>房间 {humanRoomName}</span>
          </div>
        )}
      </div>
      <div className="flex-none z-10">
        {/* The button to open modal */}
        <label
          htmlFor="topBarModal"
          className="btn btn-ghost normal-case  text-center text-xl"
        >
          {isRecording && (
            <svg
              width="12"
              height="12"
              className="icon mr-2"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="2309"
            >
              <path
                d="M512 1024c282.833455 0 512-229.166545 512-512S794.833455 0 512 0 0 229.166545 0 512s229.166545 512 512 512z"
                fill="red"
                p-id="2310"
              ></path>
            </svg>
          )}
          录制
        </label>

        {/* Put this part before </body> tag */}
        <input type="checkbox" id="topBarModal" className="modal-toggle" />
        <div className="modal">
          <div
            className="modal-box max-w-[1000px] max-h-[100%]"
            style={{ backgroundColor: theme.color3 }}
          >
            <label
              htmlFor="topBarModal"
              className="btn btn-sm btn-circle absolute right-2 top-2 bg-transparent border-none hover:bg-white hover:bg-opacity-10"
              style={{ color: theme.color4 }}
            >
              ✕
            </label>
            <LocalRecorderComponent
              recordingChange={recordingChange}
            ></LocalRecorderComponent>
          </div>
        </div>
      </div>
    </div>
  );
}
