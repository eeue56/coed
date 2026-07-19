import type { Result } from "../../types.ts";
import type {
    Ast,
    Expression,
    IndexedResult,
    ParserState,
    TokenKinds,
} from "../types.ts";
import type { Token } from "./types.ts";

export function withoutWhitespace(tokens: Token[]): Token[] {
    return tokens.filter((token) => token.kind !== "WhitespaceToken");
}

export function stripStringQuotes(value: string): string {
    if (value.length < 2) return value;
    const firstChar = value[0];
    const lastChar = value[value.length - 1];

    if (firstChar !== lastChar) return value;
    if (firstChar !== '"' && firstChar !== "'" && firstChar !== "`") {
        return value;
    }

    return value.slice(1, value.length - 1);
}

export function tokenIs<kind extends TokenKinds>(
    token: Token | null | undefined,
    kind: kind,
): token is Extract<Token, { kind: kind }> {
    return token != null && token.kind === kind;
}

export function isNameLookup(
    expression: Expression,
): NameLookupExpression | null {
    if (expression.kind === "NameLookupExpression") {
        return expression;
    }

    return null;
}

export function currentToken(state: ParserState): Token | null {
    return state.tokens[state.index] || null;
}

export function consumeToken(state: ParserState): void {
    state.index += 1;
}

