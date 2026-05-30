import * as assert from "assert";
import {
    a,
    attribute,
    b,
    booleanAttribute,
    br,
    class_,
    code,
    del,
    div,
    em,
    i,
    iframe,
    input,
    ins,
    mark,
    p,
    s,
    script,
    small,
    span,
    strong,
    style,
    style_,
    sub,
    sup,
    text,
    title,
    u,
} from "./coed.ts";
import { parseFragment } from "./parse.ts";
import { circle, svg } from "./svg.ts";

export function testParseText() {
    const html = `Hello world!`;

    const coedEquvilient = [text("Hello world!")];

    const parsed = parseFragment(html);

    assert.deepStrictEqual(parsed, coedEquvilient);
}

export function testParseSingleElement() {
    const html = `<p>Hello world!</p>`;

    const coedEquvilient = [p([], [], [text("Hello world!")])];

    const parsed = parseFragment(html);

    assert.deepStrictEqual(parsed, coedEquvilient);
}

export function testParseDeeplyNestedElements() {
    const html = `<div><p><span><a><b><i><u><em><strong><mark><small><sub><sup><code><s><del><ins>Deeply nested elements</ins></del></s></code></sup></sub></small></mark></strong></em></u></i></b></a></span></p></div>`;

    const coedEquvilient = [
        div(
            [],
            [],
            [
                p(
                    [],
                    [],
                    [
                        span(
                            [],
                            [],
                            [
                                a(
                                    [],
                                    [],
                                    [
                                        b(
                                            [],
                                            [],
                                            [
                                                i(
                                                    [],
                                                    [],
                                                    [
                                                        u(
                                                            [],
                                                            [],
                                                            [
                                                                em(
                                                                    [],
                                                                    [],
                                                                    [
                                                                        strong(
                                                                            [],
                                                                            [],
                                                                            [
                                                                                mark(
                                                                                    [],
                                                                                    [],
                                                                                    [
                                                                                        small(
                                                                                            [],
                                                                                            [],
                                                                                            [
                                                                                                sub(
                                                                                                    [],
                                                                                                    [],
                                                                                                    [
                                                                                                        sup(
                                                                                                            [],
                                                                                                            [],
                                                                                                            [
                                                                                                                code(
                                                                                                                    [],
                                                                                                                    [],
                                                                                                                    [
                                                                                                                        s(
                                                                                                                            [],
                                                                                                                            [],
                                                                                                                            [
                                                                                                                                del(
                                                                                                                                    [],
                                                                                                                                    [],
                                                                                                                                    [
                                                                                                                                        ins(
                                                                                                                                            [],
                                                                                                                                            [],
                                                                                                                                            [
                                                                                                                                                text(
                                                                                                                                                    "Deeply nested elements",
                                                                                                                                                ),
                                                                                                                                            ],
                                                                                                                                        ),
                                                                                                                                    ],
                                                                                                                                ),
                                                                                                                            ],
                                                                                                                        ),
                                                                                                                    ],
                                                                                                                ),
                                                                                                            ],
                                                                                                        ),
                                                                                                    ],
                                                                                                ),
                                                                                            ],
                                                                                        ),
                                                                                    ],
                                                                                ),
                                                                            ],
                                                                        ),
                                                                    ],
                                                                ),
                                                            ],
                                                        ),
                                                    ],
                                                ),
                                            ],
                                        ),
                                    ],
                                ),
                            ],
                        ),
                    ],
                ),
            ],
        ),
    ];

    const parsed = parseFragment(html);

    assert.deepStrictEqual(parsed, coedEquvilient);
}

export function testParseWithStyles() {
    const html = `<div class="test"><p>Hello <span style="color: red;">world</span>!</p></div>`;

    const coedEquvilient = [
        div(
            [],
            [class_("test")],
            [
                p(
                    [],
                    [],
                    [
                        text("Hello "),
                        span([], [style_("color", "red")], [text("world")]),
                        text("!"),
                    ],
                ),
            ],
        ),
    ];

    const parsed = parseFragment(html);

    assert.deepStrictEqual(parsed, coedEquvilient);
}

export function testParseWithNamespace() {
    const html = `<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /></svg>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        svg(
            [],
            [],
            [
                circle(
                    [],
                    [
                        attribute("cx", "50"),
                        attribute("cy", "50"),
                        attribute("r", "40"),
                        attribute("stroke", "green"),
                        attribute("stroke-width", "4"),
                        attribute("fill", "yellow"),
                    ],
                ),
            ],
        ),
    ]);
}

export function testParseSvg() {
    const html = `<svg><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /></svg>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        svg(
            [],
            [],
            [
                circle(
                    [],
                    [
                        attribute("cx", "50"),
                        attribute("cy", "50"),
                        attribute("r", "40"),
                        attribute("stroke", "green"),
                        attribute("stroke-width", "4"),
                        attribute("fill", "yellow"),
                    ],
                ),
            ],
        ),
    ]);
}

export function testParseWithMultipleRootElements() {
    const html = `<p>Hello</p><p>world!</p>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        p([], [], [text("Hello")]),
        p([], [], [text("world!")]),
    ]);
}

export function testParseWithWhitespace() {
    const html = `   <p>Hello</p>   <p>world!</p>   `;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        text("   "),
        p([], [], [text("Hello")]),
        text("   "),
        p([], [], [text("world!")]),
        text("   "),
    ]);
}

export function testParseWithComments() {
    const html = `<p>Hello<!-- This is a comment --> world!</p>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        p([], [], [text("Hello"), text(" world!")]),
    ]);
}

