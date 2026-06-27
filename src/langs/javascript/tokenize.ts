import type { Token } from "./types.ts";

function isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
}

function isTrue(char: string): boolean {
    return char === "true";
}

function isFalse(char: string): boolean {
    return char === "false";
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

/**
 * explicitly only support:
 * ```
 * 123
 * 12.34
 * ```
 *
 * and not support:
 *
 * ```
 * 1e10
 * 1.2e-3
 * .5
 * ```
 */
function isNumberStart(char: string): boolean {
    return isDigit(char);
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

function isSemicolon(char: string): boolean {
    return char === ";";
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
    | "ReadLeftParen"
    | "ReadRightParen"
    | "ReadLeftBracket"
    | "ReadRightBracket"
    | "ReadLeftBrace"
    | "ReadRightBrace"
    | "ReadComma"
    | "ReadSemicolon"
    | "ReadAssign"
    | "ReadEquality"
    | "ReadInequality"
    | "ReadLessThan"
    | "ReadMoreThan"
    | "ReadLessThanOrEqual"
    | "ReadMoreThanOrEqual"
    | "ReadAnd"
    | "ReadOr"
    | "ReadNegation";

function isOneOffTokenizerState(
    state: TokenizerState,
): state is OneOffTokenizerState {
    return (
        state === "ReadLeftParen" ||
        state === "ReadRightParen" ||
        state === "ReadLeftBracket" ||
        state === "ReadRightBracket" ||
        state === "ReadLeftBrace" ||
        state === "ReadRightBrace" ||
        state === "ReadComma" ||
        state === "ReadSemicolon" ||
        state === "ReadAssign" ||
        state === "ReadEquality" ||
        state === "ReadInequality" ||
        state === "ReadLessThan" ||
        state === "ReadMoreThan" ||
        state === "ReadLessThanOrEqual" ||
        state === "ReadMoreThanOrEqual" ||
        state === "ReadAnd" ||
        state === "ReadOr" ||
        state === "ReadNegation"
    );
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

function switchTokenizerState(
    newState: TokenizerState,
    tokenizerModel: TokenizerModel,
    tokens: Token[],
    currentIndex: number,
): void {
    const currentState = tokenizerModel.state;

    console.log("setting current state to: ", newState);

    if (newState === currentState) {
        return;
    }

    if (isOneOffTokenizerState(newState)) {
        if (isBufferingTokenizerState(currentState)) {
            console.log("clearing buffered state");
            // clear out the old buffer
            switchTokenizerState(
                "ReadyForNextToken",
                tokenizerModel,
                tokens,
                currentIndex,
            );
        }

        const start = currentIndex;
        console.log("Handling one-off state: ", newState);
        switch (newState) {
            case "ReadLeftParen": {
                tokens.push({
                    kind: "LeftParenToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadRightParen": {
                tokens.push({
                    kind: "RightParenToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadLeftBracket": {
                console.log("ReadLeftBracket, pushing LeftBracketToken");
                tokens.push({
                    kind: "LeftBracketToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadRightBracket": {
                tokens.push({
                    kind: "RightBracketToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadLeftBrace": {
                tokens.push({
                    kind: "LeftBraceToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadRightBrace": {
                tokens.push({
                    kind: "RightBraceToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadComma": {
                tokens.push({
                    kind: "CommaToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadSemicolon": {
                tokens.push({
                    kind: "SemicolonToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadAssign": {
                tokens.push({
                    kind: "AssignToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadEquality": {
                tokens.push({
                    kind: "EqualityToken",
                    startIndex: start,
                    endIndex: start + 3,
                });
                break;
            }
            case "ReadInequality": {
                tokens.push({
                    kind: "InequalityToken",
                    startIndex: start,
                    endIndex: start + 3,
                });
                break;
            }
            case "ReadLessThan": {
                tokens.push({
                    kind: "LessThanToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadMoreThan": {
                tokens.push({
                    kind: "MoreThanToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
            case "ReadLessThanOrEqual": {
                tokens.push({
                    kind: "LessThanOrEqualToken",
                    startIndex: start,
                    endIndex: start + 2,
                });
                break;
            }
            case "ReadMoreThanOrEqual": {
                tokens.push({
                    kind: "MoreThanOrEqualToken",
                    startIndex: start,
                    endIndex: start + 2,
                });
                break;
            }
            case "ReadAnd": {
                tokens.push({
                    kind: "AndToken",
                    startIndex: start,
                    endIndex: start + 2,
                });
                break;
            }
            case "ReadOr": {
                tokens.push({
                    kind: "OrToken",
                    startIndex: start,
                    endIndex: start + 2,
                });
                break;
            }
            case "ReadNegation": {
                tokens.push({
                    kind: "NegationToken",
                    startIndex: start,
                    endIndex: start + 1,
                });
                break;
            }
        }

        console.log("Done with one-off state, resetting to ReadyForNextToken");

        tokenizerModel.state = "ReadyForNextToken";
        tokenizerModel.buffer = "";
        return;
    }

    console.log("Going to full validation for state: ", currentState);

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
            if (tokenizerModel.buffer === "let") {
                tokens.push({
                    kind: "LetToken",
                    startIndex: start,
                    endIndex: endIndex,
                });
            } else if (tokenizerModel.buffer === "const") {
                tokens.push({
                    kind: "ConstToken",
                    startIndex: start,
                    endIndex: endIndex,
                });
            } else if (tokenizerModel.buffer === "for") {
                tokens.push({
                    kind: "ForToken",
                    startIndex: start,
                    endIndex: endIndex,
                });
            } else if (tokenizerModel.buffer === "if") {
                tokens.push({
                    kind: "IfToken",
                    startIndex: start,
                    endIndex: endIndex,
                });
            } else {
                tokens.push({
                    kind: "IdentifierToken",
                    name: tokenizerModel.buffer,
                    startIndex: start,
                    endIndex: endIndex,
                });
            }
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

export function tokenize(string: string): Token[] {
    const tokens: Token[] = [];
    let tokenizerModel: TokenizerModel = {
        state: "ReadyForNextToken",
        currentTokenStartIndex: 0,
        buffer: "",
    };

    for (let i = 0; i < string.length; i++) {
        const char = string[i];

        console.log(
            `Processing char: '${char}' at index ${i}, current state: ${tokenizerModel.state}, buffer: '${tokenizerModel.buffer}'`,
        );

        if (tokenizerModel.state === "ReadingString") {
            const openingQuote =
                tokenizerModel.buffer[tokenizerModel.currentTokenStartIndex];

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
                switchTokenizerState(
                    "ReadingString",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                tokenizerModel.buffer += char;
            } else if (isNumberStart(char)) {
                switchTokenizerState(
                    "ReadingNumber",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                tokenizerModel.buffer += char;
            } else if (isLeftParen(char)) {
                switchTokenizerState(
                    "ReadLeftParen",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isRightParen(char)) {
                switchTokenizerState(
                    "ReadRightParen",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isLeftBracket(char)) {
                switchTokenizerState(
                    "ReadLeftBracket",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                console.log("Now state: ", tokenizerModel.state);
                console.log("now model", tokenizerModel);
            } else if (isRightBracket(char)) {
                switchTokenizerState(
                    "ReadRightBracket",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isLeftBrace(char)) {
                switchTokenizerState(
                    "ReadLeftBrace",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isRightBrace(char)) {
                switchTokenizerState(
                    "ReadRightBrace",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isComma(char)) {
                switchTokenizerState("ReadComma", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isSemicolon(char)) {
                switchTokenizerState(
                    "ReadSemicolon",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
            } else if (
                char === "=" &&
                string[i + 1] === "=" &&
                string[i + 2] === "="
            ) {
                switchTokenizerState("ReadEquality", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
                i += 2;
            } else if (
                char === "!" &&
                string[i + 1] === "=" &&
                string[i + 2] === "="
            ) {
                switchTokenizerState(
                    "ReadInequality",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                i += 2;
            } else if (char === "<" && string[i + 1] === "=") {
                switchTokenizerState(
                    "ReadLessThanOrEqual",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (char === ">" && string[i + 1] === "=") {
                switchTokenizerState(
                    "ReadMoreThanOrEqual",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (char === "&" && string[i + 1] === "&") {
                switchTokenizerState("ReadAnd", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (char === "|" && string[i + 1] === "|") {
                switchTokenizerState("ReadOr", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (char === "<") {
                switchTokenizerState("ReadLessThan", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (char === ">") {
                switchTokenizerState("ReadMoreThan", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (char === "!") {
                switchTokenizerState("ReadNegation", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isAssign(char)) {
                switchTokenizerState("ReadAssign", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isWhitespace(char)) {
                switchTokenizerState(
                    "ReadingWhitespace",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                tokenizerModel.buffer += char;
            } else if (isIdentifierStart(char)) {
                switchTokenizerState(
                    "ReadingIdentifier",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                tokenizerModel.buffer += char;
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

    console.log("final tokens: ", tokens);

    return tokens;
}
