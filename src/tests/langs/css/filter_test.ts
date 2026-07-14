import { deepStrictEqual } from "assert";
import { css } from "../../../langs/css/index.ts";
import type { CssBlock } from "../../../langs/css/types.ts";
import type { FinalFilterResult } from "../../../langs/types.ts";

export function testTagFiltering() {
    const input: CssBlock = {
        kind: "Regular",
        selector: { kind: "Tag", tag: "h1" },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "width", value: "20px" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out h1 tags"],
    };

    const actualBlocks: FinalFilterResult<CssBlock[]> = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (
                        leaf.kind === "Regular" &&
                        leaf.selector.kind === "Tag" &&
                        leaf.selector.tag === "h1"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out h1 tags",
            },
        ],
        [input],
    );

    deepStrictEqual(actualBlocks, output);
}

export function testClassFiltering() {
    const input: CssBlock = {
        kind: "Regular",
        selector: { kind: "Class", class: "hello" },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "width", value: "20px" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out hello class"],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (
                        leaf.kind === "Regular" &&
                        leaf.selector.kind === "Class" &&
                        leaf.selector.class === "hello"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out hello class",
            },
        ],
        [input],
    );

    deepStrictEqual(actualBlocks, output);
}

export function testIdFiltering() {
    const input: CssBlock = {
        kind: "Regular",
        selector: { kind: "Id", id: "hello" },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "width", value: "20px" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out hello id"],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (
                        leaf.kind === "Regular" &&
                        leaf.selector.kind === "Id" &&
                        leaf.selector.id === "hello"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out hello id",
            },
        ],
        [input],
    );

    deepStrictEqual(actualBlocks, output);
}

export function testAllFiltering() {
    const input: CssBlock = {
        kind: "Regular",
        selector: { kind: "All" },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "width", value: "20px" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out all selectors"],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (
                        leaf.kind === "Regular" &&
                        leaf.selector.kind === "All"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out all selectors",
            },
        ],
        [input],
    );

    deepStrictEqual(actualBlocks, output);
}

export function testChildFilteringEntireTree() {
    const input: CssBlock = {
        kind: "Regular",
        selector: {
            kind: "Child",
            parent: { kind: "Tag", tag: "h1" },
            child: {
                kind: "Child",
                parent: { kind: "Class", class: "hello" },
                child: { kind: "Id", id: "world" },
            },
        },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "width", value: "20px" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out all regular blocks"],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (leaf.kind === "Regular") {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out all regular blocks",
            },
        ],
        [input],
    );

    deepStrictEqual(actualBlocks, output);
}

export function testSiblingFiltering() {
    const input: CssBlock = {
        kind: "Regular",
        selector: {
            kind: "Sibling",
            siblings: [
                { kind: "Tag", tag: "h1" },
                { kind: "Class", class: "hello" },
                { kind: "Id", id: "world" },
            ],
        },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "width", value: "20px" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out all regular blocks"],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (leaf.kind === "Regular") {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out all regular blocks",
            },
        ],
        [input],
    );

    deepStrictEqual(actualBlocks, output);
}

export function testPsuedoFiltering() {
    const input: CssBlock = {
        kind: "Regular",
        selector: {
            kind: "Psuedo",
            psuedo: "hover",
            selector: { kind: "Tag", tag: "h1" },
        },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "width", value: "20px" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out hover psuedo selectors"],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (
                        leaf.kind === "Regular" &&
                        leaf.selector.kind === "Psuedo" &&
                        leaf.selector.psuedo === "hover" &&
                        leaf.selector.selector.kind === "Tag" &&
                        leaf.selector.selector.tag === "h1"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out hover psuedo selectors",
            },
        ],
        [input],
    );

    deepStrictEqual(actualBlocks, output);
}

