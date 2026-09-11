
"use client";

import React, { useState, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { getErrorMessage } from '@/lib/error-mapping';

const MAX_FILE_SIZE = 700 * 1024; // 700KB

export default function ChiasmaRegistration() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    level: '',
    department: '',
    college: '',
    location: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLevelChange = (value: string) => {
    setFormData(prev => ({ ...prev, level: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a receipt image smaller than 700KB.",
        });
        setReceiptFile(null);
        setFileInputKey(k => k + 1);
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !receiptFile) return;

    setLoading(true);
    try {
      const base64Receipt = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(receiptFile);
      });

      await addDoc(collection(firestore, 'registrations'), {
        ...formData,
        receiptUrl: base64Receipt,
        submittedAt: new Date().toISOString(),
        eventName: 'CHIASMA 1.0'
      });

      setSuccess(true);
      toast({
        title: "Registration Successful",
        description: "Your registration for CHIASMA 1.0 has been received.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-elf-cream flex items-center justify-center p-6 pt-32 pb-24">
        <Card className="max-w-md w-full text-center p-12 rounded-3xl shadow-xl">
          <div className="flex justify-center mb-6">
            <CheckCircle2 size={80} className="text-elf-gold" />
          </div>
          <h2 className="text-4xl font-headline italic text-elf-green-dark mb-4">Registration Received!</h2>
          <p className="text-elf-text-mid mb-8">
            Thank you for registering for CHIASMA 1.0. Our team will verify your payment and contact you soon.
          </p>
          <Button asChild className="bg-elf-gold text-elf-green-dark rounded-full px-8 h-12 font-bold">
            <a href="/home">Return Home</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elf-green-dark pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 elf-diagonal-pattern opacity-5" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-headline text-white mb-4">
            CHIASMA <span className="italic text-elf-gold">1.0</span>
          </h1>
          <p className="text-elf-gold/80 font-headline italic text-xl">Event Registration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment Info */}
          <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden h-fit">
            <CardHeader className="bg-elf-gold/10 border-b border-white/10">
              <CardTitle className="text-elf-gold flex items-center gap-2">
                <CreditCard size={20} /> Payment Details
              </CardTitle>
              <CardDescription className="text-white/60">Please complete payment before registering.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Bank Name</p>
                  <p className="font-bold text-lg">Wema Bank</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Account Number</p>
                  <p className="font-bold text-2xl text-elf-gold tracking-wider">0262104523</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Account Name</p>
                  <p className="font-bold text-lg">AMSA NiMSA-ELF</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10 flex items-start gap-3 text-sm text-white/60 italic">
                <AlertCircle size={16} className="shrink-0 mt-1" />
                <p>Ensure you take a screenshot or photo of your payment receipt to upload with this form.</p>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card className="lg:col-span-3 rounded-3xl shadow-2xl border-none">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    placeholder="Enter your full name" 
                    required 
                    value={formData.fullName} 
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select onValueChange={handleLevelChange} required>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 Level</SelectItem>
                        <SelectItem value="200">200 Level</SelectItem>
                        <SelectItem value="300">300 Level</SelectItem>
                        <SelectItem value="400">400 Level</SelectItem>
                        <SelectItem value="500">500 Level</SelectItem>
                        <SelectItem value="600">600 Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      id="department" 
                      name="department" 
                      placeholder="e.g. Medicine" 
                      required 
                      value={formData.department} 
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input 
                    id="college" 
                    name="college" 
                    placeholder="e.g. MHS" 
                    required 
                    value={formData.college} 
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location / Hostel</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    placeholder="e.g. Male Hall 1" 
                    required 
                    value={formData.location} 
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">Proof of Payment (Receipt)</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      key={fileInputKey}
                      id="receipt" 
                      type="file" 
                      accept="image/*" 
                      required 
                      onChange={handleFileChange}
                      className="rounded-xl h-12 pt-2.5 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-elf-text-light italic flex items-center gap-1">
                    <AlertCircle size={10} /> Max size: 700KB. 
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !receiptFile} 
                  className="w-full bg-elf-gold text-elf-green-dark h-14 rounded-full font-bold text-lg shadow-xl"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
                  Submit Registration
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
