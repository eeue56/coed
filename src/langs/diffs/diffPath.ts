export const DIFF_PATH_SEPARATOR = "->";
export const DIFF_PROPERTY_SEGMENT = "attributes";

export function appendPath(path: string, segment: string): string {
    return `${path}${DIFF_PATH_SEPARATOR}${segment}`;
}

export function appendPropertyPath(
    path: string,
    property: string,
    propertySegment: string,
): string {
    return appendPath(path, `${propertySegment}{${property}}`);
}

export function appendInlineMapPath(path: string, property: string): string {
    return `${path}{${property}}`;
}

export function parsePropertySegment(
    segment: string,
    acceptedSegments: string[],
): string | null {
    for (const acceptedSegment of acceptedSegments) {
        const prefix = `${acceptedSegment}{`;

        if (segment.startsWith(prefix) && segment.endsWith("}")) {
            return segment.slice(prefix.length, -1);
        }
    }

    return null;
}
