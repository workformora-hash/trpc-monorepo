'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Globe, Search, Loader2, Calendar, FileText, ChevronRight, Sparkles 
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/client';
import { Navbar } from '~/components/landing/Navbar';
import { Footer } from '~/components/landing/Footer';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  const { data: exploreData, isLoading } = trpc.form.listExploreForms.useQuery({
    search: search.trim() || undefined,
    theme: selectedTheme === 'all' ? undefined : selectedTheme,
    limit: 50,
  });

  const forms = exploreData?.forms || [];

  const themes = [
    { id: 'all', label: 'All Categories' },
    { id: 'default', label: 'Slate Default' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'ocean', label: 'Ocean' },
    { id: 'forest', label: 'Forest' },
    { id: 'japanese', label: 'Edo Sakura' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 dark:text-neutral-100 text-foreground flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Globe className="h-3 w-3 animate-pulse" />
            <span>Discover Public Forms</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-neutral-100 dark:to-neutral-400">
            Explore public submissions & templates
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            See what the community is building, find beautiful form designs, and get inspired. Feel free to open and test-submit responses!
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search forms by title, description, or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-250 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 dark:text-neutral-200 text-neutral-800 transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-start w-full md:w-auto">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedTheme === t.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Link 
                key={form.id}
                href={`/form/${form.slug}`}
                className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl hover:border-primary/50 transition-all flex flex-col justify-between h-56 shadow-xs"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/10">
                      {form.theme} theme
                    </span>
                    <span className="text-[10px] dark:text-neutral-550 text-neutral-400 font-medium flex items-center gap-1">
                      <Globe className="h-3 w-3" /> public
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold dark:text-neutral-100 text-neutral-800 mt-4 group-hover:text-primary transition-colors line-clamp-1">
                    {form.title}
                  </h3>
                  <p className="text-xs dark:text-neutral-400 text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {form.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] dark:text-neutral-500 text-neutral-400 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> 
                    {new Date(form.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Fill Form <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}

            {forms.length === 0 && (
              <div className="col-span-full border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-16 text-center space-y-4">
                <FileText className="h-10 w-10 text-neutral-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold dark:text-neutral-200 text-neutral-800">No public forms found</h3>
                  <p className="dark:text-neutral-400 text-neutral-500 text-xs max-w-sm mx-auto">
                    Try searching for another keyword or selecting a different category filter.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
