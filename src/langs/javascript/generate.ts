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

function shouldTerminateTopLevelExpression(expression: Expression): boolean {
    return (
        expression.kind === "FunctionCallExpression" ||
        expression.kind === "ObjectMethodCallExpression"
    );
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

function generateClassBody(statements: Ast[], level: number): string {
    if (statements.length === 0) {
        return "{}";
    }

    const methods = statements.map((statement) => {
        if (statement.kind === "TypeScriptClassMember") {
            return indent(level + 1, statement.source);
        }

        if (statement.kind === "DecoratedDeclaration") {
            return generateAST(statement, level + 1);
        }

        if (statement.kind !== "FunctionDeclaration") {
            return generateAST(statement, level + 1);
        }

        const asyncPrefix = statement.isAsync ? "async " : "";
        return indent(
            level + 1,
            `${asyncPrefix}${statement.name}(${statement.parameters.join(", ")}) ${generateBlock(statement.body, 0)}`,
        );
    });

    return `{
${methods.join("\n")}
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

function additionExpressionTermCount(expression: Expression): number {
    if (expression.kind !== "AdditionExpression") {
        return 1;
    }

    return (
        additionExpressionTermCount(expression.left) +
        additionExpressionTermCount(expression.right)
    );
}

function formatMultilineValueAtLevel(
    value: string,
    level: number,
    prefix: string,
): string {
    if (!value.includes("\n")) {
        return indent(level, `${prefix}${value}`);
    }

    const [firstLine, ...restLines] = value.split("\n");
    return `${indent(level, `${prefix}${firstLine}`)}\n${restLines.join("\n")}`;
}

function shouldMultilineObject(
    expression: Extract<Expression, { kind: "ObjectExpression" }>,
): boolean {
    const entries = Object.entries(expression.properties);

    if (entries.length <= 1) {
        return false;
    }

    return true;
}

function shouldMultilineArray(
    expression: Extract<Expression, { kind: "ArrayExpression" }>,
): boolean {
    if (expression.elements.length === 0) {
        return false;
    }

    return expression.elements.some(
        (element) =>
            element.kind === "ObjectExpression" ||
            element.kind === "ArrayExpression" ||
            element.kind === "StringLiteralExpression",
    );
}

export function generateExpression(expression: Expression, level = 0): string {
    switch (expression.kind) {
        case "NumberExpression":
            return `${expression.value}`;
        case "StringExpression":
            return `"${expression.value}"`;
        case "ArrayExpression": {
            if (expression.elements.length === 0) {
                return "[]";
            }

            const generatedElements = expression.elements.map((element) =>
                generateExpression(element, level + 1),
            );

            if (!shouldMultilineArray(expression)) {
                return `[${generatedElements.join(", ")}]`;
            }

            const lines = generatedElements.map((value) =>
                formatMultilineValueAtLevel(value, level + 1, ""),
            );

            return `[\n${lines.join(",\n")}\n${indent(level, "]")}`;
        }
        case "ObjectExpression": {
            const properties = Object.entries(expression.properties).map(
                ([key, value]) => ({
                    prefix:
                        value.kind === "SpreadExpression" ||
                        value.kind === "ComputedPropertyExpression" ||
                        value.kind === "ObjectMemberExpression"
                            ? ""
                            : `"${key}": `,
                    value: generateExpression(value, level + 1),
                }),
            );

            if (properties.length === 0) {
                return "{}";
            }

            if (!shouldMultilineObject(expression)) {
                return `{ ${properties[0].prefix}${properties[0].value} }`;
            }

            const lines = properties.map((property) =>
                formatMultilineValueAtLevel(
                    property.value,
                    level + 1,
                    property.prefix,
                ),
            );

            return `{\n${lines.join(",\n")}\n${indent(level, "}")}`;
        }
        case "EqualityExpression": {
            return `${generateExpression(expression.left, level)} === ${generateExpression(expression.right, level)}`;
        }
        case "InequalityExpression": {
            return `${generateExpression(expression.left, level)} !== ${generateExpression(expression.right, level)}`;
        }
        case "LessThanExpression": {
            return `${generateExpression(expression.left, level)} < ${generateExpression(expression.right, level)}`;
        }
        case "InExpression": {
            return `${generateExpression(expression.left, level)} in ${generateExpression(expression.right, level)}`;
        }
        case "BitwiseExpression": {
            return `${generateExpression(expression.left, level)} ${expression.operator} ${generateExpression(expression.right, level)}`;
        }
        case "InstanceOfExpression": {
            return `${generateExpression(expression.left, level)} instanceof ${generateExpression(expression.right, level)}`;
        }
        case "UnaryExpression": {
            return `${expression.operator}${/^[a-z]/.test(expression.operator) ? " " : ""}${generateExpression(expression.value, level)}`;
        }
        case "ComputedPropertyExpression": {
            return `[${generateExpression(expression.key, level)}]: ${generateExpression(expression.value, level)}`;
        }
        case "ParenthesizedExpression": {
            return `(${generateExpression(expression.value, level)})`;
        }
        case "ModuloExpression": {
            return `${generateExpression(expression.left, level)} % ${generateExpression(expression.right, level)}`;
        }
        case "NullishCoalescingExpression": {
            return `${generateExpression(expression.left, level)} ?? ${generateExpression(expression.right, level)}`;
        }
        case "MoreThanExpression": {
            return `${generateExpression(expression.left, level)} > ${generateExpression(expression.right, level)}`;
        }
        case "LessThanOrEqualExpression": {
            return `${generateExpression(expression.left, level)} <= ${generateExpression(expression.right, level)}`;
        }
        case "MoreThanOrEqualExpression": {
            return `${generateExpression(expression.left, level)} >= ${generateExpression(expression.right, level)}`;
        }
        case "IncrementExpression": {
            return `${expression.variable}++`;
        }
        case "DecrementExpression": {
            return `${expression.variable}--`;
        }
        case "IncreaseExpression": {
            return `${expression.variable} += ${generateExpression(expression.amount, level)}`;
        }
        case "DecreaseExpression": {
            return `${expression.variable} -= ${generateExpression(expression.amount, level)}`;
        }
        case "PrefixIncrementExpression": {
            return `++${expression.variable}`;
        }
        case "PrefixDecrementExpression": {
            return `--${expression.variable}`;
        }
        case "LooseEqualityExpression": {
            return `${generateExpression(expression.left, level)} == ${generateExpression(expression.right, level)}`;
        }
        case "LooseInequalityExpression": {
            return `${generateExpression(expression.left, level)} != ${generateExpression(expression.right, level)}`;
        }
        case "ObjectMemberExpression": {
            const asyncPrefix = expression.isAsync ? "async " : "";
            const accessor =
                expression.memberKind === "method"
                    ? ""
                    : `${expression.memberKind} `;
            return `${asyncPrefix}${accessor}${expression.name}(${expression.parameters.join(", ")}) ${generateBlock(expression.body, level)}`;
        }
        case "NegationExpression": {
            return `!${generateExpression(expression.value, level)}`;
        }
        case "SpreadExpression": {
            return `...${generateExpression(expression.value, level)}`;
        }
        case "AssignmentExpression": {
            return `${generateExpression(expression.target, level)} = ${generateExpression(expression.value, level)}`;
        }
        case "ArrowFunctionExpression": {
            const parameters = expression.parameters.join(", ");
            const asyncPrefix = expression.isAsync ? "async " : "";
            if (Array.isArray(expression.body)) {
                return `${asyncPrefix}(${parameters}) => ${generateBlock(expression.body, 0)}`;
            }

            return `${asyncPrefix}(${parameters}) => ${generateExpression(expression.body, level)}`;
        }
        case "ThisExpression": {
            return `this`;
        }
        case "SuperExpression": {
            return `super`;
        }
        case "ConditionalExpression": {
            return `${generateExpression(expression.condition, level)} ? ${generateExpression(expression.whenTrue, level)} : ${generateExpression(expression.whenFalse, level)}`;
        }
        case "AwaitExpression": {
            return `await ${generateExpression(expression.value, level)}`;
        }
        case "NewExpression": {
            return `new ${generateExpression(expression.callee, level)}(${expression.arguments.map((argument) => generateExpression(argument, level)).join(", ")})`;
        }
        case "ImportExpression": {
            return `import(${generateExpression(expression.source, level)})`;
        }
        case "RegexExpression": {
            return expression.source;
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

                    return `\${${generateExpression(value, level)}}`;
                })
                .join("");

            return `\`${values}\``;
        }
        case "CallExpression": {
            return `${generateExpression(expression.callee, level)}(${expression.arguments.map((argument) => generateExpression(argument, level)).join(", ")})`;
        }
        case "CommaExpression": {
            return `${generateExpression(expression.left, level)}, ${generateExpression(expression.right, level)}`;
        }
        case "FunctionCallExpression": {
            return `${expression.functionName}(${expression.arguments.map((argument) => generateExpression(argument, level)).join(", ")})`;
        }
        case "NameLookupExpression": {
            return expression.name;
        }
        case "ObjectPropertyExpression": {
            const parent = generateExpression(expression.object, level);
            switch (expression.property.kind) {
                case "NameLookupExpression": {
                    return `${parent}.${generateExpression(expression.property, level)}`;
                }
                case "StringLiteralExpression": {
                    return `${parent}[${generateExpression(expression.property, level)}]`;
                }
            }
            break;
        }
        case "ObjectMethodCallExpression": {
            const parent = generateExpression(expression.object, level);
            const args = expression.arguments
                .map((argument) => generateExpression(argument, level))
                .join(", ");

            switch (expression.method.kind) {
                case "NameLookupExpression": {
                    return `${parent}.${generateExpression(expression.method, level)}(${args})`;
                }
                case "StringLiteralExpression": {
                    return `${parent}[${generateExpression(expression.method, level)}](${args})`;
                }
            }
            break;
        }
        case "ArrayAccessExpression": {
            return `${generateExpression(expression.array, level)}[${generateExpression(expression.index, level)}]`;
        }
        case "AdditionExpression": {
            return `${generateExpression(expression.left, level)} + ${generateExpression(expression.right, level)}`;
        }
        case "SubtractionExpression": {
            return `${generateExpression(expression.left, level)} - ${generateExpression(expression.right, level)}`;
        }
        case "MultiplicationExpression": {
            return `${generateExpression(expression.left, level)} * ${generateExpression(expression.right, level)}`;
        }
        case "DivisionExpression": {
            return `${generateExpression(expression.left, level)} / ${generateExpression(expression.right, level)}`;
        }
        case "AndExpression": {
            return `${generateExpression(expression.left, level)} && ${generateExpression(expression.right, level)}`;
        }
        case "OrExpression": {
            return `${generateExpression(expression.left, level)} || ${generateExpression(expression.right, level)}`;
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
        case "LetListStatement": {
            return indent(level, `let ${ast.names.join(", ")};`);
        }
        case "IfStatement": {
            if (
                !ast.elseBranch &&
                !ast.elseIf &&
                ast.thenBranch.length === 1 &&
                ast.thenBranch[0].kind === "ReturnStatement"
            ) {
                const onlyReturn = ast.thenBranch[0];
                if (onlyReturn.value === null) {
                    return indent(
                        level,
                        `if (${generateExpression(ast.condition)}) return;`,
                    );
                }

                return indent(
                    level,
                    `if (${generateExpression(ast.condition)}) return ${generateExpression(onlyReturn.value)};`,
                );
            }

            if (ast.elseIf) {
                return indent(
                    level,
                    `if (${generateExpression(ast.condition)}) ${generateBlock(ast.thenBranch, level)} else ${generateAST(ast.elseIf, 0)}`,
                );
            }

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
        case "ForInOfLoop": {
            return indent(
                level,
                `for (${ast.init.declarationKind} ${ast.init.name} ${ast.operator} ${generateExpression(ast.iterable)}) ${generateBlock(ast.body, level)}`,
            );
        }
        case "ClassicForLoop": {
            return indent(
                level,
                `for (${generateForInit(ast.init)}; ${generateExpression(ast.condition)}; ${generateExpression(ast.increment)}) ${generateBlock(ast.body, level)}`,
            );
        }
        case "DoWhileLoop": {
            return indent(
                level,
                `do ${generateBlock(ast.body, level)} while (${generateExpression(ast.condition)});`,
            );
        }
        case "FunctionDeclaration": {
            const asyncPrefix = ast.isAsync ? "async " : "";
            return indent(
                level,
                `${asyncPrefix}function ${ast.name}(${ast.parameters.join(", ")}) ${generateBlock(ast.body, level)}`,
            );
        }
        case "ClassDeclaration": {
            const superClassPart = ast.superClass
                ? ` extends ${generateExpression(ast.superClass)}`
                : "";
            return indent(
                level,
                `class ${ast.name}${superClassPart} ${generateClassBody(ast.body, level)}`,
            );
        }
        case "InterfaceDeclaration": {
            const typeParameters = ast.typeParameters
                ? `<${ast.typeParameters}>`
                : "";
            const extendsPart =
                ast.extends.length > 0
                    ? ` extends ${ast.extends.join(", ")}`
                    : "";
            const members = ast.members
                .map((member) => indent(level + 1, member))
                .join("\n");
            return indent(
                level,
                `interface ${ast.name}${typeParameters}${extendsPart} {${members ? `\n${members}\n${indent(level, "}")}` : "}"}`,
            );
        }
        case "TypeAliasDeclaration": {
            const typeParameters = ast.typeParameters
                ? `<${ast.typeParameters}>`
                : "";
            return indent(
                level,
                `type ${ast.name}${typeParameters} = ${ast.type};`,
            );
        }
        case "EnumDeclaration": {
            const constPrefix = ast.isConst ? "const " : "";
            const members = ast.members.map((member) =>
                member.initializer === null
                    ? member.name
                    : `${member.name} = ${member.initializer}`,
            );
            return indent(
                level,
                `${constPrefix}enum ${ast.name} { ${members.join(", ")} }`,
            );
        }
        case "TypeScriptClassMember": {
            return indent(level, ast.source);
        }
        case "DecoratedDeclaration": {
            const decorators = ast.decorators
                .map((decorator) => indent(level, decorator))
                .join("\n");
            return `${decorators}\n${generateAST(ast.declaration, level)}`;
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
        case "ThrowStatement": {
            return indent(level, `throw ${generateExpression(ast.value)};`);
        }
        case "TryCatchStatement": {
            return indent(
                level,
                `try ${generateBlock(ast.tryBlock, level)} catch (${ast.catchParameter}) ${generateBlock(ast.catchBlock, level)}`,
            );
        }
        case "TryFinallyStatement": {
            const catchPart = ast.catchBlock
                ? ` catch${ast.catchParameter === null ? "" : ` (${ast.catchParameter})`} ${generateBlock(ast.catchBlock, level)}`
                : "";
            return indent(
                level,
                `try ${generateBlock(ast.tryBlock, level)}${catchPart} finally ${generateBlock(ast.finallyBlock, level)}`,
            );
        }
        case "ImportNamespaceStatement": {
            return indent(
                level,
                `import * as ${ast.name} from "${ast.source}";`,
            );
        }
        case "ImportStatement": {
            if (ast.defaultImport === null && ast.namedImports.length === 0) {
                return indent(level, `import "${ast.source}";`);
            }

            const defaultPart = ast.defaultImport ?? "";
            const namedPart =
                ast.namedImports.length > 0
                    ? `{ ${ast.namedImports.join(", ")} }`
                    : "";
            const separator =
                defaultPart.length > 0 && namedPart.length > 0 ? ", " : "";

            return indent(
                level,
                `import ${defaultPart}${separator}${namedPart} from "${ast.source}";`,
            );
        }
        case "ExportDeclarationStatement": {
            return indent(level, `export ${generateAST(ast.declaration, 0)}`);
        }
        case "ExportNamedStatement": {
            return indent(level, `export { ${ast.names.join(", ")} };`);
        }
        case "ExportFromStatement": {
            const names = ast.names ? `{ ${ast.names.join(", ")} }` : "*";
            return indent(level, `export ${names} from "${ast.source}";`);
        }
        case "ExportDefaultStatement": {
            if (isExpression(ast.value)) {
                return indent(
                    level,
                    `export default ${generateExpression(ast.value)};`,
                );
            }

            return indent(level, `export default ${generateAST(ast.value, 0)}`);
        }
        case "LineTerminatedExpression": {
            if (
                ast.expressions.length === 1 &&
                ast.expressions[0].kind === "IncreaseExpression"
            ) {
                const expression = ast.expressions[0];
                const amount = generateExpression(expression.amount);
                const line = `${expression.variable} += ${amount};`;

                if (
                    line.length > 90 ||
                    additionExpressionTermCount(expression.amount) >= 4
                ) {
                    return indent(
                        level,
                        `${expression.variable} +=\n    ${amount};`,
                    );
                }
            }

            return indent(
                level,
                `${ast.expressions.map(generateExpression).join(" \n")};`,
            );
        }
    }
}

export function generateProgram(program: Program): string {
    return program
        .map((node) => {
            if (isExpression(node)) {
                const generated = generateExpression(node);
                return shouldTerminateTopLevelExpression(node)
                    ? `${generated};`
                    : generated;
            }
            return generateAST(node, 0);
        })
        .join("\n\n");
}
