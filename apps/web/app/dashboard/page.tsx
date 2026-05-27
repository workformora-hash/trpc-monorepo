'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useThemeMounted } from '~/hooks/use-theme-mounted';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { trpc } from '~/trpc/client';

// New sub-components
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardSidebar, type DashboardTab } from './components/DashboardSidebar';
import { FormsListTab } from './components/FormsListTab';
import { ExploreTab } from './components/ExploreTab';
import { TemplatesTab } from './components/TemplatesTab';
import { ProfileTab } from './components/ProfileTab';

export default function DashboardPage() {
  const { push } = useRouter();
  const { theme, setTheme } = useTheme();
  const themeMounted = useThemeMounted();
  const [activeTab, setActiveTab] = useState<DashboardTab>('forms');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cloningTemplateId, setCloningTemplateId] = useState<string | null>(null);

  const handleTabChange = useCallback((tab: DashboardTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
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
      push("/login");
    }
  }, [user, sessionLoading, push]);

  // Logout Mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Successfully logged out.");
      refetchSession();
      push("/");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to log out.");
    }
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

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
      push(`/dashboard/form/${data.form.id}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form from template.");
      setCloningTemplateId(null);
    }
  });

  const handleUseTemplate = useCallback((templateId: string) => {
    setCloningTemplateId(templateId);
    createFormFromTemplate.mutate({ templateId });
  }, [createFormFromTemplate]);

  if (sessionLoading || !user) {
    return (
      <div className="h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 text-primary animate-spin" />
        <span className="text-sm font-semibold text-neutral-500">Checking session status…</span>
      </div>
    );
  }

  return (
    <div className="h-screen dark:bg-neutral-950 bg-background dark:text-neutral-100 text-foreground flex flex-col font-sans transition-colors duration-300 overflow-hidden relative">
      <DashboardHeader 
        userName={user.name}
        isLoggingOut={logoutMutation.isPending}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
        themeMounted={themeMounted}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {isMobileMenuOpen && (
          <button 
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <DashboardSidebar 
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isMobileOpen={isMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto p-8 dark:bg-neutral-950 bg-neutral-50/50 transition-colors duration-300">
          {activeTab === 'forms' && (
            <FormsListTab 
              forms={creatorFormsData?.forms || []}
              isLoading={formsLoading}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreTab 
              forms={exploreFormsData?.forms || []}
              isLoading={exploreLoading}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesTab 
              templates={templatesData}
              isLoading={templatesLoading}
              onUseTemplate={handleUseTemplate}
              cloningTemplateId={cloningTemplateId}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab user={user} />
          )}
        </main>
      </div>
    </div>
  );
}
