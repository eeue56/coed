import {
    isExpression,
    type Ast,
    type Expression,
    type Program,
} from "./types.ts";

function indent(level: number, str: string): string {
    if (level === 0) {
        return str;
    }

    return str
        .split("\n")
        .map((line) => "    ".repeat(level) + line)
        .join("\n");
}

function generateStatements(statements: Ast[]): string {
    return statements.map((statement) => generateAST(statement, 0)).join("\n");
}

function generateBlock(statements: Ast[], level: number): string {
    if (statements.length === 0) {
        return "{}";
    }

    return `{
${indent(level + 1, generateStatements(statements))}
${indent(level, "}")}`;
}

function generateForInit(ast: Ast): string {
    switch (ast.kind) {
        case "LetStatement": {
            return `let ${ast.name} = ${generateExpression(ast.value)}`;
        }
        case "ConstStatement": {
            return `const ${ast.name} = ${generateExpression(ast.value)}`;
        }
        default: {
            return generateAST(ast, 0).replace(/;$/, "");
        }
    }
}

export function generateExpression(expression: Expression): string {
    switch (expression.kind) {
        case "NumberExpression":
            return `${expression.value}`;
        case "StringExpression":
            return `"${expression.value}"`;
        case "ArrayExpression":
            return `[${expression.elements.map(generateExpression).join(", ")}]`;
        case "ObjectExpression": {
            const properties = Object.entries(expression.properties).map(
                ([key, value]) => `"${key}": ${generateExpression(value)}`,
            );

            if (properties.length === 0) {
                return "{}";
            }

            return `{ ${properties.join(", ")} }`;
        }
        case "EqualityExpression": {
            return `${generateExpression(expression.left)} === ${generateExpression(expression.right)}`;
        }
        case "InequalityExpression": {
            return `${generateExpression(expression.left)} !== ${generateExpression(expression.right)}`;
        }
        case "LessThanExpression": {
            return `${generateExpression(expression.left)} < ${generateExpression(expression.right)}`;
        }
        case "MoreThanExpression": {
            return `${generateExpression(expression.left)} > ${generateExpression(expression.right)}`;
        }
        case "LessThanOrEqualExpression": {
            return `${generateExpression(expression.left)} <= ${generateExpression(expression.right)}`;
        }
        case "MoreThanOrEqualExpression": {
            return `${generateExpression(expression.left)} >= ${generateExpression(expression.right)}`;
        }
        case "IncrementExpression": {
            return `${expression.variable}++`;
        }
        case "DecrementExpression": {
            return `${expression.variable}--`;
        }
        case "IncreaseExpression": {
            return `${expression.variable} += ${generateExpression(expression.amount)}`;
        }
        case "DecreaseExpression": {
            return `${expression.variable} -= ${generateExpression(expression.amount)}`;
        }
        case "NullExpression": {
            return `null`;
        }
        case "BooleanExpression": {
            return `${expression.value}`;
        }
        case "StringLiteralExpression": {
            const values = expression.values
                .map((value) => {
                    if (value.kind === "StringExpression") {
                        return value.value;
                    }

                    return `\${${generateExpression(value)}}`;
                })
                .join("");

            return `\`${values}\``;
        }
        case "FunctionCallExpression": {
            return `${expression.functionName}(${expression.arguments.map(generateExpression).join(", ")})`;
        }
        case "NameLookupExpression": {
            return `${expression.name}`;
        }
        case "ObjectPropertyExpression": {
            const parent = generateExpression(expression.object);
            switch (expression.property.kind) {
                case "NameLookupExpression": {
                    return `${parent}.${generateExpression(expression.property)}`;
                }
                case "StringLiteralExpression": {
                    return `${parent}[${generateExpression(expression.property)}]`;
                }
            }
        }
        case "ObjectMethodCallExpression": {
            const parent = generateExpression(expression.object);
            const args = expression.arguments
                .map(generateExpression)
                .join(", ");

            switch (expression.method.kind) {
                case "NameLookupExpression": {
                    return `${parent}.${generateExpression(expression.method)}(${args})`;
                }
                case "StringLiteralExpression": {
                    return `${parent}[${generateExpression(expression.method)}](${args})`;
                }
            }
        }
        case "ArrayAccessExpression": {
            return `${generateExpression(expression.array)}[${generateExpression(expression.index)}]`;
        }
        case "AdditionExpression": {
            return `${generateExpression(expression.left)} + ${generateExpression(expression.right)}`;
        }
        case "SubtractionExpression": {
            return `${generateExpression(expression.left)} - ${generateExpression(expression.right)}`;
        }
        case "MultiplicationExpression": {
            return `${generateExpression(expression.left)} * ${generateExpression(expression.right)}`;
        }
        case "DivisionExpression": {
            return `${generateExpression(expression.left)} / ${generateExpression(expression.right)}`;
        }
        case "AndExpression": {
            return `${generateExpression(expression.left)} && ${generateExpression(expression.right)}`;
        }
        case "OrExpression": {
            return `${generateExpression(expression.left)} || ${generateExpression(expression.right)}`;
        }
    }
}

export function generateAST(ast: Ast, level: number): string {
    switch (ast.kind) {
        case "LetStatement": {
            return indent(
                level,
                `let ${ast.name} = ${generateExpression(ast.value)};`,
            );
        }
        case "IfStatement": {
            if (ast.elseBranch) {
                return indent(
                    level,
                    `if (${generateExpression(ast.condition)}) ${generateBlock(ast.thenBranch, level)} else ${generateBlock(ast.elseBranch, level)}`,
                );
            }

            return indent(
                level,
                `if (${generateExpression(ast.condition)}) ${generateBlock(ast.thenBranch, level)}`,
            );
        }
        case "ForLoop": {
            return indent(
                level,
                `for (${generateForInit(ast.init)}; ${generateExpression(ast.condition)}; ${generateExpression(ast.increment)}) ${generateBlock(ast.body, level)}`,
            );
        }
        case "FunctionDeclaration": {
            return indent(
                level,
                `function ${ast.name}(${ast.parameters.join(", ")}) ${generateBlock(ast.body, level)}`,
            );
        }
        case "ConstStatement": {
            return indent(
                level,
                `const ${ast.name} = ${generateExpression(ast.value)};`,
            );
        }
        case "ReturnStatement": {
            if (ast.value === null) {
                return indent(level, `return;`);
            }

            return indent(level, `return ${generateExpression(ast.value)};`);
        }
        case "ContinueStatement": {
            return indent(level, `continue;`);
        }
        case "BreakStatement": {
            return indent(level, `break;`);
        }
    }
}

export function generateProgram(program: Program): string {
    return program
        .map((node) => {
            if (isExpression(node)) {
                return generateExpression(node);
            }
            return generateAST(node, 0);
        })
        .join("\n");
}
