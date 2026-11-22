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
  assert.equal(group.dataset.wfFilterInitialized, 'true');
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

test('accordion pairs a trigger with an explicitly referenced panel', () => {
  const events = {};
  const attrs = { 'aria-controls': 'second' };
  const trigger = {
    getAttribute(name) { return attrs[name] ?? null; },
    setAttribute(name, value) { attrs[name] = value; },
    addEventListener(name, fn) { events[name] = fn; }
  };
  const first = { id: 'first', hidden: true };
  const second = { id: 'second', hidden: true };
  const group = {
    dataset: {},
    getAttribute() { return 'single'; },
    querySelectorAll(selector) {
      return selector === '[data-wf-accordion-trigger]' ? [trigger] : [first, second];
    }
  };
  loadLibrary({ elements: { '[data-wf-accordion]': [group] } });
  assert.equal(attrs['aria-controls'], 'second');
  events.click();
  assert.equal(second.hidden, false);
  assert.equal(first.hidden, true);
  assert.equal(attrs['aria-expanded'], 'true');
});

test('reading progress listeners are registered only once on repeated init', () => {
  const counts = {};
  const bar = { style: {}, setAttribute() {} };
  const document = {
    readyState: 'complete',
    documentElement: { scrollHeight: 1600 },
    querySelectorAll(selector) { return selector === '[data-wf-reading-progress]' ? [bar] : []; },
    addEventListener() {}
  };
  const window = {
    innerHeight: 800, scrollY: 400,
    addEventListener(name) { counts[name] = (counts[name] || 0) + 1; },
    requestAnimationFrame(fn) { fn(); }
  };
  vm.runInNewContext(source, { document, window, navigator: {}, CustomEvent: class {} });
  window.WebflowComponents.init();
  assert.equal(counts.scroll, 1);
  assert.equal(counts.resize, 1);
  assert.equal(bar.style.width, '50.00%');
});

test('a link-style filter supports keyboard activation and prevents navigation', () => {
  const listeners = {};
  const attrs = { 'data-wf-filter': 'design' };
  const button = {
    tagName: 'A', dataset: {},
    getAttribute(name) { return attrs[name] ?? null; },
    hasAttribute(name) { return Object.hasOwn(attrs, name); },
    setAttribute(name, value) { attrs[name] = value; },
    addEventListener(name, fn) { listeners[name] = fn; }
  };
  const item = {
    textContent: 'Design systems', hidden: false,
    getAttribute(name) { return name === 'data-wf-category' ? 'design' : null; }
  };
  const group = {
    dataset: {},
    querySelectorAll(selector) {
      if (selector === '[data-wf-filter]') return [button];
      if (selector === '[data-wf-filter-item]') return [item];
      return [];
    },
    querySelector() { return null; },
    setAttribute() {}
  };
  loadLibrary({ elements: { '[data-wf-filter-group]': [group] } });
  assert.equal(attrs.role, 'button');
  assert.equal(attrs.tabindex, '0');
  let prevented = false;
  listeners.keydown({ key: ' ', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(attrs['aria-pressed'], 'true');
  assert.equal(item.hidden, false);
});

test('link-style controls prevent click navigation', () => {
  const listeners = {};
  const button = {
    tagName: 'A', dataset: {},
    getAttribute(name) { return name === 'data-wf-copy-value' ? 'hello' : null; },
    hasAttribute() { return false; },
    setAttribute() {},
    addEventListener(name, fn) { listeners[name] = fn; },
    textContent: 'Copy'
  };
  loadLibrary({ elements: { '[data-wf-copy]': [button] } });
  let prevented = false;
  listeners.click({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
});
