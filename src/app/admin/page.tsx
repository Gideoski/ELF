
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
  addDoc, 
  collection, 
  query, 
  orderBy, 
  deleteDoc 
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image as ImageIcon, LogOut, ShieldAlert, Trash2, Plus, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/error-mapping';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  // Role checking
  const userProfileRef = useMemo(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryCat, setGalleryCat] = useState('Workshops');

  // Queries
  const docsQuery = useMemo(() => firestore ? query(collection(firestore, 'documents'), orderBy('uploadedAt', 'desc')) : null, [firestore]);
  const galleryQuery = useMemo(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')) : null, [firestore]);
  
  const { data: documents } = useCollection(docsQuery);
  const { data: galleryItems } = useCollection(galleryQuery);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (firestore) {
          const userData = {
            email: res.user.email,
            role: 'user', // Default role for safety
            displayName: email.split('@')[0]
          };
          // Explicitly set the document
          setDoc(doc(firestore, 'users', res.user.uid), userData)
            .catch(async () => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${res.user.uid}`,
                operation: 'create',
                requestResourceData: userData
              }));
            });
        }
      }
      toast({ title: isLogin ? "Access Granted" : "Account Created Successfully" });
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

  const addDocument = () => {
    if (!firestore || !docTitle || !docUrl) return;
    const data = {
      title: docTitle,
      fileUrl: docUrl,
      uploadedAt: new Date().toISOString()
    };
    const ref = collection(firestore, 'documents');
    addDoc(ref, data)
      .then(() => {
        setDocTitle(''); 
        setDocUrl('');
        toast({ title: "Resource published successfully" });
      })
      .catch(async () => {
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
    const ref = collection(firestore, 'gallery');
    addDoc(ref, data)
      .then(() => {
        setGalleryTitle(''); 
        setGalleryUrl('');
        toast({ title: "Gallery updated successfully" });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'gallery',
          operation: 'create',
          requestResourceData: data
        }));
      });
  };

  const deleteItem = (col: string, id: string) => {
    if (!firestore) return;
    const itemRef = doc(firestore, col, id);
    deleteDoc(itemRef)
      .then(() => {
        toast({ title: "Item removed from system" });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `${col}/${id}`,
          operation: 'delete'
        }));
      });
  };

  if (authLoading || (user && profileLoading)) return (
    <div className="min-h-screen flex items-center justify-center bg-elf-cream">
      <Loader2 className="animate-spin text-elf-gold" size={48} />
    </div>
  );

  // Login View
  if (!user) {
    return (
      <div className="min-h-screen bg-elf-green-dark flex flex-col items-center justify-center p-6 pt-32 pb-20">
        <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden border-none animate-fade-in-up">
          <CardHeader className="text-center pb-6 bg-elf-cream/30 border-b border-elf-gold/10 pt-8">
            <CardTitle className="text-3xl font-headline italic text-elf-green-dark">Admin Portal</CardTitle>
            <p className="text-elf-text-light text-sm mt-2">Secure Administrative Access</p>
          </CardHeader>
          <CardContent className="pt-8 px-8">
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-elf-text-light hover:text-elf-green-dark transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark h-12 font-bold transition-all rounded-full shadow-lg"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Admin Account')}
              </Button>
              <div className="text-center pt-2">
                <button 
                  type="button"
                  className="text-sm text-elf-text-light hover:text-elf-gold underline-offset-4 hover:underline transition-all"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Need an account? Register" : "Already have an account? Sign In"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access Denied View
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-elf-cream flex flex-col items-center justify-center p-6 pt-32">
        <Card className="max-w-md w-full text-center p-12 rounded-3xl border-elf-gold/10 shadow-xl bg-white animate-fade-in-up">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-headline font-bold text-elf-green-dark mb-4">Unauthorized Access</h2>
          <p className="text-elf-text-mid mb-8 leading-relaxed">
            Your account is currently registered with a <strong>'user'</strong> role. To access these tools, your account must be manually elevated to <strong>'admin'</strong> by the system administrator.
          </p>
          <div className="bg-elf-cream/50 p-6 rounded-2xl border border-elf-gold/10 text-xs text-elf-text-light mb-8">
            <p className="font-bold mb-2 uppercase tracking-widest">Your Unique Identifier (UID):</p>
            <code className="bg-white px-3 py-2 rounded-lg block truncate font-mono text-elf-green-dark border border-elf-gold/5">{user.uid}</code>
          </div>
          <Button variant="outline" className="rounded-full w-full h-12 border-elf-gold text-elf-gold hover:bg-elf-gold hover:text-white transition-all font-bold" onClick={() => auth && signOut(auth)}>
            Sign Out
          </Button>
        </Card>
      </div>
    );
  }

  // Admin Dashboard View
  return (
    <div className="min-h-screen bg-elf-cream pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-headline text-elf-green-dark font-bold">Admin Dashboard</h1>
            <p className="text-elf-text-mid flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Authenticated as <span className="font-bold">{user.email}</span>
            </p>
          </div>
          <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full px-6 h-11" onClick={() => auth && signOut(auth)}>
            <LogOut size={18} className="mr-2" /> End Session
          </Button>
        </div>

        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-white border border-elf-gold/10 p-1 rounded-full overflow-hidden shadow-sm">
            <TabsTrigger value="archive" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all">
              <FileText size={18} className="mr-2" /> Archive Management
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all">
              <ImageIcon size={18} className="mr-2" /> Gallery Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-8 animate-fade-in-up">
            <Card className="border-elf-gold/10 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-white/50 border-b border-elf-gold/5 p-6">
                <CardTitle className="text-lg font-bold text-elf-green-dark">Upload New Resource</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 px-6 pb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Document Title</label>
                  <Input placeholder="e.g. Preclinical Guide Vol 1" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="rounded-xl border-elf-gold/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Direct PDF Link</label>
                  <Input placeholder="URL from Cloud Storage" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} className="rounded-xl border-elf-gold/20" />
                </div>
                <div className="flex items-end">
                  <Button onClick={addDocument} className="w-full bg-elf-gold text-elf-green-dark font-bold h-10 rounded-full shadow-md hover:scale-[1.02] transition-transform">
                    <Plus size={18} className="mr-2"/> Add to Archive
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {documents?.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-elf-gold/5 flex justify-between items-center group hover:border-elf-gold/20 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-elf-gold/5 flex items-center justify-center text-elf-gold">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-elf-green-dark">{d.title}</p>
                      <p className="text-xs text-elf-text-light uppercase tracking-widest">Published on {new Date(d.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem('documents', d.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/5 rounded-full">
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8 animate-fade-in-up">
             <Card className="border-elf-gold/10 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-white/50 border-b border-elf-gold/5 p-6">
                <CardTitle className="text-lg font-bold text-elf-green-dark">Add Gallery Content</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 px-6 pb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Image Title</label>
                  <Input placeholder="e.g. Workshop Highlights" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} className="rounded-xl border-elf-gold/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Image Link</label>
                  <Input placeholder="Public Image URL" value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} className="rounded-xl border-elf-gold/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Category</label>
                  <select className="flex h-10 w-full rounded-xl border border-elf-gold/20 bg-background px-3 py-2 text-sm ring-offset-background outline-none focus:ring-2 focus:ring-elf-gold" value={galleryCat} onChange={(e) => setGalleryCat(e.target.value)}>
                    <option value="Workshops">Workshops</option>
                    <option value="The Gauntlet">The Gauntlet</option>
                    <option value="Community">Community</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addGalleryImage} className="w-full bg-elf-gold text-elf-green-dark font-bold h-10 rounded-full shadow-md hover:scale-[1.02] transition-transform">
                    <Plus size={18} className="mr-2"/> Post to Gallery
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {galleryItems?.map(g => (
                <div key={g.id} className="relative group rounded-2xl overflow-hidden aspect-square shadow-md border border-elf-gold/10 transition-transform hover:scale-[1.02]">
                  <img src={g.imageUrl} className="w-full h-full object-cover" alt={g.title} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-4">
                    <p className="text-white text-[10px] uppercase tracking-widest font-bold mb-4 text-center">{g.title}</p>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem('gallery', g.id)} className="text-white hover:text-destructive scale-90 group-hover:scale-100 transition-transform bg-black/20 hover:bg-white rounded-full">
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
