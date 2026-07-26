import { class_, div, pre, span, text, type HtmlNode } from "../../coed.ts";

export type HighlightSpec = {
    mode: "block" | "property" | "value";
    snippet: string;
    valueSnippet?: string;
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
): HtmlNode<never> {
    return div(
        [],
        [class_(`${classPrefix}-entry`)],
        [
            renderSection(
                `${classPrefix}-path`,
                `${classPrefix}-path-label`,
                pathCode,
                "Path",
            ),
            renderSection(
                `${classPrefix}-added`,
                `${classPrefix}-added-label`,
                addedCode,
                "Added",
            ),
            renderSection(
                `${classPrefix}-removed`,
                `${classPrefix}-removed-label`,
                removedCode,
                "Removed",
            ),
        ],
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

    if (
        highlight.mode === "value" &&
        typeof highlight.valueSnippet === "string"
    ) {
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
