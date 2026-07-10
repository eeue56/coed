import {
    buildStatementFailureContext,
    createExpressionParseError,
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
    createForLoopStatement,
    createParserState,
    createWhileLoopParts,
    currentToken,
    isStatementTerminator,
    okResult,
    parseArrowParameters,
    parseExpressionThenConsumeToken,
    parseNameLookupPostfix,
    parseOptionalTerminatedExpression,
    parseTypedParametersUntil,
    skipSemicolonTokens,
    statementResult,
    stripStringQuotes,
    tokenIs,
    tryConsumeToken,
    tryParseIdentifierAt,
    updateParserState,
    withoutWhitespace,
} from "./parserHelpers.ts";
import { tokenize } from "./tokenize.ts";
import type {
    Ast,
    BinaryOperatorRule,
    Expression,
    ExpressionParseResult,
    ParseExpressionFunction,
    ParserState,
    Program,
    Result,
    StatementParseResult,
    Token,
    TokenKinds,
} from "./types.ts";

type StatementParser = (state: ParserState) => StatementParseResult;
type BinaryExpression = Extract<
    Expression,
    { left: Expression; right: Expression }
>;

type ParsedFunctionBody = { body: Ast[]; index: number };
type LetStatement = Extract<Ast, { kind: "LetStatement" }>;
type IfStatementAst = Extract<Ast, { kind: "IfStatement" }>;
type ParsedForHeader = {
    init: LetStatement;
    condition: Expression;
    increment: Expression;
    afterRightParenIndex: number;
};
type LoopControlKind = "ContinueStatement" | "BreakStatement";
type ParsedConditionBlock = {
    condition: Expression;
    body: Ast[];
    nextIndex: number;
};
type ParsedOptionalElse = {
    elseBranch?: Ast[];
    nextIndex: number;
};
type ClosingTokenKind = "RightParenToken" | "RightBracketToken";
type StatementListParseResult = {
    statements: Ast[] | null;
    index: number;
    noProgressToken?: Token;
};

function binaryRule<K extends BinaryExpression["kind"]>(
    tokenKind: BinaryOperatorRule["tokenKind"],
    kind: K,
): BinaryOperatorRule {
    return {
        tokenKind,
        build: (left, right) => ({ kind, left, right }) as BinaryExpression,
    };
}

/** parse a single expression starting at the given token index */
export function parseExpressionAt(
    tokens: Token[],
    index: number,
): Result<ExpressionParseResult> {
    const state = createParserState(tokens, index, false, false);
    const expression = parseLogicalOr(state);
    if (expression.kind === "Err") {
        return expression;
    }

    return okResult({
        expression: expression.value,
        index: state.index,
    });
}

function parseLeftAssociative(
    state: ParserState,
    parseOperand: ParseExpressionFunction,
    rules: BinaryOperatorRule[],
): Result<Expression> {
    const parsedLeft = parseOperand(state);
    if (parsedLeft.kind === "Err") return parsedLeft;
    let expression = parsedLeft.value;

    while (true) {
        const token = currentToken(state);
        const rule = token
            ? rules.find((candidate) => candidate.tokenKind === token.kind)
            : undefined;
        if (!rule) {
            return okResult(expression);
        }

        consumeToken(state);
        const right = parseOperand(state);
        if (right.kind === "Err") return right;
        expression = rule.build(expression, right.value);
    }
}

function parseDelimitedExpressionList(
    state: ParserState,
    closingTokenKind: ClosingTokenKind,
): Result<Expression[]> {
    const values: Expression[] = [];

    if (tokenIs(currentToken(state), closingTokenKind)) {
        consumeToken(state);
        return okResult(values);
    }

    while (true) {
        const parsed = parseLogicalOr(state);
        if (parsed.kind === "Err") return parsed;
        values.push(parsed.value);

        if (tokenIs(currentToken(state), "CommaToken")) {
            consumeToken(state);
            continue;
        }

        if (!tokenIs(currentToken(state), closingTokenKind)) {
            return createExpressionParseError(state.tokens, state.index);
        }

        consumeToken(state);
        return okResult(values);
    }
}

