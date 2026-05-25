"use client";

import React, { useState, useMemo } from 'react';
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
  ExternalLink, 
  RefreshCcw, 
  Copy, 
  Check, 
  ShieldAlert,
  Users as UsersIcon,
  ShieldCheck,
  ShieldX
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/error-mapping';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SUPER_ADMIN_EMAIL = 'gideonjackbara@gmail.com';

export default function AdminPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  // Role checking
  const userProfileRef = useMemo(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: profile, loading: profileLoading, error: profileError } = useDoc(userProfileRef);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Form States
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryCat, setGalleryCat] = useState('Workshops');

  // Queries
  const docsQuery = useMemo(() => firestore ? query(collection(firestore, 'documents'), orderBy('uploadedAt', 'desc')) : null, [firestore]);
  const galleryQuery = useMemo(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')) : null, [firestore]);
  const usersQuery = useMemo(() => firestore ? query(collection(firestore, 'users'), orderBy('createdAt', 'desc')) : null, [firestore]);
  
  const { data: documents } = useCollection(docsQuery);
  const { data: galleryItems } = useCollection(galleryQuery);
  const { data: allUsers } = useCollection(usersQuery);

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
      console.error("Auth Error Code:", error.code);
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

  const addDocument = () => {
    if (!firestore || !docTitle || !docUrl) return;
    const data = {
      title: docTitle,
      fileUrl: docUrl,
      uploadedAt: new Date().toISOString()
    };
    addDoc(collection(firestore, 'documents'), data)
      .then(() => {
        setDocTitle('');
        setDocUrl('');
        toast({ title: "Resource published" });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'documents',
          operation: 'create',
          requestResourceData: data
        }));
      });
  };

  const addGalleryImage = () => {
    if (!firestore || !galleryTitle || !galleryUrl) return;
    const data = {
      title: galleryTitle,
      imageUrl: galleryUrl,
      category: galleryCat,
      createdAt: new Date().toISOString()
    };
    addDoc(collection(firestore, 'gallery'), data)
      .then(() => {
        setGalleryTitle('');
        setGalleryUrl('');
        toast({ title: "Image posted to gallery" });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'gallery',
          operation: 'create',
          requestResourceData: data
        }));
      });
  };

  const deleteItem = (col: string, id: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, col, id))
      .then(() => toast({ title: "Item removed" }))
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `${col}/${id}`,
          operation: 'delete'
        }));
      });
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

  if (authLoading || (user && profileLoading)) return (
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
            <p className="text-elf-text-light text-[10px] mt-2 tracking-widest uppercase font-bold">
              {isLogin ? 'Secure Administrative Access' : 'Create your initial profile'}
            </p>
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
                  className="h-12 border-elf-gold/20 focus:ring-elf-gold rounded-xl bg-elf-cream/10"
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
                    className="pr-12 h-12 border-elf-gold/20 focus:ring-elf-gold rounded-xl bg-elf-cream/10"
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
                className="w-full bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark h-14 font-bold transition-all rounded-full shadow-lg text-lg"
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
            Authentication successful, but you don't have administrative privileges yet. 
            If you are <strong>{SUPER_ADMIN_EMAIL}</strong>, please ensure you've registered and refreshed. 
            Others must be approved by an existing admin.
          </p>
          
          <div className="text-left bg-elf-cream/50 p-6 rounded-2xl border border-elf-gold/10 mb-8 space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-elf-text-light">Your UID</p>
              <div 
                className="bg-white px-3 py-2 rounded-lg border border-elf-gold/5 text-[10px] font-mono break-all cursor-pointer flex justify-between items-center group active:scale-[0.98] transition-transform"
                onClick={() => copyToClipboard(user.uid)}
              >
                <span className="truncate">{user.uid}</span>
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="opacity-40 group-hover:opacity-100" />}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="rounded-full w-full h-12 bg-elf-green-dark text-white font-bold" onClick={() => window.location.reload()}>
              <RefreshCcw size={18} className="mr-2" /> Refresh Status
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
          <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full px-6 h-11" onClick={() => auth && signOut(auth)}>
            <LogOut size={18} className="mr-2" /> End Session
          </Button>
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
              <UsersIcon size={18} className="mr-2" /> User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-8 animate-fade-in-up">
            <Card className="border-elf-gold/10 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-white/50 border-b border-elf-gold/5 p-6">
                <CardTitle className="text-lg font-bold text-elf-green-dark">Publish New Resource</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 px-6 pb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Title</label>
                  <Input placeholder="e.g. Preclinical Guide" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">PDF URL</label>
                  <Input placeholder="Direct download link" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} className="rounded-xl" />
                </div>
                <div className="flex items-end">
                  <Button onClick={addDocument} className="w-full bg-elf-gold text-elf-green-dark font-bold h-10 rounded-full">
                    <Plus size={18} className="mr-2"/> Add to Archive
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {documents?.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-elf-gold/5 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <FileText className="text-elf-gold" size={24} />
                    <div>
                      <p className="font-bold text-elf-green-dark">{d.title}</p>
                      <p className="text-xs text-elf-text-light uppercase tracking-widest">Added {new Date(d.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem('documents', d.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8 animate-fade-in-up">
             <Card className="border-elf-gold/10 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-white/50 border-b border-elf-gold/5 p-6">
                <CardTitle className="text-lg font-bold text-elf-green-dark">Upload to Gallery</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 px-6 pb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Image Title</label>
                  <Input placeholder="e.g. Workshop" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Image URL</label>
                  <Input placeholder="Direct image link" value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} className="rounded-xl" />
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
                  <Button onClick={addGalleryImage} className="w-full bg-elf-gold text-elf-green-dark font-bold h-10 rounded-full">
                    <Plus size={18} className="mr-2"/> Post Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {galleryItems?.map(g => (
                <div key={g.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-elf-gold/10">
                  <img src={g.imageUrl} className="w-full h-full object-cover" alt={g.title} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-4">
                    <p className="text-white text-[10px] uppercase font-bold text-center line-clamp-1 mb-2">{g.title}</p>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem('gallery', g.id)} className="text-white hover:text-destructive bg-black/20 rounded-full">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
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
                        {u.email === SUPER_ADMIN_EMAIL && <span className="text-[8px] bg-elf-green-dark text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest">Master</span>}
                      </p>
                      <p className="text-xs text-elf-text-light uppercase tracking-widest">
                        Role: <span className="font-bold">{u.role}</span> • Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {u.email !== SUPER_ADMIN_EMAIL && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`rounded-full h-10 px-4 border-elf-gold/20 ${u.role === 'admin' ? 'text-destructive hover:bg-destructive/5' : 'text-elf-gold hover:bg-elf-gold/5'}`}
                        onClick={() => toggleAdmin(u.id, u.role)}
                      >
                        {u.role === 'admin' ? (
                          <><ShieldX size={16} className="mr-2" /> Revoke Admin</>
                        ) : (
                          <><ShieldCheck size={16} className="mr-2" /> Make Admin</>
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem('users', u.id)} className="text-destructive">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {!allUsers?.length && (
                <div className="text-center py-20 text-elf-text-light italic">
                  No registered users found in the database.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}