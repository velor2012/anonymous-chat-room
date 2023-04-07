/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
    env:{
        LIVEKIT_API_KEY:"APImSyUbtK5AK5B",
        LIVEKIT_API_SECRET:"IssJYSxfUTG9Vp8bRkKy9lL5AcNjd0fPlJcVnCuI6jN",
        LIVEKIT_WS_URL:"wss://test-vbdq8el4.livekit.cloud",
        PING_URL:"",
    }
};

module.exports = nextConfig;
