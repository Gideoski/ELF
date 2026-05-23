
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Trophy, CheckCircle, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TheGauntlet() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-elf-green-dark min-h-screen pt-32 pb-24 text-white overflow-hidden relative">
      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-headline text-[800px] text-elf-gold/5 pointer-events-none select-none">
        G
      </div>
      
      {/* Ambient Glows */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-elf-gold/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-24 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 text-elf-gold border border-elf-gold/20 bg-elf-gold/5 px-4 py-1.5 rounded-full mb-8">
            <Trophy size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Flagship Competition</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline leading-tight mb-8">
            The Preclinical <span className="italic text-elf-gold underline decoration-elf-gold/30 underline-offset-16">Gauntlet</span> 🏆
          </h1>
          <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed mb-8">
            ELF's most competitive and celebrated academic challenge — testing the grit, knowledge, and spirit of our finest preclinical participants. The Gauntlet is where legends are made.
          </p>
          
          <div className="flex flex-wrap gap-3 mb-12">
            <Badge variant="outline" className="border-elf-gold/30 text-elf-gold px-4 py-1.5 rounded-full">Finals Edition ✔</Badge>
            <Badge variant="outline" className="border-elf-gold/30 text-elf-gold px-4 py-1.5 rounded-full">Academic Excellence</Badge>
            <Badge variant="outline" className="border-elf-gold/30 text-elf-gold px-4 py-1.5 rounded-full">Captured Moments 🫶🏾</Badge>
            <Badge variant="outline" className="border-elf-gold/30 text-elf-gold px-4 py-1.5 rounded-full">NiMSA-AMSA Spirit</Badge>
          </div>

          <Button asChild size="lg" className="bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark h-14 px-10 rounded-full font-bold">
            <a href="https://drive.google.com/drive/folders/10qeiKr0kqtX_iRZK-u60V4dRBGZ9kA8b" target="_blank" rel="noopener noreferrer">
              View Gallery <ImageIcon className="ml-2" size={20} />
            </a>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-y border-white/10 py-16 reveal-on-scroll">
          <div className="text-center space-y-2">
            <h2 className="text-5xl md:text-6xl font-headline font-bold text-elf-gold">250+</h2>
            <p className="text-white/60 uppercase tracking-widest text-sm font-bold">Active Participants</p>
          </div>
          <div className="text-center space-y-2 border-x border-white/10">
            <h2 className="text-5xl md:text-6xl font-headline font-bold text-elf-gold">12</h2>
            <p className="text-white/60 uppercase tracking-widest text-sm font-bold">Competitive Rounds</p>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-5xl md:text-6xl font-headline font-bold text-elf-gold">15+</h2>
            <p className="text-white/60 uppercase tracking-widest text-sm font-bold">Institutions Represented</p>
          </div>
        </div>

        {/* Highlights/Quotes */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center reveal-on-scroll">
          <div className="relative group rounded-3xl overflow-hidden aspect-video border border-elf-gold/20">
            <img 
              src="https://picsum.photos/seed/gauntlet-moments/1200/800" 
              alt="Gauntlet Highlights" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              data-ai-hint="medical students competition"
            />
            <div className="absolute inset-0 bg-elf-green-dark/40 group-hover:bg-transparent transition-all duration-700" />
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-elf-green-dark/80 backdrop-blur-md rounded-2xl border border-elf-gold/20">
              <p className="font-headline italic text-lg leading-relaxed text-elf-gold">
                "The Gauntlet pushed me beyond my limits. It wasn't just about the answers; it was about the resilience needed to stand under the spotlight."
              </p>
              <p className="text-xs uppercase tracking-widest font-bold mt-4 text-white/60">Finalist, Class of 2024</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-headline font-bold text-elf-gold italic">Rising Above the Ordinary</h3>
              <p className="text-white/70 leading-relaxed">
                The Preclinical Gauntlet is designed to simulate the pressures of clinical practice while reinforcing core basic science foundations. Participants face rapid-fire questioning, complex problem solving, and collaborative challenges.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "Rigorous Academic Screening",
                "Regional Preliminary Showdowns",
                "Grand Finale Presentation",
                "Networking with Medical Elders"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-white/80">
                  <div className="w-8 h-8 rounded-full bg-elf-gold/10 flex items-center justify-center text-elf-gold">
                    <CheckCircle size={18} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
