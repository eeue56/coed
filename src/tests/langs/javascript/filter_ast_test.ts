import * as assert from "assert";
import { filterAsts as filterAstsWithResults } from "../../../langs/javascript/filter.ts";
import type {
    Ast,
    Expression,
    JsNode,
} from "../../../langs/javascript/types.ts";
import type { FilterRule } from "../../../langs/types.ts";

const one: Expression = { kind: "NumberExpression", value: 1 };
const two: Expression = { kind: "NumberExpression", value: 2 };

const keepNonLetNodes: FilterRule<JsNode> = {
    shouldKeep: (node: JsNode): boolean => {
        return node.kind !== "LetStatement";
    },
    reason: "Only let statements not allowed",
};

const removeFunctionAndForLoop: FilterRule<JsNode> = {
    shouldKeep: (node: JsNode) => {
        return node.kind !== "FunctionDeclaration" && node.kind !== "ForLoop";
    },
    reason: "FunctionDeclaration and ForLoop nodes are not allowed",
};

const keepAllNodes: FilterRule<JsNode> = {
    shouldKeep: () => true,
    reason: "Keep all nodes",
};

const removeOnes: FilterRule<JsNode> = {
    shouldKeep: (node: JsNode) => {
        if (node.kind === "NumberExpression" && node.value === 1) {
            return false;
        }
        return true;
    },
    reason: "NumberExpression with value 1 is not allowed",
};

function filterAsts(ast: Ast[], filterRules: FilterRule<JsNode>[]): Ast[] {
    return filterAstsWithResults(ast, filterRules).value;
}

export function testFilterAstsRemovesTopLevelNodes() {
    const input: Ast[] = [
        { kind: "LetStatement", name: "a", value: one },
        { kind: "ConstStatement", name: "b", value: two },
    ];

    assert.deepStrictEqual(filterAsts(input, [keepNonLetNodes]), [
        { kind: "ConstStatement", name: "b", value: two },
    ]);
}

export function testFilterAstsRemovesSubNodes() {
    const input: Ast[] = [
        {
            kind: "LetStatement",
            name: "a",
            value: { kind: "AdditionExpression", left: one, right: two },
        },
        {
            kind: "ConstStatement",
            name: "b",
            value: { kind: "AdditionExpression", left: one, right: two },
        },
    ];

    assert.deepStrictEqual(filterAsts(input, [removeOnes]), []);
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

    assert.deepStrictEqual(filterAsts(input, [keepAllNodes]), [
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
    ]);

    assert.deepStrictEqual(filterAsts(input, [keepNonLetNodes]), []);
    assert.deepStrictEqual(filterAsts(input, [removeOnes]), []);
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

    assert.deepStrictEqual(filterAsts(input, [keepNonLetNodes]), [
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

    assert.deepStrictEqual(filterAsts(input, [keepNonLetNodes]), [
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

    const actual = filterAsts(input, [removeFunctionAndForLoop]);

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

    assert.deepStrictEqual(filterAsts(input, [keepAllNodes]), expected);
}

export function testFilterReturn() {
    const input: Ast[] = [
        {
            kind: "FunctionDeclaration",
            name: "f",
            parameters: ["x"],
            body: [
                { kind: "ConstStatement", name: "e", value: one },
                {
                    kind: "ReturnStatement",
                    value: { kind: "NameLookupExpression", name: "e" },
                },
            ],
        },
    ];

    const removeNameLookups: FilterRule<JsNode> = {
        shouldKeep: (node: JsNode) => {
            if (node.kind === "NameLookupExpression") {
                return false;
            }
            return true;
        },
        reason: "No name lookups",
    };

    assert.deepStrictEqual(filterAsts(input, [keepAllNodes]), input);
    assert.deepStrictEqual(filterAsts(input, [removeOnes]), [
        {
            kind: "FunctionDeclaration",
            name: "f",
            parameters: ["x"],
            body: [
                {
                    kind: "ReturnStatement",
                    value: { kind: "NameLookupExpression", name: "e" },
                },
            ],
        },
    ]);

    assert.deepStrictEqual(filterAsts(input, [removeNameLookups]), [
        {
            kind: "FunctionDeclaration",
            name: "f",
            parameters: ["x"],
            body: [{ kind: "ConstStatement", name: "e", value: one }],
        },
    ]);
}
