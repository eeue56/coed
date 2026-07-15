import {
    flatRender,
    type Attribute,
    type Event,
    type HtmlNode,
} from "../../coed.ts";
import type { FilterResult, FilterRule, Language } from "../types.ts";
import { filter, filterAttributes, filterEvents } from "./filter.ts";
import { parse } from "./parse.ts";

type AttributeAndEventFilters<a> = {
    filterEvents: (
        filterRules: FilterRule<Event<a>>[],
        tree: HtmlNode<a>,
    ) => FilterResult<HtmlNode<a>>;

    filterAttributes: (
        filterRules: FilterRule<Attribute>[],
        tree: HtmlNode<a>,
    ) => FilterResult<HtmlNode<a>>;
};

/**
 * Html language includes filters for events and attributes, not just for html nodes
 *
 * so we extend it
 */
export type HtmlLanguage<a> = Language<HtmlNode<a>, HtmlNode<a>> &
    AttributeAndEventFilters<a>;

/**
 * filters, parser, and generator for working with raw html, or html nodes (i.e `coed`'s fundemental structure)
 *
 * @property `filter`: filter `HtmlNode` by the node themselves
 * @property `filterAttributes`: filter the attributes of `HtmlNode`s
 * @property `filterEvents`: filter the events of `HtmlNode`s
 * @property `generate`: generate HTML string from a `HtmlNode`
 * @property `parse`: turn a string into a `HtmlNode` tree, or string if parsing failed (`Result` type)
 */
export const html: HtmlLanguage<unknown> = {
    filter: filter,
    parse,
    generate: flatRender,
    filterEvents,
    filterAttributes,
};
