import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		// sourceHash: sha256 of the English source page a German page was translated from
		// (scripts/check-translations.mjs).
		schema: docsSchema({ extend: z.object({ sourceHash: z.string().optional() }) }),
	}),
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
