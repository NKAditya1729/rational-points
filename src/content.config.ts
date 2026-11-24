import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    id: z.number().int().min(0),
    part: z.string(),
    title: z.string(),
    hook: z.string(),
    prereqs: z.array(z.object({ label: z.string(), lesson: z.number().int().optional() })).default([]),
    detour: z.boolean().default(false),
    readST: z.object({ pages: z.string(), sections: z.string(), preview: z.string(), watchFor: z.array(z.string()).default([]) }).optional(),
    readET: z.object({ chapters: z.string(), pages: z.string().optional(), preview: z.string() }).optional(),
    widgets: z.array(z.string()).default([]),
    exercises: z.array(z.string()).default([]),
    firstPassOK: z.boolean().default(false),
    estHours: z.number().positive(),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/glossary' }),
  schema: z.object({
    term: z.string(),
    short: z.string(),
    lesson: z.number().int().optional(),
  }),
});

export const collections = { lessons, glossary };
