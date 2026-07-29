import { returnReplacerOrEmptyList } from "../helpers.ts";
import { type FilterResult, type FilterRule } from "../types.ts";
import {
    isAst,
    isDeclaration,
    isExpression,
    type Ast,
    type Expression,
    type IfStatement,
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
): FilterResult<Ast[]> {
    for (const filterRule of filterRules) {
        if (!filterRule.shouldKeep(ast)) {
            return returnReplacerOrEmptyList<Ast>(
                filterRule as FilterRule<Ast>,
                ast,
            );
        }
    }

    switch (ast.kind) {
        case "ConstStatement": {
            const expression = filterExpression(ast.value, filterRules);
            if (expression.value.length === 0) {
                return { value: [], errors: expression.errors };
            }
            return {
                value: [{ ...ast, value: expression.value[0] }],
                errors: expression.errors,
            };
        }
        case "ForInOfLoop": {
            const iterable = filterExpression(ast.iterable, filterRules);
            const body = filterAsts(ast.body, filterRules);
            const errors = [...iterable.errors, ...body.errors];

            if (iterable.value.length === 0) {
                return { value: [], errors };
            }

            return {
                value: [
                    {
                        ...ast,
                        iterable: iterable.value[0],
                        body: body.value,
                    },
                ],
                errors,
            };
        }
        case "ClassicForLoop": {
            const init = filterAst(ast.init, filterRules);
            const condition = filterExpression(ast.condition, filterRules);
            const increment = filterExpression(ast.increment, filterRules);
            const body = filterAsts(ast.body, filterRules);

            const errors = [
                ...init.errors,
                ...condition.errors,
                ...increment.errors,
                ...body.errors,
            ];

            const hasInit = init.value.length > 0;
            const hasCondition = condition.value.length > 0;
            const hasIncrement = increment.value.length > 0;

            if (
                !hasCondition ||
                !hasIncrement ||
                !hasInit ||
                (init.value[0].kind !== "LetStatement" &&
                    init.value[0].kind !== "ConstStatement")
            ) {
                return { value: [], errors };
            }

            return {
                value: [
                    {
                        kind: "ClassicForLoop",
                        init: init.value[0],
                        condition: condition.value[0],
                        increment: increment.value[0],
                        body: body.value,
                    },
                ],
                errors,
            };
        }
        case "DoWhileLoop": {
            const condition = filterExpression(ast.condition, filterRules);
            const body = filterAsts(ast.body, filterRules);

            const errors = [...condition.errors, ...body.errors];

            if (condition.value.length !== 1) {
                return { value: [], errors };
            }

            return {
                value: [
                    {
                        ...ast,
                        condition: condition.value[0],
                        body: body.value,
                    },
                ],
                errors,
            };
        }
        case "FunctionDeclaration": {
            const body = filterAsts(ast.body, filterRules);
            return {
                value: [{ ...ast, body: body.value }],
                errors: body.errors,
            };
        }
        case "ClassDeclaration": {
            const superClass = ast.superClass
                ? filterExpression(ast.superClass, filterRules)
                : { value: [], errors: [] };
            const body = filterAsts(ast.body, filterRules);

            const errors = [...superClass.errors, ...body.errors];

            if (ast.superClass && superClass.value.length === 0) {
                return { value: [], errors };
            }

            return {
                value: [
                    {
                        ...ast,
                        superClass: ast.superClass ? superClass.value[0] : null,
                        body: body.value,
                    },
                ],
                errors,
            };
        }
        case "IfStatement": {
            const condition = filterExpression(ast.condition, filterRules);
            const thenBranch = filterAsts(ast.thenBranch, filterRules);
            const elseIf = ast.elseIf
                ? filterAst(ast.elseIf, filterRules)
                : undefined;
            const elseBranch = ast.elseBranch
                ? filterAsts(ast.elseBranch, filterRules)
                : undefined;

            const errors = [
                ...condition.errors,
                ...thenBranch.errors,
                ...(elseIf?.errors || []),
                ...(elseBranch?.errors || []),
            ];

            if (condition.value.length !== 1) {
                return { value: [], errors };
            }

            let filteredElseIf: IfStatement | undefined = undefined;
            if (elseIf) {
                if (elseIf.value.length !== 1) {
                    return { value: [], errors };
                }

                const candidateElseIf = elseIf.value[0];
                if (candidateElseIf.kind !== "IfStatement") {
                    return { value: [], errors };
                }

                filteredElseIf = candidateElseIf;
            }

            const ifs: IfStatement = {
                ...ast,
                condition: condition.value[0],
                thenBranch: thenBranch.value,
            };

            if (typeof filteredElseIf !== "undefined") {
                ifs.elseIf = filteredElseIf;
            }

            if (typeof elseBranch !== "undefined") {
                ifs.elseBranch = elseBranch.value;
            }

            return {
                value: [ifs],
                errors,
            };
        }
        case "LetStatement": {
            const expression = filterExpression(ast.value, filterRules);
            if (expression.value.length === 0) {
                return { value: [], errors: expression.errors };
            }
            return {
                value: [{ ...ast, value: expression.value[0] }],
                errors: expression.errors,
            };
        }
        case "LetListStatement": {
            return { value: [ast], errors: [] };
        }
        case "ReturnStatement": {
            if (ast.value === null) {
                return { value: [ast], errors: [] };
            }

            const expression = filterExpression(ast.value, filterRules);
            if (expression.value.length === 0) {
                return { value: [], errors: expression.errors };
            }

            return {
                value: [{ ...ast, value: expression.value[0] }],
                errors: expression.errors,
            };
        }
        case "ContinueStatement": {
            return { value: [ast], errors: [] };
        }
        case "BreakStatement": {
            return { value: [ast], errors: [] };
        }
        case "ThrowStatement": {
            const thrown = filterExpression(ast.value, filterRules);
            if (thrown.value.length === 0) {
                return { value: [], errors: thrown.errors };
            }

            return {
                value: [{ ...ast, value: thrown.value[0] }],
                errors: thrown.errors,
            };
        }
        case "TryCatchStatement": {
            const tryBlock = filterAsts(ast.tryBlock, filterRules);
            const catchBlock = filterAsts(ast.catchBlock, filterRules);

            return {
                value: [
                    {
                        ...ast,
                        tryBlock: tryBlock.value,
                        catchBlock: catchBlock.value,
                    },
                ],
                errors: [...tryBlock.errors, ...catchBlock.errors],
            };
        }
        case "ImportStatement": {
            return { value: [ast], errors: [] };
        }
        case "ExportNamedStatement": {
            return { value: [ast], errors: [] };
        }
        case "ExportDeclarationStatement": {
            const declaration = filterAst(ast.declaration, filterRules);
            if (declaration.value.length !== 1) {
                return { value: [], errors: declaration.errors };
            }

            const node = declaration.value[0];

            if (!isDeclaration(node)) {
                return { value: [], errors: declaration.errors };
            }

            return {
                value: [{ ...ast, declaration: node }],
                errors: declaration.errors,
            };
        }
        case "ExportDefaultStatement": {
            if (isExpression(ast.value)) {
                const value = filterExpression(ast.value, filterRules);
                if (value.value.length !== 1) {
                    return { value: [], errors: value.errors };
                }

                return {
                    value: [{ ...ast, value: value.value[0] }],
                    errors: value.errors,
                };
            }

            const declaration = filterAst(ast.value, filterRules);
            if (
                declaration.value.length !== 1 ||
                declaration.value[0].kind !== "FunctionDeclaration"
            ) {
                return { value: [], errors: declaration.errors };
            }

            return {
                value: [{ ...ast, value: declaration.value[0] }],
                errors: declaration.errors,
            };
        }
        case "LineTerminatedExpression": {
            const values = [];
            const errors = [];

            for (const expression of ast.expressions) {
                const result = filterExpression(expression, filterRules);
                values.push(...result.value);
                errors.push(...result.errors);
            }
            return {
                value: [
                    { kind: "LineTerminatedExpression", expressions: values },
                ],
                errors,
            };
        }
    }
}

