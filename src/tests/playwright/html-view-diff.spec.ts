import { expect, test, type Page } from "@playwright/test";
import {
    attribute,
    class_,
    div,
    flatRender,
    span,
    style_,
    text,
    type HtmlNode,
} from "../../coed.ts";
import { defaultViewDiffCss } from "../../langs/diffs/viewDiffCss.ts";
import { html } from "../../langs/html/index.ts";
import type { Diff } from "../../langs/types.ts";

function renderDiffHtml(diff: Diff<HtmlNode<unknown>>): string {
    return flatRender(html.viewDiff(diff));
}

function pageHtml(diff: Diff<HtmlNode<unknown>>): string {
    return `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <style>
            :root {
                --bg: #f4f7fb;
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                background: linear-gradient(180deg, #ffffff 0%, var(--bg) 80%);
                color: var(--text);
                font-family: "Iosevka", "Cascadia Code", "Fira Code", monospace;
                padding: 24px;
            }

            .coed-view-diff {
                max-width: 1100px;
                margin: 0 auto;
            }

            ${defaultViewDiffCss}
        </style>
    </head>
    <body>
        ${renderDiffHtml(diff)}
    </body>
</html>`;
}

async function expectDiffScreenshot(
    page: Page,
    diff: Diff<HtmlNode<unknown>>,
    fileName: string,
) {
    await page.setContent(pageHtml(diff));

    await expect(page.locator(".coed-view-diff")).toHaveScreenshot(fileName, {
        animations: "disabled",
        caret: "hide",
        scale: "css",
        threshold: 0.3,
    });
}

test("html viewDiff renders semantic highlights", async ({ page }) => {
    const textRemoved = div([], [], [text("hello")]);
    const textAdded = div([], [], [text("world")]);

    const attrRemoved = div([], [attribute("id", "left")], []);
    const attrAdded = div([], [attribute("id", "right")], []);

    const tagRemoved = div([], [attribute("id", "x")], []);
    const tagAdded = span([], [attribute("id", "x")], []);

    const diff = {
        diffs: [
            {
                path: "0.0",
                removed: textRemoved,
                added: textAdded,
            },
            {
                path: "0->attributes{id}",
                removed: attrRemoved,
                added: attrAdded,
            },
            {
                path: "0",
                removed: tagRemoved,
                added: tagAdded,
            },
        ],
    };

    await expectDiffScreenshot(page, diff, "html-view-diff-highlights.png");
});

test("html viewDiff renders deeply nested html changes", async ({ page }) => {
    const removed = div(
        [],
        [class_("root")],
        [
            div(
                [],
                [],
                [
                    div(
                        [],
                        [],
                        [
                            span(
                                [],
                                [attribute("data-state", "open")],
                                [text("inner")],
                            ),
                        ],
                    ),
                ],
            ),
        ],
    );

    const added = div(
        [],
        [class_("root")],
        [
            div(
                [],
                [],
                [
                    div(
                        [],
                        [],
                        [
                            span(
                                [],
                                [attribute("data-state", "closed")],
                                [text("inside")],
                            ),
                        ],
                    ),
                ],
            ),
        ],
    );

    const diff: Diff<HtmlNode<unknown>> = {
        diffs: [
            {
                path: "0.0.0.0->attributes{data-state}",
                removed,
                added,
            },
            {
                path: "0.0.0.0.0",
                removed,
                added,
            },
        ],
    };

    await expectDiffScreenshot(page, diff, "html-view-diff-deeply-nested.png");
});

test("html viewDiff renders quoted and style attribute changes", async ({
    page,
}) => {
    const removed = div(
        [],
        [
            attribute("title", 'She said "hello"'),
            style_("color", "red"),
            attribute("data-mode", "legacy"),
        ],
        [],
    );

    const added = div(
        [],
        [
            attribute("title", 'She said "goodbye"'),
            style_("color", "blue"),
            attribute("data-mode", "modern"),
        ],
        [],
    );

    const diff: Diff<HtmlNode<unknown>> = {
        diffs: [
            {
                path: "0->attributes{title}",
                removed,
                added,
            },
            {
                path: "0->attributes{style}",
                removed,
                added,
            },
            {
                path: "0->attributes{data-mode}",
                removed,
                added,
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "html-view-diff-attribute-variants.png",
    );
});

test("html viewDiff renders mixed sibling and nested changes", async ({
    page,
}) => {
    const removed = div(
        [],
        [class_("container")],
        [
            span([], [attribute("id", "first")], [text("alpha")]),
            div(
                [],
                [],
                [span([], [attribute("data-kind", "left")], [text("beta")])],
            ),
        ],
    );

    const added = div(
        [],
        [class_("container")],
        [
            span([], [attribute("id", "first")], [text("alpha-updated")]),
            div(
                [],
                [],
                [span([], [attribute("data-kind", "right")], [text("beta")])],
            ),
        ],
    );

    const diff: Diff<HtmlNode<unknown>> = {
        diffs: [
            {
                path: "0.0.0",
                removed,
                added,
            },
            {
                path: "0.1.0->attributes{data-kind}",
                removed,
                added,
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "html-view-diff-mixed-nested-sibling.png",
    );
});
