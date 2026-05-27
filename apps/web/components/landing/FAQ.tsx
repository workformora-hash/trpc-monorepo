'use client';

const faqs = [
  {
    question: 'Can I use FormBuilder for free?',
    answer: 'Yes. The Starter plan is free and supports up to 5 forms with unlimited responses.',
  },
  {
    question: 'Can I embed forms on my website?',
    answer: 'Yes. You can share forms with a direct link, QR code, or embed them directly on your site.',
  },
  {
    question: 'Does FormBuilder support team collaboration?',
    answer: 'Yes. Pro and higher plans support collaboration so teams can build and manage forms together.',
  },
];

export function FAQ() {
  return (
    <section className="px-6 sm:px-8 py-20 sm:py-28 border-t border-border">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-light mb-6 text-foreground">Frequently asked questions</h2>
          <p className="text-lg text-muted-foreground">Quick answers to help you get started with confidence.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-lg border border-border p-6 bg-card">
              <h3 className="text-base font-semibold text-foreground mb-2">{faq.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
