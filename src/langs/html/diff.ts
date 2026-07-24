import type { Attribute, HtmlNode } from "../../coed.ts";
import type { Diff, DiffNode } from "../types.ts";

function isSameAttribute(a: Attribute, b: Attribute): boolean {
    if (a.kind !== b.kind) {
        return false;
    }
    if (a.kind === "none") {
        return true;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
    b = b as typeof a;
    return a.key === b.key && a.value === b.value;
}

function getAttributeKey(attribute: Attribute): string {
    switch (attribute.kind) {
        case "none":
            return "none";
        case "string":
        case "boolean":
        case "number":
        case "style":
            return attribute.key;
    }
}

function getAttributeDiffPath(pathSoFar: string, key: string): string {
    return `${pathSoFar}->attributes{${key}}`;
}

function groupAttributesByKey(
    attributes: Attribute[],
): Map<string, Attribute[]> {
    const grouped = new Map<string, Attribute[]>();

    for (const attribute of attributes) {
        const key = getAttributeKey(attribute);
        const existing = grouped.get(key);

        if (typeof existing === "undefined") {
            grouped.set(key, [attribute]);
            continue;
        }

        existing.push(attribute);
    }

    return grouped;
}

function attributeDiffsByKey(
    pathSoFar: string,
    previousAttributes: Attribute[],
    nextAttributes: Attribute[],
): Diff<Attribute[]>["diffs"] {
    const previousByKey = groupAttributesByKey(previousAttributes);
    const nextByKey = groupAttributesByKey(nextAttributes);
    const keys = [...new Set([...previousByKey.keys(), ...nextByKey.keys()])];
    const diffs: Diff<Attribute[]>["diffs"] = [];

    for (const key of keys) {
        const removed = previousByKey.get(key) ?? [];
        const added = nextByKey.get(key) ?? [];

        if (removed.length === added.length) {
            let same = true;
            for (let i = 0; i < removed.length; i++) {
                if (!isSameAttribute(removed[i], added[i])) {
                    same = false;
                    break;
                }
            }

            if (same) {
                continue;
            }
        }

        diffs.push({
            path: getAttributeDiffPath(pathSoFar, key),
            removed,
            added,
        });
    }

    return diffs;
}

function nodeReplacementDiff(
    path: string,
    currentTree: HtmlNode<unknown>,
    nextTree: HtmlNode<unknown>,
): Diff<HtmlNode<unknown>> {
    return {
        diffs: [{ added: nextTree, removed: currentTree, path }],
    };
}

function mapAttributeDiffsToNodeDiffs(
    facts: Diff<Attribute[]>,
    currentTree: HtmlNode<unknown>,
    nextTree: HtmlNode<unknown>,
): Diff<HtmlNode<unknown>> {
    return {
        diffs: facts.diffs.map((attributeDiff) => ({
            path: attributeDiff.path,
            added: nextTree,
            removed: currentTree,
        })),
    };
}

/**
 * diff attributes, gives the path with the name of the attribute at the end
 * e.g:
 * `->attributes{width}` if width changes
 * `->attributes{height}` if height changes
 */
function diffFacts<Msg>(
    previousTree: HtmlNode<Msg>,
    nextTree: HtmlNode<Msg>,
    pathSoFar: string,
): Diff<Attribute[]> {
    switch (nextTree.kind) {
        case "void":
        case "regular":
        case "ns-void":
        case "ns-regular": {
            const typedPreviousTree = previousTree as Exclude<
                HtmlNode<Msg>,
                { kind: "text" } | { kind: "html-string" }
            >;

            return {
                diffs: attributeDiffsByKey(
                    pathSoFar,
                    typedPreviousTree.attributes,
                    nextTree.attributes,
                ),
            };
        }
        case "text":
        case "html-string": {
            return { diffs: [] };
        }
    }
}

function diffNode(
    currentTree: HtmlNode<unknown>,
    nextTree: HtmlNode<unknown>,
    pathSoFar: string,
): Diff<HtmlNode<unknown>> {
    if (currentTree.kind !== nextTree.kind) {
        return nodeReplacementDiff(pathSoFar, currentTree, nextTree);
    }

    switch (currentTree.kind) {
        case "text": {
            if (currentTree.text === (nextTree as typeof currentTree).text) {
                return { diffs: [] };
            }

            return nodeReplacementDiff(pathSoFar, currentTree, nextTree);
        }
        case "void":
        case "ns-void": {
            const typedNextTree = nextTree as typeof currentTree;

            if (currentTree.tag !== typedNextTree.tag) {
                return nodeReplacementDiff(pathSoFar, currentTree, nextTree);
            }

            const facts = diffFacts(currentTree, nextTree, pathSoFar);
            if (facts.diffs.length > 0) {
                return mapAttributeDiffsToNodeDiffs(
                    facts,
                    currentTree,
                    nextTree,
                );
            }

            return { diffs: [] };
        }
        case "regular":
        case "ns-regular": {
            const typedNextTree = nextTree as typeof currentTree;

            if (currentTree.tag !== typedNextTree.tag) {
                return nodeReplacementDiff(pathSoFar, currentTree, nextTree);
            }

            const facts = diffFacts(currentTree, nextTree, pathSoFar);

            if (facts.diffs.length > 0) {
                return mapAttributeDiffsToNodeDiffs(
                    facts,
                    currentTree,
                    nextTree,
                );
            }

            if (currentTree.children.length !== typedNextTree.children.length) {
                return nodeReplacementDiff(pathSoFar, currentTree, nextTree);
            }

            const diffs: DiffNode<HtmlNode<unknown>>[] = [];

            for (let i = 0; i < typedNextTree.children.length; i++) {
                const currentChild = currentTree.children[i];
                const nextChild = typedNextTree.children[i];

                diffs.push(
                    ...diffNode(currentChild, nextChild, `${pathSoFar}.${i}`)
                        .diffs,
                );
            }

            return { diffs };
        }
        case "html-string": {
            if (
                currentTree.content === (nextTree as typeof currentTree).content
            ) {
                return { diffs: [] };
            }

            return nodeReplacementDiff(pathSoFar, currentTree, nextTree);
        }
    }
}

/**
 * the `path` is based on the location of the element
 *
 * e.g
 *
 * `0` is the first (root)
 * `0->attributes{width}` is the width of the first element
 * `0->1->attributes{height}` is the height of the second element of the root element
 */
export function diff(
    left: HtmlNode<unknown>,
    right: HtmlNode<unknown>,
): Diff<HtmlNode<unknown>> {
    return diffNode(left, right, "0");
}
