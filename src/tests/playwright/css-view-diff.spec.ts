import { expect, test, type Page } from "@playwright/test";
import { deepStrictEqual } from "assert";
import { flatRender } from "../../coed.ts";
import { css } from "../../langs/css/index.ts";
import type { CssBlock } from "../../langs/css/types.ts";
import { defaultViewDiffCss } from "../../langs/diffs/viewDiffCss.ts";
import type { Diff } from "../../langs/types.ts";

function parseCss(input: string): CssBlock[] {
    const parsed = css.parse(input.trim());

    deepStrictEqual(parsed.kind, "Ok");
    return parsed.value;
}

function makeEntry(path: string, removedCss: string, addedCss: string) {
    return {
        path,
        removed: parseCss(removedCss),
        added: parseCss(addedCss),
    };
}

function renderDiffHtml(diff: Diff<CssBlock[]>): string {
    return flatRender(css.viewDiff(diff));
}

function pageHtml(diff: Diff<CssBlock[]>): string {
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
    diff: Diff<CssBlock[]>,
    fileName: string,
) {
    await page.setContent(pageHtml(diff));

    await expect(page.locator(".coed-view-diff")).toHaveScreenshot(fileName, {
        animations: "disabled",
        caret: "hide",
        scale: "css",
    });
}

test("css viewDiff renders value, property, and selector changes", async ({
    page,
}) => {
    const diff: Diff<CssBlock[]> = {
        diffs: [
            makeEntry(
                "0->attributes{width}",
                `
.hello {
    width: 20px;
}
                `,
                `
.hello {
    width: 30px;
}
                `,
            ),
            makeEntry(
                "0->attributes{height}",
                `
.hello {
    width: 20px;
}
                `,
                `
.hello {
    width: 20px;
    height: 10px;
}
                `,
            ),
            makeEntry(
                "0",
                `
.hello {
    width: 20px;
}
                `,
                `
.world {
    width: 20px;
}
                `,
            ),
        ],
    };

    await expectDiffScreenshot(page, diff, "css-view-diff-highlights.png");
});

test("css viewDiff renders nested media query value change", async ({
    page,
}) => {
    const diff: Diff<CssBlock[]> = {
        diffs: [
            makeEntry(
                "0->0->attributes{height}",
                `
@media (min-width: 768px) {
    .hello {
        width: 20px;
        height: 20vh;
    }
}
                `,
                `
@media (min-width: 768px) {
    .hello {
        width: 20px;
        height: 30vh;
    }
}
                `,
            ),
        ],
    };

    await expectDiffScreenshot(page, diff, "css-view-diff-nested-media.png");
});

test("css viewDiff falls back to block highlight for duplicate properties", async ({
    page,
}) => {
    const diff: Diff<CssBlock[]> = {
        diffs: [
            makeEntry(
                "0->attributes{width}",
                `
.hello {
    width: 20px;
    width: 40px;
}
                `,
                `
.hello {
    width: 40px;
    width: 20px;
}
                `,
            ),
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "css-view-diff-duplicate-property-fallback.png",
    );
});

test("css viewDiff renders multi-entry mixed diffs", async ({ page }) => {
    const diff: Diff<CssBlock[]> = {
        diffs: [
            makeEntry(
                "0->attributes{padding}",
                `
.shell {
    padding: 12px;
    margin: 0 auto;
}
                `,
                `
.shell {
    padding: 20px;
    margin: 0 auto;
}
                `,
            ),
            makeEntry(
                "1",
                `
.panel {
    border: 1px solid black;
}
                `,
                `
.card {
    border: 1px solid black;
}
                `,
            ),
            makeEntry(
                "2->attributes{display}",
                `
.footer {
    color: red;
}
                `,
                `
.footer {
    color: red;
    display: block;
}
                `,
            ),
        ],
    };

    await expectDiffScreenshot(page, diff, "css-view-diff-mixed-entries.png");
});
