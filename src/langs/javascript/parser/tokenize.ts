import type { Token } from "./types.ts";

function isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
}

function isIdentifierStart(char: string): boolean {
    return (
        (char >= "a" && char <= "z") ||
        (char >= "A" && char <= "Z") ||
        char === "_" ||
        char === "$"
    );
}

function isIdentifierPart(char: string): boolean {
    return isIdentifierStart(char) || isDigit(char);
}

function isStringQuote(char: string): boolean {
    return char === '"' || char === "'" || char === "`";
}

function isNumberPart(char: string, buffer: string): boolean {
    if (isDigit(char)) {
        return true;
    }

    if (char === ".") {
        return !buffer.includes(".");
    }

    return false;
}

function isWhitespace(char: string): boolean {
    return char === " " || char === "\n" || char === "\r" || char === "\t";
}

type TokenizerModel = {
    state: BufferingTokenizerState;
    currentTokenStartIndex: number;
    buffer: string;
};

type OneOffTokenizerState =
    | "ReadAddition"
    | "ReadSubtraction"
    | "ReadMultiplication"
    | "ReadDivision"
    | "ReadIncrement"
    | "ReadDecrement"
    | "ReadLeftParen"
    | "ReadRightParen"
    | "ReadLeftBracket"
    | "ReadRightBracket"
    | "ReadLeftBrace"
    | "ReadRightBrace"
    | "ReadComma"
    | "ReadColon"
    | "ReadSemicolon"
    | "ReadDot"
    | "ReadAssign"
    | "ReadArrow"
    | "ReadEquality"
    | "ReadInequality"
    | "ReadLessThan"
    | "ReadMoreThan"
    | "ReadLessThanOrEqual"
    | "ReadMoreThanOrEqual"
    | "ReadAnd"
    | "ReadOr"
    | "ReadNegation";

type TokenInfo = { kind: Token["kind"]; length: number };

const oneOffTokenInfo: Record<OneOffTokenizerState, TokenInfo> = {
    ReadAddition: { kind: "AdditionToken", length: 1 },
    ReadSubtraction: { kind: "SubtractionToken", length: 1 },
    ReadMultiplication: { kind: "MultiplicationToken", length: 1 },
    ReadDivision: { kind: "DivisionToken", length: 1 },
    ReadIncrement: { kind: "IncrementToken", length: 2 },
    ReadDecrement: { kind: "DecrementToken", length: 2 },
    ReadLeftParen: { kind: "LeftParenToken", length: 1 },
    ReadRightParen: { kind: "RightParenToken", length: 1 },
    ReadLeftBracket: { kind: "LeftBracketToken", length: 1 },
    ReadRightBracket: { kind: "RightBracketToken", length: 1 },
    ReadLeftBrace: { kind: "LeftBraceToken", length: 1 },
    ReadRightBrace: { kind: "RightBraceToken", length: 1 },
    ReadComma: { kind: "CommaToken", length: 1 },
    ReadColon: { kind: "ColonToken", length: 1 },
    ReadSemicolon: { kind: "SemicolonToken", length: 1 },
    ReadDot: { kind: "DotToken", length: 1 },
    ReadAssign: { kind: "AssignToken", length: 1 },
    ReadArrow: { kind: "ArrowToken", length: 2 },
    ReadEquality: { kind: "EqualityToken", length: 3 },
    ReadInequality: { kind: "InequalityToken", length: 3 },
    ReadLessThan: { kind: "LessThanToken", length: 1 },
    ReadMoreThan: { kind: "MoreThanToken", length: 1 },
    ReadLessThanOrEqual: { kind: "LessThanOrEqualToken", length: 2 },
    ReadMoreThanOrEqual: { kind: "MoreThanOrEqualToken", length: 2 },
    ReadAnd: { kind: "AndToken", length: 2 },
    ReadOr: { kind: "OrToken", length: 2 },
    ReadNegation: { kind: "NegationToken", length: 1 },
};

function isOneOffTokenizerState(
    state: TokenizerState,
): state is OneOffTokenizerState {
    return state in oneOffTokenInfo;
}

type OneOffTransition = {
    pattern: string;
    state: OneOffTokenizerState;
};

type OneOffTransitionResult = {
    state: OneOffTokenizerState;
    indexAdvance: number;
};

const multiCharOneOffTransitions: OneOffTransition[] = [
    { pattern: "=>", state: "ReadArrow" },
    { pattern: "===", state: "ReadEquality" },
    { pattern: "!==", state: "ReadInequality" },
    { pattern: "<=", state: "ReadLessThanOrEqual" },
    { pattern: ">=", state: "ReadMoreThanOrEqual" },
    { pattern: "&&", state: "ReadAnd" },
    { pattern: "||", state: "ReadOr" },
    { pattern: "++", state: "ReadIncrement" },
    { pattern: "--", state: "ReadDecrement" },
];

