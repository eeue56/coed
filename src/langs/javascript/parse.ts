import {
    formatExpressionParseError,
    formatNoProgressError,
    formatStatementParseError,
    formatTrailingExpressionError,
    type StatementFailureContext,
} from "./parserErrors.ts";
import { tokenize } from "./tokenize.ts";
import type {
    Ast,
    BinaryOperatorRule,
    Err,
    Expression,
    ExpressionParseResult,
    NameLookupExpression,
    ParseExpressionFunction,
    ParserState,
    Program,
    Result,
    StatementParseResult,
    Token,
    TokenKinds,
} from "./types.ts";

/** filter out whitespace tokens from a token list */
function withoutWhitespace(tokens: Token[]): Token[] {
    return tokens.filter((token) => token.kind !== "WhitespaceToken");
}

/** remove surrounding quote characters from a string token value */
function stripStringQuotes(value: string): string {
    if (value.length < 2) return value;
    const firstChar = value[0];
    const lastChar = value[value.length - 1];

    if (firstChar !== lastChar) return value;
    if (firstChar !== '"' && firstChar !== "'" && firstChar !== "`") {
        return value;
    }

    return value.slice(1, value.length - 1);
}

function tokenIs<kind extends TokenKinds>(
    token: Token | null | undefined,
    kind: kind,
): token is Extract<Token, { kind: kind }> {
    return token != null && token.kind === kind;
}

function isNameLookup(expression: Expression): NameLookupExpression | null {
    if (expression.kind === "NameLookupExpression") {
        return expression;
    }

    return null;
}

function currentToken(state: ParserState): Token | null {
    return state.tokens[state.index] || null;
}

function errFromParserState(state: ParserState): Err {
    return {
        kind: "Err",
        error: formatExpressionParseError(state.tokens, state.index),
    };
}

/** advance the parser position by one token */
function consumeToken(state: ParserState): void {
    state.index += 1;
}

function ParserState(
    tokens: Token[],
    index: number,
    insideFunction: boolean,
    insideForLoop: boolean,
): ParserState {
    return {
        tokens,
        index,
        insideFunction,
        insideForLoop,
    };
}

function updateParserState(
    state: ParserState,
    index: number,
    overrides?: Partial<Pick<ParserState, "insideFunction" | "insideForLoop">>,
): ParserState {
    return {
        tokens: state.tokens,
        index,
        insideFunction: overrides?.insideFunction ?? state.insideFunction,
        insideForLoop: overrides?.insideForLoop ?? state.insideForLoop,
    };
}

/** parse a single expression starting at the given token index */
export function parseExpressionAt(
    tokens: Token[],
    index: number,
): Result<ExpressionParseResult> {
    const state = ParserState(tokens, index, false, false);
    const expression = parseLogicalOr(state);
    if (expression.kind === "Err") {
        return expression;
    }

    return {
        kind: "Ok",
        value: {
            expression: expression.value,
            index: state.index,
        },
    };
}

function parseLeftAssociative(
    state: ParserState,
    parseOperand: ParseExpressionFunction,
    rules: BinaryOperatorRule[],
): Result<Expression> {
    const parsedLeft = parseOperand(state);
    if (parsedLeft.kind === "Err") return parsedLeft;

    let left = parsedLeft.value;
    let token = currentToken(state);

    while (token !== null) {
        const rule = rules.find(
            (candidate) => candidate.tokenKind === (token as Token).kind,
        );

        if (!rule) {
            return {
                kind: "Ok",
                value: left,
            };
        }

        consumeToken(state);
        const right = parseOperand(state);
        if (right.kind === "Err") return right;
        left = rule.build(left, right.value);
        token = currentToken(state);
    }

    return {
        kind: "Ok",
        value: left,
    };
}

function parseCommaSeparatedExpressions(
    state: ParserState,
    closingTokenKind: "RightParenToken" | "RightBracketToken",
): Result<Expression[]> {
    const values: Expression[] = [];

    while (!tokenIs(currentToken(state), closingTokenKind)) {
        const parsed = parseLogicalOr(state);
        if (parsed.kind === "Err") return parsed;
        values.push(parsed.value);

        if (!tokenIs(currentToken(state), "CommaToken")) {
            break;
        }

        consumeToken(state);
    }

    if (!tokenIs(currentToken(state), closingTokenKind)) {
        return {
            kind: "Err",
            error: formatExpressionParseError(state.tokens, state.index),
        };
    }

    return {
        kind: "Ok",
        value: values,
    };
}

function parseCallArguments(state: ParserState): Result<Expression[]> {
    const args = parseCommaSeparatedExpressions(state, "RightParenToken");
    if (args.kind === "Err") return args;

    consumeToken(state);
    return args;
}

