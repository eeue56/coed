import type { Language } from "../types.ts";
import { filterProgram } from "./filter.ts";
import { generateProgram } from "./generate.ts";
import { parse } from "./parser/index.ts";
import type { JsNode, Program } from "./types.ts";

/**
 * filters, parser, and generator for working with raw JavaScript, or JavaScript nodes
 *
 * @property `filter`: filter `JsNode` by the node themselves
 * @property `generate`: generate JavaScript string from `JsNode`
 * @property `parse`: turn a string into a `JsNode` tree, or string if parsing failed (`Result` type)
 */
export const javascript: Language<Program, JsNode> = {
    filter: (filterRules, program) => filterProgram(program, filterRules),
    parse,
    generate: generateProgram,
    _diff: () => {
        throw new Error("Not implemented yet!");
        return {
            added: [],
            removed: [],
        };
    },
};

export * from "./types.ts";
