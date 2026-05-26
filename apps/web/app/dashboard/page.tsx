'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { 
  Plus, LogOut, FileText, ChevronRight, Calendar, Globe,
  LayoutDashboard, User, Sparkles, Loader2, BarChart3, Check, Sun, Moon
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/client';

export default function DashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  // Authentication and Session Check
  const { 
    data: userSession, 
    isLoading: sessionLoading, 
    refetch: refetchSession 
  } = trpc.auth.getCurrentUser.useQuery();

  const user = userSession?.user;

  // Redirect if not logged in after session loading completes
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push("/login");
    }
  }, [user, sessionLoading, router]);

  // Logout Mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Successfully logged out.");
      refetchSession();
      router.push("/");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to log out.");
    }
  });

  const [activeTab, setActiveTab] = useState<'forms' | 'explore' | 'templates' | 'profile'>('forms');
  const [cloningTemplateId, setCloningTemplateId] = useState<string | null>(null);

  // Queries for Creator Dashboard
  const { 
    data: creatorFormsData, 
    isLoading: formsLoading 
  } = trpc.form.listFormsCreator.useQuery(undefined, { enabled: !!user });

  const { 
    data: exploreFormsData,
    isLoading: exploreLoading
  } = trpc.form.listExploreForms.useQuery({}, { enabled: !!user && activeTab === 'explore' });

  const {
    data: templatesData = [],
    isLoading: templatesLoading
  } = trpc.form.listFormTemplates.useQuery(undefined, { enabled: !!user && activeTab === 'templates' });

  // Mutation to clone a template
  const createFormFromTemplate = trpc.form.createFormFromTemplate.useMutation({
    onSuccess: (data) => {
      toast.success("Successfully created form from template!");
      router.push(`/dashboard/form/${data.form.id}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form from template.");
      setCloningTemplateId(null);
    }
  });

  const handleUseTemplate = (templateId: string) => {
    setCloningTemplateId(templateId);
    createFormFromTemplate.mutate({ templateId });
  };

  const forms = creatorFormsData?.forms || [];

  if (sessionLoading || !user) {
    return (
      <div className="h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm font-semibold text-neutral-500">Checking session status...</span>
      </div>
    );
  }

  return (
    <div className="h-screen dark:bg-neutral-950 bg-background dark:text-neutral-100 text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Header Nav */}
      <header className="sticky top-0 z-40 border-b dark:border-neutral-800 border-border dark:bg-neutral-950/80 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90">
            <div className="flex items-center justify-center h-8 w-8 rounded-sm bg-primary text-primary-foreground font-bold text-sm">F</div>
            <span className="font-semibold text-lg tracking-tight">FormBuilder Creator</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm dark:text-neutral-400 text-muted-foreground">
            Logged in as <span className="dark:text-neutral-100 text-foreground font-medium">{user.name}</span>
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
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </Button>
        </div>
      </header>

      {/* Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r dark:border-neutral-800 border-border dark:bg-neutral-900/30 bg-neutral-100/50 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('forms')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'forms' ? 'bg-primary text-primary-foreground font-medium' : 'dark:text-neutral-400 text-muted-foreground dark:hover:text-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" /> My Forms
              </button>
              <button 
                onClick={() => setActiveTab('explore')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'explore' ? 'bg-primary text-primary-foreground font-medium' : 'dark:text-neutral-400 text-muted-foreground dark:hover:text-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <Globe className="h-4 w-4" /> Explore Gallery
              </button>
              <button 
                onClick={() => setActiveTab('templates')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'templates' ? 'bg-primary text-primary-foreground font-medium' : 'dark:text-neutral-400 text-muted-foreground dark:hover:text-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <Sparkles className="h-4 w-4" /> Templates Gallery
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'profile' ? 'bg-primary text-primary-foreground font-medium' : 'dark:text-neutral-400 text-muted-foreground dark:hover:text-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <User className="h-4 w-4" /> My Account
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl dark:bg-neutral-900/60 bg-white border dark:border-neutral-800 border-border text-center shadow-sm">
            <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-xs font-semibold">Starter Plan</div>
            <div className="text-[10px] dark:text-neutral-400 text-muted-foreground mt-1">Up to 5 forms & unlimited submissions</div>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-8 dark:bg-neutral-950 bg-neutral-50/50 transition-colors duration-300">
          {/* ACTIVE TAB: EXPLORE GALLERY */}
          {activeTab === 'explore' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div>
                <h1 className="text-3xl font-light tracking-tight dark:text-neutral-100 text-foreground">Explore Templates & Gallery</h1>
                <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-2">See what other creators are building, and get inspired by templates.</p>
              </div>

              {exploreLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exploreFormsData?.forms.map((form) => (
                    <div key={form.id} className="dark:bg-neutral-900 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl hover:border-primary/50 transition-all flex flex-col justify-between h-48 shadow-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-primary tracking-wider">{form.theme} theme</span>
                        <h3 className="text-base font-semibold dark:text-neutral-100 text-foreground mt-1">{form.title}</h3>
                        <p className="text-xs dark:text-neutral-400 text-muted-foreground mt-2 line-clamp-2">{form.description || "No description provided."}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs dark:text-neutral-500 text-muted-foreground/80 pt-4 border-t dark:border-neutral-800 border-border">
                        <span>By user: {form.userId.slice(0, 8)}</span>
                      </div>
                    </div>
                  ))}

                  {exploreFormsData?.forms.length === 0 && (
                    <div className="col-span-full text-center py-20 dark:text-neutral-500 text-muted-foreground/80">
                      No public forms found in explore gallery yet. Be the first to publish one!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TAB: TEMPLATES GALLERY */}
          {activeTab === 'templates' && (
            <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
              <div>
                <h1 className="text-3xl font-light tracking-tight dark:text-neutral-100 text-foreground">Templates Gallery</h1>
                <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-1">Select a pre-made form blueprint to jumpstart your workflow.</p>
              </div>

              {templatesLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templatesData.map((template) => (
                    <div 
                      key={template.id} 
                      className="dark:bg-neutral-900 bg-white border dark:border-neutral-850 border-neutral-200 p-6 rounded-2xl hover:border-primary/50 transition-all flex flex-col justify-between h-64 shadow-xs text-left"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Feedback blueprint</span>
                        <h3 className="text-base font-semibold dark:text-neutral-100 text-neutral-800 mt-2 line-clamp-1">{template.name}</h3>
                        <p className="text-xs dark:text-neutral-400 text-neutral-500 mt-2 line-clamp-2 leading-relaxed">{template.description}</p>
                        
                        <div className="mt-3 text-[10px] dark:text-neutral-500 text-neutral-400 font-bold">
                          Includes {template.fields.length} questions
                        </div>
                      </div>

                      <div className="pt-4 border-t dark:border-neutral-800 border-neutral-100 mt-4">
                        <Button
                          disabled={cloningTemplateId !== null}
                          onClick={() => handleUseTemplate(template.id)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-9 flex items-center justify-center gap-1.5 rounded-lg"
                        >
                          {cloningTemplateId === template.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Creating draft...</span>
                            </>
                          ) : (
                            <>
                              <span>Use this blueprint</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TAB: PROFILE & ACCOUNT */}
          {activeTab === 'profile' && (
            <div className="space-y-8 max-w-2xl mx-auto dark:bg-neutral-900 bg-white border dark:border-neutral-800 border-border p-8 rounded-2xl shadow-sm">
              <div>
                <h1 className="text-2xl font-light dark:text-neutral-100 text-foreground">Account Settings</h1>
                <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-1">Manage your creator profile and preferences.</p>
              </div>

              <div className="space-y-4 pt-4 border-t dark:border-neutral-800 border-border">
                <div className="grid grid-cols-3 gap-4 py-2 border-b dark:border-neutral-800/50 border-border/50">
                  <span className="text-sm dark:text-neutral-400 text-muted-foreground">Full Name</span>
                  <span className="text-sm font-semibold col-span-2">{user.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2 border-b border-neutral-800/50">
                  <span className="text-sm text-neutral-400 font-medium">Email Address</span>
                  <span className="text-sm font-semibold col-span-2">{user.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <span className="text-sm text-neutral-400">Status</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 inline-flex w-fit items-center gap-1">
                    <Check className="h-3 w-3" /> Active
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3 mt-8">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">You are on the Free Tier</h4>
                  <p className="text-xs text-neutral-450 mt-1">Upgrade to Premium for custom domains, unlimited forms, custom styling, and smart logic integrations.</p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE TAB: FORMS */}
          {activeTab === 'forms' && (
            <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
              {/* Header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-light tracking-tight dark:text-neutral-100 text-foreground">My Forms</h1>
                  <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-1">Create, build, and view response analytics for your forms.</p>
                </div>

                <Button 
                  onClick={() => router.push('/dashboard/create')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 h-10 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Create Form
                </Button>
              </div>

              {/* Quick Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="dark:bg-neutral-900/50 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl flex items-center gap-4 shadow-xs">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs dark:text-neutral-400 text-muted-foreground">Total Forms</div>
                    <div className="text-2xl font-bold">{forms.length}</div>
                  </div>
                </div>
                <div className="dark:bg-neutral-900/50 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl flex items-center gap-4 shadow-xs">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs dark:text-neutral-400 text-muted-foreground">Published Forms</div>
                    <div className="text-2xl font-bold">
                      {forms.filter(f => f.isPublished).length}
                    </div>
                  </div>
                </div>
                <div className="dark:bg-neutral-900/50 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl flex items-center gap-4 shadow-xs">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs dark:text-neutral-400 text-muted-foreground">Status</div>
                    <div className="text-sm font-semibold dark:text-neutral-200 text-foreground">System Healthy</div>
                  </div>
                </div>
              </div>

              {/* Forms List Grid */}
              {formsLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms.map((form) => (
                    <div 
                       key={form.id} 
                       onClick={() => router.push(`/dashboard/form/${form.id}`)}
                       className="group dark:bg-neutral-900 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between h-56 shadow-xs"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            form.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'dark:bg-neutral-800 bg-muted dark:text-neutral-400 text-muted-foreground'
                          }`}>
                            {form.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-[10px] dark:text-neutral-400 text-muted-foreground flex items-center gap-1 font-medium">
                            <Globe className="h-3 w-3" /> {form.visibility}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold dark:text-neutral-100 text-foreground mt-4 group-hover:text-primary transition-colors line-clamp-1">{form.title}</h3>
                        <p className="text-xs dark:text-neutral-400 text-muted-foreground mt-2 line-clamp-2">{form.description || "No description provided."}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] dark:text-neutral-500 text-muted-foreground/80 pt-4 border-t dark:border-neutral-800 border-border mt-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(form.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Edit <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  ))}

                  {forms.length === 0 && (
                    <div className="col-span-full border-2 border-dashed dark:border-neutral-800 border-border rounded-xl p-16 text-center">
                      <FileText className="h-10 w-10 text-neutral-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold dark:text-neutral-200 text-foreground">No forms yet</h3>
                      <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-1 max-w-sm mx-auto">Create your first responsive interactive form to start gathering submissions.</p>
                      <Button 
                        onClick={() => router.push('/dashboard/create')}
                        className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                      >
                        Create your first form
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
