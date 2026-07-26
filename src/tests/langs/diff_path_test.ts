import { deepStrictEqual } from "assert/strict";
import {
    DIFF_PROPERTY_SEGMENT,
    appendPropertyPath,
    parsePropertySegment,
} from "../../langs/diffs/diffPath.ts";

export function testParsePropertySegmentUsesCanonicalToken() {
    deepStrictEqual(
        parsePropertySegment("attributes{width}", [DIFF_PROPERTY_SEGMENT]),
        "width",
    );
}

export function testParsePropertySegmentRejectsLegacyToken() {
    deepStrictEqual(
        parsePropertySegment("property{width}", [DIFF_PROPERTY_SEGMENT]),
        null,
    );
}

export function testAppendPropertyPathUsesCanonicalToken() {
    deepStrictEqual(
        appendPropertyPath("0", "width", DIFF_PROPERTY_SEGMENT),
        "0->attributes{width}",
    );
}
