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
    const expression = parseEquality(state);
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
        const parsed = parseEquality(state);
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
            return {
                kind: "Err",
                error: formatExpressionParseError(state.tokens, state.index),
            };
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
                return {
                    kind: "Err",
                    error: formatExpressionParseError(
                        state.tokens,
                        state.index,
                    ),
                };
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
                return {
                    kind: "Err",
                    error: formatExpressionParseError(
                        state.tokens,
                        state.index,
                    ),
                };
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

        return {
            kind: "Err",
            error: formatExpressionParseError(state.tokens, state.index),
        };
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

    return {
        kind: "Ok",
        value: null,
    };
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
        return {
            kind: "Err",
            error: formatExpressionParseError(state.tokens, state.index),
        };
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
            const expression = parseEquality(state);
            if (expression.kind === "Err") return expression;
            if (!tokenIs(currentToken(state), "RightParenToken")) {
                return {
                    kind: "Err",
                    error: formatExpressionParseError(
                        state.tokens,
                        state.index,
                    ),
                };
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
                        return {
                            kind: "Err",
                            error: formatExpressionParseError(
                                state.tokens,
                                state.index,
                            ),
                        };
                    }

                    let key = "";
                    if (keyToken.kind === "IdentifierToken") {
                        key = keyToken.name;
                    } else if (keyToken.kind === "StringToken") {
                        key = stripStringQuotes(keyToken.value);
                    } else {
                        return {
                            kind: "Err",
                            error: formatExpressionParseError(
                                state.tokens,
                                state.index,
                            ),
                        };
                    }
                    consumeToken(state);

                    if (!tokenIs(currentToken(state), "ColonToken")) {
                        return {
                            kind: "Err",
                            error: formatExpressionParseError(
                                state.tokens,
                                state.index,
                            ),
                        };
                    }
                    consumeToken(state);

                    const value = parseEquality(state);
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
                return {
                    kind: "Err",
                    error: formatExpressionParseError(
                        state.tokens,
                        state.index,
                    ),
                };
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
            return {
                kind: "Err",
                error: formatExpressionParseError(state.tokens, state.index),
            };
        }
    }
}

/** parse a single statement starting at the given token index */
function parseStatementAt(state: ParserState): StatementParseResult {
    return parseStatement(state);
}

