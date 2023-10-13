# What's it
An Anonymous Chat Room Power By Livekit [livekit](https://livekit.io/) And [Next.js](https://nextjs.org/)

> ⚠️ Since the main branch will have current mikes after a certain number of people, I really can't find the problem, so this branch is refactored on the basis of [livekit meet](https://github.com/livekit/meet)

ENGLISH | [中文](./README-cn.md)

## Online demo

You can try an online demo right now at <https://chat.cwy666.eu.org/>, This demo uses the free service of [livekit cloud ](https://cloud.livekit.io) as the backend and will stop automatically when the quota runs out.

## Features
- [x] Easy to deploy, You can use the free service of  [livekit cloud ](https://cloud.livekit.io) directly, without using your own server
- [x] Support video and voice chat (only voice is allowed by default), no login required
- [x] Audio noise reduction, support for ***Speex*** and ***RNNdenoise***(enabled by default), integration[web-noise-suppressor](https://github.com/sapphi-red/web-noise-suppressor), not support 
- [x] End-to-end Encryption(e2ee)
**safari**
- [x] Text chat in room, can send text or emoji
  - [x] More custom emoji support
  - [ ] More message types, including images, videos 🚩
- [x] Browser-based speaker, microphone, screen recording(Perfectly support **Chrome**, **Edge**, does **not** support speaker recording on **safari**)
- [ ] Latency calculate--Current implementation is very simple
- [x] Room password setting 
- [ ] Multiple entry points on the front side (polling a set of available apikeys) to improve reliability
- [ ] Optimized for mobile - works | **good** | excellent 

(🚩means  indicate  the current ongoing)

## Running locally

Clone the repo and install dependencies:

```bash
git clone git@github.com:velor2012/anonymous-chat-room.git
cd anonymous-chat-room
yarn install
```

Create a new LiveKit project at <http://cloud.livekit.io>. Then create a new key in your [project settings](https://cloud.livekit.io/projects/p_/settings/keys).

Modify env.example to env.local, and change the configuration according to the actual situation

Then run the development server:

```bash
npm run dev
```

You can test it by opening <http://localhost:3000> in a browser.

## Deploying for production

This is a nextjs app, which you can deploy by following these steps
1. fork the shoe repository
2. import directly to vercel
3. set you environment variables

## Thanks

this repository is built on the top of
 - [Free4chat](https://github.com/madawei2699/free4chat)
 - [livekit meet](https://github.com/livekit/meet)
 - [spatial-audio](https://github.com/livekit-examples/)
 - [Mornin](https://mornin.fm/) 
 - [liveKit](https://livekit.io) 
 - [liveKit-React Sdk](https://github.com/livekit/components-js)
 - [RecordRTC](https://github.com/muaz-khan/RecordRTC)
 - [mic-speaker-recorder](https://github.com/asrul10/mic-speaker-recorder)

thanks for their heart of open source.