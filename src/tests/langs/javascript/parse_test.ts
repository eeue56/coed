/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import * as assert from "assert";
import { javascript } from "../../../langs/javascript/index.ts";
import {
    parse,
    parseExpression,
} from "../../../langs/javascript/parser/tsConverter.ts";
import type { Result } from "../../../langs/types.ts";

function expectOk<T>(result: Result<T>): T {
    if (result.kind !== "Ok") {
        throw new Error(result.error);
    }

    return result.value;
}

export function testParseNumberExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("42")), {
        kind: "NumberExpression",
        value: 42,
    });

    assert.deepStrictEqual(expectOk(parseExpression("-1")), {
        kind: "NumberExpression",
        value: -1,
    });
}

export function testParseImportKeywordExpression() {
    assert.deepStrictEqual(parse('import appState from "./state";'), {
        kind: "Ok",
        value: [
            {
                kind: "ImportStatement",
                defaultImport: "appState",
                namedImports: [],
                source: "./state",
            },
        ],
    });
}

export function testParseExportKeywordExpression() {
    assert.deepStrictEqual(parse("export const count = 1;"), {
        kind: "Ok",
        value: [
            {
                kind: "ExportDeclarationStatement",
                declaration: {
                    kind: "ConstStatement",
                    name: "count",
                    value: { kind: "NumberExpression", value: 1 },
                },
            },
        ],
    });
}

export function testParseAsyncKeywordExpression() {
    assert.deepStrictEqual(
        parse("async function loadData() { return result; }"),
        {
            kind: "Ok",
            value: [
                {
                    kind: "FunctionDeclaration",
                    isAsync: true,
                    name: "loadData",
                    parameters: [],
                    body: [
                        {
                            kind: "ReturnStatement",
                            value: {
                                kind: "NameLookupExpression",
                                name: "result",
                            },
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseAwaitKeywordExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("await data")), {
        kind: "AwaitExpression",
        value: {
            kind: "NameLookupExpression",
            name: "data",
        },
    });
}

export function testParseNegationExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("!inBattle")), {
        kind: "NegationExpression",
        value: {
            kind: "NameLookupExpression",
            name: "inBattle",
        },
    });
}

export function testParseThisKeywordExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("this")), {
        kind: "ThisExpression",
    });
}

export function testParseNewKeywordExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("new Date()")), {
        kind: "NewExpression",
        callee: {
            kind: "NameLookupExpression",
            name: "Date",
        },
        arguments: [],
    });
}

export function testParseSuperKeywordExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("super")), {
        kind: "SuperExpression",
    });
}

