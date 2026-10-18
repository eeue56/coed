import { class_, div, pre, text, type HtmlNode } from "../../coed.ts";
import { DIFF_PATH_SEPARATOR, decodePathPart } from "../diffs/diffPath.ts";
import {
    compactDiffEntries,
    compactedSummaryNode,
    compactedValueHighlight,
    formatComparedPathLine,
    groupedDiffEntryCounts,
    groupedDiffPathItems,
    renderCodeWithHighlight,
    renderDiffEntrySections,
    type HighlightSpec,
    type ValueSnippetSpec,
} from "../diffs/viewDiffShared.ts";
import { escapeHtml } from "../helpers.ts";
import type { Diff, DiffNode } from "../types.ts";
import { generateExpression, generateProgram } from "./generate.ts";
import {
    isExpression,
    isJsNode,
    type Expression,
    type JsNode,
    type ObjectExpression,
    type Program,
} from "./types.ts";

type IndexPathSegment = {
    kind: "IndexPathSegment";
    raw: string;
    index: number;
};

type FieldPathSegment = {
    kind: "FieldPathSegment";
    raw: string;
    field: string;
};

type PropertyMapPathSegment = {
    kind: "PropertyMapPathSegment";
    raw: string;
    field: string;
    key: string;
};

type PathSegment = IndexPathSegment | FieldPathSegment | PropertyMapPathSegment;

type DiffSide = "added" | "removed";

type PrimitiveValue = string | number | boolean | null;
type PathValue =
    | Program
    | JsNode
    | ObjectExpression["properties"]
    | PrimitiveValue;

const KIND_LABELS: Record<string, string> = {
    ConstStatement: "const",
    LetStatement: "let",
    LetListStatement: "let",
    FunctionDeclaration: "function",
    ClassDeclaration: "class",
    ReturnStatement: "return",
    IfStatement: "if",
    ClassicForLoop: "for",
    ForInOfLoop: "for",
    DoWhileLoop: "do while",
    ContinueStatement: "continue",
    BreakStatement: "break",
    ThrowStatement: "throw",
    TryCatchStatement: "try/catch",
    TryFinallyStatement: "try/finally",
    ImportNamespaceStatement: "import",
    ImportStatement: "import",
    ExportDeclarationStatement: "export",
    ExportNamedStatement: "export",
    ExportFromStatement: "export from",
    ExportDefaultStatement: "export default",
    LineTerminatedExpression: "expression",
    NameLookupExpression: "identifier",
    NumberExpression: "number",
    StringExpression: "string",
    BooleanExpression: "boolean",
    NullExpression: "null",
    ArrayExpression: "array",
    ObjectExpression: "object",
    StringLiteralExpression: "template string",
    FunctionCallExpression: "function call",
    ObjectPropertyExpression: "property access",
    ObjectMethodCallExpression: "method call",
    ArrayAccessExpression: "array access",
    AdditionExpression: "addition",
    SubtractionExpression: "subtraction",
    MultiplicationExpression: "multiplication",
    DivisionExpression: "division",
};

function describeKind(kind: JsNode["kind"]): string {
    const mapped = KIND_LABELS[kind];
    if (mapped) {
        return mapped;
    }

    const withoutSuffix = kind.replace(/(Statement|Expression)$/, "");
    return withoutSuffix.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
}

function isPropertiesMap(
    value: PathValue,
): value is ObjectExpression["properties"] {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }

    for (const objectValue of Object.values(value)) {
        if (!isExpression(objectValue)) {
            return false;
        }
    }

    return true;
}

function getNodeField(node: JsNode, field: string): PathValue | null {
    if (!(field in node)) {
        return null;
    }

    return node[field as keyof JsNode];
}

function parsePath(path: string): PathSegment[] {
    return path
        .split(DIFF_PATH_SEPARATOR)
        .filter((segment) => segment.length > 0)
        .map((segment): PathSegment => {
            if (/^\d+$/.test(segment)) {
                return {
                    kind: "IndexPathSegment",
                    raw: segment,
                    index: Number(segment),
                };
            }

            const mapMatch = segment.match(
                /^([A-Za-z_][A-Za-z0-9_]*)\{(.+)\}$/,
            );
            if (mapMatch) {
                return {
                    kind: "PropertyMapPathSegment",
                    raw: segment,
                    field: mapMatch[1],
                    key: decodePathPart(mapMatch[2]),
                };
            }

            return {
                kind: "FieldPathSegment",
                raw: segment,
                field: decodePathPart(segment),
            };
        });
}

