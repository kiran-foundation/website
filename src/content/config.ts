import { defineCollection, z } from "astro:content";

const albums = defineCollection({
  type: "data",
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      cover: z.string(), // Keep as string for file paths
    }),
});

export const collections = {
  albums,
};