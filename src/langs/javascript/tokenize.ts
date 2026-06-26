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

type TokenizerModel = {
    state: TokenizerState;
    currentTokenStartIndex: number;
    buffer: string;
};

type TokenizerState =
    | "ReadyForNextToken"
    | "ReadingNumber"
    | "ReadingIdentifier"
    | "ReadingString";

function switchTokenizerState(
    newState: TokenizerState,
    tokenizerModel: TokenizerModel,
    tokens: Token[],
): void {
    const start = tokenizerModel.currentTokenStartIndex;
    const endIndex = start + tokenizerModel.buffer.length;
    const currentState = tokenizerModel.state;

    console.log("setting current state to: ", newState);

    if (newState === currentState) {
        return;
    }

    switch (currentState) {
        case "ReadyForNextToken":
            break;
        case "ReadingNumber":
            tokens.push({
                kind: "NumberToken",
                value: parseFloat(tokenizerModel.buffer),
                startIndex: start,
                endIndex: endIndex,
            });
            break;
        case "ReadingIdentifier":
            tokens.push({
                kind: "IdentifierToken",
                name: tokenizerModel.buffer,
                startIndex: start,
                endIndex: endIndex,
            });
            break;
        case "ReadingString":
            tokens.push({
                kind: "StringToken",
                value: tokenizerModel.buffer,
                startIndex: start,
                endIndex: endIndex,
            });
            break;
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
            console.log("char", char, "openingQuote", openingQuote);
            if (char === openingQuote) {
                tokenizerModel.buffer += char;
                switchTokenizerState(
                    "ReadyForNextToken",
                    tokenizerModel,
                    tokens,
                );
            }
        } else if (tokenizerModel.state === "ReadingNumber") {
            if (!isNumberPart(char, tokenizerModel.buffer)) {
                switchTokenizerState(
                    "ReadyForNextToken",
                    tokenizerModel,
                    tokens,
                );
            }
        } else {
            if (isStringQuote(char)) {
                switchTokenizerState("ReadingString", tokenizerModel, tokens);
                tokenizerModel.currentTokenStartIndex = i;
            } else if (isNumberStart(char)) {
                switchTokenizerState("ReadingNumber", tokenizerModel, tokens);
                tokenizerModel.currentTokenStartIndex = i;
            }
        }

        tokenizerModel.buffer += char;
    }

    if (tokenizerModel.state !== "ReadyForNextToken") {
        switchTokenizerState("ReadyForNextToken", tokenizerModel, tokens);
    }

    return tokens;
}
