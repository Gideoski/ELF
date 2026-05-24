
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const programs = [
  {
    num: "01",
    title: "Academic Workshops",
    desc: "Targeted sessions to reinforce core preclinical sciences and exam strategy, ensuring a solid foundation for clinical practice."
  },
  {
    num: "02",
    title: "Leadership Labs",
    desc: "Practical leadership training, public speaking, and student governance workshops designed to build confidence in future leaders."
  },
  {
    num: "03",
    title: "Mentorship Program",
    desc: "One-on-one and group mentorship connecting early medical students with clinical seniors and practicing professionals."
  }
];

export default function Programs() {
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
    <div className="bg-elf-green-dark min-h-screen pt-32 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* CHIASMA IS COMING Section */}
        <section className="mb-32 text-center reveal-on-scroll">
          <h2 className="text-6xl md:text-8xl font-headline italic text-elf-gold mb-12 tracking-tight">
            CHIASMA IS COMING
          </h2>
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-elf-gold/20 bg-white/5 max-w-4xl mx-auto group">
            <img 
              src="/images/CHIASMA IS COMING.jpeg" 
              alt="CHIASMA IS COMING" 
              className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        </section>

        <div className="mb-20 reveal-on-scroll">
          <span className="font-headline text-elf-gold text-lg italic tracking-widest uppercase mb-4 block">Programs</span>
          <h1 className="text-5xl md:text-7xl font-headline leading-tight">Empowering the Future of Medicine</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {programs.map((prog, i) => (
            <Card 
              key={i} 
              className="bg-white/5 border border-white/10 hover:border-elf-gold transition-all duration-500 group reveal-on-scroll"
            >
              <CardContent className="p-10 relative overflow-hidden h-full flex flex-col justify-end min-h-[300px]">
                <span className="absolute top-0 right-4 font-headline text-9xl text-white/5 group-hover:text-elf-gold/10 transition-colors pointer-events-none">
                  {prog.num}
                </span>
                <div className="relative z-10 space-y-4">
                  <h3 className="font-headline text-3xl font-bold text-elf-gold">{prog.title}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">{prog.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Community Section Replacement */}
        <section className="bg-white/5 rounded-3xl p-8 md:p-16 border border-white/10 reveal-on-scroll">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-headline font-bold">Find Your Place in ELF</h2>
            <p className="text-white/60 leading-relaxed text-lg">
              Whether you're looking to ace your preclinical exams, develop leadership skills, or find a mentor who has walked the path before you, we have a program tailored for your growth.
            </p>
            <div className="pt-4">
              <Button asChild className="bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark h-14 px-10 rounded-full font-bold text-lg">
                <Link href="/join-us">Get Started Today</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Teaser to Gauntlet */}
        <div className="mt-32 p-12 bg-elf-gold rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 reveal-on-scroll">
          <div className="space-y-2">
            <h2 className="text-4xl font-headline font-bold text-elf-green-dark">Ready for the ultimate challenge?</h2>
            <p className="text-elf-green-dark/80">Experience the high-stakes academic showdown at ELF.</p>
          </div>
          <Button asChild className="bg-elf-green-dark text-elf-gold hover:bg-elf-green-dark/90 px-10 h-14 rounded-full font-bold">
            <Link href="/the-gauntlet">Discover The Gauntlet</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
