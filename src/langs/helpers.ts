import type { FilterResult, FilterRule } from "./types.ts";

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
