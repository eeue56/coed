/**
 * Spike test: validates the TypeScript-compiler-based converter
 * (tsConverter.ts) against representative cases from parse_test.ts.
 *
 * Not wired into the real `javascript` language yet — see parse_test.ts
 * for the authoritative behavior of the current hand-rolled parser.
 */
import * as assert from "assert";
import { generateProgram } from "../../../langs/javascript/generate.ts";
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

function expectErr<T>(result: Result<T>): string {
    if (result.kind === "Ok") {
        throw new Error("Expected parsing to fail");
    }
    return result.error;
}

export function testTsParseNumberExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("42")), {
        kind: "NumberExpression",
        value: 42,
    });
    assert.deepStrictEqual(expectOk(parseExpression("-1")), {
        kind: "NumberExpression",
        value: -1,
    });
}

export function testTsParseImportKeywordExpression() {
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

export function testTsParseExportKeywordExpression() {
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

export function testTsParseAsyncKeywordExpression() {
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

export function testTsParseAwaitKeywordExpression() {
    const result = expectOk(
        parse("async function loadData() { return await data; }"),
    );
    const [fn] = result;
    assert.deepStrictEqual(fn, {
        kind: "FunctionDeclaration",
        isAsync: true,
        name: "loadData",
        parameters: [],
        body: [
            {
                kind: "ReturnStatement",
                value: {
                    kind: "AwaitExpression",
                    value: { kind: "NameLookupExpression", name: "data" },
                },
            },
        ],
    });
}

export function testTsParseNegationExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("!inBattle")), {
        kind: "NegationExpression",
        value: { kind: "NameLookupExpression", name: "inBattle" },
    });
}

export function testTsParseThisKeywordExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("this")), {
        kind: "ThisExpression",
    });
}

export function testTsParseNewKeywordExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("new Date()")), {
        kind: "NewExpression",
        callee: { kind: "NameLookupExpression", name: "Date" },
        arguments: [],
    });
}

