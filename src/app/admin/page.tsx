"use client";

import React, { useState, useMemo } from 'react';
import { useAuth, useUser, useFirestore, useCollection } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  collection, 
  query, 
  orderBy, 
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  LogOut, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  KeyRound,
  UploadCloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/error-mapping';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ADMIN_EMAIL = 'nimsaamsaelf@gmail.com';

export default function AdminPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [docFormKey, setDocFormKey] = useState(Date.now());
  const [galleryFormKey, setGalleryFormKey] = useState(Date.now() + 1);

  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [archiveMode, setArchiveMode] = useState<'link' | 'file'>('link');
  
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ col: string, id: string, title?: string } | null>(null);

  const docsQuery = useMemo(() => firestore ? query(collection(firestore, 'documents'), orderBy('uploadedAt', 'desc')) : null, [firestore]);
  const galleryQuery = useMemo(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')) : null, [firestore]);
  
  const { data: documents } = useCollection(docsQuery);
  const { data: galleryItems } = useCollection(galleryQuery);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    if (email.toLowerCase().trim() !== ADMIN_EMAIL) {
      toast({ 
        variant: "destructive", 
        title: "Unauthorized Account", 
        description: "Login is restricted to the administrator account." 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      toast({ 
        title: "Welcome back", 
        description: "Administrative access granted." 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Login Failed", 
        description: getErrorMessage(error) 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth) return;

    // Default to admin email if input is empty
    const targetEmail = email.toLowerCase().trim() || ADMIN_EMAIL;

    if (targetEmail !== ADMIN_EMAIL) {
      toast({ 
        variant: "destructive", 
        title: "Invalid Email", 
        description: "Password reset is only available for the administrator account." 
      });
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      toast({ 
        title: "Reset Email Sent", 
        description: `Instructions have been sent to ${targetEmail}. Please check your inbox and spam folder. If you don't receive it, ensure the account exists in the Firebase Console.` 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Reset Failed", 
        description: getErrorMessage(error) 
      });
    } finally {
      setIsResetting(false);
    }
  };

  const addDocument = async () => {
    if (!firestore || !docTitle) return;
    setIsSubmitting(true);
    
    try {
      let finalUrl = docUrl;
      if (archiveMode === 'file' && docFile) {
        finalUrl = await fileToBase64(docFile);
      }
      
      const data = {
        title: docTitle,
        fileUrl: finalUrl,
        uploadedAt: new Date().toISOString()
      };
      
      await addDoc(collection(firestore, 'documents'), data);
      
      toast({ 
        title: "Resource Published", 
        description: "The document has been added to the archive successfully.",
      });
      
      setDocTitle('');
      setDocUrl('');
      setDocFile(null);
      setDocFormKey(Date.now());
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'documents', operation: 'create' }));
      } else {
        toast({ variant: "destructive", title: "Publication Error", description: "An unexpected error occurred during upload." });
      }
    }
  };

  const addGalleryImage = async () => {
    if (!firestore || !galleryFile) return;
    setIsSubmitting(true);
    
    try {
      const base64 = await fileToBase64(galleryFile);
      const data = {
        title: galleryCaption || "",
        imageUrl: base64,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(firestore, 'gallery'), data);
      
      toast({ 
        title: "Image Published", 
        description: "The photo has been added to the gallery successfully.",
      });
      
      setGalleryCaption('');
      setGalleryFile(null);
      setGalleryFormKey(Date.now() + 1);
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'gallery', operation: 'create' }));
      } else {
        toast({ variant: "destructive", title: "Publication Error", description: "An unexpected error occurred during upload." });
      }
    }
  };

  const confirmDelete = () => {
    if (!firestore || !itemToDelete) return;
    deleteDoc(doc(firestore, itemToDelete.col, itemToDelete.id))
      .then(() => {
        toast({ title: "Removed successfully" });
        setItemToDelete(null);
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `${itemToDelete.col}/${itemToDelete.id}`, operation: 'delete' }));
        setItemToDelete(null);
      });
  };

  const hasAdminAccess = useMemo(() => {
    if (!user) return false;
    return user.email === ADMIN_EMAIL;
  }, [user]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center pt-24"><Loader2 className="animate-spin text-elf-gold" size={48} /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-elf-green-dark flex flex-col items-center justify-center p-6 pt-32 pb-20">
        <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden border-none shadow-2xl">
          <CardHeader className="text-center pb-6 pt-10">
            <CardTitle className="text-3xl font-headline italic text-elf-green-dark">
              Admin Portal
            </CardTitle>
            <p className="text-xs text-elf-text-light uppercase tracking-widest mt-2">Administrator Access Only</p>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-10 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Email</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="rounded-xl h-12" 
                  placeholder="Enter email address" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="rounded-xl h-12 pr-12" 
                    placeholder="Enter password" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-elf-text-light">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-elf-gold text-elf-green-dark h-12 rounded-full font-bold mt-4 shadow-lg hover:bg-elf-gold/90 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
              </Button>
              <div className="text-center pt-2">
                <button type="button" onClick={handleForgotPassword} disabled={isResetting} className="text-sm text-elf-text-light hover:underline inline-flex items-center gap-1">
                  {isResetting ? <Loader2 className="animate-spin" size={12} /> : <KeyRound size={12} />} Forgot Password?
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
        <Card className="max-w-xl w-full text-center p-12 rounded-3xl bg-white shadow-2xl">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={40} /></div>
          <h2 className="text-3xl font-headline font-bold text-elf-green-dark mb-4">Access Denied</h2>
          <p className="text-elf-text-mid mb-8">This portal is restricted to the administrator. Please contact the administrator for access.</p>
          <Button variant="outline" onClick={() => auth && signOut(auth)} className="rounded-full px-10 h-12 border-elf-gold text-elf-gold hover:bg-elf-gold hover:text-white transition-all">Return to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elf-cream pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-headline text-elf-green-dark font-bold italic">ELF Dashboard</h1>
            <p className="text-elf-text-mid">Signed in as Administrator</p>
          </div>
          <Button variant="outline" className="rounded-full border-elf-gold text-elf-gold hover:bg-elf-gold hover:text-white" onClick={() => setIsSignOutDialogOpen(true)}>
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-10 h-14 bg-white border border-elf-gold/10 p-1 rounded-full shadow-sm">
            <TabsTrigger value="archive" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold transition-all">Resource Archive</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold transition-all">Photo Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-8">
            <Card className="rounded-2xl border-elf-gold/10 overflow-hidden shadow-sm" key={docFormKey}>
              <CardHeader className="bg-white border-b p-6">
                <CardTitle className="text-lg font-headline italic flex items-center gap-2">
                  <UploadCloud size={20} className="text-elf-gold" /> Publish Resource
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6 bg-white/50">
                <div className="space-y-4">
                  <div className="space-y-1"><Label>Title</Label><Input placeholder="E.g. Study Guide 2026" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="rounded-xl" /></div>
                  <RadioGroup value={archiveMode} onValueChange={(val: 'link' | 'file') => setArchiveMode(val)} className="flex gap-6 pb-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="file" id="f" /><Label htmlFor="f">Upload PDF</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="link" id="l" /><Label htmlFor="l">Link (URL)</Label></div>
                  </RadioGroup>
                  {archiveMode === 'link' ? (
                    <Input placeholder="Enter URL" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} className="rounded-xl" />
                  ) : (
                    <div className="flex gap-2">
                      <Input type="file" accept="application/pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="h-12 pt-2.5 rounded-xl bg-white cursor-pointer" />
                    </div>
                  )}
                </div>
                <Button onClick={addDocument} disabled={isSubmitting || !docTitle || (archiveMode === 'file' && !docFile) || (archiveMode === 'link' && !docUrl)} className="w-full bg-elf-gold text-elf-green-dark rounded-full h-12 font-bold shadow-lg hover:bg-elf-gold/90 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null} Publish to Archive
                </Button>
              </CardContent>
            </Card>
            
            <div className="grid gap-3">
              <h3 className="font-headline text-2xl text-elf-green-dark italic mb-2">Recent Archives</h3>
              {documents?.map(d => (
                <div key={d.id} className="bg-white p-5 rounded-2xl border border-elf-gold/10 flex justify-between items-center shadow-sm hover:border-elf-gold/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-elf-gold/10 rounded-xl flex items-center justify-center text-elf-gold"><FileText size={20} /></div>
                    <div>
                      <p className="font-bold text-elf-green-dark">{d.title}</p>
                      <p className="text-[10px] text-elf-text-light uppercase tracking-widest">{new Date(d.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ col: 'documents', id: d.id, title: d.title })} className="text-destructive hover:bg-destructive/10"><Trash2 size={18} /></Button>
                </div>
              ))}
              {(!documents || documents.length === 0) && (
                <div className="text-center py-10 text-elf-text-light italic">No resources found.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8">
            <Card className="rounded-2xl border-elf-gold/10 overflow-hidden shadow-sm" key={galleryFormKey}>
              <CardHeader className="bg-white border-b p-6">
                <CardTitle className="text-lg font-headline italic flex items-center gap-2">
                  <UploadCloud size={20} className="text-elf-gold" /> Add Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6 bg-white/50">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1"><Label>Caption (Optional)</Label><Input placeholder="Event description..." value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} className="rounded-xl" /></div>
                  <div className="space-y-1"><Label>Choose Image</Label><Input type="file" accept="image/*" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} className="h-12 pt-2.5 rounded-xl bg-white cursor-pointer" /></div>
                </div>
                <Button onClick={addGalleryImage} disabled={isSubmitting || !galleryFile} className="w-full bg-elf-gold text-elf-green-dark rounded-full h-12 font-bold shadow-lg hover:bg-elf-gold/90 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null} Publish to Gallery
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {galleryItems?.map(g => (
                <div key={g.id} className="bg-white rounded-2xl overflow-hidden border border-elf-gold/10 relative group shadow-sm">
                  <img src={g.imageUrl} className="w-full aspect-square object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="icon" onClick={() => setItemToDelete({ col: 'gallery', id: g.id, title: 'Gallery Photo' })} className="h-10 w-10 rounded-full"><Trash2 size={18} /></Button>
                  </div>
                </div>
              ))}
              {(!galleryItems || galleryItems.length === 0) && (
                <div className="col-span-full text-center py-10 text-elf-text-light italic">No photos in the gallery.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader><AlertDialogTitle>Delete Permanent</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove "{itemToDelete?.title}"? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 rounded-full px-8">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader><AlertDialogTitle>Logout?</AlertDialogTitle><AlertDialogDescription>Confirming logout will end your current administrative session.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel className="rounded-full">Stay</AlertDialogCancel><AlertDialogAction onClick={() => auth && signOut(auth)} className="rounded-full px-8">Logout</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