function parseAsTypeAssertion(
    state: ParserState,
    expression: Expression,
): Result<Expression | null> {
    consumeToken(state);

    const afterType = consumeTypeSyntax(state.tokens, state.index, [
        "SemicolonToken",
        "CommaToken",
        "RightParenToken",
        "RightBracketToken",
        "RightBraceToken",
        "DotToken",
        "AdditionToken",
        "SubtractionToken",
        "MultiplicationToken",
        "DivisionToken",
        "AndToken",
        "OrToken",
        "EqualityToken",
        "InequalityToken",
        "LessThanToken",
        "MoreThanToken",
        "LessThanOrEqualToken",
        "MoreThanOrEqualToken",
        "AssignToken",
        "ArrowToken",
        "IncrementToken",
        "DecrementToken",
    ]);
    if (afterType === null) {
        return errFromParserState(state);
    }

    state.index = afterType;
    return {
        kind: "Ok",
        value: expression,
    };
}

function parsePostfixStep(
    state: ParserState,
    expression: Expression,
): Result<Expression | null> {
    const token = currentToken(state);
    if (!token) {
        return {
            kind: "Ok",
            value: null,
        };
    }

    if (token.kind === "LeftParenToken") {
        const asName = isNameLookup(expression);
        if (asName === null) {
            return {
                kind: "Ok",
                value: null,
            };
        }

        consumeToken(state);
        const args = parseCallArguments(state);
        if (args.kind === "Err") return args;

        return {
            kind: "Ok",
            value: {
                kind: "FunctionCallExpression",
                functionName: asName.name,
                arguments: args.value,
            },
        };
    }

    if (token.kind === "DotToken") {
        const asName = isNameLookup(expression);
        if (asName === null) {
            return {
                kind: "Ok",
                value: null,
            };
        }

        consumeToken(state);
        const propertyToken = currentToken(state);
        if (!tokenIs(propertyToken, "IdentifierToken")) {
            return errFromParserState(state);
        }
        consumeToken(state);

        if (!tokenIs(currentToken(state), "LeftParenToken")) {
            return {
                kind: "Ok",
                value: {
                    kind: "ObjectPropertyExpression",
                    object: asName,
                    property: {
                        kind: "NameLookupExpression",
                        name: propertyToken.name,
                    },
                },
            };
        }

        consumeToken(state);
        const args = parseCallArguments(state);
        if (args.kind === "Err") return args;

        return {
            kind: "Ok",
            value: {
                kind: "ObjectMethodCallExpression",
                object: asName,
                method: {
                    kind: "NameLookupExpression",
                    name: propertyToken.name,
                },
                arguments: args.value,
            },
        };
    }

    if (token.kind === "LeftBracketToken") {
        const asName = isNameLookup(expression);
        if (asName === null) {
            return {
                kind: "Ok",
                value: null,
            };
        }

        consumeToken(state);
        const indexToken = currentToken(state);

        if (tokenIs(indexToken, "NumberToken")) {
            consumeToken(state);
            if (!tokenIs(currentToken(state), "RightBracketToken")) {
                return errFromParserState(state);
            }

            consumeToken(state);
            return {
                kind: "Ok",
                value: {
                    kind: "ArrayAccessExpression",
                    array: asName,
                    index: {
                        kind: "NumberExpression",
                        value: indexToken.value,
                    },
                },
            };
        }

        if (tokenIs(indexToken, "StringToken")) {
            consumeToken(state);
            if (!tokenIs(currentToken(state), "RightBracketToken")) {
                return errFromParserState(state);
            }

            consumeToken(state);
            return {
                kind: "Ok",
                value: {
                    kind: "ObjectPropertyExpression",
                    object: asName,
                    property: {
                        kind: "StringLiteralExpression",
                        values: [
                            {
                                kind: "StringExpression",
                                value: stripStringQuotes(indexToken.value),
                            },
                        ],
                    },
                },
            };
        }

        return errFromParserState(state);
    }

    if (token.kind === "IncrementToken") {
        const asName = isNameLookup(expression);
        if (asName === null) {
            return {
                kind: "Ok",
                value: null,
            };
        }

        consumeToken(state);
        return {
            kind: "Ok",
            value: {
                kind: "IncrementExpression",
                variable: asName.name,
            },
        };
    }

    if (token.kind === "DecrementToken") {
        const asName = isNameLookup(expression);
        if (asName === null) {
            return {
                kind: "Ok",
                value: null,
            };
        }

        consumeToken(state);
        return {
            kind: "Ok",
            value: {
                kind: "DecrementExpression",
                variable: asName.name,
            },
        };
    }

    if (token.kind === "AsToken") {
        return parseAsTypeAssertion(state, expression);
    }

    return {
        kind: "Ok",
        value: null,
    };
}

/** parse logical OR expressions (||) */
function parseLogicalOr(state: ParserState): Result<Expression> {
    return parseLeftAssociative(state, parseLogicalAnd, [
        {
            tokenKind: "OrToken",
            build: (left, right) => ({
                kind: "OrExpression",
                left,
                right,
            }),
        },
    ]);
}

/** parse logical AND expressions (&&) */
function parseLogicalAnd(state: ParserState): Result<Expression> {
    return parseLeftAssociative(state, parseEquality, [
        {
            tokenKind: "AndToken",
            build: (left, right) => ({
                kind: "AndExpression",
                left,
                right,
            }),
        },
    ]);
}

