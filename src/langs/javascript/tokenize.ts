import type { Token } from "./types.ts";

function isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
}

function isEqualsSign(char: string): boolean {
    return char === "=";
}

function isExclamationMark(char: string): boolean {
    return char === "!";
}

function isAmpersand(char: string): boolean {
    return char === "&";
}

function isPipe(char: string): boolean {
    return char === "|";
}

function isPlus(char: string): boolean {
    return char === "+";
}

function isMinus(char: string): boolean {
    return char === "-";
}

function isAsterisk(char: string): boolean {
    return char === "*";
}

function isForwardSlash(char: string): boolean {
    return char === "/";
}

function isLessThan(char: string): boolean {
    return char === "<";
}

function isGreaterThan(char: string): boolean {
    return char === ">";
}

function isArrow(char: string, nextChar: string): boolean {
    return isEqualsSign(char) && nextChar === ">";
}

function isTripleEquals(
    char: string,
    nextChar: string,
    nextNextChar: string,
): boolean {
    return (
        isEqualsSign(char) &&
        isEqualsSign(nextChar) &&
        isEqualsSign(nextNextChar)
    );
}

function isInequality(
    char: string,
    nextChar: string,
    nextNextChar: string,
): boolean {
    return (
        isExclamationMark(char) &&
        isEqualsSign(nextChar) &&
        isEqualsSign(nextNextChar)
    );
}

function isLessThanOrEqualTo(char: string, nextChar: string): boolean {
    return isLessThan(char) && isEqualsSign(nextChar);
}

function isGreaterThanOrEqualTo(char: string, nextChar: string): boolean {
    return isGreaterThan(char) && isEqualsSign(nextChar);
}

function isAnd(char: string, nextChar: string): boolean {
    return isAmpersand(char) && isAmpersand(nextChar);
}

function isOr(char: string, nextChar: string): boolean {
    return isPipe(char) && isPipe(nextChar);
}

function isIncrement(char: string, nextChar: string): boolean {
    return isPlus(char) && isPlus(nextChar);
}

