import Head from 'next/head';
import { Inter } from 'next/font/google';
import styles from '@/styles/App.module.css';
import Home from './Home';

export default function App() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.center}>
          <Home />
        </div>
      </main>
    </>
  );
}