export function testParseTryKeywordExpression() {
    assert.deepStrictEqual(
        parse("try { const value = 1; } catch (err) { throw err; }"),
        {
            kind: "Ok",
            value: [
                {
                    kind: "TryCatchStatement",
                    catchParameter: "err",
                    tryBlock: [
                        {
                            kind: "ConstStatement",
                            name: "value",
                            value: { kind: "NumberExpression", value: 1 },
                        },
                    ],
                    catchBlock: [
                        {
                            kind: "ThrowStatement",
                            value: {
                                kind: "NameLookupExpression",
                                name: "err",
                            },
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseCatchKeywordExpression() {
    const result = parse(
        "try { const value = 1; } catch (error) { let retryCount = 1; }",
    );
    assert.strictEqual(result.kind, "Ok");
}

export function testParseThrowKeywordExpression() {
    assert.deepStrictEqual(parse("throw reason;"), {
        kind: "Ok",
        value: [
            {
                kind: "ThrowStatement",
                value: {
                    kind: "NameLookupExpression",
                    name: "reason",
                },
            },
        ],
    });
}

export function testParseDefaultKeywordExpression() {
    assert.deepStrictEqual(parse("export default currentTheme;"), {
        kind: "Ok",
        value: [
            {
                kind: "ExportDefaultStatement",
                value: {
                    kind: "NameLookupExpression",
                    name: "currentTheme",
                },
            },
        ],
    });
}

export function testParseStringExpression() {
    assert.deepStrictEqual(expectOk(parseExpression('"hello"')), {
        kind: "StringExpression",
        value: "hello",
    });
}

export function testParseStringLiteralExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("`hello`")), {
        kind: "StringLiteralExpression",
        values: [{ kind: "StringExpression", value: "hello" }],
    });
}

export function testParseBooleanAndNullExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression("true")), {
        kind: "BooleanExpression",
        value: true,
    });
    assert.deepStrictEqual(expectOk(parseExpression("false")), {
        kind: "BooleanExpression",
        value: false,
    });
    assert.deepStrictEqual(expectOk(parseExpression("null")), {
        kind: "NullExpression",
    });
}

export function testParseBasicAddition() {
    assert.deepStrictEqual(expectOk(javascript.parse("1 + 2")), [
        {
            kind: "AdditionExpression",
            left: { kind: "NumberExpression", value: 1 },
            right: { kind: "NumberExpression", value: 2 },
        },
    ]);
}

export function testParseBasicSubtraction() {
    assert.deepStrictEqual(expectOk(javascript.parse("1 - 2")), [
        {
            kind: "SubtractionExpression",
            left: { kind: "NumberExpression", value: 1 },
            right: { kind: "NumberExpression", value: 2 },
        },
    ]);
}

export function testParseArithmeticWithPrecedence() {
    assert.deepStrictEqual(expectOk(javascript.parse("1 + 2 * 3")), [
        {
            kind: "AdditionExpression",
            left: { kind: "NumberExpression", value: 1 },
            right: {
                kind: "MultiplicationExpression",
                left: { kind: "NumberExpression", value: 2 },
                right: { kind: "NumberExpression", value: 3 },
            },
        },
    ]);
}

export function testParseProgramWithStatementAndExpression() {
    assert.deepStrictEqual(
        expectOk(javascript.parse("const x = []; console.log(x);")),
        [
            {
                kind: "ConstStatement",
                name: "x",
                value: { kind: "ArrayExpression", elements: [] },
            },
            {
                kind: "ObjectMethodCallExpression",
                object: { kind: "NameLookupExpression", name: "console" },
                method: { kind: "NameLookupExpression", name: "log" },
                arguments: [{ kind: "NameLookupExpression", name: "x" }],
            },
        ],
    );
}

export function testParseStringExpressionWithEscapedQuote() {
    assert.deepStrictEqual(parse(`const message = 'Enemy\\'s turn';`), {
        kind: "Ok",
        value: [
            {
                kind: "ConstStatement",
                name: "message",
                value: {
                    kind: "StringExpression",
                    value: "Enemy's turn",
                },
            },
        ],
    });
}

export function testParseMinifiedFunctionWithEscapedQuoteString() {
    assert.deepStrictEqual(
        parse(
            `function enemyAttack(){const hit=Math.random()<move.accuracy;if(hit){battleLog.innerHTML+='<p>Enemy used '+move.name+' for '+damage+' damage!</p>';}else{battleLog.innerHTML+='<p>Enemy\\'s '+move.name+' missed!</p>';}}`,
        ).kind,
        "Ok",
    );
}

export function testParseProgramWithMultipleExpressions() {
    assert.deepStrictEqual(expectOk(javascript.parse("alpha(); beta();")), [
        {
            kind: "FunctionCallExpression",
            functionName: "alpha",
            arguments: [],
        },
        {
            kind: "FunctionCallExpression",
            functionName: "beta",
            arguments: [],
        },
    ]);
}

export function testParseComparisonExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression("a <= b")), {
        kind: "LessThanOrEqualExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: { kind: "NameLookupExpression", name: "b" },
    });

    assert.deepStrictEqual(expectOk(parseExpression("a !== b")), {
        kind: "InequalityExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: { kind: "NameLookupExpression", name: "b" },
    });
}

