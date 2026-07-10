import type { Token } from "./types.ts";

function isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
}

function isTrue(buffer: string): boolean {
    return buffer === "true";
}

function isFalse(buffer: string): boolean {
    return buffer === "false";
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

function isOneOffTokenizerState(
    state: TokenizerState,
): state is OneOffTokenizerState {
    return (
        state === "ReadAddition" ||
        state === "ReadSubtraction" ||
        state === "ReadMultiplication" ||
        state === "ReadDivision" ||
        state === "ReadIncrement" ||
        state === "ReadDecrement" ||
        state === "ReadLeftParen" ||
        state === "ReadRightParen" ||
        state === "ReadLeftBracket" ||
        state === "ReadRightBracket" ||
        state === "ReadLeftBrace" ||
        state === "ReadRightBrace" ||
        state === "ReadComma" ||
        state === "ReadColon" ||
        state === "ReadSemicolon" ||
        state === "ReadDot" ||
        state === "ReadAssign" ||
        state === "ReadArrow" ||
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

    switch (newState) {
        case "ReadAddition": {
            tokens.push({
                kind: "AdditionToken",
                startIndex: start,
                endIndex: start + 1,
            });
            break;
        }
        case "ReadSubtraction": {
            tokens.push({
                kind: "SubtractionToken",
                startIndex: start,
                endIndex: start + 1,
            });
            break;
        }
        case "ReadMultiplication": {
            tokens.push({
                kind: "MultiplicationToken",
                startIndex: start,
                endIndex: start + 1,
            });
            break;
        }
        case "ReadDivision": {
            tokens.push({
                kind: "DivisionToken",
                startIndex: start,
                endIndex: start + 1,
            });
            break;
        }
        case "ReadIncrement": {
            tokens.push({
                kind: "IncrementToken",
                startIndex: start,
                endIndex: start + 2,
            });
            break;
        }
        case "ReadDecrement": {
            tokens.push({
                kind: "DecrementToken",
                startIndex: start,
                endIndex: start + 2,
            });
            break;
        }
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
        case "ReadColon": {
            tokens.push({
                kind: "ColonToken",
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
        case "ReadDot": {
            tokens.push({
                kind: "DotToken",
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
        case "ReadArrow": {
            tokens.push({
                kind: "ArrowToken",
                startIndex: start,
                endIndex: start + 2,
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

    tokenizerModel.state = "ReadyForNextToken";
    tokenizerModel.buffer = "";
}

function switchIdentifierToken(
    buffer: string,
    start: number,
    endIndex: number,
    tokens: Token[],
): void {
    if (buffer === "let") {
        tokens.push({
            kind: "LetToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "var") {
        tokens.push({
            kind: "VarToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "const") {
        tokens.push({
            kind: "ConstToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "for") {
        tokens.push({
            kind: "ForToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "while") {
        tokens.push({
            kind: "WhileToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "with") {
        tokens.push({
            kind: "WithToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "if") {
        tokens.push({
            kind: "IfToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "else") {
        tokens.push({
            kind: "ElseToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "function") {
        tokens.push({
            kind: "FunctionToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "return") {
        tokens.push({
            kind: "ReturnToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "continue") {
        tokens.push({
            kind: "ContinueToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "break") {
        tokens.push({
            kind: "BreakToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "null") {
        tokens.push({
            kind: "NullToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (isTrue(buffer)) {
        tokens.push({
            kind: "TrueToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (isFalse(buffer)) {
        tokens.push({
            kind: "FalseToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "typeof") {
        tokens.push({
            kind: "TypeofToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "as") {
        tokens.push({
            kind: "AsToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else if (buffer === "undefined") {
        tokens.push({
            kind: "UndefinedToken",
            startIndex: start,
            endIndex: endIndex,
        });
    } else {
        tokens.push({
            kind: "IdentifierToken",
            name: buffer,
            startIndex: start,
            endIndex: endIndex,
        });
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
            } else if (isColon(char)) {
                switchTokenizerState("ReadColon", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isSemicolon(char)) {
                switchTokenizerState(
                    "ReadSemicolon",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isDot(char)) {
                switchTokenizerState("ReadDot", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isArrow(char, string[i + 1])) {
                switchTokenizerState("ReadArrow", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (isTripleEquals(char, string[i + 1], string[i + 2])) {
                switchTokenizerState("ReadEquality", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
                i += 2;
            } else if (isInequality(char, string[i + 1], string[i + 2])) {
                switchTokenizerState(
                    "ReadInequality",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                i += 2;
            } else if (isLessThanOrEqualTo(char, string[i + 1])) {
                switchTokenizerState(
                    "ReadLessThanOrEqual",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (isGreaterThanOrEqualTo(char, string[i + 1])) {
                switchTokenizerState(
                    "ReadMoreThanOrEqual",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (isAnd(char, string[i + 1])) {
                switchTokenizerState("ReadAnd", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (isOr(char, string[i + 1])) {
                switchTokenizerState("ReadOr", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (isIncrement(char, string[i + 1])) {
                switchTokenizerState(
                    "ReadIncrement",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (isDecrement(char, string[i + 1])) {
                switchTokenizerState(
                    "ReadDecrement",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
                i += 1;
            } else if (isPlus(char)) {
                switchTokenizerState("ReadAddition", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isMinus(char)) {
                switchTokenizerState(
                    "ReadSubtraction",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isAsterisk(char)) {
                switchTokenizerState(
                    "ReadMultiplication",
                    tokenizerModel,
                    tokens,
                    i,
                );
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isForwardSlash(char)) {
                switchTokenizerState("ReadDivision", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isLessThan(char)) {
                switchTokenizerState("ReadLessThan", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isGreaterThan(char)) {
                switchTokenizerState("ReadMoreThan", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isExclamationMark(char)) {
                switchTokenizerState("ReadNegation", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isEqualsSign(char)) {
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

    return tokens;
}
