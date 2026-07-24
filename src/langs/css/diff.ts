import type { Diff } from "../types.ts";
import { type CssBlock, type Declaration, type Selector } from "./types.ts";

type SelectorOf<K extends Selector["kind"]> = Extract<Selector, { kind: K }>;

function assumeKindSelector<K extends Selector["kind"]>(
    selector: Selector,
    kind: K,
): asserts selector is SelectorOf<K> {
    if (selector.kind !== kind) {
        throw new Error(`Expected ${kind}, got ${selector.kind}`);
    }
}

type DeclarationOf<K extends Declaration["kind"]> = Extract<
    Declaration,
    { kind: K }
>;

function assumeKindDeclaration<K extends Declaration["kind"]>(
    declaration: Declaration,
    kind: K,
): asserts declaration is DeclarationOf<K> {
    if (declaration.kind !== kind) {
        throw new Error(`Expected ${kind}, got ${declaration.kind}`);
    }
}

function isSameSelector(left: Selector, right: Selector): boolean {
    if (left.kind !== right.kind) {
        return false;
    }

    switch (left.kind) {
        case "Class":
            assumeKindSelector(right, left.kind);
            return left.class === right.class;
        case "Tag":
            assumeKindSelector(right, left.kind);
            return left.tag === right.tag;
        case "Child":
            assumeKindSelector(right, left.kind);
            return (
                isSameSelector(left.parent, right.parent) &&
                isSameSelector(left.child, right.child)
            );

        case "Psuedo":
            assumeKindSelector(right, left.kind);
            if (left.psuedo !== right.psuedo) {
                return false;
            }

            return isSameSelector(left.selector, right.selector);
        case "PsuedoElement": {
            assumeKindSelector(right, left.kind);
            if (left.element !== right.element) {
                return false;
            }

            return isSameSelector(left.selector, right.selector);
        }
        case "Sibling": {
            assumeKindSelector(right, left.kind);
            if (left.siblings.length !== right.siblings.length) {
                return false;
            }

            for (let i = 0; i < left.siblings.length; i++) {
                const leftSibling = left.siblings[i];
                const rightSibling = right.siblings[i];

                if (!isSameSelector(leftSibling, rightSibling)) {
                    return false;
                }
            }

            return true;
        }
        case "Multiple": {
            assumeKindSelector(right, left.kind);
            if (left.selectors.length !== right.selectors.length) {
                return false;
            }

            for (let i = 0; i < left.selectors.length; i++) {
                const leftSelector = left.selectors[i];
                const rightSelector = right.selectors[i];

                if (!isSameSelector(leftSelector, rightSelector)) {
                    return false;
                }
            }

            return true;
        }
        case "Id": {
            assumeKindSelector(right, left.kind);
            return left.id === right.id;
        }
        case "All":
            return true;
        case "Media": {
            assumeKindSelector(right, left.kind);
            return left.query === right.query;
        }
    }
}

function areAllPropertyDeclarations(
    declarations: Declaration[],
): declarations is Extract<Declaration, { kind: "Property" }>[] {
    return declarations.every((declaration) => declaration.kind === "Property");
}

function hasDuplicatePropertyNames(
    declarations: Extract<Declaration, { kind: "Property" }>[],
): boolean {
    const seen = new Set<string>();

    for (const declaration of declarations) {
        if (seen.has(declaration.name)) {
            return true;
        }
        seen.add(declaration.name);
    }

    return false;
}

function propertyMap(
    declarations: Extract<Declaration, { kind: "Property" }>[],
): Map<string, string> {
    const properties = new Map<string, string>();

    for (const declaration of declarations) {
        properties.set(declaration.name, declaration.value);
    }

    return properties;
}

function getPropertyOnlyDiffPath(
    leftBody: Declaration[],
    rightBody: Declaration[],
    path: string,
): string | null {
    if (
        !areAllPropertyDeclarations(leftBody) ||
        !areAllPropertyDeclarations(rightBody) ||
        hasDuplicatePropertyNames(leftBody) ||
        hasDuplicatePropertyNames(rightBody)
    ) {
        return null;
    }

    const leftProperties = propertyMap(leftBody);
    const rightProperties = propertyMap(rightBody);

    for (const declaration of rightBody) {
        const leftValue = leftProperties.get(declaration.name);

        if (typeof leftValue === "undefined") {
            return `${path}->attributes{${declaration.name}}`;
        }

        if (leftValue !== declaration.value) {
            return `${path}->attributes{${declaration.name}}`;
        }
    }

    for (const declaration of leftBody) {
        if (!rightProperties.has(declaration.name)) {
            return `${path}->attributes{${declaration.name}}`;
        }
    }

    return null;
}