const singleCharOneOffStates: Record<string, OneOffTokenizerState> = {
    "(": "ReadLeftParen",
    ")": "ReadRightParen",
    "[": "ReadLeftBracket",
    "]": "ReadRightBracket",
    "{": "ReadLeftBrace",
    "}": "ReadRightBrace",
    ",": "ReadComma",
    ":": "ReadColon",
    ";": "ReadSemicolon",
    ".": "ReadDot",
    "+": "ReadAddition",
    "-": "ReadSubtraction",
    "*": "ReadMultiplication",
    "/": "ReadDivision",
    "<": "ReadLessThan",
    ">": "ReadMoreThan",
    "!": "ReadNegation",
    "=": "ReadAssign",
};

function getOneOffTransition(
    input: string,
    currentIndex: number,
    char: string,
): OneOffTransitionResult | null {
    for (const transition of multiCharOneOffTransitions) {
        if (input.startsWith(transition.pattern, currentIndex)) {
            return {
                state: transition.state,
                indexAdvance: transition.pattern.length - 1,
            };
        }
    }

    const oneOffState = singleCharOneOffStates[char];

    if (typeof oneOffState === "undefined") {
        return null;
    }

    return {
        state: oneOffState,
        indexAdvance: 0,
    };
}

type BufferingTokenizerState =
    | "ReadyForNextToken"
    | "ReadingNumber"
    | "ReadingIdentifier"
    | "ReadingString"
    | "ReadingWhitespace";

type TokenizerState = BufferingTokenizerState | OneOffTokenizerState;

function pushToken(
    tokens: Token[],
    kind: Token["kind"],
    startIndex: number,
    endIndex: number,
): void {
    tokens.push({
        kind,
        startIndex,
        endIndex,
    } as Token);
}

function switchOneOffTokenState(
    newState: OneOffTokenizerState,
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
): void {
    if (tokenizerModel.state !== "ReadyForNextToken") {
        // clear out the old buffer
        switchTokenizerState(
            "ReadyForNextToken",
            tokenizerModel,
            tokens,
            currentIndex,
        );
    }

    const start = currentIndex;
    const { kind, length } = oneOffTokenInfo[newState];
    pushToken(tokens, kind, start, start + length);

    tokenizerModel.state = "ReadyForNextToken";
    tokenizerModel.buffer = "";
}

const keywordKinds = {
    let: "LetToken",
    var: "VarToken",
    const: "ConstToken",
    for: "ForToken",
    while: "WhileToken",
    with: "WithToken",
    if: "IfToken",
    else: "ElseToken",
    function: "FunctionToken",
    return: "ReturnToken",
    continue: "ContinueToken",
    break: "BreakToken",
    null: "NullToken",
    typeof: "TypeofToken",
    as: "AsToken",
    undefined: "UndefinedToken",
    true: "TrueToken",
    false: "FalseToken",
} as const;

function switchIdentifierToken(
    buffer: string,
    start: number,
    endIndex: number,
    tokens: Token[],
): void {
    const keywordKind = keywordKinds[buffer as keyof typeof keywordKinds];

    if (typeof keywordKind === "undefined") {
        tokens.push({
            kind: "IdentifierToken",
            name: buffer,
            startIndex: start,
            endIndex: endIndex,
        });
        return;
    }

    pushToken(tokens, keywordKind, start, endIndex);
}

function flushCurrentBufferedToken(
    currentState: TokenizerState,
    tokenizerModel: TokenizerModel,
    start: number,
    endIndex: number,
    tokens: Token[],
): void {
    switch (currentState) {
        case "ReadingNumber": {
            tokens.push({
                kind: "NumberToken",
                value: parseFloat(tokenizerModel.buffer),
                startIndex: start,
                endIndex: endIndex,
            });
            return;
        }
        case "ReadingIdentifier": {
            switchIdentifierToken(
                tokenizerModel.buffer,
                start,
                endIndex,
                tokens,
            );
            return;
        }
        case "ReadingString": {
            tokens.push({
                kind: "StringToken",
                value: tokenizerModel.buffer,
                startIndex: start,
                endIndex: endIndex,
            });
            return;
        }
        case "ReadingWhitespace": {
            tokens.push({
                kind: "WhitespaceToken",
                value: tokenizerModel.buffer,
                startIndex: start,
                endIndex: endIndex,
            });
            return;
        }
        default: {
            return;
        }
    }
}