function consumeRequiredTokenOrExpressionError(
    state: ParserState,
    kind: TokenKinds,
): Result<null> {
    if (!tokenIs(currentToken(state), kind)) {
        return createExpressionParseError(state.tokens, state.index);
    }

    consumeToken(state);
    return okResult(null);
}

function parseCallArgumentsAfterLeftParen(
    state: ParserState,
): Result<Expression[]> {
    consumeToken(state);
    return parseDelimitedExpressionList(state, "RightParenToken");
}

function parseFunctionCallPostfix(
    state: ParserState,
    expression: Expression,
): Result<Expression | null> {
    return parseNameLookupPostfix(expression, (asName) => {
        const args = parseCallArgumentsAfterLeftParen(state);
        if (args.kind === "Err") return args;

        return okResult({
            kind: "FunctionCallExpression",
            functionName: asName.name,
            arguments: args.value,
        });
    });
}

function parseDotPostfix(
    state: ParserState,
    expression: Expression,
): Result<Expression | null> {
    return parseNameLookupPostfix(expression, (asName) => {
        consumeToken(state);
        const propertyToken = currentToken(state);
        if (!tokenIs(propertyToken, "IdentifierToken")) {
            return createExpressionParseError(state.tokens, state.index);
        }
        consumeToken(state);

        if (!tokenIs(currentToken(state), "LeftParenToken")) {
            return okResult({
                kind: "ObjectPropertyExpression",
                object: asName,
                property: {
                    kind: "NameLookupExpression",
                    name: propertyToken.name,
                },
            });
        }

        const args = parseCallArgumentsAfterLeftParen(state);
        if (args.kind === "Err") return args;

        return okResult({
            kind: "ObjectMethodCallExpression",
            object: asName,
            method: { kind: "NameLookupExpression", name: propertyToken.name },
            arguments: args.value,
        });
    });
}

