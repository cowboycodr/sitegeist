export type SiteLayout =
	| 'split'
	| 'centered'
	| 'editorial'
	| 'poster'
	| 'catalog'
	| 'dashboard'
	| 'cinematic'
	| 'brutalist'
	| 'luxury'
	| 'orbital';

export type SitePattern =
	| 'mesh'
	| 'grid'
	| 'rings'
	| 'stripes'
	| 'dots'
	| 'sun'
	| 'checker'
	| 'aurora'
	| 'blocks'
	| 'halo'
	| 'noise'
	| 'waves'
	| 'type';

export type SiteTypeface = 'grotesk' | 'serif' | 'mono' | 'rounded' | 'condensed' | 'display' | 'humanist';

export type SitePalette = {
	bg: string;
	ink: string;
	accent: string;
	accent2: string;
	muted: string;
};

export type ShowcaseSite = {
	id: number;
	slug: string;
	name: string;
	category: string;
	tagline: string;
	description: string;
	eyebrow: string;
	cta: string;
	secondary: string;
	layout: SiteLayout;
	pattern: SitePattern;
	typeface: SiteTypeface;
	palette: SitePalette;
};
