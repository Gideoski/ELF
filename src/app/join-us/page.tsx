"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Instagram, MessageCircle } from 'lucide-react';

export default function JoinUs() {
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

        <div className="bg-white rounded-3xl p-8 md:p-16 shadow-2xl reveal-on-scroll text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <MessageCircle size={40} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-headline font-bold text-elf-green-dark">Join Our Community</h2>
            <p className="text-elf-text-mid max-w-md mx-auto">
              Ready to connect? Click the button below to join our official WhatsApp community and stay updated with ELF initiatives.
            </p>
          </div>

          <Button asChild className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-16 rounded-full font-bold text-xl shadow-lg transition-transform hover:scale-[1.02]">
            <a 
              href="https://chat.whatsapp.com/CgomGXwnciG5aIoma5PIUq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3"
            >
              Join WhatsApp Group
            </a>
          </Button>
          
          <p className="text-xs text-elf-text-light italic">
            By joining, you'll be part of the ABUAD Medical Students' Association chapter of NiMSA-AMSA ELF.
          </p>
        </div>

        <div className="mt-24 text-center space-y-8">
          <p className="text-white/60 tracking-widest uppercase text-sm font-bold">Connect With Us</p>
          <div className="flex justify-center gap-12">
            <a 
              href="https://www.instagram.com/nimsaamsaelf?igsh=c28xa2libWd2d3l5" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/40 hover:text-elf-gold transition-colors flex flex-col items-center gap-2"
            >
              <Instagram size={32} />
              <span className="text-xs">nimsaamsaelf</span>
            </a>
            <a 
              href="https://x.com/NimsaAmsaElf" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/40 hover:text-elf-gold transition-colors flex flex-col items-center gap-2"
            >
              <svg 
                viewBox="0 0 24 24" 
                aria-hidden="true" 
                className="h-8 w-8 fill-current"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              <span className="text-xs">@NimsaAmsaElf</span>
            </a>
          </div>
          <div className="pt-16 border-t border-white/10">
            <h3 className="font-headline italic text-elf-gold text-3xl">— WE ARE NiMSA-AMSA ELF!</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
