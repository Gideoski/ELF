"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Trophy, CheckCircle, Image as ImageIcon } from 'lucide-react';
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

        {/* Highlights Section */}
        <div className="mt-24 max-w-3xl reveal-on-scroll">
          <div className="space-y-12">
            <div className="space-y-6">
              <h3 className="text-4xl font-headline text-elf-gold italic">Rising Above the Ordinary</h3>
              <p className="text-white/70 text-lg leading-relaxed">
                The Preclinical Gauntlet is designed to simulate the pressures of clinical practice while reinforcing core basic science foundations. Participants face rapid-fire questioning, complex problem solving, and collaborative challenges.
              </p>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Rigorous Academic Screening",
                "Regional Preliminary Showdowns",
                "Grand Finale Presentation",
                "Networking with Medical Elders"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-elf-gold/10 flex items-center justify-center text-elf-gold shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