function parseParenthesizedLogicalOr(state: ParserState): Result<Expression> {
    consumeToken(state);
    const expression = parseLogicalOr(state);
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

function parseArrayLiteralExpression(state: ParserState): Result<Expression> {
    consumeToken(state);
    const elements = parseDelimitedExpressionList(state, "RightBracketToken");
    if (elements.kind === "Err") return elements;

    return okResult({ kind: "ArrayExpression", elements: elements.value });
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
): Result<Expression | null> {
    return parseNameLookupPostfix(expression, (asName) => {
        consumeToken(state);
        const indexToken = currentToken(state);

        if (
            !tokenIs(indexToken, "NumberToken") &&
            !tokenIs(indexToken, "StringToken")
        ) {
            return createExpressionParseError(state.tokens, state.index);
        }

        consumeToken(state);
        const rightBracket = consumeRequiredTokenOrExpressionError(
            state,
            "RightBracketToken",
        );
        if (rightBracket.kind === "Err") {
            return rightBracket;
        }

        if (indexToken.kind === "NumberToken") {
            return okResult({
                kind: "ArrayAccessExpression",
                array: asName,
                index: { kind: "NumberExpression", value: indexToken.value },
            });
        }

        return okResult({
            kind: "ObjectPropertyExpression",
            object: asName,
            property: createStringLiteralExpression(
                stripStringQuotes(indexToken.value),
            ),
        });
    });
}

function parseUpdatePostfix(
    state: ParserState,
    expression: Expression,
    tokenKind: "IncrementToken" | "DecrementToken",
): Result<Expression | null> {
    return parseNameLookupPostfix(expression, (asName) => {
        consumeToken(state);
        return okResult({
            kind:
                tokenKind === "IncrementToken"
                    ? "IncrementExpression"
                    : "DecrementExpression",
            variable: asName.name,
        });
    });
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
): Result<Expression | null> {
    consumeToken(state);

    const afterType = consumeTypeSyntax(
        state.tokens,
        state.index,
        asTypeAssertionStopTokens,
    );
    if (afterType === null) {
        return createExpressionParseError(state.tokens, state.index);
    }

    state.index = afterType;
    return okResult(expression);
}

const postfixParsers: Partial<
    Record<
        TokenKinds,
        (
            state: ParserState,
            expression: Expression,
        ) => Result<Expression | null>
    >
> = {
    LeftParenToken: parseFunctionCallPostfix,
    DotToken: parseDotPostfix,
    LeftBracketToken: parseBracketPostfix,
    IncrementToken: (state, expression) =>
        parseUpdatePostfix(state, expression, "IncrementToken"),
    DecrementToken: (state, expression) =>
        parseUpdatePostfix(state, expression, "DecrementToken"),
    AsToken: parseAsTypeAssertion,
};

const logicalOrRules: BinaryOperatorRule[] = [
    binaryRule("OrToken", "OrExpression"),
];
const binaryPrecedenceRules: BinaryOperatorRule[][] = [
    logicalOrRules,
    [binaryRule("AndToken", "AndExpression")],
    [
        binaryRule("EqualityToken", "EqualityExpression"),
        binaryRule("InequalityToken", "InequalityExpression"),
    ],
    [
        binaryRule("LessThanToken", "LessThanExpression"),
        binaryRule("MoreThanToken", "MoreThanExpression"),
        binaryRule("LessThanOrEqualToken", "LessThanOrEqualExpression"),
        binaryRule("MoreThanOrEqualToken", "MoreThanOrEqualExpression"),
    ],
    [
        binaryRule("AdditionToken", "AdditionExpression"),
        binaryRule("SubtractionToken", "SubtractionExpression"),
    ],
    [
        binaryRule("MultiplicationToken", "MultiplicationExpression"),
        binaryRule("DivisionToken", "DivisionExpression"),
    ],
];

function parseBinaryByPrecedence(
    state: ParserState,
    level: number,
): Result<Expression> {
    if (level >= binaryPrecedenceRules.length) {
        return parsePostfix(state);
    }

    return parseLeftAssociative(
        state,
        (nextState) => parseBinaryByPrecedence(nextState, level + 1),
        binaryPrecedenceRules[level],
    );
}

function parseLogicalOr(state: ParserState): Result<Expression> {
    return parseBinaryByPrecedence(state, 0);
}

/** parse postfix operations: function calls, dot access, bracket access, ++/-- */
function parsePostfix(state: ParserState): Result<Expression> {
    const parsedExpression = parseLeaf(state);
    if (parsedExpression.kind === "Err") return parsedExpression;

    let currentExpression = parsedExpression.value;

    while (true) {
        const token = currentToken(state);
        const parsePostfixToken = token
            ? postfixParsers[token.kind]
            : undefined;
        if (!parsePostfixToken) {
            return okResult(currentExpression);
        }

        const next = parsePostfixToken(state, currentExpression);
        if (next.kind === "Err") return next;
        if (next.value === null) {
            return okResult(currentExpression);
        }

        currentExpression = next.value;
    }
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
function parseLeaf(state: ParserState): Result<Expression> {
    const token = currentToken(state);
    if (!token) {
        return createExpressionParseError(state.tokens, state.index);
    }

    if (token.kind === "NegationToken" || token.kind === "TypeofToken") {
        consumeToken(state);
        return parseLeaf(state);
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
        return createExpressionParseError(state.tokens, state.index);
    }

    consumeToken(state);
    return okResult(expression);
}

function tryParseExpressionAt(
    tokens: Token[],
    index: number,
): ExpressionParseResult | null {
    const parsed = parseExpressionAt(tokens, index);
    return parsed.kind === "Err" ? null : parsed.value;
}

function tryParseBlockAt(
    state: ParserState,
    index: number,
    nextState?: Partial<ParserState>,
): { body: Ast[]; index: number } | null {
    const parsed = parseBlock(
        state.tokens,
        index,
        updateParserState(state, index, nextState),
    );
    return parsed.body === null
        ? null
        : {
              body: parsed.body,
              index: parsed.index,
          };
}

function parseFunctionBody(
    state: ParserState,
    startIndex: number,
    allowExpressionBody: boolean,
): ParsedFunctionBody | null {
    if (tokenIs(state.tokens[startIndex], "LeftBraceToken")) {
        return tryParseBlockAt(state, startIndex, {
            insideFunction: true,
            insideForLoop: false,
        });
    }

    if (!allowExpressionBody) {
        return null;
    }

    const expression = tryParseExpressionAt(state.tokens, startIndex);
    if (expression === null) {
        return null;
    }

    return {
        body: [
            {
                kind: "LetStatement",
                name: "result",
                value: expression.expression,
            },
        ],
        index: expression.index,
    };
}

function parseForHeader(
    state: ParserState,
    startIndex: number,
): ParsedForHeader | null {
    let index = tryConsumeToken(state.tokens, startIndex, "LeftParenToken");
    if (index === null) {
        return null;
    }

    const init = parseLetOrConst(updateParserState(state, index), false, false);
    if (init.statement === null || init.statement.kind !== "LetStatement") {
        return null;
    }

    index = tryConsumeToken(state.tokens, init.index, "SemicolonToken");
    if (index === null) {
        return null;
    }

    const condition = parseExpressionThenConsumeToken(
        state.tokens,
        index,
        "SemicolonToken",
        tryParseExpressionAt,
    );
    if (condition === null) return null;

    const increment = parseExpressionThenConsumeToken(
        state.tokens,
        condition.nextIndex,
        "RightParenToken",
        tryParseExpressionAt,
    );
    if (increment === null) return null;

    return {
        init: init.statement,
        condition: condition.expression,
        increment: increment.expression,
        afterRightParenIndex: increment.nextIndex,
    };
}

function parseObjectPropertyKeyOrExpressionError(
    state: ParserState,
): Result<string> {
    const keyToken = currentToken(state);
    if (
        !keyToken ||
        (keyToken.kind !== "IdentifierToken" && keyToken.kind !== "StringToken")
    ) {
        return createExpressionParseError(state.tokens, state.index);
    }

    consumeToken(state);
    return okResult(
        keyToken.kind === "IdentifierToken"
            ? keyToken.name
            : stripStringQuotes(keyToken.value),
    );
}

function parseObjectPropertyEntry(
    state: ParserState,
): Result<{ key: string; value: Expression }> {
    const key = parseObjectPropertyKeyOrExpressionError(state);
    if (key.kind === "Err") {
        return key;
    }

    const colon = consumeRequiredTokenOrExpressionError(state, "ColonToken");
    if (colon.kind === "Err") {
        return colon;
    }

    const value = parseLogicalOr(state);
    if (value.kind === "Err") {
        return value;
    }

    return okResult({ key: key.value, value: value.value });
}

function parseObjectExpression(state: ParserState): Result<Expression> {
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

    return okResult({
        kind: "ObjectExpression",
        properties,
    });
}

function parseFunctionDeclarationFromParts(
    state: ParserState,
    name: string,
    parameters: string[],
    bodyStartIndex: number,
    allowExpressionBody: boolean,
    consumeSemicolon: boolean,
): StatementParseResult {
    const body = parseFunctionBody(state, bodyStartIndex, allowExpressionBody);
    if (body === null) {
        return createFailedStatement(state);
    }

    return statementResult(
        {
            kind: "FunctionDeclaration",
            name,
            parameters,
            body: body.body,
        },
        consumeSemicolon
            ? consumeOptionalSemicolon(state.tokens, body.index)
            : body.index,
    );
}

function parseArrowFunctionDeclaration(
    state: ParserState,
): StatementParseResult {
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
        true,
        true,
    );
}

function parseDeclarationStatement(
    state: ParserState,
    isConst: boolean,
): StatementParseResult {
    const arrowDeclaration = parseArrowFunctionDeclaration(state);
    return arrowDeclaration.statement !== null
        ? arrowDeclaration
        : parseLetOrConst(state, isConst, true);
}

/** dispatch to the appropriate statement parser based on the current token */
const statementParsers: Partial<Record<TokenKinds, StatementParser>> = {
    LetToken: (state) => parseDeclarationStatement(state, false),
    VarToken: (state) => parseDeclarationStatement(state, false),
    ConstToken: (state) => parseDeclarationStatement(state, true),
    IfToken: parseIf,
    ForToken: parseFor,
    WhileToken: parseWhile,
    FunctionToken: parseFunction,
    ReturnToken: parseReturn,
    ContinueToken: (state) =>
        parseLoopControlStatement(state, "ContinueStatement"),
    BreakToken: (state) => parseLoopControlStatement(state, "BreakStatement"),
};

function parseStatement(state: ParserState): StatementParseResult {
    const token = currentToken(state);
    if (!token) {
        return createFailedStatement(state);
    }

    return (
        statementParsers[token.kind]?.(state) ?? createFailedStatement(state)
    );
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
        if (parsed.statement === null) {
            return { statements: null, index };
        }

        if (parsed.index === index && tokens[index]) {
            return {
                statements: null,
                index,
                noProgressToken: tokens[index],
            };
        }

        statements.push(parsed.statement);
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
): {
    body: Ast[] | null;
    index: number;
} {
    if (!tokenIs(tokens[startIndex], "LeftBraceToken")) {
        return { body: null, index: startIndex };
    }

    const parsed = parseStatementList(
        parentState,
        startIndex + 1,
        "RightBraceToken",
    );
    return {
        body: parsed.statements,
        index: parsed.index,
    };
}

/** parse a let or const variable declaration */
export function parseLetOrConst(
    state: ParserState,
    isConst: boolean,
    consumeSemicolon: boolean,
): StatementParseResult {
    const parsedName = tryParseIdentifierAt(state.tokens, state.index + 1);
    if (parsedName === null) {
        return createFailedStatement(state);
    }

    let index = parsedName.nextIndex;

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

    const parsed = tryParseExpressionAt(state.tokens, index);
    if (parsed === null) {
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
            value: parsed.expression,
        },
        index,
    );
}

