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

export function testParenTokens() {
    const tokens = tokenize("(a)");
    assert.deepStrictEqual(tokens, [
        {
            kind: "LeftParenToken",
            startIndex: 0,
            endIndex: 1,
        },
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 1,
            endIndex: 2,
        },
        {
            kind: "RightParenToken",
            startIndex: 2,
            endIndex: 3,
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
    const tokens = tokenize("const total = 0;");
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
        {
            kind: "SemicolonToken",
            startIndex: 15,
            endIndex: 16,
        },
    ]);
}

export function testSemicolonToken() {
    const tokens = tokenize("let a = 1;");
    assert.deepStrictEqual(tokens, [
        {
            kind: "LetToken",
            startIndex: 0,
            endIndex: 3,
        },
        { kind: "WhitespaceToken", startIndex: 3, endIndex: 4, value: " " },
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 4,
            endIndex: 5,
        },
        { kind: "WhitespaceToken", startIndex: 5, endIndex: 6, value: " " },
        {
            kind: "AssignToken",
            startIndex: 6,
            endIndex: 7,
        },
        { kind: "WhitespaceToken", startIndex: 7, endIndex: 8, value: " " },
        {
            kind: "NumberToken",
            value: 1,
            startIndex: 8,
            endIndex: 9,
        },
        {
            kind: "SemicolonToken",
            startIndex: 9,
            endIndex: 10,
        },
    ]);
}

export function testBraceTokens() {
    const tokens = tokenize("{ const a = 1; }");
    assert.deepStrictEqual(tokens, [
        {
            kind: "LeftBraceToken",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "ConstToken",
            startIndex: 2,
            endIndex: 7,
        },
        { kind: "WhitespaceToken", startIndex: 7, endIndex: 8, value: " " },
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 8,
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
            value: 1,
            startIndex: 12,
            endIndex: 13,
        },
        {
            kind: "SemicolonToken",
            startIndex: 13,
            endIndex: 14,
        },
        { kind: "WhitespaceToken", startIndex: 14, endIndex: 15, value: " " },
        {
            kind: "RightBraceToken",
            startIndex: 15,
            endIndex: 16,
        },
    ]);
}
