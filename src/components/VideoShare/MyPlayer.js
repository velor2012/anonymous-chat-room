import DPlayer  from "react-dplayer";
import React, { useState } from 'react';
import { checkIsFlv, checkIsHLS } from '@/lib/client-utils';

function MyPlayer(props) {
  const isFlv = React.useMemo(()=>{
    return checkIsFlv(props.sharedUrl)
  }, [props.sharedUrl])
  const isHLS = React.useMemo(()=>{
    return checkIsHLS(props.sharedUrl)
  }, [props.sharedUrl])

  return (
    <DPlayer
    options={{
        live: isFlv || isHLS ? true: false,
        autoplay: true,
        video:{url: props.sharedUrl}
    }} 
/>
  );
}

export default MyPlayer;