import type { Result } from "../types.ts";
import type {
    CssBlock,
    Declaration,
    ExtractedTagsAndClasses,
    Selector,
} from "./types.ts";

type SelectorState = "Ready" | "ReadingClass" | "ReadingTag" | "ReadingId";

function selectorStateChange(
    buffer: string[],
    state: SelectorState,
): Selector | null {
    switch (state) {
        case "ReadingClass": {
            return { kind: "Class", class: buffer.join("") };
        }
        case "Ready": {
            return null;
        }
        case "ReadingTag": {
            return { kind: "Tag", tag: buffer.join("") };
        }
        case "ReadingId": {
            return { kind: "Id", id: buffer.join("") };
        }
    }
}

export function parseSelector(str: string): Selector {
    if (str.includes(",")) {
        return {
            kind: "Multiple",
            selectors: str.split(",").map(parseSelector),
        };
    }

    let state: SelectorState = "Ready";
    let buffer: string[] = [];

    const gatheredSelectors: Selector[] = [];

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        switch (char) {
            case "*": {
                return { kind: "All" };
            }
            case ".": {
                state = "ReadingClass";
                break;
            }
            case "#": {
                state = "ReadingId";
                break;
            }
            case ">": {
                const child = parseSelector(str.slice(i + 1, str.length));

                let parent = selectorStateChange(buffer, state);

                if (!parent && gatheredSelectors.length === 1) {
                    parent = gatheredSelectors[0];
                }

                if (!parent) {
                    console.error("Error parsing: '", str, "'");
                    return { kind: "All" };
                }
                return { kind: "Child", parent: parent, child: child };
            }
            case ",": {
                const first = selectorStateChange(buffer, state);
                buffer = [];

                if (first) {
                    gatheredSelectors.push(first);
                }
                state = "Ready";
                break;
            }
            case "@": {
                return {
                    kind: "Media",
                    query: str.split(" ").slice(1).join(" "),
                };
            }
            case " ": {
                const maybeSelector = selectorStateChange(buffer, state);
                buffer = [];
                if (maybeSelector) {
                    gatheredSelectors.push(maybeSelector);
                }
                state = "Ready";
                break;
            }
            case ":": {
                if (str[i + 1] === ":") {
                    const first = selectorStateChange(buffer, state);
                    if (!first) {
                        console.error("Error parsing: '", str, "'");
                        return { kind: "All" };
                    }
                    return {
                        kind: "PsuedoElement",
                        element: str.slice(i + 2),
                        selector: first,
                    };
                }

                const first = selectorStateChange(buffer, state);
                if (!first) {
                    console.error("Error parsing: '", str, "'");
                    return { kind: "All" };
                }
                return {
                    kind: "Psuedo",
                    psuedo: str.slice(i + 1),
                    selector: first,
                };
            }
            default: {
                if (state === "Ready") {
                    state = "ReadingTag";
                    buffer.push(char);
                } else {
                    buffer.push(char);
                }
                break;
            }
        }
    }

    const maybeSelector = selectorStateChange(buffer, state);

    if (maybeSelector) {
        gatheredSelectors.push(maybeSelector);
    }

    if (gatheredSelectors.length === 0) {
        return { kind: "All" };
    } else if (gatheredSelectors.length === 1) {
        return gatheredSelectors[0];
    } else {
        return { kind: "Sibling", siblings: gatheredSelectors };
    }
}

export function parseDeclaration(str: string): Declaration {
    if (str.includes("{")) {
        const selector = parseSelector(str.split("{")[0].trim());
        const declarations = str
            .split("{")[1]
            .split("}")[0]
            .split(";")
            .map((x) => x.trim())
            .filter((x) => x.length > 0)
            .map(parseDeclaration);

        return { kind: "Nested", selector, declarations };
    } else {
        const [name, ...rest] = str.split(":");
        return {
            kind: "Property",
            name: name.trim(),
            value: rest.join(":").trim(),
        };
    }
}

export function parseDeclarations(str: string): Declaration[] {
    return str
        .split(";")
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
        .map(parseDeclaration);
}

type CssParserState = "ReadingSelector" | "ReadingBody";

/** parse css blocks from a string, failing gracefully */
export function parseCssBlocks(css: string): Result<CssBlock[]> {
    let state: CssParserState = "ReadingSelector";
    let buffer: string[] = [];
    let selector: null | string = null;
    let bracketDepth: number = 0;
    const blocks: CssBlock[] = [];

    for (const char of css) {
        switch (char) {
            case "{": {
                if (state === "ReadingSelector") {
                    bracketDepth = 0;
                    selector = buffer.join("").trim();
                    buffer = [];
                    state = "ReadingBody";
                } else {
                    buffer.push(char);
                    bracketDepth++;
                }
                break;
            }
            case "}": {
                if (bracketDepth === 0) {
                    const maybeSelector = parseSelector(selector || "");

                    if (maybeSelector.kind === "Media") {
                        const body = parseCssBlocks(buffer.join("").trim());

                        if (body.kind === "Ok") {
                            blocks.push({
                                kind: "MediaQuery",
                                selector: maybeSelector,
                                body: body.value,
                            });
                        }
                    } else {
                        blocks.push({
                            kind: "Regular",
                            selector: maybeSelector,
                            body: parseDeclarations(buffer.join("").trim()),
                        });
                    }
                    selector = null;
                    buffer = [];
                    state = "ReadingSelector";
                } else {
                    buffer.push(char);
                    bracketDepth--;
                }
                break;
            }
            default: {
                buffer.push(char);
                break;
            }
        }
    }

    return { kind: "Ok", value: blocks };
}

