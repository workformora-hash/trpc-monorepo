'use client';

import { 
  Zap, Palette, Shield, Share2, BarChart3, Users 
} from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Drag & Drop Builder',
      description: 'Create forms in seconds with our intuitive builder. No technical skills required. Design beautiful forms without writing code.',
    },
    {
      icon: Palette,
      title: 'Stunning Themes',
      description: 'Choose from professionally designed themes. Customize colors, fonts, and branding to match your business perfectly.',
    },
    {
      icon: Shield,
      title: 'Smart Validation',
      description: 'Ensure data quality with built-in field validation. Reduce errors and improve response quality automatically.',
    },
    {
      icon: Share2,
      title: 'Easy Distribution',
      description: 'Share via direct link, email, or QR code. Embed forms on your website or distribute anywhere your audience is.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Watch responses come in live. See detailed insights, charts, and trends to understand your respondents better.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members to create and manage forms together. Share access and work collaboratively.',
    },
  ];

  return (
    <section id="features" className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Everything you need to succeed</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">Our platform makes it easy to create, customize, and deploy professional forms that get results.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="group rounded-lg border border-border p-6 hover:border-primary/50 hover:bg-primary/5 transition-all">
                <Icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
