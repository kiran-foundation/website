import { defineCollection, z } from "astro:content";

const albums = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      cover: z.string(),
      root: z.string(),
      date: z.string(),
    }),
});
const publications = defineCollection({
  schema: z.object({
    title: z.string(),
    author: z.string(),
    fileType: z.string(),
    image: z.string(),
    file: z.string(),
  }),
});
const compliance = defineCollection({
  schema: z.object({
    title: z.string(),
    author: z.string(),
    fileType: z.string(),
    image: z.string().optional(),
    file: z.string(),
  }),
});
const membershipCards = defineCollection({
  schema: z.object({
    heading: z.string(),
    amount: z.string().optional(),
    lakh: z.string().optional(),
    paragraph: z.string(),
    permonth: z.string().optional(),
    frequency: z.string().optional(),
    url: z.string().optional(),
  }),
});

export const collections = {
  albums,
  publications,
  compliance,
  membershipCards,
};
