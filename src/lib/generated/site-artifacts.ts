import { siteArtifacts as grokArtifacts } from './grok-site-artifacts';
import { siteArtifacts as solArtifacts } from './sol-site-artifacts';
import type { SiteArtifact } from './sol-site-artifacts';

export type { SiteArtifact } from './sol-site-artifacts';

export const benchmarkModels = ['5.6 Sol', 'Grok 4.5'] as const;
export type BenchmarkModel = (typeof benchmarkModels)[number];

export const siteArtifactsByModel: Record<BenchmarkModel, SiteArtifact[]> = {
	'5.6 Sol': solArtifacts,
	'Grok 4.5': grokArtifacts
};

export const siteArtifactByModel: Record<BenchmarkModel, Map<string, SiteArtifact>> = {
	'5.6 Sol': new Map(solArtifacts.map((artifact) => [artifact.slug, artifact])),
	'Grok 4.5': new Map(grokArtifacts.map((artifact) => [artifact.slug, artifact]))
};

// The Sol collection remains the backwards-compatible default for modules that
// have not opted into model selection.
export const siteArtifacts = solArtifacts;
export const siteArtifactBySlug = siteArtifactByModel['5.6 Sol'];
