import ts from "typescript";
import type { Result } from "../../types.ts";
import type {
    ArrayAccessExpression,
    Ast,
    BitwiseExpression,
    BitwiseOperator,
    ChainableExpression,
    ClassDeclaration,
    ConstStatement,
    DecoratedDeclaration,
    EnumDeclaration,
    Expression,
    ForLoopBinding,
    FunctionDeclaration,
    IfStatement,
    InterfaceDeclaration,
    LetStatement,
    ObjectPropertyExpression,
    Program,
    TypeAliasDeclaration,
} from "../types.ts";
import { isExpression } from "../types.ts";

type Ctx = {
    sourceFile: ts.SourceFile;
    insideFunction: boolean;
    insideForLoop: boolean;
    whileCounter: { value: number };
};

function rootCtx(sourceFile: ts.SourceFile): Ctx {
    return {
        sourceFile,
        insideFunction: false,
        insideForLoop: false,
        whileCounter: { value: 0 },
    };
}

function withFunction(ctx: Ctx): Ctx {
    return { ...ctx, insideFunction: true, insideForLoop: false };
}

function withLoop(ctx: Ctx): Ctx {
    return { ...ctx, insideForLoop: true };
}

function fail(message: string): never {
    throw new Error(message);
}

class ConversionError extends Error {
    readonly position: number;
    readonly title: string;
    readonly hint: string;
    readonly suggestion: string | null;

    constructor(
        message: string,
        position: number,
        title: string,
        hint: string,
        suggestion: string | null,
    ) {
        super(message);
        this.position = position;
        this.title = title;
        this.hint = hint;
        this.suggestion = suggestion;
    }
}

function formatLocatedError(
    message: string,
    position: number,
    input: string,
    title: string,
    hint: string,
    suggestion: string | null,
): string {
    const boundedPosition = Math.max(0, Math.min(position, input.length));
    const lines = input.split(/\r?\n/);
    const beforePosition = input.slice(0, boundedPosition);
    const line = beforePosition.split(/\r?\n/).length - 1;
    const column = boundedPosition - (beforePosition.lastIndexOf("\n") + 1);
    const lineText = lines[line] ?? "";
    return [
        title,
        "",
        `Problem: ${message}`,
        `Hint: ${hint}`,
        ...(suggestion === null ? [] : [`Suggestion: ${suggestion}`]),
        "",
        `At line ${line + 1}, column ${column + 1}:`,
        lineText,
        `${" ".repeat(column)}^`,
    ].join("\n");
}

function modifierNamed(node: ts.HasModifiers, kind: ts.SyntaxKind): boolean {
    return (ts.getModifiers(node) ?? []).some((m) => m.kind === kind);
}

function bindingName(name: ts.BindingName): string {
    if (ts.isIdentifier(name)) return name.text;
    fail("Destructuring bindings are not supported in this JavaScript subset.");
}

type ConvertedParameters = { names: string[]; prelude: Ast[] };

function nextTempName(prefix: string, ctx: Ctx): string {
    const name = `${prefix}_${ctx.whileCounter.value}`;
    ctx.whileCounter.value += 1;
    return name;
}

// Desugars `[a, b]`/`{ a, b }` patterns into one declaration per bound name.
function bindingPatternStatements(
    pattern: ts.ArrayBindingPattern | ts.ObjectBindingPattern,
    source: ChainableExpression,
    declarationKind: "let" | "const",
    ctx: Ctx,
): Ast[] {
    const out: Ast[] = [];
    const elements: readonly ts.ArrayBindingElement[] = pattern.elements;
    elements.forEach((element, index) => {
        if (ts.isOmittedExpression(element)) return;
        if (element.dotDotDotToken && !ts.isArrayBindingPattern(pattern)) {
            fail(
                "Object rest elements are not supported in this JavaScript subset.",
            );
        }

        let value: Expression;
        if (ts.isArrayBindingPattern(pattern)) {
            value = element.dotDotDotToken
                ? {
                      kind: "ObjectMethodCallExpression",
                      object: source,
                      method: { kind: "NameLookupExpression", name: "slice" },
                      arguments: [{ kind: "NumberExpression", value: index }],
                  }
                : {
                      kind: "ArrayAccessExpression",
                      array: source,
                      index: { kind: "NumberExpression", value: index },
                  };
        } else {
            const key = element.propertyName ?? element.name;
            if (!ts.isIdentifier(key) && !ts.isStringLiteral(key)) {
                fail("Unsupported destructuring key.");
            }
            value = {
                kind: "ObjectPropertyExpression",
                object: source,
                property: { kind: "NameLookupExpression", name: key.text },
            };
        }

        if (element.initializer) {
            value = {
                kind: "NullishCoalescingExpression",
                left: value,
                right: convertExpression(element.initializer, ctx),
            };
        }

        if (ts.isIdentifier(element.name)) {
            out.push({
                kind:
                    declarationKind === "const"
                        ? "ConstStatement"
                        : "LetStatement",
                name: element.name.text,
                value,
            });
        } else {
            // Nested patterns need a chainable source, so bind defaults to a temp first.
            let nestedSource: ChainableExpression;
            if (element.initializer) {
                const temp = nextTempName("__destructure", ctx);
                out.push({ kind: "ConstStatement", name: temp, value });
                nestedSource = { kind: "NameLookupExpression", name: temp };
            } else {
                nestedSource = asChainable(value);
            }
            out.push(
                ...bindingPatternStatements(
                    element.name,
                    nestedSource,
                    declarationKind,
                    ctx,
                ),
            );
        }
    });
    return out;
}

function convertParameters(
    parameters: readonly ts.ParameterDeclaration[],
    ctx: Ctx,
): ConvertedParameters {
    const prelude: Ast[] = [];
    const names = parameters.map((parameter) => {
        if (ts.isIdentifier(parameter.name) && !parameter.initializer) {
            return parameter.name.text;
        }
        const name = nextTempName("__param", ctx);
        const source: Expression = parameter.initializer
            ? {
                  kind: "NullishCoalescingExpression",
                  left: { kind: "NameLookupExpression", name },
                  right: convertExpression(parameter.initializer, ctx),
              }
            : { kind: "NameLookupExpression", name };

        if (ts.isIdentifier(parameter.name)) {
            prelude.push({
                kind: "ConstStatement",
                name: parameter.name.text,
                value: source,
            });
            return name;
        }

        let patternSource: ChainableExpression = {
            kind: "NameLookupExpression",
            name,
        };
        if (parameter.initializer) {
            const temp = nextTempName("__destructure", ctx);
            prelude.push({ kind: "ConstStatement", name: temp, value: source });
            patternSource = { kind: "NameLookupExpression", name: temp };
        }
        prelude.push(
            ...bindingPatternStatements(
                parameter.name,
                patternSource,
                "const",
                ctx,
            ),
        );
        return name;
    });
    return { names, prelude };
}

