import type { Result } from "../../types.ts";
import {
    isDeclaration,
    type Ast,
    type Expression,
    type IfStatement,
    type IndexedResult,
    type OperatorRule,
    type ParserState,
    type Program,
    type TokenKinds,
} from "../types.ts";

import {
    buildStatementFailureContext,
    formatNoProgressError,
    formatStatementParseError,
    formatTrailingExpressionError,
} from "./parserErrors.ts";
import {
    consumeOptionalSemicolon,
    consumeOptionalTypeAnnotation,
    consumeToken,
    consumeTypeSyntax,
    createFailedStatement,
    createForInOfLoopStatement,
    createForLoopStatement,
    createParserState,
    createWhileLoopParts,
    currentToken,
    isStatementTerminator,
    parseArrowParameters,
    parseExpressionThenConsumeToken,
    parseTypedParametersUntil,
    requireNameLookup,
    skipSemicolonTokens,
    statementResult,
    stripStringQuotes,
    tokenIs,
    tryConsumeToken,
    tryParseIdentifierAt,
    updateParserState,
    withoutWhitespace,
    type OptionalTerminatedExpression,
} from "./parserHelpers.ts";
import { tokenize } from "./tokenize.ts";
import {
    isAssignmentTarget,
    isChainableExpression,
    operatorRule,
    type ClosingTokenKind,
    type LoopControlKind,
    type ParsedConditionBlock,
    type ParsedForHeader,
    type ParsedOptionalElse,
    type StatementListParseResult,
    type StatementParser,
    type Token,
} from "./types.ts";

/** parse a single expression starting at the given token index */
export function parseExpressionAt(
    tokens: Token[],
    index: number,
): IndexedResult<Expression> {
    const state = createParserState(tokens, index, false, false);

    const expression = parseAssignmentExpression(state);
    if (expression.kind === "Err") {
        return parseLeaf(state);
    }

    return {
        kind: "Ok",
        value: expression.value,
        index: state.index,
    };
}

function parseAssignmentExpression(
    state: ParserState,
): IndexedResult<Expression> {
    const left = parseOperatorByPrecedence(state);
    if (left.kind === "Err") return left;

    state.index = left.index;
    const assignmentToken = currentToken(state);
    if (
        !tokenIs(assignmentToken, "AssignToken") &&
        !(
            (tokenIs(assignmentToken, "AdditionToken") ||
                tokenIs(assignmentToken, "SubtractionToken")) &&
            tokenIs(state.tokens[state.index + 1], "AssignToken")
        )
    ) {
        return left;
    }

    if (!isAssignmentTarget(left.value)) {
        return {
            kind: "Err",
            error: "Expected an assignment target",
            index: state.index,
        };
    }

    if (
        tokenIs(assignmentToken, "AdditionToken") ||
        tokenIs(assignmentToken, "SubtractionToken")
    ) {
        state.index += 2;

        const right = parseAssignmentExpression(state);
        if (right.kind === "Err") return right;

        state.index = right.index;

        const variable = assignmentTargetToString(left.value);
        if (variable === null) {
            return {
                kind: "Err",
                error: "Expected a valid += or -= assignment target",
                index: state.index,
            };
        }

        return {
            kind: "Ok",
            value:
                assignmentToken.kind === "AdditionToken"
                    ? {
                          kind: "IncreaseExpression",
                          variable,
                          amount: right.value,
                      }
                    : {
                          kind: "DecreaseExpression",
                          variable,
                          amount: right.value,
                      },
            index: state.index,
        };
    }

    consumeToken(state);
    const right = parseAssignmentExpression(state);
    if (right.kind === "Err") return right;

    state.index = right.index;
    return {
        kind: "Ok",
        value: {
            kind: "AssignmentExpression",
            target: left.value,
            value: right.value,
        },
        index: state.index,
    };
}

function assignmentTargetToString(expression: Expression): string | null {
    switch (expression.kind) {
        case "NameLookupExpression":
            return expression.name;
        case "ObjectPropertyExpression": {
            const object = assignmentTargetToString(expression.object);
            if (object === null) {
                return null;
            }

            if (expression.property.kind === "NameLookupExpression") {
                return `${object}.${expression.property.name}`;
            }

            if (
                expression.property.values.length === 1 &&
                expression.property.values[0].kind === "StringExpression"
            ) {
                return `${object}[\`${expression.property.values[0].value}\`]`;
            }

            return null;
        }
        case "ArrayAccessExpression": {
            const array = assignmentTargetToString(expression.array);
            if (array === null) {
                return null;
            }

            const index = expression.index;

            switch (index.kind) {
                case "NumberExpression":
                    return `${array}[${index.value}]`;
                case "NameLookupExpression":
                    return `${array}[${index.name}]`;
                case "StringExpression":
                    return `${array}["${index.value}"]`;
                default:
                    return null;
            }
        }
        default:
            return null;
    }
}

function parseDelimitedExpressionList(
    state: ParserState,
    closingTokenKind: ClosingTokenKind,
): IndexedResult<Expression[]> {
    const values: Expression[] = [];

    if (tokenIs(currentToken(state), closingTokenKind)) {
        consumeToken(state);
        return { kind: "Ok", value: values, index: state.index };
    }

    while (state.index < state.tokens.length) {
        const parsed = parseAssignmentExpression(state);
        if (parsed.kind === "Err") return parsed;
        values.push(parsed.value);

        if (tokenIs(currentToken(state), "CommaToken")) {
            consumeToken(state);

            if (tokenIs(currentToken(state), closingTokenKind)) {
                consumeToken(state);
                return { kind: "Ok", value: values, index: state.index };
            }

            continue;
        }

        if (!tokenIs(currentToken(state), closingTokenKind)) {
            return {
                kind: "Err",
                error: "Expected an expression",
                index: state.index,
            };
        }

        consumeToken(state);
        return { kind: "Ok", value: values, index: state.index };
    }

    return { kind: "Ok", value: values, index: state.index };
}

function consumeRequiredTokenOrExpressionError(
    state: ParserState,
    kind: TokenKinds,
): IndexedResult<null> {
    if (!tokenIs(currentToken(state), kind)) {
        return {
            kind: "Err",
            error: `Expected token of kind ${kind}`,
            index: state.index,
        };
    }

    consumeToken(state);
    return {
        kind: "Ok",
        value: null,
        index: state.index,
    };
}

function parseCallArgumentsAfterLeftParen(
    state: ParserState,
): IndexedResult<Expression[]> {
    consumeToken(state);
    return parseDelimitedExpressionList(state, "RightParenToken");
}

function parseFunctionCallPostfix(
    state: ParserState,
    expression: Expression,
): IndexedResult<Expression> {
    const lookup = requireNameLookup(expression);
    if (lookup == null) {
        return {
            kind: "Err",
            error: "Expected a name lookup expression",
            index: state.index,
        };
    }

    const args = parseCallArgumentsAfterLeftParen(state);
    if (args.kind === "Err") return args;

    return {
        kind: "Ok",
        value: {
            kind: "FunctionCallExpression",
            functionName: lookup.name,
            arguments: args.value,
        },
        index: state.index,
    };
}

/**
 * annoying helper due to promise api using `.catch` and the impossibility of
 * strange prototype names
 *
 * todo: do this better
 */
function propertyNameFromToken(token: Token): string | null {
    if (token.kind === "IdentifierToken") {
        return token.name;
    }

    switch (token.kind) {
        case "LetToken":
        case "VarToken":
        case "ConstToken":
        case "ClassToken":
        case "ExtendsToken":
        case "ImportToken":
        case "ExportToken":
        case "AsyncToken":
        case "AwaitToken":
        case "ThisToken":
        case "NewToken":
        case "SuperToken":
        case "TryToken":
        case "CatchToken":
        case "ThrowToken":
        case "DefaultToken":
        case "ForToken":
        case "WhileToken":
        case "DoToken":
        case "WithToken":
        case "IfToken":
        case "ElseToken":
        case "FunctionToken":
        case "ReturnToken":
        case "ContinueToken":
        case "BreakToken":
        case "NullToken":
        case "TypeofToken":
        case "AsToken":
        case "UndefinedToken":
        case "TrueToken":
        case "FalseToken":
            return token.kind.slice(0, -5).toLowerCase();
        default:
            return null;
    }
}

