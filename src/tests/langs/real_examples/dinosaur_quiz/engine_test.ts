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

    htmlStorage.save(parsedHtml.value, "first-commit-1", {
        "feedback-given": [],
    });

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
    htmlStorage.save(withoutNewlines.value, "first-commit-2", {
        "feedback-given": withoutNewlines.errors,
    });
    deepStrictEqual(htmlStorage.rowCount(), 2);

    deepStrictEqual(htmlStorage.lookup(0), {
        kind: "Ok",
        value: {
            kind: "Row",
            id: 0,
            commitId: "first-commit-1",
            metadata: { "feedback-given": [] },
            tree: parsedHtml.value,
        },
    });

    deepStrictEqual(htmlStorage.lookup(1), {
        kind: "Ok",
        value: {
            kind: "Row",
            id: 1,
            commitId: "first-commit-2",
            metadata: {
                "feedback-given": withoutNewlines.errors,
            },
            tree: withoutNewlines.value,
        },
    });

    deepStrictEqual(htmlStorage.lookup(2), {
        kind: "Err",
        error: "Not found",
    });

    deepStrictEqual(
        htmlStorage.search({ "feedback-given": withoutNewlines.errors }),
        [
            {
                kind: "Row",
                id: 1,
                commitId: "first-commit-2",
                metadata: { "feedback-given": withoutNewlines.errors },
                tree: withoutNewlines.value,
            },
        ],
    );

    deepStrictEqual(htmlStorage.lookupCommit("first-commit-1"), {
        kind: "Ok",
        value: {
            kind: "Row",
            id: 0,
            commitId: "first-commit-1",
            metadata: { "feedback-given": [] },
            tree: parsedHtml.value,
        },
    });

    deepStrictEqual(htmlStorage.lookupCommit("first-commit-2"), {
        kind: "Ok",
        value: {
            kind: "Row",
            id: 1,
            commitId: "first-commit-2",
            metadata: { "feedback-given": withoutNewlines.errors },
            tree: withoutNewlines.value,
        },
    });
}
