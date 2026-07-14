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
        value: [
            {
                kind: "Regular",
                selector: { kind: "Tag", tag: "h1" },
                body: [
                    { kind: "Property", name: "border-color", value: "red" },
                    { kind: "Property", name: "padding", value: "1rem" },
                    { kind: "Property", name: "height", value: "20vh" },
                ],
            },
        ],
        errors: ["Filtering out width properties"],
    };

    const actualBlocks: FinalFilterResult<CssBlock[]> = css.filterDeclariations(
        [
            {
                shouldKeep: (leaf) => {
                    if (leaf.kind === "Property" && leaf.name === "width") {
                        return false;
                    }
                    return true;
                },
                reason: "Filtering out width properties",
            },
        ],
        [input],
    );

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

    const actualBlocks: FinalFilterResult<CssBlock[]> = css.filterDeclariations(
        [
            {
                shouldKeep: (leaf) => {
                    if (leaf.kind === "Property") {
                        if (leaf.name !== "width") {
                            return false;
                        }
                    }
                    return true;
                },
                reason: "Filtering out non-width properties",
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
                            { kind: "Property", name: "width", value: "20px" },
                        ],
                    },
                ],
            },
        ],
        errors: [
            "Filtering out non-width properties",
            "Filtering out non-width properties",
            "Filtering out non-width properties",
        ],
    };

    deepStrictEqual(actualBlocks, output);
}
