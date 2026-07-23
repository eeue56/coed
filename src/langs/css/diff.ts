import type { Diff } from "../types.ts";
import {
    type CssBlock,
    type Declaration,
    isCssBlock,
    type Selector,
} from "./types.ts";

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

function isSameCssBlock(left: CssBlock, right: CssBlock): boolean {
    if (!isSameSelector(left.selector, right.selector)) {
        return false;
    }

    if (left.body.length !== right.body.length) {
        return false;
    }

    for (let i = 0; i < left.body.length; i++) {
        const subLeft = left.body[i];
        const subRight = right.body[i];

        if (subLeft.kind !== subRight.kind) {
            return false;
        }

        if (isCssBlock(subLeft)) {
            if (!isSameCssBlock(subLeft, subRight as CssBlock)) {
                return false;
            }
        } else {
            if (!isSameCssDeclaration(subLeft, subRight as Declaration)) {
                return false;
            }
        }
    }

    return true;
}

function isSameCssDeclaration(left: Declaration, right: Declaration): boolean {
    if (left.kind !== right.kind) {
        return false;
    }

    switch (left.kind) {
        case "Nested": {
            assumeKindDeclaration(right, left.kind);
            if (!isSameSelector(left.selector, right.selector)) {
                return false;
            }
            if (left.declarations.length !== right.declarations.length) {
                return false;
            }
            for (let i = 0; i < left.declarations.length; i++) {
                const subLeft = left.declarations[i];
                const subRight = right.declarations[i];

                if (!isSameCssDeclaration(subLeft, subRight)) {
                    return false;
                }
            }
            return true;
        }
        case "Property": {
            assumeKindDeclaration(right, left.kind);

            return left.name === right.name && left.value == right.value;
        }
    }
}

export function diff(left: CssBlock[], right: CssBlock[]): Diff<CssBlock[]> {
    const added = [];
    const removed = [];

    for (let i = 0; i < left.length; i++) {
        if (right.length <= i) {
            break;
        }

        const leftBlock = left[i];
        const rightBlock = right[i];

        if (!isSameCssBlock(leftBlock, rightBlock)) {
            removed.push(leftBlock);
            added.push(rightBlock);
        }
    }

    for (let i = left.length; i < right.length; i++) {
        added.push(right[i]);
    }

    for (let i = right.length; i < left.length; i++) {
        removed.push(left[i]);
    }

    return {
        diffs: [
            {
                path: "0",
                added,
                removed,
            },
        ],
    };
}
