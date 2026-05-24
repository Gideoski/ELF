"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-elf-gold/20">
            <Image 
              src="/images/elf logo.jpeg" 
              alt="NiMSA-AMSA ELF Logo" 
              fill 
              className="object-cover"
            />
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

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-elf-gold hover:bg-white/10 hover:text-elf-gold">
                <Menu size={28} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-elf-green-dark border-elf-gold/20 text-white w-[300px] sm:w-[350px]">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 pt-10">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-xl font-headline py-3 transition-colors hover:text-elf-gold border-b border-white/5",
                      pathname === link.href ? "text-elf-gold" : "text-white"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="mt-8">
                  <Button asChild className="w-full bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark rounded-full py-6 text-lg font-bold" onClick={() => setIsOpen(false)}>
                    <Link href="/join-us">Join Us</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
