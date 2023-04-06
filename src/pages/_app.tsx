import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import TopBar  from '@/components/TopBar';
import 'animate.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className=' z-0'>
            <TopBar/>
            <Component {...pageProps} />
    </div>
  );
}
