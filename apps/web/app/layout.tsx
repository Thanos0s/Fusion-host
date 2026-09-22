import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'FusionHost — "Tell your agent once, ship your app"',
  description: 'Zero-config PaaS built for AI coding agents and developers. Deterministic analysis, automatic PostgreSQL provisioning, and live deployment in seconds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-background text-slate-100 antialiased selection:bg-primary/30 selection:text-primary">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
