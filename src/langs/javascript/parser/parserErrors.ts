import type {
    DetailedParseError,
    Err,
    ParserState,
    SourceLocation,
} from "../types.ts";
import { tokenIs } from "./parserHelpers.ts";
import type {
    ParsedBlockResult,
    ParsedExpressionResult,
    ParsedStatementResult,
    Token,
} from "./types.ts";

function tokenSummary(token: Token): string {
    switch (token.kind) {
        case "IdentifierToken": {
            return `identifier (${token.name})`;
        }
        case "StringToken": {
            return `string (${token.value})`;
        }
        case "NumberToken": {
            return `number (${token.value})`;
        }
        default: {
            return token.kind;
        }
    }
}

function locate(input: string, index: number): SourceLocation {
    const lines = input.split("\n");
    let runningTotal = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLengthWithNewline = line.length + 1;

        if (index < runningTotal + lineLengthWithNewline) {
            return {
                line: i + 1,
                column: Math.max(1, index - runningTotal + 1),
                lineText: line,
            };
        }

        runningTotal += lineLengthWithNewline;
    }

    const lastLine = lines.length === 0 ? "" : lines[lines.length - 1];
    return {
        line: Math.max(1, lines.length),
        column: Math.max(1, lastLine.length),
        lineText: lastLine,
    };
}

function tokenOrEndSummary(token: Token | undefined): string {
    if (typeof token === "undefined") {
        return "the end of input";
    }

    return tokenSummary(token);
}

function expressionCanStart(token: Token | undefined): boolean {
    if (typeof token === "undefined") return false;

    return (
        token.kind === "NumberToken" ||
        token.kind === "StringToken" ||
        token.kind === "IdentifierToken" ||
        token.kind === "TrueToken" ||
        token.kind === "FalseToken" ||
        token.kind === "NullToken" ||
        token.kind === "LeftParenToken" ||
        token.kind === "LeftBracketToken" ||
        token.kind === "LeftBraceToken" ||
        token.kind === "NegationToken" ||
        token.kind === "TypeofToken"
    );
}

function explainExpressionFailure(
    tokens: Token[],
    index: number,
    parsedInnerParen: ParsedExpressionResult | null,
): DetailedParseError {
    const token = tokens[index];

    if (!token) {
        return {
            problem:
                "I expected an expression here, but I reached the end of input.",
            hint: 'Add a value such as `1`, `"text"`, a variable name, function call, array, or object.',
            suggestion: "I think you meant: `1`",
            focusToken: null,
        };
    }

    if (!expressionCanStart(token)) {
        if (
            token.kind === "AdditionToken" ||
            token.kind === "SubtractionToken" ||
            token.kind === "MultiplicationToken" ||
            token.kind === "DivisionToken"
        ) {
            return {
                problem: `An expression cannot start with the operator ${tokenSummary(token)}.`,
                hint: "Put a value before this operator, like `1 + 2`.",
                suggestion: "I think you meant: `1 + 2`",
                focusToken: token,
            };
        }

        return {
            problem: `I expected an expression, but found ${tokenSummary(token)}.`,
            hint: 'Valid expressions start with a value like `1`, `"text"`, a variable, `(`, `[`, or `{`.',
            suggestion: "I think you meant: `someValue`",
            focusToken: token,
        };
    }

    if (token.kind === "LeftParenToken") {
        const innerStart = index + 1;
        if (!expressionCanStart(tokens[innerStart])) {
            return {
                problem: `After '(', I expected an expression but found ${tokenOrEndSummary(tokens[innerStart])}.`,
                hint: "Write an expression inside the parentheses, like `(x + 1)`.",
                suggestion: "I think you meant: `(x + 1)`",
                focusToken: tokens[innerStart] || token,
            };
        }

        if (parsedInnerParen === null) {
            return {
                problem: "I expected an expression inside '()'.",
                hint: "Write an expression inside the parentheses, like `(x + 1)`.",
                suggestion: "I think you meant: `(x + 1)`",
                focusToken: tokens[innerStart] || token,
            };
        }

        if (parsedInnerParen.kind === "Err") {
            return {
                problem: "I expected an expression inside '()'.",
                hint: parsedInnerParen.error,
                suggestion: null,
                focusToken: tokens[innerStart] || token,
            };
        }

        const closing = tokens[parsedInnerParen.value.index];
        if (!tokenIs(closing, "RightParenToken")) {
            return {
                problem: `I expected ')' to close this expression, but found ${tokenOrEndSummary(closing)}.`,
                hint: "Add ')' to close the opening '('.",
                suggestion: "I think you meant: `(1 + 2)`",
                focusToken: closing || token,
            };
        }
    }

    if (token.kind === "IdentifierToken") {
        const next = tokens[index + 1];
        if (
            tokenIs(next, "DotToken") &&
            !tokenIs(tokens[index + 2], "IdentifierToken")
        ) {
            return {
                problem: `After '.', I expected a property name, but found ${tokenOrEndSummary(tokens[index + 2])}.`,
                hint: "Use dot-access like `object.property`.",
                suggestion: "I think you meant: `object.property`",
                focusToken: tokens[index + 2] || next,
            };
        }

        if (tokenIs(next, "LeftBracketToken")) {
            const indexToken = tokens[index + 2];
            if (
                !tokenIs(indexToken, "NumberToken") &&
                !tokenIs(indexToken, "StringToken")
            ) {
                return {
                    problem: `Inside '[...]', I expected a number or string index, but found ${tokenOrEndSummary(indexToken)}.`,
                    hint: 'Use `arr[0]` or `obj["key"]` in this subset.',
                    suggestion: "I think you meant: `arr[0]`",
                    focusToken: indexToken || next,
                };
            }

            const close = tokens[index + 3];
            if (!tokenIs(close, "RightBracketToken")) {
                return {
                    problem: `I expected ']' to close this index access, but found ${tokenOrEndSummary(close)}.`,
                    hint: "Add ']' after the index expression.",
                    suggestion: "I think you meant: `arr[0]`",
                    focusToken: close || indexToken,
                };
            }
        }
    }

    return {
        problem: `I could not parse this expression starting at ${tokenSummary(token)}.`,
        hint: "Try simplifying the expression and checking parentheses, commas, and brackets.",
        suggestion: "I think you meant: `someValue`",
        focusToken: token,
    };
}

