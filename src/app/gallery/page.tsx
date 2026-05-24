
"use client";

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const categories = ["All", "The Gauntlet", "Workshops", "Community", "Leadership"];

export default function Gallery() {
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const galleryImages = [
    { src: "/images/20260427_092908.jpg", cat: "The Gauntlet", title: "Rising Leaders" },
    { src: "/images/20260427_093026.jpg", cat: "Workshops", title: "Core Science Review" },
    { src: "/images/20260427_093121.jpg", cat: "Community", title: "ELF Connections" },
    { src: "/images/20260427_093142.jpg", cat: "Leadership", title: "Strategy Session" },
    { src: "/images/20260427_093232.jpg", cat: "The Gauntlet", title: "Academic Showdown" },
    { src: "/images/20260427_093310.jpg", cat: "Workshops", title: "Foundation Skills" },
  ];

  const filtered = activeTab === "All" ? galleryImages : galleryImages.filter(img => img.cat === activeTab);

  return (
    <div className="bg-elf-green-dark min-h-screen pt-32 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16 reveal-on-scroll">
          <div>
            <h1 className="text-5xl md:text-7xl font-headline mb-4">Moments That Matter 🫶🏾</h1>
            <p className="text-white/60 text-lg max-w-xl">Capturing the intensity, the joy, and the growth of Nigeria's emerging medical leaders.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Badge 
                key={cat} 
                onClick={() => setActiveTab(cat)}
                variant={activeTab === cat ? "default" : "outline"}
                className={`cursor-pointer px-6 py-2 rounded-full transition-all ${
                  activeTab === cat ? "bg-elf-gold text-elf-green-dark border-elf-gold" : "border-white/20 text-white/60 hover:text-white"
                }`}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 reveal-on-scroll">
          {filtered.map((img, i) => (
            <Card key={i} className="group relative overflow-hidden rounded-2xl border-none shadow-none bg-white/5 break-inside-avoid">
              <img 
                src={img.src} 
                alt={img.title} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-elf-green-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 bg-gradient-to-t from-elf-green-dark/80 to-transparent">
                <span className="text-elf-gold uppercase tracking-widest text-xs font-bold mb-2">{img.cat}</span>
                <h3 className="font-headline text-2xl font-bold text-white">{img.title}</h3>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center reveal-on-scroll">
          <p className="text-white/40 italic mb-8">View the complete archive on our official Google Drive</p>
          <Button asChild variant="outline" className="bg-transparent border-elf-gold text-elf-gold hover:bg-elf-gold hover:text-elf-green-dark h-14 px-10 rounded-full">
            <a href="https://drive.google.com/drive/folders/10qeiKr0kqtX_iRZK-u60V4dRBGZ9kA8b" target="_blank" rel="noopener noreferrer">
              Complete Archive →
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
