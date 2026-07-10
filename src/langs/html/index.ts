import {
    flatRender,
    type Attribute,
    type Event,
    type HtmlNode,
} from "../../coed.ts";
import type { FilterRule, FinalFilterResult, Language } from "../types.ts";
import { filter, filterAttributes, filterEvents } from "./filter.ts";
import { parse } from "./parse.ts";

type AttributeAndEventFilters<a> = {
    filterEvents: (
        filterRules: FilterRule<Event<a>>[],
        tree: HtmlNode<a>,
    ) => FinalFilterResult<HtmlNode<a>>;

    filterAttributes: (
        filterRules: FilterRule<Attribute>[],
        tree: HtmlNode<a>,
    ) => FinalFilterResult<HtmlNode<a>>;
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
 * `filter`: filter `HtmlNode` by the node themselves
 * `filterAttributes`: filter the attributes of `HtmlNode`s
 * `filterEvents`: filter the events of `HtmlNode`s
 * `generate`: generate HTML string from a `HtmlNode`
 * `parse`: turn a string into a `HtmlNode` tree, or string if parsing failed (`Result` type)
 */
export const html: HtmlLanguage<unknown> = {
    filter: filter,
    parse,
    generate: flatRender,
    filterEvents,
    filterAttributes,
};
