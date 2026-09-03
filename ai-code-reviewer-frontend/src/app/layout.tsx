import type { Metadata } from 'next';
import { Figtree, Fraunces } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    default: 'Codebird',
    template: '%s · Codebird',
  },
  description: 'A bird reviews your code. Codebird reads your files, then tells you what to fix.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${fraunces.variable} font-sans`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1C1612',
              color: '#FBF7F0',
              borderRadius: '14px',
              boxShadow: '0 12px 28px rgba(28, 22, 18, 0.18)',
              fontFamily: 'var(--font-sans)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#E07A5F',
                secondary: '#FBF7F0',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#C45A3E',
                secondary: '#FBF7F0',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
