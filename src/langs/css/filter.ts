import type { FilterRule, FinalFilterResult } from "../types.ts";
import type { CssBlock, Declaration } from "./types.ts";

/**
 * filters a tree, removing any nodes that don't match. Replaces nodes which don't match with rules
 */
export function filterCssBlocks(
    filterRules: FilterRule<CssBlock>[],
    tree: CssBlock,
): FinalFilterResult<CssBlock> {
    for (const rule of filterRules) {
        if (!rule.shouldKeep(tree)) {
            switch (tree.kind) {
                case "Regular":
                    return { value: { kind: "Never" }, errors: [] };
                case "MediaQuery":
                    const body = tree.body.flatMap((child) => {
                        const result = filterCssBlocks(filterRules, child);
                        return result.value.kind === "Never"
                            ? []
                            : [result.value];
                    });
                    return {
                        value: {
                            kind: "MediaQuery",
                            selector: tree.selector,
                            body: body,
                        },
                        errors: [],
                    };
                case "Never":
                    return { value: { kind: "Never" }, errors: [] };
            }
        }
    }

    if (tree.kind === "MediaQuery") {
        const body = tree.body.flatMap((child) => {
            const result = filterCssBlocks(filterRules, child);
            return result.value.kind === "Never" ? [] : [result.value];
        });
        return {
            value: {
                kind: "MediaQuery",
                selector: tree.selector,
                body: body,
            },
            errors: [],
        };
    }

    return { value: tree, errors: [] };
}

function shouldKeepRule(
    rule: Declaration,
    filterRules: FilterRule<Declaration>[],
): boolean {
    for (const filterRule of filterRules) {
        if (!filterRule.shouldKeep(rule)) {
            return false;
        }
    }
    return true;
}

/**
 * filters out rules (e.g `width: 20px`) from a tree, removing any rules that don't match. Does not remove entire blocks, just the rules within them
 */
export function filterCssRule(
    filterRules: FilterRule<Declaration>[],
    tree: CssBlock,
): FinalFilterResult<CssBlock> {
    switch (tree.kind) {
        case "Regular": {
            const body = [];
            const errors: string[] = [];

            for (const rule of tree.body) {
                if (shouldKeepRule(rule, filterRules)) {
                    body.push(rule);
                }
            }

            return {
                value: {
                    kind: "Regular",
                    selector: tree.selector,
                    body: body,
                },
                errors: errors,
            };
        }
        case "MediaQuery": {
            const body = filterCssRules(filterRules, tree.body);
            return {
                value: {
                    kind: "MediaQuery",
                    selector: tree.selector,
                    body: body.value,
                },
                errors: body.errors,
            };
        }
        case "Never":
            return { value: { kind: "Never" }, errors: [] };
    }
}

export function filterCssRules(
    filterRules: FilterRule<Declaration>[],
    tree: CssBlock[],
): FinalFilterResult<CssBlock[]> {
    const results = [];
    const errors = [];

    for (const block of tree) {
        const result = filterCssRule(filterRules, block);
        if (result.value.kind !== "Never") {
            results.push(result.value);
        }
        errors.push(...result.errors);
    }

    return { value: results, errors };
}

export function filter(
    filterRules: FilterRule<CssBlock>[],
    tree: CssBlock[],
): FinalFilterResult<CssBlock[]> {
    const results = [];
    const errors = [];

    for (const block of tree) {
        const result = filterCssBlocks(filterRules, block);
        results.push(result.value);
        errors.push(...result.errors);
    }

    return { value: results, errors };
}