function convertDestructuringDeclaration(
    node: ts.VariableStatement,
    ctx: Ctx,
): Ast[] {
    const declaration = node.declarationList.declarations[0];
    if (
        node.declarationList.declarations.length !== 1 ||
        !declaration.initializer ||
        ts.isIdentifier(declaration.name)
    ) {
        fail("Only a single destructuring declarator is supported.");
    }
    const kind =
        (node.declarationList.flags & ts.NodeFlags.Const) !== 0
            ? "const"
            : "let";
    const temp = nextTempName("__destructure", ctx);
    return [
        {
            kind: "ConstStatement",
            name: temp,
            value: convertExpression(declaration.initializer, ctx),
        },
        ...bindingPatternStatements(
            declaration.name,
            { kind: "NameLookupExpression", name: temp },
            kind,
            ctx,
        ),
    ];
}

function convertFunctionBody(
    body: ts.ConciseBody,
    prelude: Ast[],
    ctx: Ctx,
): Ast[] {
    const functionCtx = withFunction(ctx);
    if (ts.isBlock(body)) {
        return [...prelude, ...convertStatements(body.statements, functionCtx)];
    }

    // expression-bodied arrow function, wrapped as a synthetic `result` binding
    return [
        ...prelude,
        {
            kind: "LetStatement",
            name: "result",
            value: convertExpression(body, functionCtx),
        },
    ];
}

function convertClassBody(
    members: readonly ts.ClassElement[],
    ctx: Ctx,
): Ast[] {
    const out: Ast[] = [];
    for (const member of members) {
        if (
            ts.isConstructorDeclaration(member) ||
            ts.isMethodDeclaration(member)
        ) {
            const modifiers = ts.canHaveModifiers(member)
                ? (ts.getModifiers(member) ?? [])
                : [];
            if (
                decoratorsOf(member).length > 0 ||
                member.parameters.some(
                    (parameter) =>
                        decoratorsOf(parameter).length > 0 ||
                        (ts.canHaveModifiers(parameter) &&
                            (ts.getModifiers(parameter)?.length ?? 0) > 0),
                ) ||
                modifiers.some(
                    (modifier) => modifier.kind !== ts.SyntaxKind.AsyncKeyword,
                )
            ) {
                out.push({
                    kind: "TypeScriptClassMember",
                    source: member.getText(),
                });
                continue;
            }

            const name = ts.isConstructorDeclaration(member)
                ? "constructor"
                : member.name.getText();
            const isAsync = modifierNamed(member, ts.SyntaxKind.AsyncKeyword);
            const body = member.body
                ? convertStatements(member.body.statements, withFunction(ctx))
                : [];
            const parameters = convertParameters(member.parameters, ctx);
            out.push({
                kind: "FunctionDeclaration",
                isAsync,
                name,
                parameters: parameters.names,
                body: [...parameters.prelude, ...body],
            });
            continue;
        }

        out.push({ kind: "TypeScriptClassMember", source: member.getText() });
    }
    return out;
}

function arrowOrFunctionToDeclaration(
    name: string,
    fn: ts.ArrowFunction | ts.FunctionExpression,
    ctx: Ctx,
): FunctionDeclaration {
    const isAsync = modifierNamed(fn, ts.SyntaxKind.AsyncKeyword);
    const parameters = convertParameters(fn.parameters, ctx);
    return {
        kind: "FunctionDeclaration",
        isAsync,
        name,
        parameters: parameters.names,
        body: convertFunctionBody(fn.body, parameters.prelude, ctx),
    };
}

function convertVariableStatement(node: ts.VariableStatement, ctx: Ctx): Ast {
    const list = node.declarationList;
    const isConst = (list.flags & ts.NodeFlags.Const) !== 0;

    if (list.declarations.some((d) => !d.initializer)) {
        return {
            kind: "LetListStatement",
            names: list.declarations.map((d) => bindingName(d.name)),
        };
    }

    if (list.declarations.length !== 1) {
        fail("Only a single declarator with an initializer is supported.");
    }

    const decl = list.declarations[0];
    const name = bindingName(decl.name);
    const initializer = decl.initializer;
    if (!initializer) {
        fail("Expected an initializer for this declaration.");
    }

    if (
        ts.isArrowFunction(initializer) ||
        ts.isFunctionExpression(initializer)
    ) {
        return arrowOrFunctionToDeclaration(name, initializer, ctx);
    }

    const value = convertExpression(initializer, ctx);

    return isConst
        ? ({ kind: "ConstStatement", name, value } satisfies ConstStatement)
        : ({ kind: "LetStatement", name, value } satisfies LetStatement);
}

function convertIf(node: ts.IfStatement, ctx: Ctx): IfStatement {
    const thenBranch = convertBlockOrSingle(node.thenStatement, ctx);
    const result: IfStatement = {
        kind: "IfStatement",
        condition: convertExpression(node.expression, ctx),
        thenBranch,
    };

    if (!node.elseStatement) {
        return result;
    }

    if (ts.isIfStatement(node.elseStatement)) {
        return { ...result, elseIf: convertIf(node.elseStatement, ctx) };
    }

    return {
        ...result,
        elseBranch: convertBlockOrSingle(node.elseStatement, ctx),
    };
}

function convertBlockOrSingle(node: ts.Statement, ctx: Ctx): Ast[] {
    if (ts.isBlock(node)) {
        return convertStatements(node.statements, ctx);
    }
    return convertStatements([node], ctx);
}

function convertClassicFor(node: ts.ForStatement, ctx: Ctx): Ast {
    if (!node.initializer || !ts.isVariableDeclarationList(node.initializer)) {
        fail("`for` loop initializer must be a `let`/`const` declaration.");
    }
    if (
        node.initializer.declarations.length !== 1 ||
        !node.condition ||
        !node.incrementor
    ) {
        fail(
            "`for` loop must have a single init declarator, condition, and increment.",
        );
    }

    const init = convertVariableStatement(
        ts.factory.createVariableStatement(undefined, node.initializer),
        ctx,
    );
    if (init.kind !== "LetStatement" && init.kind !== "ConstStatement") {
        fail("`for` loop initializer must be a `let`/`const` declaration.");
    }

    const loopCtx = withLoop(ctx);
    return {
        kind: "ClassicForLoop",
        init,
        condition: convertExpression(node.condition, loopCtx),
        increment: convertExpression(node.incrementor, loopCtx),
        body: convertBlockOrSingle(node.statement, loopCtx),
    };
}

type ConvertedForBinding = { binding: ForLoopBinding; prelude: Ast[] };

function forLoopBinding(
    initializer: ts.ForInitializer,
    ctx: Ctx,
): ConvertedForBinding {
    if (
        !ts.isVariableDeclarationList(initializer) ||
        initializer.declarations.length !== 1
    ) {
        fail(
            "`for...in`/`for...of` initializer must declare a single variable.",
        );
    }
    const declarationKind =
        (initializer.flags & ts.NodeFlags.Const) !== 0 ? "const" : "let";
    const target = initializer.declarations[0].name;
    if (ts.isIdentifier(target)) {
        return { binding: { declarationKind, name: target.text }, prelude: [] };
    }

    const name = nextTempName("__for", ctx);
    return {
        binding: { declarationKind: "const", name },
        prelude: bindingPatternStatements(
            target,
            { kind: "NameLookupExpression", name },
            declarationKind,
            ctx,
        ),
    };
}

