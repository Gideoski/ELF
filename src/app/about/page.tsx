"use client";

import React, { useEffect } from 'react';
import { GraduationCap, Trophy, Users, Globe, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const pillars = [
  { 
    title: "Academics", 
    desc: "Academic excellence and study support for early students", 
    icon: GraduationCap 
  },
  { 
    title: "Leadership", 
    desc: "Cultivating the next generation of medical leaders", 
    icon: Trophy 
  },
  { 
    title: "Mentorship", 
    desc: "Connections with experienced guides and role models", 
    icon: Users 
  },
  { 
    title: "Networking", 
    desc: "Building bridges across Nigeria and beyond", 
    icon: Globe 
  },
  { 
    title: "Extracurriculars", 
    desc: "Enriching life outside the lecture hall — because great doctors are whole people", 
    icon: Star,
    fullWidth: true 
  },
];

export default function About() {
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
    <div className="pt-24 pb-20">
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 reveal-on-scroll">
            <span className="font-headline italic text-elf-gold text-xl block mb-4 underline decoration-elf-gold/30 underline-offset-8">
              Investing in Visionaries
            </span>
            <h1 className="text-5xl md:text-7xl font-headline leading-tight text-elf-green-dark mb-8">
              Built for the early years. Designed for impact.
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6 text-elf-text-mid text-lg leading-relaxed reveal-on-scroll">
              <p>
                NiMSA-AMSA ELF (Emerging Leaders’ Forum) is a platform under the Nigerian Medical Students’ Association dedicated to supporting and empowering premedical and preclinical students academically, professionally, and socially.
              </p>
              <p>
                Focused on bridging the gap between the early years of medical training and future professional excellence, ELF creates opportunities for students to grow through academics, leadership development, mentorship, networking, and extracurricular engagement.
              </p>
              <p>
                Through innovative programs, collaborations, and student-centered initiatives, NiMSA-AMSA ELF helps young medical students build confidence, develop relevant skills, and connect with a community of future healthcare leaders across Nigeria and beyond.
              </p>
              
              <div className="pt-8">
                 <h2 className="text-4xl font-headline italic text-elf-gold">WE ARE NiMSA-AMSA ELF!</h2>
              </div>

              <div className="pt-8 border-t border-elf-gold/20 flex gap-12">
                <div>
                  <h4 className="font-headline text-3xl text-elf-green-dark italic">NiMSA</h4>
                  <p className="text-xs uppercase tracking-widest text-elf-text-light">Affiliation</p>
                </div>
                <div>
                  <h4 className="font-headline text-3xl text-elf-green-dark italic">AMSA</h4>
                  <p className="text-xs uppercase tracking-widest text-elf-text-light">Chapter</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 reveal-on-scroll">
              {pillars.map((pillar, i) => (
                <Card 
                  key={i} 
                  className={`bg-elf-cream border border-transparent hover:border-elf-gold hover:-translate-y-1 transition-all duration-300 ${pillar.fullWidth ? 'sm:col-span-2' : ''}`}
                >
                  <CardContent className="p-8">
                    <pillar.icon className="text-elf-gold mb-4" size={32} />
                    <h3 className="font-headline text-2xl font-bold text-elf-green-dark mb-2">{pillar.title}</h3>
                    <p className="text-elf-text-mid text-sm">{pillar.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
