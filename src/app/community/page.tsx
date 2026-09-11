"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const teamMembers = [
  {
    name: "John Ekemini-Abasi Julius",
    role: "Campus Director",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.06.jpeg"
  },
  {
    name: "Lawal Imran",
    role: "Deputy Campus Director",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.06 (1).jpeg"
  },
  {
    name: "Edionwe Sophia",
    role: "General Secretary",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.06 (2).jpeg"
  },
  {
    name: "Olurin Oluwatoni",
    role: "Assistant General Secretary",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.06 (3).jpeg"
  },
  {
    name: "Olojo-Kosoko Dora",
    role: "Treasurer",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.07.jpeg"
  },
  {
    name: "Peter Ayomide",
    role: "Public Relations Officer I",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.07 (1).jpeg"
  },
  {
    name: "Mbaeze Chisom",
    role: "Public Relations Officer II",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.08.jpeg"
  },
  {
    name: "Fasubaa Tolulope",
    role: "Programs Coordinator I",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.08 (1).jpeg"
  },
  {
    name: "Kolawole Josephine",
    role: "Programs Coordinator II",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.08 (2).jpeg"
  },
  {
    name: "Okafor Favour",
    role: "100L Class Representative I",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.10.jpeg"
  },
  {
    name: "Nwosu Whitney",
    role: "100L Class Representative II",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.11.jpeg"
  },
  {
    name: "Egbon Christabel",
    role: "200L Class Representative I",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.11 (1).jpeg"
  },
  {
    name: "Atu Christabel",
    role: "200L Class Representative II",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.11 (2).jpeg"
  },
  {
    name: "Stanley Muchiso",
    role: "Editorial Lead I",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.12.jpeg"
  },
  {
    name: "Amenya Bela",
    role: "Editorial Lead II",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.12 (1).jpeg"
  },
  {
    name: "Aguoru Emmanuel",
    role: "Monitoring & Evaluation Officer I",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.13.jpeg"
  },
  {
    name: "Ogbejele Gideon",
    role: "Monitoring & Evaluation Officer I",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.13 (1).jpeg"
  },
  {
    name: "Lanade Tabitha",
    role: "Welfare Officer I",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.13 (2).jpeg"
  },
  {
    name: "Ajewole Oluwafiyibomi",
    role: "Welfare Officer II",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.14.jpeg"
  },
  {
    name: "Jamodu Opeyemi",
    role: "Media lead",
    image: "/images/WhatsApp Image 2026-09-11 at 21.34.15.jpeg"
  }
];

export default function Community() {
  return (
    <div className="bg-elf-cream min-h-screen pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-headline italic text-elf-gold text-xl block mb-4 underline decoration-elf-gold/20 underline-offset-8">
            Our Team
          </span>
          <h1 className="text-5xl md:text-7xl font-headline text-elf-green-dark leading-tight">
            Meet the Executive Team
          </h1>
          <p className="text-elf-text-mid max-w-xl mx-auto mt-4 text-sm md:text-base">
            Swipe left/right or use the arrows to see the emerging healthcare leaders driving the vision forward.
          </p>
        </div>

        <div className="relative px-8 md:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {teamMembers.map((member, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 md:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Card className="bg-white border border-elf-gold/10 rounded-2xl overflow-hidden shadow-md group hover:border-elf-gold transition-all duration-300">
                    <div className="relative aspect-[3/4] overflow-hidden bg-elf-green-dark/5">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-6 text-center space-y-2">
                      <h3 className="font-headline text-2xl font-bold text-elf-green-dark leading-tight line-clamp-2">
                        {member.name}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-elf-gold">
                        {member.role}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 h-10 w-10 border-elf-gold text-elf-gold hover:bg-elf-gold hover:text-white rounded-full bg-white/80 shadow-md" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 border-elf-gold text-elf-gold hover:bg-elf-gold hover:text-white rounded-full bg-white/80 shadow-md" />
          </Carousel>
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-3xl font-headline italic text-elf-gold">— WE ARE NiMSA-AMSA ELF!</h3>
        </div>
      </div>
    </div>
  );
}
