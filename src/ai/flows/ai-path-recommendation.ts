'use server';
/**
 * @fileOverview This file implements a Genkit flow that recommends ELF pillars, programs, and mentorship paths
 * based on a user's academic stage and leadership goals.
 *
 * - aiPathRecommendation - An asynchronous function to get path recommendations.
 * - AiPathRecommendationInput - The input type for the aiPathRecommendation function.
 * - AiPathRecommendationOutput - The return type for the aiPathRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiPathRecommendationInputSchema = z.object({
  academicStage: z
    .string()
    .describe(
      "The user's current academic stage or year of study (e.g., 'First Year', 'Preclinical', 'Clinical')."
    ),
  leadershipGoals: z
    .string()
    .describe("A description of the user's leadership goals and aspirations."),
});
export type AiPathRecommendationInput = z.infer<
  typeof AiPathRecommendationInputSchema
>;

const AiPathRecommendationOutputSchema = z.object({
  recommendedPillars: z
    .array(z.string())
    .describe(
      "A list of recommended ELF pillars that align with the user's goals. Possible values: 'Academics', 'Leadership', 'Mentorship', 'Networking', 'Extracurriculars'."
    ),
  recommendedPrograms: z
    .array(z.string())
    .describe(
      "A list of recommended ELF programs based on the user's input. Possible values: 'Academic Workshops', 'Leadership Labs', 'Mentorship Program'."
    ),
  mentorshipPath: z
    .string()
    .describe(
      "A suggested mentorship path or focus that aligns with the user's aspirations."
    ),
});
export type AiPathRecommendationOutput = z.infer<
  typeof AiPathRecommendationOutputSchema
>;

export async function aiPathRecommendation(
  input: AiPathRecommendationInput
): Promise<AiPathRecommendationOutput> {
  return aiPathRecommendationFlow(input);
}

const aiPathRecommendationPrompt = ai.definePrompt({
  name: 'aiPathRecommendationPrompt',
  input: { schema: AiPathRecommendationInputSchema },
  output: { schema: AiPathRecommendationOutputSchema },
  prompt: `You are an intelligent advisor for NiMSA-AMSA ELF (Emerging Leaders' Forum), designed to help aspiring medical leaders navigate their journey. Your mission is to recommend specific ELF pillars, programs, and mentorship paths based on a user's academic stage and leadership goals.

NiMSA-AMSA ELF is affiliated with the Nigerian Medical Students' Association and the ABUAD Medical Students' Association (AMSA) chapter.

NiMSA-AMSA ELF offers the following Five Pillars:
- Academics: Academic excellence and study support for early students
- Leadership: Cultivating the next generation of medical leaders
- Mentorship: Connections with experienced guides and role models
- Networking: Building bridges across Nigeria and beyond
- Extracurriculars: Enriching life outside the lecture hall — because great doctors are whole people

Available Programs:
- Academic Workshops: Targeted sessions to reinforce core preclinical sciences and exam strategy
- Leadership Labs: Practical leadership training, public speaking, and student governance
- Mentorship Program: One-on-one and group mentorship with clinical students and professionals

Analyze the user's input and provide recommendations in a structured JSON format.

User's Academic Stage: {{{academicStage}}}
User's Leadership Goals: {{{leadershipGoals}}}

Based on this information, recommend:
1. Which of the Five Pillars are most relevant to the user's goals.
2. Which specific programs would be most beneficial.
3. A suggested focus or type of mentorship path.`,
});

const aiPathRecommendationFlow = ai.defineFlow(
  {
    name: 'aiPathRecommendationFlow',
    inputSchema: AiPathRecommendationInputSchema,
    outputSchema: AiPathRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await aiPathRecommendationPrompt(input);
    return output!;
  }
);