export function testTsParseTryKeywordExpression() {
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

export function testTsParseThrowKeywordExpression() {
    assert.deepStrictEqual(parse("throw reason;"), {
        kind: "Ok",
        value: [
            {
                kind: "ThrowStatement",
                value: { kind: "NameLookupExpression", name: "reason" },
            },
        ],
    });
}

export function testTsParseDefaultKeywordExpression() {
    assert.deepStrictEqual(parse("export default currentTheme;"), {
        kind: "Ok",
        value: [
            {
                kind: "ExportDefaultStatement",
                value: { kind: "NameLookupExpression", name: "currentTheme" },
            },
        ],
    });
}

export function testTsParseStringLiteralExpression() {
    assert.deepStrictEqual(expectOk(parseExpression("`hello`")), {
        kind: "StringLiteralExpression",
        values: [{ kind: "StringExpression", value: "hello" }],
    });
}

export function testTsParseBasicAddition() {
    assert.deepStrictEqual(expectOk(parse("1 + 2")), [
        {
            kind: "AdditionExpression",
            left: { kind: "NumberExpression", value: 1 },
            right: { kind: "NumberExpression", value: 2 },
        },
    ]);
}

export function testTsParseArithmeticWithPrecedence() {
    assert.deepStrictEqual(expectOk(parse("1 + 2 * 3")), [
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

export function testTsParseProgramWithStatementAndExpression() {
    assert.deepStrictEqual(expectOk(parse("const x = []; console.log(x);")), [
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
    ]);
}

export function testTsParseArrayAndObjectExpressions() {
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

export function testTsParseShorthandObjectProperty() {
    assert.deepStrictEqual(expectOk(parseExpression("{ namespace, a: 1 }")), {
        kind: "ObjectExpression",
        properties: {
            namespace: { kind: "NameLookupExpression", name: "namespace" },
            a: { kind: "NumberExpression", value: 1 },
        },
    });
}

export function testTsParseConditionalSpreadAndNullish() {
    assert.deepStrictEqual(expectOk(parseExpression("a ? b : c")), {
        kind: "ConditionalExpression",
        condition: { kind: "NameLookupExpression", name: "a" },
        whenTrue: { kind: "NameLookupExpression", name: "b" },
        whenFalse: { kind: "NameLookupExpression", name: "c" },
    });
    assert.deepStrictEqual(expectOk(parseExpression("a ?? b")), {
        kind: "NullishCoalescingExpression",
        left: { kind: "NameLookupExpression", name: "a" },
        right: { kind: "NameLookupExpression", name: "b" },
    });
    assert.deepStrictEqual(expectOk(parseExpression("{ ...a, b: 1 }")), {
        kind: "ObjectExpression",
        properties: {
            "...0": {
                kind: "SpreadExpression",
                value: { kind: "NameLookupExpression", name: "a" },
            },
            b: { kind: "NumberExpression", value: 1 },
        },
    });
}

export function testTsParseSwitchAsIfChain() {
    const result = expectOk(
        parse(
            'switch (x) { case "a": case "b": f(); break; case "c": g(); break; default: h(); }',
        ),
    );
    assert.strictEqual(result.length, 1);
    const first = result[0];
    assert.strictEqual(first.kind, "IfStatement");
    if (first.kind !== "IfStatement") return;
    assert.strictEqual(first.condition.kind, "OrExpression");
    assert.strictEqual(first.elseIf?.condition.kind, "EqualityExpression");
    assert.strictEqual(first.elseIf?.elseBranch?.length, 1);
}

export function testTsParseSwitchFallthroughRepeatsFollowingBodies() {
    const [node] = expectOk(
        parse("switch (x) { case 1: f(); case 2: g(); break; }"),
    );
    assert.strictEqual(node.kind, "IfStatement");
    if (node.kind === "IfStatement") {
        assert.strictEqual(node.thenBranch.length, 2);
        assert.strictEqual(node.elseIf?.thenBranch.length, 1);
    }
}

export function testTsParseDestructuringDesugars() {
    const params = expectOk(parse("const f = ([k, v]) => k;"));
    assert.deepStrictEqual(params, [
        {
            kind: "FunctionDeclaration",
            isAsync: false,
            name: "f",
            parameters: ["__param_0"],
            body: [
                {
                    kind: "ConstStatement",
                    name: "k",
                    value: {
                        kind: "ArrayAccessExpression",
                        array: {
                            kind: "NameLookupExpression",
                            name: "__param_0",
                        },
                        index: { kind: "NumberExpression", value: 0 },
                    },
                },
                {
                    kind: "ConstStatement",
                    name: "v",
                    value: {
                        kind: "ArrayAccessExpression",
                        array: {
                            kind: "NameLookupExpression",
                            name: "__param_0",
                        },
                        index: { kind: "NumberExpression", value: 1 },
                    },
                },
                {
                    kind: "LetStatement",
                    name: "result",
                    value: { kind: "NameLookupExpression", name: "k" },
                },
            ],
        },
    ]);

    const declaration = expectOk(parse("const { a } = obj;"));
    assert.strictEqual(declaration.length, 2);
    assert.deepStrictEqual(declaration[1], {
        kind: "ConstStatement",
        name: "a",
        value: {
            kind: "ObjectPropertyExpression",
            object: { kind: "NameLookupExpression", name: "__destructure_0" },
            property: { kind: "NameLookupExpression", name: "a" },
        },
    });
}

export function testTsParseSpreadElements() {
    assert.deepStrictEqual(expectOk(parseExpression("f(...a, 1)")), {
        kind: "FunctionCallExpression",
        functionName: "f",
        arguments: [
            {
                kind: "SpreadExpression",
                value: { kind: "NameLookupExpression", name: "a" },
            },
            { kind: "NumberExpression", value: 1 },
        ],
    });
    assert.deepStrictEqual(expectOk(parseExpression("[...a]")), {
        kind: "ArrayExpression",
        elements: [
            {
                kind: "SpreadExpression",
                value: { kind: "NameLookupExpression", name: "a" },
            },
        ],
    });
}

export function testTsParseReExports() {
    assert.deepStrictEqual(
        parse('export { a, type B } from "./x.ts"; export * from "./y.ts";'),
        {
            kind: "Ok",
            value: [
                {
                    kind: "ExportFromStatement",
                    names: ["a"],
                    source: "./x.ts",
                },
                { kind: "ExportFromStatement", names: null, source: "./y.ts" },
            ],
        },
    );
}

export function testTsParseRegexLiteral() {
    assert.deepStrictEqual(expectOk(parseExpression("/a+/gi.test(s)")), {
        kind: "ObjectMethodCallExpression",
        object: { kind: "RegexExpression", source: "/a+/gi" },
        method: { kind: "NameLookupExpression", name: "test" },
        arguments: [{ kind: "NameLookupExpression", name: "s" }],
    });
}

export function testTsParseAdditionalOperators() {
    const kinds = (source: string) => expectOk(parseExpression(source)).kind;
    assert.strictEqual(kinds("a % b"), "ModuloExpression");
    assert.strictEqual(kinds("a instanceof B"), "InstanceOfExpression");
    assert.strictEqual(kinds("a & b"), "BitwiseExpression");
    assert.strictEqual(kinds("a ** b"), "BitwiseExpression");
    assert.deepStrictEqual(expectOk(parseExpression("-x")), {
        kind: "UnaryExpression",
        operator: "-",
        value: { kind: "NameLookupExpression", name: "x" },
    });
    assert.deepStrictEqual(expectOk(parseExpression("(a ?? b).c")), {
        kind: "ObjectPropertyExpression",
        object: {
            kind: "ParenthesizedExpression",
            value: {
                kind: "NullishCoalescingExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "b" },
            },
        },
        property: { kind: "NameLookupExpression", name: "c" },
    });
}

export function testTsParseTryFinallyAndImportForms() {
    const [tryNode] = expectOk(parse("try { a(); } finally { b(); }"));
    assert.strictEqual(tryNode.kind, "TryFinallyStatement");
    assert.deepStrictEqual(
        expectOk(parse('import * as ns from "m"; import { a as b } from "m";')),
        [
            { kind: "ImportNamespaceStatement", name: "ns", source: "m" },
            {
                kind: "ImportStatement",
                defaultImport: null,
                namedImports: ["a as b"],
                source: "m",
            },
        ],
    );
}

export function testTsParseDestructuringDefaultsRestAndForOf() {
    const [declaration] = expectOk(parse("const [a, ...rest] = xs;"));
    assert.strictEqual(declaration.kind, "ConstStatement");
    const loop = expectOk(parse("for (const [k, v] of xs) { f(k, v); }"))[0];
    assert.strictEqual(loop.kind, "ForInOfLoop");
    if (loop.kind === "ForInOfLoop") {
        assert.strictEqual(loop.body.length, 3);
    }
    expectOk(parse("function f(a = 1, { b } = c) { return a; }"));
    expectOk(parse("const o = { [k]: 1 };"));
}

export function testTsParseLooseEqualityTypeofAndObjectMembers() {
    assert.strictEqual(
        expectOk(parseExpression("a == b")).kind,
        "LooseEqualityExpression",
    );
    assert.strictEqual(
        expectOk(parseExpression("a != b")).kind,
        "LooseInequalityExpression",
    );
    assert.deepStrictEqual(expectOk(parseExpression("typeof x")), {
        kind: "UnaryExpression",
        operator: "typeof",
        value: { kind: "NameLookupExpression", name: "x" },
    });
    assert.deepStrictEqual(expectOk(parseExpression("++i")), {
        kind: "PrefixIncrementExpression",
        variable: "i",
    });
    const object = expectOk(
        parseExpression("{ m(a) { return a; }, get v() { return 1; } }"),
    );
    assert.strictEqual(object.kind, "ObjectExpression");
    if (object.kind === "ObjectExpression") {
        assert.deepStrictEqual(Object.keys(object.properties), ["m", "get v"]);
    }
}

export function testTsGenerateKeepsNeededParentheses() {
    const roundTrip = (source: string) => {
        const program = expectOk(parse(source));
        return generateProgram(program).trim().replace(/;$/, "") + ";";
    };
    assert.strictEqual(roundTrip("(a + b) * c;"), "(a + b) * c;");
    assert.strictEqual(roundTrip("a - (b - c);"), "a - (b - c);");
    assert.strictEqual(roundTrip("(a || b) ?? c;"), "(a || b) ?? c;");
    assert.strictEqual(roundTrip("(a & b) | c;"), "a & b | c;");
    assert.strictEqual(roundTrip("(a | b) & c;"), "(a | b) & c;");
    assert.strictEqual(roundTrip("!(a && b);"), "!(a && b);");
    assert.strictEqual(roundTrip("a && (b || c);"), "a && (b || c);");
}

export function testTsParseGenericCallTargetsAndVoid() {
    const iife = expectOk(parseExpression("(() => 1)()"));
    assert.strictEqual(iife.kind, "CallExpression");
    assert.strictEqual(
        generateProgram([iife]).trim().replace(/;$/, ""),
        "(() => 1)()",
    );
    assert.strictEqual(
        generateProgram([expectOk(parseExpression("(0, f)(a)"))])
            .trim()
            .replace(/;$/, ""),
        "(0, f)(a)",
    );
    assert.deepStrictEqual(expectOk(parseExpression("void 0")), {
        kind: "UnaryExpression",
        operator: "void",
        value: { kind: "NumberExpression", value: 0 },
    });
}

export function testTsParseFunctionAndMemberExpressions() {
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
                property: { kind: "NameLookupExpression", name: "innerHTML" },
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

export function testTsParseIncrementAndDecrementExpressions() {
    assert.deepStrictEqual(expectOk(parseExpression("count++")), {
        kind: "IncrementExpression",
        variable: "count",
    });
    assert.deepStrictEqual(expectOk(parseExpression("count--")), {
        kind: "DecrementExpression",
        variable: "count",
    });
}

export function testTsParseArrowFunctionExpressions() {
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

export function testTsParseLetAndConstStatements() {
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

export function testTsParseLetDeclarationList() {
    assert.deepStrictEqual(parse("let col, row;"), {
        kind: "Ok",
        value: [{ kind: "LetListStatement", names: ["col", "row"] }],
    });
}

export function testTsParseIfElseStatements() {
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

export function testTsParseForLoop() {
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
                    increment: { kind: "IncrementExpression", variable: "i" },
                    body: [
                        {
                            kind: "LetStatement",
                            name: "x",
                            value: { kind: "NameLookupExpression", name: "i" },
                        },
                    ],
                },
            ],
        },
    );
}

export function testTsParseForOfLoop() {
    assert.deepStrictEqual(parse("for (const x of y) { let z = x; }"), {
        kind: "Ok",
        value: [
            {
                kind: "ForInOfLoop",
                init: { declarationKind: "const", name: "x" },
                operator: "of",
                iterable: { kind: "NameLookupExpression", name: "y" },
                body: [
                    {
                        kind: "LetStatement",
                        name: "z",
                        value: { kind: "NameLookupExpression", name: "x" },
                    },
                ],
            },
        ],
    });
}

export function testTsParseFunctionDeclaration() {
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
                            right: { kind: "NameLookupExpression", name: "b" },
                        },
                    },
                ],
            },
        ],
    });
}