function convertForOf(node: ts.ForOfStatement, ctx: Ctx): Ast {
    const loopCtx = withLoop(ctx);
    const { binding, prelude } = forLoopBinding(node.initializer, ctx);
    return {
        kind: "ForInOfLoop",
        init: binding,
        operator: "of",
        iterable: convertExpression(node.expression, loopCtx),
        body: [...prelude, ...convertBlockOrSingle(node.statement, loopCtx)],
    };
}

function convertForIn(node: ts.ForInStatement, ctx: Ctx): Ast {
    const loopCtx = withLoop(ctx);
    const { binding, prelude } = forLoopBinding(node.initializer, ctx);
    return {
        kind: "ForInOfLoop",
        init: binding,
        operator: "in",
        iterable: convertExpression(node.expression, loopCtx),
        body: [...prelude, ...convertBlockOrSingle(node.statement, loopCtx)],
    };
}

function convertWhile(node: ts.WhileStatement, ctx: Ctx): Ast {
    const loopVariable = `__while_${ctx.whileCounter.value}`;
    ctx.whileCounter.value += 1;

    const loopCtx = withLoop(ctx);
    return {
        kind: "ClassicForLoop",
        init: {
            kind: "LetStatement",
            name: loopVariable,
            value: { kind: "NumberExpression", value: 0 },
        },
        condition: convertExpression(node.expression, loopCtx),
        increment: { kind: "IncrementExpression", variable: loopVariable },
        body: convertBlockOrSingle(node.statement, loopCtx),
    };
}

function convertDoWhile(node: ts.DoStatement, ctx: Ctx): Ast {
    const loopCtx = withLoop(ctx);
    return {
        kind: "DoWhileLoop",
        condition: convertExpression(node.expression, loopCtx),
        body: convertBlockOrSingle(node.statement, loopCtx),
    };
}

function convertClass(node: ts.ClassDeclaration, ctx: Ctx): ClassDeclaration {
    const heritage = node.heritageClauses?.find(
        (h) => h.token === ts.SyntaxKind.ExtendsKeyword,
    );
    const superExpr = heritage?.types[0]?.expression;

    return {
        kind: "ClassDeclaration",
        name: node.name?.text ?? "default",
        superClass: superExpr ? convertExpression(superExpr, ctx) : null,
        body: convertClassBody(node.members, ctx),
    };
}

function convertInterface(node: ts.InterfaceDeclaration): InterfaceDeclaration {
    return {
        kind: "InterfaceDeclaration",
        name: node.name.text,
        typeParameters:
            node.typeParameters
                ?.map((parameter) => parameter.getText())
                .join(", ") ?? "",
        extends:
            node.heritageClauses?.flatMap((clause) =>
                clause.types.map((type) => type.getText()),
            ) ?? [],
        members: node.members.map((member) => member.getText()),
    };
}

function convertTypeAlias(node: ts.TypeAliasDeclaration): TypeAliasDeclaration {
    return {
        kind: "TypeAliasDeclaration",
        name: node.name.text,
        typeParameters:
            node.typeParameters
                ?.map((parameter) => parameter.getText())
                .join(", ") ?? "",
        type: node.type.getText(),
    };
}

function convertEnum(node: ts.EnumDeclaration): EnumDeclaration {
    return {
        kind: "EnumDeclaration",
        name: node.name.text,
        isConst: modifierNamed(node, ts.SyntaxKind.ConstKeyword),
        members: node.members.map((member) => ({
            name: member.name.getText(),
            initializer: member.initializer?.getText() ?? null,
        })),
    };
}

function decoratorsOf(node: ts.Node): string[] {
    return (
        ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : []
    ).map((decorator) => decorator.getText());
}

function decorate(declaration: Ast, node: ts.Node): Ast {
    const decorators = decoratorsOf(node);
    if (decorators.length === 0) return declaration;
    const result: DecoratedDeclaration = {
        kind: "DecoratedDeclaration",
        decorators,
        declaration,
    };
    return result;
}

function convertTry(node: ts.TryStatement, ctx: Ctx): Ast {
    const tryBlock = convertStatements(node.tryBlock.statements, ctx);
    const clause = node.catchClause;
    const catchParameter = clause?.variableDeclaration
        ? bindingName(clause.variableDeclaration.name)
        : null;
    const catchBlock = clause
        ? convertStatements(clause.block.statements, ctx)
        : null;

    if (node.finallyBlock) {
        return {
            kind: "TryFinallyStatement",
            tryBlock,
            catchParameter,
            catchBlock,
            finallyBlock: convertStatements(node.finallyBlock.statements, ctx),
        };
    }
    if (!catchBlock) {
        fail("`try` needs a `catch` or `finally` block.");
    }

    return {
        kind: "TryCatchStatement",
        catchParameter: catchParameter ?? "",
        tryBlock,
        catchBlock,
    };
}

function convertImport(node: ts.ImportDeclaration): Ast {
    if (!ts.isStringLiteral(node.moduleSpecifier)) {
        fail("Import source must be a string literal.");
    }
    const clause = node.importClause;
    const defaultImport = clause?.name ? clause.name.text : null;
    const namedImports: string[] = [];

    if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const spec of clause.namedBindings.elements) {
            if (spec.isTypeOnly) continue;
            namedImports.push(
                spec.propertyName
                    ? `${spec.propertyName.text} as ${spec.name.text}`
                    : spec.name.text,
            );
        }
    } else if (
        clause?.namedBindings &&
        ts.isNamespaceImport(clause.namedBindings)
    ) {
        if (defaultImport !== null) {
            fail(
                "Combining a default import with a namespace import is not supported by this Coed AST.",
            );
        }
        return {
            kind: "ImportNamespaceStatement",
            name: clause.namedBindings.name.text,
            source: node.moduleSpecifier.text,
        };
    }

    return {
        kind: "ImportStatement",
        defaultImport,
        namedImports,
        source: node.moduleSpecifier.text,
    };
}

function exportSpecifierName(element: ts.ExportSpecifier): string {
    return element.propertyName
        ? `${element.propertyName.text} as ${element.name.text}`
        : element.name.text;
}

function convertExportDeclarationStatement(node: ts.Statement, ctx: Ctx): Ast {
    if (ts.isVariableStatement(node)) {
        const decl = convertVariableStatement(node, ctx);
        if (
            decl.kind !== "LetStatement" &&
            decl.kind !== "LetListStatement" &&
            decl.kind !== "ConstStatement" &&
            decl.kind !== "FunctionDeclaration"
        ) {
            fail("Unsupported export declaration.");
        }
        return { kind: "ExportDeclarationStatement", declaration: decl };
    }

    if (ts.isFunctionDeclaration(node)) {
        return {
            kind: "ExportDeclarationStatement",
            declaration: convertFunctionDeclaration(node, ctx),
        };
    }

    if (ts.isClassDeclaration(node)) {
        return {
            kind: "ExportDeclarationStatement",
            declaration: convertClass(node, ctx),
        };
    }

    if (ts.isInterfaceDeclaration(node)) {
        return {
            kind: "ExportDeclarationStatement",
            declaration: convertInterface(node),
        };
    }

    if (ts.isTypeAliasDeclaration(node)) {
        return {
            kind: "ExportDeclarationStatement",
            declaration: convertTypeAlias(node),
        };
    }

    if (ts.isEnumDeclaration(node)) {
        return {
            kind: "ExportDeclarationStatement",
            declaration: convertEnum(node),
        };
    }

    fail("Unsupported export declaration.");
}

