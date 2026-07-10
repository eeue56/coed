import { deepStrictEqual } from "assert";
import { css } from "../../../langs/css/index.ts";
import type { CssBlock } from "../../../langs/css/types.ts";
import type { Result } from "../../../langs/javascript/types.ts";

export function testTagParsing() {
    const input = `
h1 {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
                kind: "Regular",
                selector: { kind: "Tag", tag: "h1" },
                body: [
                    { kind: "Property", name: "border-color", value: "red" },
                    { kind: "Property", name: "width", value: "20px" },
                    { kind: "Property", name: "padding", value: "1rem" },
                    { kind: "Property", name: "height", value: "20vh" },
                ],
            },
        ],
    };

    const actualBlocks: Result<CssBlock[]> = css.parse(input);

    deepStrictEqual(actualBlocks, output);

    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testClassParsing() {
    const input = `
.hello {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
                kind: "Regular",
                selector: { kind: "Class", class: "hello" },
                body: [
                    { kind: "Property", name: "border-color", value: "red" },
                    { kind: "Property", name: "width", value: "20px" },
                    { kind: "Property", name: "padding", value: "1rem" },
                    { kind: "Property", name: "height", value: "20vh" },
                ],
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testIdParsing() {
    const input = `
#hello {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
                kind: "Regular",
                selector: { kind: "Id", id: "hello" },
                body: [
                    { kind: "Property", name: "border-color", value: "red" },
                    { kind: "Property", name: "width", value: "20px" },
                    { kind: "Property", name: "padding", value: "1rem" },
                    { kind: "Property", name: "height", value: "20vh" },
                ],
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testAllParsing() {
    const input = `
* {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
                kind: "Regular",
                selector: { kind: "All" },
                body: [
                    { kind: "Property", name: "border-color", value: "red" },
                    { kind: "Property", name: "width", value: "20px" },
                    { kind: "Property", name: "padding", value: "1rem" },
                    { kind: "Property", name: "height", value: "20vh" },
                ],
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testChildParsing() {
    const input = `
h1 > .hello > #world {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
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
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testSiblingParsing() {
    const input = `
h1 .hello #world {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
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
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testPsuedoParsing() {
    const input = `
h1:hover {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
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
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testPsuedoElementParsing() {
    const input = `
h1::before {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
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
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testMultipleParsing() {
    const input = `
.hello, h1:hover, #world > div {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
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
                    { kind: "Property", name: "border-color", value: "red" },
                    { kind: "Property", name: "width", value: "20px" },
                    { kind: "Property", name: "padding", value: "1rem" },
                    { kind: "Property", name: "height", value: "20vh" },
                ],
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testMediaParsing() {
    const input = `

@media (min-width: 1100px) {
    .hello, h1:hover, #world > div {
        border-color: red;
        width: 20px;
        padding: 1rem;
        height: 20vh;
    }
}
    `.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
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
                            {
                                kind: "Property",
                                name: "padding",
                                value: "1rem",
                            },
                            { kind: "Property", name: "height", value: "20vh" },
                        ],
                    },
                ],
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}

export function testEntireFileParsing() {
    const input = `
h1 {
    border-color: red;
    width: 20px;
    padding: 1rem;
    height: 20vh;
}
.title {
    border-color: red;
    width: 20px;
    padding: 2rem;
}
#hello {
    border-color: blue;
}
@media (min-width: 1100px) {
    .hello, h1:hover, #world > div {
        border-color: red;
        width: 20px;
        padding: 1rem;
        height: 20vh;
    }
}
`.trim();

    const output: Result<CssBlock[]> = {
        kind: "Ok",
        value: [
            {
                kind: "Regular",
                selector: { kind: "Tag", tag: "h1" },
                body: [
                    { kind: "Property", name: "border-color", value: "red" },
                    { kind: "Property", name: "width", value: "20px" },
                    { kind: "Property", name: "padding", value: "1rem" },
                    { kind: "Property", name: "height", value: "20vh" },
                ],
            },
            {
                kind: "Regular",
                selector: { kind: "Class", class: "title" },
                body: [
                    { kind: "Property", name: "border-color", value: "red" },
                    { kind: "Property", name: "width", value: "20px" },
                    { kind: "Property", name: "padding", value: "2rem" },
                ],
            },
            {
                kind: "Regular",
                selector: { kind: "Id", id: "hello" },
                body: [
                    { kind: "Property", name: "border-color", value: "blue" },
                ],
            },
            {
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
                            {
                                kind: "Property",
                                name: "padding",
                                value: "1rem",
                            },
                            { kind: "Property", name: "height", value: "20vh" },
                        ],
                    },
                ],
            },
        ],
    };

    const actualBlocks = css.parse(input);

    deepStrictEqual(actualBlocks, output);
    if (output.kind === "Ok") {
        deepStrictEqual(css.generate(actualBlocks.value), input);
    }
}