/** parse equality (===) and inequality (!==) expressions */
function parseEquality(state: ParserState): Result<Expression> {
    return parseLeftAssociative(state, parseComparison, [
        {
            tokenKind: "EqualityToken",
            build: (left, right) => ({
                kind: "EqualityExpression",
                left,
                right,
            }),
        },
        {
            tokenKind: "InequalityToken",
            build: (left, right) => ({
                kind: "InequalityExpression",
                left,
                right,
            }),
        },
    ]);
}

/** parse comparison expressions (<, >, <=, >=) */
function parseComparison(state: ParserState): Result<Expression> {
    return parseLeftAssociative(state, parseAdditive, [
        {
            tokenKind: "LessThanToken",
            build: (left, right) => ({
                kind: "LessThanExpression",
                left,
                right,
            }),
        },
        {
            tokenKind: "MoreThanToken",
            build: (left, right) => ({
                kind: "MoreThanExpression",
                left,
                right,
            }),
        },
        {
            tokenKind: "LessThanOrEqualToken",
            build: (left, right) => ({
                kind: "LessThanOrEqualExpression",
                left,
                right,
            }),
        },
        {
            tokenKind: "MoreThanOrEqualToken",
            build: (left, right) => ({
                kind: "MoreThanOrEqualExpression",
                left,
                right,
            }),
        },
    ]);
}

/** parse additive expressions (+ and -) */
function parseAdditive(state: ParserState): Result<Expression> {
    return parseLeftAssociative(state, parseMultiplicative, [
        {
            tokenKind: "AdditionToken",
            build: (left, right) => ({
                kind: "AdditionExpression",
                left,
                right,
            }),
        },
        {
            tokenKind: "SubtractionToken",
            build: (left, right) => ({
                kind: "SubtractionExpression",
                left,
                right,
            }),
        },
    ]);
}

/** parse multiplicative expressions (* and /) */
function parseMultiplicative(state: ParserState): Result<Expression> {
    return parseLeftAssociative(state, parsePostfix, [
        {
            tokenKind: "MultiplicationToken",
            build: (left, right) => ({
                kind: "MultiplicationExpression",
                left,
                right,
            }),
        },
        {
            tokenKind: "DivisionToken",
            build: (left, right) => ({
                kind: "DivisionExpression",
                left,
                right,
            }),
        },
    ]);
}

/** parse postfix operations: function calls, dot access, bracket access, ++/-- */
function parsePostfix(state: ParserState): Result<Expression> {
    const parsedExpression = parseLeaf(state);
    if (parsedExpression.kind === "Err") return parsedExpression;

    let expression = parsedExpression.value;

    while (currentToken(state)) {
        const next = parsePostfixStep(state, expression);
        if (next.kind === "Err") return next;
        if (next.value === null) {
            return {
                kind: "Ok",
                value: expression,
            };
        }

        expression = next.value;
    }

    return {
        kind: "Ok",
        value: expression,
    };
}

/** parse a primary (leaf) expression: literal, identifier, or parenthesised expression */
function parseLeaf(state: ParserState): Result<Expression> {
    const token = currentToken(state);
    if (!token) {
        return errFromParserState(state);
    }

    if (token.kind === "NegationToken" || token.kind === "TypeofToken") {
        consumeToken(state);
        return parseLeaf(state);
    }

    switch (token.kind) {
        case "NumberToken": {
            consumeToken(state);
            return {
                kind: "Ok",
                value: {
                    kind: "NumberExpression",
                    value: token.value,
                },
            };
        }
        case "StringToken": {
            consumeToken(state);
            const value = stripStringQuotes(token.value);
            if (token.value.startsWith("`") && token.value.endsWith("`")) {
                return {
                    kind: "Ok",
                    value: {
                        kind: "StringLiteralExpression",
                        values: [
                            {
                                kind: "StringExpression",
                                value,
                            },
                        ],
                    },
                };
            }

            return {
                kind: "Ok",
                value: {
                    kind: "StringExpression",
                    value,
                },
            };
        }
        case "IdentifierToken": {
            consumeToken(state);
            return {
                kind: "Ok",
                value: {
                    kind: "NameLookupExpression",
                    name: token.name,
                },
            };
        }
        case "TrueToken": {
            consumeToken(state);
            return {
                kind: "Ok",
                value: {
                    kind: "BooleanExpression",
                    value: true,
                },
            };
        }
        case "FalseToken": {
            consumeToken(state);
            return {
                kind: "Ok",
                value: {
                    kind: "BooleanExpression",
                    value: false,
                },
            };
        }
        case "NullToken": {
            consumeToken(state);
            return {
                kind: "Ok",
                value: {
                    kind: "NullExpression",
                },
            };
        }
        case "UndefinedToken": {
            consumeToken(state);
            return {
                kind: "Ok",
                value: {
                    kind: "NullExpression",
                },
            };
        }
        case "LeftParenToken": {
            consumeToken(state);
            const expression = parseLogicalOr(state);
            if (expression.kind === "Err") return expression;
            if (!tokenIs(currentToken(state), "RightParenToken")) {
                return errFromParserState(state);
            }
            consumeToken(state);
            return expression;
        }
        case "LeftBracketToken": {
            consumeToken(state);
            const elements = parseCommaSeparatedExpressions(
                state,
                "RightBracketToken",
            );
            if (elements.kind === "Err") return elements;

            consumeToken(state);
            return {
                kind: "Ok",
                value: {
                    kind: "ArrayExpression",
                    elements: elements.value,
                },
            };
        }
        case "LeftBraceToken": {
            consumeToken(state);
            const properties: { [key: string]: Expression } = {};
            if (!tokenIs(currentToken(state), "RightBraceToken")) {
                while (true) {
                    const keyToken = currentToken(state);
                    if (!keyToken) {
                        return errFromParserState(state);
                    }

                    let key = "";
                    if (keyToken.kind === "IdentifierToken") {
                        key = keyToken.name;
                    } else if (keyToken.kind === "StringToken") {
                        key = stripStringQuotes(keyToken.value);
                    } else {
                        return errFromParserState(state);
                    }
                    consumeToken(state);

                    if (!tokenIs(currentToken(state), "ColonToken")) {
                        return errFromParserState(state);
                    }
                    consumeToken(state);

                    const value = parseLogicalOr(state);
                    if (value.kind === "Err") return value;
                    properties[key] = value.value;

                    if (tokenIs(currentToken(state), "CommaToken")) {
                        consumeToken(state);
                        continue;
                    }

                    break;
                }
            }

            if (!tokenIs(currentToken(state), "RightBraceToken")) {
                return errFromParserState(state);
            }
            consumeToken(state);

            return {
                kind: "Ok",
                value: {
                    kind: "ObjectExpression",
                    properties,
                },
            };
        }
        default: {
            return errFromParserState(state);
        }
    }
}

