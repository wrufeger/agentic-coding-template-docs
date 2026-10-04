// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
	site: 'https://wrufeger.github.io',
	base: '/agentic-coding-template-docs',
	integrations: [
		starlight({
			title: 'agentic-coding-template',
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				de: { label: 'Deutsch', lang: 'de' },
			},
			plugins: [starlightLinksValidator()],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/wrufeger/agentic-coding-template' },
			],
			editLink: {
				baseUrl: 'https://github.com/wrufeger/agentic-coding-template-docs/edit/main/',
			},
			sidebar: [
				{ label: 'Start', translations: { de: 'Start' }, items: [{ autogenerate: { directory: 'start' } }] },
				{
					label: 'Getting started',
					translations: { de: 'Erste Schritte' },
					items: [{ autogenerate: { directory: 'getting-started' } }],
				},
				{ label: 'Concepts', translations: { de: 'Konzepte' }, items: [{ autogenerate: { directory: 'concepts' } }] },
				{ label: 'Guides', translations: { de: 'Anleitungen' }, items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'Reference', translations: { de: 'Referenz' }, items: [{ autogenerate: { directory: 'reference' } }] },
			],
		}),
	],
});
