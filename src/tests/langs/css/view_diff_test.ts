import { deepStrictEqual } from "assert/strict";
import { class_, div, pre, span, text } from "../../../coed.ts";
import { css } from "../../../langs/css/index.ts";
import { defaultViewDiffCss } from "../../../langs/diffs/viewDiffCss.ts";
import type { Diff } from "../../../langs/types.ts";

function parseCss(input: string) {
    const parsed = css.parse(input.trim());
    deepStrictEqual(parsed.kind, "Ok");
    return parsed.value;
}

function generated(input: string): string {
    return css.generate(parseCss(input));
}

export function testViewDiffEmptyReturnsEmptyContainer() {
    deepStrictEqual(
        css.viewDiff({ diffs: [] }),
        div([], [class_("coed-view-diff")], []),
    );
}

export function testViewDiffExposesDefaultStylesheet() {
    deepStrictEqual(defaultViewDiffCss.length > 0, true);
    deepStrictEqual(defaultViewDiffCss.includes(".coed-view-diff-entry"), true);
    deepStrictEqual(
        defaultViewDiffCss.includes(".coed-view-diff-added-highlight"),
        true,
    );
    deepStrictEqual(
        defaultViewDiffCss.includes(".coed-view-diff-removed-highlight"),
        true,
    );
}

export function testViewDiffDefaultStylesheetIsExposedOnAllLanguages() {
    deepStrictEqual(defaultViewDiffCss.length > 0, true);
    deepStrictEqual(defaultViewDiffCss.includes(".coed-view-diff-entry"), true);
    deepStrictEqual(
        defaultViewDiffCss.includes(".coed-view-diff-added-highlight"),
        true,
    );
    deepStrictEqual(
        defaultViewDiffCss.includes(".coed-view-diff-removed-highlight"),
        true,
    );
}

export function testViewDiffHighlightsOnlyChangedValue() {
    const removed = parseCss(`
.hello {
	width: 20px;
}`);
    const added = parseCss(`
.hello {
	width: 30px;
}`);

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0->attributes{width}",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(`
.hello {
	width: 30px;
}`);
    const removedCode = generated(`
.hello {
	width: 20px;
}`);

    deepStrictEqual(
        css.viewDiff(diff),
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
                                    [text("0: .hello\n  property: width")],
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
                                        text(addedCode.split("30px")[0]),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text("30px")],
                                        ),
                                        text(addedCode.split("30px")[1]),
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
                                        text(removedCode.split("20px")[0]),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-removed-highlight",
                                                ),
                                            ],
                                            [text("20px")],
                                        ),
                                        text(removedCode.split("20px")[1]),
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

export function testViewDiffLegacyPropertyPathDoesNotUsePropertyHighlighting() {
    const removed = parseCss(`
.hello {
    width: 20px;
}`);
    const added = parseCss(`
.hello {
    width: 30px;
}`);

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0->property{width}",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(`
.hello {
    width: 30px;
}`);
    const removedCode = generated(`
.hello {
    width: 20px;
}`);

    deepStrictEqual(
        css.viewDiff(diff),
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
                                    [text("0: .hello")],
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
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text(addedCode)],
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
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-removed-highlight",
                                                ),
                                            ],
                                            [text(removedCode)],
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

export function testViewDiffHighlightsAddedPropertyOnly() {
    const removed = parseCss(`
.hello {
	width: 20px;
}`);
    const added = parseCss(`
.hello {
	width: 20px;
	height: 10px;
}`);

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0->attributes{height}",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(`
.hello {
	width: 20px;
	height: 10px;
}`);
    const removedCode = generated(`
.hello {
	width: 20px;
}`);

    deepStrictEqual(
        css.viewDiff(diff),
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
                                    [text("0: .hello\n  property: height")],
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
                                            addedCode.split("height: 10px;")[0],
                                        ),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text("height: 10px;")],
                                        ),
                                        text(
                                            addedCode.split("height: 10px;")[1],
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
                                    [text(removedCode)],
                                ),
                            ],
                        ),
                    ],
                ),
            ],
        ),
    );
}

export function testViewDiffHighlightsChangedBlock() {
    const removed = parseCss(`
.hello {
	width: 20px;
}`);
    const added = parseCss(`
.hello {
    width: 20px;
    height: 10px;
}`);

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(`
.hello {
    width: 20px;
    height: 10px;
}`);
    const removedCode = generated(`
.hello {
	width: 20px;
}`);

    deepStrictEqual(
        css.viewDiff(diff),
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
                                    [text("0: .hello")],
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
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text(addedCode)],
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
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-removed-highlight",
                                                ),
                                            ],
                                            [text(removedCode)],
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

export function testViewDiffHighlightsOnlyChangedSelectorLeaf() {
    const removed = parseCss(`
.hello {
	width: 20px;
}`);
    const added = parseCss(`
.world {
	width: 20px;
}`);

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(`
.world {
	width: 20px;
}`);
    const removedCode = generated(`
.hello {
	width: 20px;
}`);

    deepStrictEqual(
        css.viewDiff(diff),
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
                                    [text("0: .world (was .hello)")],
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
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text(".world")],
                                        ),
                                        text(addedCode.split(".world")[1]),
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
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-removed-highlight",
                                                ),
                                            ],
                                            [text(".hello")],
                                        ),
                                        text(removedCode.split(".hello")[1]),
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

export function testViewDiffHighlightsNestedValueInsideMediaBlock() {
    const removed = parseCss(`
@media (max-width: 600px) {
	.hello {
		width: 20px;
	}
}`);
    const added = parseCss(`
@media (max-width: 600px) {
	.hello {
		width: 24px;
	}
}`);

    const diff: Diff<typeof added> = {
        diffs: [
            {
                path: "0->0->attributes{width}",
                added,
                removed,
            },
        ],
    };

    const addedCode = generated(`
@media (max-width: 600px) {
	.hello {
		width: 24px;
	}
}`);
    const removedCode = generated(`
@media (max-width: 600px) {
	.hello {
		width: 20px;
	}
}`);

    deepStrictEqual(
        css.viewDiff(diff),
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
                                            "0: @media (max-width: 600px)\n  0: .hello\n    property: width",
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
                                        text(addedCode.split("24px")[0]),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-added-highlight",
                                                ),
                                            ],
                                            [text("24px")],
                                        ),
                                        text(addedCode.split("24px")[1]),
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
                                        text(removedCode.split("20px")[0]),
                                        span(
                                            [],
                                            [
                                                class_(
                                                    "coed-view-diff-removed-highlight",
                                                ),
                                            ],
                                            [text("20px")],
                                        ),
                                        text(removedCode.split("20px")[1]),
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