/** parse a single statement starting at the given token index */
function parseStatementAt(state: ParserState): StatementParseResult {
    return parseStatement(state);
}

function consumeTypeSyntax(
    tokens: Token[],
    startIndex: number,
    stopKinds: TokenKinds[],
): number | null {
    let index = startIndex;
    let parenDepth = 0;
    let bracketDepth = 0;
    let braceDepth = 0;
    let angleDepth = 0;

    while (index < tokens.length) {
        const token = tokens[index];

        if (
            parenDepth === 0 &&
            bracketDepth === 0 &&
            braceDepth === 0 &&
            angleDepth === 0 &&
            stopKinds.includes(token.kind)
        ) {
            return index;
        }

        switch (token.kind) {
            case "LeftParenToken": {
                parenDepth += 1;
                break;
            }
            case "RightParenToken": {
                if (parenDepth > 0) {
                    parenDepth -= 1;
                }
                break;
            }
            case "LeftBracketToken": {
                bracketDepth += 1;
                break;
            }
            case "RightBracketToken": {
                if (bracketDepth > 0) {
                    bracketDepth -= 1;
                }
                break;
            }
            case "LeftBraceToken": {
                braceDepth += 1;
                break;
            }
            case "RightBraceToken": {
                if (braceDepth > 0) {
                    braceDepth -= 1;
                }
                break;
            }
            case "LessThanToken": {
                angleDepth += 1;
                break;
            }
            case "MoreThanToken": {
                if (angleDepth > 0) {
                    angleDepth -= 1;
                }
                break;
            }
        }

        index += 1;
    }

    return null;
}

function consumeOptionalTypeAnnotation(
    tokens: Token[],
    startIndex: number,
    stopKinds: TokenKinds[],
): number | null {
    if (!tokenIs(tokens[startIndex], "ColonToken")) {
        return startIndex;
    }

    return consumeTypeSyntax(tokens, startIndex + 1, stopKinds);
}

function parseTypedParameterList(
    tokens: Token[],
    startIndex: number,
): { parameters: string[]; afterRightParenIndex: number } | null {
    const parameters: string[] = [];
    let index = startIndex;

    if (!tokenIs(tokens[index], "RightParenToken")) {
        while (true) {
            const parameter = tokens[index];
            if (!tokenIs(parameter, "IdentifierToken")) {
                return null;
            }

            parameters.push(parameter.name);
            index += 1;

            const afterType = consumeOptionalTypeAnnotation(tokens, index, [
                "CommaToken",
                "RightParenToken",
            ]);
            if (afterType === null) {
                return null;
            }

            index = afterType;

            if (tokenIs(tokens[index], "CommaToken")) {
                index += 1;
                continue;
            }

            break;
        }
    }

    if (!tokenIs(tokens[index], "RightParenToken")) {
        return null;
    }

    return {
        parameters,
        afterRightParenIndex: index + 1,
    };
}

