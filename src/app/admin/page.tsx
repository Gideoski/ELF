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
  limit,
  Timestamp
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
  ExternalLink,
  AlertCircle,
  Table as TableIcon,
  AlertTriangle,
  RefreshCw,
  Search
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ADMIN_EMAIL = 'nimsaamsaelf@gmail.com';
const MAX_FILE_SIZE = 700 * 1024; // 700KB limit for Base64 stability

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

  const [docInputKey, setDocInputKey] = useState(0);
  const [galleryInputKey, setGalleryInputKey] = useState(0);

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ col: string, id: string, title?: string } | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);
  const [regSearch, setRegSearch] = useState('');

  // Stable Firestore queries
  const docsQuery = useMemo(() => firestore ? query(collection(firestore, 'documents'), orderBy('uploadedAt', 'desc'), limit(50)) : null, [firestore]);
  const galleryQuery = useMemo(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc'), limit(50)) : null, [firestore]);
  // No orderBy on registrations to avoid missing index blocks during setup
  const regQuery = useMemo(() => firestore ? query(collection(firestore, 'registrations'), limit(100)) : null, [firestore]);
  
  const { data: documents, loading: docsLoading } = useCollection(docsQuery);
  const { data: galleryItems, loading: galleryLoading } = useCollection(galleryQuery);
  const { data: registrations, loading: regsLoading, error: regsError } = useCollection(regQuery);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      toast({ title: "Access Granted", description: "Welcome back, Admin." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: getErrorMessage(error) });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth) return;
    const targetEmail = email.toLowerCase().trim() || ADMIN_EMAIL;
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      toast({ title: "Reset Email Sent", description: "Check your inbox for password reset instructions." });
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
        if (docFile.size > MAX_FILE_SIZE) {
          toast({ variant: "destructive", title: "File Too Large", description: "Limit is 700KB. Use links for larger PDFs." });
          setIsSubmittingDoc(false);
          return;
        }
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(docFile);
        });
      }
      await addDoc(collection(firestore, 'documents'), {
        title: docTitle,
        fileUrl: finalUrl,
        uploadedAt: new Date().toISOString()
      });
      toast({ title: "Published", description: "Resource added to archive." });
      setDocTitle(''); setDocUrl(''); setDocFile(null); setDocInputKey(k => k + 1);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: getErrorMessage(err) });
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const addGalleryImage = async () => {
    if (!firestore || !galleryFile) return;
    if (galleryFile.size > MAX_FILE_SIZE) {
      toast({ variant: "destructive", title: "Image Too Large", description: "Please compress the image to under 700KB." });
      return;
    }
    setIsSubmittingGallery(true);
    try {
      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(galleryFile);
      });
      await addDoc(collection(firestore, 'gallery'), {
        title: galleryCaption || "",
        imageUrl: base64String,
        createdAt: new Date().toISOString()
      });
      toast({ title: "Success", description: "Gallery updated." });
      setGalleryCaption(''); setGalleryFile(null); setGalleryInputKey(k => k + 1);
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
    }
  };

  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];
    return registrations.filter(r => 
      r.fullName?.toLowerCase().includes(regSearch.toLowerCase()) || 
      r.email?.toLowerCase().includes(regSearch.toLowerCase())
    );
  }, [registrations, regSearch]);

  const exportRegistrations = () => {
    if (!registrations || registrations.length === 0) return;
    const headers = ["Full Name", "Email", "Gender", "Level", "Department", "College", "Submission Date"];
    const rows = registrations.map(r => [
      `"${r.fullName}"`, `"${r.email || ''}"`, `"${r.gender || ''}"`,
      `"${r.level}"`, `"${r.department}"`, `"${r.college}"`,
      `"${r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'N/A'}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CHIASMA_Registrations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-elf-cream"><Loader2 className="animate-spin text-elf-gold" size={48} /></div>;

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-elf-green-dark flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="text-center pt-10">
            <CardTitle className="text-3xl font-headline italic text-elf-green-dark">Admin Access</CardTitle>
            <p className="text-xs text-elf-text-light uppercase tracking-widest mt-2">NiMSA-AMSA ELF Portal</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-elf-light">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-12" placeholder="admin@example.com" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-elf-light">Password</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl h-12 pr-12" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-elf-text-light">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoggingIn} className="w-full bg-elf-gold text-elf-green-dark h-12 rounded-full font-bold">
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
              </Button>
              <div className="text-center">
                <button type="button" onClick={handleForgotPassword} disabled={isResetting} className="text-xs text-elf-text-light hover:underline inline-flex items-center gap-1">
                  {isResetting ? <Loader2 className="animate-spin" size={10} /> : <KeyRound size={10} />} Forgot Password?
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-headline text-elf-green-dark font-bold italic">Dashboard</h1>
            <p className="text-elf-text-mid">Connected to Firestore Database</p>
          </div>
          <Button variant="outline" className="rounded-full border-elf-gold text-elf-gold" onClick={() => setIsSignOutDialogOpen(true)}>
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-10 h-14 bg-white border p-1 rounded-full">
            <TabsTrigger value="registrations" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Registrations</TabsTrigger>
            <TabsTrigger value="archive" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Resources</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-elf-gold data-[state=active]:text-white font-bold">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="font-headline text-2xl text-elf-green-dark italic">Event Applications ({registrations?.length || 0})</h3>
              <div className="flex w-full md:w-auto gap-3">
                <div className="relative flex-grow md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-elf-text-light" size={16} />
                  <Input placeholder="Search applicants..." value={regSearch} onChange={(e) => setRegSearch(e.target.value)} className="pl-9 rounded-full bg-white h-10" />
                </div>
                <Button onClick={exportRegistrations} variant="outline" className="rounded-full border-elf-gold text-elf-gold" disabled={regsLoading || !registrations?.length}>
                  <TableIcon size={16} className="mr-2" /> CSV
                </Button>
                <Button onClick={() => window.location.reload()} variant="ghost" size="icon" className="rounded-full"><RefreshCw size={18} /></Button>
              </div>
            </div>

            <Card className="rounded-2xl overflow-hidden shadow-sm border-none">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Academic Info</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white/50">
                  {regsLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin text-elf-gold mx-auto" size={32} /><p className="text-xs mt-4 text-elf-text-light italic">Fetching registrations...</p></TableCell></TableRow>
                  ) : regsError ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20 text-destructive"><AlertTriangle className="mx-auto mb-2" /><p>Database Error</p><p className="text-xs opacity-70">{regsError.message}</p></TableCell></TableRow>
                  ) : filteredRegistrations.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-elf-text-light italic">No registration records found.</TableCell></TableRow>
                  ) : filteredRegistrations.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-bold text-elf-green-dark">{r.fullName}<div className="text-[10px] font-normal text-elf-text-mid">{r.email}</div></TableCell>
                      <TableCell className="text-xs">{r.level}L | {r.department}<div className="text-[10px] text-elf-text-light">{r.college}</div></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-elf-gold h-8 px-2" onClick={() => setPreviewReceipt(r.receiptUrl)}>
                          <Eye size={14} className="mr-1" /> View Proof
                        </Button>
                      </TableCell>
                      <TableCell className="text-[10px] text-elf-text-light">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ col: 'registrations', id: r.id, title: `Application: ${r.fullName}` })} className="text-destructive"><Trash2 size={16} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive" className="space-y-8">
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="bg-white border-b p-6"><CardTitle className="text-lg font-headline italic flex items-center gap-2"><UploadCloud size={20} className="text-elf-gold" /> Upload Resource</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6 bg-white/50">
                <div className="space-y-4">
                  <div className="space-y-1"><Label>Title</Label><Input placeholder="Academic Guide..." value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="rounded-xl" /></div>
                  <RadioGroup value={archiveMode} onValueChange={(val: 'link' | 'file') => setArchiveMode(val)} className="flex gap-6 pb-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="file" id="f" /><Label htmlFor="f">PDF File</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="link" id="l" /><Label htmlFor="l">Link</Label></div>
                  </RadioGroup>
                  {archiveMode === 'link' ? (
                    <Input placeholder="https://drive.google.com/..." value={docUrl} onChange={(e) => setDocUrl(e.target.value)} className="rounded-xl" />
                  ) : (
                    <Input key={docInputKey} ref={docFileInputRef} type="file" accept="application/pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="h-12 pt-2.5 rounded-xl bg-white" />
                  )}
                </div>
                <Button onClick={addDocument} disabled={isSubmittingDoc || !docTitle} className="w-full bg-elf-gold text-elf-green-dark rounded-full h-12 font-bold">
                  {isSubmittingDoc ? <Loader2 className="animate-spin" /> : 'Publish to Archive'}
                </Button>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {docsLoading ? <Loader2 className="animate-spin text-elf-gold mx-auto" /> : documents?.map(d => (
                <div key={d.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3"><FileText className="text-elf-gold" /><div className="font-bold text-elf-green-dark">{d.title}</div></div>
                  <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ col: 'documents', id: d.id, title: d.title })} className="text-destructive"><Trash2 size={16} /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-8">
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="bg-white border-b p-6"><CardTitle className="text-lg font-headline italic flex items-center gap-2"><UploadCloud size={20} className="text-elf-gold" /> Add Photo</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6 bg-white/50">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Caption</Label><Input value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} className="rounded-xl" /></div>
                  <div className="space-y-1"><Label>Image</Label><Input key={galleryInputKey} type="file" accept="image/*" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} className="h-12 pt-2.5 rounded-xl bg-white" /></div>
                </div>
                <Button onClick={addGalleryImage} disabled={isSubmittingGallery || !galleryFile} className="w-full bg-elf-gold text-elf-green-dark rounded-full h-12 font-bold">
                  {isSubmittingGallery ? <Loader2 className="animate-spin" /> : 'Upload Photo'}
                </Button>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {galleryLoading ? <Loader2 className="animate-spin text-elf-gold mx-auto col-span-full" /> : galleryItems?.map(g => (
                <div key={g.id} className="aspect-square bg-white rounded-2xl border relative group overflow-hidden">
                  <img src={g.imageUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button variant="destructive" size="icon" onClick={() => setItemToDelete({ col: 'gallery', id: g.id, title: 'Gallery Photo' })}><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Global Dialogs */}
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader><AlertDialogTitle>Confirm Delete</AlertDialogTitle><AlertDialogDescription>Delete "{itemToDelete?.title}" permanently from database?</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => itemToDelete && confirmDelete(itemToDelete.col, itemToDelete.id)} className="bg-destructive hover:bg-destructive/90 rounded-full px-8">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader><AlertDialogTitle>Logout</AlertDialogTitle><AlertDialogDescription>Are you sure you want to end your session?</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => auth && signOut(auth)} className="rounded-full px-8">Logout</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!previewReceipt} onOpenChange={(open) => !open && setPreviewReceipt(null)}>
          <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none bg-elf-green-dark">
            <DialogHeader className="p-6 pb-2"><DialogTitle className="text-elf-gold font-headline italic text-2xl">Proof of Payment</DialogTitle></DialogHeader>
            <div className="p-6 bg-white/5 flex items-center justify-center min-h-[300px]">
              {previewReceipt && <img src={previewReceipt} className="max-h-[70vh] rounded-xl shadow-2xl object-contain" alt="Receipt" />}
            </div>
            <div className="p-4 bg-elf-gold/10 flex justify-end"><Button onClick={() => setPreviewReceipt(null)} className="bg-elf-gold text-elf-green-dark rounded-full font-bold">Close</Button></div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