/**
 * failing branches will be completely removed
 */
export function filterAsts(
    ast: Ast[],
    filterRules: FilterRule<JsNode>[],
): FilterResult<Ast[]> {
    const toReturn = [];
    const errors = [];

    for (const node of ast) {
        const filtered = filterAst(node, filterRules);

        toReturn.push(...filtered.value);
        errors.push(...filtered.errors);
    }
    return { value: toReturn, errors };
}

/**
 * any child branch or leaf that fails `shouldKeep` will cause the entire branch to be removed
 */
export function filterExpression(
    expression: Expression,
    filterRules: FilterRule<JsNode>[],
): FilterResult<Expression[]> {
    for (const rule of filterRules) {
        if (!rule.shouldKeep(expression)) {
            return returnReplacerOrEmptyList<Expression>(
                rule as FilterRule<Expression>,
                expression,
            );
        }
    }

    switch (expression.kind) {
        case "NumberExpression": {
            return { value: [expression], errors: [] };
        }
        case "StringExpression": {
            return { value: [expression], errors: [] };
        }
        case "ArrayExpression": {
            const elements: Expression[] = [];
            const errors: string[] = [];

            for (const element of expression.elements) {
                const filtered = filterExpression(element, filterRules);
                elements.push(...filtered.value);
                errors.push(...filtered.errors);
            }

            return { value: [{ ...expression, elements }], errors };
        }
        case "ObjectExpression": {
            const properties: [string, Expression][] = [];
            const errors: string[] = [];

            Object.entries(expression.properties).forEach(([key, value]) => {
                const filtered = filterExpression(value, filterRules);
                if (filtered.value.length > 0) {
                    properties.push([key, filtered.value[0]]);
                }
                errors.push(...filtered.errors);
            });

            return {
                value: [
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
            if (left.value.length === 0 || right.value.length === 0) {
                return {
                    value: [],
                    errors: [...left.errors, ...right.errors],
                };
            }
            const exp = {
                ...expression,
                left: left.value[0],
                right: right.value[0],
            };
            return { value: [exp], errors: [...left.errors, ...right.errors] };
        }
        case "IncrementExpression":
        case "DecrementExpression": {
            return { value: [expression], errors: [] };
        }
        case "IncreaseExpression":
        case "DecreaseExpression": {
            const amount = filterExpression(expression.amount, filterRules);
            if (amount.value.length === 0) {
                return { value: [], errors: [...amount.errors] };
            }
            return {
                value: [{ ...expression, amount: amount.value[0] }],
                errors: [...amount.errors],
            };
        }
        case "NegationExpression": {
            const value = filterExpression(expression.value, filterRules);
            if (value.value.length === 0) {
                return { value: [], errors: [...value.errors] };
            }

            return {
                value: [{ ...expression, value: value.value[0] }],
                errors: [...value.errors],
            };
        }
        case "AssignmentExpression": {
            const target = filterExpression(expression.target, filterRules);
            const value = filterExpression(expression.value, filterRules);
            if (target.value.length === 0 || value.value.length === 0) {
                return {
                    value: [],
                    errors: [...target.errors, ...value.errors],
                };
            }

            return {
                value: [
                    {
                        ...expression,
                        target: target.value[0] as typeof expression.target,
                        value: value.value[0],
                    },
                ],
                errors: [...target.errors, ...value.errors],
            };
        }
        case "ArrowFunctionExpression": {
            if (Array.isArray(expression.body)) {
                const body = filterAsts(expression.body, filterRules);
                return {
                    value: [{ ...expression, body: body.value }],
                    errors: body.errors,
                };
            }

            const body = filterExpression(expression.body, filterRules);
            if (body.value.length === 0) {
                return { value: [], errors: [...body.errors] };
            }

            return {
                value: [{ ...expression, body: body.value[0] }],
                errors: body.errors,
            };
        }
        case "NullExpression": {
            return { value: [expression], errors: [] };
        }
        case "ThisExpression": {
            return { value: [expression], errors: [] };
        }
        case "SuperExpression": {
            return { value: [expression], errors: [] };
        }
        case "AwaitExpression": {
            const value = filterExpression(expression.value, filterRules);
            if (value.value.length === 0) {
                return { value: [], errors: value.errors };
            }

            return {
                value: [{ ...expression, value: value.value[0] }],
                errors: value.errors,
            };
        }
        case "NewExpression": {
            const callee = filterExpression(expression.callee, filterRules);
            if (callee.value.length === 0) {
                return { value: [], errors: callee.errors };
            }

            const args = [];
            const errors = [...callee.errors];
            for (const arg of expression.arguments) {
                const filtered = filterExpression(arg, filterRules);
                if (filtered.value.length === 0) {
                    return {
                        value: [],
                        errors: [...errors, ...filtered.errors],
                    };
                }
                args.push(filtered.value[0]);
                errors.push(...filtered.errors);
            }

            return {
                value: [
                    { ...expression, callee: callee.value[0], arguments: args },
                ],
                errors,
            };
        }
        case "ImportExpression": {
            const source = filterExpression(expression.source, filterRules);
            if (source.value.length === 0) {
                return { value: [], errors: source.errors };
            }

            return {
                value: [{ ...expression, source: source.value[0] }],
                errors: source.errors,
            };
        }
        case "BooleanExpression": {
            return { value: [expression], errors: [] };
        }
        case "StringLiteralExpression": {
            const values = [];
            const errors = [];

            for (const value of expression.values) {
                const filtered = filterExpression(value, filterRules);
                if (filtered.value.length === 0) {
                    return { value: [], errors: [...filtered.errors] };
                }
                values.push(filtered.value[0]);
                errors.push(...filtered.errors);
            }
            return {
                value: [{ ...expression, values }],
                errors,
            };
        }
        case "FunctionCallExpression": {
            const args = [];
            const errors = [];
            for (const arg of expression.arguments) {
                const filtered = filterExpression(arg, filterRules);
                if (filtered.value.length === 0) {
                    return { value: [], errors: [...filtered.errors] };
                }
                args.push(filtered.value[0]);
                errors.push(...filtered.errors);
            }
            return { value: [{ ...expression, arguments: args }], errors };
        }
        case "NameLookupExpression": {
            return { value: [expression], errors: [] };
        }
        case "ObjectPropertyExpression": {
            const object = filterExpression(expression.object, filterRules);
            const property = filterExpression(expression.property, filterRules);

            if (object.value.length === 0 || property.value.length === 0) {
                return {
                    value: [],
                    errors: [...object.errors, ...property.errors],
                };
            }

            return {
                value: [
                    {
                        ...expression,
                        object: object.value[0] as typeof expression.object,
                        property: property
                            .value[0] as typeof expression.property,
                    },
                ],
                errors: [...object.errors, ...property.errors],
            };
        }
        case "ObjectMethodCallExpression": {
            const object = filterExpression(expression.object, filterRules);
            const method = filterExpression(expression.method, filterRules);
            if (object.value.length === 0 || method.value.length === 0) {
                return {
                    value: [],
                    errors: [...object.errors, ...method.errors],
                };
            }

            const args = [];

            for (const arg of expression.arguments) {
                const filtered = filterExpression(arg, filterRules);
                if (filtered.value.length === 0) {
                    return { value: [], errors: [...filtered.errors] };
                }
                args.push(filtered.value[0]);
            }

            return {
                value: [
                    {
                        ...expression,
                        object: object.value[0] as typeof expression.object,
                        method: method.value[0] as typeof expression.method,
                        arguments: args,
                    },
                ],
                errors: [...object.errors, ...method.errors],
            };
        }
        case "ArrayAccessExpression": {
            const array = filterExpression(expression.array, filterRules);
            const index = filterExpression(expression.index, filterRules);
            if (array.value.length === 0 || index.value.length === 0) {
                return {
                    value: [],
                    errors: [...array.errors, ...index.errors],
                };
            }
            return {
                value: [
                    {
                        ...expression,
                        array: array.value[0] as typeof expression.array,
                        index: index.value[0],
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
            if (left.value.length === 0 || right.value.length === 0) {
                return {
                    value: [],
                    errors: [...left.errors, ...right.errors],
                };
            }
            return {
                value: [
                    {
                        ...expression,
                        left: left.value[0],
                        right: right.value[0],
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
): FilterResult<JsNode[]> {
    if (isExpression(node)) {
        return filterExpression(node, filterRules);
    } else if (isAst(node)) {
        return filterAst(node, filterRules);
    }
    return { value: [], errors: [] };
}

export function filterProgram(
    program: Program,
    filterRules: FilterRule<JsNode>[],
): FilterResult<Program> {
    const filteredStatements = program.map((node) =>
        filterNode(node, filterRules),
    );

    const values = filteredStatements.flatMap((result) => result.value);
    const errors = filteredStatements.flatMap((result) => result.errors);
    const program_: Program = values;

    return { value: program_, errors };
}
export function getRootObjectName(expression: Expression): string | null {
    switch (expression.kind) {
        case "NameLookupExpression": {
            return expression.name;
        }
        case "ObjectPropertyExpression":
        case "ObjectMethodCallExpression": {
            return getRootObjectName(expression.object);
        }
        case "ArrayAccessExpression": {
            return getRootObjectName(expression.array);
        }
        case "NewExpression": {
            return getRootObjectName(expression.callee);
        }
        default: {
            return null;
        }
    }
}