function convertFunctionDeclaration(
    node: ts.FunctionDeclaration,
    ctx: Ctx,
): FunctionDeclaration {
    if (
        !node.body ||
        (!node.name && !modifierNamed(node, ts.SyntaxKind.DefaultKeyword))
    ) {
        fail(
            "Function declarations must have a body and a name unless they are default exports.",
        );
    }
    if (node.asteriskToken) {
        fail("Generator functions are not supported in this Coed AST.");
    }
    const parameters = convertParameters(node.parameters, ctx);
    return {
        kind: "FunctionDeclaration",
        isAsync: modifierNamed(node, ts.SyntaxKind.AsyncKeyword),
        name: node.name?.text ?? "default",
        parameters: parameters.names,
        body: [
            ...parameters.prelude,
            ...convertStatements(node.body.statements, withFunction(ctx)),
        ],
    };
}

// A `break` only counts as a jump when it leaves the enclosing switch being converted.
function endsWithJump(
    statements: readonly ts.Statement[],
    breakCounts: boolean,
): boolean {
    if (statements.length === 0) return false;
    const last = statements[statements.length - 1];
    if (ts.isBlock(last)) return endsWithJump(last.statements, breakCounts);
    if (ts.isIfStatement(last)) {
        return (
            endsWithJump([last.thenStatement], breakCounts) &&
            last.elseStatement !== undefined &&
            endsWithJump([last.elseStatement], breakCounts)
        );
    }
    if (ts.isSwitchStatement(last)) {
        const clauses = last.caseBlock.clauses;
        return (
            clauses.some(ts.isDefaultClause) &&
            clauses.every(
                (clause) =>
                    clause.statements.length === 0 ||
                    endsWithJump(clause.statements, false),
            ) &&
            endsWithJump(clauses[clauses.length - 1].statements, false)
        );
    }
    return (
        (breakCounts && ts.isBreakStatement(last)) ||
        ts.isReturnStatement(last) ||
        ts.isThrowStatement(last) ||
        ts.isContinueStatement(last)
    );
}

function unwrapCaseBody(
    statements: readonly ts.Statement[],
): readonly ts.Statement[] {
    return statements.length === 1 && ts.isBlock(statements[0])
        ? statements[0].statements
        : statements;
}

type SwitchGroup = {
    tests: ts.Expression[];
    isDefault: boolean;
    statements: readonly ts.Statement[];
};

// Desugars a switch into an if/else-if chain; fallthrough is expanded by repeating the following case bodies.
function convertSwitch(node: ts.SwitchStatement, ctx: Ctx): Ast[] {
    const rawGroups: SwitchGroup[] = [];
    let tests: ts.Expression[] = [];
    let isDefault = false;

    node.caseBlock.clauses.forEach((clause, index) => {
        if (ts.isCaseClause(clause)) tests.push(clause.expression);
        else isDefault = true;

        const isLast = index === node.caseBlock.clauses.length - 1;
        if (clause.statements.length === 0 && !isLast) return;

        rawGroups.push({
            tests,
            isDefault,
            statements: unwrapCaseBody(clause.statements),
        });
        tests = [];
        isDefault = false;
    });

    const groups = rawGroups.map((group, index): SwitchGroup => {
        let statements = group.statements;
        for (
            let next = index + 1;
            !endsWithJump(statements, true) && next < rawGroups.length;
            next++
        ) {
            statements = [...statements, ...rawGroups[next].statements];
        }
        const body = ts.isBreakStatement(statements[statements.length - 1])
            ? statements.slice(0, -1)
            : statements;
        return { ...group, statements: body };
    });

    const bodyOf = (group: SwitchGroup): Ast[] =>
        convertStatements(group.statements, ctx);
    const conditionOf = (group: SwitchGroup): Expression =>
        group.tests
            .map(
                (test): Expression => ({
                    kind: "EqualityExpression",
                    left: convertExpression(node.expression, ctx),
                    right: convertExpression(test, ctx),
                }),
            )
            .reduce(
                (left, right): Expression => ({
                    kind: "OrExpression",
                    left,
                    right,
                }),
            );

    const defaultGroup = groups.find((group) => group.isDefault) ?? null;
    const tested = groups.filter((group) => !group.isDefault);
    if (tested.length === 0) {
        return defaultGroup ? bodyOf(defaultGroup) : [];
    }

    // A default sharing a group with cases still matches everything not matched elsewhere.
    const toIf = (index: number): IfStatement => {
        const group = tested[index];
        const result: IfStatement = {
            kind: "IfStatement",
            condition: conditionOf(group),
            thenBranch: bodyOf(group),
        };
        if (index + 1 < tested.length) {
            return { ...result, elseIf: toIf(index + 1) };
        }
        return defaultGroup
            ? { ...result, elseBranch: bodyOf(defaultGroup) }
            : result;
    };
    return [toIf(0)];
}

