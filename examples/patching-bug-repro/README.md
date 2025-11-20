# Patching Bug Reproduction - Issue #3

This is a minimal reproducible example for [Issue #3](https://github.com/eeue56/coed/issues/3): "Tree nodes sometimes get combined by accident if they are too similar".

## The Bug

When using `@eeue56/coed`, tree nodes without unique `id` attributes can get incorrectly combined or confused during DOM patching. This happens when:

1. Multiple similar DOM nodes are rendered (e.g., in a list)
2. A node in the middle of the list is removed
3. The patching algorithm doesn't properly distinguish between the nodes
4. Content from different nodes can get mixed up or the wrong node is removed

## Workaround

Add a unique `id` attribute to each node that needs to be distinguished:

```typescript
// Buggy - nodes can get confused
coed.div([], [coed.class_("item")], [...]);

// Fixed - nodes are properly distinguished
coed.div([], [coed.class_("item"), coed.attribute("id", `item-${index}`)], [...]);
```

## Installation

```bash
npm install
```

## Running the Example

### Option 1: Manual Testing in Browser

1. Start the development server:
```bash
npm run serve
```

2. Open http://localhost:1234 in your browser

3. Follow the on-screen instructions to reproduce the bug:
   - Click "Add Query" several times to create multiple queries
   - Click a "Remove" button in the middle (not first or last)
   - Observe the incorrect behavior (wrong query removed or queries mixed up)

### Option 2: Automated Testing with Playwright

1. First, build the parent coed library:
```bash
cd ../..
npm install
npm run build
cd examples/patching-bug-repro
```

2. Install dependencies (including Playwright):
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

4. Start the dev server in one terminal:
```bash
npm run serve
```

5. In another terminal, run the Playwright tests:
```bash
npm test
```

Or run with visible browser:
```bash
npm run test:headed
```

Or debug mode:
```bash
npm run test:debug
```

## What the Test Does

The Playwright test:
1. Loads the example page
2. Adds multiple queries to create similar nodes
3. Removes a query from the middle of the list
4. Takes screenshots at each step (saved in `tests/screenshots/`)
5. Verifies the behavior and logs information for debugging

The screenshots will show the bug visually, making it easy to see when nodes get confused.

## Code Structure

- `src/index.ts` - Main application with both buggy and fixed versions
  - Set `useBuggyVersion = true` to see the bug
  - Set `useBuggyVersion = false` to see the fix
- `tests/patching-bug.spec.ts` - Playwright tests that reproduce the bug
- `playwright.config.ts` - Playwright configuration

## Debugging the Bug

The test creates screenshots in `tests/screenshots/` showing:
1. Initial state with 2 queries
2. After adding queries (3, 4, 5 total)
3. After removing a middle query
4. Final state

Compare the expected vs actual behavior in these screenshots to understand the bug.

## Notes

- The bug is most easily reproduced with Playwright, as mentioned in the original issue
- Regular browser testing may also show the bug, but it can be more intermittent
- The fix requires adding unique `id` attributes to distinguish similar nodes
