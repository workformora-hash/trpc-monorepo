'use client';

import { Loader2 } from 'lucide-react';
import { trpc } from '~/trpc/client';
import { Navbar } from '~/components/landing/Navbar';
import { Hero } from '~/components/landing/Hero';
import { Features } from '~/components/landing/Features';
import { SocialProof } from '~/components/landing/SocialProof';
import { HowItWorks } from '~/components/landing/HowItWorks';
import { Pricing } from '~/components/landing/Pricing';
import { FAQ } from '~/components/landing/FAQ';
import { CallToAction } from '~/components/landing/CTA';
import { Footer } from '~/components/landing/Footer';

export default function HomeClient() {
  const { isLoading: sessionLoading } = trpc.auth.getCurrentUser.useQuery();

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading secure session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />
      <Hero />
      <Features />
      <SocialProof />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CallToAction />
      <Footer />
    </div>
  );
}
