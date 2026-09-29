import { Storage } from "../engine.ts";
import type { Language } from "../types.ts";
import { diff } from "./diff.ts";
import { filterProgram } from "./filter.ts";
import { generateProgram } from "./generate.ts";
import { parse } from "./parser/index.ts";
import { checkPurity } from "./purity.ts";
import type { JsNode, Program, Purity } from "./types.ts";
import { viewDiff } from "./viewDiff.ts";

type JsLanguage = Language<Program, JsNode> & {
    checkPurity: (program: Program) => Purity;
};

/**
 * filters, parser, and generator for working with raw JavaScript, or JavaScript nodes
 *
 * @prop `filter`: filter `JsNode` by the node themselves
 * @prop `generate`: generate JavaScript string from `JsNode`
 * @prop `parse`: turn a string into a `JsNode` tree, or string if parsing failed (`Result` type)
 * @prop `diff`: diff two trees
 * @prop `viewDiff`: visualize a diff
 * @prop `storage`: storage engine for the trees (diff aware)
 * @prop `checkPurity`: returns the purity of the program (`Pure`, `ModifiesInputs`, or `HasSideEffects`)
 */
export const javascript: JsLanguage = {
    filter: (filterRules, program) => filterProgram(program, filterRules),
    parse,
    generate: generateProgram,
    diff,
    viewDiff,
    storage: () => {
        const storage = Storage<Program>();
        storage.registerDiffer(javascript.diff);
        return storage;
    },
    checkPurity,
};

export * from "./types.ts";
