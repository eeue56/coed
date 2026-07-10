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

export function filterAsts(ast: Ast[], shouldKeep: (node: Ast) => boolean) {
    const toReturn = [];

    for (const node of ast) {
        const filtered = filterAst(node, shouldKeep);
        if (filtered !== null) {
            toReturn.push(filtered);
        }
    }
    return toReturn;
}

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
            if (!shouldKeep(expression.left) || !shouldKeep(expression.right)) {
                return null;
            }
            return expression;
        }
        case "IncrementExpression":
        case "DecrementExpression": {
            return expression;
        }
        case "IncreaseExpression":
        case "DecreaseExpression": {
            if (!shouldKeep(expression.amount)) {
                return null;
            }
            return expression;
        }
        case "NullExpression": {
            return expression;
        }
        case "BooleanExpression": {
            return expression;
        }
        case "StringLiteralExpression": {
            const values = expression.values.filter((value) =>
                filterExpression(value, shouldKeep),
            );
            return { ...expression, values };
        }
        case "FunctionCallExpression": {
            for (const arg of expression.arguments) {
                if (!shouldKeep(arg)) {
                    return null;
                }
            }
            return expression;
        }
        case "NameLookupExpression": {
            return expression;
        }
        case "ObjectPropertyExpression": {
            if (
                !shouldKeep(expression.property) ||
                !shouldKeep(expression.object)
            ) {
                return null;
            }
            return expression;
        }
        case "ObjectMethodCallExpression": {
            if (
                !shouldKeep(expression.method) ||
                !shouldKeep(expression.object)
            ) {
                return null;
            }
            return expression;
        }
        case "ArrayAccessExpression": {
            if (
                !shouldKeep(expression.array) ||
                !shouldKeep(expression.index)
            ) {
                return null;
            }
            return expression;
        }
        case "AdditionExpression":
        case "SubtractionExpression":
        case "MultiplicationExpression":
        case "DivisionExpression": {
            if (!shouldKeep(expression.left) || !shouldKeep(expression.right)) {
                return null;
            }
            return expression;
        }
    }
}
