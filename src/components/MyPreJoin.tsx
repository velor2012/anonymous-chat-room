import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { createLocalAudioTrack, createLocalVideoTrack, Track, VideoPresets } from 'livekit-client';
import * as React from 'react';
import { MediaDeviceMenu } from '@/components/MyMediaDeviceMenu';
import { useMediaDevices } from '@livekit/components-react';
import { TrackToggle } from '@livekit/components-react';
import { log } from '@livekit/components-core';
import { RoomInfo } from './RoomInfo';
import { defaultAudioSetting } from '@/lib/const';
import { useCurState } from '@/lib/hooks/useCurState';
import { useTranslation } from 'react-i18next';

export type LocalUserChoices = {
  username: string;
  passwd: string;
  audioEnabled: boolean;
  audioDeviceId: string;
};

const DEFAULT_USER_CHOICES = {
  username: '',
  audioEnabled: true,
  audioDeviceId: '',
  passwd: '',
};

export type PreJoinProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> & {
    roomName: string;
  /**
   * This function is called with the `LocalUserChoices` if validation is passed.
   */
  onSubmit?: (values: LocalUserChoices) => void;
  /**
   * Provide your custom validation function. Only if validation is successful the user choices are past to the onSubmit callback.
   */
  onValidate?: (values: LocalUserChoices) => boolean;

  onError?: (error: Error) => void;
  /**
   * Prefill the input form with initial values.
   */
  defaults?: Partial<LocalUserChoices>;
  /**
   * Display a debug window for your convenience.
   */
  debug?: boolean;

  joinLabel?: string;

  micLabel?: string;

  camLabel?: string;

  userLabel?: string;

};

function usePreviewDevice<T extends LocalAudioTrack>(
  enabled: boolean,
  deviceId: string,
  kind: 'audioinput',
) {
  const [deviceError, setDeviceError] = React.useState<Error | null>(null);

  const devices = useMediaDevices({ kind });
  const [selectedDevice, setSelectedDevice] = React.useState<MediaDeviceInfo | undefined>(
    undefined,
  );

  const [localTrack, setLocalTrack] = React.useState<T>();
  const [localDeviceId, setLocalDeviceId] = React.useState<string>(deviceId);

  React.useEffect(() => {
    setLocalDeviceId(deviceId);
  }, [deviceId]);

  const createTrack = async (deviceId: string, kind: 'audioinput') => {
    try {
      const track = await createLocalAudioTrack({ deviceId });

      const newDeviceId = await track.getDeviceId();
      if (newDeviceId && deviceId !== newDeviceId) {
        prevDeviceId.current = newDeviceId;
        setLocalDeviceId(newDeviceId);
      }
      setLocalTrack(track as T);
    } catch (e) {
      if (e instanceof Error) {
        setDeviceError(e);
      }
    }
  };

  const switchDevice = async (track: LocalAudioTrack, id: string) => {
    await track.restartTrack({
      deviceId: id,
    });
    prevDeviceId.current = id;
  };

  const prevDeviceId = React.useRef(localDeviceId);

  React.useEffect(() => {
    if (enabled && !localTrack && !deviceError) {
      log.debug('creating track', kind);
      createTrack(localDeviceId, kind);
    }
  }, [enabled, localTrack, deviceError]);

  // switch camera device
  React.useEffect(() => {
    if (!enabled) {
      if (localTrack) {
        log.debug(`muting ${kind} track`);
        localTrack.mute().then(() => log.debug(localTrack.mediaStreamTrack));
      }
      return;
    }
    if (
      localTrack &&
      selectedDevice?.deviceId &&
      prevDeviceId.current !== selectedDevice?.deviceId
    ) {
      log.debug(`switching ${kind} device from`, prevDeviceId.current, selectedDevice.deviceId);
      switchDevice(localTrack, selectedDevice.deviceId);
    } else {
      log.debug(`unmuting local ${kind} track`);
      localTrack?.unmute();
    }

    return () => {
      if (localTrack) {
        log.debug(`stopping local ${kind} track`);
        localTrack.stop();
        localTrack.mute();
      }
    };
  }, [localTrack, selectedDevice, enabled, kind]);

  React.useEffect(() => {
    setSelectedDevice(devices.find((dev) => dev.deviceId === localDeviceId));
  }, [localDeviceId, devices]);

  return {
    selectedDevice,
    localTrack,
    deviceError,
  };
}

/**
 * The PreJoin prefab component is normally presented to the user before he enters a room.
 * This component allows the user to check and select the preferred media device (camera und microphone).
 * On submit the user decisions are returned, which can then be passed on to the LiveKitRoom so that the user enters the room with the correct media devices.
 *
 * @remarks
 * This component is independent from the LiveKitRoom component and don't has to be nested inside it.
 * Because it only access the local media tracks this component is self contained and works without connection to the LiveKit server.
 *
 * @example
 * ```tsx
 * <PreJoin />
 * ```
 */
