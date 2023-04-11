import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import TopBar  from '@/components/TopBar';
import 'animate.css';
import Script from 'next/script';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
    //TODO 在这里查看哪组api key可用
  return (
    <>
    <Head>
        <title>Anonymous Chat Room Power By Livekit And Next.js</title>
        <meta
        name="description"
        content="Anonymous Chat Room Power By Livekit And Next.js"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
    </Head>
      <div className=' z-0'>
            { (
                <Script
                    src={process.env.UMAMI_URL}
                    strategy='afterInteractive'
                    data-website-id={process.env.UMAMI_ID}
                />
            )}
            <TopBar/>
            <Component {...pageProps} />
    </div>
    </>
  );
}
