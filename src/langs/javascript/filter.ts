import type { FilterResults, FilterRule, FinalFilterResult } from "../types.ts";
import {
    isAst,
    isExpression,
    type Ast,
    type Expression,
    type JsNode,
    type Program,
} from "./types.ts";

/**
 *
 * @param ast ast to filter
 * @param filterRules rules to use
 * @returns the ast if it should be kept, otherwise the reason why it was removed
 */
function filterAst(
    ast: Ast,
    filterRules: FilterRule<JsNode>[],
): FilterResults<Ast> {
    for (const filterRule of filterRules) {
        if (!filterRule.shouldKeep(ast)) {
            return { values: [], errors: [filterRule.reason] };
        }
    }

    switch (ast.kind) {
        case "ConstStatement": {
            return { values: [ast], errors: [] };
        }
        case "ForLoop": {
            const body = filterAsts(ast.body, filterRules);
            return {
                values: [{ ...ast, body: body.values }],
                errors: body.errors,
            };
        }
        case "FunctionDeclaration": {
            const body = filterAsts(ast.body, filterRules);
            return {
                values: [{ ...ast, body: body.values }],
                errors: body.errors,
            };
        }
        case "IfStatement": {
            const thenBranch = filterAsts(ast.thenBranch, filterRules);
            const elseBranch = ast.elseBranch
                ? filterAsts(ast.elseBranch, filterRules)
                : undefined;
            const ifs = {
                ...ast,
                thenBranch: thenBranch.values,
                elseBranch: elseBranch?.values,
            };
            return {
                values: [ifs],
                errors: [...thenBranch.errors, ...(elseBranch?.errors || [])],
            };
        }
        case "LetStatement": {
            return { values: [ast], errors: [] };
        }
        case "ReturnStatement": {
            return { values: [ast], errors: [] };
        }
        case "ContinueStatement": {
            return { values: [ast], errors: [] };
        }
        case "BreakStatement": {
            return { values: [ast], errors: [] };
        }
    }
}

/**
 * failing branches will be completely removed
 */
export function filterAsts(
    ast: Ast[],
    filterRules: FilterRule<JsNode>[],
): FilterResults<Ast> {
    const toReturn = [];
    const errors = [];

    for (const node of ast) {
        const filtered = filterAst(node, filterRules);

        toReturn.push(...filtered.values);
        errors.push(...filtered.errors);
    }
    return { values: toReturn, errors };
}

/**
 * any child branch or leaf that fails `shouldKeep` will cause the entire branch to be removed
 */
