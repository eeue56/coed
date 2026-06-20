import { deepStrictEqual } from "assert";
import { filterRules } from "../../../langs/css/filter.ts";
import type { CssBlock } from "../../../langs/css/types.ts";

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

    const output: CssBlock = {
        kind: "Regular",
        selector: { kind: "Tag", tag: "h1" },
        body: [
            { kind: "Property", name: "border-color", value: "red" },
            { kind: "Property", name: "padding", value: "1rem" },
            { kind: "Property", name: "height", value: "20vh" },
        ],
    };

    const actualBlocks = filterRules((leaf) => {
        if (leaf.kind === "Property" && leaf.name === "width") {
            return false;
        }
        return true;
    }, input);

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

    const actualBlocks = filterRules((leaf) => {
        if (leaf.kind === "Property") {
            if (leaf.name !== "width") {
                return false;
            }
        }
        return true;
    }, input);

    const output: CssBlock = {
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
                body: [{ kind: "Property", name: "width", value: "20px" }],
            },
        ],
    };

    deepStrictEqual(actualBlocks, output);
}
