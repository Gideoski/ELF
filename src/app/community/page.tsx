
"use client";

import React from 'react';
import Image from 'next/image';

export default function Community() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-headline italic text-elf-gold text-xl block mb-4">Our Community</span>
          <h1 className="text-5xl md:text-7xl font-headline text-elf-green-dark leading-tight">Meet the Team.</h1>
        </div>
        
        <div className="relative w-full aspect-[16/10] md:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-elf-gold/10">
          <Image 
            src="/images/Executives.png" 
            alt="NiMSA-AMSA ELF Executives" 
            fill 
            className="object-contain bg-elf-cream"
            priority
          />
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-headline italic text-elf-gold">— WE ARE NiMSA-AMSA ELF!</h3>
        </div>
      </div>
    </div>
  );
}
