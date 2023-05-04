import { NextApiRequest, NextApiResponse } from 'next';

import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import type { AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';
import { TokenResult, RoomMetadata } from '../../lib/types';
import { lru } from '@/lib/lru';
import { error } from 'console';

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.LIVEKIT_URL;

export const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.ttl = '5m';
  at.addGrant(grant);
  return at.toJwt();
};
// TODO最后一个人离开房间时重置密码
export default async function handleToken(req: NextApiRequest, res: NextApiResponse) {

    const { roomName, identity, name, passwd, metadata } = req.body;
    // console.log({ roomName, identity, name, metadata } )
    if (typeof identity !== 'string' || typeof roomName !== 'string') {
      res.status(403).end();
      return;
    }

    if (Array.isArray(name)) {
        return res.status(500).json({ error: "provide max one name"});
    }
    if (Array.isArray(metadata)) {
        return res.status(500).json({ error: 'provide max one metadata string'});
    }

    if (!apiKey || !apiSecret || !wsUrl) {
      return res.status(500).json({ error: "Server misconfigured" });
    }
  
    const livekitHost = wsUrl?.replace("wss://", "https://");

    const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
    

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      roomAdmin: false
    };

    let metadataObj: any = undefined
    let metadataProcess = metadata;
    const defaultMaxParticipants = process.env.LIVEKIT_DEFAULT_MAXPARTICIPANTS ? parseInt(process.env.LIVEKIT_DEFAULT_MAXPARTICIPANTS) : 10

    try{
        const participants = await roomService.listParticipants(roomName);
        if(participants.length == 0) throw error("room is empty");
        const roomLRUItem: RoomMetadata = lru.get(roomName)
        if(roomLRUItem != undefined && roomLRUItem.maxParticipants > 0 &&
         participants.length >= roomLRUItem.maxParticipants){
            return res.status(500).json({ error: 'room is full'})
        }
        if(roomLRUItem.passwd != undefined && roomLRUItem.passwd != "" && roomLRUItem.passwd != passwd){
            return res.status(500).json({ error: 'passwd error'})
        }
    }catch{
        // If room doesn't exist, user is room admin
        grant.roomAdmin = true;
        // set no passwrd
        if(lru.get(roomName)){
            lru.delete(roomName)
        }
        const t: RoomMetadata = {passwd: "", time: new Date().getTime(), maxParticipants: defaultMaxParticipants}
        lru.set(roomName, t)

        try {
          metadataObj = metadata ? {...JSON.parse(metadata), admin: true} : {admin: true};
        } catch (error) {
          metadataObj = {admin: true};
        }

        metadataProcess = JSON.stringify(metadataObj)
    
        // for passwd debug
        // console.log(metadataProcess)
        console.log(`set passwd for ${roomName}`)
        const t2 = lru.get(roomName) as RoomMetadata;
        // console.log(`get passwd for ${roomName}, passwd: ${t2.passwd}`)
    }

    const token = createToken({ identity, name, metadata: metadataProcess }, grant);
    const result: TokenResult = {
      identity,
      accessToken: token,
      isAdmin: grant.roomAdmin as boolean
    };

    res.status(200).json(result);
}