function explainLetOrConstFailure(
    tokens: Token[],
    index: number,
    keyword: "let" | "const",
    parsedValue: ParsedExpressionResult | null,
    parsedInnerParen: ParsedExpressionResult | null,
): DetailedParseError | null {
    const name = tokens[index + 1];
    if (!tokenIs(name, "IdentifierToken")) {
        return {
            problem: `After '${keyword}', I expected a variable name, but found ${tokenOrEndSummary(name)}.`,
            hint: `Try writing: ${keyword} total = 0;`,
            suggestion: null,
            focusToken: name || tokens[index],
        };
    }

    const assign = tokens[index + 2];
    if (!tokenIs(assign, "AssignToken")) {
        return {
            problem: `After '${name.name}', I expected '=' but found ${tokenOrEndSummary(assign)}.`,
            hint: `Try writing: ${keyword} ${name.name} = <expression>;`,
            suggestion: null,
            focusToken: assign || name,
        };
    }

    const valueStart = index + 3;
    if (parsedValue === null || parsedValue.kind === "Err") {
        const expressionDetails = explainExpressionFailure(
            tokens,
            valueStart,
            parsedInnerParen,
        );
        return {
            problem: `I expected a value after '=' in this ${keyword} statement. ${expressionDetails.problem}`,
            hint: `${expressionDetails.hint} For example: ${keyword} ${name.name} = 1;`,
            suggestion:
                expressionDetails.suggestion ||
                `I think you meant: \`${keyword} ${name.name} = 1;\``,
            focusToken:
                expressionDetails.focusToken || tokens[valueStart] || assign,
        };
    }

    return null;
}

