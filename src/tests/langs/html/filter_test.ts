import { strict as assert } from "assert";
import * as coed from "../../../coed.ts";
import {
    booleanAttribute,
    text,
    type Attribute,
    type Event,
    type HtmlNode,
} from "../../../coed.ts";
import { html } from "../../../langs/html/index.ts";
import type { FinalFilterResult } from "../../../langs/types.ts";
import { Just, Nothing } from "../../../types.ts";

export function testFilterNodes() {
    const tree = coed.node(
        "div",
        [],
        [],
        [
            coed.node("div", [], [coed.class_("keep")], [coed.text("hello")]),
            coed.node("div", [], [coed.class_("remove")], [coed.text("world")]),
        ],
    );

    const filtered = html.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (leaf.kind === "text") return true;
                    if (
                        leaf.kind === "regular" &&
                        leaf.attributes.some(
                            (attr) =>
                                attr.kind === "string" &&
                                attr.key === "class" &&
                                attr.value === "remove",
                        )
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Remove nodes with class 'remove'",
            },
        ],
        tree,
    );

    const expected: FinalFilterResult<HtmlNode<unknown>> = {
        value: coed.node(
            "div",
            [],
            [],
            [
                coed.node(
                    "div",
                    [],
                    [coed.class_("keep")],
                    [coed.text("hello")],
                ),
                text(""),
            ],
        ),
        errors: [],
    };

    assert.deepStrictEqual(filtered, expected);
}

export function testFilterNodesRemoveScriptTag() {
    const tree = coed.node(
        "div",
        [],
        [],
        [
            coed.node("script", [], [], [coed.text("alert('hello world');")]),
            coed.node("div", [], [coed.class_("keep")], [coed.text("hello")]),
        ],
    );

    const filtered = html.filter(
        [
            {
                shouldKeep: (leaf) => {
                    if (leaf.kind === "text") return true;
                    if (leaf.kind === "regular" && leaf.tag === "script")
                        return false;
                    return true;
                },
                reason: "Remove script tags",
            },
        ],
        tree,
    );

    const expected: FinalFilterResult<HtmlNode<unknown>> = {
        value: coed.node(
            "div",
            [],
            [],
            [
                text(""),
                coed.node(
                    "div",
                    [],
                    [coed.class_("keep")],
                    [coed.text("hello")],
                ),
            ],
        ),
        errors: [],
    };

    assert.deepStrictEqual(filtered, expected);
}

export function testFilterAttributes() {
    const tree = coed.node(
        "div",
        [],
        [
            coed.class_("keep"),
            coed.class_("remove"),
            coed.attribute("data-keep", "keep"),
            coed.attribute("data-remove", "remove"),
        ],
        [coed.text("hello")],
    );

    const filtered = html.filterAttributes(
        [
            {
                shouldKeep: (attr: Attribute) => {
                    if (attr.kind === "string" && attr.key === "class") {
                        return attr.value === "keep";
                    }
                    if (attr.kind === "string" && attr.key === "data-keep") {
                        return true;
                    }
                    return false;
                },
                reason: "Remove unwanted attributes",
            },
        ],
        tree,
    );

    assert.deepStrictEqual(
        coed.render(filtered.value),
        `
<div class="keep" data-keep="keep">
    hello
</div>`.trim(),
    );
}

export function testFilterBooleanAttributes() {
    const tree = coed.node(
        "input",
        [],
        [
            booleanAttribute("checked", true),
            booleanAttribute("disabled", false),
        ],
        [],
    );

    const filtered = html.filterAttributes(
        [
            {
                shouldKeep: (attr: Attribute) => {
                    if (attr.kind === "boolean" && attr.key === "checked") {
                        return true;
                    }
                    return false;
                },
                reason: "Remove unwanted boolean attributes",
            },
        ],
        tree,
    );

    assert.deepStrictEqual(
        coed.render(filtered.value),
        `<input checked="checked"></input>`.trim(),
    );
}

export function testFilterEvents() {
    const tree = coed.node(
        "div",
        [coed.on("click", () => "keep"), coed.on("mousemove", () => "remove")],
        [],
        [coed.text("hello")],
    );

    const filtered = html.filterEvents(
        [
            {
                shouldKeep: (event: Event<void>) => {
                    if (event.name === "click") return true;
                    return false;
                },
                reason: "Remove unwanted events",
            },
        ],
        tree,
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, filtered.value),
        Just("keep"),
    );

    assert.deepStrictEqual(
        coed.triggerEvent("mousemove", {}, filtered.value),
        Nothing(),
    );
}

export function testFilterEventsWithMultipleListeners() {
    const tree = coed.node(
        "div",
        [coed.on("click", () => "keep"), coed.on("click", () => "also keep")],
        [],
        [coed.text("hello")],
    );

    const filtered = html.filterEvents(
        [
            {
                shouldKeep: (event: Event<void>) => {
                    if (event.name === "click") return true;
                    return false;
                },
                reason: "Remove unwanted events",
            },
        ],
        tree,
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, filtered.value),
        Just("keep"),
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, filtered.value),
        Just("keep"),
    );
}
