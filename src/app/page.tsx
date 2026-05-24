
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowDown, GraduationCap, Trophy, Users, UserPlus } from 'lucide-react';
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
    { title: "Our Mission", icon: GraduationCap, text: "Excellence in medical education.", link: "/about" },
    { title: "The Gauntlet", icon: Trophy, text: "Our flagship academic challenge.", link: "/the-gauntlet" },
    { title: "Programs", icon: Users, text: "Workshops, Labs & Mentorship.", link: "/programs" },
    { title: "Join Us", icon: UserPlus, text: "Become a future healthcare leader.", link: "/join-us" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-elf-green-dark text-white px-6">
        <div className="absolute inset-0 elf-diagonal-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-elf-teal/20 blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-elf-gold/10 blur-[180px] translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-4 reveal-on-scroll">
            <span className="w-2 h-2 rounded-full bg-elf-gold animate-pulse-dot" />
            <span className="text-xs font-bold tracking-widest uppercase text-elf-gold/80">
              NiMSA-AMSA ELF
            </span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline leading-tight reveal-on-scroll">
              Emerging <span className="italic text-elf-gold">Leaders'</span> Forum
            </h1>
            <div className="reveal-on-scroll">
              <p className="text-sm md:text-base tracking-[0.25em] uppercase text-white/50 font-medium max-w-2xl mx-auto leading-relaxed">
                Nigerian Medical Students' Association — African Medical Students' Association
              </p>
            </div>
          </div>
          
          <p className="font-headline italic text-2xl md:text-3xl text-elf-gold/90 reveal-on-scroll pt-4">
            Investing in Visionaries
          </p>
          
          <p className="max-w-2xl mx-auto text-lg text-white/70 leading-relaxed reveal-on-scroll">
            Supporting and empowering premedical and preclinical students academically, professionally, and socially.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 pt-6 reveal-on-scroll">
            <Button asChild size="lg" className="bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark rounded-full px-10 h-14 text-lg font-bold">
              <Link href="/join-us">Join the Forum</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white rounded-full px-10 h-14 text-lg border-2">
              <Link href="/programs">Our Programs ↓</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
          <div className="w-[1px] h-12 bg-elf-gold/50" />
          <ArrowDown size={16} className="text-elf-gold" />
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-5xl mx-auto text-center reveal-on-scroll">
          <h2 className="text-4xl md:text-5xl font-headline text-elf-green-dark mb-12 italic">"Bridging the gap between early medical training and professional excellence."</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left items-start">
            <div className="space-y-6 text-elf-text-mid text-lg leading-relaxed">
              <p>
                NiMSA-AMSA ELF (Emerging Leaders’ Forum) is a platform under the Nigerian Medical Students’ Association dedicated to supporting and empowering premedical and preclinical students academically, professionally, and socially.
              </p>
              <p>
                Focused on bridging the gap between the early years of medical training and future professional excellence, ELF creates opportunities for students to grow through academics, leadership development, mentorship, networking, and extracurricular engagement.
              </p>
            </div>
            <div className="space-y-6 text-elf-text-mid text-lg leading-relaxed">
              <p>
                Through innovative programs, collaborations, and student-centered initiatives, NiMSA-AMSA ELF helps young medical students build confidence, develop relevant skills, and connect with a community of future healthcare leaders across Nigeria and beyond.
              </p>
              <div className="pt-6">
                <h3 className="text-4xl font-headline italic text-elf-gold">WE ARE NiMSA-AMSA ELF!</h3>
              </div>
            </div>
          </div>

          <div className="w-24 h-1 bg-elf-gold mx-auto mt-16" />
        </div>
      </section>
    </div>
  );
}
