# Patching Bug Reproduction - Issue #3

This is a minimal reproducible example for [Issue #3](https://github.com/eeue56/coed/issues/3): "Tree nodes sometimes get combined by accident if they are too similar".

## The Bug

When using `@eeue56/coed`, tree nodes without unique `id` attributes can get incorrectly combined or confused during DOM patching. This is particularly evident with:

1. **Deeply nested DOM structures** - Multiple levels of divs, labels, inputs, etc.
2. **Similar sibling nodes** - Multiple nodes with the same structure (e.g., query builders in a list)
3. **Dynamic content** - When nodes are added or removed from the middle of a list

The patching algorithm compares nodes by tag name and ID. Without unique IDs, similar deeply-nested structures become indistinguishable, causing:
- Wrong nodes to be removed
- Content from different nodes to get mixed up (input values appear in wrong queries)
- Children to be patched into incorrect parents

## Example Structure

Each query in this example has a **deeply nested structure**:

```
div.filter-query (no ID - this causes the bug!)
  ├─ div.query-header
  │   ├─ h3 (Query title)
  │   └─ div (Remove button)
  ├─ div (Query builder wrapper)
  │   └─ div.query-builder
  │       └─ div.query-builder-row
  │           ├─ div.query-builder-field
  │           │   ├─ label
  │           │   └─ div.input-wrapper
  │           │       └─ input (field name)
  │           ├─ div.query-builder-operator
  │           │   ├─ label
  │           │   └─ div.operator-wrapper
  │           │       └─ select (operator dropdown)
  │           └─ div.query-builder-value
  │               ├─ label
  │               └─ div.input-wrapper
  │                   └─ input (value)
  └─ div (Result display)
      └─ div.filter-query-result
          ├─ div.result-header
          └─ div.result-content (with strong, code, em elements)
```

This deeply nested structure with similar siblings makes it much easier to reproduce the patching bug.

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

2. Open http://localhost:8000 in your browser

3. Follow the on-screen instructions to reproduce the bug:
   - Click "Add Query" to add more queries (recommended: add at least 1-2 more for 4-5 total)
   - Observe each query has a deeply nested structure with:
     - Field input, Operator dropdown, Value input
     - Complex result display with multiple nested elements
   - Click a "Remove" button in the MIDDLE (e.g., Query 2 or Query 3, not first or last)
   - **BUG**: Observe incorrect behavior - the input values from one query appear in another query's inputs

### Option 2: Automated Testing with Playwright

1. First, ensure dependencies are installed:
```bash
cd ../..
npm install
npm run build
cd examples/patching-bug-repro
npm install
```

2. Install Playwright browsers (one-time setup):
```bash
npx playwright install chromium
```

3. Start the dev server in one terminal:
```bash
npm run serve
```

4. In another terminal, run the Playwright tests:
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
