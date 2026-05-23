
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Programs', href: '/programs' },
  { name: 'The Gauntlet', href: '/the-gauntlet' },
  { name: 'Impact', href: '/impact' },
  { name: 'Community', href: '/community' },
  { name: 'Gallery', href: '/gallery' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md",
        scrolled ? "bg-elf-green-dark/95 shadow-lg py-3" : "bg-elf-green-dark/90 py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-elf-gold border-2 border-elf-gold/20 flex items-center justify-center text-elf-green-dark font-headline font-bold text-lg">
            ELF
          </div>
          <span className="font-headline text-xl text-elf-gold font-semibold tracking-tight hidden sm:block">
            NiMSA-AMSA ELF
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors hover:text-elf-gold",
                pathname === link.href ? "text-elf-gold" : "text-white/80"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Button asChild className="bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark rounded-full px-6 font-semibold">
            <Link href="/join-us">Join Us</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-elf-gold"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={cn(
        "fixed inset-0 top-[72px] bg-elf-green-dark z-40 lg:hidden flex flex-col items-center gap-8 pt-12 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            href={link.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "text-2xl font-headline tracking-wide transition-colors hover:text-elf-gold",
              pathname === link.href ? "text-elf-gold" : "text-white"
            )}
          >
            {link.name}
          </Link>
        ))}
        <Button asChild className="bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark rounded-full px-10 py-6 text-xl font-bold mt-4" onClick={() => setIsOpen(false)}>
          <Link href="/join-us">Join Us</Link>
        </Button>
      </div>
    </nav>
  );
}