function parseArrowParameters(
    tokens: Token[],
    startIndex: number,
): { parameters: string[]; arrowIndex: number } | null {
    const firstToken = tokens[startIndex];

    if (tokenIs(firstToken, "IdentifierToken")) {
        const afterType = consumeOptionalTypeAnnotation(
            tokens,
            startIndex + 1,
            ["ArrowToken"],
        );
        if (afterType === null) {
            return null;
        }

        if (!tokenIs(tokens[afterType], "ArrowToken")) {
            return null;
        }

        return {
            parameters: [firstToken.name],
            arrowIndex: afterType,
        };
    }

    if (!tokenIs(firstToken, "LeftParenToken")) {
        return null;
    }

    const parsedParameters = parseTypedParameterList(tokens, startIndex + 1);
    if (parsedParameters === null) {
        return null;
    }

    const afterReturnType = consumeOptionalTypeAnnotation(
        tokens,
        parsedParameters.afterRightParenIndex,
        ["ArrowToken"],
    );
    if (afterReturnType === null) {
        return null;
    }

    if (!tokenIs(tokens[afterReturnType], "ArrowToken")) {
        return null;
    }

    return {
        parameters: parsedParameters.parameters,
        arrowIndex: afterReturnType,
    };
}

function parseArrowFunctionDeclaration(
    state: ParserState,
): StatementParseResult {
    const declarationName = state.tokens[state.index + 1];
    if (!tokenIs(declarationName, "IdentifierToken")) {
        return { statement: null, index: state.index };
    }

    if (!tokenIs(state.tokens[state.index + 2], "AssignToken")) {
        return { statement: null, index: state.index };
    }

    const parameters = parseArrowParameters(state.tokens, state.index + 3);
    if (parameters === null) {
        return { statement: null, index: state.index };
    }

    let index = parameters.arrowIndex + 1;
    let body: Ast[] | null = null;

    if (tokenIs(state.tokens[index], "LeftBraceToken")) {
        const parsedBody = parseBlock(
            state.tokens,
            index,
            updateParserState(state, index, {
                insideFunction: true,
                insideForLoop: false,
            }),
        );
        body = parsedBody.body;
        index = parsedBody.index;
    } else {
        const expression = parseExpressionAt(state.tokens, index);
        if (expression.kind === "Err") {
            return { statement: null, index: state.index };
        }

        body = [
            {
                kind: "LetStatement",
                name: "result",
                value: expression.value.expression,
            },
        ];
        index = expression.value.index;
    }

    if (body === null) {
        return { statement: null, index: state.index };
    }

    if (tokenIs(state.tokens[index], "SemicolonToken")) {
        index += 1;
    }

    return {
        statement: {
            kind: "FunctionDeclaration",
            name: declarationName.name,
            parameters: parameters.parameters,
            body,
        },
        index,
    };
}

function parseDeclarationStatement(
    state: ParserState,
    isConst: boolean,
): StatementParseResult {
    const arrowDeclaration = parseArrowFunctionDeclaration(state);
    if (arrowDeclaration.statement !== null) {
        return arrowDeclaration;
    }

    return parseLetOrConst(state, isConst, true);
}

/** dispatch to the appropriate statement parser based on the current token */
function parseStatement(state: ParserState): StatementParseResult {
    const token = currentToken(state);
    if (!token) {
        return { statement: null, index: state.index };
    }

    switch (token.kind) {
        case "LetToken": {
            return parseDeclarationStatement(state, false);
        }
        case "VarToken": {
            return parseDeclarationStatement(state, false);
        }
        case "ConstToken": {
            return parseDeclarationStatement(state, true);
        }
        case "IfToken": {
            return parseIf(state);
        }
        case "ForToken": {
            return parseFor(state);
        }
        case "WhileToken": {
            return parseWhile(state);
        }
        case "FunctionToken": {
            return parseFunction(state);
        }
        case "ReturnToken": {
            return parseReturn(state);
        }
        case "ContinueToken": {
            return parseContinue(state);
        }
        case "BreakToken": {
            return parseBreak(state);
        }
        default: {
            return { statement: null, index: state.index };
        }
    }
}

/** parse a brace-delimited block of statements, returning null on failure */
export function parseBlock(
    tokens: Token[],
    startIndex: number,
    parentState: ParserState = ParserState(tokens, startIndex, false, false),
): {
    body: Ast[] | null;
    index: number;
} {
    if (!tokenIs(tokens[startIndex], "LeftBraceToken")) {
        return { body: null, index: startIndex };
    }

    let index = startIndex + 1;
    const body: Ast[] = [];

    while (index < tokens.length) {
        if (tokenIs(tokens[index], "RightBraceToken")) {
            return {
                body,
                index: index + 1,
            };
        }

        if (tokenIs(tokens[index], "SemicolonToken")) {
            index += 1;
            continue;
        }

        const nested = parseStatementAt(updateParserState(parentState, index));
        if (nested.statement === null) {
            return { body: null, index };
        }

        body.push(nested.statement);
        index = nested.index;
    }

    return { body: null, index: startIndex };
}