function parseArrowFunctionExpression(
    state: ParserState,
): IndexedResult<Expression> {
    const parameters = parseArrowParameters(state.tokens, state.index);
    if (parameters === null) {
        return {
            kind: "Err",
            error: "Expected an arrow function expression",
            index: state.index,
        };
    }

    const bodyStartIndex = parameters.arrowIndex + 1;
    const functionState = updateParserState(state, bodyStartIndex, {
        insideFunction: true,
        insideForLoop: false,
    });

    if (tokenIs(state.tokens[bodyStartIndex], "LeftBraceToken")) {
        const body = parseBlock(state.tokens, bodyStartIndex, functionState);
        if (body.kind === "Err") {
            return {
                kind: "Err",
                error: "Expected a block body for arrow function",
                index: bodyStartIndex,
            };
        }

        state.index = body.index;
        return {
            kind: "Ok",
            value: {
                kind: "ArrowFunctionExpression",
                isAsync: parameters.isAsync,
                parameters: parameters.parameters,
                body: body.value,
            },
            index: state.index,
        };
    }

    const body = parseAssignmentExpression(functionState);
    if (body.kind === "Err") {
        return body;
    }

    state.index = body.index;
    return {
        kind: "Ok",
        value: {
            kind: "ArrowFunctionExpression",
            isAsync: parameters.isAsync,
            parameters: parameters.parameters,
            body: body.value,
        },
        index: state.index,
    };
}

function parseFunctionExpression(
    state: ParserState,
): IndexedResult<Expression> {
    consumeToken(state);

    let index = state.index;
    if (tokenIs(state.tokens[index], "IdentifierToken")) {
        index += 1;
    }

    const typedParameters = parseFunctionParametersUntilBody(
        state.tokens,
        index,
    );
    if (typedParameters.kind === "Err") {
        return {
            kind: "Err",
            error: "Expected a function expression",
            index: state.index,
        };
    }

    const body = parseFunctionBody(state, typedParameters.index, false);
    if (body.kind === "Err") {
        return {
            kind: "Err",
            error: "Expected a block body for function expression",
            index: state.index,
        };
    }

    state.index = body.index;
    return {
        kind: "Ok",
        value: {
            kind: "ArrowFunctionExpression",
            isAsync: false,
            parameters: typedParameters.value,
            body: body.value,
        },
        index: state.index,
    };
}

function parseFunctionParametersUntilBody(
    tokens: Token[],
    startIndex: number,
): IndexedResult<string[]> {
    const parameterStartIndex = tryConsumeToken(
        tokens,
        startIndex,
        "LeftParenToken",
    );
    if (parameterStartIndex === null) {
        return {
            kind: "Err",
            error: "Expected function expression parameters",
            index: startIndex,
        };
    }

    const typedParameters = parseTypedParametersUntil(
        tokens,
        parameterStartIndex,
        "LeftBraceToken",
    );

    if (typedParameters === null || typedParameters.kind === "Err") {
        return {
            kind: "Err",
            error: "Expected function expression parameters",
            index: startIndex,
        };
    }

    return {
        kind: "Ok",
        value: typedParameters.value,
        index: typedParameters.index,
    };
}

function parseAwaitExpression(state: ParserState): IndexedResult<Expression> {
    consumeToken(state);
    const value = parsePostfix(state);
    if (value.kind === "Err") {
        return {
            kind: "Err",
            error: "Expected an expression after await",
            index: state.index,
        };
    }

    return {
        kind: "Ok",
        value: {
            kind: "AwaitExpression",
            value: value.value,
        },
        index: state.index,
    };
}

function parseNewExpression(state: ParserState): IndexedResult<Expression> {
    consumeToken(state);
    const callee = parsePostfix(state);
    if (callee.kind === "Err") {
        return {
            kind: "Err",
            error: "Expected a constructor after new",
            index: state.index,
        };
    }

    let constructorCallee = callee.value;
    let args: Expression[] = [];

    if (callee.value.kind === "FunctionCallExpression") {
        constructorCallee = {
            kind: "NameLookupExpression",
            name: callee.value.functionName,
        };
        args = callee.value.arguments;
    }

    if (tokenIs(currentToken(state), "LeftParenToken")) {
        const parsedArgs = parseCallArgumentsAfterLeftParen(state);
        if (parsedArgs.kind === "Err") {
            return parsedArgs;
        }
        args = parsedArgs.value;
    }

    return {
        kind: "Ok",
        value: {
            kind: "NewExpression",
            callee: constructorCallee,
            arguments: args,
        },
        index: state.index,
    };
}

function parseDynamicImportExpression(
    state: ParserState,
): IndexedResult<Expression> {
    consumeToken(state);

    if (!tokenIs(currentToken(state), "LeftParenToken")) {
        return {
            kind: "Err",
            error: "Expected '(' after import",
            index: state.index,
        };
    }

    const args = parseCallArgumentsAfterLeftParen(state);
    if (args.kind === "Err" || args.value.length !== 1) {
        return {
            kind: "Err",
            error: "Expected import to have exactly one argument",
            index: state.index,
        };
    }

    return {
        kind: "Ok",
        value: {
            kind: "ImportExpression",
            source: args.value[0],
        },
        index: state.index,
    };
}

function parseDotPostfix(
    state: ParserState,
    expression: Expression,
): IndexedResult<Expression> {
    if (!isChainableExpression(expression)) {
        return {
            kind: "Err",
            error: "Expected a name lookup expression",
            index: state.index,
        };
    }

    consumeToken(state);
    const propertyToken = currentToken(state);
    const propertyName = propertyToken
        ? propertyNameFromToken(propertyToken)
        : null;
    // console.log(propertyName);
    if (propertyName === null) {
        return {
            kind: "Err",
            error: "Expected an identifier token",
            index: state.index,
        };
    }
    consumeToken(state);

    if (!tokenIs(currentToken(state), "LeftParenToken")) {
        return {
            kind: "Ok",
            value: {
                kind: "ObjectPropertyExpression",
                object: expression,
                property: {
                    kind: "NameLookupExpression",
                    name: propertyName,
                },
            },
            index: state.index,
        };
    }

    const args = parseCallArgumentsAfterLeftParen(state);
    if (args.kind === "Err") return args;

    return {
        kind: "Ok",
        value: {
            kind: "ObjectMethodCallExpression",
            object: expression,
            method: { kind: "NameLookupExpression", name: propertyName },
            arguments: args.value,
        },
        index: state.index,
    };
}

function parseParenthesizedLogicalOr(
    state: ParserState,
): IndexedResult<Expression> {
    consumeToken(state);
    const expression = parseAssignmentExpression(state);
    if (expression.kind === "Err") return expression;

    const rightParen = consumeRequiredTokenOrExpressionError(
        state,
        "RightParenToken",
    );
    if (rightParen.kind === "Err") {
        return rightParen;
    }

    return expression;
}

function parseArrayLiteralExpression(
    state: ParserState,
): IndexedResult<Expression> {
    consumeToken(state);
    const elements = parseDelimitedExpressionList(state, "RightBracketToken");
    if (elements.kind === "Err") return elements;

    return {
        kind: "Ok",
        value: { kind: "ArrayExpression", elements: elements.value },
        index: state.index,
    };
}

function createStringLiteralExpression(
    value: string,
): Extract<Expression, { kind: "StringLiteralExpression" }> {
    return {
        kind: "StringLiteralExpression",
        values: [{ kind: "StringExpression", value }],
    };
}

