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

export function testFor() {
    const tokens = tokenize("for (let x = 0; ;) { const y = 1; }");
    assert.deepStrictEqual(tokens, [
        {
            kind: "ForToken",
            startIndex: 0,
            endIndex: 3,
        },
        { kind: "WhitespaceToken", startIndex: 3, endIndex: 4, value: " " },
        {
            kind: "LeftParenToken",
            startIndex: 4,
            endIndex: 5,
        },
        {
            kind: "LetToken",
            startIndex: 5,
            endIndex: 8,
        },
        { kind: "WhitespaceToken", startIndex: 8, endIndex: 9, value: " " },
        {
            kind: "IdentifierToken",
            name: "x",
            startIndex: 9,
            endIndex: 10,
        },
        {
            kind: "WhitespaceToken",
            startIndex: 10,
            endIndex: 11,
            value: " ",
        },
        {
            kind: "AssignToken",
            startIndex: 11,
            endIndex: 12,
        },
        {
            kind: "WhitespaceToken",
            startIndex: 12,
            endIndex: 13,
            value: " ",
        },
        {
            kind: "NumberToken",
            value: 0,
            startIndex: 13,
            endIndex: 14,
        },
        {
            kind: "SemicolonToken",
            startIndex: 14,
            endIndex: 15,
        },
        {
            kind: "WhitespaceToken",
            startIndex: 15,
            endIndex: 16,
            value: " ",
        },
        {
            kind: "SemicolonToken",
            startIndex: 16,
            endIndex: 17,
        },
        {
            kind: "RightParenToken",
            startIndex: 17,
            endIndex: 18,
        },
        {
            kind: "WhitespaceToken",
            startIndex: 18,
            endIndex: 19,
            value: " ",
        },
        {
            kind: "LeftBraceToken",
            startIndex: 19,
            endIndex: 20,
        },
        {
            kind: "WhitespaceToken",
            startIndex: 20,
            endIndex: 21,
            value: " ",
        },
        {
            kind: "ConstToken",
            startIndex: 21,
            endIndex: 26,
        },
        {
            kind: "WhitespaceToken",
            startIndex: 26,
            endIndex: 27,
            value: " ",
        },
        {
            kind: "IdentifierToken",
            name: "y",
            startIndex: 27,
            endIndex: 28,
        },
        {
            kind: "WhitespaceToken",
            startIndex: 28,
            endIndex: 29,
            value: " ",
        },
        {
            kind: "AssignToken",
            startIndex: 29,
            endIndex: 30,
        },
        {
            kind: "WhitespaceToken",
            startIndex: 30,
            endIndex: 31,
            value: " ",
        },
        {
            kind: "NumberToken",
            value: 1,
            startIndex: 31,
            endIndex: 32,
        },
        {
            kind: "SemicolonToken",
            startIndex: 32,
            endIndex: 33,
        },
        {
            kind: "WhitespaceToken",
            startIndex: 33,
            endIndex: 34,
            value: " ",
        },
        {
            kind: "RightBraceToken",
            startIndex: 34,
            endIndex: 35,
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

export function testIf() {
    const tokens = tokenize("if (a) {}");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IfToken",
            startIndex: 0,
            endIndex: 2,
        },
        { kind: "WhitespaceToken", startIndex: 2, endIndex: 3, value: " " },
        {
            kind: "LeftParenToken",
            startIndex: 3,
            endIndex: 4,
        },
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 4,
            endIndex: 5,
        },
        {
            kind: "RightParenToken",
            startIndex: 5,
            endIndex: 6,
        },
        { kind: "WhitespaceToken", startIndex: 6, endIndex: 7, value: " " },
        {
            kind: "LeftBraceToken",
            startIndex: 7,
            endIndex: 8,
        },
        {
            kind: "RightBraceToken",
            startIndex: 8,
            endIndex: 9,
        },
    ]);
}

export function testEquality() {
    const tokens = tokenize("a === b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "EqualityToken",
            startIndex: 2,
            endIndex: 5,
        },
        { kind: "WhitespaceToken", startIndex: 5, endIndex: 6, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 6,
            endIndex: 7,
        },
    ]);
}