export function testTsParseClassDeclarationWithMethods() {
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
                            body: [{ kind: "ReturnStatement", value: null }],
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

export function testTsParseClassDeclarationWithSuperClass() {
    assert.deepStrictEqual(parse("class FishFrog extends Animal {}"), {
        kind: "Ok",
        value: [
            {
                kind: "ClassDeclaration",
                name: "FishFrog",
                superClass: { kind: "NameLookupExpression", name: "Animal" },
                body: [],
            },
        ],
    });
}

export function testTsParseStripsTypeAnnotations() {
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
                    value: { kind: "NameLookupExpression", name: "value" },
                },
            ],
        },
    );
}

export function testTsParseVarUndefinedAsLetAndNull() {
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

export function testTsParseWhileAsForLoop() {
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

export function testTsParseDoWhileLoop() {
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

export function testTsParseWithReturnsErr() {
    const result = parse(
        "with (dashboardState) { const selectedTheme = themeName; }",
    );
    assert.strictEqual(result.kind, "Err");
}

export function testTsParseArrowFunctionExpressionAsFunctionDeclaration() {
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

export function testTsParseReturnOutsideFunctionReturnsErr() {
    assert.strictEqual(parse("return total;").kind, "Err");
}

export function testTsParseBreakOutsideForLoopReturnsErr() {
    assert.strictEqual(parse("break;").kind, "Err");
}

export function testTsParseContinueOutsideForLoopReturnsErr() {
    assert.strictEqual(parse("continue;").kind, "Err");
}

export function testTsParseBreakAndContinueInsideFunctionWithoutForLoopReturnErr() {
    assert.strictEqual(parse("function stop() { break; }").kind, "Err");
    assert.strictEqual(parse("function next() { continue; }").kind, "Err");
}

export function testTsParseTypeDeclarationsAndEnums() {
    const result = expectOk(
        parse(
            'type ApiResponse<T> = { data: T; error?: string }; interface Result<T> extends ApiResponse<T> { ok: boolean; } enum Status { Ready = 1, Done = "done" }',
        ),
    );
    assert.deepStrictEqual(result, [
        {
            kind: "TypeAliasDeclaration",
            name: "ApiResponse",
            typeParameters: "T",
            type: "{ data: T; error?: string }",
        },
        {
            kind: "InterfaceDeclaration",
            name: "Result",
            typeParameters: "T",
            extends: ["ApiResponse<T>"],
            members: ["ok: boolean;"],
        },
        {
            kind: "EnumDeclaration",
            name: "Status",
            isConst: false,
            members: [
                { name: "Ready", initializer: "1" },
                { name: "Done", initializer: '"done"' },
            ],
        },
    ]);

    const generated = generateProgram(result);
    assert.match(
        generated,
        /type ApiResponse<T> = \{ data: T; error\?: string \};/,
    );
    assert.match(generated, /interface Result<T> extends ApiResponse<T>/);
    assert.match(generated, /enum Status \{ Ready = 1, Done = "done" \}/);
}

export function testTsParseDecoratorsAndClassMembers() {
    const result = expectOk(
        parse(
            "@sealed class Service { @trace run(@inject value: string): void {} value!: string; }",
        ),
    );
    assert.deepStrictEqual(result, [
        {
            kind: "DecoratedDeclaration",
            decorators: ["@sealed"],
            declaration: {
                kind: "ClassDeclaration",
                name: "Service",
                superClass: null,
                body: [
                    {
                        kind: "TypeScriptClassMember",
                        source: "@trace run(@inject value: string): void {}",
                    },
                    {
                        kind: "TypeScriptClassMember",
                        source: "value!: string;",
                    },
                ],
            },
        },
    ]);
    assert.match(generateProgram(result), /@sealed\nclass Service/);
    assert.match(
        generateProgram(result),
        /@trace\s+run\(@inject value: string\): void/,
    );
}

export function testTsParseExportedTypeDeclarations() {
    assert.deepStrictEqual(parse("export interface User { id: string; }"), {
        kind: "Ok",
        value: [
            {
                kind: "ExportDeclarationStatement",
                declaration: {
                    kind: "InterfaceDeclaration",
                    name: "User",
                    typeParameters: "",
                    extends: [],
                    members: ["id: string;"],
                },
            },
        ],
    });
}

export function testTsConversionErrorIncludesSourceLocation() {
    const error = expectErr(
        parse("const value = 1;\nfunction* generate() { return 1; }"),
    );
    assert.match(error, /I could not convert this TypeScript/);
    assert.match(error, /At line 2, column 1:/);
    assert.match(error, /\^/);
}

export function testTsOptionalChainingNormalizesToPropertyAccess() {
    assert.deepStrictEqual(expectOk(parseExpression("selected?.value")), {
        kind: "ObjectPropertyExpression",
        object: { kind: "NameLookupExpression", name: "selected" },
        property: { kind: "NameLookupExpression", name: "value" },
    });
}

export function testTsLanguageApiParsesTypeScript() {
    const program = expectOk(
        javascript.parse(
            "interface User { id: string; } const user: User = source!;",
        ),
    );
    assert.deepStrictEqual(program[0], {
        kind: "InterfaceDeclaration",
        name: "User",
        typeParameters: "",
        extends: [],
        members: ["id: string;"],
    });
    assert.deepStrictEqual(program[1], {
        kind: "ConstStatement",
        name: "user",
        value: { kind: "NameLookupExpression", name: "source" },
    });
    assert.match(javascript.generate(program), /interface User/);
}

export function testTsAssertionExpressionsAreErased() {
    assert.deepStrictEqual(expectOk(parseExpression("value! as string")), {
        kind: "NameLookupExpression",
        name: "value",
    });
    assert.deepStrictEqual(expectOk(parseExpression("<string>value")), {
        kind: "NameLookupExpression",
        name: "value",
    });
}

export function testTsDefaultExportedClassAndFunction() {
    assert.deepStrictEqual(parse("export default class Service {}"), {
        kind: "Ok",
        value: [
            {
                kind: "ExportDefaultStatement",
                value: {
                    kind: "ClassDeclaration",
                    name: "Service",
                    superClass: null,
                    body: [],
                },
            },
        ],
    });
    assert.deepStrictEqual(parse("export default function() {}"), {
        kind: "Ok",
        value: [
            {
                kind: "ExportDefaultStatement",
                value: {
                    kind: "FunctionDeclaration",
                    isAsync: false,
                    name: "default",
                    parameters: [],
                    body: [],
                },
            },
        ],
    });
}

export function testTsTypeOnlyImportsAreErased() {
    assert.deepStrictEqual(
        parse('import type { User } from "./types"; const value = 1;'),
        {
            kind: "Ok",
            value: [
                {
                    kind: "ConstStatement",
                    name: "value",
                    value: { kind: "NumberExpression", value: 1 },
                },
            ],
        },
    );
}

export function testTsxParserUsesFilenameGrammar() {
    const result = expectOk(
        javascript.parseTypeScript(
            "const identity = <T,>(value: T): T => value;",
            "identity.tsx",
        ),
    );
    assert.deepStrictEqual(result, [
        {
            kind: "FunctionDeclaration",
            isAsync: false,
            name: "identity",
            parameters: ["value"],
            body: [
                {
                    kind: "LetStatement",
                    name: "result",
                    value: { kind: "NameLookupExpression", name: "value" },
                },
            ],
        },
    ]);
}
