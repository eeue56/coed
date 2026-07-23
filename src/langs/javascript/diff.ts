import type { Diff } from "../types.ts";
import type { JsNode } from "./types.ts";

function isSameValue(left: unknown, right: unknown): boolean {
    if (left === right) {
        return true;
    }

    if (typeof left !== typeof right) {
        return false;
    }

    if (left === null || right === null) {
        return false;
    }

    if (Array.isArray(left)) {
        if (!Array.isArray(right) || left.length !== right.length) {
            return false;
        }

        for (let i = 0; i < left.length; i++) {
            if (!isSameValue(left[i], right[i])) {
                return false;
            }
        }

        return true;
    }

    if (Array.isArray(right)) {
        return false;
    }

    if (typeof left !== "object") {
        return false;
    }

    if (typeof right !== "object") {
        return false;
    }

    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);

    if (leftKeys.length !== rightKeys.length) {
        return false;
    }

    for (const key of leftKeys) {
        if (!rightKeys.includes(key)) {
            return false;
        }

        if (!isSameValue(leftRecord[key], rightRecord[key])) {
            return false;
        }
    }

    return true;
}

/**
 * todo: semantic aware diffing, this is okay for a first pass
 */
function diffNode(left: JsNode, right: JsNode, path: string): Diff<JsNode> {
    if (isSameValue(left, right)) {
        return { diffs: [] };
    }

    return {
        diffs: [
            {
                path,
                added: right,
                removed: left,
            },
        ],
    };
}

export function diff(left: JsNode[], right: JsNode[]): Diff<JsNode[]> {
    const added: JsNode[] = [];
    const removed: JsNode[] = [];
    let path = "0";
    let hasDiff = false;

    const sharedLength = Math.min(left.length, right.length);

    for (let i = 0; i < sharedLength; i++) {
        const nodeDiff = diffNode(left[i], right[i], String(i));

        if (nodeDiff.diffs.length === 0) {
            continue;
        }

        if (!hasDiff) {
            path = String(i);
            hasDiff = true;
        }

        removed.push(left[i]);
        added.push(right[i]);
    }

    if (right.length > left.length) {
        if (!hasDiff) {
            path = String(left.length);
            hasDiff = true;
        }

        added.push(...right.slice(left.length));
    }

    if (left.length > right.length) {
        if (!hasDiff) {
            path = String(right.length);
            hasDiff = true;
        }

        removed.push(...left.slice(right.length));
    }

    if (!hasDiff) {
        return { diffs: [] };
    }

    return {
        diffs: [
            {
                path,
                added,
                removed,
            },
        ],
    };
}
