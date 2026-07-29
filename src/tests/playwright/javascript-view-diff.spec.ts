import { expect, test, type Page } from "@playwright/test";
import { deepStrictEqual } from "assert";
import * as fs from "fs";
import { join } from "path";
import { flatRender } from "../../coed.ts";
import { defaultViewDiffCss } from "../../langs/diffs/viewDiffCss.ts";
import { javascript } from "../../langs/javascript/index.ts";
import type { Program } from "../../langs/javascript/types.ts";
import type { Diff } from "../../langs/types.ts";

const quizScriptPath = join(
    process.cwd(),
    "src/tests/langs/real_examples/dinosaur_quiz/web/script.js",
);

function parseProgram(input: string): Program {
    const parsed = javascript.parse(input);
    deepStrictEqual(parsed.kind, "Ok");
    return parsed.value;
}

function renderDiffHtml(diff: Diff<Program>): string {
    return flatRender(javascript.viewDiff(diff));
}

function modifiedQuizScript(original: string): string {
    return original
        .replace('answer: "Triceratops",', 'answer: "Stegosaurus",')
        .replace(
            'q: "Which dinosaur had a long neck?",',
            'q: "Which dinosaur had large back plates?",',
        )
        .replace('"Spinosaurus"', '"Diplodocus"');
}

function pageHtml(diff: Diff<Program>): string {
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
    diff: Diff<Program>,
    fileName: string,
) {
    await page.setContent(pageHtml(diff));

    await expect(page.locator(".coed-view-diff")).toHaveScreenshot(fileName, {
        animations: "disabled",
        caret: "hide",
        scale: "css",
        threshold: 0.2,
    });
}

test("javascript viewDiff renders semantic highlights", async ({ page }) => {
    const diff: Diff<Program> = {
        diffs: [
            {
                path: "0->value->value",
                removed: parseProgram("const count = 1;"),
                added: parseProgram("const count = 2;"),
            },
            {
                path: "0->value->properties{b}->value",
                removed: parseProgram('const data = { "a": 1, "b": 2 };'),
                added: parseProgram('const data = { "a": 1, "b": 3 };'),
            },
            {
                path: "0->value->properties{c}",
                removed: parseProgram('const data = { "a": 1 };'),
                added: parseProgram('const data = { "a": 1, "c": 3 };'),
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "javascript-view-diff-highlights.png",
    );
});

test("javascript viewDiff renders nested function body path", async ({
    page,
}) => {
    const diff: Diff<Program> = {
        diffs: [
            {
                path: "0->body->0->value->right->name",
                removed: parseProgram("function sum(a, b) { let x = a + b; }"),
                added: parseProgram("function sum(a, b) { let x = a + c; }"),
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "javascript-view-diff-nested-function.png",
    );
});

test("javascript viewDiff renders mixed multi-entry changes", async ({
    page,
}) => {
    const diff: Diff<Program> = {
        diffs: [
            {
                path: "0->value->value",
                removed: parseProgram("const count = 10;"),
                added: parseProgram("const count = 12;"),
            },
            {
                path: "0->value->properties{status}",
                removed: parseProgram('const payload = { "status": "draft" };'),
                added: parseProgram(
                    'const payload = { "status": "published" };',
                ),
            },
            {
                path: "0->body->0->value->left->name",
                removed: parseProgram(
                    "function sum(a, b) { const x = a + b; }",
                ),
                added: parseProgram("function sum(a, b) { const x = c + b; }"),
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "javascript-view-diff-mixed-entries.png",
    );
});

test("javascript viewDiff highlights function declaration name change", async ({
    page,
}) => {
    const diff: Diff<Program> = {
        diffs: [
            {
                path: "0->name",
                removed: parseProgram("function start() { return 1; }"),
                added: parseProgram("function boot() { return 1; }"),
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "javascript-view-diff-function-name.png",
    );
});

test("javascript viewDiff highlights property-map key removal", async ({
    page,
}) => {
    const diff: Diff<Program> = {
        diffs: [
            {
                path: "0->value->properties{legacy}",
                removed: parseProgram(
                    'const flags = { "legacy": true, "stable": true };',
                ),
                added: parseProgram('const flags = { "stable": true };'),
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "javascript-view-diff-property-key-removal.png",
    );
});

test("javascript viewDiff renders nested property-map primitive value changes", async ({
    page,
}) => {
    const diff: Diff<Program> = {
        diffs: [
            {
                path: "0->value->properties{config}->properties{theme}",
                removed: parseProgram(
                    'const app = { "config": { "theme": "light", "size": "md" } };',
                ),
                added: parseProgram(
                    'const app = { "config": { "theme": "dark", "size": "md" } };',
                ),
            },
            {
                path: "0->value->properties{config}->properties{enabled}",
                removed: parseProgram(
                    'const app = { "config": { "enabled": null } };',
                ),
                added: parseProgram(
                    'const app = { "config": { "enabled": true } };',
                ),
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "javascript-view-diff-nested-property-values.png",
    );
});

test("javascript viewDiff renders real-example inspired nested diffs", async ({
    page,
}) => {
    const diff: Diff<Program> = {
        diffs: [
            {
                path: "0->value->elements->0->properties{answer}",
                removed: parseProgram(
                    'const questions = [{ "q": "Which dinosaur had a long neck?", "options": ["Brachiosaurus", "Stegosaurus", "Spinosaurus"], "answer": "Brachiosaurus" }];',
                ),
                added: parseProgram(
                    'const questions = [{ "q": "Which dinosaur had a long neck?", "options": ["Brachiosaurus", "Stegosaurus", "Spinosaurus"], "answer": "Stegosaurus" }];',
                ),
            },
            {
                path: "0->value->elements->0->properties{power}->value",
                removed: parseProgram(
                    'const moves = [{ "name": "Claw Slash", "power": 40, "accuracy": 0.9 }];',
                ),
                added: parseProgram(
                    'const moves = [{ "name": "Claw Slash", "power": 50, "accuracy": 0.9 }];',
                ),
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "javascript-view-diff-real-example-nested.png",
    );
});

test("javascript viewDiff renders full real-example file with multiple diffs", async ({
    page,
}) => {
    const removedScript = fs.readFileSync(quizScriptPath, "utf-8");
    const addedScript = modifiedQuizScript(removedScript);

    const removed = parseProgram(removedScript);
    const added = parseProgram(addedScript);

    const diff: Diff<Program> = {
        diffs: [
            {
                path: "0->value->elements->0->properties{answer}",
                removed,
                added,
            },
            {
                path: "0->value->elements->1->properties{q}",
                removed,
                added,
            },
            {
                path: "0->value->elements->1->properties{options}->elements->2->value",
                removed,
                added,
            },
        ],
    };

    await expectDiffScreenshot(
        page,
        diff,
        "javascript-view-diff-full-real-file-multi-entry.png",
    );
});