/** parse a let or const variable declaration */
export function parseLetOrConst(
    state: ParserState,
    isConst: boolean,
    consumeSemicolon: boolean,
): StatementParseResult {
    let index = state.index + 1;
    const name = state.tokens[index];
    if (!tokenIs(name, "IdentifierToken")) {
        return { statement: null, index: state.index };
    }

    index += 1;

    const afterType = consumeOptionalTypeAnnotation(state.tokens, index, [
        "AssignToken",
    ]);
    if (afterType === null) {
        return { statement: null, index: state.index };
    }

    index = afterType;
    if (!tokenIs(state.tokens[index], "AssignToken")) {
        return { statement: null, index: state.index };
    }
    index += 1;

    const parsed = parseExpressionAt(state.tokens, index);
    if (parsed.kind === "Err") {
        return { statement: null, index: state.index };
    }

    index = parsed.value.index;
    if (consumeSemicolon && tokenIs(state.tokens[index], "SemicolonToken")) {
        index += 1;
    }

    if (isConst) {
        return {
            statement: {
                kind: "ConstStatement",
                name: name.name,
                value: parsed.value.expression,
            },
            index,
        };
    }

    return {
        statement: {
            kind: "LetStatement",
            name: name.name,
            value: parsed.value.expression,
        },
        index,
    };
}

function parseParenthesizedExpressionFrom(
    tokens: Token[],
    startIndex: number,
): ExpressionParseResult | null {
    if (!tokenIs(tokens[startIndex], "LeftParenToken")) {
        return null;
    }

    const expression = parseExpressionAt(tokens, startIndex + 1);
    if (expression.kind === "Err") {
        return null;
    }

    if (!tokenIs(tokens[expression.value.index], "RightParenToken")) {
        return null;
    }

    return {
        expression: expression.value.expression,
        index: expression.value.index + 1,
    };
}

function parseWhile(state: ParserState): StatementParseResult {
    const condition = parseParenthesizedExpressionFrom(
        state.tokens,
        state.index + 1,
    );
    if (condition === null) {
        return { statement: null, index: state.index };
    }

    const body = parseBlock(state.tokens, condition.index, state);
    if (body.body === null) {
        return { statement: null, index: state.index };
    }

    const loopVariable = `__while_${state.index}`;

    return {
        statement: {
            kind: "ForLoop",
            init: {
                kind: "LetStatement",
                name: loopVariable,
                value: { kind: "NumberExpression", value: 0 },
            },
            condition: condition.expression,
            increment: {
                kind: "IncrementExpression",
                variable: loopVariable,
            },
            body: body.body,
        },
        index: body.index,
    };
}

/** parse an if statement, including optional else/else-if branches */
function parseIfElseIfBranch(
    state: ParserState,
    condition: ExpressionParseResult,
    thenBranch: Ast[],
    index: number,
): StatementParseResult | null {
    if (!tokenIs(state.tokens[index], "ElseToken")) {
        return null;
    }

    const elseIndex = index + 1;
    if (!tokenIs(state.tokens[elseIndex], "IfToken")) {
        return null;
    }

    const elseIf = parseStatementAt(updateParserState(state, elseIndex));
    if (elseIf.statement === null || elseIf.statement.kind !== "IfStatement") {
        return { statement: null, index: state.index };
    }

    return {
        statement: {
            kind: "IfStatement",
            condition: condition.expression,
            thenBranch,
            elseBranch: [elseIf.statement],
        },
        index: elseIf.index,
    };
}

function parseIfElseBranch(
    state: ParserState,
    condition: ExpressionParseResult,
    thenBranch: Ast[],
    index: number,
): StatementParseResult | null {
    if (!tokenIs(state.tokens[index], "ElseToken")) {
        return null;
    }

    const elseBranch = parseBlock(state.tokens, index + 1, state);
    if (elseBranch.body === null) {
        return { statement: null, index: state.index };
    }

    return {
        statement: {
            kind: "IfStatement",
            condition: condition.expression,
            thenBranch,
            elseBranch: elseBranch.body,
        },
        index: elseBranch.index,
    };
}

function parseIf(state: ParserState): StatementParseResult {
    const condition = parseParenthesizedExpressionFrom(
        state.tokens,
        state.index + 1,
    );
    if (condition === null) {
        return { statement: null, index: state.index };
    }

    let index = condition.index;

    const thenBranch = parseBlock(state.tokens, index, state);
    if (thenBranch.body === null) {
        return { statement: null, index: state.index };
    }

    index = thenBranch.index;

    const elseIfBranch = parseIfElseIfBranch(
        state,
        condition,
        thenBranch.body,
        index,
    );
    if (elseIfBranch !== null) {
        return elseIfBranch;
    }

    const elseBranch = parseIfElseBranch(
        state,
        condition,
        thenBranch.body,
        index,
    );
    if (elseBranch !== null) {
        return elseBranch;
    }

    return {
        statement: {
            kind: "IfStatement",
            condition: condition.expression,
            thenBranch: thenBranch.body,
        },
        index,
    };
}

