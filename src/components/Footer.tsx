
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Instagram } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide Footer on Welcome page (root /)
  if (pathname === '/') return null;

  return (
    <footer className="bg-elf-green-dark text-white py-16 border-t border-elf-gold/20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-elf-gold/20">
              <Image 
                src="/images/elf logo.jpeg" 
                alt="NiMSA-AMSA ELF Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <h3 className="font-headline text-2xl text-elf-gold italic">NiMSA-AMSA ELF</h3>
          </div>
          <p className="text-white/60 text-xs tracking-widest uppercase">Emerging Leaders' Forum · ABUAD Medical Students' Association Chapter</p>
          <div className="flex gap-4 mt-2">
            <a href="https://www.instagram.com/nimsaamsaelf?igsh=c28xa2libWd2d3l5" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-elf-gold transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://x.com/NimsaAmsaElf" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-elf-gold transition-colors">
              <svg 
                viewBox="0 0 24 24" 
                aria-hidden="true" 
                className="h-5 w-5 fill-current"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/home" className="text-white/60 hover:text-elf-gold text-sm transition-colors">Home</Link>
          <Link href="/about" className="text-white/60 hover:text-elf-gold text-sm transition-colors">About</Link>
          <Link href="/archive" className="text-white/60 hover:text-elf-gold text-sm transition-colors">Archive</Link>
          <Link href="/gallery" className="text-white/60 hover:text-elf-gold text-sm transition-colors">Gallery</Link>
          <Link href="/join-us" className="text-white/60 hover:text-elf-gold text-sm transition-colors">Join Us</Link>
        </div>

        <div className="flex flex-col md:items-end gap-2 text-white/60 text-sm italic">
          <p>© 2026 NiMSA-AMSA ELF</p>
          <p className="text-elf-gold/80">Investing in Visionaries</p>
        </div>
      </div>
    </footer>
  );
}
