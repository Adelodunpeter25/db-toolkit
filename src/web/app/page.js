import dynamic from 'next/dynamic';
import Features from '@/components/Features';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Hero = dynamic(() => import('@/components/Hero'), { ssr: true });

export const metadata = {
  title: 'DB Toolkit - Modern Database Management Tool',
  description: 'A modern, cross-platform desktop database management application. Query, migrate, and backup databases effortlessly with support for PostgreSQL, MySQL, SQLite, and MongoDB.',
  keywords: 'database management, PostgreSQL, MySQL, SQLite, MongoDB, database tool, SQL client, database migration, database backup',
  openGraph: {
    title: 'DB Toolkit - Modern Database Management Tool',
    description: 'Query, migrate, and backup databases effortlessly with DB Toolkit',
    url: 'https://dbtoolkit.vercel.app',
    siteName: 'DB Toolkit',
    type: 'website',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
