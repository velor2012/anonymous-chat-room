import Head from 'next/head';
import { Inter } from 'next/font/google';
import styles from '@/styles/App.module.css';
import Home from './Home';

export default function App() {
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
      <main className={styles.main}>
        <div className={styles.center}>
          <Home />
        </div>
      </main>
    </>
  );
}