function explainIfFailure(
    tokens: Token[],
    index: number,
    condition: ParsedExpressionResult,
    thenBranch: ParsedBlockResult | null,
    elseBranch: ParsedBlockResult | null,
): DetailedParseError | null {
    const leftParen = tokens[index + 1];
    if (!tokenIs(leftParen, "LeftParenToken")) {
        return {
            problem: `After 'if', I expected '(' to start the condition, but found ${tokenOrEndSummary(leftParen)}.`,
            hint: "Try writing: if (condition) { ... }",
            suggestion: null,
            focusToken: leftParen || tokens[index],
        };
    }

    const conditionStart = index + 2;
    if (condition.kind === "Err") {
        const expressionDetails = explainExpressionFailure(
            tokens,
            conditionStart,
            null,
        );
        return {
            problem: `I expected a condition inside 'if (...)'. ${expressionDetails.problem}`,
            hint: `${expressionDetails.hint} Example: if (x > 0) { ... }`,
            suggestion:
                expressionDetails.suggestion ||
                "I think you meant: `if (x > 0) { ... }`",
            focusToken:
                expressionDetails.focusToken ||
                tokens[conditionStart] ||
                leftParen,
        };
    }

    const rightParen = tokens[condition.value.index];
    if (!tokenIs(rightParen, "RightParenToken")) {
        return {
            problem: `I expected ')' to close the if condition, but found ${tokenOrEndSummary(rightParen)}.`,
            hint: "Add ')' before the opening '{'.",
            focusToken: rightParen || tokens[condition.value.index - 1],
            suggestion: null,
        };
    }

    const thenStart = condition.value.index + 1;
    const thenBrace = tokens[thenStart];
    if (!tokenIs(thenBrace, "LeftBraceToken")) {
        return {
            problem: `After 'if (...)', I expected '{' to start the then-branch, but found ${tokenOrEndSummary(thenBrace)}.`,
            hint: "Try writing: if (condition) { ... }",
            focusToken: thenBrace || rightParen,
            suggestion: null,
        };
    }

    if (thenBranch === null) {
        return {
            problem:
                "I could not inspect the then-branch for this if statement.",
            hint: "Try writing: if (condition) { ... }",
            focusToken: thenBrace || rightParen,
            suggestion: null,
        };
    }

    if (thenBranch.body === null) {
        return {
            problem: `There is an invalid statement inside the if block near ${tokenOrEndSummary(tokens[thenBranch.index])}.`,
            hint: "Fix the statement inside `{ ... }`, then try again.",
            focusToken: tokens[thenBranch.index] || thenBrace,
            suggestion: null,
        };
    }

    const elseToken = tokens[thenBranch.index];
    if (tokenIs(elseToken, "ElseToken")) {
        const afterElse = tokens[thenBranch.index + 1];
        if (!afterElse) {
            return {
                problem: "I found 'else' but there is nothing after it.",
                hint: "Write either `else if (condition) { ... }` or `else { ... }`.",
                focusToken: elseToken,
                suggestion: null,
            };
        }

        if (
            !tokenIs(afterElse, "IfToken") &&
            !tokenIs(afterElse, "LeftBraceToken")
        ) {
            return {
                problem: `After 'else', I expected either 'if' or '{', but found ${tokenSummary(afterElse)}.`,
                hint: "Write either `else if (...) { ... }` or `else { ... }`.",
                focusToken: afterElse,
                suggestion: null,
            };
        }

        if (tokenIs(afterElse, "LeftBraceToken")) {
            if (elseBranch === null) {
                return {
                    problem:
                        "I could not inspect the else block for this if statement.",
                    hint: "Write either `else if (...) { ... }` or `else { ... }`.",
                    focusToken: afterElse,
                    suggestion: null,
                };
            }

            if (elseBranch.body === null) {
                return {
                    problem: `There is an invalid statement inside the else block near ${tokenOrEndSummary(tokens[elseBranch.index])}.`,
                    hint: "Fix the statement inside the else `{ ... }` block.",
                    focusToken: tokens[elseBranch.index] || afterElse,
                    suggestion: null,
                };
            }
        }
    }

    return null;
}

