import {
    useConnectionQualityIndicator,
  } from '@livekit/components-react';
  import { ConnectionQuality} from 'livekit-client';
  import { HTMLAttributes } from 'react';
export function UserDefinedConnectionQualityIndicator(props: HTMLAttributes<HTMLSpanElement>) {
    /**
     *  We use the same React hook that is used internally to build our own component.
     *  By using this hook, we inherit all the state management and logic and can focus on our implementation.
     */
    const { quality } = useConnectionQualityIndicator();
  
    function qualityToText(quality: ConnectionQuality): string {
      switch (quality) {
        case ConnectionQuality.Unknown:
          return 'No idea';
        case ConnectionQuality.Poor:
          return 'Poor';
        case ConnectionQuality.Good:
          return 'Good';
        case ConnectionQuality.Excellent:
          return 'Excellent';
      }
    }
  
    return <span {...props}> {qualityToText(quality)} </span>;
  }
  