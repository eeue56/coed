import * as assert from "assert";
import { diff } from "../../../langs/javascript/diff.ts";
import { javascript } from "../../../langs/javascript/index.ts";
import type { Program } from "../../../langs/javascript/types.ts";
import type { Result } from "../../../langs/types.ts";

function expectOk<T>(result: Result<T>): T {
    if (result.kind !== "Ok") {
        throw new Error(result.error);
    }

    return result.value;
}

export function testDiffEqualProgramsReturnsNoDiffs() {
    const left = expectOk<Program>(javascript.parse("let count = 1;"));
    const right = expectOk<Program>(javascript.parse("let count = 1;"));

    assert.deepStrictEqual(diff(left, right), {
        diffs: [],
    });
}

export function testDiffProgramReportsChangedNode() {
    const left = expectOk<Program>(javascript.parse(
        `
let count = 1;
const status = true;
        `.trim(),
    ));
    const right = expectOk<Program>(javascript.parse(
        `
let count = 2;
const status = true;
        `.trim(),
    ));

    assert.deepStrictEqual(diff(left, right), {
        diffs: [
            {
                path: "0",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}

export function testDiffProgramReportsInsertions() {
    const left = expectOk<Program>(javascript.parse("let count = 1;"));
    const right = expectOk<Program>(javascript.parse(
        `
let count = 1;
const status = true;
        `.trim(),
    ));

    assert.deepStrictEqual(diff(left, right), {
        diffs: [
            {
                path: "1",
                added: [right[1]],
                removed: [],
            },
        ],
    });
}
