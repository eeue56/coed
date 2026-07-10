/**
 * Rules that each of the sub-coed languages use
 *
 * reason: explain to the user why the filter rule exists/was applied
 * shouldKeep: callback to assess if the item should be filtered
 * replacer: optional field with a callback that converts from one AST item to another
 */

import type { Result } from "./javascript/types.ts";

export type FilterRule<value> = {
    reason: string;
    shouldKeep: (value: value) => boolean;
    replacer?: (value: value) => value;
};

export type FilterResult<value> = value | string;

export type FilterResults<value> = {
    values: value[];
    errors: string[];
};

export type FinalFilterResult<value> = {
    value: value;
    errors: string[];
};

export type Parser<value> = (input: string) => Result<value>;

export type Language<value, node> = {
    filter: (
        filterRules: FilterRule<node>[],
        tree: value,
    ) => FinalFilterResult<value>;
    generate: (value: value) => string;
    parse: Parser<value>;
};