function explainForFailure(
    tokens: Token[],
    index: number,
    init: ParsedStatementResult | null,
    initValue: ParsedExpressionResult | null,
    initInnerParen: ParsedExpressionResult | null,
    condition: ParsedExpressionResult | null,
    increment: ParsedExpressionResult | null,
    body: ParsedBlockResult | null,
): DetailedParseError | null {
    const leftParen = tokens[index + 1];
    if (!tokenIs(leftParen, "LeftParenToken")) {
        return {
            problem: `After 'for', I expected '(' to start the loop header, but found ${tokenOrEndSummary(leftParen)}.`,
            hint: "Try writing: for (let i = 0; i < n; i++) { ... }",
            suggestion: null,
            focusToken: leftParen || tokens[index],
        };
    }

    const initLet = tokens[index + 2];
    if (!tokenIs(initLet, "LetToken")) {
        return {
            problem: `Inside 'for (...)', I expected 'let' to start the initializer, but found ${tokenOrEndSummary(initLet)}.`,
            hint: "This parser expects: for (let i = 0; condition; increment) { ... }",
            focusToken: initLet || leftParen,
            suggestion:
                "I think you meant: `for (let i = 0; i < n; i++) { ... }`",
        };
    }

    const initError = explainLetOrConstFailure(
        tokens,
        index + 2,
        "let",
        initValue,
        initInnerParen,
    );
    if (initError) return initError;

    if (init === null) {
        return {
            problem: "I could not inspect the `for` initializer.",
            hint: "Use this shape: for (let i = 0; condition; increment) { ... }",
            focusToken: initLet,
            suggestion:
                "I think you meant: `for (let i = 0; i < n; i++) { ... }`",
        };
    }

    if (init.statement === null) {
        return {
            problem: "I could not parse the `for` initializer.",
            hint: "Use this shape: for (let i = 0; condition; increment) { ... }",
            focusToken: initLet,
            suggestion:
                "I think you meant: `for (let i = 0; i < n; i++) { ... }`",
        };
    }

    const firstSemicolon = tokens[init.index];
    if (!tokenIs(firstSemicolon, "SemicolonToken")) {
        return {
            problem: `After the initializer, I expected ';' but found ${tokenOrEndSummary(firstSemicolon)}.`,
            hint: "A for-loop header needs semicolons between initializer, condition, and increment.",
            focusToken: firstSemicolon || tokens[init.index - 1],
            suggestion:
                "I think you meant: `for (let i = 0; i < n; i++) { ... }`",
        };
    }

    const conditionStart = init.index + 1;
    if (condition === null) {
        return {
            problem: "I could not inspect the for-loop condition.",
            hint: "Use this shape: for (let i = 0; condition; increment) { ... }",
            focusToken: firstSemicolon || initLet,
            suggestion:
                "I think you meant: `for (let i = 0; i < n; i++) { ... }`",
        };
    }

    if (condition.kind === "Err") {
        const expressionDetails = explainExpressionFailure(
            tokens,
            conditionStart,
            null,
        );
        return {
            problem: `I expected a loop condition after the first ';'. ${expressionDetails.problem}`,
            hint: `${expressionDetails.hint} Example: i < 10`,
            suggestion:
                expressionDetails.suggestion || "I think you meant: `i < 10`",
            focusToken:
                expressionDetails.focusToken ||
                tokens[conditionStart] ||
                firstSemicolon,
        };
    }

    const secondSemicolon = tokens[condition.value.index];
    if (!tokenIs(secondSemicolon, "SemicolonToken")) {
        return {
            problem: `After the loop condition, I expected ';' but found ${tokenOrEndSummary(secondSemicolon)}.`,
            hint: "A for-loop header needs two semicolons.",
            focusToken: secondSemicolon || tokens[condition.value.index - 1],
            suggestion:
                "I think you meant: `for (let i = 0; i < n; i++) { ... }`",
        };
    }

    const incrementStart = condition.value.index + 1;
    if (increment === null) {
        return {
            problem:
                "I could not inspect the increment expression for this loop.",
            hint: "Use this shape: for (let i = 0; condition; increment) { ... }",
            focusToken: secondSemicolon || firstSemicolon,
            suggestion:
                "I think you meant: `for (let i = 0; i < n; i++) { ... }`",
        };
    }

    if (increment.kind === "Err") {
        const expressionDetails = explainExpressionFailure(
            tokens,
            incrementStart,
            null,
        );
        return {
            problem: `I expected an increment expression after the second ';'. ${expressionDetails.problem}`,
            hint: `${expressionDetails.hint} Example: i++`,
            suggestion:
                expressionDetails.suggestion || "I think you meant: `i++`",
            focusToken:
                expressionDetails.focusToken ||
                tokens[incrementStart] ||
                secondSemicolon,
        };
    }

    const rightParen = tokens[increment.value.index];
    if (!tokenIs(rightParen, "RightParenToken")) {
        return {
            problem: `I expected ')' to close the for-loop header, but found ${tokenOrEndSummary(rightParen)}.`,
            hint: "Close the loop header before starting the body block.",
            focusToken: rightParen || tokens[increment.value.index - 1],
            suggestion: null,
        };
    }

    const bodyStart = increment.value.index + 1;
    const leftBrace = tokens[bodyStart];
    if (!tokenIs(leftBrace, "LeftBraceToken")) {
        return {
            problem: `After the for-loop header, I expected '{' to start the loop body, but found ${tokenOrEndSummary(leftBrace)}.`,
            hint: "Try writing: for (...) { ... }",
            focusToken: leftBrace || rightParen,
            suggestion: "I think you meant: `for (...) { ... }`",
        };
    }

    if (body === null) {
        return {
            problem: "I could not inspect the for-loop body.",
            hint: "Try writing: for (...) { ... }",
            focusToken: leftBrace || rightParen,
            suggestion: "I think you meant: `for (...) { ... }`",
        };
    }

    if (body.body === null) {
        return {
            problem: `There is an invalid statement inside the for-loop body near ${tokenOrEndSummary(tokens[body.index])}.`,
            hint: "Fix the statement inside the loop body `{ ... }`.",
            focusToken: tokens[body.index] || leftBrace,
            suggestion: "I think you meant: `{ ... }`",
        };
    }

    return null;
}

