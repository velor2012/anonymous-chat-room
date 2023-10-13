# 简介
这是一个基于[livekit](https://livekit.io/) 和 [Next.js](https://nextjs.org/)的匿名聊天室

> ⚠️ 由于main分支的网页超过一定的人数后会出现电流麦，实在找不到问题，因此本分支在[livekit meet](https://github.com/livekit/meet)的基础上进行了重构

[ENGLISH](./README.md) | 中文

## Demo

在线体验地址：<https://chat.cwy666.eu.org/>

这个Demo使用[livekit cloud ](https://cloud.livekit.io) 的免费服务，当超过免费额度(每月50G流量)时会自动停止

## 特点
- [x] 部署简单，前端支持直接部署到vercel, 后端可以直接使用  [livekit cloud ](https://cloud.livekit.io) 的免费服务，也可以按照[官方文档](https://docs.livekit.io)自建
- [x] 支持视频，语音聊天(默认只允许语音)，无需登录
- [x] 音频降噪，支持speex以及RNNdenoise(默认开启), 整合[web-noise-suppressor](https://github.com/sapphi-red/web-noise-suppressor), 不支持safari
- [x] End-to-end Encryption(e2ee)
- [x] 支持文本聊天，也可以使用emoji
  - [x] 支持emoji表情搜索
  - [ ] 支持更多的消息类型，如图片，视频 🚩
- [x] 支持浏览器直接录制麦克风，扬声器和屏幕( **Chrome**, **Edge**可以完全支持,  **safari** 不支持扬声器录制)
- [ ] 延迟测试--当前版本实现很简陋
- [x] 设置房间密码 
- [ ] 前端可以选择使用多个apikey，通过轮询的方式选择可用的入口
- [ ] 优化移动端显示 - works | **good** | excellent 

(🚩表示正在进行的工作)

## 本地部署

克隆或下载本仓库:

```bash
git clone git@github.com:velor2012/anonymous-chat-room.git
cd anonymous-chat-room
yarn install
```

在 <http://cloud.livekit.io> 上创建一个新的Project. 然后生成apikey [project settings](https://cloud.livekit.io/projects/p_/settings/keys).

按照提示，修改env.example中的环境变量，然后重命名为env.local

然后运行以下命令

```bash
npm run dev
```

之后就可以在 <http://localhost:3000> 打开.

## 部署到生产环境

这是一个标准的nextjs网站，可以按照下列步骤部署
1. fork 这个项目
2. 如果使用容器部署，设置环境变量，否则设置env.local文件
3. 直接部署到vercel或者yarn build && yarn start的方式部署

## Thanks

这个项目基于
 - [Free4chat](https://github.com/madawei2699/free4chat)
 - [livekit meet](https://github.com/livekit/meet)
 - [spatial-audio](https://github.com/livekit-examples/)
 - [Mornin](https://mornin.fm/) 
 - [liveKit](https://livekit.io) 
 - [liveKit-React Sdk](https://github.com/livekit/components-js)
 - [RecordRTC](https://github.com/muaz-khan/RecordRTC)
 - [mic-speaker-recorder](https://github.com/asrul10/mic-speaker-recorder)

尤其是思路和界面设计，受到[Free4chat](https://github.com/madawei2699/free4chat)以及[livekit meet](https://github.com/livekit/meet)的影响极大，非常感谢该库作者！