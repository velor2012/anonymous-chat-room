// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { RoomServiceClient } from "livekit-server-sdk";
import { RoomMetadata } from "@/lib/types";
import { lru } from "@/lib/lru";

export type RoomInfo = {
  num_participants: number;
  hasPasswd: boolean,
  maxParticipants: number
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
  const wsUrl = process.env.LIVEKIT_URL;
  const { roomName } = req.query;

  if (!apiKey || !apiSecret || !wsUrl) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const livekitHost = wsUrl?.replace("wss://", "https://");
  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

  try {
    const l: (RoomMetadata | undefined) = lru.get(roomName as string) as RoomMetadata | undefined
    // for passwd debug
    // if(l) console.log(`get passwd for ${roomName}, passwd: ${l.passwd}`)
    const participants = await roomService.listParticipants(roomName as string);
    // if(l) console.log(`get num_participants for ${roomName}`)
    const needpass = (l && l.passwd !== "" && l.passwd !== undefined) ? true: false
    const maxParticipants = l ? l.maxParticipants: 0
    return res.status(200).json({ num_participants: participants.length, hasPasswd: needpass, maxParticipants: maxParticipants });
  } catch(e) {
    return res.status(200).json({ num_participants: 0, hasPasswd: false, maxParticipants: 0 });
  }
}