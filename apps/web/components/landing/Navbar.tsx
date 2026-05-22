'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { LayoutDashboard, Sun, Moon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/client';

export function Navbar() {
  const { data: userSession } = trpc.auth.getCurrentUser.useQuery();
  const user = userSession?.user;

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
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
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 text-muted-foreground hover:text-foreground mr-1"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}

            {user ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9 flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:inline-flex text-sm h-9">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9">Start free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
