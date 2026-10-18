import { Storage } from "../engine.ts";
import type { FilterResult, FilterRule, Language } from "../types.ts";
import { diff } from "./diff.ts";
import { filter, filterCssDeclarations } from "./filter.ts";
import { generate } from "./generate.ts";
import { parseCssBlocks } from "./parse.ts";
import type { CssBlock, Declaration } from "./types.ts";
import { viewDiff } from "./viewDiff.ts";

export * from "./filter.ts";
export * from "./parse.ts";
export * from "./types.ts";

type RuleFilter = {
    filterDeclarations: (
        filterRules: FilterRule<Declaration>[],
        tree: CssBlock[],
    ) => FilterResult<CssBlock[]>;
};

export type CssLanguage = Language<CssBlock[], CssBlock> & RuleFilter;

/**
 * filters, parser, and generator for working with raw CSS, or CSS blocks
 *
 * @prop `filter`: filter `CssBlock[]` by the block themselves
 * @prop `filterDeclarations`: filter the declarations of `CssBlock[]`
 * @prop `generate`: generate CSS string from `CssBlock[]`
 * @prop `parse`: turn a string into a `CssBlock[]` array of trees, or string if parsing failed (`Result` type)
 * @prop `diff`: diff two trees
 * @prop `viewDiff`: visualize a diff
 * @prop `storage`: storage engine for the trees (diff aware)
 */
export const css: CssLanguage = {
    parse: parseCssBlocks,
    filter,
    generate,
    filterDeclarations: filterCssDeclarations,
    diff,
    viewDiff,
    storage: () => {
        const storage = Storage<CssBlock[]>();
        storage.registerDiffer(css.diff);
        return storage;
    },
};

export * from "./types.ts";

export type CssBlockFilterRule = FilterRule<CssBlock>;
export type CssDeclarationFilterRule = FilterRule<Declaration>;