function explainFunctionFailure(
    tokens: Token[],
    index: number,
    body: ParsedBlockResult | null,
): DetailedParseError | null {
    const name = tokens[index + 1];
    if (!tokenIs(name, "IdentifierToken")) {
        return {
            problem: `After 'function', I expected a function name, but found ${tokenOrEndSummary(name)}.`,
            hint: "Try writing: function sum(a, b) { ... }",
            suggestion: null,
            focusToken: name || tokens[index],
        };
    }

    const leftParen = tokens[index + 2];
    if (!tokenIs(leftParen, "LeftParenToken")) {
        return {
            problem: `After function name '${name.name}', I expected '(' but found ${tokenOrEndSummary(leftParen)}.`,
            hint: "Function parameters must be in parentheses.",
            suggestion: null,
            focusToken: leftParen || name,
        };
    }

    let parameterIndex = index + 3;
    if (!tokenIs(tokens[parameterIndex], "RightParenToken")) {
        while (parameterIndex < tokens.length) {
            const parameter = tokens[parameterIndex];
            if (!tokenIs(parameter, "IdentifierToken")) {
                return {
                    problem: `In the parameter list, I expected a parameter name, but found ${tokenOrEndSummary(parameter)}.`,
                    hint: "Use parameter names like: function sum(a, b) { ... }",
                    suggestion: null,
                    focusToken: parameter || leftParen,
                };
            }

            parameterIndex += 1;
            const separator = tokens[parameterIndex];
            if (tokenIs(separator, "CommaToken")) {
                parameterIndex += 1;
                continue;
            }

            if (tokenIs(separator, "RightParenToken")) {
                break;
            }

            return {
                problem: `After parameter '${parameter.name}', I expected ',' or ')' but found ${tokenOrEndSummary(separator)}.`,
                hint: "Separate parameters with commas, and close with ')'.",
                suggestion: null,
                focusToken: separator || parameter,
            };
        }
    }

    const rightParen = tokens[parameterIndex];
    if (!tokenIs(rightParen, "RightParenToken")) {
        return {
            problem: `I expected ')' to close the function parameter list, but found ${tokenOrEndSummary(rightParen)}.`,
            hint: "Close the parameter list before starting the function body.",
            suggestion: null,
            focusToken: rightParen || leftParen,
        };
    }

    const bodyStart = parameterIndex + 1;
    const leftBrace = tokens[bodyStart];
    if (!tokenIs(leftBrace, "LeftBraceToken")) {
        return {
            problem: `After ')', I expected '{' to start the function body, but found ${tokenOrEndSummary(leftBrace)}.`,
            hint: "Try writing: function name(args) { ... }",
            suggestion: null,
            focusToken: leftBrace || rightParen,
        };
    }

    if (body === null) {
        return {
            problem: "I could not inspect the function body.",
            hint: "Try writing: function name(args) { ... }",
            suggestion: null,
            focusToken: leftBrace || rightParen,
        };
    }

    if (body.body === null) {
        return {
            problem: `There is an invalid statement inside the function body near ${tokenOrEndSummary(tokens[body.index])}.`,
            hint: "Fix the statement inside the function `{ ... }` block.",
            suggestion: null,
            focusToken: tokens[body.index] || leftBrace,
        };
    }

    return null;
}

export type StatementFailureContext = {
    letConstValue?: ParsedExpressionResult | null;
    letConstInnerParen?: ParsedExpressionResult | null;
    ifCondition?: ParsedExpressionResult;
    ifThenBranch?: ParsedBlockResult | null;
    ifElseBranch?: ParsedBlockResult | null;
    forInit?: ParsedStatementResult | null;
    forInitValue?: ParsedExpressionResult | null;
    forInitInnerParen?: ParsedExpressionResult | null;
    forCondition?: ParsedExpressionResult | null;
    forIncrement?: ParsedExpressionResult | null;
    forBody?: ParsedBlockResult | null;
    functionBody?: ParsedBlockResult | null;
};

