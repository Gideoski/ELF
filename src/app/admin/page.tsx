"use client";

import React, { useState } from 'react';
import { useAuth, useUser, useFirestore, useCollection } from '@/firebase';
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
import { FileText, Image as ImageIcon, LogOut, ShieldAlert, Trash2, Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/error-mapping';

export default function AdminPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
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

  // Fetch Data for list
  const docsQuery = React.useMemo(() => firestore ? query(collection(firestore, 'documents'), orderBy('uploadedAt', 'desc')) : null, [firestore]);
  const galleryQuery = React.useMemo(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')) : null, [firestore]);
  
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
          // New users are created with 'user' role by default for security
          await setDoc(doc(firestore, 'users', res.user.uid), {
            email: res.user.email,
            role: 'user',
            displayName: email.split('@')[0]
          });
        }
      }
      toast({ title: isLogin ? "Access Granted" : "Account Created Successfully" });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Login Error", 
        description: getErrorMessage(error) 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDocument = async () => {
    if (!firestore || !docTitle || !docUrl) return;
    try {
      await addDoc(collection(firestore, 'documents'), {
        title: docTitle,
        fileUrl: docUrl,
        uploadedAt: new Date().toISOString()
      });
      setDocTitle(''); 
      setDocUrl('');
      toast({ title: "Resource published successfully" });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Publishing Error", 
        description: getErrorMessage(error) 
      });
    }
  };

  const addGalleryImage = async () => {
    if (!firestore || !galleryTitle || !galleryUrl) return;
    try {
      await addDoc(collection(firestore, 'gallery'), {
        title: galleryTitle,
        imageUrl: galleryUrl,
        category: galleryCat,
        createdAt: new Date().toISOString()
      });
      setGalleryTitle(''); 
      setGalleryUrl('');
      toast({ title: "Gallery updated successfully" });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Update Error", 
        description: getErrorMessage(error) 
      });
    }
  };

  const deleteItem = async (col: string, id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, col, id));
      toast({ title: "Item removed from system" });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Deletion Error", 
        description: getErrorMessage(error) 
      });
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-elf-cream">
      <Loader2 className="animate-spin text-elf-gold" size={48} />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-elf-green-dark flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2 bg-elf-cream/30 border-b border-elf-gold/10">
            <CardTitle className="text-3xl font-headline italic text-elf-green-dark">Admin Portal</CardTitle>
            <p className="text-elf-text-light text-sm">Secure Administrative Access</p>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light ml-1">Email Address</label>
                <Input 
                  placeholder="admin@elf.org" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-12 border-elf-gold/20 focus:ring-elf-gold"
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
                    className="pr-12 h-12 border-elf-gold/20 focus:ring-elf-gold"
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
                className="w-full bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark h-12 font-bold transition-all rounded-full"
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

  return (
    <div className="min-h-screen bg-elf-cream pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-headline text-elf-green-dark font-bold">Dashboard</h1>
            <p className="text-elf-text-mid flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Authenticated as {user.email}
            </p>
          </div>
          <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full" onClick={() => auth && signOut(auth)}>
            <LogOut size={18} className="mr-2" /> End Session
          </Button>
        </div>

        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-white border border-elf-gold/10 p-1 rounded-full overflow-hidden">
            <TabsTrigger value="archive" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white">
              <FileText size={18} className="mr-2" /> Archive Management
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white">
              <ImageIcon size={18} className="mr-2" /> Gallery Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <Card className="border-elf-gold/10 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-white/50 border-b border-elf-gold/5">
                <CardTitle className="text-lg font-bold text-elf-green-dark">Upload New Resource</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Document Title</label>
                  <Input placeholder="e.g. Preclinical Guide Vol 1" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Direct PDF Link</label>
                  <Input placeholder="URL from Cloud Storage" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
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
                <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-elf-gold/5 flex justify-between items-center group hover:border-elf-gold/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-elf-gold/5 flex items-center justify-center text-elf-gold">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-elf-green-dark">{d.title}</p>
                      <p className="text-xs text-elf-text-light">Published on {new Date(d.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem('documents', d.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              {documents?.length === 0 && (
                <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-elf-gold/20 italic text-elf-text-light">
                  The archive is currently empty.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
             <Card className="border-elf-gold/10 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-white/50 border-b border-elf-gold/5">
                <CardTitle className="text-lg font-bold text-elf-green-dark">Add Gallery Content</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Image Title</label>
                  <Input placeholder="e.g. Workshop Highlights" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Image Link</label>
                  <Input placeholder="Public Image URL" value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-elf-text-light">Category</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={galleryCat} onChange={(e) => setGalleryCat(e.target.value)}>
                    <option value="Workshops">Workshops</option>
                    <option value="The Gauntlet">The Gauntlet</option>
                    <option value="Community">Community</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addGalleryImage} className="w-full bg-elf-gold text-elf-green-dark font-bold h-10 rounded-full">
                    <Plus size={18} className="mr-2"/> Post to Gallery
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {galleryItems?.map(g => (
                <div key={g.id} className="relative group rounded-2xl overflow-hidden aspect-square shadow-sm border border-elf-gold/10">
                  <img src={g.imageUrl} className="w-full h-full object-cover" alt={g.title} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => deleteItem('gallery', g.id)} className="text-white hover:text-destructive scale-90 group-hover:scale-100 transition-transform">
                      <Trash2 size={24} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-20 p-8 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-6">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
            <ShieldAlert size={28} />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-amber-900 text-lg">System Permissions Policy</h4>
            <p className="text-amber-700 leading-relaxed text-sm">
              Note: New accounts are assigned standard privileges. To enable data mutations (uploads/deletions), your account UID must be manually elevated to 'admin' status in the primary database. Please contact technical support for elevation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
