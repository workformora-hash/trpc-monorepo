'use client';

import { ArrowRight, CheckCircle2, Lock, Zap, BarChart3, Users, Database, Code2, Shield, Palette, Share2, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-7 w-7 rounded-sm bg-primary text-primary-foreground font-bold text-sm">F</div>
              <span className="font-semibold text-foreground tracking-tight">FormBuilder</span>
            </div>
            <div className="hidden md:flex items-center gap-12 text-sm">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hidden sm:inline-flex text-sm h-9">Sign in</Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9">Start free</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 sm:px-8 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-balance text-5xl sm:text-6xl lg:text-7xl font-light leading-none tracking-tight text-foreground mb-8">
            Build forms that <br /> <span className="font-semibold text-primary">convert</span> and engage
          </h1>
          <p className="text-balance mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground mb-12">
            Create beautiful, fully responsive forms in minutes. No coding needed. Collect data, understand your customers, and make better decisions faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 gap-2 w-full sm:w-auto">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
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

      {/* Features Section - Core Features */}
      <section id="features" className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Everything you need to succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">Our platform makes it easy to create, customize, and deploy professional forms that get results.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((feature, i) => {
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

      {/* Features Section - Advanced Features */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Powerful tools for growth</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">Manage responses, analyze data, and automate your workflow with enterprise features.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: 'Beautiful Dashboards',
                description: 'View all your responses in one place. See charts, trends, and key metrics at a glance. Understand what your data means.',
              },
              {
                title: 'Export & Integrate',
                description: 'Download responses as CSV. Connect to your favorite tools via API. Automate your workflow and eliminate manual work.',
              },
              {
                title: 'Email Notifications',
                description: 'Get alerted instantly when responses arrive. Send automatic confirmations to your respondents. Stay connected with your data.',
              },
              {
                title: 'Advanced Filtering',
                description: 'Filter and search responses by any field. Find what matters most. Export subsets of data for deeper analysis.',
              },
              {
                title: 'Response Management',
                description: 'Organize, track, and manage all your responses. View submission details, timestamps, and complete history.',
              },
              {
                title: 'Security & Privacy',
                description: 'Your data is secure and encrypted. Control who can access your forms. GDPR compliant and always private.',
              },
            ].map((feature, i) => (
              <div key={i} className="group border-b border-border pb-8">
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Field Types Section */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Build any form type</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">15+ field types to capture exactly the information you need. From simple text to complex ratings and dropdowns.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Short Text',
              'Long Text',
              'Email',
              'Number',
              'Single Select',
              'Multi Select',
              'Checkbox',
              'Date',
              'Rating',
              'Dropdown',
              'Phone Number',
              'URL',
            ].map((fieldType, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="h-3 w-3 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{fieldType}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Features Section */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Your forms, organized</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">A clean, simple dashboard to manage all your forms. Create more, organize better, collaborate faster.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Quick Preview',
                description: 'See exactly how your form looks to respondents before you publish. No surprises.',
              },
              {
                title: 'Duplicate & Save',
                description: 'Create variations of successful forms with one click. Build on what works.',
              },
              {
                title: 'Smart URLs',
                description: 'Create custom form URLs that match your brand. Easy to remember and share.',
              },
              {
                title: 'Form History',
                description: 'Keep track of all your forms. Archive old ones and focus on what&apos;s active.',
              },
              {
                title: 'Instant Publishing',
                description: 'Go live in seconds. Publish, unpublish, or pause forms whenever you need.',
              },
              {
                title: 'Organize Better',
                description: 'Categorize and tag your forms. Find what you need in seconds.',
              },
            ].map((feature, i) => (
              <div key={i} className="group">
                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Respondent Features Section */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Higher completion rates</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">Forms that respondents love to fill out. Beautiful design and smooth experience on every device.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Zero Friction',
                description: 'No sign-up required. Respondents can submit instantly. Remove barriers to completion.',
              },
              {
                title: 'Perfect Everywhere',
                description: 'Works beautifully on phones, tablets, and desktops. One responsive experience for everyone.',
              },
              {
                title: 'Clear Guidance',
                description: 'Real-time validation helps respondents fill forms correctly. Fewer errors, better data.',
              },
              {
                title: 'Professional Finish',
                description: 'Beautiful thank-you screens after submission. Leave a great impression.',
              },
              {
                title: 'Progress Tracking',
                description: 'Show respondents how far along they are. Multi-page forms feel manageable.',
              },
              {
                title: 'Error Recovery',
                description: 'Helpful messages guide respondents when something goes wrong. Easy to fix and continue.',
              },
            ].map((feature, i) => (
              <div key={i} className="group rounded-lg border border-border p-6 hover:border-primary/50 hover:bg-primary/5 transition-all">
                <h3 className="text-base font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Works for any use case</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">From customer feedback to event registration, FormBuilder adapts to your needs.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: 'Customer Feedback', description: 'Gather insights to improve your products and services.' },
              { name: 'Lead Generation', description: 'Convert visitors into qualified leads effortlessly.' },
              { name: 'Surveys & Research', description: 'Understand market trends and customer preferences.' },
              { name: 'Event Registration', description: 'Manage registrations and collect attendee information.' },
              { name: 'Job Applications', description: 'Accept and track applications with custom workflows.' },
              { name: 'Contact Forms', description: 'Simple, beautiful contact forms for your website.' },
            ].map((useCase, i) => (
              <div key={i} className="group">
                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{useCase.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Why FormBuilder wins</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">Smart features that save you time and help you get better results.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Instant Setup', description: 'Start creating forms right now. No credit card, no long onboarding.' },
              { title: 'Beautiful by Default', description: 'Professional-looking forms without any design skills. Choose a theme and go.' },
              { title: 'Smart Sharing', description: 'Share via direct link, QR code, or embed anywhere. Works everywhere.' },
              { title: 'Data Insights', description: 'See analytics that make sense. Charts, trends, and what respondents care about.' },
              { title: 'Easy Export', description: 'Download all responses as CSV. Analyze in Excel or send to your tools.' },
              { title: 'Mobile Perfect', description: 'Forms look and work beautifully on every device. No separate mobile forms.' },
              { title: 'Unlimited Responses', description: 'Collect as many responses as you need. No limits or overage fees.' },
              { title: 'Always Secure', description: 'Your data is safe. Enterprise security, no compromises.' },
            ].map((benefit, i) => (
              <div key={i} className="group">
                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">FormBuilder vs the rest</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">See why professionals choose FormBuilder over expensive alternatives.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">FormBuilder</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Typeform</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Google Forms</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">JotForm</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Drag & Drop Builder', formBuilder: true, typeform: true, google: true, jotform: true },
                  { feature: 'Beautiful Themes', formBuilder: true, typeform: true, google: false, jotform: true },
                  { feature: 'Real-time Analytics', formBuilder: true, typeform: true, google: true, jotform: true },
                  { feature: 'Conditional Logic', formBuilder: true, typeform: true, google: false, jotform: true },
                  { feature: 'CSV Export', formBuilder: true, typeform: true, google: true, jotform: true },
                  { feature: 'Free Plan', formBuilder: true, typeform: false, google: true, jotform: true },
                  { feature: 'Unlimited Responses (Free)', formBuilder: true, typeform: false, google: true, jotform: false },
                  { feature: 'API Access', formBuilder: true, typeform: true, google: false, jotform: true },
                  { feature: 'Affordable Pro Plan', formBuilder: true, typeform: false, google: 'N/A', jotform: true },
                  { feature: 'No Setup Fee', formBuilder: true, typeform: true, google: 'N/A', jotform: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-4 text-foreground font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.formBuilder === true && <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />}
                      {row.formBuilder === false && <div className="h-5 w-5 border border-border rounded mx-auto" />}
                    </td>
                    <td className="py-4 px-4 text-center text-muted-foreground">
                      {row.typeform === true && <CheckCircle2 className="h-5 w-5 text-muted-foreground mx-auto" />}
                      {row.typeform === false && <div className="h-5 w-5 border border-border rounded mx-auto" />}
                    </td>
                    <td className="py-4 px-4 text-center text-muted-foreground">
                      {row.google === true && <CheckCircle2 className="h-5 w-5 text-muted-foreground mx-auto" />}
                      {row.google === false && <div className="h-5 w-5 border border-border rounded mx-auto" />}
                      {row.google === 'N/A' && <span className="text-xs">N/A</span>}
                    </td>
                    <td className="py-4 px-4 text-center text-muted-foreground">
                      {row.jotform === true && <CheckCircle2 className="h-5 w-5 text-muted-foreground mx-auto" />}
                      {row.jotform === false && <div className="h-5 w-5 border border-border rounded mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 p-6 rounded-lg border border-primary/20 bg-primary/5">
            <p className="text-center text-foreground">
              <span className="font-semibold">Save up to 80% compared to Typeform</span> while getting more features and better support.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-6 sm:px-8 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Built for your workflow</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">From customer feedback to event registration, FormBuilder adapts to your needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Customer Research',
                description: 'Gather deep insights through surveys, feedback forms, and customer interviews.',
              },
              {
                title: 'Lead Generation',
                description: 'Convert website visitors into qualified leads with optimized registration forms.',
              },
              {
                title: 'Event Management',
                description: 'Manage registrations, collect information, and automate follow-ups seamlessly.',
              },
              {
                title: 'Product Feedback',
                description: 'Understand what your customers really think and iterate based on real data.',
              },
              {
                title: 'Team Collaboration',
                description: 'Collect internal feedback, run surveys, and align teams around shared goals.',
              },
              {
                title: 'Content Upgrades',
                description: 'Build email lists by gating valuable resources behind simple, beautiful forms.',
              },
            ].map((useCase, i) => (
              <div key={i} className="group">
                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Plans that grow with you</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">Start free. Upgrade when you&apos;re ready. No surprises, ever.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((plan, i) => (
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

                <Button
                  className={`w-full mt-8 h-10 ${
                    plan.highlighted
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'border border-border hover:border-foreground text-foreground'
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  Get started
                </Button>

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

      {/* Getting Started Guide */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Create your first form in 5 minutes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">It&apos;s easier than you think. Follow these simple steps to get started.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {[
                {
                  number: '1',
                  title: 'Sign up (30 seconds)',
                  description: 'Create a free account with your email. No credit card needed. Instant access to everything.',
                },
                {
                  number: '2',
                  title: 'Choose a template or start blank',
                  description: 'Pick from our collection of beautiful templates or create a custom form from scratch.',
                },
                {
                  number: '3',
                  title: 'Add your questions',
                  description: 'Drag and drop fields to build your form. Add text, email, select, rating, and more. Takes minutes.',
                },
                {
                  number: '4',
                  title: 'Customize with a theme',
                  description: 'Choose a beautiful theme that matches your brand. Customize colors and fonts in seconds.',
                },
                {
                  number: '5',
                  title: 'Share and collect responses',
                  description: 'Share your form via link, QR code, or embed on your website. Start collecting responses instantly.',
                },
              ].map((step) => (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground font-semibold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full rounded-2xl border border-border bg-card p-8 text-center">
                <div className="flex items-center justify-center h-64 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-border/50">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 mb-4">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Beautiful form</h4>
                    <p className="text-sm text-muted-foreground">Preview of your form appears here</p>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="h-3 w-32 rounded-full bg-border mx-auto" />
                  <div className="h-3 w-24 rounded-full bg-border mx-auto" />
                  <div className="h-3 w-28 rounded-full bg-border mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">
            Ready to start collecting responses?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Create your first form today. Free forever for up to 5 forms. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 gap-2 w-full sm:w-auto">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="border border-border hover:border-foreground h-11 px-6 w-full sm:w-auto">
              See pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 sm:px-8 py-12 sm:py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center h-6 w-6 rounded-sm bg-primary text-primary-foreground font-bold text-xs">F</div>
                <span className="font-semibold text-foreground text-sm">FormBuilder</span>
              </div>
              <p className="text-sm text-muted-foreground">Beautiful forms for modern teams.</p>
            </div>
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Integrations', 'API Docs'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact'],
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Security', 'Compliance'],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-foreground text-sm mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 FormBuilder. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
