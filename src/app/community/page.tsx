
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Ibrahim Adekola",
    role: "300 Level, University of Ibadan",
    text: "ELF provided me with the first real opportunity to lead a team in a professional medical context. The mentorship I received was instrumental in shaping my clinical focus."
  },
  {
    name: "Amarya Chidubem",
    role: "200 Level, UNN",
    text: "The Preclinical Gauntlet was more than just a competition; it was a revelation of what I'm capable of when pushed. A truly transformative experience."
  },
  {
    name: "Zainab Usman",
    role: "400 Level, Ahmadu Bello University",
    text: "Joining the networking lab connected me with peers across the country I wouldn't have met otherwise. We're now collaborating on a health research project."
  },
  {
    name: "David Okafor",
    role: "300 Level, University of Lagos",
    text: "The academic workshops gave me practical study frameworks that actually worked for pre-clinicals. It made the massive curriculum feel manageable."
  },
  {
    name: "Faith Johnson",
    role: "200 Level, University of Calabar",
    text: "ELF isn't just about grades; it's about the kind of person you become. The focus on extracurriculars and mental health is refreshing in med school."
  },
  {
    name: "Musa Ibrahim",
    role: "600 Level, Bayero University",
    text: "Even as I transition to clinicals, the leadership principles I learned at ELF remain my bedrock. I'm now a better communicator with my patients and seniors."
  }
];

export default function Community() {
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
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 reveal-on-scroll">
          <span className="font-headline italic text-elf-gold text-xl block mb-4">A community that grows together</span>
          <h1 className="text-5xl md:text-7xl font-headline text-elf-green-dark leading-tight">Hear from our members.</h1>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 reveal-on-scroll">
          {testimonials.map((t, i) => (
            <Card key={i} className="break-inside-avoid bg-elf-cream border-none shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-10 border-l-4 border-elf-gold">
                <Quote size={32} className="text-elf-gold/20 mb-6" />
                <p className="text-elf-text-dark text-lg italic leading-relaxed mb-8">"{t.text}"</p>
                <div className="space-y-1">
                  <h4 className="font-headline text-xl font-bold text-elf-green-dark">{t.name}</h4>
                  <p className="text-elf-text-light text-xs uppercase tracking-widest">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-24 text-center py-16 bg-elf-green-dark rounded-3xl reveal-on-scroll">
          <h3 className="text-3xl md:text-4xl font-headline text-white mb-8">Ready to be part of the story?</h3>
          <Button asChild size="lg" className="bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark px-12 h-14 rounded-full font-bold">
            <Link href="/join-us">Join Us Today</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