function convertStatement(node: ts.Statement, ctx: Ctx): Ast | Ast[] | null {
    if (
        ts.isVariableStatement(node) &&
        node.declarationList.declarations.length === 1 &&
        !ts.isIdentifier(node.declarationList.declarations[0].name)
    ) {
        return convertDestructuringDeclaration(node, ctx);
    }
    if (ts.isVariableStatement(node))
        return convertVariableStatement(node, ctx);
    if (ts.isIfStatement(node)) return convertIf(node, ctx);
    if (ts.isSwitchStatement(node)) return convertSwitch(node, ctx);
    if (ts.isForStatement(node)) return convertClassicFor(node, ctx);
    if (ts.isForOfStatement(node)) return convertForOf(node, ctx);
    if (ts.isForInStatement(node)) return convertForIn(node, ctx);
    if (ts.isWhileStatement(node)) return convertWhile(node, ctx);
    if (ts.isDoStatement(node)) return convertDoWhile(node, ctx);
    if (ts.isFunctionDeclaration(node))
        return convertFunctionDeclaration(node, ctx);
    if (ts.isClassDeclaration(node)) return convertClass(node, ctx);
    if (ts.isTryStatement(node)) return convertTry(node, ctx);
    if (ts.isImportDeclaration(node)) {
        if (node.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword)
            return null;
        return convertImport(node);
    }

    if (ts.isReturnStatement(node)) {
        if (!ctx.insideFunction)
            fail("`return` is only allowed inside a function body.");
        return {
            kind: "ReturnStatement",
            value: node.expression
                ? convertExpression(node.expression, ctx)
                : null,
        };
    }

    if (ts.isBreakStatement(node)) {
        if (!ctx.insideForLoop)
            fail("`break` is only allowed inside a loop body.");
        return { kind: "BreakStatement" };
    }

    if (ts.isContinueStatement(node)) {
        if (!ctx.insideForLoop)
            fail("`continue` is only allowed inside a loop body.");
        return { kind: "ContinueStatement" };
    }

    if (ts.isThrowStatement(node)) {
        return {
            kind: "ThrowStatement",
            value: convertExpression(node.expression, ctx),
        };
    }

    if (node.kind === ts.SyntaxKind.WithStatement) {
        throw new ConversionError(
            "The `with` statement is not allowed in this JavaScript subset.",
            node.getStart(ctx.sourceFile),
            "I got stuck while parsing your JavaScript.",
            "`with` is infrequently used, deprecated, and usually only valuable in niche style-driven cases. Rewrite it using explicit property access or by assigning the object to a named variable first.",
            null,
        );
    }

    if (ts.isExportAssignment(node)) {
        const expr = node.expression;
        const value =
            ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)
                ? arrowOrFunctionToDeclaration("default", expr, ctx)
                : convertExpression(expr, ctx);
        return { kind: "ExportDefaultStatement", value };
    }

    if (ts.isExportDeclaration(node)) {
        if (node.isTypeOnly) return null;
        if (node.moduleSpecifier) {
            if (!ts.isStringLiteral(node.moduleSpecifier)) {
                fail("Export source must be a string literal.");
            }
            const source = node.moduleSpecifier.text;
            if (!node.exportClause) {
                return { kind: "ExportFromStatement", names: null, source };
            }
            if (!ts.isNamedExports(node.exportClause)) {
                fail(
                    "Namespace re-exports are not supported by this Coed AST.",
                );
            }
            const names: string[] = [];
            for (const element of node.exportClause.elements) {
                if (element.isTypeOnly) continue;
                names.push(exportSpecifierName(element));
            }
            return { kind: "ExportFromStatement", names, source };
        }
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
            return {
                kind: "ExportNamedStatement",
                names: node.exportClause.elements.map(exportSpecifierName),
            };
        }
        fail("Unsupported export declaration.");
    }

    if (ts.isInterfaceDeclaration(node)) return convertInterface(node);
    if (ts.isTypeAliasDeclaration(node)) return convertTypeAlias(node);
    if (ts.isEnumDeclaration(node)) return convertEnum(node);
    if (ts.isEmptyStatement(node)) return null;

    if (ts.isExpressionStatement(node)) {
        return {
            kind: "LineTerminatedExpression",
            expressions: [convertExpression(node.expression, ctx)],
        };
    }

    fail(`Unsupported statement: ${ts.SyntaxKind[node.kind]}`);
}

function hasExportModifier(node: ts.Node): boolean {
    return (
        ts.canHaveModifiers(node) &&
        modifierNamed(node, ts.SyntaxKind.ExportKeyword)
    );
}

function convertStatements(
    statements: readonly ts.Statement[],
    ctx: Ctx,
): Ast[] {
    const out: Ast[] = [];
    for (const statement of statements) {
        try {
            if (
                hasExportModifier(statement) &&
                !ts.isExportDeclaration(statement) &&
                !ts.isExportAssignment(statement)
            ) {
                const exported = convertExportDeclarationStatement(
                    statement,
                    ctx,
                );
                const declaration =
                    exported.kind === "ExportDeclarationStatement"
                        ? exported.declaration
                        : null;
                if (
                    modifierNamed(
                        statement as ts.HasModifiers,
                        ts.SyntaxKind.DefaultKeyword,
                    )
                ) {
                    if (
                        declaration?.kind !== "FunctionDeclaration" &&
                        declaration?.kind !== "ClassDeclaration"
                    ) {
                        fail(
                            "Only functions and classes can be default-exported declarations.",
                        );
                    }
                    out.push(
                        decorate(
                            {
                                kind: "ExportDefaultStatement",
                                value: declaration,
                            },
                            statement,
                        ),
                    );
                } else {
                    out.push(decorate(exported, statement));
                }
                continue;
            }

            const converted = convertStatement(statement, ctx);
            if (converted === null) continue;
            if (Array.isArray(converted)) {
                out.push(...converted);
            } else {
                out.push(decorate(converted, statement));
            }
        } catch (error) {
            if (error instanceof ConversionError) throw error;
            const message =
                error instanceof Error ? error.message : String(error);
            throw new ConversionError(
                message,
                statement.getStart(ctx.sourceFile),
                "I could not convert this TypeScript.",
                "This is valid TypeScript, but this construct is not represented by the current Coed AST.",
                "Check the marked syntax and choose a construct represented by Coed's AST.",
            );
        }
    }
    return out;
}

function assignmentTarget(expr: Expression): Expression {
    if (
        expr.kind === "NameLookupExpression" ||
        expr.kind === "ObjectPropertyExpression" ||
        expr.kind === "ArrayAccessExpression"
    ) {
        return expr;
    }
    fail("Expected an assignment target");
}

function assignmentTargetToString(expr: Expression): string {
    if (expr.kind === "NameLookupExpression") return expr.name;
    if (expr.kind === "ThisExpression") return "this";
    if (
        expr.kind === "ObjectPropertyExpression" &&
        expr.property.kind === "NameLookupExpression"
    ) {
        return `${assignmentTargetToString(expr.object)}.${expr.property.name}`;
    }
    if (expr.kind === "ArrayAccessExpression") {
        const array = assignmentTargetToString(expr.array);
        if (expr.index.kind === "NumberExpression") {
            return `${array}[${expr.index.value}]`;
        }
        if (expr.index.kind === "NameLookupExpression") {
            return `${array}[${expr.index.name}]`;
        }
    }
    fail("Expected a valid += or -= assignment target");
}

function convertPropertyName(name: ts.PropertyName): Expression {
    if (ts.isIdentifier(name))
        return { kind: "NameLookupExpression", name: name.text };
    if (ts.isNumericLiteral(name))
        return { kind: "NameLookupExpression", name: name.text };
    if (ts.isStringLiteral(name)) {
        return {
            kind: "StringLiteralExpression",
            values: [{ kind: "StringExpression", value: name.text }],
        };
    }
    fail("Unsupported object key.");
}

function asChainable(expr: Expression): ChainableExpression {
    switch (expr.kind) {
        case "NameLookupExpression":
        case "ThisExpression":
        case "SuperExpression":
        case "NewExpression":
        case "FunctionCallExpression":
        case "CallExpression":
        case "ObjectPropertyExpression":
        case "ObjectMethodCallExpression":
        case "ArrayAccessExpression":
        case "StringExpression":
        case "StringLiteralExpression":
        case "RegexExpression":
        case "ArrayExpression":
        case "ParenthesizedExpression":
            return expr;
        default:
            return { kind: "ParenthesizedExpression", value: expr };
    }
}

const BITWISE_OPERATOR_MAP: Partial<
    Record<ts.SyntaxKind, BitwiseExpression["operator"]>
