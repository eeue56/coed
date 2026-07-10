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

function isAssign(char: string): boolean {
    return char === "=";
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

export function tokenize(string: string): Token[] {
    const tokens: Token[] = [];
    let tokenizerModel: TokenizerModel = {
        state: "ReadyForNextToken",
        currentTokenStartIndex: 0,
        buffer: "",
    };

    for (let i = 0; i < string.length; i++) {
        const char = string[i];

        if (tokenizerModel.state === "ReadingString") {
            const openingQuote = tokenizerModel.buffer[0];

            if (char === openingQuote) {
                tokenizerModel.buffer += char;
                switchTokenizerState(
                    "ReadyForNextToken",
                    tokenizerModel,
                    tokens,
                    i,
                );
                continue;
            } else {
                tokenizerModel.buffer += char;
            }
        } else if (tokenizerModel.state === "ReadingNumber") {
            if (!isNumberPart(char, tokenizerModel.buffer)) {
                switchTokenizerState(
                    "ReadyForNextToken",
                    tokenizerModel,
                    tokens,
                    i,
                );
            } else {
                tokenizerModel.buffer += char;
            }
        } else if (tokenizerModel.state === "ReadingIdentifier") {
            if (!isIdentifierPart(char)) {
                switchTokenizerState(
                    "ReadyForNextToken",
                    tokenizerModel,
                    tokens,
                    i,
                );
            } else {
                tokenizerModel.buffer += char;
            }
        } else if (tokenizerModel.state === "ReadingWhitespace") {
            if (!isWhitespace(char)) {
                switchTokenizerState(
                    "ReadyForNextToken",
                    tokenizerModel,
                    tokens,
                    i,
                );
            } else {
                tokenizerModel.buffer += char;
            }
        }

        if (tokenizerModel.state === "ReadyForNextToken") {
            if (isStringQuote(char)) {
                switchStateAndBufferChar(
                    "ReadingString",
                    tokenizerModel,
                    tokens,
                    i,
                    char,
                );
            } else if (isDigit(char)) {
                switchStateAndBufferChar(
                    "ReadingNumber",
                    tokenizerModel,
                    tokens,
                    i,
                    char,
                );
            } else if (isLeftParen(char)) {
                switchStateAtIndex("ReadLeftParen", tokenizerModel, tokens, i);
            } else if (isRightParen(char)) {
                switchStateAtIndex("ReadRightParen", tokenizerModel, tokens, i);
            } else if (isLeftBracket(char)) {
                switchStateAtIndex(
                    "ReadLeftBracket",
                    tokenizerModel,
                    tokens,
                    i,
                );
            } else if (isRightBracket(char)) {
                switchStateAtIndex(
                    "ReadRightBracket",
                    tokenizerModel,
                    tokens,
                    i,
                );
            } else if (isLeftBrace(char)) {
                switchStateAtIndex("ReadLeftBrace", tokenizerModel, tokens, i);
            } else if (isRightBrace(char)) {
                switchStateAtIndex("ReadRightBrace", tokenizerModel, tokens, i);
            } else if (isComma(char)) {
                switchStateAtIndex("ReadComma", tokenizerModel, tokens, i);
            } else if (isColon(char)) {
                switchStateAtIndex("ReadColon", tokenizerModel, tokens, i);
            } else if (isSemicolon(char)) {
                switchStateAtIndex("ReadSemicolon", tokenizerModel, tokens, i);
            } else if (isDot(char)) {
                switchStateAtIndex("ReadDot", tokenizerModel, tokens, i);
            } else if (isArrow(char, string[i + 1])) {
                switchStateAtIndex("ReadArrow", tokenizerModel, tokens, i);
                i += 1;
            } else if (isTripleEquals(char, string[i + 1], string[i + 2])) {
                switchStateAtIndex("ReadEquality", tokenizerModel, tokens, i);
                i += 2;
            } else if (isInequality(char, string[i + 1], string[i + 2])) {
                switchStateAtIndex("ReadInequality", tokenizerModel, tokens, i);
                i += 2;
            } else if (isLessThanOrEqualTo(char, string[i + 1])) {
                switchStateAtIndex(
                    "ReadLessThanOrEqual",
                    tokenizerModel,
                    tokens,
                    i,
                );
                i += 1;
            } else if (isGreaterThanOrEqualTo(char, string[i + 1])) {
                switchStateAtIndex(
                    "ReadMoreThanOrEqual",
                    tokenizerModel,
                    tokens,
                    i,
                );
                i += 1;
            } else if (isAnd(char, string[i + 1])) {
                switchStateAtIndex("ReadAnd", tokenizerModel, tokens, i);
                i += 1;
            } else if (isOr(char, string[i + 1])) {
                switchStateAtIndex("ReadOr", tokenizerModel, tokens, i);
                i += 1;
            } else if (isIncrement(char, string[i + 1])) {
                switchStateAtIndex("ReadIncrement", tokenizerModel, tokens, i);
                i += 1;
            } else if (isDecrement(char, string[i + 1])) {
                switchStateAtIndex("ReadDecrement", tokenizerModel, tokens, i);
                i += 1;
            } else if (isPlus(char)) {
                switchStateAtIndex("ReadAddition", tokenizerModel, tokens, i);
            } else if (isMinus(char)) {
                switchStateAtIndex(
                    "ReadSubtraction",
                    tokenizerModel,
                    tokens,
                    i,
                );
            } else if (isAsterisk(char)) {
                switchStateAtIndex(
                    "ReadMultiplication",
                    tokenizerModel,
                    tokens,
                    i,
                );
            } else if (isForwardSlash(char)) {
                switchStateAtIndex("ReadDivision", tokenizerModel, tokens, i);
            } else if (isLessThan(char)) {
                switchStateAtIndex("ReadLessThan", tokenizerModel, tokens, i);
            } else if (isGreaterThan(char)) {
                switchStateAtIndex("ReadMoreThan", tokenizerModel, tokens, i);
            } else if (isExclamationMark(char)) {
                switchStateAtIndex("ReadNegation", tokenizerModel, tokens, i);
            } else if (isEqualsSign(char)) {
                switchStateAtIndex("ReadAssign", tokenizerModel, tokens, i);
            } else if (isWhitespace(char)) {
                switchStateAndBufferChar(
                    "ReadingWhitespace",
                    tokenizerModel,
                    tokens,
                    i,
                    char,
                );
            } else if (isIdentifierStart(char)) {
                switchStateAndBufferChar(
                    "ReadingIdentifier",
                    tokenizerModel,
                    tokens,
                    i,
                    char,
                );
            } else {
                tokenizerModel.buffer += char;
            }
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
