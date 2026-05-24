"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-elf-green-dark flex flex-col items-center justify-between p-6 text-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 elf-diagonal-pattern opacity-5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-elf-gold/10 blur-[150px] rounded-full" />

      {/* Main Content Container - centered vertically */}
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="relative z-10 space-y-12 max-w-2xl animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-40 h-40 md:w-56 md:h-56 overflow-hidden rounded-full border-4 border-elf-gold/20 shadow-2xl p-1 bg-white/5">
              <Image 
                src="/images/elf logo.jpeg" 
                alt="NiMSA-AMSA ELF Logo" 
                fill 
                className="object-cover rounded-full"
                priority
              />
            </div>
          </div>

          {/* Branding */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline text-white leading-tight">
              NiMSA-AMSA <span className="italic text-elf-gold">ELF</span>
            </h1>
            <p className="text-xl md:text-2xl text-elf-gold/80 font-headline italic tracking-widest uppercase">
              Investing in Visionaries
            </p>
          </div>

          {/* Action */}
          <div className="pt-8">
            <Button asChild size="lg" className="bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark rounded-full px-12 h-16 text-xl font-bold shadow-2xl transition-all hover:scale-105 active:scale-95">
              <Link href="/home">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Text - always at bottom */}
      <div className="relative z-10 mt-8 pb-4 text-white/20 text-xs tracking-widest uppercase">
        Nigerian Medical Students' Association — ABUAD Medical Students' Association
      </div>
    </div>
  );
}
