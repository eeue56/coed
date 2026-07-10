import {
    type Attribute,
    type Event,
    type HtmlNode,
    type StringAttribute,
    text,
} from "../../coed.ts";
import type { FilterRule, FinalFilterResult } from "../types.ts";

type HtmlNodesWithAttributes<a> = Exclude<
    HtmlNode<a>,
    { kind: "text" } | { kind: "html-string" }
>;

type StringAttributeWithClass = StringAttribute & { key: "class" };

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
                if (rule.replacer) {
                    return {
                        value: rule.replacer(tree),
                        errors: [rule.reason],
                    };
                }
                return { value: text(""), errors: [rule.reason] };
            }
        }
        return { value: tree, errors: [] };
    }

    const treeWithSplitClasses: HtmlNodesWithAttributes<a> = {
        ...tree,
        attributes: tree.attributes.flatMap((attr) => {
            if (attr.kind === "string" && attr.key === "class") {
                return splitClassAttribute(attr as StringAttributeWithClass);
            }
            return [attr];
        }),
    };

    for (const rule of filterRules) {
        if (!rule.shouldKeep(treeWithSplitClasses)) {
            if (rule.replacer) {
                return {
                    value: rule.replacer(treeWithSplitClasses),
                    errors: [rule.reason],
                };
            }
            return { value: text(""), errors: [rule.reason] };
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

            for (const child of treeWithSplitClasses.children) {
                const result = filter(filterRules, child);
                children.push(result.value);
            }

            const node: HtmlNodesWithAttributes<a> = {
                ...treeWithSplitClasses,
                children,
            };

            return { value: node, errors: [] };
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
 * filters a tree, removing any attributes that don't match.
 */
export function filterAttributes<a>(
    filterRules: FilterRule<Attribute>[],
    tree: HtmlNode<a>,
): FinalFilterResult<HtmlNode<a>> {
    if (tree.kind === "text" || tree.kind === "html-string") {
        return { value: tree, errors: [] };
    }

    const attributes = tree.attributes.flatMap((attribute) => {
        if (attribute.kind === "string" && attribute.key === "class") {
            return splitClassAttribute(
                attribute as StringAttributeWithClass,
            ).filter((attr) =>
                filterRules.every((rule) => rule.shouldKeep(attr)),
            );
        }
        return filterRules.every((rule) => rule.shouldKeep(attribute))
            ? [attribute]
            : [];
    });

    switch (tree.kind) {
        case "void":
        case "ns-void": {
            return { value: { ...tree, attributes }, errors: [] };
        }
        case "regular":
        case "ns-regular": {
            const children = [];

            for (const child of tree.children) {
                const result = filterAttributes(filterRules, child);
                children.push(result.value);
            }

            return {
                value: {
                    ...tree,
                    attributes,
                    children,
                },
                errors: [],
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

    const events = tree.events.flatMap((event) => {
        for (const rule of filterRules) {
            if (!rule.shouldKeep(event)) {
                if (rule.replacer) {
                    return [rule.replacer(event)];
                }
                return [];
            }
        }
        return [event];
    });

    switch (tree.kind) {
        case "void":
        case "ns-void": {
            return { value: { ...tree, events }, errors: [] };
        }
        case "regular":
        case "ns-regular": {
            const children = [];

            for (const child of tree.children) {
                const result = filterEvents(filterRules, child);
                children.push(result.value);
            }

            return {
                value: {
                    ...tree,
                    events,
                    children,
                },
                errors: [],
            };
        }
    }
}
