import { getCollection } from 'astro:content';

// Get all publications sorted by date (newest first)
export async function getAllPublications() {
  return await getCollection('publications');
}