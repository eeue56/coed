import type { FilterResult, FilterRule, Language } from "../types.ts";
import { diff } from "./diff.ts";
import { filter, filterCssDeclarations } from "./filter.ts";
import { generate } from "./generate.ts";
import { parseCssBlocks } from "./parse.ts";
import type { CssBlock, Declaration } from "./types.ts";

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
 * @property `filter`: filter `CssBlock[]` by the block themselves
 * @property `filterDeclarations`: filter the declarations of `CssBlock[]`
 * @property `generate`: generate CSS string from `CssBlock[]`
 * @property `parse`: turn a string into a `CssBlock[]` array of trees, or string if parsing failed (`Result` type)
 */
export const css: CssLanguage = {
    parse: parseCssBlocks,
    filter,
    generate,
    filterDeclarations: filterCssDeclarations,
    _diff: diff,
};

export * from "./types.ts";

export type CssBlockFilterRule = FilterRule<CssBlock>;
export type CssDeclarationFilterRule = FilterRule<Declaration>;