function parseParenthesizedExpressionFrom(
    tokens: Token[],
    startIndex: number,
): ExpressionParseResult | null {
    if (!tokenIs(tokens[startIndex], "LeftParenToken")) {
        return null;
    }

    const expression = tryParseExpressionAt(tokens, startIndex + 1);
    if (expression === null) {
        return null;
    }

    if (!tokenIs(tokens[expression.index], "RightParenToken")) {
        return null;
    }

    return {
        expression: expression.expression,
        index: expression.index + 1,
    };
}

function parseConditionAndBlock(
    state: ParserState,
    conditionStartIndex: number,
): ParsedConditionBlock | null {
    const condition = parseParenthesizedExpressionFrom(
        state.tokens,
        conditionStartIndex,
    );
    if (condition === null) {
        return null;
    }

    const body = tryParseBlockAt(state, condition.index);
    if (body === null) {
        return null;
    }

    return {
        condition: condition.expression,
        body: body.body,
        nextIndex: body.index,
    };
}

function parseOptionalElseBranch(
    state: ParserState,
    index: number,
): ParsedOptionalElse | null {
    if (!tokenIs(state.tokens[index], "ElseToken")) {
        return { nextIndex: index };
    }

    const elseIndex = index + 1;
    if (tokenIs(state.tokens[elseIndex], "IfToken")) {
        const elseIf = parseStatement(updateParserState(state, elseIndex));
        if (
            elseIf.statement === null ||
            elseIf.statement.kind !== "IfStatement"
        ) {
            return null;
        }

        return {
            elseBranch: [elseIf.statement],
            nextIndex: elseIf.index,
        };
    }

    const elseBranch = tryParseBlockAt(state, elseIndex);
    if (elseBranch === null) {
        return null;
    }

    return {
        elseBranch: elseBranch.body,
        nextIndex: elseBranch.index,
    };
}

