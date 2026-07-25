/** @typedef {'5.6 Sol' | 'Fable 5' | 'Grok 4.5' | 'Opus 4.8'} BenchmarkModel */

/** @type {Readonly<Record<BenchmarkModel, string>>} */
export const modelUrlIds = Object.freeze({
	'5.6 Sol': '5.6-sol',
	'Fable 5': 'fable-5',
	'Grok 4.5': 'grok-4.5',
	'Opus 4.8': 'opus-4.8'
});

/** @type {Readonly<Record<string, BenchmarkModel>>} */
const modelByUrlId = Object.freeze(
	Object.fromEntries(
		Object.entries(modelUrlIds).map(([model, id]) => [id, /** @type {BenchmarkModel} */ (model)])
	)
);

/** @type {BenchmarkModel} */
export const defaultViewerModel = '5.6 Sol';

/**
 * Return only the requested models supported by the current viewport without
 * mutating or discarding the full requested state.
 *
 * @param {BenchmarkModel[]} models
 * @param {boolean} comparisonAvailable
 * @param {boolean} tripleComparisonAvailable
 * @returns {BenchmarkModel[]}
 */
export function modelsForViewport(models, comparisonAvailable, tripleComparisonAvailable) {
	const modelLimit = tripleComparisonAvailable ? 3 : comparisonAvailable ? 2 : 1;
	return models.slice(0, modelLimit);
}

/**
 * Parse Sitegeist's client-side viewer route.
 *
 * Unknown model IDs are ignored. The first valid primary model wins, comparison
 * models are de-duplicated in URL order, and no more than two are returned.
 *
 * @param {string} hash
 * @returns {{ slug: string; models: BenchmarkModel[]; compareMode: boolean } | null}
 */
export function parseViewerHash(hash) {
	if (!hash.startsWith('#site/')) return null;

	const route = hash.slice('#site/'.length);
	const queryStart = route.indexOf('?');
	const encodedSlug = queryStart === -1 ? route : route.slice(0, queryStart);
	if (!encodedSlug) return null;

	let slug;
	try {
		slug = decodeURIComponent(encodedSlug);
	} catch {
		return null;
	}
	if (!slug) return null;

	const params = new URLSearchParams(queryStart === -1 ? '' : route.slice(queryStart + 1));
	const comparisonIds = params.getAll('compare');
	const primary = params
		.getAll('model')
		.map((id) => modelByUrlId[id])
		.find((model) => model !== undefined) ?? defaultViewerModel;
	const models = [primary];
	const compareMode = comparisonIds.some((id) => id === '' || modelByUrlId[id] !== undefined);

	for (const id of comparisonIds) {
		const model = modelByUrlId[id];
		if (!model || models.includes(model)) continue;
		models.push(model);
		if (models.length === 3) break;
	}

	return { slug, models, compareMode };
}

/**
 * @param {{ slug: string; models: BenchmarkModel[]; compareMode?: boolean }} state
 */
export function serializeViewerHash({ slug, models, compareMode = false }) {
	const uniqueModels = models.filter(
		(model, index) => modelUrlIds[model] && models.indexOf(model) === index
	);
	const primary = uniqueModels[0] ?? defaultViewerModel;
	const params = new URLSearchParams({ model: modelUrlIds[primary] });

	for (const model of uniqueModels.slice(1, 3)) {
		params.append('compare', modelUrlIds[model]);
	}

	const compareMarker = compareMode && uniqueModels.length === 1 ? '&compare' : '';
	return `#site/${encodeURIComponent(slug)}?${params.toString()}${compareMarker}`;
}
