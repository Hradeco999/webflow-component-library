# Webflow Component Library

A lightweight, dependency-free collection of reusable front-end utilities for Webflow projects.

**Status:** early-stage / actively developing  
**License:** MIT  
**Compatibility:** modern browsers; designed for Webflow sites using native HTML elements and custom attributes.

> This is an independent community project and is not affiliated with or endorsed by Webflow, Inc.

## Why this exists

Webflow makes it easy to build interfaces visually. Some projects still need small pieces of custom behavior: filtering CMS lists, accessible accordions, copy-to-clipboard controls, and reading progress indicators.

This library collects those patterns in one place. Each component is opt-in, uses `data-wf-*` attributes, has no runtime dependencies, and can be installed without changing a site's build setup.

## Components

| Component | Attribute | What it does |
| --- | --- | --- |
| CMS filter + search | `data-wf-filter-group` | Filters a group of items by category and search text |
| Accessible accordion | `data-wf-accordion` | Adds single-open or multi-open accordion behavior |
| Copy to clipboard | `data-wf-copy` | Copies a value or text from a target element |
| Reading progress | `data-wf-reading-progress` | Updates a progress bar as the visitor scrolls |

## Quick start

1. Copy `src/webflow-components.js` into your project, or host it on your own CDN.
2. Add the required attributes to native Webflow elements (see the examples below).
3. Load the script before `</body>` in **Page settings → Before `</body>` tag**, or in **Site settings → Custom code → Footer code** if the components are used site-wide.
4. Publish the site and test on the published URL.

```html
<script src="YOUR-HOSTED-PATH/webflow-components.js" defer></script>
```

You can also paste the source into a Webflow Embed element using a `<script>` tag. Webflow's Code Embed element supports HTML, CSS, and JavaScript, with a 50,000-character limit. See the [official Webflow documentation](https://help.webflow.com/hc/en-us/articles/33961332238611-Custom-code-embed).

## 1. CMS filter and search

Create a wrapper around the controls and CMS Collection List. Add `data-wf-filter-group` to the wrapper.

```html
<div data-wf-filter-group>
  <div>
    <button type="button" data-wf-filter="all" aria-pressed="true">All</button>
    <button type="button" data-wf-filter="design" aria-pressed="false">Design</button>
    <button type="button" data-wf-filter="development" aria-pressed="false">Development</button>
  </div>

  <label>
    Search articles
    <input type="search" data-wf-filter-search placeholder="Search...">
  </label>

  <div data-wf-filter-list>
    <article data-wf-filter-item data-wf-category="design">Design article</article>
    <article data-wf-filter-item data-wf-category="development">Development article</article>
  </div>

  <p data-wf-filter-empty hidden>No matching items found.</p>
</div>
```

- `data-wf-category` accepts one category or comma-separated categories.
- Category matching is case-insensitive.
- The `all` filter is always available.
- Search checks the item's visible text content.
- In Webflow, place the attributes on the corresponding native elements. For CMS items, bind category values with CMS-connected custom attributes where appropriate.

## 2. Accessible accordion

Use a button followed by its panel. The script manages `aria-expanded`, `aria-controls`, and the panel's `hidden` state.

```html
<div data-wf-accordion="single">
  <div>
    <h3>
      <button type="button" data-wf-accordion-trigger aria-expanded="false">
        What is this component?
      </button>
    </h3>
    <div data-wf-accordion-panel hidden>
      <p>An accessible, lightweight accordion.</p>
    </div>
  </div>

  <div>
    <h3>
      <button type="button" data-wf-accordion-trigger aria-expanded="false">
        Can more than one item stay open?
      </button>
    </h3>
    <div data-wf-accordion-panel hidden>
      <p>Set the group attribute to <code>multiple</code>.</p>
    </div>
  </div>
</div>
```

Set `data-wf-accordion="multiple"` to allow multiple open panels. The default is `single`.

## 3. Copy to clipboard

```html
<button
  type="button"
  data-wf-copy
  data-wf-copy-value="npm install example-package"
  data-wf-copy-success="Copied!"
>
  Copy command
</button>
```

Or copy the text content of another element:

```html
<code id="install-command">npm install example-package</code>
<button type="button" data-wf-copy="#install-command">Copy</button>
```

The control temporarily receives `data-wf-copied="true"` and an optional success label. Provide visible feedback in your design (for example, with CSS targeting that attribute).

## 4. Reading progress

Place this element anywhere on the page:

```html
<div
  data-wf-reading-progress
  role="progressbar"
  aria-label="Reading progress"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="0"
></div>
```

Style the element's width or transform in Webflow. The script updates its width from `0%` to `100%` and its `aria-valuenow` value.

## Styling

The library deliberately does not impose a visual design system. Style buttons, panels, progress bars, empty states, and focus states in Webflow Designer.

Recommended focus style:

```css
[data-wf-filter]:focus-visible,
[data-wf-accordion-trigger]:focus-visible,
[data-wf-copy]:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
```

## Development

No install step is required for the browser library.

```bash
node --test
```

The tests use Node's built-in test runner. Browser interaction tests should be added as the components mature.

## Contributing

Issues and pull requests are welcome. Please include:

- A clear use case and expected behavior.
- The Webflow setup / attributes needed to reproduce the issue.
- Browser and device details for bugs.
- A small, focused change where possible.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Roadmap

- [ ] Add browser-based integration tests.
- [ ] Add URL query-string synchronization for CMS filters.
- [ ] Add accessible tabs component.
- [ ] Add form validation helpers.
- [ ] Add more Webflow-ready examples and setup videos.

## Disclaimer

This is community-maintained code. Test it on a staging site before using it in production. Custom code may interact with a site's existing scripts or Webflow behavior. The library does not replace accessibility testing or browser/device QA.
