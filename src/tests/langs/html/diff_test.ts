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
} from "../../../coed.ts";
import { html } from "../../../langs/index.ts";

export function testDiffTextNoChanges() {
    deepStrictEqual(html.diff(text("hello"), text("hello")), { diffs: [] });
}

export function testDiffTextChanges() {
    deepStrictEqual(html.diff(text("hello"), text("world")), {
        diffs: [
            {
                path: "0",
                added: text("world"),
                removed: text("hello"),
            },
        ],
    });
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
    deepStrictEqual(
        html.diff(
            div([], [class_("test")], [text("hello")]),
            div([], [class_("test")], [text("world")]),
        ),
        {
            diffs: [
                {
                    path: "0.0",
                    added: text("world"),
                    removed: text("hello"),
                },
            ],
        },
    );
}

export function testDiffRegularNodeAttributeChanges() {
    deepStrictEqual(
        html.diff(
            div([], [class_("test")], [text("hello")]),
            div([], [class_("another")], [text("hello")]),
        ),
        {
            diffs: [
                {
                    path: "0->attributes{class}",
                    added: div([], [class_("another")], [text("hello")]),
                    removed: div([], [class_("test")], [text("hello")]),
                },
            ],
        },
    );
}

export function testDiffVoidNodeNoChanges() {
    deepStrictEqual(
        html.diff(img([], [class_("test")]), img([], [class_("test")])),
        { diffs: [] },
    );
}

export function testDiffVoidNodeAttributeChanges() {
    deepStrictEqual(
        html.diff(img([], [class_("test")]), img([], [class_("another")])),
        {
            diffs: [
                {
                    path: "0->attributes{class}",
                    added: img([], [class_("another")]),
                    removed: img([], [class_("test")]),
                },
            ],
        },
    );
}

export function testDiffVoidNodeChanges() {
    deepStrictEqual(
        html.diff(
            img([], [class_("test")]),
            div([], [class_("another")], [text("world")]),
        ),
        {
            diffs: [
                {
                    path: "0",
                    added: div([], [class_("another")], [text("world")]),
                    removed: img([], [class_("test")]),
                },
            ],
        },
    );

    deepStrictEqual(
        html.diff(
            div([], [class_("another")], [text("world")]),
            img([], [class_("test")]),
        ),
        {
            diffs: [
                {
                    path: "0",
                    added: img([], [class_("test")]),
                    removed: div([], [class_("another")], [text("world")]),
                },
            ],
        },
    );
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
    deepStrictEqual(
        html.diff(
            div([], [attribute("id", "left")], [text("hello")]),
            div([], [attribute("id", "right")], [text("hello")]),
        ),
        {
            diffs: [
                {
                    path: "0->attributes{id}",
                    added: div([], [attribute("id", "right")], [text("hello")]),
                    removed: div(
                        [],
                        [attribute("id", "left")],
                        [text("hello")],
                    ),
                },
            ],
        },
    );
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
    deepStrictEqual(
        html.diff(
            fromString("<div>hello</div>"),
            fromString("<div>world</div>"),
        ),
        {
            diffs: [
                {
                    path: "0",
                    added: fromString("<div>world</div>"),
                    removed: fromString("<div>hello</div>"),
                },
            ],
        },
    );
}

export function testDiffNamespacedNodeNamespaceChanges() {
    deepStrictEqual(
        html.diff(
            nodeNS("div", "http://www.w3.org/2000/svg", [], [], [text("x")]),
            nodeNS("div", "https://example.com/ns", [], [], [text("x")]),
        ),
        {
            diffs: [
                {
                    path: "0->attributes{xmlns}",
                    added: nodeNS(
                        "div",
                        "https://example.com/ns",
                        [],
                        [],
                        [text("x")],
                    ),
                    removed: nodeNS(
                        "div",
                        "http://www.w3.org/2000/svg",
                        [],
                        [],
                        [text("x")],
                    ),
                },
            ],
        },
    );
}

export function testDiffRegularNodeAttributeKeyPathForSingleAttributeChange() {
    deepStrictEqual(
        html.diff(
            div([], [attribute("data-state", "open")], [text("hello")]),
            div([], [attribute("data-state", "closed")], [text("hello")]),
        ),
        {
            diffs: [
                {
                    path: "0->attributes{data-state}",
                    added: div(
                        [],
                        [attribute("data-state", "closed")],
                        [text("hello")],
                    ),
                    removed: div(
                        [],
                        [attribute("data-state", "open")],
                        [text("hello")],
                    ),
                },
            ],
        },
    );
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
    deepStrictEqual(
        html.diff(
            div(
                [],
                [class_("outer")],
                [span([], [attribute("data-state", "open")], [text("hello")])],
            ),
            div(
                [],
                [class_("outer")],
                [
                    span(
                        [],
                        [attribute("data-state", "closed")],
                        [text("hello")],
                    ),
                ],
            ),
        ),
        {
            diffs: [
                {
                    path: "0.0->attributes{data-state}",
                    added: span(
                        [],
                        [attribute("data-state", "closed")],
                        [text("hello")],
                    ),
                    removed: span(
                        [],
                        [attribute("data-state", "open")],
                        [text("hello")],
                    ),
                },
            ],
        },
    );
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

    deepStrictEqual(html.diff(left, right), {
        diffs: [
            {
                path: "0.0.0",
                added: text("goodbye"),
                removed: text("hello"),
            },
            {
                path: "0.1->attributes{data-state}",
                added: span(
                    [],
                    [attribute("data-state", "closed")],
                    [text("world")],
                ),
                removed: span(
                    [],
                    [attribute("data-state", "open")],
                    [text("world")],
                ),
            },
        ],
    });
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

    deepStrictEqual(html.diff(left, right), {
        diffs: [
            {
                path: "0.0.0.0",
                added: text("alpha-updated"),
                removed: text("alpha"),
            },
            {
                path: "0.0.1->attributes{data-state}",
                added: span(
                    [],
                    [attribute("data-state", "active")],
                    [text("beta")],
                ),
                removed: span(
                    [],
                    [attribute("data-state", "idle")],
                    [text("beta")],
                ),
            },
            {
                path: "0.1.0.0",
                added: text("gamma-updated"),
                removed: text("gamma"),
            },
            {
                path: "0.1.1->attributes{class}",
                added: img([], [class_("avatar-large")]),
                removed: img([], [class_("avatar")]),
            },
        ],
    });
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

    deepStrictEqual(html.diff(left, right), {
        diffs: [
            {
                path: "0.0.0",
                added: fromString("<strong>v2</strong>"),
                removed: fromString("<strong>v1</strong>"),
            },
            {
                path: "0.0.1",
                added: text("status: ok"),
                removed: text("status"),
            },
            {
                path: "0.1.0->attributes{data-mode}",
                added: span(
                    [],
                    [attribute("data-mode", "write")],
                    [text("panel")],
                ),
                removed: span(
                    [],
                    [attribute("data-mode", "read")],
                    [text("panel")],
                ),
            },
            {
                path: "0.1.1.0",
                added: text("count: 11"),
                removed: text("count: 10"),
            },
            {
                path: "0.1.1.1->attributes{alt}",
                added: img([], [attribute("alt", "new")]),
                removed: img([], [attribute("alt", "old")]),
            },
        ],
    });
}
