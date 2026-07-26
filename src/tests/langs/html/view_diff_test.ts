import { deepStrictEqual } from "assert/strict";
import { attribute, class_, div, pre, span, text } from "../../../coed.ts";
import { html } from "../../../langs/html/index.ts";
import type { Diff } from "../../../langs/types.ts";

function generated(node: Parameters<typeof html.generate>[0]): string {
    return html
        .generate(node)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function testViewDiffEmptyReturnsEmptyContainer() {
    deepStrictEqual(
        html.viewDiff({ diffs: [] }),
        div([], [class_("coed-view-diff")], []),
    );
}

export function testViewDiffHighlightsChangedTextValue() {
    const removed = div([], [], [text("hello")]);
    const added = div([], [], [text("world")]);

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0.0",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(added);
    const removedCode = generated(removed);
    const addedValueStart = addedCode.indexOf("world");
    const removedValueStart = removedCode.indexOf("hello");

    deepStrictEqual(
        html.viewDiff(diff),
        div(
            [],
            [class_("coed-view-diff")],
            [
                div(
                    [],
                    [class_("coed-view-diff-entry")],
                    [
                        div(
                            [],
                            [class_("coed-view-diff-path")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-path-label")],
                                    [text("Path")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-path-value")],
                                    [text("0: <div>\n  0: #text")],
                                ),
                            ],
                        ),
                        div(
                            [],
                            [class_("coed-view-diff-added")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-added-label")],
                                    [text("Added")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-added-code")],
                                    [
                                        text(
                                            addedCode.slice(0, addedValueStart),
                                        ),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text("world")],
                                        ),
                                        text(
                                            addedCode.slice(
                                                addedValueStart +
                                                    "world".length,
                                            ),
                                        ),
                                    ],
                                ),
                            ],
                        ),
                        div(
                            [],
                            [class_("coed-view-diff-removed")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-removed-label")],
                                    [text("Removed")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-removed-code")],
                                    [
                                        text(
                                            removedCode.slice(
                                                0,
                                                removedValueStart,
                                            ),
                                        ),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-removed-highlight",
                                                ),
                                            ],
                                            [text("hello")],
                                        ),
                                        text(
                                            removedCode.slice(
                                                removedValueStart +
                                                    "hello".length,
                                            ),
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

export function testViewDiffHighlightsOnlyChangedAttributeValue() {
    const removed = div([], [attribute("id", "left")], []);
    const added = div([], [attribute("id", "right")], []);

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0->attributes{id}",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(added);
    const removedCode = generated(removed);
    const addedValueStart = addedCode.indexOf("right");
    const removedValueStart = removedCode.indexOf("left");

    deepStrictEqual(
        html.viewDiff(diff),
        div(
            [],
            [class_("coed-view-diff")],
            [
                div(
                    [],
                    [class_("coed-view-diff-entry")],
                    [
                        div(
                            [],
                            [class_("coed-view-diff-path")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-path-label")],
                                    [text("Path")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-path-value")],
                                    [text("0: <div>\n  attribute: id")],
                                ),
                            ],
                        ),
                        div(
                            [],
                            [class_("coed-view-diff-added")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-added-label")],
                                    [text("Added")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-added-code")],
                                    [
                                        text(
                                            addedCode.slice(0, addedValueStart),
                                        ),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text("right")],
                                        ),
                                        text(
                                            addedCode.slice(
                                                addedValueStart +
                                                    "right".length,
                                            ),
                                        ),
                                    ],
                                ),
                            ],
                        ),
                        div(
                            [],
                            [class_("coed-view-diff-removed")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-removed-label")],
                                    [text("Removed")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-removed-code")],
                                    [
                                        text(
                                            removedCode.slice(
                                                0,
                                                removedValueStart,
                                            ),
                                        ),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-removed-highlight",
                                                ),
                                            ],
                                            [text("left")],
                                        ),
                                        text(
                                            removedCode.slice(
                                                removedValueStart +
                                                    "left".length,
                                            ),
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

export function testViewDiffHighlightsTagNameWhenOnlyTagChanged() {
    const removed = div([], [attribute("id", "x")], []);
    const added = span([], [attribute("id", "x")], []);

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(added);
    const removedCode = generated(removed);
    const addedTagStart = addedCode.indexOf("span");
    const removedTagStart = removedCode.indexOf("div");

    deepStrictEqual(
        html.viewDiff(diff),
        div(
            [],
            [class_("coed-view-diff")],
            [
                div(
                    [],
                    [class_("coed-view-diff-entry")],
                    [
                        div(
                            [],
                            [class_("coed-view-diff-path")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-path-label")],
                                    [text("Path")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-path-value")],
                                    [text("0: <span> (was <div>)")],
                                ),
                            ],
                        ),
                        div(
                            [],
                            [class_("coed-view-diff-added")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-added-label")],
                                    [text("Added")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-added-code")],
                                    [
                                        text(addedCode.slice(0, addedTagStart)),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text("span")],
                                        ),
                                        text(
                                            addedCode.slice(
                                                addedTagStart + "span".length,
                                            ),
                                        ),
                                    ],
                                ),
                            ],
                        ),
                        div(
                            [],
                            [class_("coed-view-diff-removed")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-removed-label")],
                                    [text("Removed")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-removed-code")],
                                    [
                                        text(
                                            removedCode.slice(
                                                0,
                                                removedTagStart,
                                            ),
                                        ),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-removed-highlight",
                                                ),
                                            ],
                                            [text("div")],
                                        ),
                                        text(
                                            removedCode.slice(
                                                removedTagStart + "div".length,
                                            ),
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

export function testViewDiffShowsFullHtmlForNestedAttributeDiff() {
    const removed = div(
        [],
        [class_("outer")],
        [
            div(
                [],
                [],
                [
                    div(
                        [],
                        [attribute("id", "left")],
                        [span([], [], [text("child")])],
                    ),
                ],
            ),
        ],
    );

    const added = div(
        [],
        [class_("outer")],
        [
            div(
                [],
                [],
                [
                    div(
                        [],
                        [attribute("id", "right")],
                        [span([], [], [text("child")])],
                    ),
                ],
            ),
        ],
    );

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0.0.0->attributes{id}",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(added);
    const removedCode = generated(removed);
    const addedValueStart = addedCode.indexOf("right");
    const removedValueStart = removedCode.indexOf("left");

    deepStrictEqual(
        html.viewDiff(diff),
        div(
            [],
            [class_("coed-view-diff")],
            [
                div(
                    [],
                    [class_("coed-view-diff-entry")],
                    [
                        div(
                            [],
                            [class_("coed-view-diff-path")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-path-label")],
                                    [text("Path")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-path-value")],
                                    [
                                        text(
                                            "0: <div>\n  0: <div>\n    0: <div>\n      attribute: id",
                                        ),
                                    ],
                                ),
                            ],
                        ),
                        div(
                            [],
                            [class_("coed-view-diff-added")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-added-label")],
                                    [text("Added")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-added-code")],
                                    [
                                        text(
                                            addedCode.slice(0, addedValueStart),
                                        ),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text("right")],
                                        ),
                                        text(
                                            addedCode.slice(
                                                addedValueStart +
                                                    "right".length,
                                            ),
                                        ),
                                    ],
                                ),
                            ],
                        ),
                        div(
                            [],
                            [class_("coed-view-diff-removed")],
                            [
                                pre(
                                    [],
                                    [class_("coed-view-diff-removed-label")],
                                    [text("Removed")],
                                ),
                                pre(
                                    [],
                                    [class_("coed-view-diff-removed-code")],
                                    [
                                        text(
                                            removedCode.slice(
                                                0,
                                                removedValueStart,
                                            ),
                                        ),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-removed-highlight",
                                                ),
                                            ],
                                            [text("left")],
                                        ),
                                        text(
                                            removedCode.slice(
                                                removedValueStart +
                                                    "left".length,
                                            ),
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
