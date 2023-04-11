// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { lru } from "@/tools/setting";
import livekitServer, {
    AccessToken,
    RoomServiceClient,
    TokenVerifier
} from 'livekit-server-sdk';

export type UpdatePassBody = {
    roomId: string;
    token: string;
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
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_WS_URL;
    if (!apiKey || !apiSecret || !wsUrl) {
        return res.status(500).json({ error: 'Server misconfigured' });
    }

    if (req.method !== 'POST') {
        return res.status(400).json({ error: 'Invalid method' });
    }

    const {
        token: token,
        roomId: room,
    } = req.body as UpdatePassBody;


    if (!room) return res.status(400).json({ error: 'Missing room id' });
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const livekitHost = wsUrl?.replace('wss://', 'https://');

    //check if user is room admin
    const tv = new TokenVerifier(apiKey, apiSecret);
    const at = await tv.verify(token)
    if(!at.video || !at.video.roomAdmin){
        return res.status(401).json({ error: 'Not room admin' });
    }

    //set passwd
    if(lru.get(room)){
        lru.delete(room)
    }
    console.log(`set passwd for ${room}`)

    res.status(200);
}
