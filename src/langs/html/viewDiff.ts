import {
    class_,
    div,
    flatRender,
    pre,
    render,
    text,
    type Attribute,
    type HtmlNode,
} from "../../coed.ts";
import {
    DIFF_PATH_SEPARATOR,
    DIFF_PROPERTY_SEGMENT,
    parsePropertySegment,
} from "../diffs/diffPath.ts";
import {
    compactedSummaryNode,
    compactedValueHighlight,
    compactDiffEntries,
    formatComparedPathLine,
    formatPathLine,
    groupedDiffEntryCounts,
    groupedDiffPathItems,
    renderCodeWithHighlight,
    renderDiffEntrySections,
    type HighlightSpec,
    type ValueSnippetSpec,
} from "../diffs/viewDiffShared.ts";
import { escapeHtml } from "../helpers.ts";
import type { Diff } from "../types.ts";

type ParsedPath = {
    nodeIndexes: number[];
    attribute?: string;
};

type ParentNode = Extract<
    HtmlNode<unknown>,
    { kind: "regular" | "ns-regular" }
>;
type ElementNode = Extract<
    HtmlNode<unknown>,
    { kind: "regular" | "void" | "ns-regular" | "ns-void" }
>;

function isParentNode(node: HtmlNode<unknown> | null): node is ParentNode {
    return (
        node !== null && (node.kind === "regular" || node.kind === "ns-regular")
    );
}

function isElementNode(node: HtmlNode<unknown> | null): node is ElementNode {
    return (
        node !== null &&
        (node.kind === "regular" ||
            node.kind === "void" ||
            node.kind === "ns-regular" ||
            node.kind === "ns-void")
    );
}

function describeHtmlNode(node: HtmlNode<unknown> | null): string {
    if (node === null) {
        return "(missing)";
    }

    switch (node.kind) {
        case "text":
            return "#text";
        case "html-string":
            return "#html-string";
        case "regular":
        case "void":
        case "ns-regular":
        case "ns-void":
            return `<${node.tag}>`;
    }
}

function getNodeTrail(
    root: HtmlNode<unknown>,
    nodeIndexes: number[],
): Array<HtmlNode<unknown> | null> {
    if (nodeIndexes.length === 0 || nodeIndexes[0] !== 0) {
        return [];
    }

    const trail: Array<HtmlNode<unknown> | null> = [root];
    let current: HtmlNode<unknown> | null = root;

    for (const childIndex of nodeIndexes.slice(1)) {
        if (!isParentNode(current)) {
            trail.push(null);
            current = null;
            continue;
        }

        const next: HtmlNode<unknown> | null =
            current.children[childIndex] ?? null;
        trail.push(next);
        current = next;
    }

    return trail;
}

function formatPathForDisplay(
    path: string,
    addedRoot: HtmlNode<unknown>,
    removedRoot: HtmlNode<unknown>,
): string {
    const parsedPath = parsePath(path);

    if (parsedPath.nodeIndexes.length === 0) {
        return path;
    }

    const addedTrail = getNodeTrail(addedRoot, parsedPath.nodeIndexes);
    const removedTrail = getNodeTrail(removedRoot, parsedPath.nodeIndexes);
    const lines: string[] = [];

    for (let depth = 0; depth < parsedPath.nodeIndexes.length; depth++) {
        const index = parsedPath.nodeIndexes[depth];
        const addedNode = addedTrail[depth] ?? null;
        const removedNode = removedTrail[depth] ?? null;
        const addedDescription = describeHtmlNode(addedNode);
        const removedDescription = describeHtmlNode(removedNode);
        lines.push(
            formatComparedPathLine(
                depth,
                String(index),
                addedDescription,
                removedDescription,
            ),
        );
    }

    if (typeof parsedPath.attribute !== "undefined") {
        lines.push(
            formatPathLine(
                parsedPath.nodeIndexes.length,
                "attribute",
                parsedPath.attribute,
            ),
        );
    }

    return lines.join("\n");
}

function parsePath(path: string): ParsedPath {
    const parts = path.split(DIFF_PATH_SEPARATOR, 2);
    const nodePath = parts[0];
    const attributePath = parts.length > 1 ? parts[1] : "";
    const nodeIndexes = nodePath
        .split(".")
        .filter((segment) => /^\d+$/.test(segment))
        .map((segment) => Number(segment));

    const attribute = parsePropertySegment(attributePath, [
        DIFF_PROPERTY_SEGMENT,
    ]);

    if (attribute === null) {
        return {
            nodeIndexes,
        };
    }

    return {
        nodeIndexes,
        attribute,
    };
}

