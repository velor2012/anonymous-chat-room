import Image from "next/image";
import React from "react";

export const PoweredByLiveKit = () => {
  return (
    <div className="h-full">
      <a
        target="_blank"
        className="flex sm:flex-row flex-col items-center justify-center h-full"
        rel="noreferrer"
        href="https://livekit.io"
      >
        <div className="text-md text-fuchsia-400 sm:mr-2 mr-0">Powered by</div>
        <div className=" h-[20px] w-[60px] relative">
          <Image
            alt="livekit logo"
            style={{ objectFit: "contain" }}
            fill={true}
            src="/livekit/logo.svg"
          />
        </div>
      </a>
    </div>
  );
};
