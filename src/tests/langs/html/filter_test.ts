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
        errors: ["Remove nodes with class 'remove'"],
    };

    assert.deepStrictEqual(filtered, expected);
}

export function testFilterNodesWithMultipleFilters() {
    const tree = coed.node(
        "div",
        [],
        [],
        [
            coed.node("div", [], [coed.class_("keep")], [coed.text("hello")]),
            coed.node("div", [], [coed.class_("remove")], [coed.text("world")]),
            coed.node(
                "div",
                [],
                [coed.class_("keep")],
                [coed.text("remove me too")],
            ),
        ],
    );

    const filtered = html.filter(
        [
            {
                shouldKeep: (leaf) => {
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
            {
                shouldKeep: (leaf) => {
                    if (leaf.kind === "text" && leaf.text === "remove me too")
                        return false;
                    return true;
                },
                reason: "Remove nodes with text 'remove me too'",
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
                coed.node("div", [], [coed.class_("keep")], [coed.text("")]),
            ],
        ),
        errors: [
            "Remove nodes with class 'remove'",
            "Remove nodes with text 'remove me too'",
        ],
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
        errors: ["Remove script tags"],
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

    assert.deepStrictEqual(filtered.errors, [
        "Remove unwanted attributes",
        "Remove unwanted attributes",
    ]);

    assert.deepStrictEqual(
        (filtered.value as Extract<HtmlNode<void>, { attributes: Attribute[] }>)
            .attributes.length,
        2,
    );
}

export function testFilterAttributesWithMultipleFilters() {
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
                    if (
                        attr.kind === "string" &&
                        attr.key === "class" &&
                        attr.value === "remove"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Remove unwanted class attributes",
            },
            {
                shouldKeep: (attr: Attribute) => {
                    if (attr.kind === "string" && attr.key === "data-remove") {
                        return false;
                    }
                    return true;
                },
                reason: "Remove unwanted data attributes",
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

    assert.deepStrictEqual(filtered.errors, [
        "Remove unwanted class attributes",
        "Remove unwanted data attributes",
    ]);

    assert.deepStrictEqual(
        (filtered.value as Extract<HtmlNode<void>, { attributes: Attribute[] }>)
            .attributes.length,
        2,
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

    assert.deepStrictEqual(
        (filtered.value as Extract<HtmlNode<void>, { attributes: Attribute[] }>)
            .attributes.length,
        1,
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

    assert.deepStrictEqual(
        (filtered.value as Extract<HtmlNode<void>, { events: Event<void>[] }>)
            .events.length,
        1,
    );

    assert.deepStrictEqual(filtered.errors, ["Remove unwanted events"]);
}

export function testFilterEventsWithMultipleFilters() {
    const tree = coed.node(
        "div",
        [
            coed.on("click", () => "keep"),
            coed.on("mousemove", () => "remove"),
            coed.on("mousedown", () => "also remove"),
        ],
        [],
        [coed.text("hello")],
    );

    const filtered = html.filterEvents(
        [
            {
                shouldKeep: (event: Event<void>) => {
                    if (event.name === "mousemove") return false;
                    return true;
                },
                reason: "Remove mousemove events",
            },
            {
                shouldKeep: (event: Event<void>) => {
                    if (event.name === "mousedown") return false;
                    return true;
                },
                reason: "Remove mousedown events",
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

    assert.deepStrictEqual(
        (filtered.value as Extract<HtmlNode<void>, { events: Event<void>[] }>)
            .events.length,
        1,
    );

    assert.deepStrictEqual(filtered.errors, [
        "Remove mousemove events",
        "Remove mousedown events",
    ]);
}

export function testFilterEventsWithMultipleListeners() {
    const tree = coed.node(
        "div",
        [
            coed.on("click", () => "keep"),
            coed.on("click", () => "also keep"),
            coed.on("mousemove", () => "remove"),
        ],
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

    assert.deepStrictEqual(
        (filtered.value as Extract<HtmlNode<void>, { events: Event<void>[] }>)
            .events.length,
        2,
    );

    assert.deepStrictEqual(filtered.errors, ["Remove unwanted events"]);
}
