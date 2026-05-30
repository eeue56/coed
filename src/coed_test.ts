import { Maybe } from "@eeue56/ts-core";
import { strict as assert } from "assert";
import * as coed from "./coed.ts";
import { type Attribute, booleanAttribute, text } from "./coed.ts";

// text nodes

export function testEmptyStringRendering() {
    const emptyText = coed.text("");
    assert.deepStrictEqual(coed.render(emptyText), "");
}

export function testNonEmptyStringRendering() {
    const emptyText = coed.text("hello");
    assert.deepStrictEqual(coed.render(emptyText), "hello");
}

// regular nodes

export function testEmptyDivRendering() {
    const emptyDiv = coed.node("div", [], [], []);
    assert.deepStrictEqual(coed.render(emptyDiv), "<div></div>");
}

export function testEmptyDivWithClassRendering() {
    const emptyDiv = coed.node("div", [], [coed.class_("button")], []);
    assert.deepStrictEqual(coed.render(emptyDiv), '<div class="button"></div>');
}

export function testEmptyDivWithMultipleClassesRendering() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("button"), coed.class_("btn")],
        [],
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        '<div class="button btn"></div>',
    );
}

export function testDivWithVoidElement() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("button"), coed.class_("btn")],
        [
            coed.img(
                [],
                [coed.attribute("src", "https://example.com/image.gif")],
            ),
        ],
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="button btn">
    <img src="https://example.com/image.gif">
</div>`.trim(),
    );
}

export function testDivWithQuotedAttribute() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("button"), coed.class_("'btn'")],
        [
            coed.img(
                [],
                [coed.attribute("src", "https://example.com/image.gif")],
            ),
        ],
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="button 'btn'">
    <img src="https://example.com/image.gif">
</div>`.trim(),
    );
}

export function testDivWithDoublyQuotedAttribute() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("button"), coed.class_('"btn"')],
        [
            coed.img(
                [],
                [coed.attribute("src", "https://example.com/image.gif")],
            ),
        ],
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class='button "btn"'>
    <img src="https://example.com/image.gif">
</div>`.trim(),
    );
}

export function testDivWithTextRendering() {
    const emptyDiv = coed.node("div", [], [], [coed.text("hello")]);
    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div>
    hello
</div>`.trim(),
    );
}

export function testDivWithTextWithClassRendering() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("button")],
        [coed.text("hello")],
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="button">
    hello
</div>`.trim(),
    );
}

// nested nodes

export function testDoublyNestedDivWithTextRendering() {
    const emptyDiv = coed.node(
        "div",
        [],
        [],
        [coed.text("hello"), coed.node("div", [], [], [coed.text("world")])],
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div>
    hello
    <div>
        world
    </div>
</div>`.trim(),
    );
}

export function testDoublyNestedDivWithTextWithClassesRendering() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("outer-button")],
        [
            coed.text("hello"),
            coed.node(
                "div",
                [],
                [coed.class_("inner-button")],
                [coed.text("world")],
            ),
        ],
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="outer-button">
    hello
    <div class="inner-button">
        world
    </div>
</div>`.trim(),
    );
}

export function testDoublyNestedDivWithTextWithMultipleClassesRendering() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("outer-button"), coed.class_("btn")],
        [
            coed.text("hello"),
            coed.node(
                "div",
                [],
                [coed.class_("inner-button"), coed.class_("btn-2")],
                [coed.text("world")],
            ),
        ],
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="outer-button btn">
    hello
    <div class="inner-button btn-2">
        world
    </div>
</div>`.trim(),
    );
}

export function testPositiveBooleanAttribute() {
    const inputElement = coed.node(
        "input",
        [],
        [booleanAttribute("checked", true)],
        [],
    );
    assert.deepStrictEqual(
        coed.render(inputElement),
        `<input checked="checked"></input>`.trim(),
    );
}

export function testNegativeBooleanAttribute() {
    const inputElement = coed.node(
        "input",
        [],
        [booleanAttribute("checked", false)],
        [],
    );
    assert.deepStrictEqual(coed.render(inputElement), `<input></input>`.trim());
}

