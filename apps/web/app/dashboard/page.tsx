'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowRight, CheckCircle2, Lock, Zap, BarChart3, Users, Database, 
  Code2, Shield, Palette, Share2, Eye, EyeOff, Mail,
  Plus, Trash2, Copy, ExternalLink, LogOut, Settings, FileText, Check, 
  Loader2, ChevronRight, AlertCircle, Calendar, Hash, Type, Star, 
  ArrowLeft, Clock, Globe, ToggleLeft, ToggleRight, LayoutDashboard,
  HelpCircle, CheckSquare, Sparkles, User, HelpCircle as QuestionIcon
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/client';

export default function DashboardPage() {
  const router = useRouter();

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
      toast.error("Please login to access your creator dashboard.");
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

  // State Management for Dashboard
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forms' | 'explore' | 'profile'>('forms');
  const [selectedSubTab, setSelectedSubTab] = useState<'builder' | 'responses' | 'settings'>('builder');
  
  // Form Creation Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVisibility, setNewVisibility] = useState<'public' | 'unlisted'>('unlisted');
  const [newTheme, setNewTheme] = useState("default");

  // Form Field Addition State
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<
    "short_text" | "long_text" | "email" | "number" | "single_select" | "multi_select" | "checkbox" | "rating" | "date"
  >("short_text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldChoices, setNewFieldChoices] = useState("");

  // Detailed Sub-state for viewing a single response detail
  const [selectedResponseDetailId, setSelectedResponseDetailId] = useState<string | null>(null);

  // Queries for Creator Dashboard (only enable when user is present)
  const { 
    data: creatorFormsData, 
    isLoading: formsLoading, 
    refetch: refetchForms 
  } = trpc.form.listFormsCreator.useQuery(undefined, { enabled: !!user });

  const { 
    data: formDetails, 
    isLoading: detailsLoading, 
    refetch: refetchFormDetails 
  } = trpc.form.getFormByIdCreator.useQuery(
    { id: selectedFormId || "" }, 
    { enabled: !!user && !!selectedFormId }
  );

  const { 
    data: responsesData, 
    isLoading: responsesLoading,
    refetch: refetchResponses
  } = trpc.form.listResponses.useQuery(
    { formId: selectedFormId || "" }, 
    { enabled: !!user && !!selectedFormId }
  );

  const { 
    data: analyticsData, 
    isLoading: analyticsLoading,
    refetch: refetchAnalytics
  } = trpc.form.getFormAnalytics.useQuery(
    { formId: selectedFormId || "" }, 
    { enabled: !!user && !!selectedFormId }
  );

  const { 
    data: exploreFormsData,
    isLoading: exploreLoading
  } = trpc.form.listExploreForms.useQuery({}, { enabled: !!user && activeTab === 'explore' });

  // Mutations for Forms
  const createFormMutation = trpc.form.createForm.useMutation({
    onSuccess: (data) => {
      toast.success(`Form "${data.form.title}" created successfully!`);
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewVisibility("unlisted");
      refetchForms();
      setSelectedFormId(data.form.id);
      setSelectedSubTab('builder');
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form.");
    }
  });

  const editFormMutation = trpc.form.editForm.useMutation({
    onSuccess: () => {
      toast.success("Form updated successfully!");
      refetchForms();
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update form.");
    }
  });

  const publishMutation = trpc.form.publishForm.useMutation({
    onSuccess: () => {
      toast.success("Form is now live!");
      refetchForms();
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to publish form. Make sure it has at least one question.");
    }
  });

  const unpublishMutation = trpc.form.unpublishForm.useMutation({
    onSuccess: () => {
      toast.success("Form set to draft.");
      refetchForms();
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to unpublish form.");
    }
  });

  const duplicateMutation = trpc.form.duplicateForm.useMutation({
    onSuccess: () => {
      toast.success("Form duplicated successfully!");
      refetchForms();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to duplicate form.");
    }
  });

  const deleteMutation = trpc.form.deleteForm.useMutation({
    onSuccess: () => {
      toast.success("Form deleted successfully.");
      setSelectedFormId(null);
      refetchForms();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete form.");
    }
  });

  // Mutations for Form Fields
  const addFormFieldMutation = trpc.form.addFormField.useMutation({
    onSuccess: () => {
      toast.success("Question added successfully!");
      setNewFieldLabel("");
      setNewFieldChoices("");
      setNewFieldRequired(false);
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add question.");
    }
  });

  const deleteFormFieldMutation = trpc.form.deleteFormField.useMutation({
    onSuccess: () => {
      toast.success("Question removed.");
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete question.");
    }
  });

  // Submission handler for form fields
  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormId) return;
    if (!newFieldLabel.trim()) {
      toast.error("Please enter a question label.");
      return;
    }

    const validation: Record<string, any> = {};
    if (newFieldType === 'single_select' || newFieldType === 'multi_select') {
      const choices = newFieldChoices.split(',').map(c => c.trim()).filter(Boolean);
      if (choices.length === 0) {
        toast.error("Please enter at least one choice for selection fields.");
        return;
      }
      validation.choices = choices;
    }

    addFormFieldMutation.mutate({
      formId: selectedFormId,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      validation
    });
  };

  // Submission handler for creating forms
  const handleCreateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a form title.");
      return;
    }
    createFormMutation.mutate({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      visibility: newVisibility,
      theme: newTheme
    });
  };

  // Render Loader while session queries or redirects
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading secure session...</p>
        </div>
      </div>
    );
  }

  // Redirecting placeholder
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const forms = creatorFormsData?.forms || [];
  const selectedForm = formDetails?.form;
  const selectedFields = formDetails?.fields || [];
  const selectedResponses = responsesData?.responses || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Header Nav */}
      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90">
            <div className="flex items-center justify-center h-8 w-8 rounded-sm bg-primary text-primary-foreground font-bold text-sm">F</div>
            <span className="font-semibold text-lg tracking-tight">FormBuilder Creator</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-400">
            Logged in as <span className="text-neutral-100 font-medium">{user.name}</span>
          </div>
          <Button 
            variant="outline" 
            className="border-neutral-800 hover:bg-neutral-900 text-neutral-300 text-xs px-3 h-8 flex items-center gap-1.5"
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
        <aside className="w-64 border-r border-neutral-800 bg-neutral-900/30 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1">
              <button 
                onClick={() => { setActiveTab('forms'); setSelectedFormId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'forms' ? 'bg-primary text-primary-foreground font-medium' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" /> My Forms
              </button>
              <button 
                onClick={() => { setActiveTab('explore'); setSelectedFormId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'explore' ? 'bg-primary text-primary-foreground font-medium' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900'
                }`}
              >
                <Globe className="h-4 w-4" /> Explore Gallery
              </button>
              <button 
                onClick={() => { setActiveTab('profile'); setSelectedFormId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'profile' ? 'bg-primary text-primary-foreground font-medium' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900'
                }`}
              >
                <User className="h-4 w-4" /> My Account
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center">
            <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-xs font-semibold">Starter Plan</div>
            <div className="text-[10px] text-neutral-400 mt-1">Up to 5 forms & unlimited submissions</div>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-neutral-950">
          {/* ACTIVE TAB: EXPLORE GALLERY */}
          {activeTab === 'explore' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div>
                <h1 className="text-3xl font-light tracking-tight text-neutral-100">Explore Templates & Gallery</h1>
                <p className="text-neutral-400 text-sm mt-2">See what other creators are building, and get inspired by templates.</p>
              </div>

              {exploreLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exploreFormsData?.forms.map((form) => (
                    <div key={form.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl hover:border-primary/50 transition-all flex flex-col justify-between h-48">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-primary tracking-wider">{form.theme} theme</span>
                        <h3 className="text-base font-semibold text-neutral-100 mt-1">{form.title}</h3>
                        <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{form.description || "No description provided."}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500 pt-4 border-t border-neutral-800">
                        <span>By user: {form.userId.slice(0, 8)}</span>
                      </div>
                    </div>
                  ))}

                  {exploreFormsData?.forms.length === 0 && (
                    <div className="col-span-full text-center py-20 text-neutral-500">
                      No public forms found in explore gallery yet. Be the first to publish one!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TAB: PROFILE & ACCOUNT */}
          {activeTab === 'profile' && (
            <div className="space-y-8 max-w-2xl mx-auto bg-neutral-900 border border-neutral-800 p-8 rounded-2xl">
              <div>
                <h1 className="text-2xl font-light text-neutral-100">Account Settings</h1>
                <p className="text-neutral-400 text-sm mt-1">Manage your creator profile and preferences.</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="grid grid-cols-3 gap-4 py-2 border-b border-neutral-800/50">
                  <span className="text-sm text-neutral-400">Full Name</span>
                  <span className="text-sm font-semibold col-span-2">{user.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2 border-b border-neutral-800/50">
                  <span className="text-sm text-neutral-400">Email Address</span>
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
                  <p className="text-xs text-neutral-400 mt-1">Upgrade to Premium for custom domains, unlimited forms, custom styling, and smart logic integrations.</p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE TAB: FORMS */}
          {activeTab === 'forms' && (
            <>
              {/* 1. All Forms List View */}
              {!selectedFormId && (
                <div className="space-y-8 max-w-5xl mx-auto">
                  {/* Header bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-light tracking-tight text-neutral-100">My Forms</h1>
                      <p className="text-neutral-400 text-sm mt-1">Create, build, and view response analytics for your forms.</p>
                    </div>

                    <Button 
                      onClick={() => setIsCreateOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 h-10 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Create Form
                    </Button>
                  </div>

                  {/* Quick Analytics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-neutral-400">Total Forms</div>
                        <div className="text-2xl font-bold">{forms.length}</div>
                      </div>
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-neutral-400">Published Forms</div>
                        <div className="text-2xl font-bold">
                          {forms.filter(f => f.isPublished).length}
                        </div>
                      </div>
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-neutral-400">Status</div>
                        <div className="text-sm font-semibold text-neutral-200">System Healthy</div>
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
                          onClick={() => { setSelectedFormId(form.id); setSelectedSubTab('builder'); }}
                          className="group bg-neutral-900 border border-neutral-800 p-6 rounded-xl hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between h-56"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                form.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                              }`}>
                                {form.isPublished ? 'Published' : 'Draft'}
                              </span>
                              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                                <Globe className="h-3 w-3" /> {form.visibility}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-neutral-100 mt-4 group-hover:text-primary transition-colors line-clamp-1">{form.title}</h3>
                            <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{form.description || "No description provided."}</p>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-4 border-t border-neutral-800 mt-4">
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
                        <div className="col-span-full border-2 border-dashed border-neutral-800 rounded-xl p-16 text-center">
                          <FileText className="h-10 w-10 text-neutral-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-neutral-200">No forms yet</h3>
                          <p className="text-neutral-400 text-sm mt-1 max-w-sm mx-auto">Create your first responsive interactive form to start gathering submissions.</p>
                          <Button 
                            onClick={() => setIsCreateOpen(true)}
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

              {/* 2. Detailed Single Form Builder / Responses View */}
              {selectedFormId && (
                <div className="max-w-5xl mx-auto space-y-6">
                  {/* Back header */}
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedFormId(null)}
                      className="text-neutral-400 hover:text-neutral-100 px-2 py-1 h-8 text-xs flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Forms
                    </Button>
                  </div>

                  {detailsLoading || !selectedForm ? (
                    <div className="flex h-64 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Form Metadata Card */}
                      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-neutral-100">{selectedForm.title}</h1>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                              selectedForm.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {selectedForm.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
                              slug: {selectedForm.slug}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-400">{selectedForm.description || "No description provided."}</p>
                          
                          {selectedForm.isPublished && (
                            <div className="flex items-center gap-2 text-xs text-primary mt-2">
                              <Globe className="h-3.5 w-3.5" />
                              <span className="font-medium">Public Form URL:</span>
                              <a 
                                href={`/form/${selectedForm.slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="underline flex items-center gap-1 hover:text-primary-foreground"
                              >
                                {window.location.origin}/form/{selectedForm.slug} <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            onClick={() => {
                              if (selectedForm.isPublished) {
                                unpublishMutation.mutate({ id: selectedForm.id });
                              } else {
                                publishMutation.mutate({ id: selectedForm.id });
                              }
                            }}
                            className={`text-xs px-4 h-9 font-medium ${
                              selectedForm.isPublished 
                                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' 
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {selectedForm.isPublished ? 'Unpublish' : 'Publish Form'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => duplicateMutation.mutate({ id: selectedForm.id })}
                            className="border-neutral-800 hover:bg-neutral-800 text-xs px-3 h-9"
                            title="Duplicate Form"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => {
                              if (confirm("Are you absolutely sure you want to delete this form? This action is soft-deleting and cannot be easily undone.")) {
                                deleteMutation.mutate({ id: selectedForm.id });
                              }
                            }}
                            className="border-neutral-800 hover:bg-red-950 hover:text-red-400 hover:border-red-900 text-xs px-3 h-9"
                            title="Delete Form"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Navigation Tabs inside Form View */}
                      <div className="border-b border-neutral-800 flex gap-4">
                        <button
                          onClick={() => setSelectedSubTab('builder')}
                          className={`pb-3 text-sm font-semibold transition-all relative ${
                            selectedSubTab === 'builder' ? 'text-primary' : 'text-neutral-400 hover:text-neutral-100'
                          }`}
                        >
                          Questions Builder
                          {selectedSubTab === 'builder' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                        </button>
                        <button
                          onClick={() => { setSelectedSubTab('responses'); refetchResponses(); refetchAnalytics(); }}
                          className={`pb-3 text-sm font-semibold transition-all relative ${
                            selectedSubTab === 'responses' ? 'text-primary' : 'text-neutral-400 hover:text-neutral-100'
                          }`}
                        >
                          Responses & Analytics
                          {selectedSubTab === 'responses' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                        </button>
                        <button
                          onClick={() => setSelectedSubTab('settings')}
                          className={`pb-3 text-sm font-semibold transition-all relative ${
                            selectedSubTab === 'settings' ? 'text-primary' : 'text-neutral-400 hover:text-neutral-100'
                          }`}
                        >
                          Form Settings
                          {selectedSubTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                        </button>
                      </div>

                      {/* SUB TAB: QUESTIONS BUILDER */}
                      {selectedSubTab === 'builder' && (
                        <div className="grid md:grid-cols-3 gap-8">
                          {/* Left Pane: Questions Timeline */}
                          <div className="md:col-span-2 space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-200">Form Structure</h3>
                            
                            <div className="space-y-3">
                              {selectedFields.map((field, idx) => (
                                <div key={field.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded bg-neutral-800 flex items-center justify-center font-bold text-xs text-primary">
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-neutral-100">
                                        {field.label}{' '}
                                        {field.required && <span className="text-red-500 text-xs">*</span>}
                                      </div>
                                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                                        {field.type === 'short_text' && <Type className="h-3 w-3" />}
                                        {field.type === 'long_text' && <FileText className="h-3 w-3" />}
                                        {field.type === 'email' && <Mail className="h-3 w-3" />}
                                        {field.type === 'number' && <Hash className="h-3 w-3" />}
                                        {field.type === 'single_select' && <QuestionIcon className="h-3 w-3" />}
                                        {field.type === 'multi_select' && <CheckSquare className="h-3 w-3" />}
                                        {field.type === 'checkbox' && <CheckSquare className="h-3 w-3" />}
                                        {field.type === 'rating' && <Star className="h-3 w-3" />}
                                        {field.type === 'date' && <Calendar className="h-3 w-3" />}
                                        {field.type.replace('_', ' ')}
                                      </div>
                                      
                                      {/* Show select choices if any */}
                                      {field.validation && typeof field.validation === 'object' && (field.validation as any).choices && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {(field.validation as any).choices.map((c: string, ci: number) => (
                                            <span key={ci} className="text-[9px] bg-neutral-800 border border-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded">
                                              {c}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    onClick={() => deleteFormFieldMutation.mutate({ id: field.id })}
                                    className="text-neutral-500 hover:text-red-400 hover:bg-red-950/20 px-2 h-8"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}

                              {selectedFields.length === 0 && (
                                <div className="border border-dashed border-neutral-800 rounded-xl p-12 text-center text-neutral-500 text-sm">
                                  This form has no questions yet. Use the question generator on the right to add your first question field.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Pane: Add Question Form */}
                          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl h-fit space-y-4">
                            <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                              <Plus className="h-4 w-4 text-primary" /> Add a Question
                            </h3>

                            <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-xs text-neutral-400">Question Label / Prompt</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. What is your favorite programming language?" 
                                  value={newFieldLabel}
                                  onChange={(e) => setNewFieldLabel(e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-primary"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs text-neutral-400">Question Type</label>
                                <select 
                                  value={newFieldType}
                                  onChange={(e) => setNewFieldType(e.target.value as any)}
                                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-primary"
                                >
                                  <option value="short_text">Short Text</option>
                                  <option value="long_text">Paragraph / Long Text</option>
                                  <option value="email">Email Address</option>
                                  <option value="number">Number</option>
                                  <option value="single_select">Single Select (Radio Buttons)</option>
                                  <option value="multi_select">Multi Select (Checkboxes)</option>
                                  <option value="checkbox">Single Agreement Checkbox</option>
                                  <option value="rating">Rating (Stars)</option>
                                  <option value="date">Date Picker</option>
                                </select>
                              </div>

                              {(newFieldType === 'single_select' || newFieldType === 'multi_select') && (
                                <div className="space-y-1.5">
                                  <label className="text-xs text-neutral-400">Choices / Options</label>
                                  <input 
                                    type="text" 
                                    placeholder="Option A, Option B, Option C" 
                                    value={newFieldChoices}
                                    onChange={(e) => setNewFieldChoices(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-primary"
                                  />
                                  <span className="text-[10px] text-neutral-500 block">Separate choices with commas.</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-2">
                                <input 
                                  type="checkbox" 
                                  id="req-checkbox"
                                  checked={newFieldRequired}
                                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                                  className="rounded border-neutral-800 bg-neutral-950 text-primary focus:ring-0"
                                />
                                <label htmlFor="req-checkbox" className="text-xs text-neutral-300 select-none">Mark as required</label>
                              </div>

                              <Button 
                                type="submit" 
                                disabled={addFormFieldMutation.isPending}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 mt-4"
                              >
                                {addFormFieldMutation.isPending ? 'Adding Question...' : 'Add Question'}
                              </Button>
                            </form>
                          </div>
                        </div>
                      )}

                      {/* SUB TAB: RESPONSES & ANALYTICS */}
                      {selectedSubTab === 'responses' && (
                        <div className="space-y-8">
                          {/* Analytics Summary */}
                          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                            <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2 mb-4">
                              <BarChart3 className="h-4 w-4 text-violet-400" /> Analytics Summary
                            </h3>

                            {analyticsLoading ? (
                              <div className="flex justify-center p-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl">
                                  <div className="text-xs text-neutral-500">Total Submissions</div>
                                  <div className="text-xl font-bold mt-1">{analyticsData?.totalResponses || 0}</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Responses List */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-200">Submissions Log</h3>

                            {responsesLoading ? (
                              <div className="flex h-32 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                      <tr className="border-b border-neutral-800 bg-neutral-900/50 text-neutral-400 text-xs">
                                        <th className="py-3 px-4 font-semibold">Respondent Email</th>
                                        <th className="py-3 px-4 font-semibold">IP Address</th>
                                        <th className="py-3 px-4 font-semibold">Submitted Date</th>
                                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedResponses.map((res) => (
                                        <tr key={res.id} className="border-b border-neutral-800/50 hover:bg-neutral-850/30 transition-colors">
                                          <td className="py-3 px-4 text-neutral-200 font-medium">{res.respondentEmail || 'Anonymous'}</td>
                                          <td className="py-3 px-4 text-neutral-400 font-mono text-xs">{res.ipAddress || 'unknown'}</td>
                                          <td className="py-3 px-4 text-neutral-400 text-xs">{new Date(res.submittedAt).toLocaleString()}</td>
                                          <td className="py-3 px-4 text-right">
                                            <Button
                                              onClick={() => setSelectedResponseDetailId(res.id)}
                                              variant="ghost"
                                              className="text-primary hover:text-primary-foreground hover:bg-primary/10 text-xs h-7 px-2.5"
                                            >
                                              View Answers
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}

                                      {selectedResponses.length === 0 && (
                                        <tr>
                                          <td colSpan={4} className="py-12 text-center text-neutral-500 text-xs">
                                            No submissions recorded for this form yet. Share the live link with users to collect responses.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Response Answers Modal Detail */}
                          {selectedResponseDetailId && (() => {
                            const activeRes = selectedResponses.find(r => r.id === selectedResponseDetailId);
                            if (!activeRes) return null;
                            return (
                              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 space-y-6">
                                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                                    <h3 className="text-lg font-bold text-neutral-100">Submission Answers</h3>
                                    <button 
                                      onClick={() => setSelectedResponseDetailId(null)}
                                      className="text-neutral-400 hover:text-neutral-100 text-sm font-semibold"
                                    >
                                      Close
                                    </button>
                                  </div>
                                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {activeRes.answers.map((answer) => {
                                      const matchingField = selectedFields.find(f => f.id === answer.fieldId);
                                      return (
                                        <div key={answer.id} className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 space-y-1">
                                          <div className="text-xs text-neutral-400 font-semibold">{matchingField?.label || 'Unknown Field'}</div>
                                          <div className="text-sm font-medium text-neutral-100">
                                            {typeof answer.value === 'object' && answer.value !== null 
                                              ? JSON.stringify(answer.value)
                                              : String(answer.value ?? 'No Answer')}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* SUB TAB: FORM SETTINGS */}
                      {selectedSubTab === 'settings' && (
                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl max-w-2xl space-y-6">
                          <h3 className="text-lg font-semibold text-neutral-200">Form Configurations</h3>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-neutral-850">
                              <div>
                                  <div className="text-sm font-medium text-neutral-200">Visibility Setting</div>
                                  <div className="text-xs text-neutral-500 mt-0.5">Controls whether the form appears in explore lists or is only direct link.</div>
                              </div>
                              <select
                                value={selectedForm.visibility}
                                onChange={(e) => {
                                  editFormMutation.mutate({
                                    id: selectedForm.id,
                                    visibility: e.target.value as any
                                  });
                                }}
                                className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-primary"
                              >
                                <option value="unlisted">Unlisted (Hidden from Gallery)</option>
                                <option value="public">Public (Visible in Gallery)</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-neutral-850">
                              <div>
                                <div className="text-sm font-medium text-neutral-200">Form Theme</div>
                                <div className="text-xs text-neutral-500 mt-0.5">Applies stylistic presets and colors to respondents page.</div>
                              </div>
                              <select
                                value={selectedForm.theme}
                                onChange={(e) => {
                                  editFormMutation.mutate({
                                    id: selectedForm.id,
                                    theme: e.target.value
                                  });
                                }}
                                className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-primary"
                              >
                                <option value="default">Default Dark-Mode Slate</option>
                                <option value="cyberpunk">Cyberpunk Neon</option>
                                <option value="ocean">Calm Ocean Blue</option>
                                <option value="forest">Eco Forest Green</option>
                              </select>
                            </div>

                            <div className="space-y-2 pt-2">
                              <label className="text-xs text-neutral-400 block">Edit Form Title</label>
                              <input
                                type="text"
                                defaultValue={selectedForm.title}
                                onBlur={(e) => {
                                  if (e.target.value.trim() && e.target.value !== selectedForm.title) {
                                    editFormMutation.mutate({
                                      id: selectedForm.id,
                                      title: e.target.value.trim()
                                    });
                                  }
                                }}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-primary"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs text-neutral-400 block">Edit Form Description</label>
                              <textarea
                                defaultValue={selectedForm.description || ""}
                                onBlur={(e) => {
                                  if (e.target.value.trim() !== (selectedForm.description || "")) {
                                    editFormMutation.mutate({
                                      id: selectedForm.id,
                                      description: e.target.value.trim() || null
                                    });
                                  }
                                }}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-primary h-20"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* CREATE FORM OVERLAY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-100">Create New Form</h3>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-neutral-400 hover:text-neutral-100 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Form Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Customer Satisfaction Survey" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Description (Optional)</label>
                <textarea 
                  placeholder="e.g. Gather feedback from clients about recent purchases." 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-primary h-20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Visibility</label>
                <select 
                  value={newVisibility}
                  onChange={(e) => setNewVisibility(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-primary"
                >
                  <option value="unlisted">Unlisted (Shareable Link Only)</option>
                  <option value="public">Public (Show on Explore Gallery)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Initial Theme Preset</label>
                <select 
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-primary"
                >
                  <option value="default">Default Dark-Mode Slate</option>
                  <option value="cyberpunk">Cyberpunk Neon</option>
                  <option value="ocean">Calm Ocean Blue</option>
                  <option value="forest">Eco Forest Green</option>
                </select>
              </div>

              <Button 
                type="submit" 
                disabled={createFormMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold h-10 mt-6"
              >
                {createFormMutation.isPending ? 'Creating form...' : 'Create Form'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
