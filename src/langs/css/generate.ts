import type { CssBlock, Declaration, Selector } from "./types.ts";

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

function declarationToString(declaration: Declaration): string {
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

function declarationsToString(declarations: Declaration[]): string {
    return declarations.map(declarationToString).join("\n");
}

function cssBlockToString(block: CssBlock): string {
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
    return blocks.map(cssBlockToString).join("\n\n");
}