function parseBracketPostfix(
    state: ParserState,
    expression: Expression,
): IndexedResult<Expression> {
    if (!isChainableExpression(expression)) {
        return {
            kind: "Err",
            error: "Expected a name lookup expression",
            index: state.index,
        };
    }

    consumeToken(state);
    const indexToken = currentToken(state);

    if (indexToken && tokenIs(indexToken, "NumberToken")) {
        consumeToken(state);
        const rightBracket = consumeRequiredTokenOrExpressionError(
            state,
            "RightBracketToken",
        );
        if (rightBracket.kind === "Err") {
            return rightBracket;
        }

        return {
            kind: "Ok",
            value: {
                kind: "ArrayAccessExpression",
                array: expression,
                index: { kind: "NumberExpression", value: indexToken.value },
            },
            index: state.index,
        };
    }

    if (indexToken && tokenIs(indexToken, "StringToken")) {
        consumeToken(state);
        const rightBracket = consumeRequiredTokenOrExpressionError(
            state,
            "RightBracketToken",
        );
        if (rightBracket.kind === "Err") {
            return rightBracket;
        }

        return {
            kind: "Ok",
            value: {
                kind: "ObjectPropertyExpression",
                object: expression,
                property: createStringLiteralExpression(
                    stripStringQuotes(indexToken.value),
                ),
            },
            index: state.index,
        };
    }

    const parsedIndex = parseAssignmentExpression(state);
    if (parsedIndex.kind === "Err") {
        return {
            kind: "Err",
            error: "Expected a number, string, or expression",
            index: state.index,
        };
    }

    state.index = parsedIndex.index;

    const rightBracket = consumeRequiredTokenOrExpressionError(
        state,
        "RightBracketToken",
    );
    if (rightBracket.kind === "Err") {
        return rightBracket;
    }

    return {
        kind: "Ok",
        value: {
            kind: "ArrayAccessExpression",
            array: expression,
            index: parsedIndex.value,
        },
        index: state.index,
    };
}

function parseUpdatePostfix(
    state: ParserState,
    expression: Expression,
    tokenKind: "IncrementToken" | "DecrementToken",
): IndexedResult<Expression> {
    const lookup = requireNameLookup(expression);
    if (lookup == null) {
        return {
            kind: "Err",
            error: "Expected a name lookup expression",
            index: state.index,
        };
    }
    consumeToken(state);
    return {
        kind: "Ok",
        value: {
            kind:
                tokenKind === "IncrementToken"
                    ? "IncrementExpression"
                    : "DecrementExpression",
            variable: lookup.name,
        },
        index: state.index,
    };
}

const asTypeAssertionStopTokens: TokenKinds[] = [
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
];

function parseAsTypeAssertion(
    state: ParserState,
    expression: Expression,
): IndexedResult<Expression> {
    consumeToken(state);

    const afterType = consumeTypeSyntax(
        state.tokens,
        state.index,
        asTypeAssertionStopTokens,
    );
    if (afterType === null) {
        return {
            kind: "Err",
            error: "Expected a type assertion",
            index: state.index,
        };
    }

    state.index = afterType;
    return {
        kind: "Ok",
        value: expression,
        index: state.index,
    };
}

type PostfixParser = (
    state: ParserState,
    expression: Expression,
) => IndexedResult<Expression | null>;

const postfixParsers: Partial<Record<TokenKinds, PostfixParser>> = {
    LeftParenToken: parseFunctionCallPostfix,
    DotToken: parseDotPostfix,
    LeftBracketToken: parseBracketPostfix,
    IncrementToken: (state, expression) =>
        parseUpdatePostfix(state, expression, "IncrementToken"),
    DecrementToken: (state, expression) =>
        parseUpdatePostfix(state, expression, "DecrementToken"),
    AsToken: parseAsTypeAssertion,
};

const logicalOrRules: OperatorRule[] = [
    operatorRule("OrToken", "OrExpression"),
];
const operatorPrecedenceRules: OperatorRule[][] = [
    logicalOrRules,
    [operatorRule("AndToken", "AndExpression")],
    [
        operatorRule("EqualityToken", "EqualityExpression"),
        operatorRule("InequalityToken", "InequalityExpression"),
    ],
    [
        operatorRule("LessThanToken", "LessThanExpression"),
        operatorRule("MoreThanToken", "MoreThanExpression"),
        operatorRule("LessThanOrEqualToken", "LessThanOrEqualExpression"),
        operatorRule("MoreThanOrEqualToken", "MoreThanOrEqualExpression"),
    ],
    [
        operatorRule("AdditionToken", "AdditionExpression"),
        operatorRule("SubtractionToken", "SubtractionExpression"),
    ],
    [
        operatorRule("MultiplicationToken", "MultiplicationExpression"),
        operatorRule("DivisionToken", "DivisionExpression"),
    ],
];

function parseOperatorByPrecedence(
    state: ParserState,
): IndexedResult<Expression> {
    return parseOperatorLevel(state, 0);
}

function parseOperatorLevel(
    state: ParserState,
    level: number,
): IndexedResult<Expression> {
    if (level >= operatorPrecedenceRules.length) {
        return parsePostfix(state);
    }

    const parsedLeft = parseOperatorLevel(state, level + 1);
    if (parsedLeft.kind === "Err") return parsedLeft;

    let expression = parsedLeft.value;
    state.index = parsedLeft.index;
    const rules = operatorPrecedenceRules[level];

    while (state.index < state.tokens.length) {
        const token = currentToken(state);
        if (!token) break;

        const rule = rules.find(
            (candidate) => candidate.tokenKind === token.kind,
        );
        if (!rule) break;

        if (
            (token.kind === "AdditionToken" ||
                token.kind === "SubtractionToken") &&
            tokenIs(state.tokens[state.index + 1], "AssignToken")
        ) {
            break;
        }

        consumeToken(state);

        const right = parseOperatorLevel(state, level + 1);
        if (right.kind === "Err") return right;

        expression = rule.build(expression, right.value);
        state.index = right.index;
    }

    return { kind: "Ok", value: expression, index: state.index };
}

/** parse postfix operations: function calls, dot access, bracket access, */
function parsePostfix(state: ParserState): IndexedResult<Expression> {
    if (tokenIs(currentToken(state), "NegationToken")) {
        consumeToken(state);
        const value = parsePostfix(state);
        if (value.kind === "Err") {
            return value;
        }

        return {
            kind: "Ok",
            value: {
                kind: "NegationExpression",
                value: value.value,
            },
            index: state.index,
        };
    }

    const parsedExpression = parseLeaf(state);
    if (parsedExpression.kind === "Err") return parsedExpression;

    let currentExpression = parsedExpression.value;

    /* eslint-disable-next-line */
    while (true) {
        const token = currentToken(state);
        const parsePostfixToken = token
            ? postfixParsers[token.kind]
            : undefined;
        if (!parsePostfixToken) {
            break;
        }

        const next = parsePostfixToken(state, currentExpression);
        if (next.kind === "Err") return next;
        if (next.value === null) {
            break;
        }

        currentExpression = next.value;
    }

    return {
        kind: "Ok",
        value: currentExpression,
        index: state.index,
    };
}

function parseLeafExpression(token: Token): Expression | null {
    switch (token.kind) {
        case "NumberToken":
            return { kind: "NumberExpression", value: token.value };
        case "StringToken": {
            const value = stripStringQuotes(token.value);
            return token.value.startsWith("`") && token.value.endsWith("`")
                ? createStringLiteralExpression(value)
                : { kind: "StringExpression", value };
        }
        case "IdentifierToken":
            return { kind: "NameLookupExpression", name: token.name };
        case "ThisToken":
            return { kind: "ThisExpression" };
        case "SuperToken":
            return { kind: "SuperExpression" };
        case "TrueToken":
            return { kind: "BooleanExpression", value: true };
        case "FalseToken":
            return { kind: "BooleanExpression", value: false };
        case "NullToken":
        case "UndefinedToken":
            return { kind: "NullExpression" };
        default:
            return null;
    }
}

