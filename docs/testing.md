# Quality assurance

The library uses Node.js built-in tests with no third-party dependencies.

## Run locally

```bash
npm test
node --check src/webflow-components.js
```

## Continuous integration

The GitHub Actions workflow runs syntax checks and tests on Node.js 20, 22 and 24 for pushes to `main` and pull requests targeting `main`.

## Scope and limitations

Current tests validate initialization, public API, syntax, and a basic filter-group lifecycle using a minimal mocked document. They **do not** establish full browser compatibility, Webflow CMS integration, accessibility conformance, or clipboard behavior. Those require browser-based end-to-end tests and manual testing on a published Webflow site.

## Manual verification checklist

1. Open `examples/basic-setup.html` using a local HTTP server.
2. Check category filtering and search, including the empty state.
3. Check accordion behavior using keyboard Enter and Space.
4. Check copy-to-clipboard in a secure context (HTTPS or localhost).
5. Scroll and verify reading progress updates.
6. Test on a published Webflow staging site before production use.
