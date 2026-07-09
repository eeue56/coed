import { Ast, Expression, Program } from "./types.ts";

export function generateExpression(expression: Expression): string {
    switch (expression.kind) {
        case "NumberExpression":
            return `${expression.value}`;
        case "StringExpression":
            return `"${expression.value}"`;
        case "ArrayExpression":
            return `[${expression.elements.map(generateExpression).join(", ")}]`;
        case "ObjectExpression": {
            const properties = Object.entries(expression.properties)
                .map(([key, value]) => `${key}: ${generateExpression(value)}`)
                .join(", ");

            return `{${properties}}`;
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
            return `\`${expression.values}\``;
        }
        case "FunctionCallExpression": {
            return `${expression.functionName}(${expression.arguments.map(generateExpression).join(", ")})`;
        }
        case "NameLookupExpression": {
            return `${expression.name}`;
        }
        case "ObjectPropertyExpression": {
            return `${expression.object}.${expression.property}`;
        }
        case "ObjectMethodCallExpression": {
            return `${expression.object}.${expression.method}(${expression.arguments.map(generateExpression).join(", ")})`;
        }
        case "ArrayAccessExpression": {
            return `${expression.array}[${generateExpression(expression.index)}]`;
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
    }
}

export function generateAST(ast: Ast): string {
    switch (ast.kind) {
        case "LetStatement": {
            return `let ${ast.name} = ${generateExpression(ast.value)};`;
        }
        case "IfStatement": {
            if (ast.elseBranch) {
                return `if (${generateExpression(ast.condition)}) { ${ast.thenBranch.map(generateAST).join(" ")} } else { ${ast.elseBranch.map(generateAST).join(" ")} }`;
            }

            return `if (${generateExpression(ast.condition)}) { ${ast.thenBranch.map(generateAST).join(" ")} }`;
        }
        case "ForLoop": {
            return `for (${generateAST(ast.init)} ${generateExpression(ast.condition)}; ${generateExpression(ast.increment)}) { ${ast.body.map(generateAST).join(" ")} }`;
        }
        case "FunctionDeclaration": {
            return `function ${ast.name}(${ast.parameters.join(", ")}) { ${ast.body.map(generateAST).join(" ")} }`;
        }
        case "ConstStatement": {
            return `const ${ast.name} = ${generateExpression(ast.value)};`;
        }
    }
}

export function generateProgram(program: Program): string {
    return program.map(generateAST).join("\n");
}
