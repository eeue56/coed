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

export function testLet() {
    const tokens = tokenize("let total = 0");
    assert.deepStrictEqual(tokens, [
        {
            kind: "LetToken",
            startIndex: 0,
            endIndex: 3,
        },
        { kind: "WhitespaceToken", startIndex: 3, endIndex: 4, value: " " },
        {
            kind: "IdentifierToken",
            name: "total",
            startIndex: 4,
            endIndex: 9,
        },
        { kind: "WhitespaceToken", startIndex: 9, endIndex: 10, value: " " },
        {
            kind: "AssignToken",
            startIndex: 10,
            endIndex: 11,
        },
        { kind: "WhitespaceToken", startIndex: 11, endIndex: 12, value: " " },
        {
            kind: "NumberToken",
            value: 0,
            startIndex: 12,
            endIndex: 13,
        },
    ]);
}

export function testConst() {
    const tokens = tokenize("const total = 0");
    assert.deepStrictEqual(tokens, [
        {
            kind: "ConstToken",
            startIndex: 0,
            endIndex: 5,
        },
        { kind: "WhitespaceToken", startIndex: 5, endIndex: 6, value: " " },
        {
            kind: "IdentifierToken",
            name: "total",
            startIndex: 6,
            endIndex: 11,
        },
        { kind: "WhitespaceToken", startIndex: 11, endIndex: 12, value: " " },
        {
            kind: "AssignToken",
            startIndex: 12,
            endIndex: 13,
        },
        { kind: "WhitespaceToken", startIndex: 13, endIndex: 14, value: " " },
        {
            kind: "NumberToken",
            value: 0,
            startIndex: 14,
            endIndex: 15,
        },
    ]);
}
