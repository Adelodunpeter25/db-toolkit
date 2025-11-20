import dynamic from 'next/dynamic';
import Features from '@/components/Features';
import UseCases from '@/components/UseCases';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Hero = dynamic(() => import('@/components/Hero'), { ssr: true });

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <UseCases />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
