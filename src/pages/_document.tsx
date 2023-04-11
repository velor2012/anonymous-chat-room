import { Html, Head, Main, NextScript } from 'next/document';
import { theme } from "@/tools/setting";
import Script from 'next/script'
export default function Document() {
  return (
    <Html lang="en" >
      <Head>
        <script src="https://www.WebRTC-Experiment.com/RecordRTC.js"></script>
      </Head>
      <body style={{backgroundColor: theme.color3}}>
        <Main />
        <NextScript />
      { (
        <Script
            src={process.env.UMAMI_URL}
            strategy='afterInteractive'
            data-website-id={process.env.UMAMI_ID}
        />
      )}
      </body>
    </Html>
  );
}
