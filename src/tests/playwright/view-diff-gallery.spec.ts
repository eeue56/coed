import { expect, test, type Page } from "@playwright/test";
import { deepStrictEqual } from "assert";
import { attribute, class_, div, flatRender } from "../../coed.ts";
import { css } from "../../langs/css/index.ts";
import type { CssBlock } from "../../langs/css/types.ts";
import { defaultViewDiffCss } from "../../langs/diffs/viewDiffCss.ts";
import { html } from "../../langs/html/index.ts";
import { javascript } from "../../langs/javascript/index.ts";
import type { Program } from "../../langs/javascript/types.ts";
import type { Diff } from "../../langs/types.ts";

function parseCss(input: string): CssBlock[] {
    const parsed = css.parse(input.trim());
    deepStrictEqual(parsed.kind, "Ok");
    return parsed.value;
}

function parseProgram(input: string): Program {
    const parsed = javascript.parse(input);
    deepStrictEqual(parsed.kind, "Ok");
    return parsed.value;
}

function cssDiffHtml(): string {
    const removed = parseCss(`
.hello {
    width: 20px;
    height: 10px;
}`);
    const added = parseCss(`
.hello {
    width: 30px;
    height: 12px;
}`);

    const diff: Diff<CssBlock[]> = {
        diffs: [
            {
                path: "0->attributes{width}",
                removed,
                added,
            },
            {
                path: "0->attributes{height}",
                removed,
                added,
            },
        ],
    };

    return flatRender(css.viewDiff(diff));
}

function htmlDiffHtml(): string {
    const removed = div([], [attribute("id", "left"), class_("a")], []);
    const added = div([], [attribute("id", "right"), class_("b")], []);

    const diff = {
        diffs: [
            {
                path: "0->attributes{id}",
                removed,
                added,
            },
            {
                path: "0->attributes{class}",
                removed,
                added,
            },
        ],
    };

    return flatRender(html.viewDiff(diff));
}

function javascriptDiffHtml(): string {
    const removed = parseProgram('const data = { "a": 1, "b": 2 };');
    const added = parseProgram('const data = { "a": 3, "b": 4 };');

    const diff: Diff<Program> = {
        diffs: [
            {
                path: "0->value->properties{a}->value",
                removed,
                added,
            },
            {
                path: "0->value->properties{b}->value",
                removed,
                added,
            },
        ],
    };

    return flatRender(javascript.viewDiff(diff));
}

function pageHtml(): string {
    return `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <style>
            :root {
                --bg: #f4f7fb;
                --panel: #ffffff;
                --ink: #1f2937;
                --muted: #5b6574;
                --border: #d6dee8;
            }

            html {
                overflow-y: scroll;
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                padding: 28px;
                background:
                    radial-gradient(circle at 15% 15%, #eaf2ff 0%, transparent 35%),
                    radial-gradient(circle at 85% 0%, #edf7f2 0%, transparent 40%),
                    linear-gradient(180deg, #ffffff 0%, var(--bg) 75%);
                color: var(--ink);
                font-family: "Iosevka", "Cascadia Code", "Fira Code", monospace;
            }

            .gallery {
                max-width: 1240px;
                margin: 0 auto;
                display: grid;
                gap: 14px;
            }

            .gallery-head {
                background: var(--panel);
                border: 1px solid var(--border);
                border-radius: 10px;
                padding: 14px 16px;
            }

            .gallery-title {
                margin: 0;
                font-size: 18px;
            }

            .gallery-subtitle {
                margin: 8px 0 0;
                color: var(--muted);
                font-size: 13px;
            }

            .gallery-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 14px;
            }

            .panel {
                background: var(--panel);
                border: 1px solid var(--border);
                border-radius: 10px;
                padding: 12px;
            }

            .panel > h2 {
                margin: 0 0 10px;
                font-size: 13px;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: var(--muted);
            }

            .panel .coed-view-diff {
                max-width: 100%;
            }

            ${defaultViewDiffCss}
        </style>
    </head>
    <body>
        <main class="gallery">
            <header class="gallery-head">
                <h1 class="gallery-title">Compacted ViewDiff Gallery</h1>
                <p class="gallery-subtitle">Each panel shows sibling child diffs compacted into one parent-level visual entry.</p>
            </header>
            <section class="gallery-grid">
                <article class="panel" data-kind="css">
                    <h2>CSS</h2>
                    ${cssDiffHtml()}
                </article>
                <article class="panel" data-kind="html">
                    <h2>HTML</h2>
                    ${htmlDiffHtml()}
                </article>
                <article class="panel" data-kind="javascript">
                    <h2>JavaScript</h2>
                    ${javascriptDiffHtml()}
                </article>
            </section>
        </main>
    </body>
</html>`;
}

async function expectGalleryScreenshot(page: Page, fileName: string) {
    await page.setContent(pageHtml());

    await expect(page.locator(".gallery")).toHaveScreenshot(fileName, {
        animations: "disabled",
        caret: "hide",
        scale: "css",
        threshold: 0.3,
    });
}

test("viewDiff gallery renders compacted summaries across languages", async ({
    page,
}) => {
    await expectGalleryScreenshot(page, "view-diff-compacted-gallery.png");
});
