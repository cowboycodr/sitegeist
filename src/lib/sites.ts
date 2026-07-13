import { siteArtifacts } from '$lib/generated/site-artifacts';
import type { ShowcaseSite, SitePalette } from '$lib/site-types';

const artifactPalette: SitePalette = {
	bg: '#06110f',
	ink: '#eef0e8',
	accent: '#c8ff4d',
	accent2: '#65edc6',
	muted: '#7d9189'
};

export const sites: ShowcaseSite[] = siteArtifacts.map((artifact) => ({
	id: artifact.id,
	slug: artifact.slug,
	name: artifact.title,
	category: artifact.category,
	tagline: artifact.tagline,
	description: artifact.description,
	eyebrow: artifact.category,
	cta: 'Open site',
	secondary: '',
	layout: 'centered',
	pattern: 'grid',
	typeface: 'grotesk',
	palette: artifactPalette
}));

export const siteBySlug = new Map(sites.map((site) => [site.slug, site]));
