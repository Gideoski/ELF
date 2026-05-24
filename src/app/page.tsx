
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowDown, GraduationCap, Trophy, Users, UserPlus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
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
    { title: "Our Mission", icon: GraduationCap, text: "Excellence in medical education and support.", link: "/about" },
    { title: "The Gauntlet", icon: Trophy, text: "Our flagship academic showdown for preclinicals.", link: "/the-gauntlet" },
    { title: "Programs", icon: Users, text: "Workshops, Labs & specialized mentorship.", link: "/programs" },
    { title: "Join Us", icon: UserPlus, text: "Become an emerging healthcare leader today.", link: "/join-us" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-elf-green-dark text-white px-6 pt-24 pb-20">
        <div className="absolute inset-0 elf-diagonal-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-elf-teal/20 blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-elf-gold/10 blur-[180px] translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-4 reveal-on-scroll">
            <span className="w-2 h-2 rounded-full bg-elf-gold animate-pulse-dot" />
            <span className="text-xs font-bold tracking-widest uppercase text-elf-gold/80">
              Investing in Visionaries
            </span>
          </div>
          
          <div className="space-y-6">
            <div className="reveal-on-scroll">
              <p className="text-sm md:text-base tracking-[0.25em] uppercase text-white/50 font-medium max-w-3xl mx-auto leading-relaxed px-4">
                Nigerian Medical Students' Association — African Medical Students' Association
              </p>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline leading-tight reveal-on-scroll">
              Emerging <span className="italic text-elf-gold">Leaders'</span> Forum
            </h1>
          </div>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/70 leading-relaxed reveal-on-scroll">
            Supporting and empowering premedical and preclinical students academically, professionally, and socially through Nigerian medical excellence.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 pt-8 reveal-on-scroll">
            <Button asChild size="lg" className="bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark rounded-full px-10 h-14 text-lg font-bold">
              <Link href="/join-us">Join the Forum</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white rounded-full px-10 h-14 text-lg border-2">
              <Link href="/programs">Explore Programs</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50 hidden md:flex">
          <div className="w-[1px] h-12 bg-elf-gold/50" />
          <ArrowDown size={16} className="text-elf-gold" />
        </div>
      </section>

      {/* Core Pillars Teaser */}
      <section className="py-24 bg-elf-cream/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teaserCards.map((card, i) => (
              <Card key={i} className="bg-white border-transparent hover:border-elf-gold/20 hover:shadow-xl transition-all duration-500 reveal-on-scroll group">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-2xl bg-elf-gold/10 flex items-center justify-center text-elf-gold mb-6 group-hover:bg-elf-gold group-hover:text-white transition-colors duration-500">
                    <card.icon size={24} />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-elf-green-dark mb-4">{card.title}</h3>
                  <p className="text-elf-text-mid text-sm leading-relaxed mb-6 flex-grow">{card.text}</p>
                  <Link href={card.link} className="inline-flex items-center text-elf-gold font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Learn More <ChevronRight size={16} className="ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-white px-6 border-t border-elf-gold/10">
        <div className="max-w-5xl mx-auto text-center reveal-on-scroll">
          <span className="font-headline italic text-elf-gold text-2xl mb-6 block">Our Shared Vision</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline text-elf-green-dark mb-12 italic leading-tight">
            "Bridging the gap between early medical training and professional excellence."
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left items-start mt-16">
            <div className="space-y-6 text-elf-text-mid text-lg leading-relaxed">
              <p>
                NiMSA-AMSA ELF (Emerging Leaders’ Forum) is a platform under the Nigerian Medical Students’ Association dedicated to supporting and empowering premedical and preclinical students academically, professionally, and socially.
              </p>
              <p>
                Focused on bridging the gap between the early years of medical training and future professional excellence, ELF creates opportunities for students to grow through academics, leadership development, mentorship, and networking.
              </p>
            </div>
            <div className="space-y-6 text-elf-text-mid text-lg leading-relaxed">
              <p>
                Through innovative programs, collaborations, and student-centered initiatives, NiMSA-AMSA ELF helps young medical students build confidence, develop relevant skills, and connect with a community of future healthcare leaders across Nigeria and beyond.
              </p>
              <div className="pt-6 border-t border-elf-gold/20">
                <h3 className="text-4xl font-headline italic text-elf-gold">WE ARE NiMSA-AMSA ELF!</h3>
              </div>
            </div>
          </div>

          <div className="w-24 h-1 bg-elf-gold mx-auto mt-20" />
        </div>
      </section>
    </div>
  );
}
