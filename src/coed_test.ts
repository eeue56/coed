import { strict as assert } from "assert";
import { Maybe } from "@eeue56/ts-core";
import * as coed from "./coed";

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
        []
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        '<div class="button btn"></div>'
    );
}

export function testDivWithVoidElement() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("button"), coed.class_("btn")],
        [coed.img([], [coed.attribute("src", "https://example.com/image.gif")])]
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="button btn">
    <img src="https://example.com/image.gif">
</div>`.trim()
    );
}

export function testDivWithQuotedAttribute() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("button"), coed.class_("'btn'")],
        [coed.img([], [coed.attribute("src", "https://example.com/image.gif")])]
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="button 'btn'">
    <img src="https://example.com/image.gif">
</div>`.trim()
    );
}

export function testDivWithDoublyQuotedAttribute() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("button"), coed.class_('"btn"')],
        [coed.img([], [coed.attribute("src", "https://example.com/image.gif")])]
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class='button "btn"'>
    <img src="https://example.com/image.gif">
</div>`.trim()
    );
}

export function testDivWithTextRendering() {
    const emptyDiv = coed.node("div", [], [], [coed.text("hello")]);
    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div>
    hello
</div>`.trim()
    );
}

export function testDivWithTextWithClassRendering() {
    const emptyDiv = coed.node(
        "div",
        [],
        [coed.class_("button")],
        [coed.text("hello")]
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="button">
    hello
</div>`.trim()
    );
}

// nested nodes

export function testDoublyNestedDivWithTextRendering() {
    const emptyDiv = coed.node(
        "div",
        [],
        [],
        [coed.text("hello"), coed.node("div", [], [], [coed.text("world")])]
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div>
    hello
    <div>
        world
    </div>
</div>`.trim()
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
                [coed.text("world")]
            ),
        ]
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="outer-button">
    hello
    <div class="inner-button">
        world
    </div>
</div>`.trim()
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
                [coed.text("world")]
            ),
        ]
    );

    assert.deepStrictEqual(
        coed.render(emptyDiv),
        `
<div class="outer-button btn">
    hello
    <div class="inner-button btn-2">
        world
    </div>
</div>`.trim()
    );
}

// events

export function testEmptyStringEvent() {
    const emptyText = coed.text("");

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Nothing()
    );
}

export function testEmptyDivEvent() {
    const emptyText = coed.node("div", [], [], [coed.text("")]);

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Nothing()
    );
}

export function testEmptyDivWithValidEvent() {
    const emptyText = coed.node(
        "div",
        [coed.on("click", () => "hello")],
        [],
        [coed.text("")]
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Just("hello")
    );
}

export function testEmptyDivWithTwoValidEventsOfTheSameListener() {
    const emptyText = coed.node(
        "div",
        [coed.on("click", () => "hello"), coed.on("click", () => "goodbye")],
        [],
        [coed.text("")]
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Just("hello")
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
        [coed.text("")]
    );

    assert.deepStrictEqual(
        coed.triggerEvent("click", {}, emptyText),
        Maybe.Just("hello")
    );

    assert.deepStrictEqual(
        coed.triggerEvent("mousemove", {}, emptyText),
        Maybe.Just("goodbye")
    );
}
