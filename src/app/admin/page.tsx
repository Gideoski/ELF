
"use client";

import React, { useState, useMemo } from 'react';
import { useAuth, useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  deleteUser as deleteAuthUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  deleteDoc,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Image as ImageIcon, 
  LogOut, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  RefreshCcw, 
  Copy, 
  Check, 
  ShieldAlert,
  Users as UsersIcon,
  ShieldCheck,
  ShieldX,
  Upload,
  Info,
  Link as LinkIcon,
  FileUp,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/error-mapping';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SUPER_ADMIN_EMAIL = 'gideonjackbara@gmail.com';

export default function AdminPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  const userProfileRef = useMemo(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: profile } = useDoc(userProfileRef);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Archive States
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [archiveMode, setArchiveMode] = useState<'link' | 'file'>('link');
  
  // Gallery States
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryCat, setGalleryCat] = useState('Workshops');

  // Confirmation States
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ col: string, id: string, title?: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string, email: string } | null>(null);

  // Queries
  const docsQuery = useMemo(() => firestore ? query(collection(firestore, 'documents'), orderBy('uploadedAt', 'desc')) : null, [firestore]);
  const galleryQuery = useMemo(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')) : null, [firestore]);
  const usersQuery = useMemo(() => firestore ? query(collection(firestore, 'users'), orderBy('createdAt', 'desc')) : null, [firestore]);
  
  const { data: documents } = useCollection(docsQuery);
  const { data: galleryItems } = useCollection(galleryQuery);
  const { data: allUsers } = useCollection(usersQuery);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back", description: "Access granted to admin services." });
      } else {
        if (password.length < 6) {
          throw { code: 'auth/weak-password' };
        }
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (firestore) {
          const userData = {
            email: res.user.email,
            role: res.user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'user',
            displayName: email.split('@')[0],
            createdAt: new Date().toISOString()
          };
          setDoc(doc(firestore, 'users', res.user.uid), userData)
            .catch((err) => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${res.user.uid}`,
                operation: 'create',
                requestResourceData: userData
              }));
            });
        }
        toast({ title: "Account created", description: "Authentication successful." });
      }
    } catch (error: any) {
      const friendlyMessage = getErrorMessage(error);
      setAuthError(friendlyMessage);
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: friendlyMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      toast({ title: "Signed out", description: "You have been securely logged out." });
    }
  };

  const addDocument = async () => {
    if (!firestore || !docTitle) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide a title." });
      return;
    }

    if (archiveMode === 'link' && !docUrl) {
      toast({ variant: "destructive", title: "Link Missing", description: "Please provide a URL." });
      return;
    }

    if (archiveMode === 'file' && !docFile) {
      toast({ variant: "destructive", title: "File Missing", description: "Please select a PDF file." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      let finalUrl = docUrl;
      
      if (archiveMode === 'file' && docFile) {
        if (docFile.size > 1024 * 1024) {
          toast({ variant: "destructive", title: "File too large", description: "Document exceeds 1MB. Please use the 'Link' option instead." });
          setIsSubmitting(false);
          return;
        }
        finalUrl = await fileToBase64(docFile);
      }

      const data = {
        title: docTitle,
        fileUrl: finalUrl,
        uploadedAt: new Date().toISOString()
      };
      
      addDoc(collection(firestore, 'documents'), data)
        .then(() => {
          setDocTitle('');
          setDocUrl('');
          setDocFile(null);
          toast({ title: "Resource published", description: "The resource is now available in the archive." });
        })
        .catch((err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'documents',
            operation: 'create',
            requestResourceData: data
          }));
        });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not process the selected file." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGalleryImage = async () => {
    if (!firestore || !galleryTitle || !galleryFile) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide a title and select an image." });
      return;
    }

    setIsSubmitting(true);
    try {
      const base64 = await fileToBase64(galleryFile);
      const data = {
        title: galleryTitle,
        imageUrl: base64,
        category: galleryCat,
        createdAt: new Date().toISOString()
      };
      
      addDoc(collection(firestore, 'gallery'), data)
        .then(() => {
          setGalleryTitle('');
          setGalleryFile(null);
          toast({ title: "Image posted", description: "The image has been added to the gallery." });
        })
        .catch((err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'gallery',
            operation: 'create',
            requestResourceData: data
          }));
        });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not process the selected image." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = () => {
    if (!firestore || !itemToDelete) return;
    deleteDoc(doc(firestore, itemToDelete.col, itemToDelete.id))
      .then(() => {
        toast({ title: "Item removed", description: `${itemToDelete.title || 'Item'} has been deleted.` });
        setItemToDelete(null);
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `${itemToDelete.col}/${itemToDelete.id}`,
          operation: 'delete'
        }));
        setItemToDelete(null);
      });
  };

  const confirmDeleteUser = async () => {
    if (!firestore || !userToDelete) return;
    
    try {
      // 1. Delete Firestore profile
      await deleteDoc(doc(firestore, 'users', userToDelete.id));
      
      toast({ title: "Account removed", description: `${userToDelete.email} has been deleted.` });
      
      // 2. If deleting self, handle sign out and optional auth deletion
      if (user?.uid === userToDelete.id) {
        if (auth?.currentUser) {
          try {
            // Attempt to delete auth account (requires recent login)
            await deleteAuthUser(auth.currentUser);
          } catch (e) {
            // If sensitive operation fails (needs re-auth), at least sign them out
            console.log("Auth user deletion skipped. Signing out instead.");
            await signOut(auth);
          }
        }
      }
      
      setUserToDelete(null);
    } catch (error) {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `users/${userToDelete.id}`,
          operation: 'delete'
        }));
        setUserToDelete(null);
    }
  };

  const toggleAdmin = (userId: string, currentRole: string) => {
    if (!firestore) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    updateDoc(doc(firestore, 'users', userId), { role: newRole })
      .then(() => toast({ title: `Role updated to ${newRole}` }))
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `users/${userId}`,
          operation: 'update',
          requestResourceData: { role: newRole }
        }));
      });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "ID copied to clipboard" });
  };

  const hasAdminAccess = useMemo(() => {
    if (!user) return false;
    if (user.email === SUPER_ADMIN_EMAIL) return true;
    return profile?.role === 'admin';
  }, [user, profile]);

  if (authLoading || (user && !profile && user.email !== SUPER_ADMIN_EMAIL)) return (
    <div className="min-h-screen flex items-center justify-center bg-elf-cream pt-24">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-elf-gold" size={48} />
        <p className="text-elf-text-light font-headline italic text-lg">Verifying credentials...</p>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-elf-green-dark flex flex-col items-center justify-center p-6 pt-32 pb-20 relative">
        <div className="absolute inset-0 elf-diagonal-pattern opacity-5" />
        <Card className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden border-none animate-fade-in-up relative z-10">
          <CardHeader className="text-center pb-6 bg-elf-cream/30 border-b border-elf-gold/10 pt-10">
            <CardTitle className="text-4xl font-headline italic text-elf-green-dark">
              {isLogin ? 'Admin Portal' : 'Register Admin'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-10">
            {authError && (
              <Alert variant="destructive" className="mb-6 rounded-xl border-destructive/20 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Email Address</label>
                <Input 
                  placeholder="admin@elf.org" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-12 border-elf-gold/20 focus:ring-elf-gold rounded-xl"
                />
              </div>
              <div className="relative space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Password</label>
                <div className="relative">
                  <Input 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="pr-12 h-12 border-elf-gold/20 focus:ring-elf-gold rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-elf-text-light"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark h-14 font-bold rounded-full shadow-lg text-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </span>
                )}
              </Button>
              <div className="text-center pt-4">
                <button 
                  type="button"
                  className="text-sm text-elf-text-light hover:text-elf-gold underline-offset-4 hover:underline transition-all"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setAuthError(null);
                  }}
                >
                  {isLogin ? (
                    <>New here? <span className="font-bold">Register an account</span></>
                  ) : (
                    <>Already registered? <span className="font-bold">Sign in here</span></>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-elf-cream flex flex-col items-center justify-center p-6 pt-32 pb-20">
        <Card className="max-w-xl w-full text-center p-8 md:p-12 rounded-3xl border-elf-gold/10 shadow-2xl bg-white animate-fade-in-up">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-elf-green-dark mb-4">
            Access Restricted
          </h2>
          
          <p className="text-elf-text-mid mb-8 leading-relaxed">
            Your account is verified, but you need administrative permissions to access the dashboard. 
            If you are the Super Admin (<strong>{SUPER_ADMIN_EMAIL}</strong>), please ensure your email matches exactly.
          </p>
          
          <div className="text-left bg-elf-cream/50 p-6 rounded-2xl border border-elf-gold/10 mb-8 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Diagnostic UID</p>
            <div 
              className="bg-white px-3 py-2 rounded-lg border border-elf-gold/5 text-[10px] font-mono break-all cursor-pointer flex justify-between items-center group active:scale-[0.98] transition-transform"
              onClick={() => copyToClipboard(user.uid)}
            >
              <span className="truncate">{user.uid}</span>
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="opacity-40 group-hover:opacity-100" />}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="rounded-full w-full h-12 bg-elf-green-dark text-white font-bold" onClick={() => window.location.reload()}>
              <RefreshCcw size={18} className="mr-2" /> Check Status Again
            </Button>
            <Button variant="ghost" className="text-elf-text-light" onClick={() => auth && signOut(auth)}>
              <LogOut size={16} className="mr-2" /> Sign out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elf-cream pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-headline text-elf-green-dark font-bold">Admin Dashboard</h1>
            <p className="text-elf-text-mid flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Logged in as <span className="font-bold">{user.email}</span>
            </p>
          </div>
          
          <AlertDialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full px-6 h-11">
                <LogOut size={18} className="mr-2" /> End Session
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will end your current administrative session.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full">
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-white border border-elf-gold/10 p-1 rounded-full overflow-hidden shadow-sm">
            <TabsTrigger value="archive" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold transition-all">
              <FileText size={18} className="mr-2" /> Archive
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold transition-all">
              <ImageIcon size={18} className="mr-2" /> Gallery
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold transition-all">
              <UsersIcon size={18} className="mr-2" /> Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-8 animate-fade-in-up">
            <Card className="border-elf-gold/10 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-white/50 border-b border-elf-gold/5 p-6">
                <CardTitle className="text-lg font-bold text-elf-green-dark">Post Resource</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-8 px-6 pb-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Resource Title</label>
                    <Input placeholder="e.g. Preclinical Guide" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="rounded-xl" />
                  </div>

                  <div className="space-y-4 border-t border-elf-gold/5 pt-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light block mb-2">Upload Type</label>
                    <RadioGroup value={archiveMode} onValueChange={(val: 'link' | 'file') => setArchiveMode(val)} className="flex flex-col sm:flex-row gap-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="file" id="mode-file" />
                        <Label htmlFor="mode-file" className="cursor-pointer">Direct Upload (Max 1MB)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="link" id="mode-link" />
                        <Label htmlFor="mode-link" className="cursor-pointer">External Link (Google Drive)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {archiveMode === 'link' ? (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Google Drive Link</label>
                      <div className="relative">
                        <Input placeholder="https://drive.google.com/..." value={docUrl} onChange={(e) => setDocUrl(e.target.value)} className="rounded-xl pl-10" />
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-elf-text-light" size={16} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Select PDF File</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-grow">
                          <input 
                            type="file" 
                            accept="application/pdf" 
                            className="hidden" 
                            id="archive-upload" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 1024 * 1024) {
                                  toast({ variant: "destructive", title: "File too large", description: "This file exceeds 1MB. Please use the 'Link' option." });
                                  e.target.value = "";
                                  return;
                                }
                                setDocFile(file);
                              }
                              // Reset value so selecting same file works again if removed
                              e.target.value = "";
                            }}
                          />
                          <Button 
                            asChild 
                            variant="outline" 
                            className={`w-full h-12 rounded-xl justify-start px-3 font-normal ${docFile ? 'text-elf-green-dark border-elf-gold' : 'text-muted-foreground'}`}
                          >
                            <label htmlFor="archive-upload" className="cursor-pointer flex items-center gap-2">
                              <FileUp size={18} />
                              <span className="truncate">{docFile ? docFile.name : 'Choose PDF'}</span>
                            </label>
                          </Button>
                        </div>
                        {docFile && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive h-12 w-12 rounded-xl border border-destructive/20"
                            onClick={() => setDocFile(null)}
                          >
                            <X size={18} />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={addDocument} 
                    disabled={isSubmitting || !docTitle || (archiveMode === 'link' ? !docUrl : !docFile)}
                    className="bg-elf-gold text-elf-green-dark font-bold px-10 h-12 rounded-full"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18}/> : <Plus size={18} className="mr-2"/>}
                    Add to Archive
                  </Button>
                </div>

                {archiveMode === 'link' && (
                  <Accordion type="single" collapsible className="mt-6">
                    <AccordionItem value="drive-guide" className="border-none bg-elf-cream/30 px-4 rounded-xl">
                      <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-elf-text-light py-4 hover:no-underline">
                        How to get a direct Google Drive link
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-elf-text-mid space-y-2 pb-4">
                        <p>1. Upload your PDF to Google Drive.</p>
                        <p>2. Right-click the file and select <strong>Share</strong>.</p>
                        <p>3. Under "General Access", change "Restricted" to <strong>"Anyone with the link"</strong>.</p>
                        <p>4. Click <strong>"Copy link"</strong> and paste it into the field above.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {documents?.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-elf-gold/5 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <FileText className="text-elf-gold" size={24} />
                    <div>
                      <p className="font-bold text-elf-green-dark">{d.title}</p>
                      <p className="text-[10px] text-elf-text-light uppercase tracking-widest truncate max-w-[200px] md:max-w-md">
                        {d.fileUrl.startsWith('data:') ? 'Direct Upload' : d.fileUrl}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setItemToDelete({ col: 'documents', id: d.id, title: d.title })} 
                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              {!documents?.length && (
                <div className="text-center py-20 text-elf-text-light italic border-2 border-dashed border-elf-gold/10 rounded-3xl">
                  No archive resources found.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8 animate-fade-in-up">
             <Card className="border-elf-gold/10 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-white/50 border-b border-elf-gold/5 p-6">
                <CardTitle className="text-lg font-bold text-elf-green-dark">Upload New Picture</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 px-6 pb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Image Title</label>
                  <Input placeholder="e.g. Workshop Session" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Select File</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="gallery-upload" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 1024 * 1024) {
                              toast({ variant: "destructive", title: "Image too large", description: "Please optimize images below 1MB." });
                              e.target.value = "";
                              return;
                            }
                            setGalleryFile(file);
                          }
                          e.target.value = "";
                        }}
                      />
                      <Button 
                        asChild 
                        variant="outline" 
                        className={`w-full h-10 rounded-xl justify-start px-3 font-normal ${galleryFile ? 'text-elf-green-dark border-elf-gold' : 'text-muted-foreground'}`}
                      >
                        <label htmlFor="gallery-upload" className="cursor-pointer flex items-center gap-2">
                          <Upload size={16} />
                          <span className="truncate">{galleryFile ? galleryFile.name : 'Choose picture'}</span>
                        </label>
                      </Button>
                    </div>
                    {galleryFile && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive h-10 w-10 rounded-xl"
                        onClick={() => setGalleryFile(null)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Category</label>
                  <select className="flex h-10 w-full rounded-xl border border-elf-gold/20 bg-background px-3 py-2 text-sm outline-none" value={galleryCat} onChange={(e) => setGalleryCat(e.target.value)}>
                    <option value="Workshops">Workshops</option>
                    <option value="The Gauntlet">The Gauntlet</option>
                    <option value="Community">Community</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addGalleryImage} 
                    disabled={isSubmitting || !galleryFile || !galleryTitle}
                    className="w-full bg-elf-gold text-elf-green-dark font-bold h-10 rounded-full"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18}/> : <Plus size={18} className="mr-2"/>}
                    Publish Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {galleryItems?.map(g => (
                <div key={g.id} className="relative group rounded-2xl overflow-hidden border border-elf-gold/10 bg-white shadow-sm flex flex-col">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={g.imageUrl} className="w-full h-full object-cover" alt={g.title} />
                    <div className="absolute top-2 right-2">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => setItemToDelete({ col: 'gallery', id: g.id, title: g.title })} 
                        className="rounded-full shadow-lg h-8 w-8"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-white flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase font-bold text-elf-gold tracking-widest bg-elf-gold/5 px-2 py-0.5 rounded-full">{g.category}</span>
                      <span className="text-[10px] text-elf-text-light">{new Date(g.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-elf-green-dark text-sm line-clamp-2">{g.title}</h4>
                  </div>
                </div>
              ))}
              {!galleryItems?.length && (
                <div className="col-span-full py-20 text-center text-elf-text-light italic border-2 border-dashed border-elf-gold/10 rounded-3xl">
                  No gallery images found.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 gap-4">
              {allUsers?.map(u => (
                <div key={u.id} className="bg-white p-6 rounded-2xl shadow-sm border border-elf-gold/5 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-elf-gold/10 text-elf-gold' : 'bg-elf-green-dark/5 text-elf-text-light'}`}>
                      <UsersIcon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-elf-green-dark flex items-center gap-2">
                        {u.email}
                        {u.role === 'admin' && <ShieldCheck size={14} className="text-elf-gold" />}
                        {user?.uid === u.id && <span className="text-[10px] bg-elf-cream px-2 py-0.5 rounded-full border border-elf-gold/20">You</span>}
                      </p>
                      <p className="text-[10px] text-elf-text-light uppercase tracking-widest">
                        Status: <span className="font-bold">{u.role}</span> • Joined {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {u.email !== SUPER_ADMIN_EMAIL && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`rounded-full h-10 px-4 border-elf-gold/20 ${u.role === 'admin' ? 'text-destructive hover:bg-destructive/5' : 'text-elf-gold hover:bg-elf-gold/5'}`}
                        onClick={() => toggleAdmin(u.id, u.role)}
                      >
                        {u.role === 'admin' ? <ShieldX size={16} className="mr-2" /> : <ShieldCheck size={16} className="mr-2" />}
                        {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </Button>
                    )}
                    
                    {u.email !== SUPER_ADMIN_EMAIL || user?.uid === u.id ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setUserToDelete({ id: u.id, email: u.email })} 
                        className="text-destructive"
                      >
                        <Trash2 size={18} />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Global Deletion Confirmation Dialog for Items */}
        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{itemToDelete?.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This resource will be permanently removed from the public website.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Global Deletion Confirmation Dialog for Users */}
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {user?.uid === userToDelete?.id ? "Delete your account?" : `Delete account for ${userToDelete?.email}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {user?.uid === userToDelete?.id 
                  ? "Are you sure you want to delete your own administrative account? You will be immediately logged out and your profile removed."
                  : "This will permanently remove this user's profile from the system."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full">
                {user?.uid === userToDelete?.id ? "Delete My Account" : "Delete User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