function createIfStatement(
    condition: Expression,
    thenBranch: Ast[],
    elseBranch?: Ast[],
): IfStatementAst {
    return elseBranch === undefined
        ? { kind: "IfStatement", condition, thenBranch }
        : { kind: "IfStatement", condition, thenBranch, elseBranch };
}

function parseWhile(state: ParserState): StatementParseResult {
    const parsedLoop = parseConditionAndBlock(state, state.index + 1);
    if (parsedLoop === null) {
        return createFailedStatement(state);
    }

    const loopVariable = `__while_${state.index}`;
    const whileLoopParts = createWhileLoopParts(
        loopVariable,
        parsedLoop.condition,
    );

    return statementResult(
        createForLoopStatement(
            whileLoopParts.init,
            whileLoopParts.condition,
            whileLoopParts.increment,
            parsedLoop.body,
        ),
        parsedLoop.nextIndex,
    );
}

function parseIf(state: ParserState): StatementParseResult {
    const parsedIf = parseConditionAndBlock(state, state.index + 1);
    if (parsedIf === null) {
        return createFailedStatement(state);
    }

    const parsedElse = parseOptionalElseBranch(state, parsedIf.nextIndex);
    if (parsedElse === null) {
        return createFailedStatement(state);
    }

    return statementResult(
        createIfStatement(
            parsedIf.condition,
            parsedIf.body,
            parsedElse.elseBranch,
        ),
        parsedElse.nextIndex,
    );
}