export type StatementFailureHelpers = {
    parseExpressionAt: (
        tokens: Token[],
        index: number,
    ) => ParsedExpressionResult;
    parseBlock: (
        tokens: Token[],
        startIndex: number,
        parentState?: ParserState,
    ) => ParsedBlockResult;
    parseLetOrConst: (
        state: ParserState,
        isConst: boolean,
        consumeSemicolon: boolean,
    ) => ParsedStatementResult;
    parseStatementAt: (state: ParserState) => ParsedStatementResult;
    createParserState: (
        tokens: Token[],
        index: number,
        insideFunction: boolean,
        insideForLoop: boolean,
    ) => ParserState;
    updateParserState: (
        state: ParserState,
        index: number,
        overrides?: Partial<
            Pick<ParserState, "insideFunction" | "insideForLoop">
        >,
    ) => ParserState;
};

export function createExpressionParseError(
    tokens: Token[],
    index: number,
): Err {
    return {
        kind: "Err",
        error: formatExpressionParseError(tokens, index),
    };
}

function buildIfFailureContext(
    tokens: Token[],
    index: number,
    helpers: StatementFailureHelpers,
): StatementFailureContext {
    const leftParen = tokens[index + 1];
    const conditionStart = index + 2;
    const ifCondition = tokenIs(leftParen, "LeftParenToken")
        ? helpers.parseExpressionAt(tokens, conditionStart)
        : undefined;

    const rightParen =
        ifCondition && ifCondition.kind === "Ok"
            ? tokens[ifCondition.value.index]
            : null;
    const thenStart =
        ifCondition && ifCondition.kind === "Ok"
            ? ifCondition.value.index + 1
            : -1;
    const ifThenBranch =
        ifCondition &&
        ifCondition.kind === "Ok" &&
        tokenIs(rightParen, "RightParenToken")
            ? helpers.parseBlock(tokens, thenStart)
            : null;

    const elseToken = ifThenBranch ? tokens[ifThenBranch.index] : null;
    const afterElse = ifThenBranch ? tokens[ifThenBranch.index + 1] : null;
    const ifElseBranch =
        ifThenBranch !== null &&
        tokenIs(elseToken, "ElseToken") &&
        tokenIs(afterElse, "LeftBraceToken")
            ? helpers.parseBlock(tokens, ifThenBranch.index + 1)
            : null;

    return {
        ifCondition,
        ifThenBranch,
        ifElseBranch,
    };
}

function buildForFailureContext(
    tokens: Token[],
    index: number,
    helpers: StatementFailureHelpers,
): StatementFailureContext {
    const leftParen = tokens[index + 1];
    const initState = tokenIs(leftParen, "LeftParenToken")
        ? helpers.createParserState(tokens, index + 2, false, false)
        : null;
    const forInit = initState
        ? helpers.parseLetOrConst(initState, false, false)
        : null;

    const forInitValue =
        tokenIs(tokens[index + 3], "IdentifierToken") &&
        tokenIs(tokens[index + 4], "AssignToken")
            ? helpers.parseExpressionAt(tokens, index + 5)
            : null;

    const forInitInnerParen = tokenIs(tokens[index + 5], "LeftParenToken")
        ? helpers.parseExpressionAt(tokens, index + 6)
        : null;

    const firstSemicolon =
        forInit !== null && forInit.statement !== null
            ? tokens[forInit.index]
            : null;
    const conditionStart = forInit !== null ? forInit.index + 1 : -1;
    const forCondition =
        forInit !== null && tokenIs(firstSemicolon, "SemicolonToken")
            ? helpers.parseExpressionAt(tokens, conditionStart)
            : null;

    const secondSemicolon =
        forCondition !== null && forCondition.kind === "Ok"
            ? tokens[forCondition.value.index]
            : null;
    const incrementStart =
        forCondition !== null && forCondition.kind === "Ok"
            ? forCondition.value.index + 1
            : -1;
    const forIncrement =
        forCondition !== null &&
        forCondition.kind === "Ok" &&
        tokenIs(secondSemicolon, "SemicolonToken")
            ? helpers.parseExpressionAt(tokens, incrementStart)
            : null;

    const rightParen =
        forIncrement !== null && forIncrement.kind === "Ok"
            ? tokens[forIncrement.value.index]
            : null;
    const bodyStart =
        forIncrement !== null && forIncrement.kind === "Ok"
            ? forIncrement.value.index + 1
            : -1;
    const forBody =
        forIncrement !== null &&
        forIncrement.kind === "Ok" &&
        tokenIs(rightParen, "RightParenToken")
            ? helpers.parseBlock(tokens, bodyStart)
            : null;

    return {
        forInit,
        forInitValue,
        forInitInnerParen,
        forCondition,
        forIncrement,
        forBody,
    };
}

