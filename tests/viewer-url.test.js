// @ts-nocheck -- Node's built-in test types are not part of the browser app's dependencies.
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	defaultViewerModel,
	modelsForViewport,
	parseViewerHash,
	serializeViewerHash
} from '../src/lib/viewer-url.js';

test('legacy site links retain the default model', () => {
	assert.deepEqual(parseViewerHash('#site/aurora-labs'), {
		slug: 'aurora-labs',
		models: [defaultViewerModel],
		compareMode: false
	});
});

test('one-, two-, and three-model links parse in order', () => {
	assert.deepEqual(parseViewerHash('#site/aurora?model=fable-5'), {
		slug: 'aurora',
		models: ['Fable 5'],
		compareMode: false
	});
	assert.deepEqual(
		parseViewerHash('#site/aurora?model=grok-4.5&compare=5.6-sol'),
		{ slug: 'aurora', models: ['Grok 4.5', '5.6 Sol'], compareMode: true }
	);
	assert.deepEqual(
		parseViewerHash(
			'#site/aurora?model=opus-4.8&compare=fable-5&compare=grok-4.5'
		),
		{
			slug: 'aurora',
			models: ['Opus 4.8', 'Fable 5', 'Grok 4.5'],
			compareMode: true
		}
	);
});

test('a bare compare marker restores the empty comparison chooser', () => {
	assert.deepEqual(parseViewerHash('#site/aurora?model=opus-4.8&compare'), {
		slug: 'aurora',
		models: ['Opus 4.8'],
		compareMode: true
	});
	assert.equal(
		serializeViewerHash({
			slug: 'aurora',
			models: ['Opus 4.8'],
			compareMode: true
		}),
		'#site/aurora?model=opus-4.8&compare'
	);
});

test('unknown and duplicate model values are ignored safely', () => {
	assert.deepEqual(
		parseViewerHash(
			'#site/aurora?model=unknown&model=fable-5&compare=fable-5&compare=nope&compare=grok-4.5&compare=grok-4.5&compare=opus-4.8&compare=5.6-sol'
		),
		{
			slug: 'aurora',
			models: ['Fable 5', 'Grok 4.5', 'Opus 4.8'],
			compareMode: true
		}
	);
	assert.deepEqual(parseViewerHash('#site/aurora?model=fable-5&compare=nope'), {
		slug: 'aurora',
		models: ['Fable 5'],
		compareMode: false
	});
});

test('gallery and malformed viewer hashes are not parsed as viewer state', () => {
	assert.equal(parseViewerHash(''), null);
	assert.equal(parseViewerHash('#collection'), null);
	assert.equal(parseViewerHash('#site/'), null);
	assert.equal(parseViewerHash('#site/%E0%A4%A'), null);
});

test('serialization uses stable identifiers and safely encodes the slug', () => {
	assert.equal(
		serializeViewerHash({
			slug: 'type & motion',
			models: ['5.6 Sol', 'Fable 5', 'Grok 4.5']
		}),
		'#site/type%20%26%20motion?model=5.6-sol&compare=fable-5&compare=grok-4.5'
	);
});

test('serialization removes duplicates and limits comparisons to two', () => {
	assert.equal(
		serializeViewerHash({
			slug: 'aurora',
			models: ['Opus 4.8', 'Opus 4.8', 'Fable 5', 'Grok 4.5', '5.6 Sol']
		}),
		'#site/aurora?model=opus-4.8&compare=fable-5&compare=grok-4.5'
	);
});

test('responsive limits defer panes without discarding requested state', () => {
	const requestedModels = ['Opus 4.8', 'Fable 5', 'Grok 4.5'];

	assert.deepEqual(modelsForViewport(requestedModels, false, false), ['Opus 4.8']);
	assert.deepEqual(modelsForViewport(requestedModels, true, false), ['Opus 4.8', 'Fable 5']);
	assert.deepEqual(modelsForViewport(requestedModels, true, true), requestedModels);
	assert.deepEqual(requestedModels, ['Opus 4.8', 'Fable 5', 'Grok 4.5']);
});
