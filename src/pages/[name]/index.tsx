import {
  LiveKitRoom,
  //   PreJoin,
  //   LocalUserChoices,
  //   VideoConference,
  useToken,
  formatChatMessageLinks,
} from '@livekit/components-react';
import { MyErrorToast } from '@/components/Toast';
import { VideoConference } from '@/components/MyVideoConference';
import { LogLevel, RoomOptions, ExternalE2EEKeyProvider, Room } from 'livekit-client';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DebugMode } from '../../lib/Debug';
import { PreJoin, LocalUserChoices } from '@/components/MyPreJoin';
import { useServerUrl } from '../../lib/client-utils';
import { log } from '@livekit/components-core';
import { defaultAudioSetting, publishDefaults } from '@/lib/const';
import { TokenResult } from '@/lib/types';
import { curState, curState$ } from '@/lib/observe/CurStateObs';
import { WebAudioContext } from '@/lib/context/webAudioContex';
import { useSetContext } from '@/lib/context/setContext';
import { randomBytes, randomUUID } from 'crypto';
log.setDefaultLevel(LogLevel.warn);
const Home: NextPage = () => {
  const router = useRouter();
  const { name: roomName } = router.query;

  const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);

  return (
    <>
      <Head>
        <title>Anonymous Chat Room</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {roomName && !Array.isArray(roomName) && preJoinChoices ? (
          <ActiveRoom
            roomName={roomName}
            userChoices={preJoinChoices}
            onLeave={() => {
              curState$.next({
                join: false,
                isAdmin: false,
              });
              router.push('/');
            }}
          ></ActiveRoom>
        ) : (
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              height: '100%',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <PreJoin
              roomName={roomName as string}
              onError={(err) => console.log('error while setting up prejoin', err)}
              defaults={{
                username: '',
                audioEnabled: true,
              }}
              onSubmit={(values) => {
                console.log('Joining with: ', values);
                setPreJoinChoices(values);
              }}
            ></PreJoin>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;

type ActiveRoomProps = {
  userChoices: LocalUserChoices;
  roomName: string;
  region?: string;
  onLeave?: () => void;
};
const ActiveRoom = ({ roomName, userChoices, onLeave }: ActiveRoomProps) => {
  // const toast = useRef<HTMLDivElement>(null);
  //get token
  const [token, setToken] = useState<TokenResult | undefined>(undefined);
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const { ctx } = useSetContext();
  const fetchToken = useCallback(
    async (roomName: string) => {
      if (roomName === undefined) return undefined;
      if (!process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT) return undefined;
      const body = {
        identity: userChoices.username,
        name: userChoices.username,
        passwd: userChoices.passwd,
        roomName: roomName,
      };
      const response = await fetch(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.status === 200) {
        const token = (await response.json()) as TokenResult;
        setToken(token);
        return token;
      }

      const { error } = await response.json();
      throw error;
    },
    [roomName, userChoices.passwd, userChoices.username],
  );

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (ctx) {
      setAudioContext(ctx);
    }
    return () => {
      setAudioContext((prev) => {
        return null;
      });
    };
  }, [ctx]);

  useEffect(() => {
    fetchToken(roomName).catch((e) => {
      console.log(e);
      setShowError(true);
      setErrorMsg(e);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    });
  }, [roomName]);

  const router = useRouter();
  const { region, hq } = router.query;

  const liveKitUrl = useServerUrl(region as string | undefined);

  const roomOptions = useMemo((): RoomOptions => {
    let setting: RoomOptions = {
      audioCaptureDefaults: {
        deviceId: userChoices.audioDeviceId ?? undefined,
        ...defaultAudioSetting,
      },
      adaptiveStream: { pixelDensity: 'screen' },
      dynacast: true,
      publishDefaults: publishDefaults,
      e2ee: undefined,
    };

    if (audioContext) setting = { ...setting, expWebAudioMix: { audioContext } };
    return setting;
  }, [userChoices, hq, audioContext]);

  // using e2ee
  let e2eeOptions = undefined;
  const keyProvider = useMemo(() => new ExternalE2EEKeyProvider(), []);
  e2eeOptions = useMemo(() => {
    if (!!process.env.NEXT_PUBLIC_E2EETOKEN) keyProvider.setKey(process.env.NEXT_PUBLIC_E2EETOKEN);

    const opt =
      typeof window !== 'undefined'
        ? {
            keyProvider,
            worker: new Worker(new URL('livekit-client/e2ee-worker', import.meta.url)),
          }
        : undefined;
    return opt;
  }, [keyProvider, process.env.NEXT_PUBLIC_E2EETOKEN]);

  roomOptions.e2ee = e2eeOptions;
  const room = useMemo(() => new Room(roomOptions), [roomOptions]);
  !!e2eeOptions && !!process.env.NEXT_PUBLIC_E2EETOKEN && room.setE2EEEnabled(true);

  return (
    <div className="w-full top-16 relative" style={{ height: 'calc(100% - 4rem)' }}>
      {liveKitUrl && audioContext && (
        <LiveKitRoom
          token={token?.accessToken}
          serverUrl={liveKitUrl}
          room={room}
          //   options={roomOptions}
          video={false}
          audio={userChoices.audioEnabled}
          onDisconnected={onLeave}
          data-lk-theme="default"
        >
          <WebAudioContext.Provider value={audioContext}>
            <VideoConference chatMessageFormatter={formatChatMessageLinks} />
          </WebAudioContext.Provider>
          <DebugMode logLevel={LogLevel.warn} />
        </LiveKitRoom>
      )}

      {/* toast */}
      {showError && <MyErrorToast>{errorMsg}</MyErrorToast>}
    </div>
  );
};