function objectNodePath(path: string): string {
    const segments = parsePath(path);
    const propertyIndex = segments.findIndex(
        (segment) => segment.kind === "PropertyMapPathSegment",
    );

    if (propertyIndex <= 0) {
        return path;
    }

    return segments
        .slice(0, propertyIndex)
        .map((segment) => segment.raw)
        .join(DIFF_PATH_SEPARATOR);
}

function resolveSegment(
    value: PathValue,
    segment: PathSegment,
): PathValue | null {
    switch (segment.kind) {
        case "IndexPathSegment": {
            if (!Array.isArray(value)) {
                return null;
            }

            return value[segment.index];
        }
        case "FieldPathSegment": {
            if (!isJsNode(value)) {
                return null;
            }

            return getNodeField(value, segment.field);
        }
        case "PropertyMapPathSegment": {
            if (isJsNode(value)) {
                if (
                    segment.field !== "properties" ||
                    value.kind !== "ObjectExpression"
                ) {
                    return null;
                }

                return value.properties[segment.key];
            }

            if (isPropertiesMap(value)) {
                return value[segment.key];
            }

            return null;
        }
    }
}

function describeValue(value: PathValue): string {
    if (typeof value === "undefined") {
        return "(missing)";
    }

    if (value === null) {
        return "null";
    }

    if (typeof value === "string") {
        return `"${value}"`;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return `array[${value.length}]`;
    }

    if (isJsNode(value)) {
        return describeKind(value.kind);
    }

    return "object";
}

function formatSegmentLabel(segment: PathSegment): string {
    if (segment.kind === "PropertyMapPathSegment") {
        return `${segment.field}{${segment.key}}`;
    }

    return segment.raw;
}

// Payloads hold only the changed top-level node, so the leading index is entry-local.
function localSegments(
    segments: PathSegment[],
    addedProgram: Program,
    removedProgram: Program,
): PathSegment[] {
    const first = segments[0];

    if (
        typeof first === "undefined" ||
        first.kind !== "IndexPathSegment" ||
        first.index === 0 ||
        addedProgram.length > 1 ||
        removedProgram.length > 1
    ) {
        return segments;
    }

    return [{ ...first, index: 0 }, ...segments.slice(1)];
}

function formatPathForDisplay(
    path: string,
    addedProgram: Program,
    removedProgram: Program,
): string {
    const labelSegments = parsePath(path);

    if (labelSegments.length === 0) {
        return escapeHtml(path);
    }

    const segments = localSegments(labelSegments, addedProgram, removedProgram);

    const lines: string[] = [];
    let addedCurrent: PathValue = addedProgram;
    let removedCurrent: PathValue = removedProgram;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        addedCurrent = resolveSegment(addedCurrent, segment);
        removedCurrent = resolveSegment(removedCurrent, segment);

        const addedDescription = describeValue(addedCurrent);
        const removedDescription = describeValue(removedCurrent);
        lines.push(
            formatComparedPathLine(
                i,
                formatSegmentLabel(labelSegments[i]),
                addedDescription,
                removedDescription,
            ),
        );
    }

    return escapeHtml(lines.join("\n"));
}

function isPrimitive(value: PathValue): value is PrimitiveValue {
    return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
    );
}

function codeLiteral(value: string | number | boolean | null): string {
    if (value === null) {
        return "null";
    }

    return String(value);
}

function expressionPrimitiveValue(
    expression: Expression,
): PrimitiveValue | undefined {
    switch (expression.kind) {
        case "StringExpression":
        case "NumberExpression":
        case "BooleanExpression":
            return expression.value;
        case "NullExpression":
            return null;
        default:
            return undefined;
    }
}

function getValueAtPath(root: Program, segments: PathSegment[]): PathValue {
    const values = getValuesAlongPath(root, segments);
    return values[values.length - 1];
}

function getValuesAlongPath(
    root: Program,
    segments: PathSegment[],
): PathValue[] {
    let current: PathValue = root;
    const values: PathValue[] = [current];

    for (const segment of segments) {
        current = resolveSegment(current, segment);
        values.push(current);
    }

    return values;
}

