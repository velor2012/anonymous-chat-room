import type {
    LocalAudioTrack, CreateLocalTracksOptions,
    LocalTrack, LocalVideoTrack
} from 'livekit-client';
import { createLocalAudioTrack, createLocalVideoTrack,    facingModeFromLocalTrack, createLocalTracks,Track, VideoPresets } from 'livekit-client';
import * as React from 'react';
import { MediaDeviceMenu } from '@/components/MyMediaDeviceMenu';
import { useMediaDevices } from '@livekit/components-react';
import { TrackToggle } from '@livekit/components-react';
import { log } from '@livekit/components-core';
import { RoomInfo } from './RoomInfo';
import { defaultAudioSetting } from '@/lib/const';
import { useCurState } from '@/lib/hooks/useCurState';
import { useTranslation } from 'react-i18next';

/** @public */
export type LocalUserChoices = {
    username: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    videoDeviceId: string;
    audioDeviceId: string;
    e2ee: boolean;
    sharedPassphrase: string;
    passwd: string;
  };
  
  const DEFAULT_USER_CHOICES: LocalUserChoices = {
    username: '',
    videoEnabled: false,
    audioEnabled: true,
    videoDeviceId: '',
    audioDeviceId: '',
    e2ee: false,
    sharedPassphrase: '',
    passwd: ''
  };
  
  /** @public */
  export interface PreJoinProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onError'> {
    roomName: string;
    /** This function is called with the `LocalUserChoices` if validation is passed. */
    onSubmit?: (values: LocalUserChoices) => void;
    /**
     * Provide your custom validation function. Only if validation is successful the user choices are past to the onSubmit callback.
     */
    onValidate?: (values: LocalUserChoices) => boolean;
    onError?: (error: Error) => void;
    /** Prefill the input form with initial values. */
    defaults?: Partial<LocalUserChoices>;
    /** Display a debug window for your convenience. */
    debug?: boolean;
    joinLabel?: string;
    micLabel?: string;
    camLabel?: string;
    userLabel?: string;
    showE2EEOptions?: boolean;
  }
  
  /** @alpha */
  export function usePreviewTracks(
    options: CreateLocalTracksOptions,
    onError?: (err: Error) => void,
  ) {
    const [tracks, setTracks] = React.useState<LocalTrack[]>();
  
    React.useEffect(() => {
      let trackPromise: Promise<LocalTrack[]> | undefined = undefined;
      let needsCleanup = false;
      if (options.audio || options.video) {
        trackPromise = createLocalTracks(options);
        trackPromise
          .then((tracks) => {
            if (needsCleanup) {
              tracks.forEach((tr) => tr.stop());
            } else {
              setTracks(tracks);
            }
          })
          .catch(onError);
      }
  
      return () => {
        needsCleanup = true;
        trackPromise?.then((tracks) =>
          tracks.forEach((track) => {
            track.stop();
          }),
        );
      };
    }, [JSON.stringify(options)]);
  
    return tracks;
  }
  
  /** @public */
  export function usePreviewDevice<T extends LocalVideoTrack | LocalAudioTrack>(
    enabled: boolean,
    deviceId: string,
    kind: 'audioinput',
  ) {
    const [deviceError, setDeviceError] = React.useState<Error | null>(null);
    const [isCreatingTrack, setIsCreatingTrack] = React.useState<boolean>(false);
  
    const devices = useMediaDevices({ kind });
    const [selectedDevice, setSelectedDevice] = React.useState<MediaDeviceInfo | undefined>(
      undefined,
    );
  
    const [localTrack, setLocalTrack] = React.useState<T>();
    const [localDeviceId, setLocalDeviceId] = React.useState<string>(deviceId);
  
    React.useEffect(() => {
      setLocalDeviceId(deviceId);
    }, [deviceId]);
  
    const createTrack = async (deviceId: string, kind: 'videoinput' | 'audioinput') => {
      try {
        const track =
          kind === 'videoinput'
            ? await createLocalVideoTrack({
                deviceId: deviceId,
                resolution: VideoPresets.h720.resolution,
              })
            : await createLocalAudioTrack({ deviceId });
  
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
  
    const switchDevice = async (track: LocalVideoTrack | LocalAudioTrack, id: string) => {
      await track.setDeviceId(id);
      prevDeviceId.current = id;
    };
  
    const prevDeviceId = React.useRef(localDeviceId);
  
    React.useEffect(() => {
      if (enabled && !localTrack && !deviceError && !isCreatingTrack) {
        log.debug('creating track', kind);
        setIsCreatingTrack(true);
        createTrack(localDeviceId, kind).finally(() => {
          setIsCreatingTrack(false);
        });
      }
    }, [enabled, localTrack, deviceError, isCreatingTrack]);
  
    // switch camera device
    React.useEffect(() => {
      if (!localTrack) {
        return;
      }
      if (!enabled) {
        log.debug(`muting ${kind} track`);
        localTrack.mute().then(() => log.debug(localTrack.mediaStreamTrack));
      } else if (selectedDevice?.deviceId && prevDeviceId.current !== selectedDevice?.deviceId) {
        log.debug(`switching ${kind} device from`, prevDeviceId.current, selectedDevice.deviceId);
        switchDevice(localTrack, selectedDevice.deviceId);
      } else {
        log.debug(`unmuting local ${kind} track`);
        localTrack.unmute();
      }
    }, [localTrack, selectedDevice, enabled, kind]);
  
    React.useEffect(() => {
      return () => {
        if (localTrack) {
          log.debug(`stopping local ${kind} track`);
          localTrack.stop();
          localTrack.mute();
        }
      };
    }, []);
  
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
   * The `PreJoin` prefab component is normally presented to the user before he enters a room.
   * This component allows the user to check and select the preferred media device (camera und microphone).
   * On submit the user decisions are returned, which can then be passed on to the `LiveKitRoom` so that the user enters the room with the correct media devices.
   *
   * @remarks
   * This component is independent from the `LiveKitRoom` component and don't has to be nested inside it.
   * Because it only access the local media tracks this component is self contained and works without connection to the LiveKit server.
   *
   * @example
   * ```tsx
   * <PreJoin />
   * ```
   * @public
   */
  export function PreJoin({
    defaults = {},
    onValidate,
    onSubmit,
    onError,
    debug,
    roomName,
    // joinLabel = 'Join Room',
    // micLabel = 'Microphone',
    // camLabel = 'Camera',
    // userLabel = 'Username',
    showE2EEOptions = false,
    ...htmlProps
  }: PreJoinProps) {

    const [passwd, setPasswd] = React.useState("");
    const [userChoices, setUserChoices] = React.useState(DEFAULT_USER_CHOICES);
    const [username, setUsername] = React.useState(
      defaults.username ?? DEFAULT_USER_CHOICES.username,
    );
    const [videoEnabled, setVideoEnabled] = React.useState<boolean>(
      defaults.videoEnabled ?? DEFAULT_USER_CHOICES.videoEnabled,
    );
    const initialVideoDeviceId = defaults.videoDeviceId ?? DEFAULT_USER_CHOICES.videoDeviceId;
    const [videoDeviceId, setVideoDeviceId] = React.useState<string>(initialVideoDeviceId);
    const initialAudioDeviceId = defaults.audioDeviceId ?? DEFAULT_USER_CHOICES.audioDeviceId;
    const [audioEnabled, setAudioEnabled] = React.useState<boolean>(
      defaults.audioEnabled ?? DEFAULT_USER_CHOICES.audioEnabled,
    );
    const [audioDeviceId, setAudioDeviceId] = React.useState<string>(initialAudioDeviceId);
    const [e2ee, setE2ee] = React.useState<boolean>(defaults.e2ee ?? DEFAULT_USER_CHOICES.e2ee);
    const [sharedPassphrase, setSharedPassphrase] = React.useState<string>(
      defaults.sharedPassphrase ?? DEFAULT_USER_CHOICES.sharedPassphrase,
    );
  
    const tracks = usePreviewTracks(
      {
        audio: audioEnabled ? { deviceId: initialAudioDeviceId } : false,
        video: videoEnabled ? { deviceId: initialVideoDeviceId } : false,
      },
      onError,
    );
  
    const videoEl = React.useRef(null);
  
    const videoTrack = React.useMemo(
      () => tracks?.filter((track) => track.kind === Track.Kind.Video)[0] as LocalVideoTrack,
      [tracks],
    );
  
    const facingMode = React.useMemo(() => {
      if (videoTrack) {
        const { facingMode } = facingModeFromLocalTrack(videoTrack);
        return facingMode;
      } else {
        return 'undefined';
      }
    }, [videoTrack]);
  
    const audioTrack = React.useMemo(
        () => tracks?.filter((track) => track.kind === Track.Kind.Audio)[0] as LocalAudioTrack,
      [tracks],
    );
  
    React.useEffect(() => {
      if (videoEl.current && videoTrack) {
        videoTrack.unmute();
        videoTrack.attach(videoEl.current);
      }
  
      return () => {
        videoTrack?.detach();
      };
    }, [videoTrack]);
  
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
      const newUserChoices = {
        username,
        videoEnabled,
        videoDeviceId,
        audioEnabled,
        audioDeviceId,
        e2ee,
        sharedPassphrase,
        passwd: passwd
      };
      setUserChoices(newUserChoices);
      setIsValid(handleValidation(newUserChoices));
    }, [
      username,
      videoEnabled,
      handleValidation,
      audioEnabled,
      audioDeviceId,
      videoDeviceId,
      sharedPassphrase,
      e2ee,
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
            >
              {t('mic')}
            </TrackToggle>
            <div className=" relative flex-shrink-0 btn bg-primary border-none hover:bg-opacity-50 p-0">
              <MediaDeviceMenu
                initialSelection={audioDeviceId}
                kind="audioinput"
                disabled={!audioTrack}
                tracks={{ audioinput: audioTrack }}
                onActiveDeviceChange={(_, id) => setAudioDeviceId(id)}
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
            defaultValue={username}
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

        {showE2EEOptions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <input
                id="use-e2ee"
                type="checkbox"
                checked={e2ee}
                onChange={(ev) => setE2ee(ev.target.checked)}
            ></input>
            <label htmlFor="use-e2ee">Enable end-to-end encryption</label>
            </div>
            {e2ee && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                <label htmlFor="passphrase">Passphrase</label>
                <input
                id="passphrase"
                type="password"
                value={sharedPassphrase}
                onChange={(ev) => setSharedPassphrase(ev.target.value)}
                />
            </div>
            )}
        </div>
        )}

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
              {/* <li>Video Enabled: {`${userChoices.videoEnabled}`}</li> */}
              <li>Audio Enabled: {`${userChoices.audioEnabled}`}</li>
              {/* <li>Video Device: {`${userChoices.videoDeviceId}`}</li> */}
              <li>Audio Device: {`${userChoices.audioDeviceId}`}</li>
            </ul>
          </>
        )}
      </div>
    );
  }
  