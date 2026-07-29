import { strict as assert } from "assert";
import * as fs from "fs";
import { join } from "path";
import { flatRender } from "../../../coed.ts";
import { javascript } from "../../../langs/javascript/index.ts";
import type { Program } from "../../../langs/javascript/types.ts";
import type { Diff } from "../../../langs/types.ts";

const quizScriptPath = join(
    process.cwd(),
    "src/tests/langs/real_examples/dinosaur_quiz/web/script.js",
);

function parseProgram(input: string): Program {
    const parsed = javascript.parse(input);

    if (parsed.kind !== "Ok") {
        throw new Error(parsed.error);
    }

    return parsed.value;
}

function renderDiff(diff: Diff<Program>): string {
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

export function testViewDiffEmptyReturnsContainer() {
    const rendered = renderDiff({ diffs: [] });

    assert.strictEqual(rendered, '<div class="coed-view-diff"></div>');
}

export function testViewDiffHighlightsPrimitiveValueChange() {
    const removed = parseProgram("const count = 1;");
    const added = parseProgram("const count = 2;");

    const rendered = renderDiff({
        diffs: [
            {
                path: "0->value->value",
                removed,
                added,
            },
        ],
    });

    assert.strictEqual(rendered.includes("0: const"), true);
    assert.strictEqual(rendered.includes("value: number"), true);
    assert.strictEqual(rendered.includes("value: 2 (was 1)"), true);
    assert.strictEqual(
        rendered.includes('coed-view-diff-added-highlight">2</span>'),
        true,
    );
    assert.strictEqual(
        rendered.includes('coed-view-diff-removed-highlight">1</span>'),
        true,
    );
}

export function testViewDiffHighlightsObjectPropertyMapValueChange() {
    const removed = parseProgram('const data = { "a": 1, "b": 2 };');
    const added = parseProgram('const data = { "a": 1, "b": 3 };');

    const rendered = renderDiff({
        diffs: [
            {
                path: "0->value->properties{b}->value",
                removed,
                added,
            },
        ],
    });

    assert.strictEqual(rendered.includes("properties{b}: number"), true);
    assert.strictEqual(rendered.includes("value: 3 (was 2)"), true);
    assert.strictEqual(
        rendered.includes('coed-view-diff-added-highlight">3</span>'),
        true,
    );
}

export function testViewDiffHighlightsPropertyMapKeyWhenAdded() {
    const removed = parseProgram('const data = { "a": 1 };');
    const added = parseProgram('const data = { "a": 1, "b": 2 };');

    const rendered = renderDiff({
        diffs: [
            {
                path: "0->value->properties{b}",
                removed,
                added,
            },
        ],
    });

    assert.strictEqual(rendered.includes("properties{b}: number"), true);
    assert.strictEqual(
        rendered.includes('coed-view-diff-added-highlight">"b"</span>'),
        true,
    );
}

export function testViewDiffHighlightsCorrectIdentifierOccurrence() {
    const removed = parseProgram("function sum(a, b) { let x = a + b; }");
    const added = parseProgram("function sum(a, b) { let x = a + c; }");

    const rendered = renderDiff({
        diffs: [
            {
                path: "0->body->0->value->right->name",
                removed,
                added,
            },
        ],
    });

    assert.strictEqual(
        rendered.includes(
            'a + <span class="coed-view-diff-added-highlight">c</span>;',
        ),
        true,
    );
    assert.strictEqual(
        rendered.includes(
            'fun<span class="coed-view-diff-added-highlight">c</span>tion',
        ),
        false,
    );
}

export function testViewDiffHighlightsPropertyMapPrimitiveValueChange() {
    const removed = parseProgram('const payload = { "status": "draft" };');
    const added = parseProgram('const payload = { "status": "published" };');

    const rendered = renderDiff({
        diffs: [
            {
                path: "0->value->properties{status}",
                removed,
                added,
            },
        ],
    });

    assert.strictEqual(
        rendered.includes('coed-view-diff-added-highlight">published</span>'),
        true,
    );
    assert.strictEqual(
        rendered.includes('coed-view-diff-added-highlight">"status"</span>'),
        false,
    );
}

export function testViewDiffHighlightsRemovedPropertyMapKeyAndValue() {
    const removed = parseProgram(
        'const flags = { "legacy": true, "stable": true };',
    );
    const added = parseProgram('const flags = { "stable": true };');

    const rendered = renderDiff({
        diffs: [
            {
                path: "0->value->properties{legacy}",
                removed,
                added,
            },
        ],
    });

    assert.strictEqual(
        rendered.includes(
            'coed-view-diff-removed-highlight">"legacy": true</span>',
        ),
        true,
    );
}

export function testViewDiffHighlightsQuizAnswerChangeInNestedArray() {
    const removed = parseProgram(
        'const questions = [{ "q": "Which dinosaur had a long neck?", "options": ["Brachiosaurus", "Stegosaurus", "Spinosaurus"], "answer": "Brachiosaurus" }];',
    );
    const added = parseProgram(
        'const questions = [{ "q": "Which dinosaur had a long neck?", "options": ["Brachiosaurus", "Stegosaurus", "Spinosaurus"], "answer": "Stegosaurus" }];',
    );

    const rendered = renderDiff({
        diffs: [
            {
                path: "0->value->elements->0->properties{answer}",
                removed,
                added,
            },
        ],
    });

    assert.strictEqual(
        rendered.includes('coed-view-diff-added-highlight">Stegosaurus</span>'),
        true,
    );
    assert.strictEqual(
        rendered.includes(
            'coed-view-diff-removed-highlight">Brachiosaurus</span>',
        ),
        true,
    );
}

export function testViewDiffHighlightsCorrectRepeatedPropertyValue() {
    const removed = parseProgram(
        'const questions = [{ "q": "Which dinosaur was a herbivore?", "options": ["T. rex", "Triceratops", "Velociraptor"], "answer": "Triceratops" }];',
    );
    const added = parseProgram(
        'const questions = [{ "q": "Which dinosaur was a herbivore?", "options": ["T. rex", "Triceratops", "Velociraptor"], "answer": "Stegosaurus" }];',
    );

    const rendered = renderDiff({
        diffs: [
            {
                path: "0->value->elements->0->properties{answer}",
                removed,
                added,
            },
        ],
    });

    assert.strictEqual(
        rendered.includes(
            '"answer": "<span class="coed-view-diff-added-highlight">Stegosaurus</span>"',
        ),
        true,
    );
    assert.strictEqual(
        rendered.includes(
            '"options": ["T. rex", "<span class="coed-view-diff-removed-highlight">Triceratops</span>", "Velociraptor"]',
        ),
        false,
    );
}

export function testViewDiffHighlightsDinoMovePowerChange() {
    const removed = parseProgram(
        'const moves = [{ "name": "Claw Slash", "power": 40, "accuracy": 0.9 }];',
    );
    const added = parseProgram(
        'const moves = [{ "name": "Claw Slash", "power": 50, "accuracy": 0.9 }];',
    );

    const rendered = renderDiff({
        diffs: [
            {
                path: "0->value->elements->0->properties{power}->value",
                removed,
                added,
            },
        ],
    });

    assert.strictEqual(rendered.includes("properties{power}: number"), true);
    assert.strictEqual(rendered.includes("value: 50 (was 40)"), true);
    assert.strictEqual(
        rendered.includes('coed-view-diff-added-highlight">50</span>'),
        true,
    );
    assert.strictEqual(
        rendered.includes('coed-view-diff-removed-highlight">40</span>'),
        true,
    );
}

export function testViewDiffUsesFullRealExampleFileWithMultipleEntries() {
    const removedScript = fs.readFileSync(quizScriptPath, "utf-8");
    const addedScript = modifiedQuizScript(removedScript);

    const removed = parseProgram(removedScript);
    const added = parseProgram(addedScript);

    const rendered = renderDiff({
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
    });

    assert.strictEqual(
        rendered.includes('coed-view-diff-added-highlight">Stegosaurus</span>'),
        true,
    );
    assert.strictEqual(
        rendered.includes("Which dinosaur had large back plates?"),
        true,
    );
    assert.strictEqual(
        rendered.includes('coed-view-diff-added-highlight">Diplodocus</span>'),
        true,
    );
}