function toCodeSnippet(node: JsNode): string {
    if (isExpression(node)) {
        return generateExpression(node);
    }

    return generateProgram([node]);
}

function getNameHighlightContext(values: PathValue[]): JsNode | null {
    for (let i = values.length - 1; i >= 0; i--) {
        const value = values[i];
        if (!isJsNode(value)) {
            continue;
        }

        if (value.kind === "NameLookupExpression") {
            continue;
        }

        if (isExpression(value)) {
            return value;
        }
    }

    for (let i = values.length - 1; i >= 0; i--) {
        const value = values[i];
        if (isJsNode(value) && value.kind !== "NameLookupExpression") {
            return value;
        }
    }

    return null;
}

function getHighlight(
    code: string,
    program: Program,
    oppositeProgram: Program,
    segments: PathSegment[],
    side: DiffSide,
    compactedPropertyKeys: string[] = [],
): HighlightSpec | null {
    if (code.length === 0) {
        return null;
    }

    const pathValues = getValuesAlongPath(program, segments);
    const leaf = pathValues[pathValues.length - 1];
    const oppositeLeaf = getValueAtPath(oppositeProgram, segments);

    const compactedHighlight = compactedObjectPropertyHighlight(
        leaf,
        oppositeLeaf,
        compactedPropertyKeys,
    );
    if (compactedHighlight !== null) {
        return compactedHighlight;
    }

    if (segments.length === 0) {
        return {
            mode: "block",
            snippet: code,
        };
    }

    const lastSegment = segments[segments.length - 1];

    if (
        lastSegment.kind === "FieldPathSegment" &&
        lastSegment.field === "name" &&
        typeof leaf === "string"
    ) {
        const context = getNameHighlightContext(pathValues);
        if (context === null) {
            return null;
        }

        return {
            mode: "value",
            snippet: toCodeSnippet(context),
            valueSnippet: leaf,
        };
    }

    if (
        isPrimitive(leaf) &&
        isPrimitive(oppositeLeaf) &&
        leaf !== oppositeLeaf
    ) {
        const literal = codeLiteral(leaf);
        return {
            mode: "value",
            snippet: code,
            valueSnippet: literal,
        };
    }

    if (
        lastSegment.kind === "PropertyMapPathSegment" &&
        isExpression(leaf) &&
        isExpression(oppositeLeaf)
    ) {
        const leafPrimitive = expressionPrimitiveValue(leaf);
        const oppositePrimitive = expressionPrimitiveValue(oppositeLeaf);

        if (
            typeof leafPrimitive !== "undefined" &&
            typeof oppositePrimitive !== "undefined" &&
            leafPrimitive !== oppositePrimitive
        ) {
            return {
                mode: "value",
                snippet: `"${lastSegment.key}": ${generateExpression(leaf)}`,
                valueSnippet: codeLiteral(leafPrimitive),
            };
        }
    }

    if (
        side === "removed" &&
        lastSegment.kind === "PropertyMapPathSegment" &&
        typeof oppositeLeaf === "undefined" &&
        isExpression(leaf)
    ) {
        const primitiveLeaf = expressionPrimitiveValue(leaf);

        if (typeof primitiveLeaf !== "undefined") {
            return {
                mode: "property",
                snippet: `"${lastSegment.key}": ${codeLiteral(primitiveLeaf)}`,
            };
        }

        return {
            mode: "property",
            snippet: `"${lastSegment.key}": ${generateExpression(leaf)}`,
        };
    }

    if (lastSegment.kind === "PropertyMapPathSegment") {
        return {
            mode: "property",
            snippet: `"${lastSegment.key}"`,
        };
    }

    return {
        mode: "block",
        snippet: code,
    };
}

