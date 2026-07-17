export type Ok<value> = {
    kind: "Ok";
    value: value;
};

export type Err = {
    kind: "Err";
    error: string;
};

export type Result<value> = Ok<value> | Err;

/**
 * Rules that each of the sub-coed languages use
 *
 * @prop `reason`: explain to the user why the filter rule exists/was applied
 * @prop `shouldKeep`: callback to assess if the item should be filtered
 * @prop `replacer`: optional field with a callback that converts from one AST item to another
 */
export type FilterRule<value> = {
    reason: string;
    shouldKeep: (value: value) => boolean;
    replacer?: (value: value) => value;
};

export type FilterResult<value> = {
    value: value;
    errors: string[];
};

export type Diff<tree> = {
    added: tree[];
    removed: tree[];
};

/**
 * Every language dialect supports three things:
 *
 * @prop `parse`: turn a string into a tree
 * @prop `filter`: remove elements from a tree
 * @prop `generate`: turn the tree into a string
 *
 * language dialects may be extended with additional filters
 *
 * todo: add support for diffing
 */
export type Language<tree, node> = {
    parse: (input: string) => Result<tree>;
    filter: (filterRules: FilterRule<node>[], tree: tree) => FilterResult<tree>;
    generate: (value: tree) => string;
    _diff: (left: tree, right: tree) => Diff<node>;
};

/**
 * If a replacer exists, return that value
 * otherwise return nothing
 *
 * With error reason
 *
 * todo: could possibly clean up all filter apis to use this helper
 */
export function returnReplacerOrEmptyList<a>(
    filterRule: FilterRule<a>,
    value: a,
): FilterResult<a[]> {
    if (filterRule.replacer) {
        return {
            value: [filterRule.replacer(value)],
            errors: [filterRule.reason],
        };
    }
    return { value: [], errors: [filterRule.reason] };
}