/** parse a for loop with initializer, condition, and increment */
function parseFor(state: ParserState): StatementParseResult {
    let index = state.index + 1;
    if (!tokenIs(state.tokens[index], "LeftParenToken")) {
        return { statement: null, index: state.index };
    }
    index += 1;

    const initState = updateParserState(state, index);
    const init = parseLetOrConst(initState, false, false);
    if (init.statement === null || init.statement.kind !== "LetStatement") {
        return { statement: null, index: state.index };
    }

    index = init.index;
    if (!tokenIs(state.tokens[index], "SemicolonToken")) {
        return { statement: null, index: state.index };
    }
    index += 1;

    const condition = parseExpressionAt(state.tokens, index);
    if (condition.kind === "Err") {
        return { statement: null, index: state.index };
    }
    index = condition.value.index;

    if (!tokenIs(state.tokens[index], "SemicolonToken")) {
        return { statement: null, index: state.index };
    }
    index += 1;

    const increment = parseExpressionAt(state.tokens, index);
    if (increment.kind === "Err") {
        return { statement: null, index: state.index };
    }
    index = increment.value.index;

    if (!tokenIs(state.tokens[index], "RightParenToken")) {
        return { statement: null, index: state.index };
    }
    index += 1;

    const body = parseBlock(
        state.tokens,
        index,
        updateParserState(state, index, {
            insideForLoop: true,
        }),
    );
    if (body.body === null) {
        return { statement: null, index: state.index };
    }

    return {
        statement: {
            kind: "ForLoop",
            init: init.statement,
            condition: condition.value.expression,
            increment: increment.value.expression,
            body: body.body,
        },
        index: body.index,
    };
}

/** parse a function declaration with a name, parameter list, and body */
function parseFunction(state: ParserState): StatementParseResult {
    let index = state.index + 1;
    const name = state.tokens[index];
    if (!tokenIs(name, "IdentifierToken")) {
        return { statement: null, index: state.index };
    }

    index += 1;
    if (!tokenIs(state.tokens[index], "LeftParenToken")) {
        return { statement: null, index: state.index };
    }

    const parsedParameters = parseTypedParameterList(state.tokens, index + 1);
    if (parsedParameters === null) {
        return { statement: null, index: state.index };
    }

    index = parsedParameters.afterRightParenIndex;
    const afterReturnType = consumeOptionalTypeAnnotation(state.tokens, index, [
        "LeftBraceToken",
    ]);
    if (afterReturnType === null) {
        return { statement: null, index: state.index };
    }

    index = afterReturnType;

    const body = parseBlock(
        state.tokens,
        index,
        updateParserState(state, index, {
            insideFunction: true,
            insideForLoop: false,
        }),
    );
    if (body.body === null) {
        return { statement: null, index: state.index };
    }

    return {
        statement: {
            kind: "FunctionDeclaration",
            name: name.name,
            parameters: parsedParameters.parameters,
            body: body.body,
        },
        index: body.index,
    };
}

function parseReturn(state: ParserState): StatementParseResult {
    if (!state.insideFunction) {
        return { statement: null, index: state.index };
    }

    let index = state.index + 1;
    const tokenAfterReturn = state.tokens[index];

    if (
        tokenAfterReturn === undefined ||
        tokenIs(tokenAfterReturn, "SemicolonToken") ||
        tokenIs(tokenAfterReturn, "RightBraceToken")
    ) {
        if (tokenIs(tokenAfterReturn, "SemicolonToken")) {
            index += 1;
        }

        return {
            statement: {
                kind: "ReturnStatement",
                value: null,
            },
            index,
        };
    }

    const parsedExpression = parseExpressionAt(state.tokens, index);
    if (parsedExpression.kind === "Err") {
        return { statement: null, index: state.index };
    }

    index = parsedExpression.value.index;
    if (tokenIs(state.tokens[index], "SemicolonToken")) {
        index += 1;
    }

    return {
        statement: {
            kind: "ReturnStatement",
            value: parsedExpression.value.expression,
        },
        index,
    };
}

function parseLoopControlStatement(
    state: ParserState,
    statementKind: "ContinueStatement" | "BreakStatement",
): StatementParseResult {
    if (!state.insideForLoop) {
        return { statement: null, index: state.index };
    }

    let index = state.index + 1;
    const tokenAfterControl = state.tokens[index];

    if (
        tokenAfterControl !== undefined &&
        !tokenIs(tokenAfterControl, "SemicolonToken") &&
        !tokenIs(tokenAfterControl, "RightBraceToken")
    ) {
        return { statement: null, index: state.index };
    }

    if (tokenIs(tokenAfterControl, "SemicolonToken")) {
        index += 1;
    }

    return {
        statement: {
            kind: statementKind,
        },
        index,
    };
}

function parseContinue(state: ParserState): StatementParseResult {
    return parseLoopControlStatement(state, "ContinueStatement");
}

function parseBreak(state: ParserState): StatementParseResult {
    return parseLoopControlStatement(state, "BreakStatement");
}

