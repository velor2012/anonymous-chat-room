import { NextApiRequest, NextApiResponse } from 'next';

import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { RoomMetadata, TokenResult } from '../../lib/types';
import { lru } from '@/lib/lru';

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.LIVEKIT_URL;

type REQ_BODY = {
    roomName: string
    metadata?:RoomMetadata
}
export default async function handleToken(req: NextApiRequest, res: NextApiResponse) {

    const { roomName, metadata } = req.body as REQ_BODY;

    if(metadata == undefined) return res.status(500).json({ error: "please provide metadata"});

    if (typeof roomName !== 'string' ) {
      res.status(403).end();
      return;
    }

    if (!apiKey || !apiSecret || !wsUrl) {
      return res.status(500).json({ error: "Server misconfigured" });
    }
  
    const livekitHost = wsUrl?.replace("wss://", "https://");
    try{
        const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
        roomService.updateRoomMetadata(
            roomName,
            JSON.stringify(metadata)
        )
        const t: RoomMetadata = metadata
        lru.set(roomName, t)
    }catch(e){
        return res.status(500).json({ error: 'setting metadata error'})
    }

    return res.status(200).json(metadata);
}
