// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { RoomServiceClient } from "livekit-server-sdk";
import { lru } from "@/tools/setting";
import { lruItem } from "@/types/global";
export type RoomInfo = {
  num_participants: number;
  hasPasswd: boolean
};

type ErrorResponse = {
  error: string;
};

type Query = {
  room: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RoomInfo | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "Invalid method" });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_WS_URL;
  const { roomId } = req.query;

  if (!apiKey || !apiSecret || !wsUrl) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const livekitHost = wsUrl?.replace("wss://", "https://");
  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

  try {
    const l: (lruItem | undefined) = lru.get(roomId as string) as lruItem | undefined
    // for passwd debug
    // if(l) console.log(`get passwd for ${roomId}, passwd: ${l.passwd}`)
    const participants = await roomService.listParticipants(roomId as string);
    return res.status(200).json({ num_participants: participants.length, hasPasswd: (l && l.passwd !== "") as boolean });
  } catch(e) {
    return res.status(200).json({ num_participants: 0, hasPasswd: false });
  }
}
