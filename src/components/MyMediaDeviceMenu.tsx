import { computeMenuPosition, wasClickOutside } from '@livekit/components-core';
import { log } from '@livekit/components-core';
// import { MediaDeviceSelect } from '@livekit/components-react';
import { MediaDeviceSelect } from '@/components/MyMediaDeviceSelect';
import React, {useEffect, useLayoutEffect} from 'react';

interface MediaDeviceMenuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: MediaDeviceKind;
  initialSelection?: string;
  onActiveDeviceChange?: (kind: MediaDeviceKind, deviceId: string) => void;
}

/**
 * The MediaDeviceMenu prefab component is a button that opens a menu that lists
 * all media devices and allows the user to select them.
 *
 * @remarks
 * This component is implemented with the `MediaDeviceSelect` LiveKit components.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <MediaDeviceMenu />
 * </LiveKitRoom>
 * ```
 */
export const MediaDeviceMenu = ({
  kind,
  initialSelection,
  onActiveDeviceChange,
  ...props
}: MediaDeviceMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [updateRequired, setUpdateRequired] = React.useState<boolean>(true);

  const handleActiveDeviceChange = (kind: MediaDeviceKind, deviceId: string) => {
    log.debug('handle device change');
    setIsOpen(false);
    onActiveDeviceChange?.(kind, deviceId);
  };

  const button = React.useRef<HTMLButtonElement>(null);
  const tooltip = React.useRef<HTMLDivElement>(null);
  

  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (!tooltip.current) {
        return;
      }
      if (event.target === button.current) {
        return;
      }
      if (isOpen && wasClickOutside(tooltip.current, event)) {
        setIsOpen(false);
      }
    },
    [isOpen, tooltip, button],
  );

  React.useEffect(() => {
    document.addEventListener<'click'>('click', handleClickOutside);
    return () => {
      document.removeEventListener<'click'>('click', handleClickOutside);
    };
  }, [handleClickOutside, setUpdateRequired]);

  return (
    <div className=' text-white'>
      <button
        className="lk-button lk-button-menu"
        aria-pressed={isOpen}
        {...props}
        onClick={() => setIsOpen(!isOpen)}
        ref={button}
      >
        {props.children}
      </button>

      <div
        className="lk-device-menu "
        ref={tooltip}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        {kind ? (
          <MediaDeviceSelect
            className=' bg-primary rounded-lg text-white flex flex-col-reverse absolute
            min-w-[200px] max-w-[300px]  sm:min-w-[300px] sm:max-w-[600px] w-fit left-[-50%] sm:right-[50%] top-auto bottom-full sm:text-base'
            initialSelection={initialSelection}
            onActiveDeviceChange={(deviceId) => handleActiveDeviceChange(kind, deviceId)}
            onDeviceListChange={setDevices}
            kind={kind}
          />
        ) : (
          <>
            <div className="lk-device-menu-heading">Audio inputs</div>
            <MediaDeviceSelect
              kind="audioinput"
              onActiveDeviceChange={(deviceId) => handleActiveDeviceChange('audioinput', deviceId)}
              onDeviceListChange={setDevices}
            />
            <div className="lk-device-menu-heading">Video inputs</div>
            <MediaDeviceSelect
              kind="videoinput"
              onActiveDeviceChange={(deviceId) => handleActiveDeviceChange('videoinput', deviceId)}
              onDeviceListChange={setDevices}
            />
          </>
        )}
      </div>
    </div>
  );
};