/**
 * get the tags and classes referenced in a seletor tree
 */
export function selectorToTagsAndClasses(
    selector: Selector,
): ExtractedTagsAndClasses {
    switch (selector.kind) {
        case "Class": {
            return { tags: [], classes: [selector.class] };
        }
        case "Tag": {
            return {
                tags: [selector.tag],
                classes: [],
            };
        }
        case "Child": {
            const parent = selectorToTagsAndClasses(selector.parent);
            const child = selectorToTagsAndClasses(selector.child);

            return {
                tags: [...parent.tags, ...child.tags],
                classes: [...parent.classes, ...child.classes],
            };
        }
        case "Id": {
            return { tags: [], classes: [] };
        }
        case "Sibling": {
            const result: ExtractedTagsAndClasses = {
                tags: [],
                classes: [],
            };
            for (const sibling of selector.siblings) {
                const { tags, classes } = selectorToTagsAndClasses(sibling);
                result.tags = [...result.tags, ...tags];
                result.classes = [...result.classes, ...classes];
            }

            return result;
        }
        case "Psuedo": {
            return selectorToTagsAndClasses(selector.selector);
        }
        case "PsuedoElement": {
            return selectorToTagsAndClasses(selector.selector);
        }
        case "Multiple": {
            const result: ExtractedTagsAndClasses = {
                tags: [],
                classes: [],
            };
            for (const sibling of selector.selectors) {
                const { tags, classes } = selectorToTagsAndClasses(sibling);
                result.tags = [...result.tags, ...tags];
                result.classes = [...result.classes, ...classes];
            }

            return result;
        }
        case "All": {
            return { tags: [], classes: [] };
        }
        case "Media": {
            return { tags: [], classes: [] };
        }
    }
}

/**
 * extract the tags and classes from a css block
 */
function cssBlockToTagsAndClasses(block: CssBlock): ExtractedTagsAndClasses {
    switch (block.kind) {
        case "Regular": {
            return selectorToTagsAndClasses(block.selector);
        }
        case "MediaQuery": {
            const result: ExtractedTagsAndClasses = {
                tags: [],
                classes: [],
            };
            for (const child of block.body) {
                const { tags, classes } = cssBlockToTagsAndClasses(child);
                result.tags = [...result.tags, ...tags];
                result.classes = [...result.classes, ...classes];
            }

            return result;
        }
    }
}

export function cssBlocksToTagsAndClasses(
    blocks: CssBlock[],
): ExtractedTagsAndClasses {
    const result: ExtractedTagsAndClasses = {
        tags: [],
        classes: [],
    };
    for (const block of blocks) {
        const { tags, classes } = cssBlockToTagsAndClasses(block);
        result.tags = [...result.tags, ...tags];
        result.classes = [...result.classes, ...classes];
    }

    return result;
}

function selectorToString(selector: Selector): string {
    switch (selector.kind) {
        case "Class": {
            return `.${selector.class}`;
        }
        case "Tag": {
            return selector.tag;
        }
        case "Child": {
            return `${selectorToString(selector.parent)} > ${selectorToString(
                selector.child,
            )}`;
        }
        case "Id": {
            return `#${selector.id}`;
        }
        case "Sibling": {
            return selector.siblings.map(selectorToString).join(" ");
        }
        case "Psuedo": {
            return `${selectorToString(selector.selector)}:${selector.psuedo}`;
        }
        case "PsuedoElement": {
            return `${selectorToString(selector.selector)}::${selector.element}`;
        }
        case "Multiple": {
            return selector.selectors.map(selectorToString).join(", ");
        }
        case "All": {
            return "*";
        }
        case "Media": {
            return `@media ${selector.query}`;
        }
    }
}

function indent(text: string): string {
    return text
        .split("\n")
        .map((x) => "    " + x)
        .join("\n");
}

export function declarationToString(declaration: Declaration): string {
    switch (declaration.kind) {
        case "Property": {
            return `${declaration.name}: ${declaration.value};`;
        }
        case "Nested": {
            const inner = declaration.declarations
                .map(declarationToString)
                .map((x) => indent(x))
                .join("\n");
            return `${selectorToString(declaration.selector)} {
${inner}
}`;
        }
    }
}

export function declarationsToString(declarations: Declaration[]): string {
    return declarations.map(declarationToString).join("\n");
}

export function cssBlockToString(block: CssBlock): string {
    switch (block.kind) {
        case "MediaQuery": {
            const query = selectorToString(block.selector);
            const inner = block.body
                .map((x) => indent(cssBlockToString(x)))
                .join("\n");

            return `${query} {
${inner.trimEnd()}
}`;
        }
        case "Regular": {
            const rules = indent(declarationsToString(block.body));
            return `${selectorToString(block.selector)} {
${rules}
}`;
        }
    }
}

export function generate(blocks: CssBlock[]): string {
    return blocks.map(cssBlockToString).join("\n");
}
