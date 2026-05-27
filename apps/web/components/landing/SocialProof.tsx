'use client';

const stats = [
  { value: '12k+', label: 'Forms published' },
  { value: '1.8M+', label: 'Responses collected' },
  { value: '99.9%', label: 'Uptime reliability' },
  { value: '4.8/5', label: 'Average user rating' },
];

export function SocialProof() {
  return (
    <section className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Trusted by teams that move fast</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            From startups to larger organizations, teams rely on FormBuilder to launch forms quickly and collect high-quality responses.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border p-6 bg-card">
              <p className="text-3xl sm:text-4xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
