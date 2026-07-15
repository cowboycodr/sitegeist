import {
	siteArtifactsByModel,
	type BenchmarkModel
} from '$lib/generated/site-artifacts';
import type { ShowcaseSite, SitePalette } from '$lib/site-types';

const artifactPalette: SitePalette = {
	bg: '#06110f',
	ink: '#eef0e8',
	accent: '#c8ff4d',
	accent2: '#65edc6',
	muted: '#7d9189'
};

function createSites(model: BenchmarkModel): ShowcaseSite[] {
	return siteArtifactsByModel[model].map((artifact, index) => ({
		id: index + 1,
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
}

export const sitesByModel: Record<BenchmarkModel, ShowcaseSite[]> = {
	'5.6 Sol': createSites('5.6 Sol'),
	'Opus 4.8': createSites('Opus 4.8'),
	'Grok 4.5': createSites('Grok 4.5')
};

export const sites = sitesByModel['5.6 Sol'];

export const siteBySlug = new Map(sites.map((site) => [site.slug, site]));
