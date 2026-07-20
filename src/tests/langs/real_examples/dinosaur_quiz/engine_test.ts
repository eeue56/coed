import { deepStrictEqual } from "assert";
import fs from "fs";
import { join } from "path";
import type { HtmlNode } from "../../../../coed.ts";
import { Storage } from "../../../../langs/engine.ts";
import { html } from "../../../../langs/html/index.ts";

const rootPath = "src/tests/langs/real_examples/dinosaur_quiz";
const htmlString = fs.readFileSync(
    join(process.cwd(), rootPath, "web/index.html"),
    "utf-8",
);

export function testHtml() {
    const parsedHtml = html.parse(htmlString);
    deepStrictEqual(parsedHtml.kind, "Ok");

    const htmlStorage = Storage<HtmlNode<unknown>>();

    htmlStorage.save(parsedHtml.value, "Make me a quiz about dinosaurs", []);

    deepStrictEqual(htmlStorage.rowCount(), 1);

    const withoutNewlines = html.filter(
        [
            {
                shouldKeep: (node: HtmlNode<unknown>) => {
                    if (
                        node.kind === "text" &&
                        (node.text === "\n" || node.text === "\n\n")
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "Remove pointless newlines",
            },
        ],
        parsedHtml.value,
    );
    htmlStorage.save(
        withoutNewlines.value,
        "Remove newlines",
        withoutNewlines.errors,
    );
    deepStrictEqual(htmlStorage.rowCount(), 2);

    deepStrictEqual(htmlStorage.lookup(0), {
        kind: "Ok",
        value: {
            kind: "Row",
            id: 0,
            label: "Make me a quiz about dinosaurs",
            feedbackGiven: [],
            tree: parsedHtml.value,
            timesUsed: 0,
        },
    });

    deepStrictEqual(htmlStorage.lookup(1), {
        kind: "Ok",
        value: {
            kind: "Row",
            id: 1,
            label: "Remove newlines",
            feedbackGiven: withoutNewlines.errors,
            tree: withoutNewlines.value,
            timesUsed: 0,
        },
    });

    deepStrictEqual(htmlStorage.lookup(2), {
        kind: "Err",
        error: "Not found",
    });

    deepStrictEqual(htmlStorage.search("newlines"), [
        {
            kind: "Row",
            id: 1,
            label: "Remove newlines",
            feedbackGiven: withoutNewlines.errors,
            tree: withoutNewlines.value,
            timesUsed: 0,
        },
    ]);
}
