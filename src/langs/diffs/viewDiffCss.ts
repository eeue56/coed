/**
 * Default stylesheet for view-diff UIs across coed languages.
 *
 * This uses the shared class names (`coed-view-diff-*`) for every language.
 */
export const defaultViewDiffCss = `
.coed-view-diff {
    --coed-view-diff-text: #1f2328;
    --coed-view-diff-muted: #59636e;
    --coed-view-diff-surface: #ffffff;
    --coed-view-diff-border: #d0d7de;
    --coed-view-diff-code-bg: #f6f8fa;
    --coed-view-diff-added-bg: #f6fff8;
    --coed-view-diff-removed-bg: #fff8f8;
    --coed-view-diff-added-accent: #1a7f37;
    --coed-view-diff-removed-accent: #cf222e;
    --coed-view-diff-added-highlight: #2da44e33;
    --coed-view-diff-removed-highlight: #cf222e33;

    color: var(--coed-view-diff-text);
    display: grid;
    gap: 14px;
}

.coed-view-diff-entry {
    background: var(--coed-view-diff-surface);
    border: 1px solid var(--coed-view-diff-border);
    border-radius: 10px;
    padding: 10px;
    display: grid;
    grid-template-columns: 160px 1fr 1fr;
    gap: 10px;
    align-items: start;
}

.coed-view-diff-path,
.coed-view-diff-added,
.coed-view-diff-removed {
    border-radius: 8px;
    border: 1px solid var(--coed-view-diff-border);
    padding: 8px;
    min-height: 100%;
}

.coed-view-diff-path-label,
.coed-view-diff-added-label,
.coed-view-diff-removed-label {
    margin: 0 0 8px;
    color: var(--coed-view-diff-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
}

.coed-view-diff-path-value,
.coed-view-diff-path-value {
    margin: 0;
    display: block;
    max-width: 100%;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    line-height: 1.4;
    font-size: 13px;
}

.coed-view-diff-added-code,
.coed-view-diff-removed-code {
    margin: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    line-height: 1.45;
    font-size: 13px;
    border-radius: 6px;
    padding: 10px;
    background: var(--coed-view-diff-code-bg);
    border: 1px solid var(--coed-view-diff-border);
}

.coed-view-diff-added,
.coed-view-diff-added {
    background: var(--coed-view-diff-added-bg);
    border-left: 4px solid var(--coed-view-diff-added-accent);
}

.coed-view-diff-added-label::before {
    content: "+ ";
    color: var(--coed-view-diff-added-accent);
    font-weight: 800;
}

.coed-view-diff-removed,
.coed-view-diff-removed {
    background: var(--coed-view-diff-removed-bg);
    border-left: 4px solid var(--coed-view-diff-removed-accent);
}

.coed-view-diff-removed-label::before {
    content: "- ";
    color: var(--coed-view-diff-removed-accent);
    font-weight: 800;
}

.coed-view-diff-added-highlight,
.coed-view-diff-added-highlight {
    background: var(--coed-view-diff-added-highlight);
    border-radius: 3px;
    padding: 0 2px;
    font-weight: 700;
}

.coed-view-diff-removed-highlight,
.coed-view-diff-removed-highlight {
    background: var(--coed-view-diff-removed-highlight);
    border-radius: 3px;
    padding: 0 2px;
    font-weight: 700;
}
`.trim();
