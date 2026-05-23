
"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowDown, GraduationCap, Trophy, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const teaserCards = [
    { title: "Our Mission", icon: GraduationCap, text: "Excellence in medical education.", link: "/about" },
    { title: "The Gauntlet", icon: Trophy, text: "Our flagship academic challenge.", link: "/the-gauntlet" },
    { title: "Programs", icon: Users, text: "Workshops, Labs & Mentorship.", link: "/programs" },
    { title: "Join Us", icon: UserPlus, text: "Become a future healthcare leader.", link: "/join-us" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-elf-green-dark text-white px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 elf-diagonal-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-elf-teal/20 blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-elf-gold/10 blur-[180px] translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-4 reveal-on-scroll">
            <span className="w-2 h-2 rounded-full bg-elf-gold animate-pulse-dot" />
            <span className="text-xs font-bold tracking-widest uppercase text-elf-gold/80">
              Nigerian Medical Students' Association · AMSA Chapter
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline leading-tight reveal-on-scroll">
            Emerging <span className="italic text-elf-gold">Leaders'</span> Forum
          </h1>
          
          <p className="font-headline italic text-2xl md:text-3xl text-elf-gold/90 reveal-on-scroll">
            Investing in Visionaries
          </p>
          
          <p className="max-w-2xl mx-auto text-lg text-white/70 leading-relaxed reveal-on-scroll">
            Bridging the gap between early medical training and future professional excellence — 
            through academics, mentorship, leadership, and community.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 pt-4 reveal-on-scroll">
            <Button asChild size="lg" className="bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark rounded-full px-10 h-14 text-lg font-bold">
              <Link href="/join-us">Join the Forum</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 rounded-full px-10 h-14 text-lg">
              <Link href="/programs">Our Programs ↓</Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
          <div className="w-[1px] h-12 bg-elf-gold/50" />
          <ArrowDown size={16} className="text-elf-gold" />
        </div>
      </section>

      {/* Teaser Section */}
      <section className="py-24 bg-elf-cream flex flex-col items-center px-6">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teaserCards.map((card, i) => (
            <Link key={i} href={card.link} className="group block">
              <Card className="h-full border-none shadow-none bg-white rounded-2xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300 reveal-on-scroll">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-elf-green-dark flex items-center justify-center text-elf-gold group-hover:bg-elf-gold group-hover:text-elf-green-dark transition-colors duration-300">
                    <card.icon size={24} />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-elf-green-dark">{card.title}</h3>
                  <p className="text-elf-text-mid text-sm leading-relaxed">{card.text}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
