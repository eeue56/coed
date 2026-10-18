import { deepStrictEqual } from "assert";
import { css, type CssBlock } from "../../../langs/css/index.ts";

export function testInsertion() {
    const firstParsedCss = css.parse(
        `
.hello {
    width: 20px;
}

.goodbye {
    height: 30px;
}`.trim(),
    );

    const secondParsedCss = css.parse(
        `
.hello {
    width: 30px;
}

.goodbye {
    height: 30px;
}`.trim(),
    );

    deepStrictEqual(firstParsedCss.kind, "Ok");
    deepStrictEqual(secondParsedCss.kind, "Ok");

    const engine = css.storage();

    engine.save(firstParsedCss.value, "first-commit-123", { label: "demo" });

    deepStrictEqual(engine.lookup(0), {
        kind: "Ok",
        value: {
            kind: "Row",
            id: 0,
            tree: firstParsedCss.value,
            commitId: "first-commit-123",
            metadata: { label: "demo" },
        },
    });

    deepStrictEqual(engine.search({ label: "demo" }), [
        {
            kind: "Row",
            id: 0,
            tree: firstParsedCss.value,
            commitId: "first-commit-123",
            metadata: { label: "demo" },
        },
    ]);

    deepStrictEqual(engine.rowCount(), 1);
    deepStrictEqual(engine.rows(), [
        {
            kind: "Row",
            id: 0,
            tree: firstParsedCss.value,
            commitId: "first-commit-123",
            metadata: { label: "demo" },
        },
    ]);

    engine.save(secondParsedCss.value, "second-commit-321", {
        label: "second demo",
    });

    deepStrictEqual(engine.rowCount(), 2);
    deepStrictEqual(engine.rows(), [
        {
            kind: "Row",
            id: 0,
            tree: firstParsedCss.value,
            commitId: "first-commit-123",
            metadata: { label: "demo" },
        },
        {
            kind: "Row",
            id: 1,
            tree: secondParsedCss.value,
            commitId: "second-commit-321",
            metadata: { label: "second demo" },
        },
    ]);

    deepStrictEqual(engine.lookup(1), {
        kind: "Ok",
        value: {
            kind: "Row",
            id: 1,
            tree: secondParsedCss.value,
            commitId: "second-commit-321",
            metadata: { label: "second demo" },
        },
    });

    deepStrictEqual(engine.diff(0, 1), {
        diffs: [
            {
                path: "0->attributes{width}",
                added: [
                    {
                        kind: "Regular",
                        selector: { kind: "Class", class: "hello" },
                        body: [
                            { kind: "Property", name: "width", value: "30px" },
                        ],
                    },
                ] as CssBlock[],
                removed: [
                    {
                        kind: "Regular",
                        selector: { kind: "Class", class: "hello" },
                        body: [
                            { kind: "Property", name: "width", value: "20px" },
                        ],
                    },
                ] as CssBlock[],
            },
        ],
    });
}
