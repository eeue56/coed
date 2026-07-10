import * as assert from "assert";
import { filterAsts } from "../../../langs/javascript/filter.ts";
import type { Ast, Expression } from "../../../langs/javascript/types.ts";

const one: Expression = { kind: "NumberExpression", value: 1 };
const two: Expression = { kind: "NumberExpression", value: 2 };

function keepNonLetNodes(node: Ast): boolean {
    return node.kind !== "LetStatement";
}

export function testFilterAstsRemovesTopLevelNodes() {
    const input: Ast[] = [
        { kind: "LetStatement", name: "a", value: one },
        { kind: "ConstStatement", name: "b", value: two },
    ];

    assert.deepStrictEqual(filterAsts(input, keepNonLetNodes), [
        { kind: "ConstStatement", name: "b", value: two },
    ]);
}

export function testFilterAstsFiltersForLoopBodyRecursively() {
    const input: Ast[] = [
        {
            kind: "ForLoop",
            init: { kind: "LetStatement", name: "i", value: one },
            condition: {
                kind: "LessThanExpression",
                left: { kind: "NameLookupExpression", name: "i" },
                right: { kind: "NumberExpression", value: 10 },
            },
            increment: { kind: "IncrementExpression", variable: "i" },
            body: [
                { kind: "LetStatement", name: "x", value: one },
                { kind: "ConstStatement", name: "y", value: two },
            ],
        },
    ];

    assert.deepStrictEqual(filterAsts(input, keepNonLetNodes), [
        {
            kind: "ForLoop",
            init: { kind: "LetStatement", name: "i", value: one },
            condition: {
                kind: "LessThanExpression",
                left: { kind: "NameLookupExpression", name: "i" },
                right: { kind: "NumberExpression", value: 10 },
            },
            increment: { kind: "IncrementExpression", variable: "i" },
            body: [{ kind: "ConstStatement", name: "y", value: two }],
        },
    ]);
}

export function testFilterAstsFiltersFunctionAndIfBranchesRecursively() {
    const input: Ast[] = [
        {
            kind: "FunctionDeclaration",
            name: "main",
            parameters: [],
            body: [
                {
                    kind: "IfStatement",
                    condition: { kind: "NameLookupExpression", name: "ok" },
                    thenBranch: [
                        { kind: "LetStatement", name: "a", value: one },
                        { kind: "ConstStatement", name: "b", value: two },
                    ],
                    elseBranch: [
                        { kind: "ConstStatement", name: "c", value: one },
                        { kind: "LetStatement", name: "d", value: two },
                    ],
                },
            ],
        },
    ];

    assert.deepStrictEqual(filterAsts(input, keepNonLetNodes), [
        {
            kind: "FunctionDeclaration",
            name: "main",
            parameters: [],
            body: [
                {
                    kind: "IfStatement",
                    condition: { kind: "NameLookupExpression", name: "ok" },
                    thenBranch: [
                        { kind: "ConstStatement", name: "b", value: two },
                    ],
                    elseBranch: [
                        { kind: "ConstStatement", name: "c", value: one },
                    ],
                },
            ],
        },
    ]);
}

export function testFilterAstsHandlesIfStatementWithoutElseBranch() {
    const input: Ast[] = [
        {
            kind: "IfStatement",
            condition: { kind: "BooleanExpression", value: true },
            thenBranch: [
                { kind: "LetStatement", name: "a", value: one },
                { kind: "ConstStatement", name: "b", value: two },
            ],
        },
    ];

    assert.deepStrictEqual(filterAsts(input, keepNonLetNodes), [
        {
            kind: "IfStatement",
            condition: { kind: "BooleanExpression", value: true },
            thenBranch: [{ kind: "ConstStatement", name: "b", value: two }],
            elseBranch: undefined,
        },
    ]);
}

export function testFilterAstsCanRemoveContainerNodes() {
    const input: Ast[] = [
        {
            kind: "FunctionDeclaration",
            name: "outer",
            parameters: [],
            body: [{ kind: "ConstStatement", name: "x", value: one }],
        },
        {
            kind: "ForLoop",
            init: { kind: "LetStatement", name: "i", value: one },
            condition: {
                kind: "LessThanExpression",
                left: { kind: "NameLookupExpression", name: "i" },
                right: { kind: "NumberExpression", value: 2 },
            },
            increment: { kind: "IncrementExpression", variable: "i" },
            body: [{ kind: "ConstStatement", name: "y", value: two }],
        },
        { kind: "ConstStatement", name: "z", value: one },
    ];

    const actual = filterAsts(input, (node) => {
        return node.kind !== "FunctionDeclaration" && node.kind !== "ForLoop";
    });

    assert.deepStrictEqual(actual, [
        { kind: "ConstStatement", name: "z", value: one },
    ]);
}

export function testFilterAstsKeepsAllAstTypesWhenPredicateAlwaysTrue() {
    const input: Ast[] = [
        { kind: "LetStatement", name: "a", value: one },
        { kind: "ConstStatement", name: "b", value: two },
        {
            kind: "IfStatement",
            condition: { kind: "BooleanExpression", value: false },
            thenBranch: [{ kind: "ConstStatement", name: "c", value: one }],
        },
        {
            kind: "ForLoop",
            init: { kind: "LetStatement", name: "i", value: one },
            condition: {
                kind: "LessThanExpression",
                left: { kind: "NameLookupExpression", name: "i" },
                right: { kind: "NumberExpression", value: 3 },
            },
            increment: { kind: "IncrementExpression", variable: "i" },
            body: [{ kind: "ConstStatement", name: "d", value: two }],
        },
        {
            kind: "FunctionDeclaration",
            name: "f",
            parameters: ["x"],
            body: [{ kind: "ConstStatement", name: "e", value: one }],
        },
    ];

    const expected: Ast[] = [
        { kind: "LetStatement", name: "a", value: one },
        { kind: "ConstStatement", name: "b", value: two },
        {
            kind: "IfStatement",
            condition: { kind: "BooleanExpression", value: false },
            thenBranch: [{ kind: "ConstStatement", name: "c", value: one }],
            elseBranch: undefined,
        },
        {
            kind: "ForLoop",
            init: { kind: "LetStatement", name: "i", value: one },
            condition: {
                kind: "LessThanExpression",
                left: { kind: "NameLookupExpression", name: "i" },
                right: { kind: "NumberExpression", value: 3 },
            },
            increment: { kind: "IncrementExpression", variable: "i" },
            body: [{ kind: "ConstStatement", name: "d", value: two }],
        },
        {
            kind: "FunctionDeclaration",
            name: "f",
            parameters: ["x"],
            body: [{ kind: "ConstStatement", name: "e", value: one }],
        },
    ];

    assert.deepStrictEqual(
        filterAsts(input, () => true),
        expected,
    );
}