function buildLetConstFailureContext(
    tokens: Token[],
    index: number,
    helpers: StatementFailureHelpers,
): StatementFailureContext {
    const letConstValue =
        tokenIs(tokens[index + 1], "IdentifierToken") &&
        tokenIs(tokens[index + 2], "AssignToken")
            ? helpers.parseExpressionAt(tokens, index + 3)
            : null;

    const letConstInnerParen = tokenIs(tokens[index + 3], "LeftParenToken")
        ? helpers.parseExpressionAt(tokens, index + 4)
        : null;

    return {
        letConstValue,
        letConstInnerParen,
    };
}

function findFunctionParameterListEnd(
    tokens: Token[],
    parameterStart: number,
): number | null {
    let parameterIndex = parameterStart;

    if (!tokenIs(tokens[parameterIndex], "RightParenToken")) {
        while (parameterIndex < tokens.length) {
            const parameter = tokens[parameterIndex];
            if (!tokenIs(parameter, "IdentifierToken")) {
                break;
            }

            parameterIndex += 1;
            const separator = tokens[parameterIndex];
            if (tokenIs(separator, "CommaToken")) {
                parameterIndex += 1;
                continue;
            }

            if (tokenIs(separator, "RightParenToken")) {
                break;
            }

            parameterIndex = -1;
            break;
        }
    }

    if (
        parameterIndex < 0 ||
        !tokenIs(tokens[parameterIndex], "RightParenToken")
    ) {
        return null;
    }

    return parameterIndex;
}

function buildFunctionFailureContext(
    tokens: Token[],
    index: number,
    helpers: StatementFailureHelpers,
): StatementFailureContext {
    const name = tokens[index + 1];
    let functionBody = null;

    if (tokenIs(name, "IdentifierToken")) {
        const leftParen = tokens[index + 2];
        if (tokenIs(leftParen, "LeftParenToken")) {
            const parameterEnd = findFunctionParameterListEnd(
                tokens,
                index + 3,
            );
            if (parameterEnd !== null) {
                functionBody = helpers.parseBlock(tokens, parameterEnd + 1);
            }
        }
    }

    return {
        functionBody,
    };
}

export function buildStatementFailureContext(
    tokens: Token[],
    index: number,
    helpers: StatementFailureHelpers,
): StatementFailureContext {
    const token = tokens[index];

    if (!token) {
        return {};
    }

    switch (token.kind) {
        case "IfToken": {
            return buildIfFailureContext(tokens, index, helpers);
        }
        case "ForToken": {
            return buildForFailureContext(tokens, index, helpers);
        }
        case "LetToken":
        case "ConstToken": {
            return buildLetConstFailureContext(tokens, index, helpers);
        }
        case "FunctionToken": {
            return buildFunctionFailureContext(tokens, index, helpers);
        }
        default: {
            return {};
        }
    }
}

