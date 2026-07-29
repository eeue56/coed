import { deepStrictEqual } from "assert";
import * as fs from "fs";
import { join } from "path";
import { javascript } from "../../../../langs/javascript/index.ts";

const rootPath = "src/tests/langs/real_examples/dino_game";

const jsString = fs.readFileSync(
    join(process.cwd(), rootPath, "web/index.js"),
    "utf-8",
);

export function testParseJs() {
    const parsedJs = javascript.parse(jsString);
    deepStrictEqual(parsedJs.kind, "Ok");
}

export async function snapshotGeneratedJs() {
    const parsedJs = javascript.parse(jsString);
    deepStrictEqual(parsedJs.kind, "Ok");
    return javascript.generate(parsedJs.value);
}

export async function snapshotParsedJs() {
    return javascript.parse(jsString);
}

export async function snapshotFilteredJs() {
    const parsedJs = javascript.parse(jsString);
    deepStrictEqual(parsedJs.kind, "Ok");

    const filtered = javascript.filter(
        [
            {
                shouldKeep: (node) => {
                    if (
                        node.kind === "ObjectMethodCallExpression" &&
                        node.object.kind == "NameLookupExpression" &&
                        node.object.name === "document"
                    ) {
                        return false;
                    }
                    return true;
                },
                reason: "No method calls on document",
            },
        ],
        parsedJs.value,
    );
    return filtered;
}
