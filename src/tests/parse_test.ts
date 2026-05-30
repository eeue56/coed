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
import { parse } from "../parse.ts";
import { circle, svg } from "../svg.ts";

export function testParseText() {
    const rawHtml = `<!doctype html><html><body>Hello world!</body></html>`;

    const coedEquvilient = html(
        [],
        [],
        [head([], [], []), body([], [], [text("Hello world!")])],
    );

    const parsed = parse(rawHtml);

    assert.deepStrictEqual(parsed, coedEquvilient);
}

export function testParseSingleElement() {
    const rawHtml = `<!doctype html><html><body><p>Hello world!</p></body></html>`;

    const coedEquvilient = html(
        [],
        [],
        [head([], [], []), body([], [], [p([], [], [text("Hello world!")])])],
    );

    const parsed = parse(rawHtml);

    assert.deepStrictEqual(parsed, coedEquvilient);
}

export function testParseDeeplyNestedElements() {
    const rawHtml = `<!doctype html><html><body><div><p><span><a><b><i><u><em><strong><mark><small><sub><sup><code><s><del><ins>Deeply nested elements</ins></del></s></code></sup></sub></small></mark></strong></em></u></i></b></a></span></p></div></body></html>`;

    const coedEquvilient = html(
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
    );

    const parsed = parse(rawHtml);

    assert.deepStrictEqual(parsed, coedEquvilient);
}

export function testParseWithStyles() {
    const rawHtml = `<!doctype html><html><body><div class="test"><p>Hello <span style="color: red;">world</span>!</p></div></body></html>`;

    const coedEquvilient = html(
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
    );

    const parsed = parse(rawHtml);

    assert.deepStrictEqual(parsed, coedEquvilient);
}

export function testParseWithNamespace() {
    const rawHtml = `<!doctype html><html><body><svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /></svg></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseSvg() {
    const rawHtml = `<!doctype html><html><body><svg><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /></svg></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseWithMultipleRootElements() {
    const rawHtml = `<!doctype html><html><body><p>Hello</p><p>world!</p></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseWithWhitespace() {
    const rawHtml = `<!doctype html><html><body>   <p>Hello</p>   <p>world!</p>   </body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseWithComments() {
    const rawHtml = `<!doctype html><html><body><p>Hello<!-- This is a comment --> world!</p></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
            [],
            [],
            [
                head([], [], []),
                body([], [], [p([], [], [text("Hello"), text(" world!")])]),
            ],
        ),
    );
}

export function testParseWithDoctype() {
    const rawHtml = `<!DOCTYPE html><html><body><p>Hello world!</p></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
            [],
            [],
            [
                head([], [], []),
                body([], [], [p([], [], [text("Hello world!")])]),
            ],
        ),
    );
}

export function testParseWithSelfClosingTags() {
    const rawHtml = `<!doctype html><html><body><p>Hello<br>world!</p></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseWithDeeplyNestedElementsAndWhitespace() {
    const rawHtml = `<!doctype html><html><body><div><p><span><a><b><i><u><em><strong><mark><small><sub><sup><code><s><del><ins>   Deeply nested elements   </ins></del></s></code></sup></sub></small></mark></strong></em></u></i></b></a></span></p></div></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseScriptTag() {
    const rawHtml = `<!DOCTYPE html><html><body><script>console.log("Hello world!");</script></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseStyleTag() {
    const rawHtml = `<!DOCTYPE html><html><body><style>body { background-color: red; }</style></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseAttributes() {
    const rawHtml = `<!DOCTYPE html><html><body><p class="test" id="test-id" data-test="test-data">Hello world!</p></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseBooleanAttributes() {
    const rawHtml = `<!DOCTYPE html><html><body><input type="checkbox" checked disabled></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseWithInvalidHtml() {
    const rawHtml = `<!DOCTYPE html><html><body><p>Hello world!</p></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
            [],
            [],
            [
                head([], [], []),
                body([], [], [p([], [], [text("Hello world!")])]),
            ],
        ),
    );
}

export function testParseWithInvalidHtml2() {
    const rawHtml = `<!DOCTYPE html><html><body><p>Hello <span>world!</span></p></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseWithInvalidHtml3() {
    const rawHtml = `<!DOCTYPE html><html><body><p>Hello <span>world!</span></p></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseWithIframes() {
    const rawHtml = `<!DOCTYPE html><html><body><iframe src="https://www.example.com"></iframe></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
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
    );
}

export function testParseEmptyString() {
    const rawHtml = ``;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html([], [], [head([], [], []), body([], [], [])]),
    );
}

export function testParseHtml() {
    const rawHtml = `<!DOCTYPE html><html><head><title>Test</title></head><body><p>Hello world!</p></body></html>`;
    const parsed = parse(rawHtml);
    assert.deepStrictEqual(
        parsed,
        html(
            [],
            [],
            [
                head([], [], [title([], [], [text("Test")])]),
                body([], [], [p([], [], [text("Hello world!")])]),
            ],
        ),
    );
}
