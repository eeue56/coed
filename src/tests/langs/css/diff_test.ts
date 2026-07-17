import { deepStrictEqual } from "assert/strict";
import { css } from "../../../langs/css/index.ts";

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

    deepStrictEqual(css._diff(parsedLeft.value, parsedRight.value), {
        added: parsedRight.value,
        removed: parsedLeft.value,
    });
}
