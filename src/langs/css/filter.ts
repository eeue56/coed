import { returnReplacerOrEmptyList } from "../helpers.ts";
import { type FilterResult, type FilterRule } from "../types.ts";
import type { CssBlock, Declaration } from "./types.ts";

/**
 * filters a tree, removing any nodes that don't match. Replaces nodes which don't match with rules
 *
 * todo: test replacer
 */
function filterCssBlock(
    filterRules: FilterRule<CssBlock>[],
    tree: CssBlock,
): FilterResult<CssBlock[]> {
    for (const rule of filterRules) {
        if (rule.shouldKeep(tree)) {
            continue;
        }

        // a rule failed on the top level block, return nothing
        return returnReplacerOrEmptyList(rule, tree);
    }

    if (tree.kind !== "MediaQuery") {
        return { value: [tree], errors: [] };
    }

    const values: CssBlock[] = [];
    const errors: string[] = [];

    for (const child of tree.body) {
        const result = filterCssBlock(filterRules, child);
        values.push(...result.value);
        errors.push(...result.errors);
    }

    return {
        value: [
            {
                kind: "MediaQuery",
                selector: tree.selector,
                body: values,
            },
        ],
        errors: errors,
    };
}

/**
 * todo: add tests for replacer
 */
function shouldKeepDeclaration(
    rule: Declaration,
    filterRules: FilterRule<Declaration>[],
): FilterResult<Declaration[]> {
    for (const filterRule of filterRules) {
        if (filterRule.shouldKeep(rule)) {
            continue;
        }

        return returnReplacerOrEmptyList(filterRule, rule);
    }

    switch (rule.kind) {
        case "Nested": {
            const errors: string[] = [];
            const values: Declaration[] = [];

            for (const declaration of rule.declarations) {
                const result = shouldKeepDeclaration(declaration, filterRules);

                errors.push(...result.errors);
                values.push(...result.value);
            }

            const returnValue: Declaration = {
                kind: "Nested",
                selector: rule.selector,
                declarations: values,
            };

            return { value: [returnValue], errors };
        }
        case "Property": {
            return { value: [rule], errors: [] };
        }
    }
}

/**
 * filters out rules (e.g `width: 20px`) from a tree, removing any rules that don't match. Does not remove entire blocks, just the rules within them
 */
function filterCssDeclarationsInCssBlock(
    filterRules: FilterRule<Declaration>[],
    tree: CssBlock,
): FilterResult<CssBlock> {
    switch (tree.kind) {
        case "Regular": {
            const body: Declaration[] = [];
            const errors: string[] = [];

            for (const rule of tree.body) {
                const result = shouldKeepDeclaration(rule, filterRules);

                body.push(...result.value);
                errors.push(...result.errors);
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
            const body = filterCssDeclarations(filterRules, tree.body);
            return {
                value: {
                    kind: "MediaQuery",
                    selector: tree.selector,
                    body: body.value,
                },
                errors: body.errors,
            };
        }
    }
}

export function filterCssDeclarations(
    filterRules: FilterRule<Declaration>[],
    tree: CssBlock[],
): FilterResult<CssBlock[]> {
    const results: CssBlock[] = [];
    const errors: string[] = [];

    for (const block of tree) {
        const result = filterCssDeclarationsInCssBlock(filterRules, block);

        results.push(result.value);
        errors.push(...result.errors);
    }

    return { value: results, errors };
}

export function filter(
    filterRules: FilterRule<CssBlock>[],
    tree: CssBlock[],
): FilterResult<CssBlock[]> {
    const results: CssBlock[] = [];
    const errors: string[] = [];

    for (const block of tree) {
        const result = filterCssBlock(filterRules, block);
        results.push(...result.value);
        errors.push(...result.errors);
    }

    return { value: results, errors };
}