> = {
    [ts.SyntaxKind.AmpersandToken]: "&",
    [ts.SyntaxKind.BarToken]: "|",
    [ts.SyntaxKind.CaretToken]: "^",
    [ts.SyntaxKind.LessThanLessThanToken]: "<<",
    [ts.SyntaxKind.GreaterThanGreaterThanToken]: ">>",
    [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: ">>>",
    [ts.SyntaxKind.AsteriskAsteriskToken]: "**",
};

const BINARY_OPERATOR_MAP: Partial<Record<ts.SyntaxKind, Expression["kind"]>> =
    {
        [ts.SyntaxKind.PlusToken]: "AdditionExpression",
        [ts.SyntaxKind.MinusToken]: "SubtractionExpression",
        [ts.SyntaxKind.AsteriskToken]: "MultiplicationExpression",
        [ts.SyntaxKind.SlashToken]: "DivisionExpression",
        [ts.SyntaxKind.PercentToken]: "ModuloExpression",
        [ts.SyntaxKind.CommaToken]: "CommaExpression",
        [ts.SyntaxKind.InstanceOfKeyword]: "InstanceOfExpression",
        [ts.SyntaxKind.AmpersandAmpersandToken]: "AndExpression",
        [ts.SyntaxKind.BarBarToken]: "OrExpression",
        [ts.SyntaxKind.EqualsEqualsEqualsToken]: "EqualityExpression",
        [ts.SyntaxKind.EqualsEqualsToken]: "LooseEqualityExpression",
        [ts.SyntaxKind.ExclamationEqualsEqualsToken]: "InequalityExpression",
        [ts.SyntaxKind.ExclamationEqualsToken]: "LooseInequalityExpression",
        [ts.SyntaxKind.LessThanToken]: "LessThanExpression",
        [ts.SyntaxKind.InKeyword]: "InExpression",
        [ts.SyntaxKind.QuestionQuestionToken]: "NullishCoalescingExpression",
        [ts.SyntaxKind.GreaterThanToken]: "MoreThanExpression",
        [ts.SyntaxKind.LessThanEqualsToken]: "LessThanOrEqualExpression",
        [ts.SyntaxKind.GreaterThanEqualsToken]: "MoreThanOrEqualExpression",
    };

function convertBinary(node: ts.BinaryExpression, ctx: Ctx): Expression {
    const operator = node.operatorToken.kind;

    if (operator === ts.SyntaxKind.EqualsToken) {
        const target = assignmentTarget(convertExpression(node.left, ctx));
        return {
            kind: "AssignmentExpression",
            target: target as Expression & {
                kind:
                    | "NameLookupExpression"
                    | "ObjectPropertyExpression"
                    | "ArrayAccessExpression";
            },
            value: convertExpression(node.right, ctx),
        };
    }

    if (
        operator === ts.SyntaxKind.PlusEqualsToken ||
        operator === ts.SyntaxKind.MinusEqualsToken
    ) {
        const variable = assignmentTargetToString(
            convertExpression(node.left, ctx),
        );
        const amount = convertExpression(node.right, ctx);
        return operator === ts.SyntaxKind.PlusEqualsToken
            ? { kind: "IncreaseExpression", variable, amount }
            : { kind: "DecreaseExpression", variable, amount };
    }

    const bitwiseOperator = BITWISE_OPERATOR_MAP[operator];
    if (bitwiseOperator) {
        const parent: Expression = {
            kind: "BitwiseExpression",
            operator: bitwiseOperator,
            left: NULL_EXPRESSION,
            right: NULL_EXPRESSION,
        };
        return {
            kind: "BitwiseExpression",
            operator: bitwiseOperator,
            left: convertOperand(node.left, ctx, parent, false),
            right: convertOperand(node.right, ctx, parent, true),
        };
    }

    const kind = BINARY_OPERATOR_MAP[operator];
    if (!kind) fail(`Unsupported binary operator: ${ts.SyntaxKind[operator]}`);

    const parent = {
        kind,
        left: NULL_EXPRESSION,
        right: NULL_EXPRESSION,
    } as Expression;
    return {
        kind,
        left: convertOperand(node.left, ctx, parent, false),
        right: convertOperand(node.right, ctx, parent, true),
    } as Expression;
}

const NULL_EXPRESSION: Expression = { kind: "NullExpression" };

const BITWISE_PRECEDENCE: Record<BitwiseOperator, number> = {
    "|": 3,
    "^": 3.2,
    "&": 3.4,
    "<<": 5.5,
    ">>": 5.5,
    ">>>": 5.5,
    "**": 8,
};

// Higher binds tighter; 99 means the expression never needs parentheses.
function precedence(expression: Expression): number {
    switch (expression.kind) {
        case "OrExpression":
        case "NullishCoalescingExpression":
            return 1;
        case "AndExpression":
            return 2;
        case "BitwiseExpression":
            return BITWISE_PRECEDENCE[expression.operator];
        case "EqualityExpression":
        case "InequalityExpression":
        case "LooseEqualityExpression":
        case "LooseInequalityExpression":
            return 4;
        case "LessThanExpression":
        case "MoreThanExpression":
        case "LessThanOrEqualExpression":
        case "MoreThanOrEqualExpression":
        case "InExpression":
        case "InstanceOfExpression":
            return 5;
        case "AdditionExpression":
        case "SubtractionExpression":
            return 6;
        case "MultiplicationExpression":
        case "DivisionExpression":
        case "ModuloExpression":
            return 7;
        case "NegationExpression":
        case "UnaryExpression":
        case "PrefixIncrementExpression":
        case "PrefixDecrementExpression":
        case "AwaitExpression":
            return 9;
        case "ConditionalExpression":
        case "ArrowFunctionExpression":
        case "AssignmentExpression":
        case "IncreaseExpression":
        case "DecreaseExpression":
        case "SpreadExpression":
        case "CommaExpression":
            return 0;
        default:
            return 99;
    }
}

function wordUnaryOperand(value: Expression): Expression {
    return precedence(value) < 9
        ? { kind: "ParenthesizedExpression", value }
        : value;
}

// Source parentheses are kept only where dropping them would change the generated meaning.
function convertOperand(
    node: ts.Expression,
    ctx: Ctx,
    parent: Expression,
    isRight: boolean,
): Expression {
    const value = convertExpression(node, ctx);
    if (!ts.isParenthesizedExpression(node)) return value;

    const child = precedence(value);
    if (child === 99) return value;

    const isLogical = (kind: Expression["kind"]) =>
        kind === "OrExpression" || kind === "AndExpression";
    const mixesNullish =
        (parent.kind === "NullishCoalescingExpression" &&
            isLogical(value.kind)) ||
        (value.kind === "NullishCoalescingExpression" &&
            isLogical(parent.kind));
    const isExponent =
        parent.kind === "BitwiseExpression" && parent.operator === "**";
    const parentRank = precedence(parent);
    const needsParentheses =
        mixesNullish ||
        child < parentRank ||
        (child === parentRank && (isRight || isExponent));

    return needsParentheses
        ? { kind: "ParenthesizedExpression", value }
        : value;
}

function convertElementAccess(
    node: ts.ElementAccessExpression,
    ctx: Ctx,
): Expression {
    const object = asChainable(convertExpression(node.expression, ctx));
    if (ts.isStringLiteral(node.argumentExpression)) {
        const property: ObjectPropertyExpression["property"] = {
            kind: "StringLiteralExpression",
            values: [
                {
                    kind: "StringExpression",
                    value: node.argumentExpression.text,
                },
            ],
        };
        return { kind: "ObjectPropertyExpression", object, property };
    }

    const index = convertExpression(node.argumentExpression, ctx);
    return {
        kind: "ArrayAccessExpression",
        array: object,
        index,
    } satisfies ArrayAccessExpression;
}

function convertCall(node: ts.CallExpression, ctx: Ctx): Expression {
    if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        return {
            kind: "ImportExpression",
            source: convertExpression(node.arguments[0], ctx),
        };
    }

    const args = node.arguments.map((a) => convertExpression(a, ctx));

    if (ts.isIdentifier(node.expression)) {
        return {
            kind: "FunctionCallExpression",
            functionName: node.expression.text,
            arguments: args,
        };
    }

    if (node.expression.kind === ts.SyntaxKind.SuperKeyword) {
        return {
            kind: "FunctionCallExpression",
            functionName: "super",
            arguments: args,
        };
    }

    if (ts.isPropertyAccessExpression(node.expression)) {
        const object = asChainable(
            convertExpression(node.expression.expression, ctx),
        );
        return {
            kind: "ObjectMethodCallExpression",
            object,
            method: {
                kind: "NameLookupExpression",
                name: node.expression.name.text,
            },
            arguments: args,
        };
    }

    return {
        kind: "CallExpression",
        callee: asChainable(convertExpression(node.expression, ctx)),
        arguments: args,
    };
}