/** parse a primary (leaf) expression: literal, identifier, or parenthesised expression */
function parseLeaf(state: ParserState): IndexedResult<Expression> {
    const token = currentToken(state);
    if (!token) {
        return {
            kind: "Err",
            error: "Expected an expression",
            index: state.index,
        };
    }

    const nextToken = state.tokens[state.index + 1];
    if (
        token.kind === "SubtractionToken" &&
        tokenIs(nextToken, "NumberToken")
    ) {
        state.index += 2;

        return {
            kind: "Ok",
            value: {
                kind: "NumberExpression",
                value: -nextToken.value,
            },
            index: state.index,
        };
    }

    if (parseArrowParameters(state.tokens, state.index) !== null) {
        return parseArrowFunctionExpression(state);
    }

    if (token.kind === "AwaitToken") {
        return parseAwaitExpression(state);
    }

    if (token.kind === "NewToken") {
        return parseNewExpression(state);
    }

    if (token.kind === "ImportToken") {
        return parseDynamicImportExpression(state);
    }

    if (token.kind === "TypeofToken") {
        consumeToken(state);
        return parseLeaf(state);
    }

    if (token.kind === "FunctionToken") {
        return parseFunctionExpression(state);
    }

    if (token.kind === "LeftParenToken") {
        return parseParenthesizedLogicalOr(state);
    }

    if (token.kind === "LeftBracketToken") {
        return parseArrayLiteralExpression(state);
    }

    if (token.kind === "LeftBraceToken") {
        return parseObjectExpression(state);
    }

    const expression = parseLeafExpression(token);
    if (!expression) {
        return {
            kind: "Err",
            error: "Expected an expression",
            index: state.index,
        };
    }

    consumeToken(state);
    return {
        kind: "Ok",
        value: expression,
        index: state.index,
    };
}

function tryParseBlockAt(
    state: ParserState,
    index: number,
    nextState?: Partial<ParserState>,
): IndexedResult<Ast[]> {
    const parsed = parseBlock(
        state.tokens,
        index,
        updateParserState(state, index, nextState),
    );

    return parsed.kind === "Err"
        ? { kind: "Err", error: "Expected a block", index }
        : { kind: "Ok", value: parsed.value, index: parsed.index };
}

function parseOptionalTerminatedExpression(
    tokens: Token[],
    startIndex: number,
): Result<OptionalTerminatedExpression> {
    if (isStatementTerminator(tokens[startIndex])) {
        return {
            kind: "Ok",
            value: {
                value: null,
                nextIndex: consumeOptionalSemicolon(tokens, startIndex),
            },
        };
    }

    const parsedExpression = parseExpressionAt(tokens, startIndex);
    if (parsedExpression.kind === "Err") {
        return { kind: "Err", error: "Expected an expression" };
    }

    return {
        kind: "Ok",
        value: {
            value: parsedExpression.value,
            nextIndex: consumeOptionalSemicolon(tokens, parsedExpression.index),
        },
    };
}

function parseFunctionBody(
    state: ParserState,
    startIndex: number,
    allowExpressionBody: boolean,
): IndexedResult<Ast[]> {
    if (tokenIs(state.tokens[startIndex], "LeftBraceToken")) {
        return tryParseBlockAt(state, startIndex, {
            insideFunction: true,
            insideForLoop: false,
        });
    }

    if (!allowExpressionBody) {
        return {
            kind: "Err",
            error: "Expected a block for function body",
            index: startIndex,
        };
    }

    const expression = parseExpressionAt(state.tokens, startIndex);
    if (expression.kind === "Err") {
        return {
            kind: "Err",
            error: "Expected an expression for function body",
            index: startIndex,
        };
    }

    return {
        kind: "Ok",
        value: [
            {
                kind: "LetStatement",
                name: "result",
                value: expression.value,
            },
        ],
        index: expression.index,
    };
}

function parseForHeader(
    state: ParserState,
    startIndex: number,
): Result<ParsedForHeader> {
    let index = tryConsumeToken(state.tokens, startIndex, "LeftParenToken");
    if (index === null) {
        return { kind: "Err", error: "Expected '('" };
    }

    const declarationToken = state.tokens[index];
    const isConst = tokenIs(declarationToken, "ConstToken");

    if (!isConst && !tokenIs(declarationToken, "LetToken")) {
        return { kind: "Err", error: "Expected let or const in for loop" };
    }

    const parsedName = tryParseIdentifierAt(state.tokens, index + 1);
    if (parsedName === null) {
        return { kind: "Err", error: "Expected loop variable name" };
    }

    const afterType = consumeOptionalTypeAnnotation(
        state.tokens,
        parsedName.nextIndex,
        ["AssignToken", "SemicolonToken", "InToken", "OfToken"],
    );
    if (afterType === null) {
        return { kind: "Err", error: "Expected valid loop variable type" };
    }

    const operatorToken = state.tokens[afterType];
    if (
        tokenIs(operatorToken, "InToken") ||
        tokenIs(operatorToken, "OfToken")
    ) {
        const iterable = parseExpressionThenConsumeToken(
            state.tokens,
            "RightParenToken",
            parseExpressionAt(state.tokens, afterType + 1),
        );
        if (iterable === null || iterable.kind === "Err") {
            return { kind: "Err", error: "Expected iterable in for loop" };
        }

        return {
            kind: "Ok",
            value: {
                kind: "ForInOfHeader",
                binding: {
                    declarationKind: isConst ? "const" : "let",
                    name: parsedName.name,
                },
                operator: operatorToken.kind === "InToken" ? "in" : "of",
                iterable: iterable.value,
                afterRightParenIndex: iterable.index,
            },
        };
    }

    const init = parseLetOrConst(
        updateParserState(state, index),
        isConst,
        false,
    );
    if (
        init.kind === "Err" ||
        (init.value.kind !== "LetStatement" &&
            init.value.kind !== "ConstStatement")
    ) {
        return { kind: "Err", error: "Expected init statement in for loop" };
    }

    index = tryConsumeToken(state.tokens, init.index, "SemicolonToken");
    if (index === null) {
        return {
            kind: "Err",
            error: "Expected ';' after init statement in for loop",
        };
    }

    const condition = parseExpressionThenConsumeToken(
        state.tokens,
        "SemicolonToken",
        parseExpressionAt(state.tokens, index),
    );
    if (condition === null || condition.kind === "Err") {
        return { kind: "Err", error: "Expected condition in for loop" };
    }

    const increment = parseExpressionThenConsumeToken(
        state.tokens,
        "RightParenToken",
        parseExpressionAt(state.tokens, condition.index),
    );
    if (increment === null || increment.kind === "Err") {
        return { kind: "Err", error: "Expected increment in for loop" };
    }

    return {
        kind: "Ok",
        value: {
            kind: "ClassicForHeader",
            init: init.value,
            condition: condition.value,
            increment: increment.value,
            afterRightParenIndex: increment.index,
        },
    };
}

function parseObjectPropertyKeyOrExpressionError(
    state: ParserState,
): IndexedResult<string> {
    const keyToken = currentToken(state);
    if (
        !keyToken ||
        (keyToken.kind !== "IdentifierToken" && keyToken.kind !== "StringToken")
    ) {
        return {
            kind: "Err",
            error: "Expected a string or identifier as object property key",
            index: state.index,
        };
    }

    consumeToken(state);

    let key: string;
    if (keyToken.kind === "IdentifierToken") {
        key = keyToken.name;
    } else {
        key = stripStringQuotes(keyToken.value);
    }

    return {
        kind: "Ok",
        value: key,
        index: state.index,
    };
}