function nodePath(path: string): string {
    const parsedPath = parsePath(path);

    if (typeof parsedPath.attribute === "undefined") {
        return path;
    }

    if (parsedPath.nodeIndexes.length === 0) {
        return path;
    }

    return parsedPath.nodeIndexes.join(".");
}

function getNodeAtPath(
    root: HtmlNode<unknown>,
    nodeIndexes: number[],
): HtmlNode<unknown> | null {
    if (nodeIndexes.length === 0 || nodeIndexes[0] !== 0) {
        return null;
    }

    let current: HtmlNode<unknown> = root;

    for (const childIndex of nodeIndexes.slice(1)) {
        if (!isParentNode(current)) {
            return null;
        }

        const next = current.children[childIndex];
        if (typeof next === "undefined") {
            return null;
        }

        current = next;
    }

    return current;
}

function getAttributesByKey(
    node: HtmlNode<unknown> | null,
    key: string,
): Attribute[] {
    if (!isElementNode(node)) {
        return [];
    }

    return node.attributes.filter((attribute) => {
        if (attribute.kind === "none") {
            return key === "none";
        }

        return attribute.key === key;
    });
}

function attributeToString(attribute: Attribute): string {
    switch (attribute.kind) {
        case "none":
            return "";
        case "string":
            if (attribute.value.includes('"')) {
                return `${attribute.key}='${attribute.value}'`;
            }
            return `${attribute.key}="${attribute.value}"`;
        case "number":
            return `${attribute.key}=${attribute.value}`;
        case "style":
            return `${attribute.key}: ${attribute.value};`;
        case "boolean":
            return attribute.value ? `${attribute.key}="${attribute.key}"` : "";
    }
}

function attributeValueString(attribute: Attribute): string {
    switch (attribute.kind) {
        case "none":
            return "";
        case "string":
        case "number":
        case "style":
            return attribute.value;
        case "boolean":
            return attribute.value ? attribute.key : "";
    }
}

function attributeValueOffset(
    snippet: string,
    attribute: Attribute,
): number | null {
    const value = attributeValueString(attribute);
    if (value.length === 0) {
        return null;
    }

    if (attribute.kind === "string" || attribute.kind === "boolean") {
        const doubleQuoted = `="${value}"`;
        const doubleQuotedStart = snippet.indexOf(doubleQuoted);
        if (doubleQuotedStart !== -1) {
            return doubleQuotedStart + 2;
        }

        const singleQuoted = `='${value}'`;
        const singleQuotedStart = snippet.indexOf(singleQuoted);
        if (singleQuotedStart !== -1) {
            return singleQuotedStart + 2;
        }
    }

    const lastMatch = snippet.lastIndexOf(value);
    if (lastMatch !== -1) {
        return lastMatch;
    }

    return null;
}

function isSameAttribute(left: Attribute, right: Attribute): boolean {
    switch (left.kind) {
        case "none":
            return right.kind === "none";
        case "string":
            return (
                right.kind === "string" &&
                left.key === right.key &&
                left.value === right.value
            );
        case "number":
            return (
                right.kind === "number" &&
                left.key === right.key &&
                left.value === right.value
            );
        case "style":
            return (
                right.kind === "style" &&
                left.key === right.key &&
                left.value === right.value
            );
        case "boolean":
            return (
                right.kind === "boolean" &&
                left.key === right.key &&
                left.value === right.value
            );
    }
}

function isSameStructureWithoutTag(
    left: HtmlNode<unknown>,
    right: HtmlNode<unknown>,
): boolean {
    if (!isElementNode(left) || !isElementNode(right)) {
        return false;
    }

    if (left.attributes.length !== right.attributes.length) {
        return false;
    }

    for (let i = 0; i < left.attributes.length; i++) {
        if (!isSameAttribute(left.attributes[i], right.attributes[i])) {
            return false;
        }
    }

    return true;
}

