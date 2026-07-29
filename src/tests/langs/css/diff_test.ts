import { deepStrictEqual } from "assert/strict";
import { css } from "../../../langs/css/index.ts";

function parseCss(input: string) {
    const parsed = css.parse(input.trim());
    deepStrictEqual(parsed.kind, "Ok");
    return parsed.value;
}

export function testDiffClassToTag() {
    const left = `.hello {
    width: 20px;
}`;
    const right = `.goodbye {
    width: 20px;
}`;

    const parsedLeft = css.parse(left);
    const parsedRight = css.parse(right);

    deepStrictEqual(parsedLeft.kind, "Ok");
    deepStrictEqual(parsedRight.kind, "Ok");

    deepStrictEqual(css.diff(parsedLeft.value, parsedRight.value), {
        diffs: [
            {
                added: [parsedRight.value[0]],
                removed: [parsedLeft.value[0]],
                path: "0",
            },
        ],
    });
}

export function testDiffNoChangesReturnsNoDiffs() {
    const input = `
.hello {
    width: 20px;
}`;

    const parsed = parseCss(input);

    deepStrictEqual(css.diff(parsed, parsed), {
        diffs: [],
    });
}

export function testDiffPropertyValueChange() {
    const left = parseCss(`
.hello {
    width: 20px;
}`);
    const right = parseCss(`
.hello {
    width: 30px;
}`);

    deepStrictEqual(css.diff(left, right), {
        diffs: [
            {
                path: "0->attributes{width}",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}

export function testDiffPropertyOrderChangeWithUniqueKeysIsIgnored() {
    const left = parseCss(`
.hello {
    width: 20px;
    height: 10px;
}`);
    const right = parseCss(`
.hello {
    height: 10px;
    width: 20px;
}`);

    deepStrictEqual(css.diff(left, right), {
        diffs: [],
    });
}

export function testDiffPropertyOrderWithDuplicateKeysCountsAsDiff() {
    const left = parseCss(`
.hello {
    width: 20px;
    width: 40px;
}`);
    const right = parseCss(`
.hello {
    width: 40px;
    width: 20px;
}`);

    deepStrictEqual(css.diff(left, right), {
        diffs: [
            {
                path: "0->attributes{width}",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}

export function testDiffAddsTrailingBlock() {
    const left = parseCss(`
.hello {
    width: 20px;
}`);
    const right = parseCss(`
.hello {
    width: 20px;
}

.world {
    height: 100vh;
}`);

    deepStrictEqual(css.diff(left, right), {
        diffs: [
            {
                path: "1",
                added: [right[1]],
                removed: [],
            },
        ],
    });
}

export function testDiffRemovesTrailingBlock() {
    const left = parseCss(`
.hello {
    width: 20px;
}

.world {
    height: 100vh;
}`);
    const right = parseCss(`
.hello {
    width: 20px;
}`);

    deepStrictEqual(css.diff(left, right), {
        diffs: [
            {
                path: "1",
                added: [],
                removed: [left[1]],
            },
        ],
    });
}

export function testDiffMultipleBlocksChangedAndAdded() {
    const left = parseCss(`
.one {
    width: 10px;
}

.two {
    height: 20px;
}`);

    const right = parseCss(`
.one {
    width: 15px;
}

.two {
    height: 25px;
}

.three {
    display: block;
}`);

    deepStrictEqual(css.diff(left, right), {
        diffs: [
            {
                path: "0->attributes{width}",
                added: [right[0]],
                removed: [left[0]],
            },
            {
                path: "1->attributes{height}",
                added: [right[1]],
                removed: [left[1]],
            },
            {
                path: "2",
                added: [right[2]],
                removed: [],
            },
        ],
    });
}

export function testDiffMediaQueryBodyChange() {
    const left = parseCss(`
@media (max-width: 600px) {
    .hello {
        width: 20px;
    }
}`);

    const right = parseCss(`
@media (max-width: 600px) {
    .hello {
        width: 24px;
    }
}`);

    deepStrictEqual(css.diff(left, right), {
        diffs: [
            {
                path: "0->0->attributes{width}",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}

export function testDiffSecondRulePropertyPath() {
    const left = parseCss(`
.hello {
    width: 20px;
}

.world {
    height: 100vh;
}`);

    const right = parseCss(`
.hello {
    width: 20px;
}

.world {
    height: 80vh;
}`);

    deepStrictEqual(css.diff(left, right), {
        diffs: [
            {
                path: "1->attributes{height}",
                added: [right[1]],
                removed: [left[1]],
            },
        ],
    });
}

export function testDiffNestedMediaSecondRulePropertyPath() {
    const left = parseCss(`
@media (max-width: 600px) {
    .hello {
        width: 20px;
    }

    .world {
        height: 100vh;
    }
}`);

    const right = parseCss(`
@media (max-width: 600px) {
    .hello {
        width: 20px;
    }

    .world {
        height: 90vh;
    }
}`);

    deepStrictEqual(css.diff(left, right), {
        diffs: [
            {
                path: "0->1->attributes{height}",
                added: [right[0]],
                removed: [left[0]],
            },
        ],
    });
}
