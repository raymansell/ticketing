// import "@/styles/globals.css";
import BaseLayout from '@/components/BaseLayout';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <BaseLayout currentUser={pageProps.currentUser}>
      <Component {...pageProps} />
    </BaseLayout>
  );
}
