import { Html, Head, Main, NextScript } from 'next/document';
import { theme } from "@/lib/const";
import Script from 'next/script';
export default function Document() {
  return (
    <Html lang="en"  data-theme="garden">
      <Head>
      </Head>
      <body  className=" w-screen h-screen m-0 p-0 bg-neutral-content" >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}