export const PreJoin = ({
  defaults = {},
  roomName,
  onValidate,
  onSubmit,
  onError,
  debug,
//   joinLabel = 'Join Room',
//   micLabel = 'Microphone',
//   camLabel = 'Camera',
//   userLabel = 'Username',
  ...htmlProps
}: PreJoinProps) => {
  const [userChoices, setUserChoices] = React.useState(DEFAULT_USER_CHOICES);
  const [username, setUsername] = React.useState(
    defaults.username ?? DEFAULT_USER_CHOICES.username,
  );
  const [passwd, setPasswd] = React.useState("");
  const [audioEnabled, setAudioEnabled] = React.useState<boolean>(
    defaults.audioEnabled ?? DEFAULT_USER_CHOICES.audioEnabled,
  );
  const [audioDeviceId, setAudioDeviceId] = React.useState<string>(
    defaults.audioDeviceId ?? DEFAULT_USER_CHOICES.audioDeviceId,
  );

  const audio = usePreviewDevice(audioEnabled, audioDeviceId, 'audioinput');

  const [isValid, setIsValid] = React.useState<boolean>();

  const handleValidation = React.useCallback(
    (values: LocalUserChoices) => {
      if (typeof onValidate === 'function') {
        return onValidate(values);
      } else {
        return values.username !== '';
      }
    },
    [onValidate],
  );

  React.useEffect(() => {
    if (audio.deviceError) {
      onError?.(audio.deviceError);
    }
  }, [audio.deviceError, onError]);

  React.useEffect(() => {
    const newUserChoices = {
      username: username,
      audioEnabled: audioEnabled,
      audioDeviceId: audio.selectedDevice?.deviceId ?? '',
      passwd: passwd
    };
    setUserChoices(newUserChoices);
    setIsValid(handleValidation(newUserChoices));
  }, [
    username,
    handleValidation,
    audioEnabled,
    audio.selectedDevice,
  ]);

const mcurState = useCurState()
const { t, i18n } = useTranslation()

const needpass = React.useMemo(() => {
    
    return mcurState.hassPass;
  }, [mcurState.hassPass]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (handleValidation(userChoices)) {
      if (typeof onSubmit === 'function') {
        onSubmit(userChoices);
      }
    } else {
      log.warn('Validation failed with: ', userChoices);
    }
  }

  return (
    <div   className=" flex flex-col items-center justify-center pt-10" {...htmlProps}>
    <RoomInfo roomName={roomName} />
    <div className=" divider my-2"></div>
      <div className="bg-primary rounded-lg">
        <div className=" audio flex">
          <TrackToggle
            className=' btn btn-primary'
            style={{ color:"white"}}
            initialState={audioEnabled}
            source={Track.Source.Microphone}
            onChange={(enabled) => setAudioEnabled(enabled)}
            captureOptions={defaultAudioSetting}
          >
            {t('mic')}
          </TrackToggle>
          <div className=" relative flex-shrink-0 btn bg-primary border-none hover:bg-opacity-50 p-0">
            <MediaDeviceMenu
              initialSelection={audio.selectedDevice?.deviceId}
              kind="audioinput"
              onActiveDeviceChange={(_, deviceId) => {
                log.warn('active device chanaged', deviceId);
                setAudioDeviceId(deviceId);
              }}
              disabled={!!!audio.selectedDevice}
            />
          </div>
        </div>
      </div>

      <form className="flex flex-wrap justify-center mt-4 gap-2">
        <input
          className=" max-w-full rounded-lg border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus: ring-secondary-focus"
          id="username"
          name="username"
          type="text"
          placeholder={t('username')}
          onChange={(inputEl) => setUsername(inputEl.target.value)}
          autoComplete="off"
        />
        {
           needpass && 
                <input
                  className=" max-w-full rounded-lg border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus: ring-secondary-focus"
                  id="passwd"
                  name="passwd"
                  type="text"
                  placeholder="enter passwd"
                  onChange={(inputEl) => setPasswd(inputEl.target.value)}
                  autoComplete="off"
                />
            
        }
        <button
          className=" btn-primary rounded-lg text-white  w-32 border-none font-bold"
          type="submit"
          onClick={(e)=>{
            handleSubmit(e)
          }}
          disabled={!isValid}
        >
          👉 {t('Go')}
        </button>
      </form>

      {debug && (
        <>
          <strong>User Choices:</strong>
          <ul className="lk-list" style={{ overflow: 'hidden', maxWidth: '15rem' }}>
            <li>Username: {`${userChoices.username}`}</li>
            <li>Audio Enabled: {`${userChoices.audioEnabled}`}</li>
            <li>Audio Device: {`${userChoices.audioDeviceId}`}</li>
          </ul>
        </>
      )}
    </div>
  );
};