function isDecrement(char: string, nextChar: string): boolean {
    return isMinus(char) && isMinus(nextChar);
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

function isLeftBracket(char: string): boolean {
    return char === "[";
}

function isRightBracket(char: string): boolean {
    return char === "]";
}

function isComma(char: string): boolean {
    return char === ",";
}

function isColon(char: string): boolean {
    return char === ":";
}

function isSemicolon(char: string): boolean {
    return char === ";";
}

function isDot(char: string): boolean {
    return char === ".";
}

function isLeftParen(char: string): boolean {
    return char === "(";
}

function isRightParen(char: string): boolean {
    return char === ")";
}

function isLeftBrace(char: string): boolean {
    return char === "{";
}

function isRightBrace(char: string): boolean {
    return char === "}";
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

type BufferingTokenizerState =
    | "ReadyForNextToken"
    | "ReadingNumber"
    | "ReadingIdentifier"
    | "ReadingString"
    | "ReadingWhitespace";

function isBufferingTokenizerState(
    state: TokenizerState,
): state is BufferingTokenizerState {
    return (
        state === "ReadyForNextToken" ||
        state === "ReadingNumber" ||
        state === "ReadingIdentifier" ||
        state === "ReadingString" ||
        state === "ReadingWhitespace"
    );
}

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
    if (isBufferingTokenizerState(tokenizerModel.state)) {
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

    if (keywordKind === undefined) {
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

    switch (currentState) {
        case "ReadyForNextToken": {
            break;
        }
        case "ReadingNumber": {
            tokens.push({
                kind: "NumberToken",
                value: parseFloat(tokenizerModel.buffer),
                startIndex: start,
                endIndex: endIndex,
            });
            break;
        }
        case "ReadingIdentifier": {
            switchIdentifierToken(
                tokenizerModel.buffer,
                start,
                endIndex,
                tokens,
            );
            break;
        }
        case "ReadingString": {
            tokens.push({
                kind: "StringToken",
                value: tokenizerModel.buffer,
                startIndex: start,
                endIndex: endIndex,
            });
            break;
        }
        case "ReadingWhitespace": {
            tokens.push({
                kind: "WhitespaceToken",
                value: tokenizerModel.buffer,
                startIndex: start,
                endIndex: endIndex,
            });
            break;
        }
    }

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

function processBufferedState(
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
    char: string,
): boolean {
    switch (tokenizerModel.state) {
        case "ReadingString": {
            const openingQuote = tokenizerModel.buffer[0];
            tokenizerModel.buffer += char;

            if (char === openingQuote) {
                switchToReady(tokenizerModel, tokens, currentIndex);
                return true;
            }

            return false;
        }
        case "ReadingNumber": {
            appendOrSwitchToReady(
                isNumberPart(char, tokenizerModel.buffer),
                tokenizerModel,
                tokens,
                currentIndex,
                char,
            );
            return false;
        }
        case "ReadingIdentifier": {
            appendOrSwitchToReady(
                isIdentifierPart(char),
                tokenizerModel,
                tokens,
                currentIndex,
                char,
            );
            return false;
        }
        case "ReadingWhitespace": {
            appendOrSwitchToReady(
                isWhitespace(char),
                tokenizerModel,
                tokens,
                currentIndex,
                char,
            );
            return false;
        }
        case "ReadyForNextToken": {
            return false;
        }
    }
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

    if (isLeftParen(char)) {
        switchStateAtIndex(
            "ReadLeftParen",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isRightParen(char)) {
        switchStateAtIndex(
            "ReadRightParen",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isLeftBracket(char)) {
        switchStateAtIndex(
            "ReadLeftBracket",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isRightBracket(char)) {
        switchStateAtIndex(
            "ReadRightBracket",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isLeftBrace(char)) {
        switchStateAtIndex(
            "ReadLeftBrace",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isRightBrace(char)) {
        switchStateAtIndex(
            "ReadRightBrace",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isComma(char)) {
        switchStateAtIndex("ReadComma", tokenizerModel, tokens, currentIndex);
        return 0;
    }

    if (isColon(char)) {
        switchStateAtIndex("ReadColon", tokenizerModel, tokens, currentIndex);
        return 0;
    }

    if (isSemicolon(char)) {
        switchStateAtIndex(
            "ReadSemicolon",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isDot(char)) {
        switchStateAtIndex("ReadDot", tokenizerModel, tokens, currentIndex);
        return 0;
    }

    if (isArrow(char, input[currentIndex + 1])) {
        switchStateAtIndex("ReadArrow", tokenizerModel, tokens, currentIndex);
        return 1;
    }

    if (
        isTripleEquals(char, input[currentIndex + 1], input[currentIndex + 2])
    ) {
        switchStateAtIndex(
            "ReadEquality",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 2;
    }

    if (isInequality(char, input[currentIndex + 1], input[currentIndex + 2])) {
        switchStateAtIndex(
            "ReadInequality",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 2;
    }

    if (isLessThanOrEqualTo(char, input[currentIndex + 1])) {
        switchStateAtIndex(
            "ReadLessThanOrEqual",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 1;
    }

    if (isGreaterThanOrEqualTo(char, input[currentIndex + 1])) {
        switchStateAtIndex(
            "ReadMoreThanOrEqual",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 1;
    }

    if (isAnd(char, input[currentIndex + 1])) {
        switchStateAtIndex("ReadAnd", tokenizerModel, tokens, currentIndex);
        return 1;
    }

    if (isOr(char, input[currentIndex + 1])) {
        switchStateAtIndex("ReadOr", tokenizerModel, tokens, currentIndex);
        return 1;
    }

    if (isIncrement(char, input[currentIndex + 1])) {
        switchStateAtIndex(
            "ReadIncrement",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 1;
    }

    if (isDecrement(char, input[currentIndex + 1])) {
        switchStateAtIndex(
            "ReadDecrement",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 1;
    }

    if (isPlus(char)) {
        switchStateAtIndex(
            "ReadAddition",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isMinus(char)) {
        switchStateAtIndex(
            "ReadSubtraction",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isAsterisk(char)) {
        switchStateAtIndex(
            "ReadMultiplication",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isForwardSlash(char)) {
        switchStateAtIndex(
            "ReadDivision",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isLessThan(char)) {
        switchStateAtIndex(
            "ReadLessThan",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isGreaterThan(char)) {
        switchStateAtIndex(
            "ReadMoreThan",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isExclamationMark(char)) {
        switchStateAtIndex(
            "ReadNegation",
            tokenizerModel,
            tokens,
            currentIndex,
        );
        return 0;
    }

    if (isEqualsSign(char)) {
        switchStateAtIndex("ReadAssign", tokenizerModel, tokens, currentIndex);
        return 0;
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

export function tokenize(string: string): Token[] {
    const tokens: Token[] = [];
    let tokenizerModel: TokenizerModel = {
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
