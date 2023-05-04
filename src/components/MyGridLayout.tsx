import * as React from 'react';
import { mergeProps } from '@/livekit-react-offical/utils';
// import { mergeProps } from '@livekit/components-react/dist/utils';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { usePagination, useGridLayout, UseParticipantsOptions } from '@livekit/components-react';
import { PaginationControl } from '@/components/MyPaginationControl';
import { TrackLoop } from './MyTrackLoop';
export interface GridLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<UseParticipantsOptions, 'updateOnlyOn'> {
  tracks: TrackReferenceOrPlaceholder[];
}

/**
 * The GridLayout component displays the nested participants in a grid where every participants has the same size.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <GridLayout track={tracks} />
 * <LiveKitRoom>
 * ```
 */
export function GridLayout({ tracks, ...props }: GridLayoutProps) {
  const gridEl = React.createRef<HTMLDivElement>();

  const elementProps = React.useMemo(
    () => mergeProps(props, { className: 'lk-grid-layout' }),
    [props],
  );
  const { layout } = useGridLayout(gridEl, tracks.length);
  const pagination = usePagination(layout.maxTiles, tracks);

  return (
    <div ref={gridEl} {...elementProps}>
      <TrackLoop tracks={pagination.tracks}>{props.children}</TrackLoop>
      {tracks.length > layout.maxTiles && (
        <PaginationControl pagesContainer={gridEl} {...pagination} />
      )}
    </div>
  );
}
