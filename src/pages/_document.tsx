import { Html, Head, Main, NextScript } from 'next/document';
import { theme } from "@/tools/setting";
export default function Document() {
  return (
    <Html lang="en" >
      <Head>
        <script src="https://www.WebRTC-Experiment.com/RecordRTC.js"></script>
      </Head>
      <body style={{backgroundColor: theme.color3}}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
