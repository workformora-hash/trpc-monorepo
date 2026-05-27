'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface DashboardHeaderProps {
  userName: string;
  isLoggingOut: boolean;
  onLogout: () => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  themeMounted: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const DashboardHeader = React.memo(({
  userName,
  isLoggingOut,
  onLogout,
  theme,
  setTheme,
  themeMounted,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b dark:border-neutral-800 border-border dark:bg-neutral-950/80 bg-background/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between font-sans">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-muted-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <Link href="/" className="flex items-center gap-3 hover:opacity-90">
          <div className="flex items-center justify-center h-8 w-8 rounded-sm bg-primary text-primary-foreground font-bold text-sm">F</div>
          <span className="font-semibold text-lg tracking-tight hidden xs:block">FormBuilder Creator</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm dark:text-neutral-400 text-muted-foreground hidden sm:block">
          Logged in as <span className="dark:text-neutral-100 text-foreground font-medium">{userName}</span>
        </div>

        {themeMounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="border dark:border-neutral-800 border-border dark:bg-neutral-900/50 bg-muted/50 dark:hover:bg-neutral-900 hover:bg-muted text-muted-foreground dark:text-neutral-300 hover:text-foreground dark:hover:text-neutral-100 h-8 w-8 mr-1"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        )}

        <Button 
          variant="ghost" 
          className="border dark:border-neutral-800 border-border dark:bg-neutral-900/50 bg-muted/50 dark:hover:bg-neutral-900 hover:bg-muted text-muted-foreground dark:text-neutral-300 hover:text-foreground dark:hover:text-neutral-100 text-xs px-3 h-8 flex items-center gap-1.5"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';