export function testParseWithDoctype() {
    const html = `<!DOCTYPE html><p>Hello world!</p>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [p([], [], [text("Hello world!")])]);
}

export function testParseWithSelfClosingTags() {
    const html = `<p>Hello<br>world!</p>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        p([], [], [text("Hello"), br([], []), text("world!")]),
    ]);
}

export function testParseWithDeeplyNestedElementsAndWhitespace() {
    const html = `<div><p><span><a><b><i><u><em><strong><mark><small><sub><sup><code><s><del><ins>   Deeply nested elements   </ins></del></s></code></sup></sub></small></mark></strong></em></u></i></b></a></span></p></div>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        div(
            [],
            [],
            [
                p(
                    [],
                    [],
                    [
                        span(
                            [],
                            [],
                            [
                                a(
                                    [],
                                    [],
                                    [
                                        b(
                                            [],
                                            [],
                                            [
                                                i(
                                                    [],
                                                    [],
                                                    [
                                                        u(
                                                            [],
                                                            [],
                                                            [
                                                                em(
                                                                    [],
                                                                    [],
                                                                    [
                                                                        strong(
                                                                            [],
                                                                            [],
                                                                            [
                                                                                mark(
                                                                                    [],
                                                                                    [],
                                                                                    [
                                                                                        small(
                                                                                            [],
                                                                                            [],
                                                                                            [
                                                                                                sub(
                                                                                                    [],
                                                                                                    [],
                                                                                                    [
                                                                                                        sup(
                                                                                                            [],
                                                                                                            [],
                                                                                                            [
                                                                                                                code(
                                                                                                                    [],
                                                                                                                    [],
                                                                                                                    [
                                                                                                                        s(
                                                                                                                            [],
                                                                                                                            [],
                                                                                                                            [
                                                                                                                                del(
                                                                                                                                    [],
                                                                                                                                    [],
                                                                                                                                    [
                                                                                                                                        ins(
                                                                                                                                            [],
                                                                                                                                            [],
                                                                                                                                            [
                                                                                                                                                text(
                                                                                                                                                    "   Deeply nested elements   ",
                                                                                                                                                ),
                                                                                                                                            ],
                                                                                                                                        ),
                                                                                                                                    ],
                                                                                                                                ),
                                                                                                                            ],
                                                                                                                        ),
                                                                                                                    ],
                                                                                                                ),
                                                                                                            ],
                                                                                                        ),
                                                                                                    ],
                                                                                                ),
                                                                                            ],
                                                                                        ),
                                                                                    ],
                                                                                ),
                                                                            ],
                                                                        ),
                                                                    ],
                                                                ),
                                                            ],
                                                        ),
                                                    ],
                                                ),
                                            ],
                                        ),
                                    ],
                                ),
                            ],
                        ),
                    ],
                ),
            ],
        ),
    ]);
}

export function testParseScriptTag() {
    const html = `<script>console.log("Hello world!");</script>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        script([], [], [text('console.log("Hello world!");')]),
    ]);
}

export function testParseStyleTag() {
    const html = `<style>body { background-color: red; }</style>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        style([], [], [text("body { background-color: red; }")]),
    ]);
}

export function testParseAttributes() {
    const html = `<p class="test" id="test-id" data-test="test-data">Hello world!</p>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        p(
            [],
            [
                class_("test"),
                attribute("id", "test-id"),
                attribute("data-test", "test-data"),
            ],
            [text("Hello world!")],
        ),
    ]);
}

export function testParseBooleanAttributes() {
    const html = `<input type="checkbox" checked disabled>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        input(
            [],
            [
                attribute("type", "checkbox"),
                booleanAttribute("checked", true),
                booleanAttribute("disabled", true),
            ],
        ),
    ]);
}

export function testParseWithInvalidHtml() {
    const html = `<p>Hello world!`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [p([], [], [text("Hello world!")])]);
}

export function testParseWithInvalidHtml2() {
    const html = `<p>Hello <span>world!</p>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        p([], [], [text("Hello "), span([], [], [text("world!")])]),
    ]);
}

export function testParseWithInvalidHtml3() {
    const html = `<p>Hello <span>world!</span>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        p([], [], [text("Hello "), span([], [], [text("world!")])]),
    ]);
}

export function testParseWithIframes() {
    const html = `<iframe src="https://www.example.com"></iframe>`;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, [
        iframe([], [attribute("src", "https://www.example.com")], []),
    ]);
}

export function testParseEmptyString() {
    const html = ``;
    const parsed = parseFragment(html);
    assert.deepStrictEqual(parsed, []);
}

/**
 * note: elements nested under head or body are extracted to the top level
 */
export function testParseHtml() {
    const htmlString = `<html><head><title>Test</title></head><body><p>Hello world!</p></body></html>`;
    const parsed = parseFragment(htmlString);
    assert.deepStrictEqual(parsed, [
        title([], [], [text("Test")]),
        p([], [], [text("Hello world!")]),
    ]);
}
