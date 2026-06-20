import type { CssBlock, Declaration } from "./types.ts";

/**
 * filters a tree, removing any nodes that don't match. Replaces nodes which don't match with rules
 */
export function filter(
    shouldKeep: (leaf: CssBlock) => boolean,
    tree: CssBlock,
): CssBlock {
    if (shouldKeep(tree)) {
        if (tree.kind === "MediaQuery") {
            return {
                kind: "MediaQuery",
                selector: tree.selector,
                body: tree.body.map((child) => filter(shouldKeep, child)),
            };
        }

        return tree;
    }

    switch (tree.kind) {
        case "Regular":
            return { kind: "Never" };
        case "MediaQuery":
            return {
                kind: "MediaQuery",
                selector: tree.selector,
                body: tree.body.map((child) => filter(shouldKeep, child)),
            };
        case "Never":
            return tree;
    }
}

/**
 * filters out rules (e.g `width: 20px`) from a tree, removing any rules that don't match. Does not remove entire blocks, just the rules within them
 */
export function filterRules(
    shouldKeep: (leaf: Declaration) => boolean,
    tree: CssBlock,
): CssBlock {
    switch (tree.kind) {
        case "Regular":
            return {
                kind: "Regular",
                selector: tree.selector,
                body: tree.body.filter(shouldKeep),
            };
        case "MediaQuery":
            return {
                kind: "MediaQuery",
                selector: tree.selector,
                body: tree.body.map((child) => filterRules(shouldKeep, child)),
            };
        case "Never":
            return tree;
    }
}