export function testInequality() {
    const tokens = tokenize("a !== b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "InequalityToken",
            startIndex: 2,
            endIndex: 5,
        },
        { kind: "WhitespaceToken", startIndex: 5, endIndex: 6, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 6,
            endIndex: 7,
        },
    ]);
}

export function testLessThan() {
    const tokens = tokenize("a < b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "LessThanToken",
            startIndex: 2,
            endIndex: 3,
        },
        { kind: "WhitespaceToken", startIndex: 3, endIndex: 4, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 4,
            endIndex: 5,
        },
    ]);
}

export function testMoreThan() {
    const tokens = tokenize("a > b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "MoreThanToken",
            startIndex: 2,
            endIndex: 3,
        },
        { kind: "WhitespaceToken", startIndex: 3, endIndex: 4, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 4,
            endIndex: 5,
        },
    ]);
}

export function testNegation() {
    const tokens = tokenize("!a");
    assert.deepStrictEqual(tokens, [
        {
            kind: "NegationToken",
            startIndex: 0,
            endIndex: 1,
        },
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 1,
            endIndex: 2,
        },
    ]);
}

export function testLessThanOrEqual() {
    const tokens = tokenize("a <= b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "LessThanOrEqualToken",
            startIndex: 2,
            endIndex: 4,
        },
        { kind: "WhitespaceToken", startIndex: 4, endIndex: 5, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 5,
            endIndex: 6,
        },
    ]);
}

export function testMoreThanOrEqual() {
    const tokens = tokenize("a >= b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "MoreThanOrEqualToken",
            startIndex: 2,
            endIndex: 4,
        },
        { kind: "WhitespaceToken", startIndex: 4, endIndex: 5, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 5,
            endIndex: 6,
        },
    ]);
}

export function testAnd() {
    const tokens = tokenize("a && b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "AndToken",
            startIndex: 2,
            endIndex: 4,
        },
        { kind: "WhitespaceToken", startIndex: 4, endIndex: 5, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 5,
            endIndex: 6,
        },
    ]);
}

export function testOr() {
    const tokens = tokenize("a || b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "OrToken",
            startIndex: 2,
            endIndex: 4,
        },
        { kind: "WhitespaceToken", startIndex: 4, endIndex: 5, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 5,
            endIndex: 6,
        },
    ]);
}

export function testAddition() {
    const tokens = tokenize("a + b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "AdditionToken",
            startIndex: 2,
            endIndex: 3,
        },
        { kind: "WhitespaceToken", startIndex: 3, endIndex: 4, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 4,
            endIndex: 5,
        },
    ]);
}

export function testSubtraction() {
    const tokens = tokenize("a - b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "SubtractionToken",
            startIndex: 2,
            endIndex: 3,
        },
        { kind: "WhitespaceToken", startIndex: 3, endIndex: 4, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 4,
            endIndex: 5,
        },
    ]);
}

export function testMultiplication() {
    const tokens = tokenize("a * b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "MultiplicationToken",
            startIndex: 2,
            endIndex: 3,
        },
        { kind: "WhitespaceToken", startIndex: 3, endIndex: 4, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 4,
            endIndex: 5,
        },
    ]);
}

export function testDivision() {
    const tokens = tokenize("a / b");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "a",
            startIndex: 0,
            endIndex: 1,
        },
        { kind: "WhitespaceToken", startIndex: 1, endIndex: 2, value: " " },
        {
            kind: "DivisionToken",
            startIndex: 2,
            endIndex: 3,
        },
        { kind: "WhitespaceToken", startIndex: 3, endIndex: 4, value: " " },
        {
            kind: "IdentifierToken",
            name: "b",
            startIndex: 4,
            endIndex: 5,
        },
    ]);
}

export function testIncrement() {
    const tokens = tokenize("count++");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "count",
            startIndex: 0,
            endIndex: 5,
        },
        {
            kind: "IncrementToken",
            startIndex: 5,
            endIndex: 7,
        },
    ]);
}

export function testDecrement() {
    const tokens = tokenize("count--");
    assert.deepStrictEqual(tokens, [
        {
            kind: "IdentifierToken",
            name: "count",
            startIndex: 0,
            endIndex: 5,
        },
        {
            kind: "DecrementToken",
            startIndex: 5,
            endIndex: 7,
        },
    ]);
}