function parseObjectPropertyEntry(
    state: ParserState,
): IndexedResult<{ key: string; value: Expression }> {
    const key = parseObjectPropertyKeyOrExpressionError(state);
    if (key.kind === "Err") {
        return key;
    }

    const colon = consumeRequiredTokenOrExpressionError(state, "ColonToken");
    if (colon.kind === "Err") {
        return colon;
    }

    const value = parseAssignmentExpression(state);
    if (value.kind === "Err") {
        return value;
    }

    return {
        kind: "Ok",
        value: { key: key.value, value: value.value },
        index: state.index,
    };
}

function parseObjectExpression(state: ParserState): IndexedResult<Expression> {
    consumeToken(state);
    const properties: { [key: string]: Expression } = {};

    while (!tokenIs(currentToken(state), "RightBraceToken")) {
        const entry = parseObjectPropertyEntry(state);
        if (entry.kind === "Err") {
            return entry;
        }

        properties[entry.value.key] = entry.value.value;

        if (!tokenIs(currentToken(state), "CommaToken")) {
            break;
        }

        consumeToken(state);
    }

    const rightBrace = consumeRequiredTokenOrExpressionError(
        state,
        "RightBraceToken",
    );
    if (rightBrace.kind === "Err") {
        return rightBrace;
    }

    return {
        kind: "Ok",
        value: {
            kind: "ObjectExpression",
            properties,
        },
        index: state.index,
    };
}

function parseFunctionDeclarationFromParts(
    state: ParserState,
    name: string,
    parameters: string[],
    bodyStartIndex: number,
    isAsync: boolean,
    allowExpressionBody: boolean,
    consumeSemicolon: boolean,
): IndexedResult<Ast> {
    const body = parseFunctionBody(state, bodyStartIndex, allowExpressionBody);
    if (body.kind === "Err") {
        return createFailedStatement(state);
    }

    return statementResult(
        {
            kind: "FunctionDeclaration",
            isAsync,
            name,
            parameters,
            body: body.value,
        },
        consumeSemicolon
            ? consumeOptionalSemicolon(state.tokens, body.index)
            : body.index,
    );
}

function parseArrowFunctionDeclaration(state: ParserState): IndexedResult<Ast> {
    const declarationName = tryParseIdentifierAt(state.tokens, state.index + 1);
    if (declarationName === null) {
        return createFailedStatement(state);
    }

    const afterAssign = tryConsumeToken(
        state.tokens,
        declarationName.nextIndex,
        "AssignToken",
    );
    if (afterAssign === null) {
        return createFailedStatement(state);
    }

    const parameters = parseArrowParameters(state.tokens, afterAssign);
    if (parameters === null) {
        return createFailedStatement(state);
    }

    return parseFunctionDeclarationFromParts(
        state,
        declarationName.name,
        parameters.parameters,
        parameters.arrowIndex + 1,
        parameters.isAsync,
        true,
        true,
    );
}

function tryParseSuperClass(
    state: ParserState,
    index: number,
): IndexedResult<Expression> {
    const extendsToken = tryConsumeToken(state.tokens, index, "ExtendsToken");
    if (extendsToken === null) {
        return { kind: "Err", index: index, error: "Expected extends token" };
    }

    const superClass = parseExpressionAt(state.tokens, extendsToken);
    if (superClass.kind === "Err") {
        return {
            kind: "Err",
            index: index,
            error: "Failed to parse super class",
        };
    }

    return {
        kind: "Ok",
        value: superClass.value,
        index: superClass.index,
    };
}

function parseClassMethodDeclaration(
    state: ParserState,
    index: number,
): IndexedResult<Ast> {
    let methodIndex = index;
    let isAsync = false;

    if (tokenIs(state.tokens[methodIndex], "AsyncToken")) {
        isAsync = true;
        methodIndex += 1;
    }

    const methodNameToken = state.tokens[methodIndex];
    let methodName: string | null = null;

    if (tokenIs(methodNameToken, "IdentifierToken")) {
        methodName = methodNameToken.name;
    } else if (
        tokenIs(methodNameToken, "FunctionToken") &&
        methodNameToken.startIndex === methodNameToken.endIndex
    ) {
        methodName = "constructor";
    }

    if (methodName === null) {
        return {
            kind: "Err",
            error: "Expected class method name",
            index,
        };
    }

    const parameterStartIndex = tryConsumeToken(
        state.tokens,
        methodIndex + 1,
        "LeftParenToken",
    );
    if (parameterStartIndex === null) {
        return {
            kind: "Err",
            error: "Expected '(' after class method name",
            index,
        };
    }

    const typedParameters = parseTypedParametersUntil(
        state.tokens,
        parameterStartIndex,
        "LeftBraceToken",
    );
    if (typedParameters === null || typedParameters.kind === "Err") {
        return {
            kind: "Err",
            error: "Expected class method declaration",
            index,
        };
    }

    return parseFunctionDeclarationFromParts(
        state,
        methodName,
        typedParameters.value,
        typedParameters.index,
        isAsync,
        false,
        false,
    );
}

function parseClassBody(
    state: ParserState,
    index: number,
): IndexedResult<Ast[]> {
    if (!tokenIs(state.tokens[index], "LeftBraceToken")) {
        return {
            kind: "Err",
            error: "Expected '{' for class body",
            index,
        };
    }

    const body: Ast[] = [];
    let currentIndex = index + 1;

    while (currentIndex < state.tokens.length) {
        currentIndex = skipSemicolonTokens(state.tokens, currentIndex);

        if (tokenIs(state.tokens[currentIndex], "RightBraceToken")) {
            return {
                kind: "Ok",
                value: body,
                index: currentIndex + 1,
            };
        }

        const method = parseClassMethodDeclaration(state, currentIndex);
        if (method.kind === "Err") {
            return method;
        }

        body.push(method.value);
        currentIndex = method.index;
    }

    return {
        kind: "Err",
        error: "Expected '}' to close class body",
        index: currentIndex,
    };
}

/**
 * parse something like:
 *
 * ```
 * class FishFrog extends Banana {
 *   constructor(name) {
 *      this.name = name;
 *   }
 *
 *   async sayHi(person) {
 *     console.log("Oh, hi", person, "I'm ", this.name);
 *   }
 * }
 * ```
 */
function parseClassDeclaration(state: ParserState): IndexedResult<Ast> {
    const className = tryParseIdentifierAt(state.tokens, state.index + 1);
    if (className === null) {
        return createFailedStatement(state);
    }

    const afterClassName = className.nextIndex;
    const superClass = tryParseSuperClass(state, afterClassName);
    const bodyStartIndex =
        superClass.kind === "Ok" ? superClass.index : afterClassName;

    const body = parseClassBody(state, bodyStartIndex);
    if (body.kind === "Err") {
        return createFailedStatement(state);
    }

    return statementResult(
        {
            kind: "ClassDeclaration",
            name: className.name,
            superClass: superClass.kind === "Ok" ? superClass.value : null,
            body: body.value,
        },
        consumeOptionalSemicolon(state.tokens, body.index),
    );
}

function parseDeclarationStatement(
    state: ParserState,
    isConst: boolean,
): IndexedResult<Ast> {
    const arrowDeclaration = parseArrowFunctionDeclaration(state);
    return arrowDeclaration.kind === "Ok"
        ? arrowDeclaration
        : parseLetOrConst(state, isConst, true);
}

