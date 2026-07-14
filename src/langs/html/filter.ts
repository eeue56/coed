import {
    type Attribute,
    type Event,
    type HtmlNode,
    type StringAttribute,
    text,
} from "../../coed.ts";
import {
    type FilterRule,
    type FinalFilterResult,
    returnReplacerOrEmptyList,
} from "../types.ts";

/**
 * If a replacer existes, return that value
 * otherwise return nothing
 *
 * With error reason
 *
 * todo: could possibly clean up all filter apis to use this helper
 */
function returnReplacerOrEmptyText<a>(
    filterRule: FilterRule<HtmlNode<a>>,
    value: HtmlNode<a>,
): FinalFilterResult<HtmlNode<a>> {
    if (filterRule.replacer) {
        return {
            value: filterRule.replacer(value),
            errors: [filterRule.reason],
        };
    }
    return { value: text(""), errors: [filterRule.reason] };
}

type HtmlNodesWithAttributes<a> = Exclude<
    HtmlNode<a>,
    { kind: "text" } | { kind: "html-string" }
>;

type StringAttributeWithClass = StringAttribute & { key: "class" };

function isStringAttributeWithClass(
    attribute: Attribute,
): attribute is StringAttributeWithClass {
    return attribute.kind === "string" && attribute.key === "class";
}

/**
 * filters a tree, removing any nodes that don't match. Replaces nodes which don't match with empty text nodes.
 */
export function filter<a>(
    filterRules: FilterRule<HtmlNode<a>>[],
    tree: HtmlNode<a>,
): FinalFilterResult<HtmlNode<a>> {
    if (tree.kind === "text" || tree.kind === "html-string") {
        for (const rule of filterRules) {
            if (!rule.shouldKeep(tree)) {
                return returnReplacerOrEmptyText(rule, tree);
            }
        }
        return { value: tree, errors: [] };
    }

    const treeWithSplitClasses: HtmlNodesWithAttributes<a> = {
        ...tree,
        attributes: tree.attributes.flatMap((attr) => {
            if (isStringAttributeWithClass(attr)) {
                return splitClassAttribute(attr);
            }
            return [attr];
        }),
    };

    for (const rule of filterRules) {
        if (!rule.shouldKeep(treeWithSplitClasses)) {
            return returnReplacerOrEmptyText(rule, treeWithSplitClasses);
        }
    }

    switch (treeWithSplitClasses.kind) {
        case "void":
        case "ns-void": {
            return { value: tree, errors: [] };
        }
        case "regular":
        case "ns-regular": {
            const children: HtmlNode<a>[] = [];
            const errors = [];

            for (const child of treeWithSplitClasses.children) {
                const result = filter(filterRules, child);
                children.push(result.value);
                errors.push(...result.errors);
            }

            const node: HtmlNodesWithAttributes<a> = {
                ...treeWithSplitClasses,
                children,
            };

            return { value: node, errors };
        }
    }
}

/**
 * since classnames are joined into one string, we need to split when filtering
 */
function splitClassAttribute(
    attribute: StringAttributeWithClass,
): StringAttributeWithClass[] {
    return attribute.value
        .split(" ")
        .map((className: string) => ({ ...attribute, value: className }));
}

/**
 * filters `class` attributes
 *
 * todo: perf optimization
 */
function filterClassAttributes(
    attributes: StringAttributeWithClass[],
    filterRules: FilterRule<Attribute>[],
): FinalFilterResult<Attribute[]> {
    const filteredAttributes: Attribute[] = [];
    const errors: string[] = [];

    for (const attr of attributes) {
        const result = filterAttribute(attr, filterRules);
        filteredAttributes.push(...result.value);
        errors.push(...result.errors);
    }

    return { value: filteredAttributes, errors };
}

/**
 * todo: add tests for `replacer` and error surfacing
 */
function filterAttribute(
    attribute: Attribute,
    filterRules: FilterRule<Attribute>[],
): FinalFilterResult<Attribute[]> {
    if (isStringAttributeWithClass(attribute)) {
        const splitAttributes = splitClassAttribute(attribute);

        if (splitAttributes.length > 1) {
            return filterClassAttributes(splitAttributes, filterRules);
        }
    }

    for (const rule of filterRules) {
        if (rule.shouldKeep(attribute)) {
            continue;
        }

        return returnReplacerOrEmptyList(rule, attribute);
    }

    return { value: [attribute], errors: [] };
}

/**
 * filters a tree, removing any attributes that don't match.
 */
export function filterAttributes<a>(
    filterRules: FilterRule<Attribute>[],
    tree: HtmlNode<a>,
): FinalFilterResult<HtmlNode<a>> {
    if (tree.kind === "text" || tree.kind === "html-string") {
        return { value: tree, errors: [] };
    }

    const errors: string[] = [];
    const attributes: Attribute[] = [];

    for (const attribute of tree.attributes) {
        const result = filterAttribute(attribute, filterRules);
        attributes.push(...result.value);
        errors.push(...result.errors);
    }

    switch (tree.kind) {
        case "void":
        case "ns-void": {
            return { value: { ...tree, attributes }, errors };
        }
        case "regular":
        case "ns-regular": {
            const children = [];

            for (const child of tree.children) {
                const result = filterAttributes(filterRules, child);
                children.push(result.value);
                errors.push(...result.errors);
            }

            return {
                value: {
                    ...tree,
                    attributes,
                    children,
                },
                errors,
            };
        }
    }
}
/**
 * filters a tree, removing any events that don't match.
 */

export function filterEvents<a>(
    filterRules: FilterRule<Event<a>>[],
    tree: HtmlNode<a>,
): FinalFilterResult<HtmlNode<a>> {
    if (tree.kind === "text" || tree.kind === "html-string") {
        return { value: tree, errors: [] };
    }

    const events: Event<a>[] = [];
    const errors: string[] = [];

    /** todo: refactor this into separate function */
    for (const event of tree.events) {
        let shouldKeep = true;
        for (const rule of filterRules) {
            if (rule.shouldKeep(event)) {
                continue;
            }

            shouldKeep = false;
            if (rule.replacer) {
                events.push(rule.replacer(event));
            }
            errors.push(rule.reason);
        }

        if (shouldKeep) {
            events.push(event);
        }
    }

    switch (tree.kind) {
        case "void":
        case "ns-void": {
            return { value: { ...tree, events }, errors };
        }
        case "regular":
        case "ns-regular": {
            const children = [];

            for (const child of tree.children) {
                const result = filterEvents(filterRules, child);
                children.push(result.value);
                errors.push(...result.errors);
            }

            return {
                value: {
                    ...tree,
                    events,
                    children,
                },
                errors,
            };
        }
    }
}
