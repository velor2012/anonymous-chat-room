/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
    env:{
        LIVEKIT_API_KEY:"APIU4AvQSQT3mBx",
        LIVEKIT_API_SECRET:"iLyWQfucxfmSypdS7WktNbywxeEvFzpcJQ4sOHP5d9yB",
        LIVEKIT_WS_URL:"wss://rpc.cwy666.eu.org",
        // LIVEKIT_API_KEY:"APImSyUbtK5AK5B",
        // LIVEKIT_API_SECRET:"IssJYSxfUTG9Vp8bRkKy9lL5AcNjd0fPlJcVnCuI6jN",
        // LIVEKIT_WS_URL:"wss://test-vbdq8el4.livekit.cloud",
    }
};

module.exports = nextConfig;