function explainStatementFailure(
    tokens: Token[],
    index: number,
    context: StatementFailureContext,
): DetailedParseError {
    const token = tokens[index];

    if (!token) {
        return {
            problem:
                "I reached the end of input while I was still parsing a statement.",
            hint: "Check if you are missing a closing '}' or ')' near the end.",
            suggestion: null,
            focusToken: null,
        };
    }

    if (token.kind === "LetToken") {
        return (
            explainLetOrConstFailure(
                tokens,
                index,
                "let",
                context.letConstValue || null,
                context.letConstInnerParen || null,
            ) || {
                problem: "I could not parse this let statement.",
                hint: "Use this shape: let name = expression;",
                suggestion: null,
                focusToken: token,
            }
        );
    }

    if (token.kind === "ConstToken") {
        return (
            explainLetOrConstFailure(
                tokens,
                index,
                "const",
                context.letConstValue || null,
                context.letConstInnerParen || null,
            ) || {
                problem: "I could not parse this const statement.",
                hint: "Use this shape: const name = expression;",
                suggestion: null,
                focusToken: token,
            }
        );
    }

    if (token.kind === "IfToken") {
        return (
            explainIfFailure(
                tokens,
                index,
                context.ifCondition ||
                    ({ kind: "Err", error: "" } as ParsedExpressionResult),
                context.ifThenBranch || null,
                context.ifElseBranch || null,
            ) || {
                problem: "I could not parse this if statement.",
                hint: "Use this shape: if (condition) { ... } else { ... }",
                suggestion: null,
                focusToken: token,
            }
        );
    }

    if (token.kind === "ForToken") {
        return (
            explainForFailure(
                tokens,
                index,
                context.forInit || null,
                context.forInitValue || null,
                context.forInitInnerParen || null,
                context.forCondition || null,
                context.forIncrement || null,
                context.forBody || null,
            ) || {
                problem: "I could not parse this for loop.",
                hint: "Use this shape: for (let i = 0; condition; increment) { ... }",
                suggestion: null,
                focusToken: token,
            }
        );
    }

    if (token.kind === "FunctionToken") {
        return (
            explainFunctionFailure(
                tokens,
                index,
                context.functionBody || null,
            ) || {
                problem: "I could not parse this function declaration.",
                hint: "Use this shape: function name(arg1, arg2) { ... }",
                suggestion: null,
                focusToken: token,
            }
        );
    }

    if (
        token.kind === "ReturnToken" ||
        token.kind === "ContinueToken" ||
        token.kind === "BreakToken"
    ) {
        return {
            problem: `This parser does not support top-level ${token.kind.replace("Token", "").toLowerCase()} statements yet.`,
            hint: "Try rewriting this in terms of the currently supported subset (`let`, `const`, `if`, `for`, `function`).",
            suggestion: null,
            focusToken: token,
        };
    }

    if (token.kind === "WithToken") {
        return {
            problem:
                "The `with` statement is not allowed in this JavaScript subset.",
            hint: "`with` is infrequently used, deprecated, and usually only valuable in niche style-driven cases. Rewrite it using explicit property access or by assigning the object to a named variable first.",
            suggestion: null,
            focusToken: token,
        };
    }

    return {
        problem: `I cannot start a statement with ${tokenSummary(token)}.`,
        hint: "Statements in this subset must start with: let, const, if, for, or function.",
        suggestion: null,
        focusToken: token,
    };
}

export function formatStatementParseError(
    input: string,
    tokens: Token[],
    index: number,
    context: StatementFailureContext,
): string {
    const details = explainStatementFailure(tokens, index, context);
    const token = details.focusToken;
    const tokenIndex = token ? token.startIndex : input.length;
    const location = locate(input, tokenIndex);
    const pointer = " ".repeat(Math.max(0, location.column - 1)) + "^";
    const message = [
        "I got stuck while parsing your JavaScript.",
        "",
        `Problem: ${details.problem}`,
        `Hint: ${details.hint}`,
        ...(details.suggestion ? [`Suggestion: ${details.suggestion}`] : []),
        "",
        `At line ${location.line}, column ${location.column}:`,
        location.lineText,
        pointer,
    ].join("\n");

    return message;
}

export function formatNoProgressError(input: string, token: Token): string {
    const location = locate(input, token.startIndex);
    const pointer = " ".repeat(Math.max(0, location.column - 1)) + "^";
    const message = [
        "I got stuck while parsing your JavaScript.",
        "",
        "Problem: I did not consume any tokens, which usually means I found syntax I do not understand yet.",
        `I was looking at ${tokenSummary(token)}.`,
        "",
        `At line ${location.line}, column ${location.column}:`,
        location.lineText,
        pointer,
    ].join("\n");

    return message;
}

export function formatExpressionParseError(
    tokens: Token[],
    index: number,
): string {
    const details = explainExpressionFailure(tokens, index, null);
    const message = [
        "I could not parse this expression.",
        "",
        `Problem: ${details.problem}`,
        `Hint: ${details.hint}`,
        ...(details.suggestion ? [`Suggestion: ${details.suggestion}`] : []),
    ].join("\n");

    return message;
}

export function formatTrailingExpressionError(
    tokens: Token[],
    index: number,
): string {
    return [
        "I could not parse this expression.",
        "",
        `Problem: I expected the expression to end here, but found ${tokenSummary(tokens[index])}.`,
        "Hint: If you meant to continue the expression, add an operator like `+` or `*`.",
        "Suggestion: I think you meant to keep the expression going with an operator.",
    ].join("\n");
}
