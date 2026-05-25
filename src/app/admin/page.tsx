
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth, useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  deleteDoc,
  addDoc,
  updateDoc,
  serverTimestamp
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
  Users as UsersIcon,
  ShieldCheck,
  X
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

const SUPER_ADMIN_EMAIL = 'gideonjackbara@gmail.com';

export default function AdminPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const userProfileRef = useMemo(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: profile } = useDoc(userProfileRef);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Archive States
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [archiveMode, setArchiveMode] = useState<'link' | 'file'>('link');
  const [docFileKey, setDocFileKey] = useState(Date.now());
  
  // Gallery States
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryFileKey, setGalleryFileKey] = useState(Date.now() + 1);

  // Confirmation States
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ col: string, id: string, title?: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string, email: string } | null>(null);

  // Queries
  const docsQuery = useMemo(() => firestore ? query(collection(firestore, 'documents'), orderBy('uploadedAt', 'desc')) : null, [firestore]);
  const galleryQuery = useMemo(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')) : null, [firestore]);
  const usersQuery = useMemo(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  
  const { data: documents } = useCollection(docsQuery);
  const { data: galleryItems } = useCollection(galleryQuery);
  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);

  // Aggressive Sync: Ensure any logged in user has a Firestore profile
  useEffect(() => {
    if (user && firestore && !authLoading) {
      const userRef = doc(firestore, 'users', user.uid);
      setDoc(userRef, {
        email: user.email,
        role: user.email === SUPER_ADMIN_EMAIL ? 'admin' : (profile?.role || 'user'),
        displayName: user.email?.split('@')[0],
        lastActive: new Date().toISOString()
      }, { merge: true });
    }
  }, [user, firestore, authLoading, profile?.role]);

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
    if (!auth || !firestore) return;
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(firestore, 'users', res.user.uid);
        await setDoc(userRef, {
          email: res.user.email,
          displayName: res.user.email?.split('@')[0],
          lastLogin: new Date().toISOString(),
        }, { merge: true });
        toast({ title: "Welcome back", description: "Access granted." });
      } else {
        if (password.length < 6) throw { code: 'auth/weak-password' };
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
          email: res.user.email,
          role: res.user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'user',
          displayName: email.split('@')[0],
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(firestore, 'users', res.user.uid), userData);
        toast({ title: "Account created", description: "Authentication successful." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      toast({ title: "Signed out" });
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
      
      toast({ title: "Upload Successful!", description: "The resource is now live." });
      
      // INSTANT FORM RESET
      setDocTitle(''); 
      setDocUrl(''); 
      setDocFile(null);
      setDocFileKey(Date.now()); // Forces file input to reset to "Choose File"
      setIsSubmitting(false);

    } catch (err: any) {
      setIsSubmitting(false);
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'documents', operation: 'create' }));
      } else {
        toast({ variant: "destructive", title: "Upload Error", description: "Error saving document." });
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
      
      toast({ title: "Gallery Updated!", description: "Moment successfully published." });
      
      // INSTANT FORM RESET
      setGalleryCaption(''); 
      setGalleryFile(null);
      setGalleryFileKey(Date.now() + 1); // Forces file input to reset to "Choose Image"
      setIsSubmitting(false);

    } catch (err: any) {
      setIsSubmitting(false);
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'gallery', operation: 'create' }));
      } else {
        toast({ variant: "destructive", title: "Upload Error", description: "Error saving image." });
      }
    }
  };

  const confirmDelete = () => {
    if (!firestore || !itemToDelete) return;
    deleteDoc(doc(firestore, itemToDelete.col, itemToDelete.id))
      .then(() => {
        toast({ title: "Removed Successfully" });
        setItemToDelete(null);
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `${itemToDelete.col}/${itemToDelete.id}`, operation: 'delete' }));
        setItemToDelete(null);
      });
  };

  const confirmDeleteUser = async () => {
    if (!firestore || !userToDelete) return;
    deleteDoc(doc(firestore, 'users', userToDelete.id))
      .then(() => {
        toast({ title: "User profile removed" });
        setUserToDelete(null);
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `users/${userToDelete.id}`, operation: 'delete' }));
        setUserToDelete(null);
      });
  };

  const toggleAdmin = (userId: string, currentRole: string) => {
    if (!firestore) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    updateDoc(doc(firestore, 'users', userId), { role: newRole })
      .then(() => toast({ title: `Role updated to ${newRole}` }))
      .catch(() => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `users/${userId}`, operation: 'update', requestResourceData: { role: newRole } })));
  };

  const hasAdminAccess = useMemo(() => {
    if (!user) return false;
    if (user.email === SUPER_ADMIN_EMAIL) return true;
    return profile?.role === 'admin';
  }, [user, profile]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center pt-24"><Loader2 className="animate-spin text-elf-gold" size={48} /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-elf-green-dark flex flex-col items-center justify-center p-6 pt-32 pb-20">
        <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden border-none animate-fade-in-up">
          <CardHeader className="text-center pb-6 pt-10 border-b border-elf-gold/10">
            <CardTitle className="text-3xl font-headline italic text-elf-green-dark">
              {isLogin ? 'Admin Portal' : 'Register Admin'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-10 space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-12" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Password</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl h-12 pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-elf-text-light">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-elf-gold text-elf-green-dark h-12 rounded-full font-bold mt-4 shadow-lg">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
              <div className="text-center pt-4">
                <button type="button" className="text-sm text-elf-text-light hover:underline" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "New here? Register" : "Already registered? Sign in"}
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
        <Card className="max-w-xl w-full text-center p-12 rounded-3xl bg-white shadow-2xl animate-fade-in-up">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={40} /></div>
          <h2 className="text-3xl font-headline font-bold text-elf-green-dark mb-4">Verification Pending</h2>
          <p className="text-elf-text-mid mb-8">Your account is registered, but you need admin approval. Contact {SUPER_ADMIN_EMAIL} for access.</p>
          <div className="flex flex-col gap-3">
             <Button variant="ghost" onClick={() => auth && signOut(auth)}>Sign Out</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elf-cream pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-headline text-elf-green-dark font-bold">Admin Dashboard</h1>
            <p className="text-elf-text-mid">Welcome, <b>{user.email}</b></p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => setIsSignOutDialogOpen(true)}><LogOut size={16} className="mr-2" /> Logout</Button>
        </div>

        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-white border border-elf-gold/10 p-1 rounded-full shadow-sm">
            <TabsTrigger value="archive" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Archive</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Gallery</TabsTrigger>
            <TabsTrigger value="users" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-8 animate-fade-in-up">
            <Card className="rounded-2xl border-elf-gold/10">
              <CardHeader className="border-b p-6"><CardTitle className="text-lg">Publish New Resource</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1"><Label>Title</Label><Input placeholder="E.g. Preclinical Study Guide" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} /></div>
                  <RadioGroup value={archiveMode} onValueChange={(val: 'link' | 'file') => setArchiveMode(val)} className="flex gap-6">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="file" id="f" /><Label htmlFor="f">Direct Upload (PDF)</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="link" id="l" /><Label htmlFor="l">External Link (Drive)</Label></div>
                  </RadioGroup>
                  {archiveMode === 'link' ? (
                    <div className="space-y-2">
                      <Input placeholder="URL (e.g. Google Drive link)" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input key={docFileKey} type="file" accept="application/pdf" className="hidden" id="pdf-in" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
                      <Button asChild variant="outline" className="flex-grow h-12 justify-start font-normal text-left overflow-hidden"><label htmlFor="pdf-in" className="cursor-pointer truncate block">{docFile ? docFile.name : 'Choose PDF File'}</label></Button>
                      {docFile && <Button variant="ghost" size="icon" onClick={() => { setDocFile(null); setDocFileKey(Date.now()); }}><X size={18}/></Button>}
                    </div>
                  )}
                </div>
                <Button onClick={addDocument} disabled={isSubmitting || !docTitle || (archiveMode === 'file' && !docFile) || (archiveMode === 'link' && !docUrl)} className="w-full bg-elf-gold text-elf-green-dark rounded-full h-12 font-bold">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null} Publish to Archive
                </Button>
              </CardContent>
            </Card>
            
            <div className="grid gap-3">
              {documents?.map(d => (
                <div key={d.id} className="bg-white p-4 rounded-xl border border-elf-gold/10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText className="text-elf-gold" size={20} />
                    <p className="font-bold text-elf-green-dark">{d.title}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ col: 'documents', id: d.id, title: d.title })} className="text-destructive"><Trash2 size={18} /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8 animate-fade-in-up">
            <Card className="rounded-2xl border-elf-gold/10">
              <CardHeader className="border-b p-6"><CardTitle className="text-lg">Add Gallery Moment</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1"><Label>Caption (Optional)</Label><Input placeholder="Event description..." value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label>Image (Max 1MB)</Label>
                    <div className="flex gap-2">
                      <input key={galleryFileKey} type="file" accept="image/*" className="hidden" id="img-in" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} />
                      <Button asChild variant="outline" className="flex-grow h-12 justify-start font-normal text-left overflow-hidden"><label htmlFor="img-in" className="cursor-pointer truncate block">{galleryFile ? galleryFile.name : 'Choose Image File'}</label></Button>
                      {galleryFile && <Button variant="ghost" size="icon" onClick={() => { setGalleryFile(null); setGalleryFileKey(Date.now() + 1); }}><X size={18}/></Button>}
                    </div>
                  </div>
                </div>
                <Button onClick={addGalleryImage} disabled={isSubmitting || !galleryFile} className="w-full bg-elf-gold text-elf-green-dark rounded-full h-12 font-bold">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null} Publish to Gallery
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryItems?.map(g => (
                <div key={g.id} className="bg-white rounded-xl overflow-hidden border relative">
                  <img src={g.imageUrl} className="w-full aspect-video object-cover" alt="" />
                  <Button variant="destructive" size="icon" onClick={() => setItemToDelete({ col: 'gallery', id: g.id, title: 'Gallery Item' })} className="absolute top-2 right-2 h-8 w-8 rounded-full"><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-headline text-2xl text-elf-green-dark italic">Manage Registered Users</h3>
            </div>
            {usersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-elf-gold" size={32} /></div>
            ) : !allUsers || allUsers.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-elf-gold/20 text-elf-text-light italic">
                No registered user profiles found in the database. 
                <p className="mt-2 text-xs">Users appear here after their first login.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {allUsers?.map(u => (
                  <div key={u.id} className="bg-white p-6 rounded-2xl border border-elf-gold/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-elf-gold/10 text-elf-gold' : 'bg-elf-green-dark/5 text-elf-text-mid'}`}>
                        <UsersIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-elf-green-dark flex items-center gap-2">
                          {u.email} {u.role === 'admin' && <ShieldCheck size={14} className="text-elf-gold" />}
                        </p>
                        <p className="text-[10px] text-elf-text-light uppercase tracking-widest font-bold">Role: {u.role || 'user'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {u.email !== SUPER_ADMIN_EMAIL && (
                        <Button variant="outline" size="sm" className="rounded-full px-6" onClick={() => toggleAdmin(u.id, u.role)}>
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </Button>
                      )}
                      {u.email !== SUPER_ADMIN_EMAIL && (
                        <Button variant="ghost" size="icon" onClick={() => setUserToDelete({ id: u.id, email: u.email })} className="text-destructive"><Trash2 size={18} /></Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader><AlertDialogTitle>Delete Resource?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove "{itemToDelete?.title}"? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete Forever</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader><AlertDialogTitle>Remove User Profile?</AlertDialogTitle><AlertDialogDescription>This will delete {userToDelete?.email}'s record from Firestore. It does NOT delete their login credentials.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive hover:bg-destructive/90">Remove Profile</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader><AlertDialogTitle>End Session?</AlertDialogTitle><AlertDialogDescription>You will be signed out of the Admin Dashboard.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Stay</AlertDialogCancel><AlertDialogAction onClick={handleSignOut}>Logout</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
