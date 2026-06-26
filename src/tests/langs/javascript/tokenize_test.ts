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

export function testExponentNumberNotSupported() {
    const tokens = tokenize("1.2e3");
    assert.deepStrictEqual(tokens, [
        {
            kind: "NumberToken",
            value: 1.2,
            startIndex: 0,
            endIndex: 3,
        },
        {
            kind: "NumberToken",
            value: 3,
            startIndex: 4,
            endIndex: 5,
        },
    ]);
}
