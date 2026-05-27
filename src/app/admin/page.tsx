"use client";

import React, { useState, useMemo, useRef } from 'react';
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
  KeyRound,
  UploadCloud,
  X,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/error-mapping';
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
  
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [isSubmittingGallery, setIsSubmittingGallery] = useState(false);

  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [archiveMode, setArchiveMode] = useState<'link' | 'file'>('link');
  
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  // Key states to force remount of file inputs
  const [docInputKey, setDocInputKey] = useState(0);
  const [galleryInputKey, setGalleryInputKey] = useState(0);

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ col: string, id: string, title?: string } | null>(null);

  const docsQuery = useMemo(() => firestore ? query(collection(firestore, 'documents'), orderBy('uploadedAt', 'desc')) : null, [firestore]);
  const galleryQuery = useMemo(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')) : null, [firestore]);
  
  const { data: documents } = useCollection(docsQuery);
  const { data: galleryItems } = useCollection(galleryQuery);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, (email || '').toLowerCase().trim(), password || '');
      toast({ title: "Access Granted", description: "Welcome to the administrator portal." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: getErrorMessage(error) });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth) return;
    const targetEmail = (email || '').toLowerCase().trim() || ADMIN_EMAIL;
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      toast({ title: "Reset Email Sent", description: "Please check your inbox." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: getErrorMessage(error) });
    } finally {
      setIsResetting(false);
    }
  };

  const addDocument = async () => {
    if (!firestore || !docTitle) return;
    
    setIsSubmittingDoc(true);

    try {
      let finalUrl = docUrl;

      if (archiveMode === 'file' && docFile) {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(docFile);
        });
      }

      if (!finalUrl) throw new Error("A valid URL or file is required.");

      const docRef = await addDoc(collection(firestore, 'documents'), {
        title: docTitle,
        fileUrl: finalUrl,
        uploadedAt: new Date().toISOString()
      });

      console.log("Document saved to Firestore:", docRef.id);
      
      toast({ title: "Success", description: "Resource published successfully." });
      setDocTitle('');
      setDocUrl('');
      setDocFile(null);
      setDocInputKey(k => k + 1);

    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: getErrorMessage(err) });
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const addGalleryImage = async () => {
    if (!firestore || !galleryFile) return;
    
    setIsSubmittingGallery(true);

    try {
      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(galleryFile);
      });

      const docRef = await addDoc(collection(firestore, 'gallery'), {
        title: galleryCaption || "",
        imageUrl: base64String,
        createdAt: new Date().toISOString()
      });

      console.log("Photo saved to Firestore:", docRef.id);

      toast({ title: "Saved Successfully", description: "Photo added to the gallery." });
      setGalleryCaption('');
      setGalleryFile(null);
      setGalleryInputKey(k => k + 1);

    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: getErrorMessage(err) });
    } finally {
      setIsSubmittingGallery(false);
    }
  };

  const confirmDelete = async (col: string, id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, col, id));
      toast({ title: "Removed Successfully" });
      setItemToDelete(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: getErrorMessage(err) });
      setItemToDelete(null);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-elf-gold" size={48} /></div>;

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-elf-green-dark flex flex-col items-center justify-center p-6 pt-32 pb-20">
        <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden border-none shadow-2xl">
          <CardHeader className="text-center pb-6 pt-10">
            <CardTitle className="text-3xl font-headline italic text-elf-green-dark">Admin Portal</CardTitle>
            <p className="text-xs text-elf-text-light uppercase tracking-widest mt-2">Restricted Access</p>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-10 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-elf-light">Email</Label>
                <input 
                  type="email" 
                  value={email || ''} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full h-12 rounded-xl border px-3" 
                  placeholder="admin@example.com" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-elf-light">Password</Label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password || ''} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="w-full h-12 rounded-xl border px-3 pr-12" 
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-elf-text-light">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoggingIn} className="w-full bg-elf-gold text-elf-green-dark h-12 rounded-full font-bold mt-4">
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
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

  return (
    <div className="min-h-screen bg-elf-cream pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-headline text-elf-green-dark font-bold italic">Dashboard</h1>
            <p className="text-elf-text-mid">Manage Resources & Gallery</p>
          </div>
          <Button variant="outline" className="rounded-full border-elf-gold text-elf-gold" onClick={() => setIsSignOutDialogOpen(true)}>
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-10 h-14 bg-white border p-1 rounded-full">
            <TabsTrigger value="archive" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Resources</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-8">
            <Card className="rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="bg-white border-b p-6">
                <CardTitle className="text-lg font-headline italic flex items-center gap-2">
                  <UploadCloud size={20} className="text-elf-gold" /> Add New Resource
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6 bg-white/50">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Resource Title</Label>
                    <Input placeholder="Enter title..." value={docTitle || ''} onChange={(e) => setDocTitle(e.target.value)} className="rounded-xl" />
                  </div>
                  <RadioGroup value={archiveMode} onValueChange={(val: 'link' | 'file') => {setArchiveMode(val); setDocFile(null); setDocUrl('');}} className="flex gap-6 pb-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="file" id="f" />
                      <Label htmlFor="f">Upload PDF</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="link" id="l" />
                      <Label htmlFor="l">External Link</Label>
                    </div>
                  </RadioGroup>
                  
                  {archiveMode === 'link' ? (
                    <div className="space-y-3">
                      <Input placeholder="https://..." value={docUrl || ''} onChange={(e) => setDocUrl(e.target.value)} className="rounded-xl" />
                      <div className="bg-elf-gold/10 border border-elf-gold/20 p-4 rounded-xl text-xs space-y-2 text-elf-green-dark">
                        <p className="font-bold flex items-center gap-2">
                          <ExternalLink size={12} className="text-elf-gold" /> How to get a valid sharing link:
                        </p>
                        <ul className="list-decimal list-inside space-y-1 ml-1 text-elf-text-mid">
                          <li>Upload your document to Google Drive, OneDrive, or Dropbox.</li>
                          <li>Right-click the file and select "Share" or "Get link".</li>
                          <li>Ensure access is set to "Anyone with the link can view".</li>
                          <li>Copy the link and paste it in the field above.</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input 
                        key={docInputKey}
                        ref={docFileInputRef} 
                        type="file" 
                        accept="application/pdf" 
                        onChange={(e) => setDocFile(e.target.files?.[0] || null)} 
                        className="h-12 pt-2.5 rounded-xl bg-white" 
                      />
                      {docFile && <Button variant="ghost" size="icon" onClick={() => { setDocFile(null); setDocInputKey(k => k + 1); }} className="text-destructive"><X size={20} /></Button>}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={addDocument} 
                  disabled={isSubmittingDoc || !docTitle || (archiveMode === 'file' && !docFile) || (archiveMode === 'link' && !docUrl)} 
                  className="w-full bg-elf-gold text-elf-green-dark rounded-full h-12 font-bold"
                >
                  {isSubmittingDoc ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Publish to Archive'}
                </Button>
              </CardContent>
            </Card>
            
            <div className="grid gap-3">
              <h3 className="font-headline text-2xl text-elf-green-dark italic">Current Archives ({documents?.length || 0})</h3>
              {documents?.map(d => (
                <div key={d.id} className="bg-white p-5 rounded-2xl border flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-elf-gold/10 rounded-xl flex items-center justify-center text-elf-gold"><FileText size={20} /></div>
                    <div>
                      <p className="font-bold text-elf-green-dark">{d.title}</p>
                      <p className="text-[10px] text-elf-text-light uppercase">{new Date(d.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ col: 'documents', id: d.id, title: d.title })} className="text-destructive"><Trash2 size={18} /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8">
            <Card className="rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="bg-white border-b p-6">
                <CardTitle className="text-lg font-headline italic flex items-center gap-2">
                  <UploadCloud size={20} className="text-elf-gold" /> Add Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6 bg-white/50">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label>Caption</Label>
                    <Input placeholder="Description..." value={galleryCaption || ''} onChange={(e) => setGalleryCaption(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label>Select Image</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        key={galleryInputKey}
                        ref={galleryFileInputRef} 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} 
                        className="h-12 pt-2.5 rounded-xl bg-white" 
                      />
                      {galleryFile && <Button variant="ghost" size="icon" onClick={() => { setGalleryFile(null); setGalleryInputKey(k => k + 1); }} className="text-destructive"><X size={20} /></Button>}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={addGalleryImage} 
                  disabled={isSubmittingGallery || !galleryFile} 
                  className="w-full bg-elf-gold text-elf-green-dark rounded-full h-12 font-bold"
                >
                  {isSubmittingGallery ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Publish to Gallery'}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {galleryItems?.map(g => (
                <div key={g.id} className="bg-white rounded-2xl overflow-hidden border relative group aspect-square">
                  <img src={g.imageUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="icon" onClick={() => setItemToDelete({ col: 'gallery', id: g.id, title: 'Photo' })} className="h-10 w-10 rounded-full"><Trash2 size={18} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
              <AlertDialogDescription>Delete "{itemToDelete?.title}" permanently?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => itemToDelete && confirmDelete(itemToDelete.col, itemToDelete.id)} className="bg-destructive hover:bg-destructive/90 rounded-full px-8">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader><AlertDialogTitle>Logout?</AlertDialogTitle><AlertDialogDescription>End your session?</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => auth && signOut(auth)} className="rounded-full px-8">Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}