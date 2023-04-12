import {
  LiveKitRoom,
//   PreJoin,
//   LocalUserChoices,
  useToken,
  VideoConference,
  formatChatMessageLinks,
//   AudioConference,
} from '@livekit/components-react';
import {AudioConference} from "@/components/MyAudioConference"
// import {VideoConference} from "@/components/MyVideoConference"
import { LogLevel, RoomOptions, VideoPresets } from 'livekit-client';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { DebugMode } from '../../lib/Debug';
import { useServerUrl } from '../../lib/client-utils';
import {PreJoin, LocalUserChoices} from "@/components/MyPreJoin";
import { log } from "@livekit/components-core"
log.setDefaultLevel(LogLevel.warn)
const Home: NextPage = () => {
  const router = useRouter();
  const { name: roomName } = router.query;

  const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);
  return (
    <>
      <Head>
        <title>LiveKit Meet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main data-lk-theme="default">
        {roomName && !Array.isArray(roomName) && preJoinChoices ? (
          <ActiveRoom
            roomName={roomName}
            userChoices={preJoinChoices}
            onLeave={() => {
              router.push('/');
            }}
          ></ActiveRoom>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <PreJoin
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
  const token = useToken(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, {
    userInfo: {
      identity: userChoices.username,
      name: userChoices.username,
    },
  });

  const router = useRouter();
  const { region, hq } = router.query;

  const liveKitUrl = useServerUrl(region as string | undefined);

  const roomOptions = useMemo((): RoomOptions => {
    return {
      audioCaptureDefaults: {
        deviceId: userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: { pixelDensity: 'screen' },
      dynacast: true,
    };
  }, [userChoices, hq]);

  return (
    <>
      {liveKitUrl && (
        <LiveKitRoom
          token={token}
          serverUrl={liveKitUrl}
          options={roomOptions}
          video={false}
          audio={userChoices.audioEnabled}
          onDisconnected={onLeave}
        >
          <AudioConference />
          {/* <VideoConference chatMessageFormatter={formatChatMessageLinks} /> */}
          <DebugMode logLevel={LogLevel.warn} />
        </LiveKitRoom>
      )}
    </>
  );
};
