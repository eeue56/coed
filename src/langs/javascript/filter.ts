import type { Ast, Expression } from "./types.ts";

function filterAst(ast: Ast, shouldKeep: (node: Ast) => boolean): Ast | null {
    if (!shouldKeep(ast)) {
        return null;
    }

    switch (ast.kind) {
        case "ConstStatement": {
            return ast;
        }
        case "ForLoop": {
            const body = filterAsts(ast.body, shouldKeep);
            return { ...ast, body };
        }
        case "FunctionDeclaration": {
            const body = filterAsts(ast.body, shouldKeep);
            return { ...ast, body };
        }
        case "IfStatement": {
            const thenBranch = filterAsts(ast.thenBranch, shouldKeep);
            const elseBranch = ast.elseBranch
                ? filterAsts(ast.elseBranch, shouldKeep)
                : undefined;
            return { ...ast, thenBranch, elseBranch };
        }
        case "LetStatement": {
            return ast;
        }
        case "ReturnStatement": {
            return ast;
        }
        case "ContinueStatement": {
            return ast;
        }
        case "BreakStatement": {
            return ast;
        }
    }
}

/**
 * failing branches will be completely removed
 */
export function filterAsts(
    ast: Ast[],
    shouldKeep: (node: Ast) => boolean,
): Ast[] {
    const toReturn = [];

    for (const node of ast) {
        const filtered = filterAst(node, shouldKeep);
        if (filtered !== null) {
            toReturn.push(filtered);
        }
    }
    return toReturn;
}

/**
 * any child branch or leaf that fails `shouldKeep` will cause the entire branch to be removed
 */
export function filterExpression(
    expression: Expression,
    shouldKeep: (node: Expression) => boolean,
): Expression | null {
    if (!shouldKeep(expression)) {
        return null;
    }

    switch (expression.kind) {
        case "NumberExpression": {
            return expression;
        }
        case "StringExpression": {
            return expression;
        }
        case "ArrayExpression": {
            const elements = expression.elements.flatMap((element) => {
                const filtered = filterExpression(element, shouldKeep);
                return filtered ? [filtered] : [];
            });
            return { ...expression, elements };
        }
        case "ObjectExpression": {
            const properties = Object.entries(expression.properties).flatMap(
                ([key, value]) => {
                    const filtered = filterExpression(value, shouldKeep);
                    return filtered ? [[key, filtered]] : [];
                },
            );
            return {
                ...expression,
                properties: Object.fromEntries(properties),
            };
        }
        case "EqualityExpression":
        case "InequalityExpression":
        case "LessThanExpression":
        case "MoreThanExpression":
        case "LessThanOrEqualExpression":
        case "MoreThanOrEqualExpression": {
            const left = filterExpression(expression.left, shouldKeep);
            const right = filterExpression(expression.right, shouldKeep);
            if (!left || !right) {
                return null;
            }
            return { ...expression, left, right };
        }
        case "IncrementExpression":
        case "DecrementExpression": {
            return expression;
        }
        case "IncreaseExpression":
        case "DecreaseExpression": {
            const amount = filterExpression(expression.amount, shouldKeep);
            if (!amount) {
                return null;
            }
            return { ...expression, amount };
        }
        case "NullExpression": {
            return expression;
        }
        case "BooleanExpression": {
            return expression;
        }
        case "StringLiteralExpression": {
            const values = [];

            for (const value of expression.values) {
                const filtered = filterExpression(value, shouldKeep);
                if (!filtered) {
                    return null;
                }
                values.push(filtered);
            }
            return { ...expression, values };
        }
        case "FunctionCallExpression": {
            const args = [];

            for (const arg of expression.arguments) {
                const filtered = filterExpression(arg, shouldKeep);
                if (!filtered) {
                    return null;
                }
                args.push(filtered);
            }
            return { ...expression, arguments: args };
        }
        case "NameLookupExpression": {
            return expression;
        }
        case "ObjectPropertyExpression": {
            const object = filterExpression(expression.object, shouldKeep);
            const property = filterExpression(expression.property, shouldKeep);
            if (!object || !property) {
                return null;
            }
            return {
                ...expression,
                object: object as typeof expression.object,
                property: property as typeof expression.property,
            };
        }
        case "ObjectMethodCallExpression": {
            const object = filterExpression(expression.object, shouldKeep);
            const method = filterExpression(expression.method, shouldKeep);
            if (!object || !method) {
                return null;
            }

            const args = [];

            for (const arg of expression.arguments) {
                const filtered = filterExpression(arg, shouldKeep);
                if (!filtered) {
                    return null;
                }
                args.push(filtered);
            }

            return {
                ...expression,
                object: object as typeof expression.object,
                method: method as typeof expression.method,
                arguments: args,
            };
        }
        case "ArrayAccessExpression": {
            const array = filterExpression(expression.array, shouldKeep);
            const index = filterExpression(expression.index, shouldKeep);
            if (!array || !index) {
                return null;
            }
            return {
                ...expression,
                array: array as typeof expression.array,
                index: index as typeof expression.index,
            };
        }
        case "AdditionExpression":
        case "SubtractionExpression":
        case "MultiplicationExpression":
        case "DivisionExpression":
        case "AndExpression":
        case "OrExpression": {
            const left = filterExpression(expression.left, shouldKeep);
            const right = filterExpression(expression.right, shouldKeep);
            if (!left || !right) {
                return null;
            }
            return { ...expression, left, right };
        }
    }
}