export function testParseLogicalExpressionsWithPrecedence() {
    assert.deepStrictEqual(expectOk(parseExpression("a && b")), {
        kind: "AndExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: { kind: "NameLookupExpression", name: "b" },
    });

    assert.deepStrictEqual(expectOk(parseExpression("a || b")), {
        kind: "OrExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: { kind: "NameLookupExpression", name: "b" },
    });

    assert.deepStrictEqual(expectOk(parseExpression("a || b && c")), {
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
    assert.deepStrictEqual(expectOk(parseExpression("[1, 2]")), {
        kind: "ArrayExpression",
        elements: [
            { kind: "NumberExpression", value: 1 },
            { kind: "NumberExpression", value: 2 },
        ],
    });

    assert.deepStrictEqual(expectOk(parseExpression('{ a: 1, "b": 2 }')), {
        kind: "ObjectExpression",
        properties: {
            a: { kind: "NumberExpression", value: 1 },
            b: { kind: "NumberExpression", value: 2 },
        },
    });
}

export function testParseArrayExpressionWithTrailingComma() {
    assert.deepStrictEqual(expectOk(parseExpression("[1,]")), {
        kind: "ArrayExpression",
        elements: [{ kind: "NumberExpression", value: 1 }],
    });
}

export function testParseFunctionAndMemberExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression("sum(1, 2)")), {
        kind: "FunctionCallExpression",
        functionName: "sum",
        arguments: [
            { kind: "NumberExpression", value: 1 },
            { kind: "NumberExpression", value: 2 },
        ],
    });

    assert.deepStrictEqual(expectOk(parseExpression("obj.key")), {
        kind: "ObjectPropertyExpression",
        object: { kind: "NameLookupExpression", name: "obj" },
        property: { kind: "NameLookupExpression", name: "key" },
    });

    assert.deepStrictEqual(expectOk(parseExpression("obj.callMe(1)")), {
        kind: "ObjectMethodCallExpression",
        object: { kind: "NameLookupExpression", name: "obj" },
        method: { kind: "NameLookupExpression", name: "callMe" },
        arguments: [{ kind: "NumberExpression", value: 1 }],
    });

    assert.deepStrictEqual(expectOk(parseExpression("arr[0]")), {
        kind: "ArrayAccessExpression",
        array: { kind: "NameLookupExpression", name: "arr" },
        index: { kind: "NumberExpression", value: 0 },
    });

    assert.deepStrictEqual(expectOk(parseExpression('obj["key"]')), {
        kind: "ObjectPropertyExpression",
        object: { kind: "NameLookupExpression", name: "obj" },
        property: {
            kind: "StringLiteralExpression",
            values: [{ kind: "StringExpression", value: "key" }],
        },
    });

    assert.deepStrictEqual(
        expectOk(parseExpression("quiz.innerHTML = questions")),
        {
            kind: "AssignmentExpression",
            target: {
                kind: "ObjectPropertyExpression",
                object: { kind: "NameLookupExpression", name: "quiz" },
                property: {
                    kind: "NameLookupExpression",
                    name: "innerHTML",
                },
            },
            value: { kind: "NameLookupExpression", name: "questions" },
        },
    );

    assert.deepStrictEqual(
        expectOk(parseExpression("battleLog.innerHTML += damage")),
        {
            kind: "IncreaseExpression",
            variable: "battleLog.innerHTML",
            amount: { kind: "NameLookupExpression", name: "damage" },
        },
    );
}

export function testParseTopLevelObjectMethodCallWithFunctionCallbacks() {
    assert.deepStrictEqual(
        parse(
            `document.addEventListener('DOMContentLoaded',function(){const moveBtns=document.querySelectorAll('.move-btn');moveBtns.forEach(btn=>{btn.addEventListener('click',function(){const moveIndex=this.getAttribute('data-move');});});});`,
        ).kind,
        "Ok",
    );
}

export function testParseIncrementAndDecrementExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression("count++")), {
        kind: "IncrementExpression",
        variable: "count",
    });

    assert.deepStrictEqual(expectOk(parseExpression("count--")), {
        kind: "DecrementExpression",
        variable: "count",
    });
}

export function testParseArrowFunctionExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression("(x) => x")), {
        kind: "ArrowFunctionExpression",
        isAsync: false,
        parameters: ["x"],
        body: { kind: "NameLookupExpression", name: "x" },
    });

    assert.deepStrictEqual(expectOk(parseExpression("(x) => { return x; }")), {
        kind: "ArrowFunctionExpression",
        isAsync: false,
        parameters: ["x"],
        body: [
            {
                kind: "ReturnStatement",
                value: { kind: "NameLookupExpression", name: "x" },
            },
        ],
    });
}

