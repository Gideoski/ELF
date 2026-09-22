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
import { Loader2, Upload, CheckCircle2, AlertCircle, CreditCard, Banknote } from 'lucide-react';
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
    email: '',
    gender: '',
    level: '',
    department: '',
    college: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
    <div className="min-h-screen pt-32 pb-24 px-6 relative overflow-hidden bg-elf-green-dark">
      {/* Background flyer image container with dual overlay mix for maximum layout contrast */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 scale-105 pointer-events-none"
        style={{ backgroundImage: 'url("/images/CHIASMA flyer.jpeg")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-elf-green-dark/95 via-elf-green-dark/90 to-elf-green-dark/95 backdrop-blur-[4px] pointer-events-none" />
      <div className="absolute inset-0 elf-diagonal-pattern opacity-10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-headline text-white mb-4 drop-shadow-md">
            CHIASMA <span className="italic text-elf-gold">1.0</span>
          </h1>
          <p className="text-elf-gold/90 font-headline italic text-xl drop-shadow-sm">Event Registration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment Info */}
          <Card className="lg:col-span-2 bg-elf-green-dark/60 border border-white/20 backdrop-blur-md text-white rounded-3xl overflow-hidden h-fit shadow-2xl">
            <CardHeader className="bg-elf-gold/10 border-b border-white/10">
              <CardTitle className="text-elf-gold flex items-center gap-2">
                <CreditCard size={20} /> Payment Details
              </CardTitle>
              <CardDescription className="text-white/80">Please complete payment before registering.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="bg-elf-gold/20 p-4 rounded-2xl border border-elf-gold/40 mb-2">
                  <p className="text-xs uppercase tracking-widest text-elf-gold mb-1 flex items-center gap-1 font-bold">
                    <Banknote size={12} /> Registration Fee
                  </p>
                  <p className="font-headline text-3xl font-bold text-white">₦1,000</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50 mb-1 font-semibold">Bank Name</p>
                  <p className="font-bold text-lg text-white">OPay</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50 mb-1 font-semibold">Account Number</p>
                  <p className="font-bold text-2xl text-elf-gold tracking-wider">7025970551</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50 mb-1 font-semibold">Account Name</p>
                  <p className="font-bold text-lg text-white">Olojo-Kosoko Dora</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10 flex items-start gap-3 text-sm text-white/70 italic">
                <AlertCircle size={16} className="shrink-0 mt-1 text-elf-gold" />
                <p>Ensure you take a screenshot or photo of your payment receipt to upload with this form.</p>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card className="lg:col-span-3 rounded-3xl shadow-2xl border border-white/10 bg-white/95 backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-elf-green-dark font-bold">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    placeholder="Enter your full name" 
                    required 
                    value={formData.fullName} 
                    onChange={handleInputChange}
                    className="rounded-xl border-elf-green-dark/20 focus:ring-elf-gold bg-white text-elf-green-dark"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-elf-green-dark font-bold">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="name@example.com" 
                    required 
                    value={formData.email} 
                    onChange={handleInputChange}
                    className="rounded-xl border-elf-green-dark/20 focus:ring-elf-gold bg-white text-elf-green-dark"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-elf-green-dark font-bold">Gender</Label>
                    <Select onValueChange={(v) => handleSelectChange('gender', v)} required>
                      <SelectTrigger className="rounded-xl border-elf-green-dark/20 bg-white text-elf-green-dark">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level" className="text-elf-green-dark font-bold">Level</Label>
                    <Select onValueChange={(v) => handleSelectChange('level', v)} required>
                      <SelectTrigger className="rounded-xl border-elf-green-dark/20 bg-white text-elf-green-dark">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-elf-green-dark font-bold">Department</Label>
                    <Input 
                      id="department" 
                      name="department" 
                      placeholder="e.g. Medicine" 
                      required 
                      value={formData.department} 
                      onChange={handleInputChange}
                      className="rounded-xl border-elf-green-dark/20 focus:ring-elf-gold bg-white text-elf-green-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-elf-green-dark font-bold">College</Label>
                    <Input 
                      id="college" 
                      name="college" 
                      placeholder="e.g. MHS" 
                      required 
                      value={formData.college} 
                      onChange={handleInputChange}
                      className="rounded-xl border-elf-green-dark/20 focus:ring-elf-gold bg-white text-elf-green-dark"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt" className="text-elf-green-dark font-bold">Proof of Payment (Receipt)</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      key={fileInputKey}
                      id="receipt" 
                      type="file" 
                      accept="image/*" 
                      required 
                      onChange={handleFileChange}
                      className="rounded-xl h-12 pt-2.5 cursor-pointer border-elf-green-dark/20 bg-white text-elf-green-dark"
                    />
                  </div>
                  <p className="text-[10px] text-elf-text-light italic flex items-center gap-1 font-medium">
                    <AlertCircle size={10} /> Max size: 700KB. 
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !receiptFile} 
                  className="w-full bg-elf-gold text-elf-green-dark hover:bg-elf-gold-bright h-14 rounded-full font-bold text-lg shadow-xl"
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
