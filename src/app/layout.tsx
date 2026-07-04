import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const onest = Onest({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Ollama Studio',
  description: 'Premium local AI model management dashboard for Ollama',
  icons: {
    icon: '/ollama-icon.png',
    apple: '/ollama-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ollama-studio-storage');if(t){var s=JSON.parse(t);var theme=s&&s.state&&s.state.theme;if(theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}else{if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark')}}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={onest.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