/** dispatch to the appropriate statement parser based on the current token */
const statementParsers: Partial<Record<TokenKinds, StatementParser>> = {
    LetToken: (state) => parseDeclarationStatement(state, false),
    VarToken: (state) => parseDeclarationStatement(state, false),
    ConstToken: (state) => parseDeclarationStatement(state, true),
    ImportToken: parseImport,
    ExportToken: parseExport,
    AsyncToken: parseAsync,
    IfToken: parseIf,
    ForToken: parseFor,
    WhileToken: parseWhile,
    DoToken: parseDoWhile,
    FunctionToken: parseFunction,
    ClassToken: parseClassDeclaration,
    TryToken: parseTryCatch,
    ThrowToken: parseThrow,
    ReturnToken: parseReturn,
    ContinueToken: (state) =>
        parseLoopControlStatement(state, "ContinueStatement"),
    BreakToken: (state) => parseLoopControlStatement(state, "BreakStatement"),
};

function sliceTokensUpToSemicolon(
    tokens: Token[],
    startIndex: number,
): Token[] {
    const result: Token[] = [];
    let index = startIndex;
    let parenDepth = 0;
    let bracketDepth = 0;
    let braceDepth = 0;

    while (index < tokens.length) {
        const token = tokens[index];

        if (
            parenDepth === 0 &&
            bracketDepth === 0 &&
            braceDepth === 0 &&
            (token.kind === "SemicolonToken" ||
                token.kind === "RightBraceToken")
        ) {
            break;
        }

        result.push(token);

        switch (token.kind) {
            case "LeftParenToken":
                parenDepth += 1;
                break;
            case "RightParenToken":
                parenDepth -= 1;
                break;
            case "LeftBracketToken":
                bracketDepth += 1;
                break;
            case "RightBracketToken":
                bracketDepth -= 1;
                break;
            case "LeftBraceToken":
                braceDepth += 1;
                break;
            case "RightBraceToken":
                braceDepth -= 1;
                break;
        }

        index++;
    }

    return result;
}

function parseStatement(state: ParserState): IndexedResult<Ast> {
    const token = currentToken(state);
    if (!token) {
        return createFailedStatement(state);
    }

    const parser = statementParsers[token.kind];

    if (typeof parser !== "undefined") {
        return parser(state);
    }

    const inputTokens = sliceTokensUpToSemicolon(state.tokens, state.index);
    const expression = parseExpression(inputTokens);

    if (expression.kind === "Ok") {
        return {
            kind: "Ok",
            value: {
                kind: "LineTerminatedExpression",
                expressions: [expression.value],
            },
            index: state.index + inputTokens.length,
        };
    }

    return {
        kind: "Err",
        error: "Failed to parse bare-expression",
        index: state.index,
    };
}

function parseStatementList(
    parentState: ParserState,
    startIndex: number,
    stopTokenKind?: "RightBraceToken",
): StatementListParseResult {
    const statements: Ast[] = [];
    const tokens = parentState.tokens;
    let index = startIndex;

    while (index < tokens.length) {
        index = skipSemicolonTokens(tokens, index);
        if (index >= tokens.length) {
            break;
        }

        if (stopTokenKind && tokenIs(tokens[index], stopTokenKind)) {
            return { statements, index: index + 1 };
        }

        const parsed = parseStatement(updateParserState(parentState, index));
        if (parsed.kind === "Err") {
            return { statements: null, index };
        }

        if (parsed.index === index && tokens[index]) {
            return {
                statements: null,
                index,
                noProgressToken: tokens[index],
            };
        }

        statements.push(parsed.value);
        index = parsed.index;
    }

    if (stopTokenKind) {
        return { statements: null, index: startIndex };
    }

    return { statements, index };
}

/** parse a brace-delimited block of statements, returning null on failure */
export function parseBlock(
    tokens: Token[],
    startIndex: number,
    parentState: ParserState = createParserState(
        tokens,
        startIndex,
        false,
        false,
    ),
): IndexedResult<Ast[]> {
    if (!tokenIs(tokens[startIndex], "LeftBraceToken")) {
        return {
            kind: "Err",
            error: "Expected '{'",
            index: startIndex,
        };
    }

    const parsed = parseStatementList(
        parentState,
        startIndex + 1,
        "RightBraceToken",
    );

    if (parsed.statements === null) {
        return {
            kind: "Err",
            error: "Failed to parse block",
            index: parsed.index,
        };
    }

    return {
        kind: "Ok",
        value: parsed.statements,
        index: parsed.index,
    };
}

/** parse a let or const variable declaration */
export function parseLetOrConst(
    state: ParserState,
    isConst: boolean,
    consumeSemicolon: boolean,
): IndexedResult<Ast> {
    const parsedName = tryParseIdentifierAt(state.tokens, state.index + 1);
    if (parsedName === null) {
        return createFailedStatement(state);
    }

    let index = parsedName.nextIndex;

    if (!isConst && tokenIs(state.tokens[index], "CommaToken")) {
        const names = [parsedName.name];

        while (tokenIs(state.tokens[index], "CommaToken")) {
            index += 1;

            const nextName = tryParseIdentifierAt(state.tokens, index);
            if (nextName === null) {
                return createFailedStatement(state);
            }

            names.push(nextName.name);
            index = nextName.nextIndex;
        }

        const finalIndex = consumeSemicolon
            ? consumeOptionalSemicolon(state.tokens, index)
            : index;

        return statementResult(
            {
                kind: "LetListStatement",
                names,
            },
            finalIndex,
        );
    }

    if (!isConst && isStatementTerminator(state.tokens[index])) {
        const finalIndex = consumeSemicolon
            ? consumeOptionalSemicolon(state.tokens, index)
            : index;

        return statementResult(
            {
                kind: "LetListStatement",
                names: [parsedName.name],
            },
            finalIndex,
        );
    }

    const afterType = consumeOptionalTypeAnnotation(state.tokens, index, [
        "AssignToken",
    ]);
    if (afterType === null) {
        return createFailedStatement(state);
    }

    index = afterType;
    if (!tokenIs(state.tokens[index], "AssignToken")) {
        return createFailedStatement(state);
    }
    index += 1;

    const parsed = parseExpressionAt(state.tokens, index);

    if (parsed.kind === "Err") {
        return createFailedStatement(state);
    }

    index = parsed.index;
    index = consumeSemicolon
        ? consumeOptionalSemicolon(state.tokens, index)
        : index;

    return statementResult(
        {
            kind: isConst ? "ConstStatement" : "LetStatement",
            name: parsedName.name,
            value: parsed.value,
        },
        index,
    );
}

function parseParenthesizedExpressionFrom(
    tokens: Token[],
    startIndex: number,
): IndexedResult<Expression> {
    if (!tokenIs(tokens[startIndex], "LeftParenToken")) {
        return {
            kind: "Err",
            error: "Expected '(' at start of parenthesized expression",
            index: startIndex,
        };
    }

    const expression = parseExpressionAt(tokens, startIndex + 1);
    if (expression.kind === "Err") {
        return {
            kind: "Err",
            error: "Expected expression in parentheses",
            index: startIndex + 1,
        };
    }

    if (!tokenIs(tokens[expression.index], "RightParenToken")) {
        return {
            kind: "Err",
            error: "Expected ')' at end of parenthesized expression",
            index: expression.index,
        };
    }

    return {
        kind: "Ok",
        value: expression.value,
        index: expression.index + 1,
    };
}

function parseBlockOrSingleStatement(
    state: ParserState,
    startIndex: number,
): Result<{ body: Ast[]; nextIndex: number }> {
    const block = tryParseBlockAt(state, startIndex);
    if (block.kind === "Ok") {
        return {
            kind: "Ok",
            value: {
                body: block.value,
                nextIndex: block.index,
            },
        };
    }

    const statement = parseStatement(updateParserState(state, startIndex));
    if (statement.kind === "Err") {
        return { kind: "Err", error: "Expected statement body" };
    }

    return {
        kind: "Ok",
        value: {
            body: [statement.value],
            nextIndex: statement.index,
        },
    };
}

