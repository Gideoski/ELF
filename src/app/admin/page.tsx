
"use client";

import React, { useState, useEffect } from 'react';
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
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image as ImageIcon, LogOut, ShieldAlert, Trash2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
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
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        // Default role is 'user' for safety. Admin must be set manually in Firestore initially.
        if (firestore) {
          await setDoc(doc(firestore, 'users', res.user.uid), {
            email: res.user.email,
            role: 'user', // Change to 'admin' in Firestore console for the first user
            displayName: email.split('@')[0]
          });
        }
      }
      toast({ title: isLogin ? "Logged in" : "Account created" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const addDocument = async () => {
    if (!firestore || !docTitle || !docUrl) return;
    addDoc(collection(firestore, 'documents'), {
      title: docTitle,
      fileUrl: docUrl,
      uploadedAt: new Date().toISOString()
    });
    setDocTitle(''); setDocUrl('');
    toast({ title: "Document added" });
  };

  const addGalleryImage = async () => {
    if (!firestore || !galleryTitle || !galleryUrl) return;
    addDoc(collection(firestore, 'gallery'), {
      title: galleryTitle,
      imageUrl: galleryUrl,
      category: galleryCat,
      createdAt: new Date().toISOString()
    });
    setGalleryTitle(''); setGalleryUrl('');
    toast({ title: "Image added to gallery" });
  };

  const deleteItem = async (col: string, id: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, col, id));
    toast({ title: "Item deleted" });
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-elf-green-dark flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline italic text-elf-green-dark">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" className="w-full bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark">
                {isLogin ? 'Login' : 'Sign Up'}
              </Button>
              <p className="text-center text-sm text-elf-text-light cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elf-cream pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-headline text-elf-green-dark">Admin Dashboard</h1>
            <p className="text-elf-text-mid">Logged in as: {user.email}</p>
          </div>
          <Button variant="ghost" className="text-destructive" onClick={() => auth && signOut(auth)}>
            <LogOut size={20} className="mr-2" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-white border border-elf-gold/10">
            <TabsTrigger value="archive" className="data-[state=active]:bg-elf-gold data-[state=active]:text-white">
              <FileText size={18} className="mr-2" /> Manage Archive
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-elf-gold data-[state=active]:text-white">
              <ImageIcon size={18} className="mr-2" /> Manage Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="text-xl">Upload New Document</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Document Title" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
                <Input placeholder="Direct PDF URL (e.g. Google Drive Direct Link)" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
                <Button onClick={addDocument} className="bg-elf-gold text-elf-green-dark"><Plus size={18} className="mr-2"/> Add to Archive</Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {documents?.map(d => (
                <div key={d.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <FileText className="text-elf-gold" />
                    <div>
                      <p className="font-bold text-elf-green-dark">{d.title}</p>
                      <p className="text-xs text-elf-text-light">{new Date(d.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem('documents', d.id)} className="text-destructive"><Trash2 size={18} /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8">
             <Card>
              <CardHeader><CardTitle className="text-xl">Add Gallery Image</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input placeholder="Image Title" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} />
                <Input placeholder="Image URL" value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} />
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={galleryCat} onChange={(e) => setGalleryCat(e.target.value)}>
                   <option value="Workshops">Workshops</option>
                   <option value="The Gauntlet">The Gauntlet</option>
                   <option value="Community">Community</option>
                   <option value="Leadership">Leadership</option>
                </select>
                <Button onClick={addGalleryImage} className="bg-elf-gold text-elf-green-dark"><Plus size={18} className="mr-2"/> Add to Gallery</Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {galleryItems?.map(g => (
                <div key={g.id} className="relative group rounded-lg overflow-hidden h-32">
                  <img src={g.imageUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => deleteItem('gallery', g.id)} className="text-white hover:text-destructive"><Trash2 size={20} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-20 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
          <ShieldAlert className="text-red-600 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-red-900">Security Notice</h4>
            <p className="text-red-700 text-sm">After signing up, ensure your UID is added to the <code>admins</code> verification logic in Firestore Security Rules to enable full write access.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
