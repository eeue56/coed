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

type TokenizerModel = {
    state: BufferingTokenizerState;
    currentTokenStartIndex: number;
    buffer: string;
};

type OneOffTokenizerState =
    | "ReadLeftBracket"
    | "ReadRightBracket"
    | "ReadComma";

function isOneOffTokenizerState(
    state: TokenizerState,
): state is OneOffTokenizerState {
    return (
        state === "ReadLeftBracket" ||
        state === "ReadRightBracket" ||
        state === "ReadComma"
    );
}

type BufferingTokenizerState =
    | "ReadyForNextToken"
    | "ReadingNumber"
    | "ReadingIdentifier"
    | "ReadingString";

function isBufferingTokenizerState(
    state: TokenizerState,
): state is BufferingTokenizerState {
    return (
        state === "ReadyForNextToken" ||
        state === "ReadingNumber" ||
        state === "ReadingIdentifier" ||
        state === "ReadingString"
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
            case "ReadComma": {
                tokens.push({
                    kind: "CommaToken",
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
            tokens.push({
                kind: "IdentifierToken",
                name: tokenizerModel.buffer,
                startIndex: start,
                endIndex: endIndex,
            });
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
            } else if (isComma(char)) {
                switchTokenizerState("ReadComma", tokenizerModel, tokens, i);
                tokenizerModel.currentTokenStartIndex = i;
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
