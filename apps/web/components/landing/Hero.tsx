'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/client';

export function Hero() {
  const { data: userSession } = trpc.auth.getCurrentUser.useQuery();
  const user = userSession?.user;

  return (
    <section className="relative px-6 sm:px-8 py-16">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="text-balance text-5xl sm:text-6xl lg:text-7xl font-light leading-none tracking-tight text-foreground mb-8">
          Build forms that <br /> <span className="font-semibold text-primary">convert</span> and engage
        </h1>
        <p className="text-balance mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground mb-12">
          Create beautiful, fully responsive forms in minutes. No coding needed. Collect data, understand your customers, and make better decisions faster.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href={user ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 gap-2 w-full sm:w-auto">
              {user ? "Go to Dashboard" : "Get started free"} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" className="border border-border hover:border-foreground h-11 px-6 w-full sm:w-auto">
            Watch video
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span>No credit card</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span>Simple pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span>Built for growth</span>
          </div>
        </div>
      </div>

      {/* Hero Visual */}
      <div className="mt-20 mx-auto max-w-4xl">
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden aspect-video">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-primary font-medium text-sm">Interactive form preview</div>
              <div className="space-y-3 w-full px-8">
                <div className="h-2 w-24 rounded-full bg-border mx-auto" />
                <div className="h-2 w-32 rounded-full bg-border mx-auto" />
                <div className="mt-6 h-9 w-32 rounded-lg bg-primary/20 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
