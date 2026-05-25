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
  LogOut, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  Copy, 
  Check, 
  Users as UsersIcon,
  ShieldCheck,
  X,
  UserCircle,
  UserMinus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
  
  // Archive States
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [archiveMode, setArchiveMode] = useState<'link' | 'file'>('link');
  
  // Gallery States
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

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
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: getErrorMessage(error) 
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
      
      addDoc(collection(firestore, 'documents'), data)
        .then(() => {
          toast({ 
            title: "Success!", 
            description: "Your resource has been published to the archive." 
          });
          setDocTitle(''); 
          setDocUrl(''); 
          setDocFile(null);
        })
        .catch(err => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ 
            path: 'documents', 
            operation: 'create', 
            requestResourceData: data 
          }));
        });
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Publishing Failed", 
        description: "There was an error processing your file. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGalleryImage = async () => {
    if (!firestore || !galleryFile) return;
    setIsSubmitting(true);
    
    try {
      const base64 = await fileToBase64(galleryFile);
      const data = {
        title: galleryCaption,
        imageUrl: base64,
        createdAt: new Date().toISOString()
      };
      
      addDoc(collection(firestore, 'gallery'), data)
        .then(() => {
          toast({ 
            title: "Success!", 
            description: "Image has been published to the gallery." 
          });
          setGalleryCaption(''); 
          setGalleryFile(null);
        })
        .catch(err => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ 
            path: 'gallery', 
            operation: 'create', 
            requestResourceData: data 
          }));
        });
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: "There was an error processing your picture." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = () => {
    if (!firestore || !itemToDelete) return;
    deleteDoc(doc(firestore, itemToDelete.col, itemToDelete.id))
      .then(() => {
        toast({ title: "Item removed" });
        setItemToDelete(null);
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `${itemToDelete.col}/${itemToDelete.id}`, operation: 'delete' }));
        setItemToDelete(null);
      });
  };

  const confirmDeleteUser = async () => {
    if (!firestore || !userToDelete) return;
    const isSelf = user?.uid === userToDelete.id;
    try {
      await deleteDoc(doc(firestore, 'users', userToDelete.id));
      toast({ title: "Account data removed from database" });
      
      if (isSelf && auth?.currentUser) {
        try { 
          await deleteAuthUser(auth.currentUser);
          toast({ title: "Authentication account deleted" });
        } catch (e) { 
          await signOut(auth); 
        }
      }
      setUserToDelete(null);
    } catch (error) {
       errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `users/${userToDelete.id}`, operation: 'delete' }));
       setUserToDelete(null);
    }
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

  const createSuperAdminProfile = () => {
    if (!firestore || !user || user.email !== SUPER_ADMIN_EMAIL) return;
    const data = {
      email: user.email,
      role: 'admin',
      displayName: user.email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    setDoc(doc(firestore, 'users', user.uid), data)
      .then(() => toast({ title: "Profile Initialized" }))
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `users/${user.uid}`, operation: 'create', requestResourceData: data })));
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-elf-cream pt-24">
      <Loader2 className="animate-spin text-elf-gold" size={48} />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-elf-green-dark flex flex-col items-center justify-center p-6 pt-32 pb-20 relative">
        <Card className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden border-none animate-fade-in-up">
          <CardHeader className="text-center pb-6 bg-elf-cream/30 border-b border-elf-gold/10 pt-10">
            <CardTitle className="text-4xl font-headline italic text-elf-green-dark">
              {isLogin ? 'Admin Portal' : 'Register Admin'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-10">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Email</label>
                <Input placeholder="admin@elf.org" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Password</label>
                <div className="relative">
                  <Input placeholder="••••••••" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-12 h-12 rounded-xl" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-elf-text-light">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark h-14 font-bold rounded-full shadow-lg">
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : isLogin ? 'Sign In' : 'Create Account'}
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
        <Card className="max-w-xl w-full text-center p-8 md:p-12 rounded-3xl border-elf-gold/10 shadow-2xl bg-white animate-fade-in-up">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-headline font-bold text-elf-green-dark mb-4">Access Restricted</h2>
          <p className="text-elf-text-mid mb-8">
            Your account is verified, but you need administrative permissions to view the dashboard. 
          </p>
          <div className="flex flex-col gap-3">
            {user.email === SUPER_ADMIN_EMAIL && (
              <Button className="rounded-full w-full h-12 bg-elf-gold text-elf-green-dark font-bold" onClick={createSuperAdminProfile}>
                <UserCircle size={18} className="mr-2" /> Initialize My Profile
              </Button>
            )}
            <Button variant="ghost" className="text-elf-text-light" onClick={() => auth && signOut(auth)}>
              <LogOut size={16} className="mr-2" /> Sign out
            </Button>
            
            <div className="pt-6 border-t mt-4">
              <p className="text-xs text-elf-text-light mb-4 italic">No longer wish to be a member?</p>
              <Button 
                variant="outline" 
                className="rounded-full w-full h-12 text-destructive border-destructive/20"
                onClick={() => setUserToDelete({ id: user.uid, email: user.email! })}
              >
                <UserMinus size={18} className="mr-2" /> Delete My Account
              </Button>
            </div>
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
            <p className="text-elf-text-mid flex items-center gap-2 mt-1">Logged in as <span className="font-bold">{user.email}</span></p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="text-destructive border-destructive/20 rounded-full px-4 h-10"
              onClick={() => setUserToDelete({ id: user.uid, email: user.email! })}
            >
              <UserMinus size={16} className="mr-2" /> Delete My Account
            </Button>
            <AlertDialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-elf-text-mid border-elf-gold/20 rounded-full px-6 h-10">
                  <LogOut size={18} className="mr-2" /> End Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader><AlertDialogTitle>Log out?</AlertDialogTitle></AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-white rounded-full">Sign Out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-white border border-elf-gold/10 p-1 rounded-full shadow-sm">
            <TabsTrigger value="archive" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Archive</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Gallery</TabsTrigger>
            <TabsTrigger value="users" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-8 animate-fade-in-up">
            <Card className="rounded-2xl overflow-hidden border-elf-gold/10">
              <CardHeader className="bg-white/50 border-b p-6"><CardTitle className="text-lg font-bold">Post Resource</CardTitle></CardHeader>
              <CardContent className="space-y-6 pt-8 px-6 pb-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Resource Title" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="rounded-xl" />
                  </div>
                  <RadioGroup value={archiveMode} onValueChange={(val: 'link' | 'file') => setArchiveMode(val)} className="flex gap-6">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="file" id="m-file" /><Label htmlFor="m-file">File (Max 1MB)</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="link" id="m-link" /><Label htmlFor="m-link">Drive Link</Label></div>
                  </RadioGroup>
                  {archiveMode === 'link' ? (
                    <div className="space-y-3">
                      <Input placeholder="Google Drive URL" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} className="rounded-xl" />
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-700 uppercase mb-2">How to get link:</p>
                        <ol className="text-[10px] text-blue-600 space-y-1 list-decimal ml-3">
                          <li>Upload PDF to Google Drive.</li>
                          <li>Right-click file &gt; Share &gt; Share.</li>
                          <li>Change "Restricted" to "Anyone with the link".</li>
                          <li>Copy link and paste above.</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="file" accept="application/pdf" className="hidden" id="a-up" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocFile(file);
                        e.target.value = ''; 
                      }} />
                      <Button asChild variant="outline" className="flex-grow rounded-xl h-12 justify-start font-normal"><label htmlFor="a-up" className="cursor-pointer truncate">{docFile ? docFile.name : 'Choose PDF'}</label></Button>
                      {docFile && <Button variant="ghost" className="text-destructive border" onClick={() => setDocFile(null)}><X size={18} /></Button>}
                    </div>
                  )}
                </div>
                <div className="flex justify-end"><Button onClick={addDocument} disabled={isSubmitting || !docTitle || (archiveMode === 'file' && !docFile) || (archiveMode === 'link' && !docUrl)} className="bg-elf-gold text-elf-green-dark font-bold rounded-full px-8">Publish</Button></div>
              </CardContent>
            </Card>
            <div className="grid gap-4">
              {documents?.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-2xl border border-elf-gold/5 flex justify-between items-center group">
                  <div className="flex items-center gap-4"><FileText className="text-elf-gold" size={24} /><div><p className="font-bold">{d.title}</p></div></div>
                  <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ col: 'documents', id: d.id, title: d.title })} className="text-destructive opacity-0 group-hover:opacity-100"><Trash2 size={18} /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8 animate-fade-in-up">
            <Card className="rounded-2xl border-elf-gold/10">
              <CardHeader className="bg-white/50 border-b p-6"><CardTitle className="text-lg font-bold">Upload Picture</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6 pt-8 pb-8 px-6">
                <div className="space-y-2">
                  <Label>Add Caption (optional)</Label>
                  <Input placeholder="Moment description..." value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Image File</Label>
                  <div className="flex gap-2">
                    <input type="file" accept="image/*" className="hidden" id="g-up" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setGalleryFile(file);
                      e.target.value = ''; 
                    }} />
                    <Button asChild variant="outline" className="flex-grow rounded-xl h-12"><label htmlFor="g-up" className="truncate cursor-pointer">{galleryFile ? galleryFile.name : 'Choose Image'}</label></Button>
                    {galleryFile && <Button variant="ghost" onClick={() => setGalleryFile(null)} className="h-12 border"><X size={16}/></Button>}
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={addGalleryImage} disabled={isSubmitting || !galleryFile} className="w-full bg-elf-gold text-elf-green-dark rounded-full h-12 font-bold">Publish</Button>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryItems?.map(g => (
                <div key={g.id} className="bg-white rounded-2xl overflow-hidden border border-elf-gold/10 group relative">
                  <img src={g.imageUrl} className="w-full aspect-video object-cover" alt="" />
                  <div className="p-4"><p className="font-bold text-sm truncate">{g.title || 'Untitled Moment'}</p></div>
                  <Button variant="destructive" size="icon" onClick={() => setItemToDelete({ col: 'gallery', id: g.id, title: g.title || 'Moment' })} className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 shadow-lg"><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-8 animate-fade-in-up">
            {usersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-elf-gold" /></div>
            ) : (
              <div className="grid gap-4">
                {allUsers?.map(u => (
                  <div key={u.id} className="bg-white p-6 rounded-2xl border border-elf-gold/5 flex justify-between items-center group">
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
                          Role: <span className="font-bold">{u.role}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {u.email !== SUPER_ADMIN_EMAIL && (
                        <Button variant="outline" size="sm" className="rounded-full h-10 border-elf-gold/20" onClick={() => toggleAdmin(u.id, u.role)}>
                          {u.role === 'admin' ? 'Revoke' : 'Make Admin'}
                        </Button>
                      )}
                      {(u.email !== SUPER_ADMIN_EMAIL || user?.uid === u.id) && (
                        <Button variant="ghost" size="icon" onClick={() => setUserToDelete({ id: u.id, email: u.email })} className="text-destructive"><Trash2 size={18} /></Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Global Deletion Confirmation Dialogs */}
        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader><AlertDialogTitle>Delete "{itemToDelete?.title}"?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white rounded-full">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account for {userToDelete?.email}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent and cannot be undone. All your profile data will be removed from the NiMSA-AMSA ELF database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-white rounded-full">Confirm Deletion</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