function convertExpression(node: ts.Expression, ctx: Ctx): Expression {
    if (ts.isParenthesizedExpression(node))
        return convertExpression(node.expression, ctx);
    if (
        ts.isAsExpression(node) ||
        ts.isSatisfiesExpression(node) ||
        ts.isTypeAssertionExpression(node) ||
        ts.isNonNullExpression(node)
    ) {
        return convertExpression(node.expression, ctx);
    }

    if (ts.isNumericLiteral(node))
        return { kind: "NumberExpression", value: Number(node.text) };

    if (ts.isPrefixUnaryExpression(node)) {
        if (
            node.operator === ts.SyntaxKind.MinusToken &&
            ts.isNumericLiteral(node.operand)
        ) {
            return {
                kind: "NumberExpression",
                value: -Number(node.operand.text),
            };
        }
        if (node.operator === ts.SyntaxKind.ExclamationToken) {
            return {
                kind: "NegationExpression",
                value: convertOperand(
                    node.operand,
                    ctx,
                    { kind: "NegationExpression", value: NULL_EXPRESSION },
                    true,
                ),
            };
        }
        if (
            node.operator === ts.SyntaxKind.PlusPlusToken ||
            node.operator === ts.SyntaxKind.MinusMinusToken
        ) {
            const variable = assignmentTargetToString(
                convertExpression(node.operand, ctx),
            );
            return node.operator === ts.SyntaxKind.PlusPlusToken
                ? { kind: "PrefixIncrementExpression", variable }
                : { kind: "PrefixDecrementExpression", variable };
        }
        const unaryOperators: Partial<
            Record<ts.PrefixUnaryOperator, "-" | "+" | "~">
        > = {
            [ts.SyntaxKind.MinusToken]: "-",
            [ts.SyntaxKind.PlusToken]: "+",
            [ts.SyntaxKind.TildeToken]: "~",
        };
        const operator = unaryOperators[node.operator];
        if (operator) {
            const stub: Expression = {
                kind: "UnaryExpression",
                operator,
                value: NULL_EXPRESSION,
            };
            const operand = convertOperand(node.operand, ctx, stub, true);
            // `- -x` would otherwise generate as the decrement `--x`.
            const nestsSign =
                operand.kind === "UnaryExpression" ||
                operand.kind === "PrefixIncrementExpression" ||
                operand.kind === "PrefixDecrementExpression";
            return {
                kind: "UnaryExpression",
                operator,
                value: nestsSign
                    ? { kind: "ParenthesizedExpression", value: operand }
                    : operand,
            };
        }
        fail(`Unsupported prefix operator: ${ts.SyntaxKind[node.operator]}`);
    }

    if (ts.isVoidExpression(node) || ts.isDeleteExpression(node)) {
        return {
            kind: "UnaryExpression",
            operator: ts.isVoidExpression(node) ? "void" : "delete",
            value: wordUnaryOperand(convertExpression(node.expression, ctx)),
        };
    }

    if (ts.isTypeOfExpression(node)) {
        return {
            kind: "UnaryExpression",
            operator: "typeof",
            value: wordUnaryOperand(convertExpression(node.expression, ctx)),
        };
    }

    if (ts.isPostfixUnaryExpression(node)) {
        const variable = assignmentTargetToString(
            convertExpression(node.operand, ctx),
        );
        return node.operator === ts.SyntaxKind.PlusPlusToken
            ? { kind: "IncrementExpression", variable }
            : { kind: "DecrementExpression", variable };
    }

    if (ts.isStringLiteral(node))
        return { kind: "StringExpression", value: node.text };

    if (ts.isNoSubstitutionTemplateLiteral(node)) {
        return {
            kind: "StringLiteralExpression",
            values: [{ kind: "StringExpression", value: node.text }],
        };
    }

    if (ts.isTemplateExpression(node)) {
        return {
            kind: "StringLiteralExpression",
            values: [
                {
                    kind: "StringExpression",
                    value: node.getText(ctx.sourceFile).slice(1, -1),
                },
            ],
        };
    }

    if (node.kind === ts.SyntaxKind.TrueKeyword)
        return { kind: "BooleanExpression", value: true };
    if (node.kind === ts.SyntaxKind.FalseKeyword)
        return { kind: "BooleanExpression", value: false };
    if (node.kind === ts.SyntaxKind.NullKeyword)
        return { kind: "NullExpression" };
    if (node.kind === ts.SyntaxKind.ThisKeyword)
        return { kind: "ThisExpression" };
    if (node.kind === ts.SyntaxKind.SuperKeyword)
        return { kind: "SuperExpression" };

    if (ts.isIdentifier(node)) {
        return node.text === "undefined"
            ? { kind: "NullExpression" }
            : { kind: "NameLookupExpression", name: node.text };
    }

    if (ts.isArrayLiteralExpression(node)) {
        return {
            kind: "ArrayExpression",
            elements: node.elements.map((e) => convertExpression(e, ctx)),
        };
    }

    if (ts.isObjectLiteralExpression(node)) {
        const properties: Record<string, Expression> = {};
        for (const prop of node.properties) {
            if (ts.isSpreadAssignment(prop)) {
                properties[`...${Object.keys(properties).length}`] = {
                    kind: "SpreadExpression",
                    value: convertExpression(prop.expression, ctx),
                };
                continue;
            }
            if (ts.isShorthandPropertyAssignment(prop)) {
                properties[prop.name.text] = {
                    kind: "NameLookupExpression",
                    name: prop.name.text,
                };
                continue;
            }
            if (
                ts.isMethodDeclaration(prop) ||
                ts.isGetAccessorDeclaration(prop) ||
                ts.isSetAccessorDeclaration(prop)
            ) {
                const nameNode = prop.name;
                if (
                    !ts.isIdentifier(nameNode) &&
                    !ts.isStringLiteral(nameNode) &&
                    !ts.isNumericLiteral(nameNode)
                ) {
                    fail("Unsupported object member name.");
                }
                if (!prop.body) fail("Object members must have a body.");
                if (ts.isMethodDeclaration(prop) && prop.asteriskToken) {
                    fail(
                        "Generator functions are not supported in this Coed AST.",
                    );
                }
                const memberKind = ts.isGetAccessorDeclaration(prop)
                    ? "get"
                    : ts.isSetAccessorDeclaration(prop)
                      ? "set"
                      : "method";
                const parameters = convertParameters(prop.parameters, ctx);
                properties[
                    memberKind === "method"
                        ? nameNode.text
                        : `${memberKind} ${nameNode.text}`
                ] = {
                    kind: "ObjectMemberExpression",
                    memberKind,
                    name: nameNode.text,
                    isAsync: modifierNamed(prop, ts.SyntaxKind.AsyncKeyword),
                    parameters: parameters.names,
                    body: [
                        ...parameters.prelude,
                        ...convertStatements(
                            prop.body.statements,
                            withFunction(ctx),
                        ),
                    ],
                };
                continue;
            }
            if (!ts.isPropertyAssignment(prop))
                fail(
                    "Only simple `key: value` object properties are supported.",
                );
            if (ts.isComputedPropertyName(prop.name)) {
                properties[`[${Object.keys(properties).length}]`] = {
                    kind: "ComputedPropertyExpression",
                    key: convertExpression(prop.name.expression, ctx),
                    value: convertExpression(prop.initializer, ctx),
                };
                continue;
            }
            const key = convertPropertyName(prop.name);
            const keyName =
                key.kind === "NameLookupExpression"
                    ? key.name
                    : (key as { values: { value: string }[] }).values[0].value;
            properties[keyName] = convertExpression(prop.initializer, ctx);
        }
        return { kind: "ObjectExpression", properties };
    }

    if (ts.isBinaryExpression(node)) return convertBinary(node, ctx);
    if (ts.isElementAccessExpression(node))
        return convertElementAccess(node, ctx);
    if (ts.isCallExpression(node)) return convertCall(node, ctx);

    if (ts.isNewExpression(node)) {
        return {
            kind: "NewExpression",
            callee: convertExpression(node.expression, ctx),
            arguments: (node.arguments ?? []).map((a) =>
                convertExpression(a, ctx),
            ),
        };
    }

    if (ts.isPropertyAccessExpression(node)) {
        const object = asChainable(convertExpression(node.expression, ctx));
        return {
            kind: "ObjectPropertyExpression",
            object,
            property: { kind: "NameLookupExpression", name: node.name.text },
        };
    }

    if (ts.isMetaProperty(node)) {
        return {
            kind: "NameLookupExpression",
            name: `${ts.tokenToString(node.keywordToken)}.${node.name.text}`,
        };
    }

    if (ts.isRegularExpressionLiteral(node)) {
        return { kind: "RegexExpression", source: node.text };
    }

    if (ts.isSpreadElement(node)) {
        return {
            kind: "SpreadExpression",
            value: convertExpression(node.expression, ctx),
        };
    }

    if (ts.isConditionalExpression(node)) {
        return {
            kind: "ConditionalExpression",
            condition: convertExpression(node.condition, ctx),
            whenTrue: convertExpression(node.whenTrue, ctx),
            whenFalse: convertExpression(node.whenFalse, ctx),
        };
    }

    if (ts.isAwaitExpression(node))
        return {
            kind: "AwaitExpression",
            value: convertExpression(node.expression, ctx),
        };

    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
        const parameters = convertParameters(node.parameters, ctx);
        const hasPrelude = parameters.prelude.length > 0;
        const bodyCtx = withFunction(ctx);
        let body: Ast[] | Expression;
        if (ts.isBlock(node.body)) {
            const statements = convertStatements(node.body.statements, bodyCtx);
            body = hasPrelude
                ? [...parameters.prelude, ...statements]
                : statements;
        } else {
            const value = convertExpression(node.body, bodyCtx);
            body = hasPrelude
                ? [...parameters.prelude, { kind: "ReturnStatement", value }]
                : value;
        }
        return {
            kind: "ArrowFunctionExpression",
            isAsync: modifierNamed(node, ts.SyntaxKind.AsyncKeyword),
            parameters: parameters.names,
            body,
        };
    }

    fail(`Unsupported expression: ${ts.SyntaxKind[node.kind]}`);
}