function parseConditionAndBlock(
    state: ParserState,
    conditionStartIndex: number,
): Result<ParsedConditionBlock> {
    const condition = parseParenthesizedExpressionFrom(
        state.tokens,
        conditionStartIndex,
    );
    if (condition.kind === "Err") {
        return { kind: "Err", error: "Expected condition in parentheses" };
    }

    const body = parseBlockOrSingleStatement(state, condition.index);
    if (body.kind === "Err") {
        return { kind: "Err", error: "Expected body after condition" };
    }

    return {
        kind: "Ok",
        value: {
            condition: condition.value,
            body: body.value.body,
            nextIndex: body.value.nextIndex,
        },
    };
}

function parseOptionalElseBranch(
    state: ParserState,
    index: number,
): Result<ParsedOptionalElse> {
    if (!tokenIs(state.tokens[index], "ElseToken")) {
        return { kind: "Ok", value: { nextIndex: index } };
    }

    const elseIndex = index + 1;
    if (tokenIs(state.tokens[elseIndex], "IfToken")) {
        const elseIf = parseStatement(updateParserState(state, elseIndex));
        if (elseIf.kind === "Err" || elseIf.value.kind !== "IfStatement") {
            return { kind: "Err", error: "Expected IfStatement after ElseIf" };
        }

        return {
            kind: "Ok",
            value: {
                elseIf: elseIf.value,
                nextIndex: elseIf.index,
            },
        };
    }

    const elseBranch = parseBlockOrSingleStatement(state, elseIndex);
    if (elseBranch.kind === "Err") {
        return { kind: "Err", error: "Expected body after Else" };
    }

    return {
        kind: "Ok",
        value: {
            elseBranch: elseBranch.value.body,
            nextIndex: elseBranch.value.nextIndex,
        },
    };
}

function createIfStatement(
    condition: Expression,
    thenBranch: Ast[],
    elseIf?: IfStatement,
    elseBranch?: Ast[],
): IfStatement {
    if (typeof elseIf !== "undefined") {
        return { kind: "IfStatement", condition, thenBranch, elseIf };
    }

    if (typeof elseBranch !== "undefined") {
        return { kind: "IfStatement", condition, thenBranch, elseBranch };
    }

    return { kind: "IfStatement", condition, thenBranch };
}

/**
 * turns a while into a for
 *
 * handles the `break` and `continue` too
 */
function parseWhile(state: ParserState): IndexedResult<Ast> {
    const condition = parseParenthesizedExpressionFrom(
        state.tokens,
        state.index + 1,
    );

    if (condition.kind === "Err") {
        return createFailedStatement(state);
    }

    const body = tryParseBlockAt(state, condition.index, {
        insideForLoop: true,
    });

    if (body.kind === "Err") {
        return createFailedStatement(state);
    }

    const loopVariable = `__while_${state.index}`;
    const whileLoopParts = createWhileLoopParts(loopVariable, condition.value);

    return statementResult(
        createForLoopStatement(
            whileLoopParts.init,
            whileLoopParts.condition,
            whileLoopParts.increment,
            body.value,
        ),
        body.index,
    );
}

function parseDoWhile(state: ParserState): IndexedResult<Ast> {
    const body = parseBlockOrSingleStatement(state, state.index + 1);
    if (body.kind === "Err") {
        return createFailedStatement(state);
    }

    const whileTokenIndex = body.value.nextIndex;
    if (!tokenIs(state.tokens[whileTokenIndex], "WhileToken")) {
        return createFailedStatement(state);
    }

    const condition = parseParenthesizedExpressionFrom(
        state.tokens,
        whileTokenIndex + 1,
    );
    if (condition.kind === "Err") {
        return createFailedStatement(state);
    }

    return statementResult(
        {
            kind: "DoWhileLoop",
            condition: condition.value,
            body: body.value.body,
        },
        consumeOptionalSemicolon(state.tokens, condition.index),
    );
}

function parseIf(state: ParserState): IndexedResult<Ast> {
    const parsedIf = parseConditionAndBlock(state, state.index + 1);
    if (parsedIf.kind === "Err") {
        return createFailedStatement(state);
    }

    const parsedElse = parseOptionalElseBranch(state, parsedIf.value.nextIndex);
    if (parsedElse.kind === "Err") {
        return createFailedStatement(state);
    }

    return statementResult(
        createIfStatement(
            parsedIf.value.condition,
            parsedIf.value.body,
            parsedElse.value.elseIf,
            parsedElse.value.elseBranch,
        ),
        parsedElse.value.nextIndex,
    );
}

/** parse a for loop with initializer, condition, and increment */
function parseFor(state: ParserState): IndexedResult<Ast> {
    const header = parseForHeader(state, state.index + 1);
    if (header.kind === "Err") {
        return createFailedStatement(state);
    }

    const body = tryParseBlockAt(state, header.value.afterRightParenIndex, {
        insideForLoop: true,
    });
    if (body.kind === "Err") {
        return createFailedStatement(state);
    }

    if (header.value.kind === "ForInOfHeader") {
        return statementResult(
            createForInOfLoopStatement(
                header.value.binding,
                header.value.operator,
                header.value.iterable,
                body.value,
            ),
            body.index,
        );
    }

    return statementResult(
        createForLoopStatement(
            header.value.init,
            header.value.condition,
            header.value.increment,
            body.value,
        ),
        body.index,
    );
}

/** parse a function declaration with a name, parameter list, and body */
function parseFunction(state: ParserState): IndexedResult<Ast> {
    return parseFunctionAt(state, state.index, false);
}

function parseAsync(state: ParserState): IndexedResult<Ast> {
    if (!tokenIs(state.tokens[state.index + 1], "FunctionToken")) {
        return createFailedStatement(state);
    }

    return parseFunctionAt(state, state.index + 1, true);
}

function parseFunctionAt(
    state: ParserState,
    functionIndex: number,
    isAsync: boolean,
): IndexedResult<Ast> {
    const name = tryParseIdentifierAt(state.tokens, functionIndex + 1);
    if (name === null) {
        return createFailedStatement(state);
    }

    const parameterStartIndex = tryConsumeToken(
        state.tokens,
        name.nextIndex,
        "LeftParenToken",
    );
    if (parameterStartIndex === null) {
        return createFailedStatement(state);
    }

    const typedParameters = parseTypedParametersUntil(
        state.tokens,
        parameterStartIndex,
        "LeftBraceToken",
    );
    if (typedParameters === null || typedParameters.kind === "Err") {
        return createFailedStatement(state);
    }

    return parseFunctionDeclarationFromParts(
        state,
        name.name,
        typedParameters.value,
        typedParameters.index,
        isAsync,
        false,
        false,
    );
}

function parseThrow(state: ParserState): IndexedResult<Ast> {
    const thrown = parseExpressionAt(state.tokens, state.index + 1);
    if (thrown.kind === "Err") {
        return createFailedStatement(state);
    }

    return statementResult(
        {
            kind: "ThrowStatement",
            value: thrown.value,
        },
        consumeOptionalSemicolon(state.tokens, thrown.index),
    );
}

function parseTryCatch(state: ParserState): IndexedResult<Ast> {
    const parsedTry = tryParseBlockAt(state, state.index + 1);
    if (parsedTry.kind === "Err") {
        return createFailedStatement(state);
    }

    const catchTokenIndex = parsedTry.index;
    if (!tokenIs(state.tokens[catchTokenIndex], "CatchToken")) {
        return createFailedStatement(state);
    }

    if (!tokenIs(state.tokens[catchTokenIndex + 1], "LeftParenToken")) {
        return createFailedStatement(state);
    }

    const catchParam = state.tokens[catchTokenIndex + 2];
    if (!tokenIs(catchParam, "IdentifierToken")) {
        return createFailedStatement(state);
    }

    if (!tokenIs(state.tokens[catchTokenIndex + 3], "RightParenToken")) {
        return createFailedStatement(state);
    }

    const catchBlock = tryParseBlockAt(state, catchTokenIndex + 4);
    if (catchBlock.kind === "Err") {
        return createFailedStatement(state);
    }

    return statementResult(
        {
            kind: "TryCatchStatement",
            catchParameter: catchParam.name,
            tryBlock: parsedTry.value,
            catchBlock: catchBlock.value,
        },
        catchBlock.index,
    );
}

