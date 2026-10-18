import { class_, div, pre, span, text, type HtmlNode } from "../../coed.ts";
import type { DiffNode } from "../types.ts";

export type HighlightSpec =
    | {
          mode: "block" | "property";
          snippet: string;
      }
    | {
          mode: "value";
          snippet: string;
          valueSnippet: string;
      }
    | {
          mode: "multi";
          snippets: string[];
      }
    | {
          mode: "multi-value";
          snippets: Array<{
              snippet: string;
              valueSnippet: string;
              valueOffset?: number;
          }>;
      };

export type ValueSnippetSpec = {
    snippet: string;
    valueSnippet?: string;
    valueOffset?: number;
};

function identity(value: string): string {
    return value;
}

export function renderHighlightedText(
    code: string,
    snippet: string,
    highlightClass: string,
    transformText: (value: string) => string = identity,
): HtmlNode<never>[] {
    if (snippet.length === 0) {
        return [text(transformText(code))];
    }

    const start = code.indexOf(snippet);
    if (start === -1) {
        return [text(transformText(code))];
    }

    const before = code.slice(0, start);
    const after = code.slice(start + snippet.length);
    const children: HtmlNode<never>[] = [];

    if (before.length > 0) {
        children.push(text(transformText(before)));
    }

    children.push(
        span([], [class_(highlightClass)], [text(transformText(snippet))]),
    );

    if (after.length > 0) {
        children.push(text(transformText(after)));
    }

    return children;
}

export function renderHighlightedValue(
    code: string,
    snippet: string,
    value: string,
    highlightClass: string,
    transformText: (value: string) => string = identity,
): HtmlNode<never>[] {
    const snippetStart = code.indexOf(snippet);
    if (snippetStart === -1) {
        return [text(transformText(code))];
    }

    const valueOffset = snippet.indexOf(value);
    if (valueOffset === -1) {
        return renderHighlightedText(
            code,
            snippet,
            highlightClass,
            transformText,
        );
    }

    const start = snippetStart + valueOffset;
    const before = code.slice(0, start);
    const after = code.slice(start + value.length);
    const children: HtmlNode<never>[] = [];

    if (before.length > 0) {
        children.push(text(transformText(before)));
    }

    children.push(
        span([], [class_(highlightClass)], [text(transformText(value))]),
    );

    if (after.length > 0) {
        children.push(text(transformText(after)));
    }

    return children;
}

export function renderHighlightedSnippets(
    code: string,
    snippets: string[],
    highlightClass: string,
    transformText: (value: string) => string = identity,
): HtmlNode<never>[] {
    if (snippets.length === 0) {
        return [text(transformText(code))];
    }

    const positions = snippets
        .map((snippet) => ({
            snippet,
            index: code.indexOf(snippet),
        }))
        .filter((entry) => entry.index !== -1)
        .sort((a, b) => a.index - b.index);

    if (positions.length === 0) {
        return [text(transformText(code))];
    }

    const children: HtmlNode<never>[] = [];
    let cursor = 0;

    for (const position of positions) {
        if (position.index < cursor) {
            continue;
        }

        const before = code.slice(cursor, position.index);
        if (before.length > 0) {
            children.push(text(transformText(before)));
        }

        children.push(
            span(
                [],
                [class_(highlightClass)],
                [text(transformText(position.snippet))],
            ),
        );

        cursor = position.index + position.snippet.length;
    }

    if (cursor < code.length) {
        children.push(text(transformText(code.slice(cursor))));
    }

    return children;
}

export function renderHighlightedSnippetValues(
    code: string,
    snippets: Array<{
        snippet: string;
        valueSnippet: string;
        valueOffset?: number;
    }>,
    highlightClass: string,
    transformText: (value: string) => string = identity,
): HtmlNode<never>[] {
    if (snippets.length === 0) {
        return [text(transformText(code))];
    }

    const positions = snippets
        .map(({ snippet, valueSnippet, valueOffset }) => {
            const snippetStart = code.indexOf(snippet);
            if (snippetStart === -1) {
                return null;
            }

            const resolvedValueOffset =
                typeof valueOffset === "number"
                    ? valueOffset
                    : snippet.indexOf(valueSnippet);
            if (resolvedValueOffset === -1) {
                return null;
            }

            return {
                snippet,
                valueSnippet,
                start: snippetStart + resolvedValueOffset,
            };
        })
        .filter(
            (
                entry,
            ): entry is {
                snippet: string;
                valueSnippet: string;
                start: number;
            } => entry !== null,
        )
        .sort((a, b) => a.start - b.start);

    if (positions.length === 0) {
        return [text(transformText(code))];
    }

    const children: HtmlNode<never>[] = [];
    let cursor = 0;

    for (const position of positions) {
        if (position.start < cursor) {
            continue;
        }

        const before = code.slice(cursor, position.start);
        if (before.length > 0) {
            children.push(text(transformText(before)));
        }

        children.push(
            span(
                [],
                [class_(highlightClass)],
                [text(transformText(position.valueSnippet))],
            ),
        );

        cursor = position.start + position.valueSnippet.length;
    }

    if (cursor < code.length) {
        children.push(text(transformText(code.slice(cursor))));
    }

    return children;
}

export function renderSection(
    wrapperClass: string,
    labelClass: string,
    code: HtmlNode<never>,
    label: string,
): HtmlNode<never> {
    return div(
        [],
        [class_(wrapperClass)],
        [pre([], [class_(labelClass)], [text(label)]), code],
    );
}