function parseSource(
    input: string,
    fileName: string,
    scriptKind: ts.ScriptKind,
): Result<Program> {
    const sourceFile = ts.createSourceFile(
        fileName,
        input,
        ts.ScriptTarget.Latest,
        true,
        scriptKind,
    );
    try {
        const diagnostic = ts.transpileModule(input, {
            fileName,
            reportDiagnostics: true,
            compilerOptions: { jsx: ts.JsxEmit.Preserve },
        }).diagnostics?.[0];
        if (diagnostic) {
            const message = ts.flattenDiagnosticMessageText(
                diagnostic.messageText,
                "\n",
            );
            return {
                kind: "Err",
                error: formatLocatedError(
                    message,
                    diagnostic.start ?? 0,
                    input,
                    "I could not parse this TypeScript.",
                    "The TypeScript compiler could not build a syntax tree for this input.",
                    "Correct the syntax at the marked location and try parsing again.",
                ),
            };
        }

        const statements = convertStatements(
            sourceFile.statements,
            rootCtx(sourceFile),
        );

        const program: Program = [];
        for (const statement of statements) {
            if (statement.kind === "LineTerminatedExpression") {
                program.push(...statement.expressions);
                continue;
            }
            program.push(statement);
        }

        return { kind: "Ok", value: program };
    } catch (error) {
        if (error instanceof ConversionError) {
            return {
                kind: "Err",
                error: formatLocatedError(
                    error.message,
                    error.position,
                    input,
                    error.title,
                    error.hint,
                    error.suggestion,
                ),
            };
        }
        return {
            kind: "Err",
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/** Parse source as TypeScript and convert it into Coed's Ast shape. */
export function parse(input: string): Result<Program> {
    return parseSource(input, "input.ts", ts.ScriptKind.TS);
}

/** Parse source using a filename to select TypeScript, TSX, JavaScript, or JSX syntax. */
export function parseTypeScript(
    input: string,
    fileName: string,
): Result<Program> {
    const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    const scriptKind =
        extension === ".tsx" || extension === ".jsx"
            ? ts.ScriptKind.TSX
            : extension === ".js"
              ? ts.ScriptKind.JS
              : ts.ScriptKind.TS;
    return parseSource(input, fileName, scriptKind);
}

/** Parse a single expression using the compiler-backed parser. */
export function parseExpression(input: string): Result<Expression> {
    // `super` alone is not valid TypeScript, but Coed models it as an expression.
    if (input.trim() === "super") {
        return { kind: "Ok", value: { kind: "SuperExpression" } };
    }
    const result = parse(`(${input});`);
    if (result.kind === "Err") return result;
    const value = result.value[0];
    if (!isExpression(value)) {
        return { kind: "Err", error: "Expected an expression" };
    }
    return { kind: "Ok", value };
}
