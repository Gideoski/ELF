"use client";

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const milestones = [
  { year: "2023", title: "ELF Founded", desc: "The vision was born under NiMSA-AMSA leadership." },
  { year: "2023", title: "First Gauntlet", desc: "A historic launch with students participating from across Nigeria." },
  { year: "2024", title: "Regional Expansion", desc: "Expanding impact across Eastern and Western medical schools." },
  { year: "2026", title: "The Next Era", desc: "Investing in visionaries through refined programs and mentorship." },
];

export default function Impact() {
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
    <div className="bg-elf-cream min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <h1 className="text-5xl md:text-7xl font-headline text-elf-green-dark mb-6">
            A growing community of future healthcare leaders.
          </h1>
          <p className="text-elf-text-mid text-lg leading-relaxed">
            Since our inception, ELF has been at the forefront of medical student empowerment, focusing on bridging the gap between early medical training and professional excellence.
          </p>
        </div>

        {/* Milestone Strip */}
        <section className="reveal-on-scroll">
          <h3 className="text-3xl font-headline font-bold text-elf-green-dark text-center mb-16 italic underline decoration-elf-gold/20 underline-offset-12">Our Journey & Growth</h3>
          
          <div className="relative">
            {/* Horizontal Line for Desktop */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-elf-gold/20 hidden lg:block -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              {milestones.map((m, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-elf-green-dark text-elf-gold flex items-center justify-center font-headline font-bold text-xl border-4 border-white shadow-lg relative z-20">
                    {m.year}
                  </div>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-elf-gold/5 flex-grow">
                    <h4 className="font-headline text-2xl text-elf-green-dark font-bold mb-2">{m.title}</h4>
                    <p className="text-elf-text-mid text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
