import * as React from 'react';
import { mergeProps } from '@/livekit-react-offical/utils';
import { useMaybeRoomContext, useMediaDeviceSelect } from '@livekit/components-react';
import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';

/** @public */
export interface MediaDeviceSelectProps extends React.HTMLAttributes<HTMLUListElement> {
  kind: MediaDeviceKind;
  onActiveDeviceChange?: (deviceId: string) => void;
  onDeviceListChange?: (devices: MediaDeviceInfo[]) => void;
  onDeviceSelectError?: (e: Error) => void;
  initialSelection?: string;
  /** will force the browser to only return the specified device
   * will call `onDeviceSelectError` with the error in case this fails
   */
  exactMatch?: boolean;
  track?: LocalAudioTrack | LocalVideoTrack;
  /**
   * this will call getUserMedia if the permissions are not yet given to enumerate the devices with device labels.
   * in some browsers multiple calls to getUserMedia result in multiple permission prompts.
   * It's generally advised only flip this to true, once a (preview) track has been acquired successfully with the
   * appropriate permissions.
   *
   * @see {@link MediaDeviceMenu}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices | MDN enumerateDevices}
   */
  requestPermissions?: boolean;
}

/**
 * The `MediaDeviceSelect` list all media devices of one kind.
 * Clicking on one of the listed devices make it the active media device.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <MediaDeviceSelect kind='audioinput' />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function MediaDeviceSelect({
  kind,
  initialSelection,
  onActiveDeviceChange,
  onDeviceListChange,
  onDeviceSelectError,
  exactMatch,
  track,
  requestPermissions,
  ...props
}: MediaDeviceSelectProps) {
  const room = useMaybeRoomContext();
  const { devices, activeDeviceId, setActiveMediaDevice, className } = useMediaDeviceSelect({
    kind,
    room,
    track,
    requestPermissions,
  });
  React.useEffect(() => {
    if (initialSelection !== undefined) {
      setActiveMediaDevice(initialSelection);
    }
  }, [setActiveMediaDevice]);

  React.useEffect(() => {
    if (typeof onDeviceListChange === 'function') {
      onDeviceListChange(devices);
    }
  }, [onDeviceListChange, devices]);

  React.useEffect(() => {
    if (activeDeviceId && activeDeviceId !== '') {
      onActiveDeviceChange?.(activeDeviceId);
    }
  }, [activeDeviceId]);

  const handleActiveDeviceChange = async (deviceId: string) => {
    try {
      await setActiveMediaDevice(deviceId, { exact: exactMatch });
    } catch (e) {
      if (e instanceof Error) {
        onDeviceSelectError?.(e);
      } else {
        throw e;
      }
    }
  };
  // Merge Props
  const mergedProps = React.useMemo(
    () => mergeProps(props, { className }, { className: 'lk-list' }),
    [className, props],
  );

  function isActive(deviceId: string, activeDeviceId: string, index: number) {
    return deviceId === activeDeviceId || (index === 0 && activeDeviceId === 'default');
  }

  return (
    <ul {...mergedProps}>
      {
      devices.map((device) => {
        const classn = device.deviceId === activeDeviceId ? ' bg-secondary-content' : 'bg-primary';
        const cl = classn + " rounded-md"
        return (
            <li
                key={device.deviceId}
                id={device.deviceId}
                className={cl}
                aria-selected={device.deviceId === activeDeviceId}
                role="option"
                >
                <button className="lk-button w-full overflow-hidden" onClick={() => handleActiveDeviceChange(device.deviceId)}>
                    <div className='text-left w-full text-ellipsis overflow-hidden'>
                        {device.label}
                    </div>
                </button>
            </li>
        )
      }
      )}
    </ul>
  );
}
