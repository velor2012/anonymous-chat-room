import * as React from 'react';
import { Fragment } from "react";
import { ScreenShareIcon } from '@/livekit-react-offical/assets/icons';
import { checkIsFlv, checkIsHLS } from '@/lib/client-utils';
import MyPlayer  from './MyPlayer'
export type VideoShareTileProps = React.HTMLAttributes<HTMLDivElement> & {
    sharedUrl:string,
    muted:boolean,
};

export const VideoShareTile = ({
  sharedUrl,
   muted,
  ...htmlProps
}: VideoShareTileProps) => {
    // React.useEffect(()=>{
    //     require("flv.js")
    // })
  const isFlv = React.useMemo(()=>{
    return checkIsFlv(sharedUrl)
  }, [sharedUrl])
  const isHLS = React.useMemo(()=>{
    return checkIsHLS(sharedUrl)
  }, [sharedUrl])
  return (
    <div style={{ position: 'relative' }} {...htmlProps}>
        <MyPlayer sharedUrl={sharedUrl}/>
    </div>
  );
};