function parseIdentifierListInBraces(
    tokens: Token[],
    startIndex: number,
): { names: string[]; nextIndex: number } | null {
    if (!tokenIs(tokens[startIndex], "LeftBraceToken")) {
        return null;
    }

    const names: string[] = [];
    let index = startIndex + 1;

    while (index < tokens.length) {
        const token = tokens[index];
        if (tokenIs(token, "RightBraceToken")) {
            return { names, nextIndex: index + 1 };
        }

        if (!tokenIs(token, "IdentifierToken")) {
            return null;
        }

        names.push(token.name);
        index += 1;

        if (tokenIs(tokens[index], "CommaToken")) {
            index += 1;
            continue;
        }
    }

    return null;
}

function parseImport(state: ParserState): IndexedResult<Ast> {
    let index = state.index + 1;
    let defaultImport: string | null = null;
    let namedImports: string[] = [];

    const firstImportToken = state.tokens[index];
    if (tokenIs(firstImportToken, "StringToken")) {
        const source = stripStringQuotes(firstImportToken.value);
        return statementResult(
            {
                kind: "ImportStatement",
                defaultImport,
                namedImports,
                source,
            },
            consumeOptionalSemicolon(state.tokens, index + 1),
        );
    }

    const maybeDefaultImport = state.tokens[index];
    if (tokenIs(maybeDefaultImport, "IdentifierToken")) {
        defaultImport = maybeDefaultImport.name;
        index += 1;
        if (tokenIs(state.tokens[index], "CommaToken")) {
            index += 1;
        }
    }

    const parsedNamed = parseIdentifierListInBraces(state.tokens, index);
    if (parsedNamed !== null) {
        namedImports = parsedNamed.names;
        index = parsedNamed.nextIndex;
    }

    const fromToken = state.tokens[index];
    if (!tokenIs(fromToken, "IdentifierToken") || fromToken.name !== "from") {
        return createFailedStatement(state);
    }
    index += 1;

    const sourceToken = state.tokens[index];
    if (!tokenIs(sourceToken, "StringToken")) {
        return createFailedStatement(state);
    }
    index += 1;

    return statementResult(
        {
            kind: "ImportStatement",
            defaultImport,
            namedImports,
            source: stripStringQuotes(sourceToken.value),
        },
        consumeOptionalSemicolon(state.tokens, index),
    );
}

function parseExport(state: ParserState): IndexedResult<Ast> {
    const next = state.tokens[state.index + 1];
    if (typeof next === "undefined") {
        return createFailedStatement(state);
    }

    if (tokenIs(next, "DefaultToken")) {
        const defaultValueStart = state.index + 2;

        if (tokenIs(state.tokens[defaultValueStart], "FunctionToken")) {
            const declaration = parseFunctionAt(
                updateParserState(state, defaultValueStart),
                defaultValueStart,
                false,
            );

            if (
                declaration.kind === "Err" ||
                declaration.value.kind !== "FunctionDeclaration"
            ) {
                return createFailedStatement(state);
            }

            return statementResult(
                {
                    kind: "ExportDefaultStatement",
                    value: declaration.value,
                },
                declaration.index,
            );
        }

        const parsedDefaultExpression = parseExpressionAt(
            state.tokens,
            defaultValueStart,
        );
        if (parsedDefaultExpression.kind === "Err") {
            return createFailedStatement(state);
        }

        return statementResult(
            {
                kind: "ExportDefaultStatement",
                value: parsedDefaultExpression.value,
            },
            consumeOptionalSemicolon(
                state.tokens,
                parsedDefaultExpression.index,
            ),
        );
    }

    if (tokenIs(next, "LeftBraceToken")) {
        const exported = parseIdentifierListInBraces(
            state.tokens,
            state.index + 1,
        );
        if (exported === null) {
            return createFailedStatement(state);
        }

        return statementResult(
            {
                kind: "ExportNamedStatement",
                names: exported.names,
            },
            consumeOptionalSemicolon(state.tokens, exported.nextIndex),
        );
    }

    const declaration = parseStatement(
        updateParserState(state, state.index + 1),
    );
    if (declaration.kind === "Err" || !isDeclaration(declaration.value)) {
        return createFailedStatement(state);
    }

    return statementResult(
        {
            kind: "ExportDeclarationStatement",
            declaration: declaration.value,
        },
        declaration.index,
    );
}

function parseReturn(state: ParserState): IndexedResult<Ast> {
    if (!state.insideFunction) {
        return createFailedStatement(state);
    }

    const parsedReturnValue = parseOptionalTerminatedExpression(
        state.tokens,
        state.index + 1,
    );
    if (parsedReturnValue.kind === "Err") {
        return createFailedStatement(state);
    }

    return statementResult(
        {
            kind: "ReturnStatement",
            value: parsedReturnValue.value.value,
        },
        parsedReturnValue.value.nextIndex,
    );
}

function parseTerminatedNoValueStatement(
    state: ParserState,
    statement: Ast,
): IndexedResult<Ast> {
    const index = state.index + 1;
    if (!isStatementTerminator(state.tokens[index])) {
        return createFailedStatement(state);
    }

    return statementResult(
        statement,
        consumeOptionalSemicolon(state.tokens, index),
    );
}

function parseLoopControlStatement(
    state: ParserState,
    statementKind: LoopControlKind,
): IndexedResult<Ast> {
    if (!state.insideForLoop) {
        return createFailedStatement(state);
    }

    return parseTerminatedNoValueStatement(state, { kind: statementKind });
}

function parseAllStatements(tokens: Token[], input: string): Result<Ast[]> {
    const parsed = parseStatementList(
        createParserState(tokens, 0, false, false),
        0,
    );

    if (parsed.statements !== null) {
        return {
            kind: "Ok",
            value: parsed.statements,
        };
    }

    if (parsed.noProgressToken) {
        return {
            kind: "Err",
            error: formatNoProgressError(input, parsed.noProgressToken),
        };
    }

    return {
        kind: "Err",
        error: formatStatementParseError(
            input,
            tokens,
            parsed.index,
            buildStatementFailureContext(tokens, parsed.index, {
                parseExpressionAt,
                parseBlock,
                parseLetOrConst,
                parseStatementAt: parseStatement,
                createParserState,
                updateParserState,
            }),
        ),
    };
}

function normalizeProgram(statements: Ast[]): Program {
    const program: Program = [];

    for (const statement of statements) {
        if (statement.kind === "LineTerminatedExpression") {
            program.push(...statement.expressions);
            continue;
        }

        program.push(statement);
    }

    return program;
}

/** parse a single expression from a token list, stripping whitespace first */
export function parseExpression(tokens: Token[]): Result<Expression> {
    const cleanTokens = withoutWhitespace(tokens);
    const parsed = parseExpressionAt(cleanTokens, 0);

    if (parsed.kind === "Err") return parsed;

    if (parsed.index === cleanTokens.length) {
        return {
            kind: "Ok",
            value: parsed.value,
        };
    }

    return {
        kind: "Err",
        error: formatTrailingExpressionError(cleanTokens, parsed.index),
    };
}

function parseProgram(input: string): Result<Program> {
    const tokens = withoutWhitespace(tokenize(input));
    const result = parseAllStatements(tokens, input);
    if (result.kind === "Err") {
        return result;
    }

    const program = normalizeProgram(result.value);

    return {
        kind: "Ok",
        value: program,
    };
}

/** tokenize and parse a JavaScript source string into an AST */
export function parse(input: string): Result<Program> {
    return parseProgram(input);
}