export function testPsuedoElementFiltering() {
    const input: CssBlock = {
        kind: "Regular",
        selector: {
            kind: "PsuedoElement",
            element: "before",
            selector: { kind: "Tag", tag: "h1" },
        },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "width", value: "20px" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (
                        leaf.kind === "Regular" &&
                        leaf.selector.kind === "PsuedoElement" &&
                        leaf.selector.element === "before" &&
                        leaf.selector.selector.kind === "Tag" &&
                        leaf.selector.selector.tag === "h1"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out before psuedo elements",
            },
        ],
        [input],
    );

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out before psuedo elements"],
    };

    deepStrictEqual(actualBlocks, output);
}

export function testMultipleFiltering() {
    const input: CssBlock = {
        kind: "Regular",
        selector: {
            kind: "Multiple",
            selectors: [
                { kind: "Class", class: "hello" },
                {
                    kind: "Psuedo",
                    psuedo: "hover",
                    selector: { kind: "Tag", tag: "h1" },
                },
                {
                    kind: "Child",
                    parent: { kind: "Id", id: "world" },
                    child: { kind: "Tag", tag: "div" },
                },
            ],
        },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "width", value: "20px" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (
                        leaf.kind === "Regular" &&
                        leaf.selector.kind === "Multiple"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out multiple selectors",
            },
        ],
        [input],
    );

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out multiple selectors"],
    };

    deepStrictEqual(actualBlocks, output);
}

export function testMediaFiltering() {
    const input: CssBlock = {
        kind: "MediaQuery",
        selector: {
            kind: "Media",
            query: "(min-width: 1100px)",
        },
        body: [
            {
                kind: "Regular",
                selector: {
                    kind: "Multiple",
                    selectors: [
                        { kind: "Class", class: "hello" },
                        {
                            kind: "Psuedo",
                            psuedo: "hover",
                            selector: { kind: "Tag", tag: "h1" },
                        },
                        {
                            kind: "Child",
                            parent: { kind: "Id", id: "world" },
                            child: { kind: "Tag", tag: "div" },
                        },
                    ],
                },
                body: [
                    {
                        kind: "Property",
                        name: "border-color",
                        value: "red",
                    },
                    { kind: "Property", name: "width", value: "20px" },
                    { kind: "Property", name: "padding", value: "1rem" },
                    { kind: "Property", name: "height", value: "20vh" },
                ],
            },
        ],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (
                        leaf.kind === "Regular" &&
                        leaf.selector.kind === "Multiple"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out multiple selectors",
            },
        ],
        [input],
    );

    const output: FinalFilterResult<CssBlock[]> = {
        value: [
            {
                kind: "MediaQuery",
                selector: {
                    kind: "Media",
                    query: "(min-width: 1100px)",
                },
                body: [],
            },
        ],
        errors: ["Filtering out multiple selectors"],
    };

    deepStrictEqual(actualBlocks, output);
}

export function testRootMediaQueryFiltering() {
    const input: CssBlock = {
        kind: "MediaQuery",
        selector: {
            kind: "Media",
            query: "(min-width: 1100px)",
        },
        body: [
            {
                kind: "Regular",
                selector: {
                    kind: "Multiple",
                    selectors: [
                        { kind: "Class", class: "hello" },
                        {
                            kind: "Psuedo",
                            psuedo: "hover",
                            selector: { kind: "Tag", tag: "h1" },
                        },
                        {
                            kind: "Child",
                            parent: { kind: "Id", id: "world" },
                            child: { kind: "Tag", tag: "div" },
                        },
                    ],
                },
                body: [
                    {
                        kind: "Property",
                        name: "border-color",
                        value: "red",
                    },
                    { kind: "Property", name: "width", value: "20px" },
                    { kind: "Property", name: "padding", value: "1rem" },
                    { kind: "Property", name: "height", value: "20vh" },
                ],
            },
        ],
    };

    const actualBlocks = css.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (leaf.kind === "MediaQuery") {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out media query",
            },
        ],
        [input],
    );

    const output: FinalFilterResult<CssBlock[]> = {
        value: [],
        errors: ["Filtering out media query"],
    };

    deepStrictEqual(actualBlocks, output);
}
