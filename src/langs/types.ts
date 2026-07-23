import type { Storage } from "./engine.ts";

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

export type DiffEntry<node> = {
    node: node;
    path: string;
};

export type Index = string | number;

export type DiffNode<tree> = {
    path: string;
    added: tree;
    removed: tree;
};

export type Diff<tree> = {
    diffs: DiffNode<tree>[];
};

/**
 * Every language dialect supports three things:
 *
 * @prop `parse`: turn a string into a tree
 * @prop `filter`: remove elements from a tree
 * @prop `generate`: turn the tree into a string
 * @prop `diff`: diff two trees
 * @prop `storage`: storage engine for the trees (diff aware)
 *
 * language dialects may be extended with additional filters
 *
 * todo: add support for diffing
 */
export type Language<tree, node> = {
    parse: (input: string) => Result<tree>;
    filter: (filterRules: FilterRule<node>[], tree: tree) => FilterResult<tree>;
    generate: (value: tree) => string;
    diff: (left: tree, right: tree) => Diff<tree>;
    storage: () => Storage<tree>;
};
