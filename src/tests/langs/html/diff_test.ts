import { deepStrictEqual } from "assert";
import {
    attribute,
    class_,
    div,
    fromString,
    img,
    nodeNS,
    span,
    text,
    type HtmlNode,
} from "../../../coed.ts";
import { html } from "../../../langs/index.ts";

function assertDiffPaths(
    left: HtmlNode<unknown>,
    right: HtmlNode<unknown>,
    paths: string[],
) {
    deepStrictEqual(html.diff(left, right), {
        diffs: paths.map((path) => ({ path, added: right, removed: left })),
    });
}

export function testDiffTextNoChanges() {
    deepStrictEqual(html.diff(text("hello"), text("hello")), { diffs: [] });
}

export function testDiffTextChanges() {
    const left = text("hello");
    const right = text("world");

    assertDiffPaths(left, right, ["0"]);
}

export function testDiffRegularNodeNoChanges() {
    deepStrictEqual(
        html.diff(
            div([], [class_("test")], [text("hello")]),
            div([], [class_("test")], [text("hello")]),
        ),
        { diffs: [] },
    );
}

export function testDiffRegularNodeChanges() {
    const left = div([], [class_("test")], [text("hello")]);
    const right = div([], [class_("test")], [text("world")]);

    assertDiffPaths(left, right, ["0.0"]);
}

export function testDiffRegularNodeAttributeChanges() {
    const left = div([], [class_("test")], [text("hello")]);
    const right = div([], [class_("another")], [text("hello")]);

    assertDiffPaths(left, right, ["0->attributes{class}"]);
}

export function testDiffVoidNodeNoChanges() {
    deepStrictEqual(
        html.diff(img([], [class_("test")]), img([], [class_("test")])),
        { diffs: [] },
    );
}

export function testDiffVoidNodeAttributeChanges() {
    const left = img([], [class_("test")]);
    const right = img([], [class_("another")]);

    assertDiffPaths(left, right, ["0->attributes{class}"]);
}

export function testDiffVoidNodeChanges() {
    const left = img([], [class_("test")]);
    const right = div([], [class_("another")], [text("world")]);

    assertDiffPaths(left, right, ["0"]);
    assertDiffPaths(right, left, ["0"]);
}

export function testDiffRegularNodeChildAdded() {
    const left = div([], [class_("test")], [text("hello")]);
    const right = div([], [class_("test")], [text("hello"), text("world")]);

    deepStrictEqual(html.diff(left, right), {
        diffs: [
            {
                path: "0",
                added: right,
                removed: left,
            },
        ],
    });
}

export function testDiffRegularNodeChildRemoved() {
    const left = div([], [class_("test")], [text("hello"), text("world")]);
    const right = div([], [class_("test")], [text("hello")]);

    deepStrictEqual(html.diff(left, right), {
        diffs: [
            {
                path: "0",
                added: right,
                removed: left,
            },
        ],
    });
}

export function testDiffRegularNodeIdChanges() {
    const left = div([], [attribute("id", "left")], [text("hello")]);
    const right = div([], [attribute("id", "right")], [text("hello")]);

    assertDiffPaths(left, right, ["0->attributes{id}"]);
}

export function testDiffHtmlStringNoChanges() {
    deepStrictEqual(
        html.diff(
            fromString("<div>hello</div>"),
            fromString("<div>hello</div>"),
        ),
        { diffs: [] },
    );
}

export function testDiffHtmlStringChanges() {
    const left = fromString("<div>hello</div>");
    const right = fromString("<div>world</div>");

    assertDiffPaths(left, right, ["0"]);
}

export function testDiffNamespacedNodeNamespaceChanges() {
    const left = nodeNS("div", "http://www.w3.org/2000/svg", [], [], [text("x")]);
    const right = nodeNS("div", "https://example.com/ns", [], [], [text("x")]);

    assertDiffPaths(left, right, ["0->attributes{xmlns}"]);
}

export function testDiffRegularNodeAttributeKeyPathForSingleAttributeChange() {
    const left = div([], [attribute("data-state", "open")], [text("hello")]);
    const right = div([], [attribute("data-state", "closed")], [text("hello")]);

    assertDiffPaths(left, right, ["0->attributes{data-state}"]);
}