function compactedObjectPropertyHighlight(
    leaf: PathValue,
    oppositeLeaf: PathValue,
    compactedPropertyKeys: string[],
): HighlightSpec | null {
    if (
        compactedPropertyKeys.length === 0 ||
        !isJsNode(leaf) ||
        leaf.kind !== "ObjectExpression"
    ) {
        return null;
    }

    const snippetSpecs: ValueSnippetSpec[] = [];

    for (const key of compactedPropertyKeys) {
        const expression = leaf.properties[key];
        const oppositeExpression =
            isJsNode(oppositeLeaf) && oppositeLeaf.kind === "ObjectExpression"
                ? oppositeLeaf.properties[key]
                : undefined;

        if (!isExpression(expression)) {
            continue;
        }

        const expressionCode = generateExpression(expression);
        const snippet = `"${key}": ${expressionCode}`;
        const snippetSpec: ValueSnippetSpec = { snippet };

        const primitiveValue = expressionPrimitiveValue(expression);
        const oppositePrimitiveValue = isExpression(oppositeExpression)
            ? expressionPrimitiveValue(oppositeExpression)
            : undefined;

        if (
            typeof primitiveValue !== "undefined" &&
            typeof oppositePrimitiveValue !== "undefined" &&
            primitiveValue !== oppositePrimitiveValue
        ) {
            const valueSnippet = codeLiteral(primitiveValue);
            const marker = `: ${valueSnippet}`;
            const markerOffset = snippet.indexOf(marker);
            snippetSpec.valueSnippet = valueSnippet;
            snippetSpec.valueOffset =
                markerOffset === -1 ? undefined : markerOffset + 2;
        }

        snippetSpecs.push(snippetSpec);
    }

    return compactedValueHighlight(snippetSpecs);
}

function renderCode(
    program: Program,
    oppositeProgram: Program,
    segments: PathSegment[],
    side: DiffSide,
    compactedPropertyKeys: string[],
    codeClass: string,
    highlightClass: string,
): HtmlNode<never> {
    const code = generateProgram(program);
    const highlight = getHighlight(
        code,
        program,
        oppositeProgram,
        segments,
        side,
        compactedPropertyKeys,
    );

    return renderCodeWithHighlight(
        code,
        highlight,
        codeClass,
        highlightClass,
        escapeHtml,
    );
}

export function viewDiffNode(entry: DiffNode<JsNode[]>): HtmlNode<never> {
    return viewDiffNodeWithSummary(entry, null, []);
}

function viewDiffNodeWithSummary(
    entry: DiffNode<JsNode[]>,
    summaryNode: HtmlNode<never> | null,
    compactedPropertyKeys: string[],
): HtmlNode<never> {
    const segments = localSegments(
        parsePath(entry.path),
        entry.added,
        entry.removed,
    );

    return renderDiffEntrySections(
        "coed-view-diff",
        pre(
            [],
            [class_("coed-view-diff-path-value")],
            [
                text(
                    formatPathForDisplay(
                        entry.path,
                        entry.added,
                        entry.removed,
                    ),
                ),
            ],
        ),
        renderCode(
            entry.added,
            entry.removed,
            segments,
            "added",
            compactedPropertyKeys,
            "coed-view-diff-added-code",
            "coed-view-diff-added-highlight",
        ),
        renderCode(
            entry.removed,
            entry.added,
            segments,
            "removed",
            compactedPropertyKeys,
            "coed-view-diff-removed-code",
            "coed-view-diff-removed-highlight",
        ),
        summaryNode,
    );
}

function propertyKeyForPath(path: string): string | null {
    const segments = parsePath(path);
    const propertySegment = segments.find(
        (segment) => segment.kind === "PropertyMapPathSegment",
    );

    if (typeof propertySegment === "undefined") {
        return null;
    }

    return propertySegment.key;
}

export function viewDiff(diff: Diff<JsNode[]>): HtmlNode<never> {
    const groupedCounts = groupedDiffEntryCounts(diff.diffs, objectNodePath);
    const groupedKeys = groupedDiffPathItems(
        diff.diffs,
        objectNodePath,
        propertyKeyForPath,
    );
    const entries = compactDiffEntries(diff.diffs, objectNodePath);

    return div(
        [],
        [class_("coed-view-diff")],
        [
            ...entries.map((entry) => {
                const compactedCount = groupedCounts.get(entry.path) ?? 1;
                const compactedPropertyKeys = groupedKeys.get(entry.path) ?? [];
                const summaryNode = compactedSummaryNode(compactedCount);

                return viewDiffNodeWithSummary(
                    entry,
                    summaryNode,
                    compactedPropertyKeys,
                );
            }),
        ],
    );
}