export function renderDiffEntrySections(
    classPrefix: string,
    pathCode: HtmlNode<never>,
    addedCode: HtmlNode<never>,
    removedCode: HtmlNode<never>,
    summaryNode: HtmlNode<never> | null = null,
): HtmlNode<never> {
    const children: HtmlNode<never>[] = [];

    if (summaryNode !== null) {
        children.push(
            div([], [class_(`${classPrefix}-summary`)], [summaryNode]),
        );
    }

    children.push(
        renderSection(
            `${classPrefix}-path`,
            `${classPrefix}-path-label`,
            pathCode,
            "Path",
        ),
    );
    children.push(
        renderSection(
            `${classPrefix}-added`,
            `${classPrefix}-added-label`,
            addedCode,
            "Added",
        ),
    );
    children.push(
        renderSection(
            `${classPrefix}-removed`,
            `${classPrefix}-removed-label`,
            removedCode,
            "Removed",
        ),
    );

    return div([], [class_(`${classPrefix}-entry`)], children);
}

export function compactedSummaryNode(count: number): HtmlNode<never> | null {
    if (count <= 1) {
        return null;
    }

    return pre(
        [],
        [class_("coed-view-diff-summary-text")],
        [text(`${count} child changes compacted`)],
    );
}

export function formatComparedPathLine(
    depth: number,
    label: string,
    addedDescription: string,
    removedDescription: string,
): string {
    const description =
        addedDescription === removedDescription
            ? addedDescription
            : `${addedDescription} (was ${removedDescription})`;

    return `${"  ".repeat(depth)}${label}: ${description}`;
}

export function formatPathLine(
    depth: number,
    label: string,
    value: string,
): string {
    return `${"  ".repeat(depth)}${label}: ${value}`;
}

export function renderCodeWithHighlight(
    code: string,
    highlight: HighlightSpec | null,
    codeClass: string,
    highlightClass: string,
    transformText: (value: string) => string = identity,
): HtmlNode<never> {
    if (highlight === null) {
        return pre([], [class_(codeClass)], [text(transformText(code))]);
    }

    if (highlight.mode === "multi") {
        return pre(
            [],
            [class_(codeClass)],
            [
                ...renderHighlightedSnippets(
                    code,
                    highlight.snippets,
                    highlightClass,
                    transformText,
                ),
            ],
        );
    }

    if (highlight.mode === "multi-value") {
        return pre(
            [],
            [class_(codeClass)],
            [
                ...renderHighlightedSnippetValues(
                    code,
                    highlight.snippets,
                    highlightClass,
                    transformText,
                ),
            ],
        );
    }

    if (highlight.mode === "value") {
        return pre(
            [],
            [class_(codeClass)],
            [
                ...renderHighlightedValue(
                    code,
                    highlight.snippet,
                    highlight.valueSnippet,
                    highlightClass,
                    transformText,
                ),
            ],
        );
    }

    return pre(
        [],
        [class_(codeClass)],
        [
            ...renderHighlightedText(
                code,
                highlight.snippet,
                highlightClass,
                transformText,
            ),
        ],
    );
}

export function compactDiffEntries<T>(
    entries: DiffNode<T>[],
    parentPathForGrouping: (path: string) => string,
): DiffNode<T>[] {
    const groupedCounts = new Map<string, number>();

    for (const entry of entries) {
        const parentPath = parentPathForGrouping(entry.path);
        groupedCounts.set(parentPath, (groupedCounts.get(parentPath) ?? 0) + 1);
    }

    const compacted: DiffNode<T>[] = [];
    const seenPaths = new Set<string>();

    for (const entry of entries) {
        const parentPath = parentPathForGrouping(entry.path);
        const shouldCompact = (groupedCounts.get(parentPath) ?? 0) > 1;
        const nextPath = shouldCompact ? parentPath : entry.path;

        if (seenPaths.has(nextPath)) {
            continue;
        }

        seenPaths.add(nextPath);
        compacted.push({
            ...entry,
            path: nextPath,
        });
    }

    return compacted;
}

export function groupedDiffEntryCounts<T>(
    entries: DiffNode<T>[],
    parentPathForGrouping: (path: string) => string,
): Map<string, number> {
    const groupedCounts = new Map<string, number>();

    for (const entry of entries) {
        const parentPath = parentPathForGrouping(entry.path);
        groupedCounts.set(parentPath, (groupedCounts.get(parentPath) ?? 0) + 1);
    }

    return groupedCounts;
}

export function groupedDiffPathItems<T>(
    entries: DiffNode<T>[],
    parentPathForGrouping: (path: string) => string,
    getItemFromPath: (path: string) => string | null,
): Map<string, string[]> {
    const groupedItems = new Map<string, string[]>();

    for (const entry of entries) {
        const item = getItemFromPath(entry.path);
        if (item === null) {
            continue;
        }

        const parentPath = parentPathForGrouping(entry.path);
        const existingItems = groupedItems.get(parentPath) ?? [];

        if (!existingItems.includes(item)) {
            existingItems.push(item);
        }

        groupedItems.set(parentPath, existingItems);
    }

    return groupedItems;
}

export function compactedValueHighlight(
    snippetSpecs: ValueSnippetSpec[],
): HighlightSpec | null {
    if (snippetSpecs.length === 0) {
        return null;
    }

    const allAreValueSnippets = snippetSpecs.every(
        (snippetSpec) => typeof snippetSpec.valueSnippet === "string",
    );

    if (allAreValueSnippets) {
        return {
            mode: "multi-value",
            snippets: snippetSpecs.map((snippetSpec) => ({
                snippet: snippetSpec.snippet,
                valueSnippet: snippetSpec.valueSnippet as string,
                valueOffset: snippetSpec.valueOffset,
            })),
        };
    }

    return {
        mode: "multi",
        snippets: snippetSpecs.map((snippetSpec) => snippetSpec.snippet),
    };
}
