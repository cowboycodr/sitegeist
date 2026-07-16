import type { BenchmarkBrief } from '$lib/brief-types';

const briefModules = import.meta.glob<BenchmarkBrief>(
	'../../benchmark/briefs/generated/*.json',
	{ eager: true, import: 'default' }
);

export const briefs = Object.values(briefModules).sort((left, right) => left.id - right.id);

if (briefs.length !== 100) {
	throw new Error(`Expected 100 benchmark briefs, received ${briefs.length}`);
}

export const briefBySlug = new Map(briefs.map((brief) => [brief.slug, brief]));

if (briefBySlug.size !== briefs.length) {
	throw new Error('Benchmark brief slugs must be unique');
}