function getPropertyName(left: Declaration, right: Declaration): string {
    if (right.kind === "Property") {
        return right.name;
    }

    if (left.kind === "Property") {
        return left.name;
    }

    return "unknown";
}

function getDeclarationDiffPath(
    left: Declaration,
    right: Declaration,
    path: string,
): string | null {
    if (left.kind !== right.kind) {
        return `${path}->attributes{${getPropertyName(left, right)}}`;
    }

    switch (left.kind) {
        case "Property": {
            assumeKindDeclaration(right, left.kind);

            if (left.name === right.name && left.value === right.value) {
                return null;
            }

            return `${path}->attributes{${right.name}}`;
        }
        case "Nested": {
            assumeKindDeclaration(right, left.kind);

            if (!isSameSelector(left.selector, right.selector)) {
                return path;
            }

            const sharedLength = Math.min(
                left.declarations.length,
                right.declarations.length,
            );

            for (let i = 0; i < sharedLength; i++) {
                const childPath = getDeclarationDiffPath(
                    left.declarations[i],
                    right.declarations[i],
                    `${path}->${i}`,
                );

                if (childPath !== null) {
                    return childPath;
                }
            }

            if (left.declarations.length !== right.declarations.length) {
                return `${path}->${sharedLength}`;
            }

            return null;
        }
    }
}

function getBlockDiffPath(
    left: CssBlock,
    right: CssBlock,
    path: string,
): string | null {
    if (
        left.kind !== right.kind ||
        !isSameSelector(left.selector, right.selector)
    ) {
        return path;
    }

    switch (left.kind) {
        case "Regular": {
            const rightRegular = right as typeof left;
            const propertyOnlyDiffPath = getPropertyOnlyDiffPath(
                left.body,
                rightRegular.body,
                path,
            );

            if (propertyOnlyDiffPath !== null) {
                return propertyOnlyDiffPath;
            }

            if (
                areAllPropertyDeclarations(left.body) &&
                areAllPropertyDeclarations(rightRegular.body) &&
                !hasDuplicatePropertyNames(left.body) &&
                !hasDuplicatePropertyNames(rightRegular.body)
            ) {
                return null;
            }

            const sharedLength = Math.min(
                left.body.length,
                rightRegular.body.length,
            );

            for (let i = 0; i < sharedLength; i++) {
                const declarationPath = getDeclarationDiffPath(
                    left.body[i],
                    rightRegular.body[i],
                    path,
                );

                if (declarationPath !== null) {
                    return declarationPath;
                }
            }

            if (left.body.length !== rightRegular.body.length) {
                return `${path}->${sharedLength}`;
            }

            return null;
        }
        case "MediaQuery": {
            const rightMedia = right as typeof left;
            const sharedLength = Math.min(
                left.body.length,
                rightMedia.body.length,
            );

            for (let i = 0; i < sharedLength; i++) {
                const childPath = getBlockDiffPath(
                    left.body[i],
                    rightMedia.body[i],
                    `${path}->${i}`,
                );

                if (childPath !== null) {
                    return childPath;
                }
            }

            if (left.body.length !== rightMedia.body.length) {
                return `${path}->${sharedLength}`;
            }

            return null;
        }
    }
}

/**
 * the `path` is based on the location of the rule
 *
 * e.g given
 *
 * ```
 * .hello {
 *     width: 20px;
 * }
 *
 * .world {
 *     height: 100vw;
 * }
 * ```
 *
 * `0` is the first (`.hello` block)
 * `1->attributes{height}` is the height of the `.world` block
 *
 * `0->1->attributes{height}` is the height of the second block of the root element (e.g in the case of media queries or nested queries)
 */
export function diff(left: CssBlock[], right: CssBlock[]): Diff<CssBlock[]> {
    const diffs: Diff<CssBlock[]>["diffs"] = [];
    const sharedLength = Math.min(left.length, right.length);

    for (let i = 0; i < sharedLength; i++) {
        const leftBlock = left[i];
        const rightBlock = right[i];
        const path = getBlockDiffPath(leftBlock, rightBlock, `${i}`);

        if (path === null) {
            continue;
        }

        diffs.push({
            path,
            added: [rightBlock],
            removed: [leftBlock],
        });
    }

    for (let i = sharedLength; i < right.length; i++) {
        diffs.push({
            path: `${i}`,
            added: [right[i]],
            removed: [],
        });
    }

    for (let i = sharedLength; i < left.length; i++) {
        diffs.push({
            path: `${i}`,
            added: [],
            removed: [left[i]],
        });
    }

    return { diffs };
}
