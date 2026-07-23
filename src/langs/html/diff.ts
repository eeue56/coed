import type { Attribute, HtmlNode, StringAttribute } from "../../coed.ts";
import type { Diff } from "../types.ts";

function diffFacts<Msg>(
    previousTree: HtmlNode<Msg>,
    nextTree: HtmlNode<Msg>,
    pathSoFar: string,
): Diff<Attribute[]> {
    pathSoFar = `${pathSoFar}->attributes`;
    switch (nextTree.kind) {
        case "void":
        case "regular":
        case "ns-void":
        case "ns-regular": {
            const removed: Attribute[] = [];
            const added: Attribute[] = [];

            if (previousTree.kind !== nextTree.kind) {
                return {
                    diffs: [
                        {
                            path: pathSoFar,
                            removed: [],
                            added: nextTree.attributes,
                        },
                    ],
                };
            }

            const previousAttributes: string[] = [];
            for (const attr of previousTree.attributes) {
                if (attr.kind != "none") {
                    previousAttributes.push(attr.key);
                }
            }

            const nextAttributes: string[] = [];
            for (const attr of nextTree.attributes) {
                if (attr.kind != "none") {
                    nextAttributes.push(attr.key);
                }
            }

            for (const attribute of previousTree.attributes) {
                if (
                    attribute.kind !== "none" &&
                    nextAttributes.indexOf(attribute.key) === -1
                ) {
                    removed.push(attribute);
                }
            }
            nextTree.attributes.forEach((attribute: Attribute) => {
                if (
                    attribute.kind !== "none" &&
                    removed.indexOf(attribute) === -1
                ) {
                    added.push(attribute);
                }
            });

            if (removed.length === 0 && added.length === 0) {
                return { diffs: [] };
            }

            return { diffs: [{ path: pathSoFar, removed, added }] };
        }
        case "text": {
            return { diffs: [] };
        }
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
        return {
            diffs: [{ added: nextTree, removed: currentTree, path: pathSoFar }],
        };
    }

    switch (currentTree.kind) {
        case "text": {
            if (currentTree.text == (nextTree as typeof currentTree).text) {
                return { diffs: [] };
            } else {
                return {
                    diffs: [
                        {
                            added: nextTree,
                            removed: currentTree,
                            path: pathSoFar,
                        },
                    ],
                };
            }
        }
        case "void":
        case "ns-void": {
            if (currentTree.tag != (nextTree as typeof currentTree).tag) {
                return {
                    diffs: [
                        {
                            added: nextTree,
                            removed: currentTree,
                            path: pathSoFar,
                        },
                    ],
                };
            } else {
                const facts = diffFacts(currentTree, nextTree, pathSoFar);
                if (facts.diffs.length > 0) {
                    return {
                        diffs: [
                            {
                                added: nextTree,
                                removed: currentTree,
                                path: facts.diffs[0].path,
                            },
                        ],
                    };
                }
                return { diffs: [] };
            }
        }
        case "regular":
        case "ns-regular": {
            const currentTreeAttribute = currentTree.attributes.find(
                (x) => x.kind === "string" && x.key === "id",
            ) as StringAttribute | undefined;
            const currentTreeId = currentTreeAttribute?.value ?? "";

            const nextTreeAttribute = (
                nextTree as typeof currentTree
            ).attributes.find((x) => x.kind === "string" && x.key === "id") as
                | StringAttribute
                | undefined;
            const nextTreeId = nextTreeAttribute?.value ?? "";

            if (
                currentTree.tag !== (nextTree as typeof currentTree).tag ||
                currentTreeId !== nextTreeId
            ) {
                return {
                    diffs: [
                        {
                            path: pathSoFar,
                            added: nextTree,
                            removed: currentTree,
                        },
                    ],
                };
            }

            const facts = diffFacts(currentTree, nextTree, pathSoFar);

            if (facts.diffs.length > 0) {
                return {
                    diffs: [
                        {
                            path: facts.diffs[0].path,
                            added: nextTree,
                            removed: currentTree,
                        },
                    ],
                };
            }

            const diffs = [];

            for (
                let i = 0;
                i < (nextTree as typeof currentTree).children.length;
                i++
            ) {
                const currentChild = currentTree.children[i];
                const nextChild = (nextTree as typeof currentTree).children[i];

                diffs.push(
                    ...diffNode(currentChild, nextChild, `${pathSoFar}/${i}`)
                        .diffs,
                );
            }

            return {
                diffs,
            };
        }
        case "html-string": {
            if (
                currentTree.content === (nextTree as typeof currentTree).content
            ) {
                return { diffs: [] };
            }

            return {
                diffs: [
                    { added: nextTree, removed: currentTree, path: pathSoFar },
                ],
            };
        }
    }
}

export function diff(
    left: HtmlNode<unknown>,
    right: HtmlNode<unknown>,
): Diff<HtmlNode<unknown>> {
    return diffNode(left, right, "");
}
