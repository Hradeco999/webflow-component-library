import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/webflow-components.js', import.meta.url), 'utf8');

function loadLibrary({ readyState = 'complete', elements = {} } = {}) {
  const listeners = {};
  const document = {
    readyState,
    querySelectorAll(selector) { return elements[selector] || []; },
    addEventListener(name, callback) { listeners[name] = callback; }
  };
  const window = {
    addEventListener() {},
    requestAnimationFrame(callback) { callback(); },
    innerHeight: 800,
    scrollY: 0
  };
  vm.runInNewContext(source, { window, document, navigator: {}, CustomEvent: class {} });
  return { window, document, listeners };
}

test('bundle parses as valid JavaScript', () => {
  assert.doesNotThrow(() => new vm.Script(source));
});

test('exports versioned init API', () => {
  const { window } = loadLibrary();
  assert.equal(window.WebflowComponents.version, '0.1.0');
  assert.equal(typeof window.WebflowComponents.init, 'function');
});

test('defers initialization until DOMContentLoaded when document is loading', () => {
  const { window, listeners } = loadLibrary({ readyState: 'loading' });
  assert.equal(typeof listeners.DOMContentLoaded, 'function');
  assert.doesNotThrow(() => listeners.DOMContentLoaded());
  assert.equal(typeof window.WebflowComponents.init, 'function');
});

test('manual initialization is safe on an empty document', () => {
  const { window } = loadLibrary();
  assert.doesNotThrow(() => window.WebflowComponents.init());
});

test('filter initializes an empty group without errors', () => {
  const attrs = {};
  const group = {
    dataset: {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    setAttribute(name, value) { attrs[name] = value; }
  };
  const { window } = loadLibrary({ elements: { '[data-wf-filter-group]': [group] } });
  assert.equal(group.dataset.wfInitialized, 'true');
  assert.equal(attrs['data-wf-visible-count'], '0');
  assert.doesNotThrow(() => window.WebflowComponents.init());
});

test('documentation attributes are present in bundle', () => {
  for (const attr of [
    'data-wf-filter-group',
    'data-wf-filter-item',
    'data-wf-accordion',
    'data-wf-copy',
    'data-wf-reading-progress'
  ]) {
    assert.ok(source.includes(attr), `Missing ${attr}`);
  }
});
