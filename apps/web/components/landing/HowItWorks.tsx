'use client';

import { FileText, Paintbrush2, Send } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: '1. Build your form',
    description: 'Add questions, structure pages, and set validation rules in a clean drag-and-drop editor.',
  },
  {
    icon: Paintbrush2,
    title: '2. Customize experience',
    description: 'Apply themes, brand colors, and typography so every form matches your product and voice.',
  },
  {
    icon: Send,
    title: '3. Share and analyze',
    description: 'Publish with a link or embed, then track responses and trends in your dashboard in real time.',
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">How it works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Go from idea to live form in minutes with a workflow designed for speed and clarity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-lg border border-border p-6 hover:border-primary/50 transition-colors">
                <Icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
