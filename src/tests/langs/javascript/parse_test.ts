import * as assert from "assert";
import {
    parse,
    parseExpression,
} from "../../../langs/javascript/parser/parse.ts";
import { tokenize } from "../../../langs/javascript/parser/tokenize.ts";
import type { Result } from "../../../langs/types.ts";

function expectOk<T>(result: Result<T>): T {
    if (result.kind !== "Ok") {
        throw new Error(result.error);
    }

    return result.value;
}

export function testParseNumberExpression() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("42"))), {
        kind: "NumberExpression",
        value: 42,
    });
}

export function testParseStringExpression() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize('"hello"'))), {
        kind: "StringExpression",
        value: "hello",
    });
}

export function testParseStringLiteralExpression() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("`hello`"))), {
        kind: "StringLiteralExpression",
        values: [{ kind: "StringExpression", value: "hello" }],
    });
}

export function testParseBooleanAndNullExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("true"))), {
        kind: "BooleanExpression",
        value: true,
    });
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("false"))), {
        kind: "BooleanExpression",
        value: false,
    });
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("null"))), {
        kind: "NullExpression",
    });
}

export function testParseArithmeticWithPrecedence() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("1 + 2 * 3"))), {
        kind: "AdditionExpression",
        left: { kind: "NumberExpression", value: 1 },
        right: {
            kind: "MultiplicationExpression",
            left: { kind: "NumberExpression", value: 2 },
            right: { kind: "NumberExpression", value: 3 },
        },
    });
}

export function testParseComparisonExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("a <= b"))), {
        kind: "LessThanOrEqualExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: { kind: "NameLookupExpression", name: "b" },
    });

    assert.deepStrictEqual(expectOk(parseExpression(tokenize("a !== b"))), {
        kind: "InequalityExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: { kind: "NameLookupExpression", name: "b" },
    });
}

export function testParseLogicalExpressionsWithPrecedence() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("a && b"))), {
        kind: "AndExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: { kind: "NameLookupExpression", name: "b" },
    });

    assert.deepStrictEqual(expectOk(parseExpression(tokenize("a || b"))), {
        kind: "OrExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: { kind: "NameLookupExpression", name: "b" },
    });

    assert.deepStrictEqual(expectOk(parseExpression(tokenize("a || b && c"))), {
        kind: "OrExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: {
            kind: "AndExpression",
            left: { kind: "NameLookupExpression", name: "b" },
            right: { kind: "NameLookupExpression", name: "c" },
        },
    });
}

export function testParseArrayAndObjectExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("[1, 2]"))), {
        kind: "ArrayExpression",
        elements: [
            { kind: "NumberExpression", value: 1 },
            { kind: "NumberExpression", value: 2 },
        ],
    });

    assert.deepStrictEqual(
        expectOk(parseExpression(tokenize('{ a: 1, "b": 2 }'))),
        {
            kind: "ObjectExpression",
            properties: {
                a: { kind: "NumberExpression", value: 1 },
                b: { kind: "NumberExpression", value: 2 },
            },
        },
    );
}

export function testParseFunctionAndMemberExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("sum(1, 2)"))), {
        kind: "FunctionCallExpression",
        functionName: "sum",
        arguments: [
            { kind: "NumberExpression", value: 1 },
            { kind: "NumberExpression", value: 2 },
        ],
    });

    assert.deepStrictEqual(expectOk(parseExpression(tokenize("obj.key"))), {
        kind: "ObjectPropertyExpression",
        object: { kind: "NameLookupExpression", name: "obj" },
        property: { kind: "NameLookupExpression", name: "key" },
    });

    assert.deepStrictEqual(
        expectOk(parseExpression(tokenize("obj.callMe(1)"))),
        {
            kind: "ObjectMethodCallExpression",
            object: { kind: "NameLookupExpression", name: "obj" },
            method: { kind: "NameLookupExpression", name: "callMe" },
            arguments: [{ kind: "NumberExpression", value: 1 }],
        },
    );

    assert.deepStrictEqual(expectOk(parseExpression(tokenize("arr[0]"))), {
        kind: "ArrayAccessExpression",
        array: { kind: "NameLookupExpression", name: "arr" },
        index: { kind: "NumberExpression", value: 0 },
    });

    assert.deepStrictEqual(expectOk(parseExpression(tokenize('obj["key"]'))), {
        kind: "ObjectPropertyExpression",
        object: { kind: "NameLookupExpression", name: "obj" },
        property: {
            kind: "StringLiteralExpression",
            values: [{ kind: "StringExpression", value: "key" }],
        },
    });
}

export function testParseIncrementAndDecrementExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression(tokenize("count++"))), {
        kind: "IncrementExpression",
        variable: "count",
    });

    assert.deepStrictEqual(expectOk(parseExpression(tokenize("count--"))), {
        kind: "DecrementExpression",
        variable: "count",
    });
}

export function testParseExpressionReturnsErrForTrailingTokens() {
    const result = parseExpression(tokenize("1 2"));
    assert.strictEqual(result.kind, "Err");
    if (result.kind === "Err") {
        assert.match(
            result.error,
            /I expected the expression to end here, but found number \(2\)\./,
        );
    }
}

export function testParseLetAndConstStatements() {
    assert.deepStrictEqual(parse("let x = 1; const y = 2;"), {
        kind: "Ok",
        value: [
            {
                kind: "LetStatement",
                name: "x",
                value: { kind: "NumberExpression", value: 1 },
            },
            {
                kind: "ConstStatement",
                name: "y",
                value: { kind: "NumberExpression", value: 2 },
            },
        ],
    });
}

export function testParseIfElseStatements() {
    assert.deepStrictEqual(
        parse("if (x) { let a = 1; } else { const b = 2; }"),
        {
            kind: "Ok",
            value: [
                {
                    kind: "IfStatement",
                    condition: { kind: "NameLookupExpression", name: "x" },
                    thenBranch: [
                        {
                            kind: "LetStatement",
                            name: "a",
                            value: { kind: "NumberExpression", value: 1 },
                        },
                    ],
                    elseBranch: [
                        {
                            kind: "ConstStatement",
                            name: "b",
                            value: { kind: "NumberExpression", value: 2 },
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseForLoop() {
    assert.deepStrictEqual(
        parse("for (let i = 0; i < 10; i++) { let x = i; }"),
        {
            kind: "Ok",
            value: [
                {
                    kind: "ForLoop",
                    init: {
                        kind: "LetStatement",
                        name: "i",
                        value: { kind: "NumberExpression", value: 0 },
                    },
                    condition: {
                        kind: "LessThanExpression",
                        left: { kind: "NameLookupExpression", name: "i" },
                        right: { kind: "NumberExpression", value: 10 },
                    },
                    increment: {
                        kind: "IncrementExpression",
                        variable: "i",
                    },
                    body: [
                        {
                            kind: "LetStatement",
                            name: "x",
                            value: {
                                kind: "NameLookupExpression",
                                name: "i",
                            },
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseFunctionDeclaration() {
    assert.deepStrictEqual(parse("function sum(a, b) { let x = a + b; }"), {
        kind: "Ok",
        value: [
            {
                kind: "FunctionDeclaration",
                name: "sum",
                parameters: ["a", "b"],
                body: [
                    {
                        kind: "LetStatement",
                        name: "x",
                        value: {
                            kind: "AdditionExpression",
                            left: { kind: "NameLookupExpression", name: "a" },
                            right: {
                                kind: "NameLookupExpression",
                                name: "b",
                            },
                        },
                    },
                ],
            },
        ],
    });
}

export function testParseStripsTypeAnnotations() {
    assert.deepStrictEqual(
        parse(
            "let retryCount: number = 3; const isReady: boolean = true; function formatName(name: string, count: number): string { return name; } const scale = (value: number): number => value; let finalName = value as string;",
        ),
        {
            kind: "Ok",
            value: [
                {
                    kind: "LetStatement",
                    name: "retryCount",
                    value: { kind: "NumberExpression", value: 3 },
                },
                {
                    kind: "ConstStatement",
                    name: "isReady",
                    value: { kind: "BooleanExpression", value: true },
                },
                {
                    kind: "FunctionDeclaration",
                    name: "formatName",
                    parameters: ["name", "count"],
                    body: [
                        {
                            kind: "ReturnStatement",
                            value: {
                                kind: "NameLookupExpression",
                                name: "name",
                            },
                        },
                    ],
                },
                {
                    kind: "FunctionDeclaration",
                    name: "scale",
                    parameters: ["value"],
                    body: [
                        {
                            kind: "LetStatement",
                            name: "result",
                            value: {
                                kind: "NameLookupExpression",
                                name: "value",
                            },
                        },
                    ],
                },
                {
                    kind: "LetStatement",
                    name: "finalName",
                    value: {
                        kind: "NameLookupExpression",
                        name: "value",
                    },
                },
            ],
        },
    );
}

export function testParseStripsAsTypeAssertionsInExpressions() {
    assert.deepStrictEqual(
        expectOk(parseExpression(tokenize("(value as string)"))),
        {
            kind: "NameLookupExpression",
            name: "value",
        },
    );
}

export function testParseVarUndefinedAsLetAndNull() {
    assert.deepStrictEqual(parse("var currentUser = undefined;"), {
        kind: "Ok",
        value: [
            {
                kind: "LetStatement",
                name: "currentUser",
                value: { kind: "NullExpression" },
            },
        ],
    });
}

export function testParseWhileAsForLoop() {
    assert.deepStrictEqual(
        parse("while (hasPendingSync) { let syncAttempt = retryCount; }"),
        {
            kind: "Ok",
            value: [
                {
                    kind: "ForLoop",
                    init: {
                        kind: "LetStatement",
                        name: "__while_0",
                        value: { kind: "NumberExpression", value: 0 },
                    },
                    condition: {
                        kind: "NameLookupExpression",
                        name: "hasPendingSync",
                    },
                    increment: {
                        kind: "IncrementExpression",
                        variable: "__while_0",
                    },
                    body: [
                        {
                            kind: "LetStatement",
                            name: "syncAttempt",
                            value: {
                                kind: "NameLookupExpression",
                                name: "retryCount",
                            },
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseWithReturnsErr() {
    const result = parse(
        "with (dashboardState) { const selectedTheme = themeName; }",
    );
    assert.deepStrictEqual(result, {
        kind: "Err",
        error:
            "I got stuck while parsing your JavaScript.\n" +
            "\n" +
            "Problem: The `with` statement is not allowed in this JavaScript subset.\n" +
            "Hint: `with` is infrequently used, deprecated, and usually only valuable in niche style-driven cases. Rewrite it using explicit property access or by assigning the object to a named variable first.\n" +
            "\n" +
            "At line 1, column 1:\n" +
            "with (dashboardState) { const selectedTheme = themeName; }\n" +
            "^",
    });
}

export function testParseArrowFunctionExpressionAsFunctionDeclaration() {
    assert.deepStrictEqual(
        parse(
            "const buildInvoice = (subtotal, taxRate) => subtotal + taxRate;",
        ),
        {
            kind: "Ok",
            value: [
                {
                    kind: "FunctionDeclaration",
                    name: "buildInvoice",
                    parameters: ["subtotal", "taxRate"],
                    body: [
                        {
                            kind: "LetStatement",
                            name: "result",
                            value: {
                                kind: "AdditionExpression",
                                left: {
                                    kind: "NameLookupExpression",
                                    name: "subtotal",
                                },
                                right: {
                                    kind: "NameLookupExpression",
                                    name: "taxRate",
                                },
                            },
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseArrowFunctionBlockBodyAsFunctionDeclaration() {
    assert.deepStrictEqual(
        parse("let createBanner = () => { const bannerState = true; };"),
        {
            kind: "Ok",
            value: [
                {
                    kind: "FunctionDeclaration",
                    name: "createBanner",
                    parameters: [],
                    body: [
                        {
                            kind: "ConstStatement",
                            name: "bannerState",
                            value: {
                                kind: "BooleanExpression",
                                value: true,
                            },
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseReturnStatementWithValue() {
    assert.deepStrictEqual(
        parse("function formatName(name) { return name; }"),
        {
            kind: "Ok",
            value: [
                {
                    kind: "FunctionDeclaration",
                    name: "formatName",
                    parameters: ["name"],
                    body: [
                        {
                            kind: "ReturnStatement",
                            value: {
                                kind: "NameLookupExpression",
                                name: "name",
                            },
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseReturnStatementWithoutValue() {
    assert.deepStrictEqual(parse("function stop() { return; }"), {
        kind: "Ok",
        value: [
            {
                kind: "FunctionDeclaration",
                name: "stop",
                parameters: [],
                body: [
                    {
                        kind: "ReturnStatement",
                        value: null,
                    },
                ],
            },
        ],
    });
}

export function testParseBreakAndContinueStatements() {
    assert.deepStrictEqual(
        parse("for (let i = 0; i < 3; i++) { continue; break; }"),
        {
            kind: "Ok",
            value: [
                {
                    kind: "ForLoop",
                    init: {
                        kind: "LetStatement",
                        name: "i",
                        value: { kind: "NumberExpression", value: 0 },
                    },
                    condition: {
                        kind: "LessThanExpression",
                        left: { kind: "NameLookupExpression", name: "i" },
                        right: { kind: "NumberExpression", value: 3 },
                    },
                    increment: {
                        kind: "IncrementExpression",
                        variable: "i",
                    },
                    body: [
                        {
                            kind: "ContinueStatement",
                        },
                        {
                            kind: "BreakStatement",
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseReturnOutsideFunctionReturnsErr() {
    const result = parse("return total;");
    assert.strictEqual(result.kind, "Err");
}

export function testParseBreakOutsideForLoopReturnsErr() {
    const result = parse("break;");
    assert.strictEqual(result.kind, "Err");
}

export function testParseContinueOutsideForLoopReturnsErr() {
    const result = parse("continue;");
    assert.strictEqual(result.kind, "Err");
}

export function testParseBreakAndContinueInsideFunctionWithoutForLoopReturnErr() {
    const breakResult = parse("function stop() { break; }");
    assert.strictEqual(breakResult.kind, "Err");

    const continueResult = parse("function next() { continue; }");
    assert.strictEqual(continueResult.kind, "Err");
}

export function testParseReturnsErrForMalformedStatements() {
    const result = parse("let = 1; let x = 2;");
    assert.strictEqual(result.kind, "Err");
    if (result.kind === "Err") {
        assert.match(result.error, /I got stuck while parsing your JavaScript/);
    }
}

export function testParseErrorIsSpecificForMissingLetName() {
    const result = parse("let = 1;");
    assert.strictEqual(result.kind, "Err");
    if (result.kind === "Err") {
        assert.match(result.error, /After 'let', I expected a variable name/);
    }
}

export function testParseErrorIsSpecificForMissingIfParen() {
    const result = parse("if x) { let a = 1; }");
    assert.strictEqual(result.kind, "Err");
    if (result.kind === "Err") {
        assert.match(result.error, /After 'if', I expected '\('/);
    }
}

export function testParseErrorIsSpecificForMissingExpressionAfterAssign() {
    const result = parse("let x = ;");
    assert.strictEqual(result.kind, "Err");
    if (result.kind === "Err") {
        assert.match(
            result.error,
            /I expected a value after '=' in this let statement[\s\S]*Suggestion: I think you meant:/,
        );
    }
}

export function testParseErrorIsSpecificForMissingClosingParenInExpression() {
    const result = parse("let x = (1 + 2;");
    assert.strictEqual(result.kind, "Err");
    if (result.kind === "Err") {
        assert.match(
            result.error,
            /I expected '\)' to close this expression[\s\S]*Suggestion: I think you meant: `\(1 \+ 2\)`/,
        );
    }
}

export function testParseErrorIsSpecificForInvalidIndexExpression() {
    const result = parse("let x = arr[];");
    assert.strictEqual(result.kind, "Err");
    if (result.kind === "Err") {
        assert.match(
            result.error,
            /Inside '\[\.\.\.\]', I expected a number or string index[\s\S]*Suggestion: I think you meant: `arr\[0\]`/,
        );
    }
}