export function filterExpression(
    expression: Expression,
    filterRules: FilterRule<JsNode>[],
): FilterResults<Expression> {
    for (const rule of filterRules) {
        if (!rule.shouldKeep(expression)) {
            return { errors: [rule.reason], values: [] };
        }
    }

    switch (expression.kind) {
        case "NumberExpression": {
            return { values: [expression], errors: [] };
        }
        case "StringExpression": {
            return { values: [expression], errors: [] };
        }
        case "ArrayExpression": {
            const elements: Expression[] = [];
            const errors: string[] = [];

            for (const element of expression.elements) {
                const filtered = filterExpression(element, filterRules);
                elements.push(...filtered.values);
                errors.push(...filtered.errors);
            }

            return { values: [{ ...expression, elements }], errors };
        }
        case "ObjectExpression": {
            const properties: [string, Expression][] = [];
            const errors: string[] = [];

            Object.entries(expression.properties).forEach(([key, value]) => {
                const filtered = filterExpression(value, filterRules);
                if (filtered.values.length > 0) {
                    properties.push([key, filtered.values[0]]);
                }
                errors.push(...filtered.errors);
            });

            return {
                values: [
                    {
                        ...expression,
                        properties: Object.fromEntries(properties),
                    },
                ],
                errors,
            };
        }
        case "EqualityExpression":
        case "InequalityExpression":
        case "LessThanExpression":
        case "MoreThanExpression":
        case "LessThanOrEqualExpression":
        case "MoreThanOrEqualExpression": {
            const left = filterExpression(expression.left, filterRules);
            const right = filterExpression(expression.right, filterRules);
            if (left.values.length === 0 || right.values.length === 0) {
                return {
                    values: [],
                    errors: [...left.errors, ...right.errors],
                };
            }
            const exp = {
                ...expression,
                left: left.values[0],
                right: right.values[0],
            };
            return { values: [exp], errors: [...left.errors, ...right.errors] };
        }
        case "IncrementExpression":
        case "DecrementExpression": {
            return { values: [expression], errors: [] };
        }
        case "IncreaseExpression":
        case "DecreaseExpression": {
            const amount = filterExpression(expression.amount, filterRules);
            if (amount.values.length === 0) {
                return { values: [], errors: [...amount.errors] };
            }
            return {
                values: [{ ...expression, amount: amount.values[0] }],
                errors: [...amount.errors],
            };
        }
        case "NullExpression": {
            return { values: [expression], errors: [] };
        }
        case "BooleanExpression": {
            return { values: [expression], errors: [] };
        }
        case "StringLiteralExpression": {
            const values = [];
            const errors = [];

            for (const value of expression.values) {
                const filtered = filterExpression(value, filterRules);
                if (filtered.values.length === 0) {
                    return { values: [], errors: [...filtered.errors] };
                }
                values.push(filtered.values[0]);
                errors.push(...filtered.errors);
            }
            return {
                values: [{ ...expression, values }],
                errors,
            };
        }
        case "FunctionCallExpression": {
            const args = [];
            const errors = [];
            for (const arg of expression.arguments) {
                const filtered = filterExpression(arg, filterRules);
                if (filtered.values.length === 0) {
                    return { values: [], errors: [...filtered.errors] };
                }
                args.push(filtered.values[0]);
                errors.push(...filtered.errors);
            }
            return { values: [{ ...expression, arguments: args }], errors };
        }
        case "NameLookupExpression": {
            return { values: [expression], errors: [] };
        }
        case "ObjectPropertyExpression": {
            const object = filterExpression(expression.object, filterRules);
            const property = filterExpression(expression.property, filterRules);
            if (object.values.length === 0 || property.values.length === 0) {
                return {
                    values: [],
                    errors: [...object.errors, ...property.errors],
                };
            }
            return {
                values: [
                    {
                        ...expression,
                        object: object.values[0] as typeof expression.object,
                        property: property
                            .values[0] as typeof expression.property,
                    },
                ],
                errors: [...object.errors, ...property.errors],
            };
        }
        case "ObjectMethodCallExpression": {
            const object = filterExpression(expression.object, filterRules);
            const method = filterExpression(expression.method, filterRules);
            if (object.values.length === 0 || method.values.length === 0) {
                return {
                    values: [],
                    errors: [...object.errors, ...method.errors],
                };
            }

            const args = [];

            for (const arg of expression.arguments) {
                const filtered = filterExpression(arg, filterRules);
                if (filtered.values.length === 0) {
                    return { values: [], errors: [...filtered.errors] };
                }
                args.push(filtered.values[0]);
            }

            return {
                values: [
                    {
                        ...expression,
                        object: object.values[0] as typeof expression.object,
                        method: method.values[0] as typeof expression.method,
                        arguments: args,
                    },
                ],
                errors: [...object.errors, ...method.errors],
            };
        }
        case "ArrayAccessExpression": {
            const array = filterExpression(expression.array, filterRules);
            const index = filterExpression(expression.index, filterRules);
            if (array.values.length === 0 || index.values.length === 0) {
                return {
                    values: [],
                    errors: [...array.errors, ...index.errors],
                };
            }
            return {
                values: [
                    {
                        ...expression,
                        array: array.values[0] as typeof expression.array,
                        index: index.values[0] as typeof expression.index,
                    },
                ],
                errors: [...array.errors, ...index.errors],
            };
        }
        case "AdditionExpression":
        case "SubtractionExpression":
        case "MultiplicationExpression":
        case "DivisionExpression":
        case "AndExpression":
        case "OrExpression": {
            const left = filterExpression(expression.left, filterRules);
            const right = filterExpression(expression.right, filterRules);
            if (left.values.length === 0 || right.values.length === 0) {
                return {
                    values: [],
                    errors: [...left.errors, ...right.errors],
                };
            }
            return {
                values: [
                    {
                        ...expression,
                        left: left.values[0] as typeof expression.left,
                        right: right.values[0] as typeof expression.right,
                    },
                ],
                errors: [...left.errors, ...right.errors],
            };
        }
    }
}

function filterNode(
    node: JsNode,
    filterRules: FilterRule<JsNode>[],
): FilterResults<JsNode> {
    if (isExpression(node)) {
        return filterExpression(node, filterRules);
    } else if (isAst(node)) {
        return filterAst(node, filterRules);
    }
    return { values: [], errors: [] };
}

export function filterProgram(
    program: Program,
    filterRules: FilterRule<JsNode>[],
): FinalFilterResult<Program> {
    const filteredStatements = program.map((node) =>
        filterNode(node, filterRules),
    );

    const values = filteredStatements.flatMap((result) => result.values);
    const errors = filteredStatements.flatMap((result) => result.errors);
    const program_: Program = values;

    return { value: program_, errors };
}
