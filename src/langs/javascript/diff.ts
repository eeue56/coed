import type { Diff } from "../types.ts";
import type { JsNode } from "./types.ts";

function isSameValue(left: unknown, right: unknown): boolean {
    if (left === right) {
        return true;
    }

    if (typeof left !== typeof right || left === null || right === null) {
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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPropertyMap(value: unknown): value is Record<string, unknown> {
    return isRecord(value) && !("kind" in value);
}

function appendPath(path: string, segment: string): string {
    return `${path}->${segment}`;
}

function appendPropertyPath(path: string, property: string): string {
    return `${path}{${property}}`;
}

function diffPropertyMap(
    left: Record<string, unknown>,
    right: Record<string, unknown>,
    path: string,
): string[] {
    const paths: string[] = [];
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])];

    for (const key of keys) {
        if (!(key in left) || !(key in right)) {
            paths.push(appendPropertyPath(path, key));
            continue;
        }

        paths.push(
            ...diffValue(left[key], right[key], appendPropertyPath(path, key)),
        );
    }

    return paths;
}

function diffArray(left: unknown[], right: unknown[], path: string): string[] {
    const paths: string[] = [];
    const sharedLength = Math.min(left.length, right.length);

    for (let i = 0; i < sharedLength; i++) {
        paths.push(
            ...diffValue(left[i], right[i], appendPath(path, String(i))),
        );
    }

    for (let i = sharedLength; i < left.length; i++) {
        paths.push(appendPath(path, String(i)));
    }

    for (let i = sharedLength; i < right.length; i++) {
        paths.push(appendPath(path, String(i)));
    }

    return paths;
}

function diffObject(
    left: Record<string, unknown>,
    right: Record<string, unknown>,
    path: string,
): string[] {
    if ("kind" in left && "kind" in right && left.kind !== right.kind) {
        return [path];
    }

    const paths: string[] = [];
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])];

    for (const key of keys) {
        if (!(key in left) || !(key in right)) {
            paths.push(appendPath(path, key));
            continue;
        }

        if (key === "properties") {
            const leftValue = left[key];
            const rightValue = right[key];

            if (isPropertyMap(leftValue) && isPropertyMap(rightValue)) {
                paths.push(
                    ...diffPropertyMap(
                        leftValue,
                        rightValue,
                        appendPath(path, key),
                    ),
                );
                continue;
            }
        }

        paths.push(...diffValue(left[key], right[key], appendPath(path, key)));
    }

    return paths;
}

function diffValue(left: unknown, right: unknown, path: string): string[] {
    if (isSameValue(left, right)) {
        return [];
    }

    if (Array.isArray(left) && Array.isArray(right)) {
        return diffArray(left, right, path);
    }

    if (isRecord(left) && isRecord(right)) {
        return diffObject(left, right, path);
    }

    return [path];
}

export function diff(left: JsNode[], right: JsNode[]): Diff<JsNode[]> {
    const diffs: Diff<JsNode[]>["diffs"] = [];
    const sharedLength = Math.min(left.length, right.length);

    for (let i = 0; i < sharedLength; i++) {
        const nodePaths = diffValue(left[i], right[i], String(i));

        for (const path of nodePaths) {
            diffs.push({
                path,
                added: [right[i]],
                removed: [left[i]],
            });
        }
    }

    for (let i = sharedLength; i < right.length; i++) {
        diffs.push({
            path: String(i),
            added: [right[i]],
            removed: [],
        });
    }

    for (let i = sharedLength; i < left.length; i++) {
        diffs.push({
            path: String(i),
            added: [],
            removed: [left[i]],
        });
    }

    return { diffs };
}
