import { strict as assert } from "assert";
import { Maybe } from "@eeue56/ts-core";
import * as html from "./html";

// text nodes

export function testEmptyStringRendering() {
    const emptyText = html.text("");
    assert.deepStrictEqual(html.render(emptyText), "");
}

export function testNonEmptyStringRendering() {
    const emptyText = html.text("hello");
    assert.deepStrictEqual(html.render(emptyText), "hello");
}

// regular nodes

export function testEmptyDivRendering() {
    const emptyDiv = html.node("div", [ ], [ ], [ ]);
    assert.deepStrictEqual(html.render(emptyDiv), "<div></div>");
}

export function testEmptyDivWithClassRendering() {
    const emptyDiv = html.node("div", [ ], [ html.class_("button") ], [ ]);
    assert.deepStrictEqual(html.render(emptyDiv), '<div class="button"></div>');
}

export function testEmptyDivWithMultipleClassesRendering() {
    const emptyDiv = html.node(
        "div",
        [ ],
        [ html.class_("button"), html.class_("btn") ],
        [ ]
    );

    assert.deepStrictEqual(
        html.render(emptyDiv),
        '<div class="button btn"></div>'
    );
}

export function testDivWithTextRendering() {
    const emptyDiv = html.node("div", [ ], [ ], [ html.text("hello") ]);
    assert.deepStrictEqual(html.render(emptyDiv), "<div>hello</div>");
}

export function testDivWithTextWithClassRendering() {
    const emptyDiv = html.node(
        "div",
        [ ],
        [ html.class_("button") ],
        [ html.text("hello") ]
    );

    assert.deepStrictEqual(
        html.render(emptyDiv),
        `<div class="button">hello</div>`
    );
}

// nested nodes

export function testDoublyNestedDivWithTextRendering() {
    const emptyDiv = html.node(
        "div",
        [ ],
        [ ],
        [
            html.text("hello"),
            html.node("div", [ ], [ ], [ html.text("world") ]),
        ]
    );

    assert.deepStrictEqual(
        html.render(emptyDiv),
        "<div>hello<div>world</div></div>"
    );
}

export function testDoublyNestedDivWithTextWithClassesRendering() {
    const emptyDiv = html.node(
        "div",
        [ ],
        [ html.class_("outer-button") ],
        [
            html.text("hello"),
            html.node(
                "div",
                [ ],
                [ html.class_("inner-button") ],
                [ html.text("world") ]
            ),
        ]
    );

    assert.deepStrictEqual(
        html.render(emptyDiv),
        `<div class="outer-button">hello<div class="inner-button">world</div></div>`
    );
}

export function testDoublyNestedDivWithTextWithMultipleClassesRendering() {
    const emptyDiv = html.node(
        "div",
        [ ],
        [ html.class_("outer-button"), html.class_("btn") ],
        [
            html.text("hello"),
            html.node(
                "div",
                [ ],
                [ html.class_("inner-button"), html.class_("btn-2") ],
                [ html.text("world") ]
            ),
        ]
    );

    assert.deepStrictEqual(
        html.render(emptyDiv),
        `<div class="outer-button btn">hello<div class="inner-button btn-2">world</div></div>`
    );
}

// events

export function testEmptyStringEvent() {
    const emptyText = html.text("");

    assert.deepStrictEqual(
        html.triggerEvent("click", {}, emptyText),
        Maybe.Nothing()
    );
}

export function testEmptyDivEvent() {
    const emptyText = html.node("div", [ ], [ ], [ html.text("") ]);

    assert.deepStrictEqual(
        html.triggerEvent("click", {}, emptyText),
        Maybe.Nothing()
    );
}

export function testEmptyDivWithValidEvent() {
    const emptyText = html.node(
        "div",
        [ html.on("click", () => "hello") ],
        [ ],
        [ html.text("") ]
    );

    assert.deepStrictEqual(
        html.triggerEvent("click", {}, emptyText),
        Maybe.Just("hello")
    );
}

export function testEmptyDivWithTwoValidEventsOfTheSameListener() {
    const emptyText = html.node(
        "div",
        [ html.on("click", () => "hello"), html.on("click", () => "goodbye") ],
        [ ],
        [ html.text("") ]
    );

    assert.deepStrictEqual(
        html.triggerEvent("click", {}, emptyText),
        Maybe.Just("hello")
    );
}

export function testEmptyDivWithTwoValidEventsOfTheDifferentListeners() {
    const emptyText = html.node(
        "div",
        [
            html.on("click", () => "hello"),
            html.on("mousemove", () => "goodbye"),
        ],
        [ ],
        [ html.text("") ]
    );

    assert.deepStrictEqual(
        html.triggerEvent("click", {}, emptyText),
        Maybe.Just("hello")
    );

    assert.deepStrictEqual(
        html.triggerEvent("mousemove", {}, emptyText),
        Maybe.Just("goodbye")
    );
}