export function testParseExpressionReturnsErrForTrailingTokens() {
    expectSyntaxError(parseExpression("1 2"), "')' expected.", 4);
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

export function testParseLetDeclarationList() {
    assert.deepStrictEqual(parse("let col, row;"), {
        kind: "Ok",
        value: [
            {
                kind: "LetListStatement",
                names: ["col", "row"],
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

export function testParseElseIfStatements() {
    assert.deepStrictEqual(
        parse(
            "if (a) { let x = 1; } else if (b) { let y = 2; } else { let z = 3; }",
        ),
        {
            kind: "Ok",
            value: [
                {
                    kind: "IfStatement",
                    condition: { kind: "NameLookupExpression", name: "a" },
                    thenBranch: [
                        {
                            kind: "LetStatement",
                            name: "x",
                            value: { kind: "NumberExpression", value: 1 },
                        },
                    ],
                    elseIf: {
                        kind: "IfStatement",
                        condition: {
                            kind: "NameLookupExpression",
                            name: "b",
                        },
                        thenBranch: [
                            {
                                kind: "LetStatement",
                                name: "y",
                                value: {
                                    kind: "NumberExpression",
                                    value: 2,
                                },
                            },
                        ],
                        elseBranch: [
                            {
                                kind: "LetStatement",
                                name: "z",
                                value: {
                                    kind: "NumberExpression",
                                    value: 3,
                                },
                            },
                        ],
                    },
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
                    kind: "ClassicForLoop",
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

export function testParseInOperator() {
    assert.deepStrictEqual(parse('"value" in event.target'), {
        kind: "Ok",
        value: [
            {
                kind: "InExpression",
                left: { kind: "StringExpression", value: "value" },
                right: {
                    kind: "ObjectPropertyExpression",
                    object: { kind: "NameLookupExpression", name: "event" },
                    property: { kind: "NameLookupExpression", name: "target" },
                },
            },
        ],
    });
}

export function testParseForOfLoop() {
    assert.deepStrictEqual(parse("for (const x of y) { let z = x; }"), {
        kind: "Ok",
        value: [
            {
                kind: "ForInOfLoop",
                init: {
                    declarationKind: "const",
                    name: "x",
                },
                operator: "of",
                iterable: {
                    kind: "NameLookupExpression",
                    name: "y",
                },
                body: [
                    {
                        kind: "LetStatement",
                        name: "z",
                        value: {
                            kind: "NameLookupExpression",
                            name: "x",
                        },
                    },
                ],
            },
        ],
    });
}

export function testParseForInLoop() {
    assert.deepStrictEqual(parse("for (let x in y) { let z = x; }"), {
        kind: "Ok",
        value: [
            {
                kind: "ForInOfLoop",
                init: {
                    declarationKind: "let",
                    name: "x",
                },
                operator: "in",
                iterable: {
                    kind: "NameLookupExpression",
                    name: "y",
                },
                body: [
                    {
                        kind: "LetStatement",
                        name: "z",
                        value: {
                            kind: "NameLookupExpression",
                            name: "x",
                        },
                    },
                ],
            },
        ],
    });
}

export function testParseFunctionDeclaration() {
    assert.deepStrictEqual(parse("function sum(a, b) { let x = a + b; }"), {
        kind: "Ok",
        value: [
            {
                kind: "FunctionDeclaration",
                name: "sum",
                isAsync: false,
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

export function testParseClassDeclarationWithMethods() {
    assert.deepStrictEqual(
        parse(
            "class FishFrog { constructor(name) { return; } async sayHi(person) { return person; } }",
        ),
        {
            kind: "Ok",
            value: [
                {
                    kind: "ClassDeclaration",
                    name: "FishFrog",
                    superClass: null,
                    body: [
                        {
                            kind: "FunctionDeclaration",
                            name: "constructor",
                            isAsync: false,
                            parameters: ["name"],
                            body: [
                                {
                                    kind: "ReturnStatement",
                                    value: null,
                                },
                            ],
                        },
                        {
                            kind: "FunctionDeclaration",
                            name: "sayHi",
                            isAsync: true,
                            parameters: ["person"],
                            body: [
                                {
                                    kind: "ReturnStatement",
                                    value: {
                                        kind: "NameLookupExpression",
                                        name: "person",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseClassDeclarationWithSuperClass() {
    assert.deepStrictEqual(parse("class FishFrog extends Animal {}"), {
        kind: "Ok",
        value: [
            {
                kind: "ClassDeclaration",
                name: "FishFrog",
                superClass: {
                    kind: "NameLookupExpression",
                    name: "Animal",
                },
                body: [],
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
                    isAsync: false,
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
                    isAsync: false,
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
    assert.deepStrictEqual(expectOk(parseExpression("(value as string)")), {
        kind: "NameLookupExpression",
        name: "value",
    });
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
                    kind: "ClassicForLoop",
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

export function testParseWhileWithBreak() {
    assert.deepStrictEqual(
        parse(
            "while (hasPendingSync) { let syncAttempt = retryCount; break; }",
        ),
        {
            kind: "Ok",
            value: [
                {
                    kind: "ClassicForLoop",
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
                        {
                            kind: "BreakStatement",
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseWhileWithContinue() {
    assert.deepStrictEqual(
        parse(
            "while (hasPendingSync) { let syncAttempt = retryCount; continue; }",
        ),
        {
            kind: "Ok",
            value: [
                {
                    kind: "ClassicForLoop",
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
                        {
                            kind: "ContinueStatement",
                        },
                    ],
                },
            ],
        },
    );
}

export function testParseDoWhileLoop() {
    assert.deepStrictEqual(
        parse("do { let x = count; } while (x < maxCount);"),
        {
            kind: "Ok",
            value: [
                {
                    kind: "DoWhileLoop",
                    condition: {
                        kind: "LessThanExpression",
                        left: { kind: "NameLookupExpression", name: "x" },
                        right: {
                            kind: "NameLookupExpression",
                            name: "maxCount",
                        },
                    },
                    body: [
                        {
                            kind: "LetStatement",
                            name: "x",
                            value: {
                                kind: "NameLookupExpression",
                                name: "count",
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
                    isAsync: false,
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

export function testParseConstArrayDeclaration() {
    assert.deepStrictEqual(
        parse(
            `const xs = [
    1,
];`,
        ),
        {
            kind: "Ok",
            value: [
                {
                    kind: "ConstStatement",
                    name: "xs",
                    value: {
                        kind: "ArrayExpression",
                        elements: [
                            {
                                kind: "NumberExpression",
                                value: 1,
                            },
                        ],
                    },
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
                    isAsync: false,
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
                    isAsync: false,
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
                isAsync: false,
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
                    kind: "ClassicForLoop",
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

function expectSyntaxError(
    result: Result<unknown>,
    problem: string,
    column: number,
) {
    assert.strictEqual(result.kind, "Err");
    if (result.kind === "Err") {
        assert.match(result.error, /I could not parse this TypeScript/);
        assert.ok(result.error.includes(`Problem: ${problem}`));
        assert.ok(result.error.includes(`At line 1, column ${column}:`));
    }
}

export function testParseReturnsErrForMalformedStatements() {
    expectSyntaxError(parse("let x = ; let y = 2;"), "Expression expected.", 9);
}

export function testParseErrorReportsMissingIfParen() {
    expectSyntaxError(parse("if x) { let a = 1; }"), "'(' expected.", 4);
}

export function testParseErrorReportsMissingExpressionAfterAssign() {
    expectSyntaxError(parse("let x = ;"), "Expression expected.", 9);
}

export function testParseErrorReportsMissingClosingParenInExpression() {
    expectSyntaxError(parse("let x = (1 + 2;"), "')' expected.", 15);
}

export function testParseErrorReportsInvalidIndexExpression() {
    expectSyntaxError(
        parse("let x = arr[];"),
        "An element access expression should take an argument.",
        13,
    );
}
