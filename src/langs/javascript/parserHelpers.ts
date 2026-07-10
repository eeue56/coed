import type {
    Expression,
    NameLookupExpression,
    ParserState,
    Token,
    TokenKinds,
} from "./types.ts";

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
