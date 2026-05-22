'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/client';

export function Pricing() {
  const { data: userSession } = trpc.auth.getCurrentUser.useQuery();
  const user = userSession?.user;

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Get started',
      features: [
        'Up to 5 forms',
        'Unlimited responses',
        'Basic analytics',
        'Email support',
      ],
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For growing teams',
      features: [
        'Unlimited forms',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access',
        'Team collaboration',
        'Form logic',
        'Conditional routing',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organizations',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom contracts',
        'SLA guarantee',
        'Advanced security',
        'White-label option',
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Plans that grow with you</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">Start free. Upgrade when you&apos;re ready. No surprises, ever.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-lg border transition-all ${
                plan.highlighted
                  ? 'border-primary bg-primary/2 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              } p-8`}
            >
              {plan.highlighted && (
                <div className="mb-4">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Most popular
                  </span>
                </div>
              )}

              <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-light text-foreground">{plan.price}</span>
                {plan.price !== 'Custom' && plan.price !== 'Free' && (
                  <span className="text-muted-foreground text-sm">/month</span>
                )}
              </div>

              <Link href={user ? "/dashboard" : "/signup"}>
                <Button
                  className={`w-full mt-8 h-10 ${
                    plan.highlighted
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'border border-border hover:border-foreground text-foreground'
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {user ? "Go to Dashboard" : "Get started"}
                </Button>
              </Link>

              <div className="mt-8 space-y-3">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