export function testDiffRegularNodeReturnsAllChangedAttributeProperties() {
    const left = div(
        [],
        [attribute("id", "left"), class_("first")],
        [text("hello")],
    );
    const right = div(
        [],
        [attribute("id", "right"), class_("second")],
        [text("hello")],
    );

    deepStrictEqual(html.diff(left, right), {
        diffs: [
            {
                path: "0->attributes{id}",
                added: right,
                removed: left,
            },
            {
                path: "0->attributes{class}",
                added: right,
                removed: left,
            },
        ],
    });
}

export function testDiffRegularNodeRemoveAttribute() {
    const left = div(
        [],
        [attribute("id", "left"), class_("first")],
        [text("hello")],
    );
    const right = div([], [attribute("id", "right")], [text("hello")]);

    deepStrictEqual(html.diff(left, right), {
        diffs: [
            {
                path: "0->attributes{id}",
                added: right,
                removed: left,
            },
            {
                path: "0->attributes{class}",
                added: right,
                removed: left,
            },
        ],
    });

    deepStrictEqual(html.diff(right, left), {
        diffs: [
            {
                path: "0->attributes{id}",
                added: left,
                removed: right,
            },
            {
                path: "0->attributes{class}",
                added: left,
                removed: right,
            },
        ],
    });
}

export function testDiffNestedAttributePath() {
    const left = div(
        [],
        [class_("outer")],
        [span([], [attribute("data-state", "open")], [text("hello")])],
    );
    const right = div(
        [],
        [class_("outer")],
        [
            span(
                [],
                [attribute("data-state", "closed")],
                [text("hello")],
            ),
        ],
    );

    assertDiffPaths(left, right, ["0.0->attributes{data-state}"]);
}

export function testDiffReturnsAllSiblingDiffs() {
    const left = div(
        [],
        [class_("outer")],
        [
            span([], [], [text("hello")]),
            span([], [attribute("data-state", "open")], [text("world")]),
        ],
    );
    const right = div(
        [],
        [class_("outer")],
        [
            span([], [], [text("goodbye")]),
            span([], [attribute("data-state", "closed")], [text("world")]),
        ],
    );

    assertDiffPaths(left, right, ["0.0.0", "0.1->attributes{data-state}"]);
}

export function testDiffDeepTreeWithMultipleChangedPaths() {
    const left = div(
        [],
        [class_("root")],
        [
            div(
                [],
                [class_("left")],
                [
                    span([], [], [text("alpha")]),
                    span([], [attribute("data-state", "idle")], [text("beta")]),
                ],
            ),
            div(
                [],
                [class_("right")],
                [div([], [], [text("gamma")]), img([], [class_("avatar")])],
            ),
        ],
    );

    const right = div(
        [],
        [class_("root")],
        [
            div(
                [],
                [class_("left")],
                [
                    span([], [], [text("alpha-updated")]),
                    span(
                        [],
                        [attribute("data-state", "active")],
                        [text("beta")],
                    ),
                ],
            ),
            div(
                [],
                [class_("right")],
                [
                    div([], [], [text("gamma-updated")]),
                    img([], [class_("avatar-large")]),
                ],
            ),
        ],
    );

    assertDiffPaths(left, right, [
        "0.0.0.0",
        "0.0.1->attributes{data-state}",
        "0.1.0.0",
        "0.1.1->attributes{class}",
    ]);
}

export function testDiffComplexMixedNodeKindsAcrossMultiplePaths() {
    const left = div(
        [],
        [class_("dashboard")],
        [
            div(
                [],
                [class_("header")],
                [fromString("<strong>v1</strong>"), text("status")],
            ),
            div(
                [],
                [class_("content")],
                [
                    span([], [attribute("data-mode", "read")], [text("panel")]),
                    div(
                        [],
                        [],
                        [text("count: 10"), img([], [attribute("alt", "old")])],
                    ),
                ],
            ),
        ],
    );

    const right = div(
        [],
        [class_("dashboard")],
        [
            div(
                [],
                [class_("header")],
                [fromString("<strong>v2</strong>"), text("status: ok")],
            ),
            div(
                [],
                [class_("content")],
                [
                    span(
                        [],
                        [attribute("data-mode", "write")],
                        [text("panel")],
                    ),
                    div(
                        [],
                        [],
                        [text("count: 11"), img([], [attribute("alt", "new")])],
                    ),
                ],
            ),
        ],
    );

    assertDiffPaths(left, right, [
        "0.0.0",
        "0.0.1",
        "0.1.0->attributes{data-mode}",
        "0.1.1.0",
        "0.1.1.1->attributes{alt}",
    ]);
}
