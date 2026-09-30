import * as assert from "assert";
import { parse } from "../../../langs/javascript/parser/tsConverter.ts";
import type { Result } from "../../../langs/types.ts";

function expectErr<T>(result: Result<T>): string {
    if (result.kind === "Ok") {
        throw new Error("Expected parsing to fail");
    }
    return result.error;
}

export function testTsParseSyntaxErrorIncludesLocation() {
    const error = expectErr(parse("const value = ;"));
    assert.match(error, /I could not parse this TypeScript/);
    assert.match(
        error,
        /Hint: The TypeScript compiler could not build a syntax tree/,
    );
    assert.match(error, /At line 1, column/);
    assert.match(error, /\^/);
}
