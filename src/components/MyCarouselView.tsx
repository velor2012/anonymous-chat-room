import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import * as React from 'react';
import { useSize } from '@/livekit-react-offical/hooks/internal';
import { useVisualStableUpdate } from '@/livekit-react-offical/hooks/useVisualStableUpdate';
import { TrackLoop } from './MyTrackLoop';
import LeftIcon from './Icons/LeftIcon';

const MIN_HEIGHT = 130;
const MIN_WIDTH = 140;
const MIN_VISIBLE_TILES = 1;
const ASPECT_RATIO = 16 / 10;
const ASPECT_RATIO_INVERT = (1 - ASPECT_RATIO) * -1;

export interface CarouselViewProps extends React.HTMLAttributes<HTMLMediaElement> {
  tracks: TrackReferenceOrPlaceholder[];

  /** Place the tiles vertically or horizontally next to each other.
   * If undefined orientation is guessed by the dimensions of the container. */
  orientation?: 'vertical' | 'horizontal';
}

export function CarouselView({ tracks, orientation, ...props }: CarouselViewProps) {
  const asideEl = React.useRef<HTMLDivElement>(null);
  const asideEl2 = React.useRef<HTMLDivElement>(null);

  const { width, height } = useSize(asideEl);
  const carouselOrientation = orientation
    ? orientation
    : height >= width
    ? 'vertical'
    : 'horizontal';
  const tileHeight = Math.max(width * ASPECT_RATIO_INVERT, MIN_HEIGHT);
  const tileWidth = Math.max(height * ASPECT_RATIO, MIN_WIDTH);

  const maxVisibleTiles =
    carouselOrientation === 'vertical'
      ? Math.max(Math.floor(height / tileHeight), MIN_VISIBLE_TILES)
      : Math.max(Math.floor(width / tileWidth), MIN_VISIBLE_TILES);

  const sortedTiles = useVisualStableUpdate(tracks, maxVisibleTiles);

  React.useLayoutEffect(() => {
    if (asideEl.current) {
      asideEl.current.dataset.lkOrientation = carouselOrientation;
      asideEl.current.style.setProperty('--lk-max-visible-tiles', maxVisibleTiles.toString());
    }
  }, [maxVisibleTiles, carouselOrientation]);
  const toggle = ()=>{
    asideEl2.current?.classList.toggle('hidden')
    const lefti = document.getElementById('lefticon')
    lefti?.classList.toggle('rotate180')
    const els = document.getElementsByClassName('lk-focus-layout')
    if(asideEl2.current?.classList.contains('hidden')){
        for(let i=0;i<els.length;i++){
          els[i].setAttribute('style','grid-template-columns: 0fr 50fr;')
        }
    }else{
        for(let i=0;i<els.length;i++){
            els[i].removeAttribute('style')
        }
    }
  }
  return (
    <div className=' relative'>
        <div  ref={asideEl2} className=' w-full h-full'>
            <aside key={carouselOrientation} className="lk-carousel h-full w-full" ref={asideEl} {...props}>
            {props.children ?? <TrackLoop tracks={sortedTiles} />}
            </aside>
        </div>
        <button className=' btn-primary rounded-md w-6 h-12 absolute -right-1 top-1/2 flex justify-center items-center'>
            <LeftIcon id="lefticon"  onClick={toggle}></LeftIcon>
        </button>
    </div>
  );
}