function buildIfFailureContext(
    tokens: Token[],
    index: number,
): StatementFailureContext {
    const leftParen = tokens[index + 1];
    const conditionStart = index + 2;
    const ifCondition = tokenIs(leftParen, "LeftParenToken")
        ? parseExpressionAt(tokens, conditionStart)
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
            ? parseBlock(tokens, thenStart)
            : null;

    const elseToken = ifThenBranch ? tokens[ifThenBranch.index] : null;
    const afterElse = ifThenBranch ? tokens[ifThenBranch.index + 1] : null;
    const ifElseBranch =
        ifThenBranch !== null &&
        tokenIs(elseToken, "ElseToken") &&
        tokenIs(afterElse, "LeftBraceToken")
            ? parseBlock(tokens, ifThenBranch.index + 1)
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
): StatementFailureContext {
    const leftParen = tokens[index + 1];
    const initState = tokenIs(leftParen, "LeftParenToken")
        ? ParserState(tokens, index + 2, false, false)
        : null;
    const forInit = initState ? parseLetOrConst(initState, false, false) : null;

    const forInitValue =
        tokenIs(tokens[index + 3], "IdentifierToken") &&
        tokenIs(tokens[index + 4], "AssignToken")
            ? parseExpressionAt(tokens, index + 5)
            : null;

    const forInitInnerParen = tokenIs(tokens[index + 5], "LeftParenToken")
        ? parseExpressionAt(tokens, index + 6)
        : null;

    const firstSemicolon =
        forInit !== null && forInit.statement !== null
            ? tokens[forInit.index]
            : null;
    const conditionStart = forInit !== null ? forInit.index + 1 : -1;
    const forCondition =
        forInit !== null && tokenIs(firstSemicolon, "SemicolonToken")
            ? parseExpressionAt(tokens, conditionStart)
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
            ? parseExpressionAt(tokens, incrementStart)
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
            ? parseBlock(tokens, bodyStart)
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
): StatementFailureContext {
    const letConstValue =
        tokenIs(tokens[index + 1], "IdentifierToken") &&
        tokenIs(tokens[index + 2], "AssignToken")
            ? parseExpressionAt(tokens, index + 3)
            : null;

    const letConstInnerParen = tokenIs(tokens[index + 3], "LeftParenToken")
        ? parseExpressionAt(tokens, index + 4)
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
                functionBody = parseBlock(tokens, parameterEnd + 1);
            }
        }
    }

    return {
        functionBody,
    };
}

/** parse all statements in a token list, failing with an error on the first bad statement */
function buildStatementFailureContext(
    tokens: Token[],
    index: number,
): StatementFailureContext {
    const token = tokens[index];

    if (!token) {
        return {};
    }

    switch (token.kind) {
        case "IfToken": {
            return buildIfFailureContext(tokens, index);
        }
        case "ForToken": {
            return buildForFailureContext(tokens, index);
        }
        case "LetToken":
        case "ConstToken": {
            return buildLetConstFailureContext(tokens, index);
        }
        case "FunctionToken": {
            return buildFunctionFailureContext(tokens, index);
        }
        default: {
            return {};
        }
    }
}

function parseAllStatements(tokens: Token[], input: string): Result<Ast[]> {
    const statements: Ast[] = [];
    let index = 0;
    const rootState = ParserState(tokens, index, false, false);

    while (index < tokens.length) {
        if (tokenIs(tokens[index], "SemicolonToken")) {
            index += 1;
            continue;
        }

        const before = index;
        const parsed = parseStatementAt(updateParserState(rootState, index));
        if (parsed.statement === null) {
            return {
                kind: "Err",
                error: formatStatementParseError(
                    input,
                    tokens,
                    index,
                    buildStatementFailureContext(tokens, index),
                ),
            };
        }

        statements.push(parsed.statement);
        index = parsed.index;

        if (before === index && tokens[index]) {
            const token = tokens[index];
            return {
                kind: "Err",
                error: formatNoProgressError(input, token),
            };
        }
    }

    return {
        kind: "Ok",
        value: statements,
    };
}

/** parse a single expression from a token list, stripping whitespace first */
export function parseExpression(tokens: Token[]): Result<Expression> {
    const cleanTokens = withoutWhitespace(tokens);
    const parsed = parseExpressionAt(cleanTokens, 0);

    if (parsed.kind === "Err") {
        return {
            kind: "Err",
            error: parsed.error,
        };
    }

    if (parsed.value.index !== cleanTokens.length) {
        return {
            kind: "Err",
            error: formatTrailingExpressionError(
                cleanTokens,
                parsed.value.index,
            ),
        };
    }

    return {
        kind: "Ok",
        value: parsed.value.expression,
    };
}

/** tokenize and parse a JavaScript source string into an AST */
export function parse(input: string): Result<Program> {
    const tokens = withoutWhitespace(tokenize(input));
    return parseAllStatements(tokens, input);
}

export type ParsedExpressionResult = ReturnType<typeof parseExpressionAt>;
export type ParsedBlockResult = ReturnType<typeof parseBlock>;
export type ParsedStatementResult = ReturnType<typeof parseLetOrConst>;
