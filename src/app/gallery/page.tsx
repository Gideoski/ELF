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

  const staticImages = [
    { imageUrl: "/images/20260427_092908.jpg", title: "Rising Leaders", createdAt: "2024-01-01" },
    { imageUrl: "/images/20260427_093026.jpg", title: "Core Science Review", createdAt: "2024-01-02" },
    { imageUrl: "/images/20260427_093121.jpg", title: "ELF Connections", createdAt: "2024-01-03" },
    { imageUrl: "/images/20260427_093142.jpg", title: "Strategy Session", createdAt: "2024-01-04" },
    { imageUrl: "/images/20260427_093232.jpg", title: "Academic Showdown", createdAt: "2024-01-05" },
    { imageUrl: "/images/20260427_093310.jpg", title: "Foundation Skills", createdAt: "2024-01-06" },
  ];

  const allImages = useMemo(() => {
    if (!dbImages || dbImages.length === 0) {
      return staticImages;
    }
    return dbImages;
  }, [dbImages]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [allImages]);

  return (
    <div className="bg-elf-green-dark min-h-screen pt-32 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16 reveal-on-scroll">
          <div>
            <h1 className="text-5xl md:text-7xl font-headline mb-4">Moments That Matter 🫶🏾</h1>
            <p className="text-white/60 text-lg max-w-xl">Capturing the intensity, the joy, and the growth of Nigeria's emerging medical leaders.</p>
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elf-gold"></div>
           </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 reveal-on-scroll">
            {allImages.map((img, i) => (
              <Card key={i} className="group relative overflow-hidden rounded-2xl border-none shadow-none bg-white/5 break-inside-avoid">
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
        )}

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