function getHighlight(
    root: HtmlNode<unknown>,
    parsedPath: ParsedPath,
    oppositeRoot: HtmlNode<unknown>,
    compactedAttributes: string[] = [],
): HighlightSpec {
    const node = getNodeAtPath(root, parsedPath.nodeIndexes) ?? root;
    const oppositeNode =
        getNodeAtPath(oppositeRoot, parsedPath.nodeIndexes) ?? oppositeRoot;

    if (typeof parsedPath.attribute === "undefined") {
        const compactedHighlight = compactedAttributeHighlight(
            node,
            oppositeNode,
            compactedAttributes,
        );
        if (compactedHighlight !== null) {
            return compactedHighlight;
        }
    }

    if (typeof parsedPath.attribute !== "undefined") {
        const attributes = getAttributesByKey(node, parsedPath.attribute);
        const oppositeAttributes = getAttributesByKey(
            oppositeNode,
            parsedPath.attribute,
        );

        if (attributes.length === 0) {
            return { mode: "block", snippet: render(node) };
        }

        if (attributes.length !== 1 || oppositeAttributes.length > 1) {
            return { mode: "block", snippet: render(node) };
        }

        const attributeSnippet = attributeToString(attributes[0]);
        if (
            oppositeAttributes.length === 1 &&
            attributeValueString(attributes[0]) !==
                attributeValueString(oppositeAttributes[0])
        ) {
            return {
                mode: "value",
                snippet: attributeSnippet,
                valueSnippet: attributeValueString(attributes[0]),
            };
        }

        return { mode: "property", snippet: attributeSnippet };
    }

    if (node.kind === "text") {
        return { mode: "value", snippet: node.text, valueSnippet: node.text };
    }

    if (isSameStructureWithoutTag(node, oppositeNode)) {
        if (
            isElementNode(node) &&
            isElementNode(oppositeNode) &&
            node.tag !== oppositeNode.tag
        ) {
            return { mode: "property", snippet: node.tag };
        }
    }

    return { mode: "block", snippet: flatRender(node) };
}

function compactedAttributeHighlight(
    node: HtmlNode<unknown>,
    oppositeNode: HtmlNode<unknown>,
    compactedAttributes: string[],
): HighlightSpec | null {
    if (compactedAttributes.length === 0) {
        return null;
    }

    const snippetSpecs: ValueSnippetSpec[] = [];

    for (const key of compactedAttributes) {
        const attributes = getAttributesByKey(node, key);
        const oppositeAttributes = getAttributesByKey(oppositeNode, key);

        for (const attribute of attributes) {
            const snippet = attributeToString(attribute);
            if (snippet.length === 0) {
                continue;
            }

            const snippetSpec: ValueSnippetSpec = { snippet };

            if (
                oppositeAttributes.length === 1 &&
                attributes.length === 1 &&
                attributeValueString(attribute) !==
                    attributeValueString(oppositeAttributes[0])
            ) {
                snippetSpec.valueSnippet = attributeValueString(attribute);
                const valueOffset = attributeValueOffset(snippet, attribute);
                snippetSpec.valueOffset = valueOffset ?? undefined;
            }

            snippetSpecs.push(snippetSpec);
        }
    }

    return compactedValueHighlight(snippetSpecs);
}

function renderCode(
    root: HtmlNode<unknown>,
    parsedPath: ParsedPath,
    oppositeRoot: HtmlNode<unknown>,
    compactedAttributes: string[],
    codeClass: string,
    highlightClass: string,
): HtmlNode<never> {
    const code = render(root);
    const highlight = getHighlight(
        root,
        parsedPath,
        oppositeRoot,
        compactedAttributes,
    );

    return renderCodeWithHighlight(
        code,
        highlight,
        codeClass,
        highlightClass,
        escapeHtml,
    );
}

function attributeNameForPath(path: string): string | null {
    const parsedPath = parsePath(path);
    return parsedPath.attribute ?? null;
}

export function viewDiff(diff: Diff<HtmlNode<unknown>>): HtmlNode<never> {
    const groupedCounts = groupedDiffEntryCounts(diff.diffs, nodePath);
    const groupedAttributes = groupedDiffPathItems(
        diff.diffs,
        nodePath,
        attributeNameForPath,
    );
    const entries = compactDiffEntries(diff.diffs, nodePath);

    return div(
        [],
        [class_("coed-view-diff")],
        [
            ...entries.map((entry) => {
                const parsedPath = parsePath(entry.path);
                const compactedCount = groupedCounts.get(entry.path) ?? 1;
                const compactedAttributes =
                    groupedAttributes.get(entry.path) ?? [];
                const summaryNode = compactedSummaryNode(compactedCount);

                return renderDiffEntrySections(
                    "coed-view-diff",
                    pre(
                        [],
                        [class_("coed-view-diff-path-value")],
                        [
                            text(
                                formatPathForDisplay(
                                    entry.path,
                                    entry.added,
                                    entry.removed,
                                ),
                            ),
                        ],
                    ),
                    renderCode(
                        entry.added,
                        parsedPath,
                        entry.removed,
                        compactedAttributes,
                        "coed-view-diff-added-code",
                        "coed-view-diff-added-highlight",
                    ),
                    renderCode(
                        entry.removed,
                        parsedPath,
                        entry.added,
                        compactedAttributes,
                        "coed-view-diff-removed-code",
                        "coed-view-diff-removed-highlight",
                    ),
                    summaryNode,
                );
            }),
        ],
    );
}
