import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthCheck } from '@/components/AuthCheck';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NutriVision AI',
  description: 'Empowering your health journey with artificial intelligence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthCheck>
            {children}
          </AuthCheck>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
