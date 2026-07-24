import * as assert from "assert";
import { diff } from "../../../langs/javascript/diff.ts";
import { javascript } from "../../../langs/javascript/index.ts";
import type { JsNode, Program } from "../../../langs/javascript/types.ts";
import type { Result } from "../../../langs/types.ts";

function expectOk<T>(result: Result<T>): T {
    if (result.kind !== "Ok") {
        throw new Error(result.error);
    }

    return result.value;
}

function expectSingleNodeDiffPath(
    left: JsNode,
    right: JsNode,
    path: string,
    message: string,
) {
    assert.deepStrictEqual(
        diff([left], [right]),
        {
            diffs: [
                {
                    path,
                    added: [right],
                    removed: [left],
                },
            ],
        },
        message,
    );
}

export function testDiffEqualProgramsReturnsNoDiffs() {
    const left = expectOk<Program>(javascript.parse("let count = 1;"));
    const right = expectOk<Program>(javascript.parse("let count = 1;"));

    assert.deepStrictEqual(diff(left, right), {
        diffs: [],
    });
}

export function testDiffProgramReportsChangedNode() {
    const left = expectOk<Program>(
        javascript.parse(
            `
let count = 1;
const status = true;
        `.trim(),
        ),
    );
    const right = expectOk<Program>(
        javascript.parse(
            `
let count = 2;
const status = true;
        `.trim(),
        ),
    );

    assert.deepStrictEqual(diff(left, right), {
        diffs: [
            {
                path: "0->value->value",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}

export function testDiffProgramReportsInsertions() {
    const left = expectOk<Program>(javascript.parse("let count = 1;"));
    const right = expectOk<Program>(
        javascript.parse(
            `
let count = 1;
const status = true;
        `.trim(),
        ),
    );

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

export function testDiffProgramReportsRemovals() {
    const left = expectOk<Program>(
        javascript.parse(
            `
let count = 1;
const status = true;
        `.trim(),
        ),
    );
    const right = expectOk<Program>(javascript.parse("let count = 1;"));

    assert.deepStrictEqual(diff(left, right), {
        diffs: [
            {
                path: "1",
                added: [],
                removed: [left[1]],
            },
        ],
    });
}

export function testDiffProgramReportsNestedFunctionBodyPath() {
    const left = expectOk<Program>(
        javascript.parse("function sum(a, b) { let x = a + b; }"),
    );
    const right = expectOk<Program>(
        javascript.parse("function sum(a, b) { let x = a + c; }"),
    );

    assert.deepStrictEqual(diff(left, right), {
        diffs: [
            {
                path: "0->body->0->value->right->name",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}

export function testDiffProgramReportsObjectExpressionPropertyPath() {
    const left = expectOk<Program>(
        javascript.parse("const data = { a: 1, b: 2 };"),
    );
    const right = expectOk<Program>(
        javascript.parse("const data = { a: 1, b: 3 };"),
    );

    assert.deepStrictEqual(diff(left, right), {
        diffs: [
            {
                path: "0->value->properties{b}->value",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}

export function testDiffProgramReportsObjectExpressionPropertyAddition() {
    const left = expectOk<Program>(javascript.parse("const data = { a: 1 };"));
    const right = expectOk<Program>(
        javascript.parse("const data = { a: 1, b: 2 };"),
    );

    assert.deepStrictEqual(diff(left, right), {
        diffs: [
            {
                path: "0->value->properties{b}",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}

export function testDiffProgramReportsFunctionBodyInsertionPath() {
    const left = expectOk<Program>(
        javascript.parse("function sum(a, b) { let x = a + b; }"),
    );
    const right = expectOk<Program>(
        javascript.parse("function sum(a, b) { let x = a + b; const y = 1; }"),
    );

    assert.deepStrictEqual(diff(left, right), {
        diffs: [
            {
                path: "0->body->1",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}

export function testDiffProgramReportsMultiplePaths() {
    const left = expectOk<Program>(
        javascript.parse(
            `
let count = 1;
const data = { a: 1, b: 2 };
function sum(a, b) { let x = a + b; }
        `.trim(),
        ),
    );
    const right = expectOk<Program>(
        javascript.parse(
            `
let count = 2;
const data = { a: 1, b: 3 };
function sum(a, b) { let x = a + c; }
const status = true;
        `.trim(),
        ),
    );

    assert.deepStrictEqual(diff(left, right), {
        diffs: [
            {
                path: "0->value->value",
                added: [right[0]],
                removed: [left[0]],
            },
            {
                path: "1->value->properties{b}->value",
                added: [right[1]],
                removed: [left[1]],
            },
            {
                path: "2->body->0->value->right->name",
                added: [right[2]],
                removed: [left[2]],
            },
            {
                path: "3",
                added: [right[3]],
                removed: [],
            },
        ],
    });
}

export function testDiffCoversEveryExpressionKind() {
    const cases: Array<{
        name: string;
        left: JsNode;
        right: JsNode;
        path: string;
    }> = [
        {
            name: "NumberExpression",
            left: { kind: "NumberExpression", value: 1 },
            right: { kind: "NumberExpression", value: 2 },
            path: "0->value",
        },
        {
            name: "StringExpression",
            left: { kind: "StringExpression", value: "left" },
            right: { kind: "StringExpression", value: "right" },
            path: "0->value",
        },
        {
            name: "StringLiteralExpression",
            left: {
                kind: "StringLiteralExpression",
                values: [{ kind: "StringExpression", value: "left" }],
            },
            right: {
                kind: "StringLiteralExpression",
                values: [{ kind: "StringExpression", value: "right" }],
            },
            path: "0->values->0->value",
        },
        {
            name: "ArrayExpression",
            left: {
                kind: "ArrayExpression",
                elements: [
                    { kind: "NumberExpression", value: 1 },
                    { kind: "NumberExpression", value: 2 },
                ],
            },
            right: {
                kind: "ArrayExpression",
                elements: [
                    { kind: "NumberExpression", value: 1 },
                    { kind: "NumberExpression", value: 3 },
                ],
            },
            path: "0->elements->1->value",
        },
        {
            name: "ObjectExpression",
            left: {
                kind: "ObjectExpression",
                properties: {
                    a: { kind: "NumberExpression", value: 1 },
                    b: { kind: "NumberExpression", value: 2 },
                },
            },
            right: {
                kind: "ObjectExpression",
                properties: {
                    a: { kind: "NumberExpression", value: 1 },
                    b: { kind: "NumberExpression", value: 3 },
                },
            },
            path: "0->properties{b}->value",
        },
        {
            name: "EqualityExpression",
            left: {
                kind: "EqualityExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "b" },
            },
            right: {
                kind: "EqualityExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "c" },
            },
            path: "0->right->name",
        },
        {
            name: "InequalityExpression",
            left: {
                kind: "InequalityExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "b" },
            },
            right: {
                kind: "InequalityExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "c" },
            },
            path: "0->right->name",
        },
        {
            name: "LessThanExpression",
            left: {
                kind: "LessThanExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NumberExpression", value: 1 },
            },
            right: {
                kind: "LessThanExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NumberExpression", value: 2 },
            },
            path: "0->right->value",
        },
        {
            name: "MoreThanExpression",
            left: {
                kind: "MoreThanExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NumberExpression", value: 1 },
            },
            right: {
                kind: "MoreThanExpression",
                left: { kind: "NameLookupExpression", name: "b" },
                right: { kind: "NumberExpression", value: 1 },
            },
            path: "0->left->name",
        },
        {
            name: "LessThanOrEqualExpression",
            left: {
                kind: "LessThanOrEqualExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "b" },
            },
            right: {
                kind: "LessThanOrEqualExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "c" },
            },
            path: "0->right->name",
        },
        {
            name: "MoreThanOrEqualExpression",
            left: {
                kind: "MoreThanOrEqualExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "b" },
            },
            right: {
                kind: "MoreThanOrEqualExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "c" },
            },
            path: "0->right->name",
        },
        {
            name: "IncrementExpression",
            left: { kind: "IncrementExpression", variable: "count" },
            right: { kind: "IncrementExpression", variable: "total" },
            path: "0->variable",
        },
        {
            name: "DecrementExpression",
            left: { kind: "DecrementExpression", variable: "count" },
            right: { kind: "DecrementExpression", variable: "total" },
            path: "0->variable",
        },
        {
            name: "IncreaseExpression",
            left: {
                kind: "IncreaseExpression",
                variable: "count",
                amount: { kind: "NumberExpression", value: 1 },
            },
            right: {
                kind: "IncreaseExpression",
                variable: "count",
                amount: { kind: "NumberExpression", value: 2 },
            },
            path: "0->amount->value",
        },
        {
            name: "DecreaseExpression",
            left: {
                kind: "DecreaseExpression",
                variable: "count",
                amount: { kind: "NumberExpression", value: 1 },
            },
            right: {
                kind: "DecreaseExpression",
                variable: "total",
                amount: { kind: "NumberExpression", value: 1 },
            },
            path: "0->variable",
        },
        {
            name: "NegationExpression",
            left: {
                kind: "NegationExpression",
                value: { kind: "NameLookupExpression", name: "left" },
            },
            right: {
                kind: "NegationExpression",
                value: { kind: "NameLookupExpression", name: "right" },
            },
            path: "0->value->name",
        },
        {
            name: "AssignmentExpression",
            left: {
                kind: "AssignmentExpression",
                target: {
                    kind: "ObjectPropertyExpression",
                    object: { kind: "NameLookupExpression", name: "quiz" },
                    property: {
                        kind: "NameLookupExpression",
                        name: "innerHTML",
                    },
                },
                value: { kind: "NameLookupExpression", name: "left" },
            },
            right: {
                kind: "AssignmentExpression",
                target: {
                    kind: "ObjectPropertyExpression",
                    object: { kind: "NameLookupExpression", name: "quiz" },
                    property: {
                        kind: "NameLookupExpression",
                        name: "textContent",
                    },
                },
                value: { kind: "NameLookupExpression", name: "left" },
            },
            path: "0->target->property->name",
        },
        {
            name: "ArrowFunctionExpression",
            left: {
                kind: "ArrowFunctionExpression",
                isAsync: false,
                parameters: ["x"],
                body: { kind: "NameLookupExpression", name: "x" },
            },
            right: {
                kind: "ArrowFunctionExpression",
                isAsync: false,
                parameters: ["x"],
                body: { kind: "NameLookupExpression", name: "y" },
            },
            path: "0->body->name",
        },
        {
            name: "ThisExpression and SuperExpression",
            left: {
                kind: "ReturnStatement",
                value: { kind: "ThisExpression" },
            },
            right: {
                kind: "ReturnStatement",
                value: { kind: "SuperExpression" },
            },
            path: "0->value",
        },
        {
            name: "AwaitExpression",
            left: {
                kind: "AwaitExpression",
                value: { kind: "NameLookupExpression", name: "left" },
            },
            right: {
                kind: "AwaitExpression",
                value: { kind: "NameLookupExpression", name: "right" },
            },
            path: "0->value->name",
        },
        {
            name: "NewExpression",
            left: {
                kind: "NewExpression",
                callee: { kind: "NameLookupExpression", name: "Date" },
                arguments: [{ kind: "NumberExpression", value: 1 }],
            },
            right: {
                kind: "NewExpression",
                callee: { kind: "NameLookupExpression", name: "Date" },
                arguments: [{ kind: "NumberExpression", value: 2 }],
            },
            path: "0->arguments->0->value",
        },
        {
            name: "ImportExpression",
            left: {
                kind: "ImportExpression",
                source: { kind: "StringExpression", value: "./left" },
            },
            right: {
                kind: "ImportExpression",
                source: { kind: "StringExpression", value: "./right" },
            },
            path: "0->source->value",
        },
        {
            name: "NullExpression and BooleanExpression",
            left: {
                kind: "ReturnStatement",
                value: { kind: "NullExpression" },
            },
            right: {
                kind: "ReturnStatement",
                value: { kind: "BooleanExpression", value: true },
            },
            path: "0->value",
        },
        {
            name: "FunctionCallExpression",
            left: {
                kind: "FunctionCallExpression",
                functionName: "sum",
                arguments: [
                    { kind: "NumberExpression", value: 1 },
                    { kind: "NumberExpression", value: 2 },
                ],
            },
            right: {
                kind: "FunctionCallExpression",
                functionName: "sum",
                arguments: [
                    { kind: "NumberExpression", value: 1 },
                    { kind: "NumberExpression", value: 3 },
                ],
            },
            path: "0->arguments->1->value",
        },
        {
            name: "NameLookupExpression",
            left: { kind: "NameLookupExpression", name: "left" },
            right: { kind: "NameLookupExpression", name: "right" },
            path: "0->name",
        },
        {
            name: "ObjectPropertyExpression",
            left: {
                kind: "ObjectPropertyExpression",
                object: { kind: "NameLookupExpression", name: "obj" },
                property: { kind: "NameLookupExpression", name: "left" },
            },
            right: {
                kind: "ObjectPropertyExpression",
                object: { kind: "NameLookupExpression", name: "obj" },
                property: { kind: "NameLookupExpression", name: "right" },
            },
            path: "0->property->name",
        },
        {
            name: "ObjectMethodCallExpression",
            left: {
                kind: "ObjectMethodCallExpression",
                object: { kind: "NameLookupExpression", name: "obj" },
                method: { kind: "NameLookupExpression", name: "go" },
                arguments: [{ kind: "NumberExpression", value: 1 }],
            },
            right: {
                kind: "ObjectMethodCallExpression",
                object: { kind: "NameLookupExpression", name: "obj" },
                method: { kind: "NameLookupExpression", name: "go" },
                arguments: [{ kind: "NumberExpression", value: 2 }],
            },
            path: "0->arguments->0->value",
        },
        {
            name: "ArrayAccessExpression",
            left: {
                kind: "ArrayAccessExpression",
                array: { kind: "NameLookupExpression", name: "items" },
                index: { kind: "NumberExpression", value: 0 },
            },
            right: {
                kind: "ArrayAccessExpression",
                array: { kind: "NameLookupExpression", name: "items" },
                index: { kind: "NumberExpression", value: 1 },
            },
            path: "0->index->value",
        },
        {
            name: "AdditionExpression",
            left: {
                kind: "AdditionExpression",
                left: { kind: "NumberExpression", value: 1 },
                right: { kind: "NumberExpression", value: 2 },
            },
            right: {
                kind: "AdditionExpression",
                left: { kind: "NumberExpression", value: 1 },
                right: { kind: "NumberExpression", value: 3 },
            },
            path: "0->right->value",
        },
        {
            name: "SubtractionExpression",
            left: {
                kind: "SubtractionExpression",
                left: { kind: "NumberExpression", value: 3 },
                right: { kind: "NumberExpression", value: 2 },
            },
            right: {
                kind: "SubtractionExpression",
                left: { kind: "NumberExpression", value: 3 },
                right: { kind: "NumberExpression", value: 1 },
            },
            path: "0->right->value",
        },
        {
            name: "MultiplicationExpression",
            left: {
                kind: "MultiplicationExpression",
                left: { kind: "NumberExpression", value: 2 },
                right: { kind: "NumberExpression", value: 3 },
            },
            right: {
                kind: "MultiplicationExpression",
                left: { kind: "NumberExpression", value: 2 },
                right: { kind: "NumberExpression", value: 4 },
            },
            path: "0->right->value",
        },
        {
            name: "DivisionExpression",
            left: {
                kind: "DivisionExpression",
                left: { kind: "NumberExpression", value: 8 },
                right: { kind: "NumberExpression", value: 2 },
            },
            right: {
                kind: "DivisionExpression",
                left: { kind: "NumberExpression", value: 8 },
                right: { kind: "NumberExpression", value: 4 },
            },
            path: "0->right->value",
        },
        {
            name: "AndExpression",
            left: {
                kind: "AndExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "b" },
            },
            right: {
                kind: "AndExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "c" },
            },
            path: "0->right->name",
        },
        {
            name: "OrExpression",
            left: {
                kind: "OrExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "b" },
            },
            right: {
                kind: "OrExpression",
                left: { kind: "NameLookupExpression", name: "a" },
                right: { kind: "NameLookupExpression", name: "c" },
            },
            path: "0->right->name",
        },
    ];

    for (const testCase of cases) {
        expectSingleNodeDiffPath(
            testCase.left,
            testCase.right,
            testCase.path,
            testCase.name,
        );
    }
}

export function testDiffCoversEveryStatementKind() {
    const cases: Array<{
        name: string;
        left: JsNode;
        right: JsNode;
        path: string;
    }> = [
        {
            name: "LetStatement",
            left: {
                kind: "LetStatement",
                name: "count",
                value: { kind: "NumberExpression", value: 1 },
            },
            right: {
                kind: "LetStatement",
                name: "count",
                value: { kind: "NumberExpression", value: 2 },
            },
            path: "0->value->value",
        },
        {
            name: "LetListStatement",
            left: { kind: "LetListStatement", names: ["col", "row"] },
            right: { kind: "LetListStatement", names: ["col", "tile"] },
            path: "0->names->1",
        },
        {
            name: "ConstStatement",
            left: {
                kind: "ConstStatement",
                name: "count",
                value: { kind: "NumberExpression", value: 1 },
            },
            right: {
                kind: "ConstStatement",
                name: "count",
                value: { kind: "NumberExpression", value: 2 },
            },
            path: "0->value->value",
        },
        {
            name: "IfStatement",
            left: {
                kind: "IfStatement",
                condition: { kind: "NameLookupExpression", name: "ready" },
                thenBranch: [
                    {
                        kind: "LetStatement",
                        name: "x",
                        value: { kind: "NumberExpression", value: 1 },
                    },
                ],
                elseBranch: [
                    {
                        kind: "ConstStatement",
                        name: "y",
                        value: { kind: "NumberExpression", value: 2 },
                    },
                ],
            },
            right: {
                kind: "IfStatement",
                condition: { kind: "NameLookupExpression", name: "ready" },
                thenBranch: [
                    {
                        kind: "LetStatement",
                        name: "x",
                        value: { kind: "NumberExpression", value: 3 },
                    },
                ],
                elseBranch: [
                    {
                        kind: "ConstStatement",
                        name: "y",
                        value: { kind: "NumberExpression", value: 2 },
                    },
                ],
            },
            path: "0->thenBranch->0->value->value",
        },
        {
            name: "ClassicForLoop",
            left: {
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
            right: {
                kind: "ClassicForLoop",
                init: {
                    kind: "LetStatement",
                    name: "i",
                    value: { kind: "NumberExpression", value: 0 },
                },
                condition: {
                    kind: "LessThanExpression",
                    left: { kind: "NameLookupExpression", name: "i" },
                    right: { kind: "NumberExpression", value: 12 },
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
            path: "0->condition->right->value",
        },
        {
            name: "ForInOfLoop",
            left: {
                kind: "ForInOfLoop",
                init: { declarationKind: "let", name: "x" },
                operator: "in",
                iterable: { kind: "NameLookupExpression", name: "items" },
                body: [
                    {
                        kind: "LetStatement",
                        name: "z",
                        value: { kind: "NameLookupExpression", name: "x" },
                    },
                ],
            },
            right: {
                kind: "ForInOfLoop",
                init: { declarationKind: "let", name: "x" },
                operator: "of",
                iterable: { kind: "NameLookupExpression", name: "items" },
                body: [
                    {
                        kind: "LetStatement",
                        name: "z",
                        value: { kind: "NameLookupExpression", name: "x" },
                    },
                ],
            },
            path: "0->operator",
        },
        {
            name: "DoWhileLoop",
            left: {
                kind: "DoWhileLoop",
                condition: {
                    kind: "LessThanExpression",
                    left: { kind: "NameLookupExpression", name: "x" },
                    right: { kind: "NameLookupExpression", name: "maxCount" },
                },
                body: [
                    {
                        kind: "LetStatement",
                        name: "x",
                        value: { kind: "NameLookupExpression", name: "count" },
                    },
                ],
            },
            right: {
                kind: "DoWhileLoop",
                condition: {
                    kind: "LessThanExpression",
                    left: { kind: "NameLookupExpression", name: "x" },
                    right: { kind: "NameLookupExpression", name: "limit" },
                },
                body: [
                    {
                        kind: "LetStatement",
                        name: "x",
                        value: { kind: "NameLookupExpression", name: "count" },
                    },
                ],
            },
            path: "0->condition->right->name",
        },
        {
            name: "FunctionDeclaration",
            left: {
                kind: "FunctionDeclaration",
                name: "sum",
                isAsync: false,
                parameters: ["a", "b"],
                body: [
                    {
                        kind: "LetStatement",
                        name: "x",
                        value: { kind: "NumberExpression", value: 1 },
                    },
                ],
            },
            right: {
                kind: "FunctionDeclaration",
                name: "sum",
                isAsync: false,
                parameters: ["a", "b"],
                body: [
                    {
                        kind: "LetStatement",
                        name: "x",
                        value: { kind: "NumberExpression", value: 2 },
                    },
                ],
            },
            path: "0->body->0->value->value",
        },
        {
            name: "ClassDeclaration",
            left: {
                kind: "ClassDeclaration",
                name: "FishFrog",
                superClass: { kind: "NameLookupExpression", name: "Animal" },
                body: [],
            },
            right: {
                kind: "ClassDeclaration",
                name: "FishFrog",
                superClass: { kind: "NameLookupExpression", name: "Creature" },
                body: [],
            },
            path: "0->superClass->name",
        },
        {
            name: "ReturnStatement",
            left: {
                kind: "ReturnStatement",
                value: { kind: "NumberExpression", value: 1 },
            },
            right: {
                kind: "ReturnStatement",
                value: { kind: "NumberExpression", value: 2 },
            },
            path: "0->value->value",
        },
        {
            name: "ContinueStatement and BreakStatement",
            left: { kind: "ContinueStatement" },
            right: { kind: "BreakStatement" },
            path: "0",
        },
        {
            name: "ThrowStatement",
            left: {
                kind: "ThrowStatement",
                value: { kind: "NameLookupExpression", name: "left" },
            },
            right: {
                kind: "ThrowStatement",
                value: { kind: "NameLookupExpression", name: "right" },
            },
            path: "0->value->name",
        },
        {
            name: "TryCatchStatement",
            left: {
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
                        value: { kind: "NameLookupExpression", name: "err" },
                    },
                ],
            },
            right: {
                kind: "TryCatchStatement",
                catchParameter: "error",
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
                        value: { kind: "NameLookupExpression", name: "err" },
                    },
                ],
            },
            path: "0->catchParameter",
        },
        {
            name: "ImportStatement",
            left: {
                kind: "ImportStatement",
                defaultImport: "appState",
                namedImports: [],
                source: "./state-left",
            },
            right: {
                kind: "ImportStatement",
                defaultImport: "appState",
                namedImports: [],
                source: "./state-right",
            },
            path: "0->source",
        },
        {
            name: "ExportDeclarationStatement",
            left: {
                kind: "ExportDeclarationStatement",
                declaration: {
                    kind: "ConstStatement",
                    name: "count",
                    value: { kind: "NumberExpression", value: 1 },
                },
            },
            right: {
                kind: "ExportDeclarationStatement",
                declaration: {
                    kind: "ConstStatement",
                    name: "count",
                    value: { kind: "NumberExpression", value: 2 },
                },
            },
            path: "0->declaration->value->value",
        },
        {
            name: "ExportNamedStatement",
            left: { kind: "ExportNamedStatement", names: ["count", "total"] },
            right: { kind: "ExportNamedStatement", names: ["count", "sum"] },
            path: "0->names->1",
        },
        {
            name: "ExportDefaultStatement",
            left: {
                kind: "ExportDefaultStatement",
                value: { kind: "NameLookupExpression", name: "left" },
            },
            right: {
                kind: "ExportDefaultStatement",
                value: { kind: "NameLookupExpression", name: "right" },
            },
            path: "0->value->name",
        },
        {
            name: "LineTerminatedExpression",
            left: {
                kind: "LineTerminatedExpression",
                expressions: [
                    {
                        kind: "FunctionCallExpression",
                        functionName: "sum",
                        arguments: [{ kind: "NumberExpression", value: 1 }],
                    },
                ],
            },
            right: {
                kind: "LineTerminatedExpression",
                expressions: [
                    {
                        kind: "FunctionCallExpression",
                        functionName: "sum",
                        arguments: [{ kind: "NumberExpression", value: 2 }],
                    },
                ],
            },
            path: "0->expressions->0->arguments->0->value",
        },
    ];

    for (const testCase of cases) {
        expectSingleNodeDiffPath(
            testCase.left,
            testCase.right,
            testCase.path,
            testCase.name,
        );
    }
}
