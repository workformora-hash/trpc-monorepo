'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/client';

export function CTA() {
  const { data: userSession } = trpc.auth.getCurrentUser.useQuery();
  const user = userSession?.user;

  return (
    <section className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">
          Ready to start collecting responses?
        </h2>
        <p className="text-lg text-muted-foreground mb-10">
          Create your first form today. Free forever for up to 5 forms. No credit card required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={user ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 gap-2 w-full sm:w-auto">
              {user ? "Go to Dashboard" : "Get started free"} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#pricing" className="w-full sm:w-auto">
            <Button variant="outline" className="border border-border hover:border-foreground h-11 px-6 w-full">
              See pricing
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
