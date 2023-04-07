# anonymous-chat-room
Anonymous Chat Room Power By Livekit [livekit](https://livekit.io/) And [Next.js](https://nextjs.org/)

## Online demo

You can try an online demo right now at <https://chat.cwy666.eu.org/>, This demo uses the free service of [livekit cloud ](https://cloud.livekit.io) as the backend and will stop automatically when the quota runs out.

## Features
- [x] Easy to deploy, You can use the free service of  [livekit cloud ](https://cloud.livekit.io) directly, without using your own server
- [x] Voice chat in room
- [x] Text chat in room, can send text or emoji
  - [ ] More custom emoji support
  - [ ] More message types, including images, videos
- [x] Browser-based speaker, microphone, screen recording(Perfectly support **Chrome**, **Edge**, does **not** support speaker recording on **safari**)
- [ ] Latency calculate--Current implementation is very simple
- [ ] Room password setting
- [ ] Multiple entry points on the front side (polling a set of available apikeys) to improve reliability
- [ ] Optimized for mobile - <u>works</u> | good | excellent 🚩

(🚩means  indicate  the current ongoing)

## Running locally

Clone the repo and install dependencies:

```bash
git clone git@github.com:velor2012/anonymous-chat-room.git
cd anonymous-chat-room
yarn install
```

Create a new LiveKit project at <http://cloud.livekit.io>. Then create a new key in your [project settings](https://cloud.livekit.io/projects/p_/settings/keys).

Modify next.config.js and replace **LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_WS_URL** and if you need to simply test your delay, you can add a PING_URL otherwise keep it empty:

> :warning: the website for PING needs to add a header to handle HEAD cross-domain requests

Then run the development server:

```bash
npm run dev
```

You can test it by opening <http://localhost:3000> in a browser.

## Deploying for production

This is a nextjs app, which you can deploy by following these steps
1. fork the shoe repository
2. modify next.config.js
3. import directly to vercel

## Thanks

free4.chat is built on the top of
 - [Free4chat](https://github.com/madawei2699/free4chat)

 - [spatial-audio](https://github.com/livekit-examples/)

 - [Mornin](https://mornin.fm/) 
 - [liveKit](https://livekit.io) 
 - [liveKit-React Sdk](https://github.com/livekit/components-js)
 - [RecordRTC](https://github.com/muaz-khan/RecordRTC)
 - [mic-speaker-recorder](https://github.com/asrul10/mic-speaker-recorder)

thanks for their heart of open source.