export function createParserState(
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

export function updateParserState(
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
type NameLookupExpression = Extract<
    Expression,
    { kind: "NameLookupExpression" }
>;

export function okResult<value>(value: value): Result<value> {
    return { kind: "Ok", value };
}

export function statementResult(
    statement: Ast,
    index: number,
): IndexedResult<Ast> {
    return { kind: "Ok", value: statement, index };
}

export function createFailedStatement(state: ParserState): IndexedResult<Ast> {
    return {
        kind: "Err",
        error: "Failed to parse statement",
        index: state.index,
    };
}

export function consumeOptionalSemicolon(
    tokens: Token[],
    index: number,
): number {
    return tokenIs(tokens[index], "SemicolonToken") ? index + 1 : index;
}

export function requireNameLookup(
    expression: Expression,
): null | NameLookupExpression {
    const name = isNameLookup(expression);

    return name ?? null;
}

export function tryParseIdentifierAt(
    tokens: Token[],
    index: number,
): { name: string; nextIndex: number } | null {
    const token = tokens[index];
    if (!tokenIs(token, "IdentifierToken")) {
        return null;
    }

    return { name: token.name, nextIndex: index + 1 };
}

export function tryConsumeToken(
    tokens: Token[],
    index: number,
    kind: TokenKinds,
): number | null {
    return tokenIs(tokens[index], kind) ? index + 1 : null;
}

export function isStatementTerminator(token: Token | undefined): boolean {
    return (
        token === undefined ||
        tokenIs(token, "SemicolonToken") ||
        tokenIs(token, "RightBraceToken")
    );
}

export function skipSemicolonTokens(
    tokens: Token[],
    startIndex: number,
): number {
    let index = startIndex;
    while (tokenIs(tokens[index], "SemicolonToken")) {
        index += 1;
    }

    return index;
}

type TypeSyntaxDepthKey = "paren" | "bracket" | "brace" | "angle";

const typeSyntaxDepthSteps: Partial<
    Record<TokenKinds, { key: TypeSyntaxDepthKey; delta: 1 | -1 }>
> = {
    LeftParenToken: { key: "paren", delta: 1 },
    RightParenToken: { key: "paren", delta: -1 },
    LeftBracketToken: { key: "bracket", delta: 1 },
    RightBracketToken: { key: "bracket", delta: -1 },
    LeftBraceToken: { key: "brace", delta: 1 },
    RightBraceToken: { key: "brace", delta: -1 },
    LessThanToken: { key: "angle", delta: 1 },
    MoreThanToken: { key: "angle", delta: -1 },
};

export type ParameterListParseResult = {
    parameters: string[];
    afterRightParenIndex: number;
};

export type TypedParametersParseResult = {
    parameters: string[];
    stopTokenIndex: number;
};

export type ArrowParametersParseResult = {
    parameters: string[];
    arrowIndex: number;
};

export type OptionalTerminatedExpression = {
    value: Expression | null;
    nextIndex: number;
};

type LetStatement = Extract<Ast, { kind: "LetStatement" }>;

export function createForLoopStatement(
    init: LetStatement,
    condition: Expression,
    increment: Expression,
    body: Ast[],
): Extract<Ast, { kind: "ForLoop" }> {
    return {
        kind: "ForLoop",
        init,
        condition,
        increment,
        body,
    };
}

export function createWhileLoopParts(
    loopVariable: string,
    condition: Expression,
): {
    init: LetStatement;
    condition: Expression;
    increment: Expression;
} {
    return {
        init: {
            kind: "LetStatement",
            name: loopVariable,
            value: { kind: "NumberExpression", value: 0 },
        },
        condition,
        increment: {
            kind: "IncrementExpression",
            variable: loopVariable,
        },
    };
}

export function parseExpressionThenConsumeToken(
    tokens: Token[],
    delimiter: TokenKinds,
    parsed: IndexedResult<Expression>,
): { expression: Expression; nextIndex: number } | null {
    if (parsed.kind === "Err") {
        return null;
    }

    const nextIndex = tryConsumeToken(tokens, parsed.index, delimiter);
    if (nextIndex === null) {
        return null;
    }

    return {
        expression: parsed.value,
        nextIndex,
    };
}

export function consumeTypeSyntax(
    tokens: Token[],
    startIndex: number,
    stopKinds: TokenKinds[],
): number | null {
    let index = startIndex;
    const depth = { paren: 0, bracket: 0, brace: 0, angle: 0 };

    while (index < tokens.length) {
        const token = tokens[index];

        if (
            depth.paren === 0 &&
            depth.bracket === 0 &&
            depth.brace === 0 &&
            depth.angle === 0 &&
            stopKinds.includes(token.kind)
        ) {
            return index;
        }

        const step = typeSyntaxDepthSteps[token.kind];
        if (step) {
            depth[step.key] = Math.max(0, depth[step.key] + step.delta);
        }

        index += 1;
    }

    return null;
}

export function consumeOptionalTypeAnnotation(
    tokens: Token[],
    startIndex: number,
    stopKinds: TokenKinds[],
): number | null {
    if (!tokenIs(tokens[startIndex], "ColonToken")) {
        return startIndex;
    }

    return consumeTypeSyntax(tokens, startIndex + 1, stopKinds);
}

export function parseParameterList(
    tokens: Token[],
    startIndex: number,
): ParameterListParseResult | null {
    const parameters: string[] = [];
    let index = startIndex;

    if (!tokenIs(tokens[index], "RightParenToken")) {
        while (index < tokens.length) {
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

    return { parameters, afterRightParenIndex: index + 1 };
}

export function parseTypedParametersUntil(
    tokens: Token[],
    parameterStartIndex: number,
    stopTokenKind: "ArrowToken" | "LeftBraceToken",
): TypedParametersParseResult | null {
    const parsedParameters = parseParameterList(tokens, parameterStartIndex);
    if (parsedParameters === null) {
        return null;
    }

    const afterReturnType = consumeOptionalTypeAnnotation(
        tokens,
        parsedParameters.afterRightParenIndex,
        [stopTokenKind],
    );
    if (
        afterReturnType === null ||
        !tokenIs(tokens[afterReturnType], stopTokenKind)
    ) {
        return null;
    }

    return {
        parameters: parsedParameters.parameters,
        stopTokenIndex: afterReturnType,
    };
}

export function parseArrowParameters(
    tokens: Token[],
    startIndex: number,
): ArrowParametersParseResult | null {
    const firstToken = tokens[startIndex];

    if (tokenIs(firstToken, "IdentifierToken")) {
        const afterType = consumeOptionalTypeAnnotation(
            tokens,
            startIndex + 1,
            ["ArrowToken"],
        );
        if (afterType === null || !tokenIs(tokens[afterType], "ArrowToken")) {
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

    const typedParameters = parseTypedParametersUntil(
        tokens,
        startIndex + 1,
        "ArrowToken",
    );
    if (typedParameters === null) {
        return null;
    }

    return {
        parameters: typedParameters.parameters,
        arrowIndex: typedParameters.stopTokenIndex,
    };
}