export function testCaseSensitiveAttribute() {
    const inputElement = coed.node(
        "svg" as coed.Tag,
        [],
        [
            coed.attribute("width", "40"),
            coed.attribute("height", "40"),
            coed.attribute("viewBox", "0 0 40 40"),
            coed.attribute("role", "img"),
        ],
        [
            coed.voidNode(
                "circle" as coed.Tag,
                [],
                [
                    coed.attribute("cx", "20"),
                    coed.attribute("cy", "20"),
                    coed.attribute("r", "14"),
                    coed.attribute("fill", "none"),
                    coed.attribute("stroke", "#8A8F98"),
                    coed.attribute("stroke", "pink"),
                    coed.attribute("stroke-width", "2"),
                ],
            ),
            coed.voidNode(
                "circle" as coed.Tag,
                [],
                [
                    coed.attribute("cx", "20"),
                    coed.attribute("cy", "20"),
                    coed.attribute("r", "6"),
                    coed.attribute("fill", "#B7FFBF"),
                ],
            ),
        ],
    );
    assert.deepStrictEqual(
        coed.render(inputElement),
        `<svg width="40" height="40" viewBox="0 0 40 40" role="img">
    <circle cx="20" cy="20" r="14" fill="none" stroke="#8A8F98" stroke-width="2">
    <circle cx="20" cy="20" r="6" fill="#B7FFBF">
</svg>`.trim(),
    );
}

export function testFromString() {
    const inputElement =
        coed.fromString(`<svg width="40" height="40" viewBox="0 0 40 40" role="img">
    <circle cx="20" cy="20" r="14" fill="none" stroke="#8A8F98" stroke-width="2">
    <circle cx="20" cy="20" r="6" fill="#B7FFBF">
</svg>`);

    assert.deepStrictEqual(
        coed.render(inputElement),
        `<svg width="40" height="40" viewBox="0 0 40 40" role="img">
    <circle cx="20" cy="20" r="14" fill="none" stroke="#8A8F98" stroke-width="2">
    <circle cx="20" cy="20" r="6" fill="#B7FFBF">
</svg>`.trim(),
    );
}

// events

export function testEmptyStringEvent() {
    const emptyText = coed.text("");

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Nothing(),
    );
}

export function testEmptyDivEvent() {
    const emptyText = coed.node("div", [], [], [coed.text("")]);

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Nothing(),
    );
}

export function testEmptyDivWithValidEvent() {
    const emptyText = coed.node(
        "div",
        [coed.on("click", () => "hello")],
        [],
        [coed.text("")],
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Just("hello"),
    );
}

export function testEmptyDivWithTwoValidEventsOfTheSameListener() {
    const emptyText = coed.node(
        "div",
        [coed.on("click", () => "hello"), coed.on("click", () => "goodbye")],
        [],
        [coed.text("")],
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Just("hello"),
    );
}

export function testEmptyDivWithTwoValidEventsOfTheDifferentListeners() {
    const emptyText = coed.node(
        "div",
        [
            coed.on("click", () => "hello"),
            coed.on("mousemove", () => "goodbye"),
        ],
        [],
        [coed.text("")],
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Just("hello"),
    );

    assert.deepStrictEqual(
        coed.triggerEvent("mousemove", {}, emptyText),
        Maybe.Just("goodbye"),
    );
}

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

    const filtered = coed.filter((leaf) => {
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
    }, tree);

    assert.deepStrictEqual(
        filtered,
        coed.node(
            "div",
            [],
            [],
            [
                coed.node("div", [], [coed.class_("keep")], [coed.text("hello")]),
                text(""),
            ],
        ),
    );
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

    const filtered = coed.filter((leaf) => {
        if (leaf.kind === "text") return true;
        if (leaf.kind === "regular" && leaf.tag === "script") return false;
        return true;
    }, tree);

    assert.deepStrictEqual(
        filtered,
        coed.node(
            "div",
            [],
            [],
            [
                text(""),
                coed.node("div", [], [coed.class_("keep")], [coed.text("hello")]),
            ],
        ),
    );
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

    const filtered = coed.filterAttributes((attr: Attribute) => {
        if (attr.kind === "string" && attr.key === "class") {
            return attr.value === "keep";
        }
        if (attr.kind === "string" && attr.key === "data-keep") {
            return true;
        }
        return false;
    }, tree);

    assert.deepStrictEqual(
        coed.render(filtered),
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

    const filtered = coed.filterAttributes((attr: Attribute) => {
        if (attr.kind === "boolean" && attr.key === "checked") {
            return true;
        }
        return false;
    }, tree);

    assert.deepStrictEqual(
        coed.render(filtered),
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

    const filtered = coed.filterEvents((event) => {
        if (event.name === "click") return true;
        return false;
    }, tree);

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, filtered),
        Maybe.Just("keep"),
    );

    assert.deepStrictEqual(
        coed.triggerEvent("mousemove", {}, filtered),
        Maybe.Nothing(),
    );
}

export function testFilterEventsWithMultipleListeners() {
    const tree = coed.node(
        "div",
        [coed.on("click", () => "keep"), coed.on("click", () => "also keep")],
        [],
        [coed.text("hello")],
    );

    const filtered = coed.filterEvents((event) => {
        if (event.name === "click") return true;
        return false;
    }, tree);

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, filtered),
        Maybe.Just("keep"),
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, filtered),
        Maybe.Just("keep"),
    );
}
