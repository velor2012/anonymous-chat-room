// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { lru } from "@/tools/setting";
import livekitServer, {
    AccessToken,
    RoomServiceClient,
} from 'livekit-server-sdk';
import { lruItem } from '@/types/global';

export type ConnectionDetailsBody = {
    roomId: string;
    username: string;
};

export type ConnectionDetails = {
    token: string;
    ws_url: string;
    username: string;
    roomId: string;
    time: number
};

type ErrorResponse = {
    error: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ConnectionDetails | ErrorResponse>,
) {
    if (req.method !== 'POST') {
        return res.status(400).json({ error: 'Invalid method' });
    }

    const {
        username,
        roomId: room,
    } = req.body as ConnectionDetailsBody;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_WS_URL;
    if (!apiKey || !apiSecret || !wsUrl) {
        return res.status(500).json({ error: 'Server misconfigured' });
    }

    if (!username) return res.status(400).json({ error: 'Missing username' });
    if (!room) return res.status(400).json({ error: 'Missing room_name' });

    const livekitHost = wsUrl?.replace('wss://', 'https://');

    const at = new AccessToken(apiKey, apiSecret, { identity: username });
    const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

    try {
        await roomService.getParticipant(room, username);
        return res.status(401).json({ error: 'Username already exists in room' });
    } catch {
        // If participant doesn't exist, we can continue
    }
    
    let grant: livekitServer.VideoGrant = { room, roomJoin: true, canPublish: true, canSubscribe: true, roomAdmin: false };
    try{
        const participants = await roomService.listParticipants(room);
        console.log(`get passwd for ${room}, passwd: ${lru.get(room)}`)
        debugger
    }catch{
        // If room doesn't exist, user is room admin
        grant.roomAdmin = true;
        // set no passwrd
        if(lru.get(room)){
            lru.delete(room)
        }
        const t: lruItem = {passwd: "", time: new Date().getTime()}
        lru.set(room, t)
        // for passwd debug
        // console.log(`set passwd for ${room}`)
        // const t2 = lru.get(room) as lruItem;
        // console.log(`get passwd for ${room}, passwd: ${t2.passwd}`)
    }
    
    at.addGrant(grant);
    res.status(200).json({ token: at.toJwt(), ws_url: wsUrl, username:username, roomId: room, time: new Date().getTime() });
}
