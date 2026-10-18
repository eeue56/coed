import { class_, div, pre, text, type HtmlNode } from "../../coed.ts";
import {
    DIFF_PATH_SEPARATOR,
    DIFF_PROPERTY_SEGMENT,
    parsePropertySegment,
} from "../diffs/diffPath.ts";
import {
    compactDiffEntries,
    compactedSummaryNode,
    compactedValueHighlight,
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
import { selectorToString } from "./generate.ts";
import { css } from "./index.ts";
import type { CssBlock, Declaration } from "./types.ts";

type ParsedPath = {
    blockIndexes: number[];
    property?: string;
};

function getAtIndex<T>(items: T[], index: number): T | undefined {
    if (index < 0 || index >= items.length) {
        return undefined;
    }

    return items[index];
}

// css.diff payloads are singleton arrays whose path keeps the original top-level index.
function localIndexes(blocks: CssBlock[], blockIndexes: number[]): number[] {
    if (blocks.length !== 1 || blockIndexes.length === 0) {
        return blockIndexes;
    }

    return [0, ...blockIndexes.slice(1)];
}

function describeCssBlock(block: CssBlock | null): string {
    if (block === null) {
        return "(missing)";
    }

    if (block.kind === "MediaQuery") {
        return `@media ${block.selector.query}`;
    }

    return selectorToString(block.selector);
}

function getBlockTrail(
    blocks: CssBlock[],
    blockIndexes: number[],
): Array<CssBlock | null> {
    if (blockIndexes.length === 0) {
        return [];
    }

    const trail: Array<CssBlock | null> = [];
    let currentBlocks = blocks;
    let currentBlock: CssBlock | undefined;

    for (const index of localIndexes(blocks, blockIndexes)) {
        currentBlock = getAtIndex(currentBlocks, index);
        trail.push(currentBlock ?? null);

        if (typeof currentBlock === "undefined") {
            break;
        }

        if (currentBlock.kind !== "MediaQuery") {
            break;
        }

        currentBlocks = currentBlock.body;
    }

    return trail;
}

function formatPathForDisplay(
    path: string,
    addedBlocks: CssBlock[],
    removedBlocks: CssBlock[],
): string {
    const parsedPath = parsePath(path);

    if (parsedPath.blockIndexes.length === 0) {
        return path;
    }

    const addedTrail = getBlockTrail(addedBlocks, parsedPath.blockIndexes);
    const removedTrail = getBlockTrail(removedBlocks, parsedPath.blockIndexes);
    const lines: string[] = [];

    for (let depth = 0; depth < parsedPath.blockIndexes.length; depth++) {
        const index = parsedPath.blockIndexes[depth];
        const addedBlock = addedTrail[depth] ?? null;
        const removedBlock = removedTrail[depth] ?? null;
        const addedDescription = describeCssBlock(addedBlock);
        const removedDescription = describeCssBlock(removedBlock);
        lines.push(
            formatComparedPathLine(
                depth,
                String(index),
                addedDescription,
                removedDescription,
            ),
        );
    }

    if (typeof parsedPath.property !== "undefined") {
        lines.push(
            formatPathLine(
                parsedPath.blockIndexes.length,
                "property",
                parsedPath.property,
            ),
        );
    }

    const escaped = escapeHtml(lines.join("\n"));
    return escaped;
}

function parsePath(path: string): ParsedPath {
    const blockIndexes: number[] = [];
    let property: string | null = null;

    for (const segment of path.split(DIFF_PATH_SEPARATOR)) {
        if (/^\d+$/.test(segment)) {
            blockIndexes.push(Number(segment));
            continue;
        }

        const parsedProperty = parsePropertySegment(segment, [
            DIFF_PROPERTY_SEGMENT,
        ]);
        if (parsedProperty !== null) {
            property = parsedProperty;
        }
    }

    if (property === null) {
        return { blockIndexes };
    }

    return { blockIndexes, property };
}

function blockPath(path: string): string {
    const parsedPath = parsePath(path);

    if (typeof parsedPath.property === "undefined") {
        return path;
    }

    if (parsedPath.blockIndexes.length === 0) {
        return path;
    }

    return parsedPath.blockIndexes
        .map((index) => String(index))
        .join(DIFF_PATH_SEPARATOR);
}

function getBlockAtPath(
    blocks: CssBlock[],
    blockIndexes: number[],
): CssBlock | null {
    let currentBlocks = blocks;
    let currentBlock: CssBlock | undefined;

    for (const index of localIndexes(blocks, blockIndexes)) {
        currentBlock = getAtIndex(currentBlocks, index);
        if (typeof currentBlock === "undefined") {
            return null;
        }

        currentBlocks =
            currentBlock.kind === "MediaQuery" ? currentBlock.body : [];
    }

    return currentBlock ?? null;
}

function getPropertyDeclarations(
    block: CssBlock | null,
    property: string,
): Declaration[] {
    if (block === null || block.kind !== "Regular") {
        return [];
    }

    return block.body.filter(
        (
            declaration,
        ): declaration is Extract<Declaration, { kind: "Property" }> =>
            declaration.kind === "Property" && declaration.name === property,
    );
}

function declarationToString(declaration: Declaration): string {
    if (declaration.kind === "Property") {
        return `${declaration.name}: ${declaration.value};`;
    }

    if (declaration.selector.kind === "Media") {
        return css.generate([
            {
                kind: "MediaQuery",
                selector: declaration.selector,
                body: [
                    {
                        kind: "Regular",
                        selector: { kind: "All" },
                        body: declaration.declarations,
                    },
                ],
            },
        ]);
    }

    return css.generate([
        {
            kind: "Regular",
            selector: declaration.selector,
            body: declaration.declarations,
        },
    ]);
}

function isSameRegularBody(left: Declaration[], right: Declaration[]): boolean {
    if (left.length !== right.length) {
        return false;
    }

    for (let i = 0; i < left.length; i++) {
        if (declarationToString(left[i]) !== declarationToString(right[i])) {
            return false;
        }
    }

    return true;
}

function isSameMediaBody(left: CssBlock[], right: CssBlock[]): boolean {
    if (left.length !== right.length) {
        return false;
    }

    for (let i = 0; i < left.length; i++) {
        if (css.generate([left[i]]) !== css.generate([right[i]])) {
            return false;
        }
    }

    return true;
}

function isSameBlockBody(left: CssBlock, right: CssBlock): boolean {
    if (left.kind === "Regular" && right.kind === "Regular") {
        return isSameRegularBody(left.body, right.body);
    }

    if (left.kind === "MediaQuery" && right.kind === "MediaQuery") {
        return isSameMediaBody(left.body, right.body);
    }

    return false;
}

function getHighlight(
    blocks: CssBlock[],
    parsedPath: ParsedPath,
    oppositeBlocks: CssBlock[],
    compactedProperties: string[] = [],
): HighlightSpec | null {
    const targetBlock = getBlockAtPath(blocks, parsedPath.blockIndexes);
    if (targetBlock === null) {
        return null;
    }

    if (typeof parsedPath.property === "undefined") {
        const oppositeBlock = getBlockAtPath(
            oppositeBlocks,
            parsedPath.blockIndexes,
        );
        const compactedHighlight = compactedPropertyHighlight(
            targetBlock,
            oppositeBlock,
            compactedProperties,
        );
        if (compactedHighlight !== null) {
            return compactedHighlight;
        }

        if (
            oppositeBlock !== null &&
            oppositeBlock.kind === targetBlock.kind &&
            isSameBlockBody(targetBlock, oppositeBlock)
        ) {
            return {
                mode: "property",
                snippet: selectorToString(targetBlock.selector),
            };
        }

        return { mode: "block", snippet: css.generate([targetBlock]) };
    }

    const declarations = getPropertyDeclarations(
        targetBlock,
        parsedPath.property,
    );
    if (declarations.length === 0) {
        return null;
    }

    if (declarations.length !== 1) {
        return { mode: "block", snippet: css.generate([targetBlock]) };
    }

    const oppositeBlock = getBlockAtPath(
        oppositeBlocks,
        parsedPath.blockIndexes,
    );
    const oppositeDeclarations = getPropertyDeclarations(
        oppositeBlock,
        parsedPath.property,
    );
    const declaration = declarations[0];
    const declarationSnippet = declarationToString(declaration);

    if (
        oppositeDeclarations.length === 1 &&
        oppositeDeclarations[0].kind === "Property" &&
        declaration.kind === "Property" &&
        oppositeDeclarations[0].value !== declaration.value
    ) {
        return {
            mode: "value",
            snippet: declarationSnippet,
            valueSnippet: declaration.value,
        };
    }

    return { mode: "property", snippet: declarationSnippet };
}

function compactedPropertyHighlight(
    targetBlock: CssBlock,
    oppositeBlock: CssBlock | null,
    compactedProperties: string[],
): HighlightSpec | null {
    if (compactedProperties.length === 0) {
        return null;
    }

    const snippetSpecs: ValueSnippetSpec[] = [];

    for (const property of compactedProperties) {
        const declarations = getPropertyDeclarations(targetBlock, property);
        const oppositeDeclarations = getPropertyDeclarations(
            oppositeBlock,
            property,
        );

        for (const declaration of declarations) {
            const snippet = declarationToString(declaration);
            const snippetSpec: ValueSnippetSpec = { snippet };

            if (
                declaration.kind === "Property" &&
                oppositeDeclarations.length === 1 &&
                oppositeDeclarations[0].kind === "Property" &&
                oppositeDeclarations[0].value !== declaration.value
            ) {
                snippetSpec.valueSnippet = declaration.value;
            }

            snippetSpecs.push(snippetSpec);
        }
    }

    return compactedValueHighlight(snippetSpecs);
}

function renderCode(
    blocks: CssBlock[],
    parsedPath: ParsedPath,
    oppositeBlocks: CssBlock[],
    compactedProperties: string[],
    codeClass: string,
    highlightClass: string,
): HtmlNode<never> {
    const code = css.generate(blocks);
    const highlight = getHighlight(
        blocks,
        parsedPath,
        oppositeBlocks,
        compactedProperties,
    );

    return renderCodeWithHighlight(
        code,
        highlight,
        codeClass,
        highlightClass,
        escapeHtml,
    );
}

function propertyNameForPath(path: string): string | null {
    const parsedPath = parsePath(path);
    return parsedPath.property ?? null;
}

/**
 * renders a diff
 *
 * for example, for the css:
 * ```
 * .hello {
 *      width: 20px;
 * }
 * ```
 * and the new css:
 * ```
 * .hello {
 *      width: 30px;
 * }
 * ```
 *
 * It will be rendered in css emphasising the change between 20px and 30px
 */
export function viewDiff(diff: Diff<CssBlock[]>): HtmlNode<never> {
    const groupedCounts = groupedDiffEntryCounts(diff.diffs, blockPath);
    const groupedProperties = groupedDiffPathItems(
        diff.diffs,
        blockPath,
        propertyNameForPath,
    );
    const entries = compactDiffEntries(diff.diffs, blockPath);

    return div(
        [],
        [class_("coed-view-diff")],
        [
            ...entries.map((entry) => {
                const parsedPath = parsePath(entry.path);
                const compactedCount = groupedCounts.get(entry.path) ?? 1;
                const compactedProperties =
                    groupedProperties.get(entry.path) ?? [];
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
                        compactedProperties,
                        "coed-view-diff-added-code",
                        "coed-view-diff-added-highlight",
                    ),
                    renderCode(
                        entry.removed,
                        parsedPath,
                        entry.added,
                        compactedProperties,
                        "coed-view-diff-removed-code",
                        "coed-view-diff-removed-highlight",
                    ),
                    summaryNode,
                );
            }),
        ],
    );
}
