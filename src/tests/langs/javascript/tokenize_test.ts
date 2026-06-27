import * as assert from "assert";
import { tokenize } from "../../../langs/javascript/tokenize.ts";

export function testDoubleQuoteString() {
    const tokens = tokenize(`"hello world"`);
    assert.deepStrictEqual(tokens, [
        {
            kind: "StringToken",
            value: `"hello world"`,
            startIndex: 0,
            endIndex: 13,
        },
    ]);
}

export function testSingleQuoteString() {
    const tokens = tokenize(`'hello world'`);
    assert.deepStrictEqual(tokens, [
        {
            kind: "StringToken",
            value: `'hello world'`,
            startIndex: 0,
            endIndex: 13,
        },
    ]);
}

export function testBacktickString() {
    const tokens = tokenize("`hello world`");
    assert.deepStrictEqual(tokens, [
        {
            kind: "StringToken",
            value: "`hello world`",
            startIndex: 0,
            endIndex: 13,
        },
    ]);
}

export function testIntegerNumber() {
    const tokens = tokenize("123");
    assert.deepStrictEqual(tokens, [
        {
            kind: "NumberToken",
            value: 123,
            startIndex: 0,
            endIndex: 3,
        },
    ]);
}

export function testFloatNumber() {
    const tokens = tokenize("12.34");
    assert.deepStrictEqual(tokens, [
        {
            kind: "NumberToken",
            value: 12.34,
            startIndex: 0,
            endIndex: 5,
        },
    ]);
}

export function testArrayLiteral() {
    const tokens = tokenize("[1,2]");
    assert.deepStrictEqual(tokens, [
        {
            kind: "LeftBracketToken",
            startIndex: 0,
            endIndex: 1,
        },
        {
            kind: "NumberToken",
            value: 1,
            startIndex: 1,
            endIndex: 2,
        },
        {
            kind: "CommaToken",
            startIndex: 2,
            endIndex: 3,
        },
        {
            kind: "NumberToken",
            value: 2,
            startIndex: 3,
            endIndex: 4,
        },
        {
            kind: "RightBracketToken",
            startIndex: 4,
            endIndex: 5,
        },
    ]);
}
