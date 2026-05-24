
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Instagram, Twitter, Mail, Linkedin } from 'lucide-react';

const formSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  medSchool: z.string().min(2, "School name is required"),
  academicLevel: z.string().min(1, "Required"),
  areaOfInterest: z.string().min(1, "Required"),
});

export default function JoinUs() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      medSchool: "",
      academicLevel: "",
      areaOfInterest: "",
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Success!",
      description: "Thank you for your interest. We'll be in touch soon.",
    });
    form.reset();
  }

  return (
    <div className="bg-elf-green-dark min-h-screen pt-32 pb-24 text-white relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-elf-gold/10 blur-[150px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 reveal-on-scroll">
          <h1 className="text-5xl md:text-7xl font-headline leading-tight mb-6">
            Build Confidence. <br />
            <span className="italic text-elf-gold">Lead the Future.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Join a community of emerging medical leaders across Nigeria. Whether you're in your preclinical years or approaching clinicals — your place is here, in ELF.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl reveal-on-scroll">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-elf-green-dark font-bold">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="bg-elf-cream border-transparent text-elf-green-dark h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-elf-green-dark font-bold">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" className="bg-elf-cream border-transparent text-elf-green-dark h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medSchool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-elf-green-dark font-bold">Medical School</FormLabel>
                      <FormControl>
                        <Input placeholder="University of..." className="bg-elf-cream border-transparent text-elf-green-dark h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="academicLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-elf-green-dark font-bold">Academic Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-elf-cream border-transparent text-elf-green-dark h-12">
                            <SelectValue placeholder="Select Level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level"].map(y => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="areaOfInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-elf-green-dark font-bold">Primary Area of Interest</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-elf-cream border-transparent text-elf-green-dark h-12">
                          <SelectValue placeholder="What inspires you?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Academics", "Leadership", "Mentorship", "Networking", "Extracurriculars"].map(a => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark h-16 rounded-full font-bold text-xl shadow-lg transition-transform hover:scale-[1.02]">
                Submit Interest Form
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-24 text-center space-y-8 reveal-on-scroll">
          <p className="text-white/60 tracking-widest uppercase text-sm font-bold">Connect With Us</p>
          <div className="flex justify-center gap-12">
            {[Instagram, Twitter, Mail, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="text-white/40 hover:text-elf-gold transition-colors">
                <Icon size={32} />
              </a>
            ))}
          </div>
          <div className="pt-16 border-t border-white/10">
            <h3 className="font-headline italic text-elf-gold text-3xl">— WE ARE NiMSA-AMSA ELF!</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
