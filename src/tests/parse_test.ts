import * as assert from "assert";
import {
    a,
    attribute,
    b,
    body,
    booleanAttribute,
    br,
    class_,
    code,
    del,
    div,
    em,
    head,
    html,
    type HtmlNode,
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
} from "../coed.ts";
import { circle, svg } from "../coed/svg.ts";
import { parse } from "../langs/html/parse.ts";
import type { Result } from "../langs/types.ts";

export function testParseText() {
    const rawHtml = `<!doctype html><html><body>Hello world!</body></html>`;

    const expectedCoed: Result<HtmlNode<never>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [head([], [], []), body([], [], [text("Hello world!")])],
        ),
    };

    const parsed = parse(rawHtml);

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseSingleElement() {
    const rawHtml = `<!doctype html><html><body><p>Hello world!</p></body></html>`;

    const expectedCoed: Result<HtmlNode<never>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body([], [], [p([], [], [text("Hello world!")])]),
            ],
        ),
    };

    const parsed = parse(rawHtml);

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseDeeplyNestedElements() {
    const rawHtml = `<!doctype html><html><body><div><p><span><a><b><i><u><em><strong><mark><small><sub><sup><code><s><del><ins>Deeply nested elements</ins></del></s></code></sup></sub></small></mark></strong></em></u></i></b></a></span></p></div></body></html>`;

    const expectedCoed: Result<HtmlNode<never>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
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
                    ],
                ),
            ],
        ),
    };

    const parsed = parse(rawHtml);

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithStyles() {
    const rawHtml = `<!doctype html><html><body><div class="test"><p>Hello <span style="color: red;">world</span>!</p></div></body></html>`;

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
                        div(
                            [],
                            [class_("test")],
                            [
                                p(
                                    [],
                                    [],
                                    [
                                        text("Hello "),
                                        span(
                                            [],
                                            [style_("color", "red")],
                                            [text("world")],
                                        ),
                                        text("!"),
                                    ],
                                ),
                            ],
                        ),
                    ],
                ),
            ],
        ),
    };

    const parsed = parse(rawHtml);

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithNamespace() {
    const rawHtml = `<!doctype html><html><body><svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /></svg></body></html>`;
    const parsed = parse(rawHtml);

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
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
                    ],
                ),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseSvg() {
    const rawHtml = `<!doctype html><html><body><svg><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /></svg></body></html>`;
    const parsed = parse(rawHtml);

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
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
                    ],
                ),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithMultipleRootElements() {
    const rawHtml = `<!doctype html><html><body><p>Hello</p><p>world!</p></body></html>`;
    const parsed = parse(rawHtml);
    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [p([], [], [text("Hello")]), p([], [], [text("world!")])],
                ),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithWhitespace() {
    const rawHtml = `<!doctype html><html><body>   <p>Hello</p>   <p>world!</p>   </body></html>`;
    const parsed = parse(rawHtml);

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
                        text("   "),
                        p([], [], [text("Hello")]),
                        text("   "),
                        p([], [], [text("world!")]),
                        text("   "),
                    ],
                ),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithComments() {
    const rawHtml = `<!doctype html><html><body><p>Hello<!-- This is a comment --> world!</p></body></html>`;
    const parsed = parse(rawHtml);

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body([], [], [p([], [], [text("Hello"), text(" world!")])]),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithDoctype() {
    const rawHtml = `<!DOCTYPE html><html><body><p>Hello world!</p></body></html>`;
    const parsed = parse(rawHtml);

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body([], [], [p([], [], [text("Hello world!")])]),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithSelfClosingTags() {
    const rawHtml = `<!doctype html><html><body><p>Hello<br>world!</p></body></html>`;
    const parsed = parse(rawHtml);

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [p([], [], [text("Hello"), br([], []), text("world!")])],
                ),
            ],
        ),
    };
    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithDeeplyNestedElementsAndWhitespace() {
    const rawHtml = `<!doctype html><html><body><div><p><span><a><b><i><u><em><strong><mark><small><sub><sup><code><s><del><ins>   Deeply nested elements   </ins></del></s></code></sup></sub></small></mark></strong></em></u></i></b></a></span></p></div></body></html>`;
    const parsed = parse(rawHtml);
    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
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
                    ],
                ),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseScriptTag() {
    const rawHtml = `<!DOCTYPE html><html><body><script>console.log("Hello world!");</script></body></html>`;
    const parsed = parse(rawHtml);
    const expectedCoed: Result<HtmlNode<never>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [script([], [], [text('console.log("Hello world!");')])],
                ),
            ],
        ),
    };
    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseStyleTag() {
    const rawHtml = `<!DOCTYPE html><html><body><style>body { background-color: red; }</style></body></html>`;
    const parsed = parse(rawHtml);
    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [style([], [], [text("body { background-color: red; }")])],
                ),
            ],
        ),
    };
    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseAttributes() {
    const rawHtml = `<!DOCTYPE html><html><body><p class="test" id="test-id" data-test="test-data">Hello world!</p></body></html>`;
    const parsed = parse(rawHtml);
    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
                        p(
                            [],
                            [
                                class_("test"),
                                attribute("id", "test-id"),
                                attribute("data-test", "test-data"),
                            ],
                            [text("Hello world!")],
                        ),
                    ],
                ),
            ],
        ),
    };
    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseBooleanAttributes() {
    const rawHtml = `<!DOCTYPE html><html><body><input type="checkbox" checked disabled></body></html>`;
    const parsed = parse(rawHtml);

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
                        input(
                            [],
                            [
                                attribute("type", "checkbox"),
                                booleanAttribute("checked", true),
                                booleanAttribute("disabled", true),
                            ],
                        ),
                    ],
                ),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithInvalidHtml() {
    const rawHtml = `<!DOCTYPE html><html><body><p>Hello world!</p></body></html>`;
    const parsed = parse(rawHtml);
    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body([], [], [p([], [], [text("Hello world!")])]),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithInvalidHtml2() {
    const rawHtml = `<!DOCTYPE html><html><body><p>Hello <span>world!</span></p></body></html>`;
    const parsed = parse(rawHtml);

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
                        p(
                            [],
                            [],
                            [text("Hello "), span([], [], [text("world!")])],
                        ),
                    ],
                ),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithInvalidHtml3() {
    const rawHtml = `<!DOCTYPE html><html><body><p>Hello <span>world!</span></p></body></html>`;
    const parsed = parse(rawHtml);

    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
                        p(
                            [],
                            [],
                            [text("Hello "), span([], [], [text("world!")])],
                        ),
                    ],
                ),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseWithIframes() {
    const rawHtml = `<!DOCTYPE html><html><body><iframe src="https://www.example.com"></iframe></body></html>`;
    const parsed = parse(rawHtml);
    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], []),
                body(
                    [],
                    [],
                    [
                        iframe(
                            [],
                            [attribute("src", "https://www.example.com")],
                            [],
                        ),
                    ],
                ),
            ],
        ),
    };

    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseEmptyString() {
    const rawHtml = ``;
    const parsed = parse(rawHtml);
    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html([], [], [head([], [], []), body([], [], [])]),
    };
    assert.deepStrictEqual(parsed, expectedCoed);
}

export function testParseHtml() {
    const rawHtml = `<!DOCTYPE html><html><head><title>Test</title></head><body><p>Hello world!</p></body></html>`;
    const parsed = parse(rawHtml);
    const expectedCoed: Result<HtmlNode<unknown>> = {
        kind: "Ok",
        value: html(
            [],
            [],
            [
                head([], [], [title([], [], [text("Test")])]),
                body([], [], [p([], [], [text("Hello world!")])]),
            ],
        ),
    };
    assert.deepStrictEqual(parsed, expectedCoed);
}