/** parse a for loop with initializer, condition, and increment */
function parseFor(state: ParserState): StatementParseResult {
    const header = parseForHeader(state, state.index + 1);
    if (header === null) {
        return createFailedStatement(state);
    }

    const body = tryParseBlockAt(state, header.afterRightParenIndex, {
        insideForLoop: true,
    });
    if (body === null) {
        return createFailedStatement(state);
    }

    return statementResult(
        createForLoopStatement(
            header.init,
            header.condition,
            header.increment,
            body.body,
        ),
        body.index,
    );
}

/** parse a function declaration with a name, parameter list, and body */
function parseFunction(state: ParserState): StatementParseResult {
    const name = tryParseIdentifierAt(state.tokens, state.index + 1);
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
    if (typedParameters === null) {
        return createFailedStatement(state);
    }

    return parseFunctionDeclarationFromParts(
        state,
        name.name,
        typedParameters.parameters,
        typedParameters.stopTokenIndex,
        false,
        false,
    );
}

function parseReturn(state: ParserState): StatementParseResult {
    if (!state.insideFunction) {
        return createFailedStatement(state);
    }

    const parsedReturnValue = parseOptionalTerminatedExpression(
        state.tokens,
        state.index + 1,
        tryParseExpressionAt,
    );
    if (parsedReturnValue === null) {
        return createFailedStatement(state);
    }

    return statementResult(
        {
            kind: "ReturnStatement",
            value: parsedReturnValue.value,
        },
        parsedReturnValue.nextIndex,
    );
}

function parseTerminatedNoValueStatement(
    state: ParserState,
    statement: Ast,
): StatementParseResult {
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
): StatementParseResult {
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
    if (parsed.statements === null) {
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

    return {
        kind: "Ok",
        value: parsed.statements,
    };
}

/** parse a single expression from a token list, stripping whitespace first */
export function parseExpression(tokens: Token[]): Result<Expression> {
    const cleanTokens = withoutWhitespace(tokens);
    const parsed = parseExpressionAt(cleanTokens, 0);

    if (parsed.kind === "Err") return parsed;

    if (parsed.value.index !== cleanTokens.length) {
        return {
            kind: "Err",
            error: formatTrailingExpressionError(
                cleanTokens,
                parsed.value.index,
            ),
        };
    }

    return okResult(parsed.value.expression);
}

/** tokenize and parse a JavaScript source string into an AST */
export function parse(input: string): Result<Program> {
    const tokens = withoutWhitespace(tokenize(input));
    return parseAllStatements(tokens, input);
}

export type ParsedExpressionResult = ReturnType<typeof parseExpressionAt>;
export type ParsedBlockResult = ReturnType<typeof parseBlock>;
export type ParsedStatementResult = ReturnType<typeof parseLetOrConst>;
