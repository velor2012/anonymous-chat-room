import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import TopBar  from '@/components/TopBar';
import 'animate.css';

export default function App({ Component, pageProps }: AppProps) {
    //TODO 在这里查看哪组api key可用
  return (
    <div className=' z-0'>
            <TopBar/>
            <Component {...pageProps} />
    </div>
  );
}
