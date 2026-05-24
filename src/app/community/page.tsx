
"use client";

import React from 'react';

export default function Community() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <span className="font-headline italic text-elf-gold text-xl block mb-4">Our Community</span>
          <h1 className="text-5xl md:text-7xl font-headline text-elf-green-dark leading-tight">Meet the Team.</h1>
        </div>
        
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-elf-gold/10 bg-elf-cream flex justify-center">
          <img 
            src="/images/Executives.png" 
            alt="NiMSA-AMSA ELF Executives" 
            className="w-full h-auto object-contain"
          />
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-headline italic text-elf-gold">— WE ARE NiMSA-AMSA ELF!</h3>
        </div>
      </div>
    </div>
  );
}