function switchTokenizerState(
    newState: TokenizerState,
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
): void {
    const currentState = tokenizerModel.state;

    if (newState === currentState) {
        return;
    }

    if (isOneOffTokenizerState(newState)) {
        switchOneOffTokenState(newState, tokenizerModel, tokens, currentIndex);
        return;
    }

    const start = tokenizerModel.currentTokenStartIndex;
    const endIndex = start + tokenizerModel.buffer.length;
    flushCurrentBufferedToken(
        currentState,
        tokenizerModel,
        start,
        endIndex,
        tokens,
    );

    tokenizerModel.state = newState;
    tokenizerModel.buffer = "";
}

function switchStateAtIndex(
    newState: TokenizerState,
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
): void {
    switchTokenizerState(newState, tokenizerModel, tokens, currentIndex);
    tokenizerModel.currentTokenStartIndex = currentIndex;
}

function switchStateAndBufferChar(
    newState: BufferingTokenizerState,
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
    char: string,
): void {
    switchStateAtIndex(newState, tokenizerModel, tokens, currentIndex);
    tokenizerModel.buffer += char;
}

function switchToReady(
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
): void {
    switchTokenizerState(
        "ReadyForNextToken",
        tokenizerModel,
        tokens,
        currentIndex,
    );
}

function appendOrSwitchToReady(
    shouldAppend: boolean,
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
    char: string,
): void {
    if (!shouldAppend) {
        switchToReady(tokenizerModel, tokens, currentIndex);
        return;
    }

    tokenizerModel.buffer += char;
}

function shouldAppendBufferedChar(
    state: "ReadingNumber" | "ReadingIdentifier" | "ReadingWhitespace",
    char: string,
    buffer: string,
): boolean {
    if (state === "ReadingNumber") {
        return isNumberPart(char, buffer);
    }

    if (state === "ReadingIdentifier") {
        return isIdentifierPart(char);
    }

    return isWhitespace(char);
}

function processBufferedState(
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
    char: string,
): boolean {
    if (tokenizerModel.state === "ReadyForNextToken") {
        return false;
    }

    if (tokenizerModel.state === "ReadingString") {
        const openingQuote = tokenizerModel.buffer[0];
        tokenizerModel.buffer += char;

        if (char === openingQuote) {
            switchToReady(tokenizerModel, tokens, currentIndex);
            return true;
        }

        return false;
    }

    appendOrSwitchToReady(
        shouldAppendBufferedChar(
            tokenizerModel.state,
            char,
            tokenizerModel.buffer,
        ),
        tokenizerModel,
        tokens,
        currentIndex,
        char,
    );

    return false;
}

/** returns the amount to move the index along */
function processReadyForNextToken(
    input: string,
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
    char: string,
): number {
    if (isStringQuote(char)) {
        switchStateAndBufferChar(
            "ReadingString",
            tokenizerModel,
            tokens,
            currentIndex,
            char,
        );
        return 0;
    }

    if (isDigit(char)) {
        switchStateAndBufferChar(
            "ReadingNumber",
            tokenizerModel,
            tokens,
            currentIndex,
            char,
        );
        return 0;
    }

    const oneOffTransition = getOneOffTransition(input, currentIndex, char);

    if (oneOffTransition !== null) {
        switchStateAtIndex(
            oneOffTransition.state,
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return oneOffTransition.indexAdvance;
    }

    if (isWhitespace(char)) {
        switchStateAndBufferChar(
            "ReadingWhitespace",
            tokenizerModel,
            tokens,
            currentIndex,
            char,
        );
        return 0;
    }

    if (isIdentifierStart(char)) {
        switchStateAndBufferChar(
            "ReadingIdentifier",
            tokenizerModel,
            tokens,
            currentIndex,
            char,
        );
        return 0;
    }

    tokenizerModel.buffer += char;
    return 0;
}

/**
 * turn a string into a list of tokens
 *
 * errors are dropped: tokenize does a best-effort attempt. actual errors are handled by the parser
 */
export function tokenize(string: string): Token[] {
    const tokens: Token[] = [];
    const tokenizerModel: TokenizerModel = {
        state: "ReadyForNextToken",
        currentTokenStartIndex: 0,
        buffer: "",
    };

    for (let i = 0; i < string.length; i++) {
        const char = string[i];

        const shouldContinue = processBufferedState(
            tokenizerModel,
            tokens,
            i,
            char,
        );

        if (shouldContinue) {
            continue;
        }

        if (tokenizerModel.state === "ReadyForNextToken") {
            i += processReadyForNextToken(
                string,
                tokenizerModel,
                tokens,
                i,
                char,
            );
        }
    }

    if (tokenizerModel.state !== "ReadyForNextToken") {
        switchTokenizerState(
            "ReadyForNextToken",
            tokenizerModel,
            tokens,
            string.length - 1,
        );
    }

    return tokens;
}
