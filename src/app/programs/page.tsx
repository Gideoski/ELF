
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { aiPathRecommendation, AiPathRecommendationOutput } from '@/ai/flows/ai-path-recommendation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';

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
  const [academicStage, setAcademicStage] = useState('');
  const [leadershipGoals, setLeadershipGoals] = useState('');
  const [recommendation, setRecommendation] = useState<AiPathRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleGetRecommendation = async () => {
    if (!academicStage || !leadershipGoals) return;
    setLoading(true);
    try {
      const result = await aiPathRecommendation({ academicStage, leadershipGoals });
      setRecommendation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-elf-green-dark min-h-screen pt-32 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-6">
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

        {/* AI Path Recommendation Tool */}
        <section className="bg-white/5 rounded-3xl p-8 md:p-16 border border-white/10 reveal-on-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-elf-gold bg-elf-gold/10 px-4 py-2 rounded-full mb-4">
                <Sparkles size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">AI Path Advisor</span>
              </div>
              <h2 className="text-4xl font-headline font-bold">Not sure where to start?</h2>
              <p className="text-white/60 leading-relaxed">
                Tell us about your current academic journey and leadership aspirations. Our AI advisor will recommend the perfect ELF programs and mentorship paths for you.
              </p>
              
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="stage" className="text-white/80">Current Academic Stage</Label>
                  <Input 
                    id="stage"
                    placeholder="e.g. Pre-clinical, 2nd Year" 
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12"
                    value={academicStage}
                    onChange={(e) => setAcademicStage(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-white/80">Leadership Aspirations</Label>
                  <Textarea 
                    id="goals"
                    placeholder="What kind of leader do you want to become?" 
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-[120px]"
                    value={leadershipGoals}
                    onChange={(e) => setLeadershipGoals(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleGetRecommendation}
                  disabled={loading || !academicStage || !leadershipGoals}
                  className="w-full bg-elf-gold hover:bg-elf-gold-bright text-elf-green-dark h-14 rounded-full font-bold text-lg"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                  Get Recommendation
                </Button>
              </div>
            </div>

            <div className="bg-elf-green-dark/50 border border-white/10 rounded-2xl p-8 min-h-[400px] flex flex-col justify-center">
              {recommendation ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div>
                    <h4 className="text-elf-gold uppercase tracking-widest text-xs font-bold mb-3">Recommended Pillars</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.recommendedPillars.map((p, i) => (
                        <span key={i} className="bg-elf-gold/20 text-elf-gold px-3 py-1 rounded-full text-sm font-medium border border-elf-gold/30">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-elf-gold uppercase tracking-widest text-xs font-bold mb-3">Targeted Programs</h4>
                    <ul className="space-y-2 text-white/90">
                      {recommendation.recommendedPrograms.map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-elf-gold" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-elf-gold uppercase tracking-widest text-xs font-bold mb-3">Your Mentorship Focus</h4>
                    <p className="text-white/80 leading-relaxed italic border-l-2 border-elf-gold pl-4">
                      "{recommendation.mentorshipPath}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-40">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles size={32} />
                  </div>
                  <p className="font-headline text-xl italic">Waiting for your journey details...</p>
                </div>
              )}
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
