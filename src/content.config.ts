import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const programs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/programs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
  }),
});

const equipment = defineCollection({
  loader: file('src/content/equipment/wishlist.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    items: z.array(z.string()),
  }),
});

export const collections = {
  programs,
  equipment,
};
