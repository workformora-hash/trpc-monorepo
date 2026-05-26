import Link from 'next/link';

export function Footer() {
  const sections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/#pricing' },
        { label: 'Explore Gallery', href: '/explore' },
        { label: 'Templates Gallery', href: '/templates' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Security', href: '#' },
        { label: 'Compliance', href: '#' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border px-6 sm:px-8 py-12 sm:py-16 bg-muted/30 text-left">
      <div className="mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center h-6 w-6 rounded-sm bg-primary text-primary-foreground font-bold text-xs">F</div>
              <span className="font-semibold text-foreground text-sm">FormBuilder</span>
            </div>
            <p className="text-sm text-muted-foreground">Beautiful forms for modern teams.</p>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
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
  );
}