function parseArrowParameters(
    tokens: Token[],
    startIndex: number,
): { parameters: string[]; arrowIndex: number } | null {
    const firstToken = tokens[startIndex];

    if (tokenIs(firstToken, "IdentifierToken")) {
        if (!tokenIs(tokens[startIndex + 1], "ArrowToken")) {
            return null;
        }

        return {
            parameters: [firstToken.name],
            arrowIndex: startIndex + 1,
        };
    }

    if (!tokenIs(firstToken, "LeftParenToken")) {
        return null;
    }

    const parameters: string[] = [];
    let index = startIndex + 1;

    if (!tokenIs(tokens[index], "RightParenToken")) {
        while (true) {
            const parameter = tokens[index];
            if (!tokenIs(parameter, "IdentifierToken")) {
                return null;
            }

            parameters.push(parameter.name);
            index += 1;

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

    if (!tokenIs(tokens[index + 1], "ArrowToken")) {
        return null;
    }

    return {
        parameters,
        arrowIndex: index + 1,
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

/** dispatch to the appropriate statement parser based on the current token */
function parseStatement(state: ParserState): StatementParseResult {
    const token = currentToken(state);
    if (!token) {
        return { statement: null, index: state.index };
    }

    switch (token.kind) {
        case "LetToken": {
            const arrowDeclaration = parseArrowFunctionDeclaration(state);
            if (arrowDeclaration.statement !== null) {
                return arrowDeclaration;
            }
            return parseLetOrConst(state, false, true);
        }
        case "VarToken": {
            const arrowDeclaration = parseArrowFunctionDeclaration(state);
            if (arrowDeclaration.statement !== null) {
                return arrowDeclaration;
            }
            return parseLetOrConst(state, false, true);
        }
        case "ConstToken": {
            const arrowDeclaration = parseArrowFunctionDeclaration(state);
            if (arrowDeclaration.statement !== null) {
                return arrowDeclaration;
            }
            return parseLetOrConst(state, true, true);
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

function parseWhile(state: ParserState): StatementParseResult {
    let index = state.index + 1;
    if (!tokenIs(state.tokens[index], "LeftParenToken")) {
        return { statement: null, index: state.index };
    }

    const condition = parseExpressionAt(state.tokens, index + 1);
    if (condition.kind === "Err") {
        return { statement: null, index: state.index };
    }

    index = condition.value.index;
    if (!tokenIs(state.tokens[index], "RightParenToken")) {
        return { statement: null, index: state.index };
    }
    index += 1;

    const body = parseBlock(state.tokens, index, state);
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
            condition: condition.value.expression,
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
function parseIf(state: ParserState): StatementParseResult {
    let index = state.index + 1;
    if (!tokenIs(state.tokens[index], "LeftParenToken")) {
        return { statement: null, index: state.index };
    }

    const condition = parseExpressionAt(state.tokens, index + 1);
    if (condition.kind === "Err") {
        return { statement: null, index: state.index };
    }

    index = condition.value.index;
    if (!tokenIs(state.tokens[index], "RightParenToken")) {
        return { statement: null, index: state.index };
    }
    index += 1;

    const thenBranch = parseBlock(state.tokens, index, state);
    if (thenBranch.body === null) {
        return { statement: null, index: state.index };
    }

    index = thenBranch.index;

    if (tokenIs(state.tokens[index], "ElseToken")) {
        index += 1;
        if (tokenIs(state.tokens[index], "IfToken")) {
            const elseIf = parseStatementAt(updateParserState(state, index));
            if (
                elseIf.statement === null ||
                elseIf.statement.kind !== "IfStatement"
            ) {
                return { statement: null, index: state.index };
            }

            return {
                statement: {
                    kind: "IfStatement",
                    condition: condition.value.expression,
                    thenBranch: thenBranch.body,
                    elseBranch: [elseIf.statement],
                },
                index: elseIf.index,
            };
        }

        const elseBranch = parseBlock(state.tokens, index, state);
        if (elseBranch.body === null) {
            return { statement: null, index: state.index };
        }

        return {
            statement: {
                kind: "IfStatement",
                condition: condition.value.expression,
                thenBranch: thenBranch.body,
                elseBranch: elseBranch.body,
            },
            index: elseBranch.index,
        };
    }

    return {
        statement: {
            kind: "IfStatement",
            condition: condition.value.expression,
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
    index += 1;

    const parameters: string[] = [];
    if (!tokenIs(state.tokens[index], "RightParenToken")) {
        while (true) {
            const parameter = state.tokens[index];
            if (!tokenIs(parameter, "IdentifierToken")) {
                return { statement: null, index: state.index };
            }

            parameters.push(parameter.name);
            index += 1;

            if (tokenIs(state.tokens[index], "CommaToken")) {
                index += 1;
                continue;
            }

            break;
        }
    }

    if (!tokenIs(state.tokens[index], "RightParenToken")) {
        return { statement: null, index: state.index };
    }
    index += 1;

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
            parameters,
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

function parseContinue(state: ParserState): StatementParseResult {
    if (!state.insideForLoop) {
        return { statement: null, index: state.index };
    }

    let index = state.index + 1;
    const tokenAfterContinue = state.tokens[index];

    if (
        tokenAfterContinue !== undefined &&
        !tokenIs(tokenAfterContinue, "SemicolonToken") &&
        !tokenIs(tokenAfterContinue, "RightBraceToken")
    ) {
        return { statement: null, index: state.index };
    }

    if (tokenIs(tokenAfterContinue, "SemicolonToken")) {
        index += 1;
    }

    return {
        statement: {
            kind: "ContinueStatement",
        },
        index,
    };
}

function parseBreak(state: ParserState): StatementParseResult {
    if (!state.insideForLoop) {
        return { statement: null, index: state.index };
    }

    let index = state.index + 1;
    const tokenAfterBreak = state.tokens[index];

    if (
        tokenAfterBreak !== undefined &&
        !tokenIs(tokenAfterBreak, "SemicolonToken") &&
        !tokenIs(tokenAfterBreak, "RightBraceToken")
    ) {
        return { statement: null, index: state.index };
    }

    if (tokenIs(tokenAfterBreak, "SemicolonToken")) {
        index += 1;
    }

    return {
        statement: {
            kind: "BreakStatement",
        },
        index,
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

    if (token.kind === "IfToken") {
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

    if (token.kind === "ForToken") {
        const leftParen = tokens[index + 1];
        const initState = tokenIs(leftParen, "LeftParenToken")
            ? ParserState(tokens, index + 2, false, false)
            : null;
        const forInit = initState
            ? parseLetOrConst(initState, false, false)
            : null;

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

    if (token.kind === "LetToken" || token.kind === "ConstToken") {
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

    if (token.kind === "FunctionToken") {
        const name = tokens[index + 1];
        let functionBody = null;

        if (tokenIs(name, "IdentifierToken")) {
            let parameterIndex = index + 3;
            const leftParen = tokens[index + 2];

            if (tokenIs(leftParen, "LeftParenToken")) {
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
                    parameterIndex >= 0 &&
                    tokenIs(tokens[parameterIndex], "RightParenToken")
                ) {
                    functionBody = parseBlock(tokens, parameterIndex + 1);
                }
            }
        }

        return {
            functionBody,
        };
    }

    return {};
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
