import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('browser bundle exposes the documented public API', async () => {
  const source = await readFile(new URL('../src/webflow-components.js', import.meta.url), 'utf8');
  assert.match(source, /window\.WebflowComponents\s*=/);
  assert.match(source, /version:\s*"0\.1\.0"/);
  assert.match(source, /initFilters/);
  assert.match(source, /initAccordions/);
  assert.match(source, /initCopy/);
  assert.match(source, /initProgress/);
});

test('source includes all documented data attributes', async () => {
  const source = await readFile(new URL('../src/webflow-components.js', import.meta.url), 'utf8');
  for (const attribute of [
    'data-wf-filter-group',
    'data-wf-filter-item',
    'data-wf-accordion',
    'data-wf-copy',
    'data-wf-reading-progress'
  ]) {
    assert.ok(source.includes(attribute), `Missing ${attribute}`);
  }
});
