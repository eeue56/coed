export const DIFF_PATH_SEPARATOR = "->";
export const DIFF_PROPERTY_SEGMENT = "attributes";

export function encodePathPart(part: string): string {
    return part.replaceAll("%", "%25").replaceAll(">", "%3E");
}

export function decodePathPart(part: string): string {
    return part.replaceAll("%3E", ">").replaceAll("%25", "%");
}

export function appendPath(path: string, segment: string): string {
    return `${path}${DIFF_PATH_SEPARATOR}${encodePathPart(segment)}`;
}

export function appendPropertyPath(
    path: string,
    property: string,
    propertySegment: string,
): string {
    return `${path}${DIFF_PATH_SEPARATOR}${propertySegment}{${encodePathPart(property)}}`;
}

export function appendInlineMapPath(path: string, property: string): string {
    return `${path}{${encodePathPart(property)}}`;
}

export function parsePropertySegment(
    segment: string,
    acceptedSegments: string[],
): string | null {
    for (const acceptedSegment of acceptedSegments) {
        const prefix = `${acceptedSegment}{`;

        if (segment.startsWith(prefix) && segment.endsWith("}")) {
            return decodePathPart(segment.slice(prefix.length, -1));
        }
    }

    return null;
}
