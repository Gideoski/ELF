"use client";

import React, { useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function Gallery() {
  const firestore = useFirestore();

  const galleryQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: dbImages, loading } = useCollection(galleryQuery);

  useEffect(() => {
    // We run the observer logic whenever images change or finish loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.animate-on-view');
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, [dbImages, loading]);

  return (
    <div className="bg-elf-green-dark min-h-screen pt-32 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16 animate-on-view opacity-100 transition-all duration-700">
          <div>
            <h1 className="text-5xl md:text-7xl font-headline mb-4">Moments That Matter 🫶🏾</h1>
            <p className="text-white/60 text-lg max-w-xl">Capturing the intensity, the joy, and the growth of Nigeria's emerging medical leaders.</p>
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elf-gold"></div>
           </div>
        ) : dbImages && dbImages.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {dbImages.map((img, i) => (
              <Card 
                key={img.id || i} 
                className="group relative overflow-hidden rounded-2xl border-none shadow-none bg-white/5 break-inside-avoid animate-on-view opacity-0 translate-y-4 transition-all duration-700"
                style={{ transitionDelay: `${(i % 5) * 100}ms` }}
              >
                <img 
                  src={img.imageUrl} 
                  alt={img.title || "Gallery image"} 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {img.title && (
                  <div className="absolute inset-0 bg-elf-green-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 bg-gradient-to-t from-elf-green-dark/80 to-transparent">
                    <h3 className="font-headline text-2xl font-bold text-white leading-tight">{img.title}</h3>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="text-white/40 italic">No moments captured in the gallery yet.</p>
          </div>
        )}

        <div className="mt-20 text-center animate-on-view opacity-100 transition-all duration-700">
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
