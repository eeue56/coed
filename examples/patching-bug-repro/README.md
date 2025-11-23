# Patching Bug Reproduction - Issue #3

This is a minimal reproducible example for [Issue #3](https://github.com/eeue56/coed/issues/3): "Tree nodes sometimes get combined by accident if they are too similar".

## The Bug

When using `@eeue56/coed`, tree nodes without unique `id` attributes can get incorrectly combined or confused during DOM patching. This is particularly evident with **RECURSIVE tree structures** like those in [gobaith](https://github.com/eeue56/gobaith), where:

1. **Recursive/infinitely nested DOM structures** - Queries that contain other queries (And/Or/Filter patterns)
2. **Similar sibling nodes** - Multiple nodes with identical structures at the same level
3. **Deep nesting (6-7+ levels)** - Multiple wrapper divs at each recursive level
4. **Dynamic content** - When nodes are added or removed from the middle of a list

The patching algorithm compares nodes by tag name and ID. Without unique IDs, similar deeply-nested **recursive** structures become indistinguishable, causing:
- Wrong nodes to be removed
- Content from different nodes to get mixed up (input values appear in wrong queries)
- Children to be patched into incorrect parents

## Example Structure

Each query in this example has a **RECURSIVE structure** modeled after gobaith's query builder:

```
Query = Filter | And(Query, Query) | Or(Query, Query)

For example: And(Filter, Or(Filter, Filter))
```

This creates structures like:

```
div.filter-query (no ID - causes the bug!)
  ├─ div.query-header
  │   ├─ h3 (Query title)
  │   └─ button (Remove)
  ├─ div.query-builder-wrapper
  │   └─ div.builder-container
  │       └─ RECURSIVE QUERY BUILDER
  │           ├─ div.combinator-container (if And/Or)
  │           │   ├─ div.left-branch
  │           │   │   └─ div.branch-wrapper
  │           │   │       └─ div.indent
  │           │   │           └─ [RECURSIVE: nested query]
  │           │   ├─ div.combinator-selector
  │           │   │   └─ div.combinator-wrapper
  │           │   │       └─ div.combinator-label
  │           │   │           └─ span "AND" or "OR"
  │           │   └─ div.right-branch
  │           │       └─ div.branch-wrapper
  │           │           └─ div.indent
  │           │               └─ [RECURSIVE: another nested query]
  │           └─ div.filter-builder (if Filter)
  │               └─ div.filter-row
  │                   ├─ div.filter-field
  │                   │   └─ div.field-container
  │                   │       ├─ label
  │                   │       └─ div.input-wrapper
  │                   │           └─ div.input-container
  │                   │               └─ input
  │                   ├─ div.filter-operator (similar nesting)
  │                   └─ div.filter-value (similar nesting)
  └─ div.query-result-wrapper
      └─ div.result-container
          └─ div.filter-query-result
              ├─ div.result-header
              └─ div.result-content
```

This **6-7+ levels of nesting WITH recursion** makes the patching bug much easier to reproduce, matching the complexity in gobaith.

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
