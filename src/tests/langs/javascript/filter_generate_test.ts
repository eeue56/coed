import * as assert from "assert";
import { filterExpression } from "../../../langs/javascript/filter.ts";
import { generateProgram } from "../../../langs/javascript/generate.ts";
import { parse } from "../../../langs/javascript/parser/parse.ts";
import {
    isAst,
    type Ast,
    type JsNode,
    type Program,
} from "../../../langs/javascript/types.ts";
import type { FilterRule, Result } from "../../../langs/types.ts";

function expectOk<T>(result: Result<T>): T {
    if (result.kind !== "Ok") {
        throw new Error(result.error);
    }

    return result.value;
}

function sanitizeProgram(
    program: Ast[],
    filterRule: FilterRule<JsNode>,
): Ast[] {
    return program.flatMap((statement) => {
        if (isAst(statement)) {
            const sanitized = sanitizeAst(statement, filterRule);
            return sanitized ? [sanitized] : [];
        }
        return [];
    });
}

function sanitizeAst(ast: Ast, filterRule: FilterRule<JsNode>): Ast | null {
    switch (ast.kind) {
        case "LetStatement": {
            const value = filterExpression(ast.value, [filterRule]);

            if (value.values.length === 0) {
                return null;
            }
            return { ...ast, value: value.values[0] };
        }
        case "ConstStatement": {
            const value = filterExpression(ast.value, [filterRule]);
            if (value.values.length === 0) {
                return null;
            }
            return { ...ast, value: value.values[0] };
        }
        case "IfStatement": {
            const condition = filterExpression(ast.condition, [filterRule]);
            if (condition.values.length === 0) {
                return null;
            }

            const thenBranch = sanitizeProgram(ast.thenBranch, filterRule);
            const elseBranch = ast.elseBranch
                ? sanitizeProgram(ast.elseBranch, filterRule)
                : undefined;

            return {
                ...ast,
                condition: condition.values[0],
                thenBranch,
                elseBranch,
            };
        }
        case "ForLoop": {
            const initValue = filterExpression(ast.init.value, [filterRule]);
            const condition = filterExpression(ast.condition, [filterRule]);
            const increment = filterExpression(ast.increment, [filterRule]);

            if (
                initValue.values.length === 0 ||
                condition.values.length === 0 ||
                increment.values.length === 0
            ) {
                return null;
            }

            return {
                ...ast,
                init: { ...ast.init, value: initValue.values[0] },
                condition: condition.values[0],
                increment: increment.values[0],
                body: sanitizeProgram(ast.body, filterRule),
            };
        }
        case "FunctionDeclaration": {
            return {
                ...ast,
                body: sanitizeProgram(ast.body, filterRule),
            };
        }
        case "ReturnStatement": {
            if (ast.value === null) {
                return ast;
            }

            const value = filterExpression(ast.value, [filterRule]);
            if (value.values.length === 0) {
                return null;
            }
            return { ...ast, value: value.values[0] };
        }
        case "ContinueStatement": {
            return ast;
        }
        case "BreakStatement": {
            return ast;
        }
    }
}

const isHarmfulExpression: FilterRule<JsNode> = {
    shouldKeep: (node: JsNode): boolean => {
        if (node.kind === "FunctionCallExpression") {
            return node.functionName !== "fetch";
        }

        if (node.kind === "ObjectPropertyExpression") {
            const objectName = node.object.name;
            const propertyName =
                node.property.kind === "NameLookupExpression"
                    ? node.property.name
                    : null;

            if (objectName === "window" && propertyName === "location") {
                return false;
            }

            if (objectName === "document" && propertyName === "cookie") {
                return false;
            }
        }

        if (node.kind === "ObjectMethodCallExpression") {
            const objectName = node.object.name;
            const methodName =
                node.method.kind === "NameLookupExpression"
                    ? node.method.name
                    : null;

            if (
                objectName === "window" &&
                (methodName === "open" || methodName === "assign")
            ) {
                return false;
            }

            if (
                objectName === "localStorage" &&
                (methodName === "getItem" || methodName === "setItem")
            ) {
                return false;
            }
        }

        return true;
    },
    reason: "Remove harmful expressions",
};

function assertSanitizedCode(input: string, expected: string): void {
    const program = expectOk<Program>(parse(input));
    const sanitized = sanitizeProgram(
        program.filter(isAst),
        isHarmfulExpression,
    );

    assert.strictEqual(generateProgram(sanitized), expected);
}

export function testFilterRemovesWindowLocationFromArrayLiteral() {
    assertSanitizedCode(
        `
let visibleRoutes = [window.location, router.currentRoute, pageTitle];
        `.trim(),
        `
let visibleRoutes = [router.currentRoute, pageTitle];
        `.trim(),
    );
}

export function testFilterRemovesFetchCallsFromArrayLiteral() {
    assertSanitizedCode(
        `
let sidebarSignals = [fetch(statusUrl), widgetState, fetch(metricsUrl)];
        `.trim(),
        `
let sidebarSignals = [widgetState];
        `.trim(),
    );
}

export function testFilterPrunesHarmfulObjectProperties() {
    assertSanitizedCode(
        `
const sessionSnapshot = { route: window.location, title: documentTitle, cookie: document.cookie };
        `.trim(),
        `
const sessionSnapshot = { "title": documentTitle };
        `.trim(),
    );
}

export function testFilterKeepsSafePropertiesAlongsideFilteredArrayValues() {
    assertSanitizedCode(
        `
let diagnostics = { endpoints: [apiBaseUrl, fetch(healthUrl)], route: window.location, status: statusLabel };
        `.trim(),
        `
let diagnostics = { "endpoints": [apiBaseUrl], "status": statusLabel };
        `.trim(),
    );
}

export function testFilterSanitizesFunctionBodyAssignments() {
    assertSanitizedCode(
        `
function loadDashboard(accountId) {
    let currentRoute = window.location;
    let safeTitle = dashboardTitle;
    let healthCheck = fetch(healthUrl);
}
        `.trim(),
        `
function loadDashboard(accountId) {
    let safeTitle = dashboardTitle;
}
        `.trim(),
    );
}

export function testFilterSanitizesNestedIfBranches() {
    assertSanitizedCode(
        `
if (hasSession) {
    let currentRoute = window.location;
    let currentSection = navigationSection;
} else {
    const backupCookie = document.cookie;
    const backupTheme = themeName;
}
        `.trim(),
        `
if (hasSession) {
    let currentSection = navigationSection;
} else {
    const backupTheme = themeName;
}
        `.trim(),
    );
}

export function testFilterSanitizesForLoopBody() {
    assertSanitizedCode(
        `
for (let retryIndex = 0; retryIndex < 3; retryIndex++) {
    let retryUrl = window.location;
    let retryLabel = retryIndex;
}
        `.trim(),
        `
for (let retryIndex = 0; retryIndex < 3; retryIndex++) {
    let retryLabel = retryIndex;
}
        `.trim(),
    );
}

export function testFilterRemovesWholeStatementWhenValueIsOnlyFetch() {
    assertSanitizedCode(
        `
let metricsRequest = fetch(metricsUrl);
const safeFlag = true;
        `.trim(),
        `
const safeFlag = true;
        `.trim(),
    );
}

export function testFilterSanitizesMethodCallsInsideCollections() {
    assertSanitizedCode(
        `
let requestSummary = [localStorage.getItem(cacheKey), reportTitle, window.open(helpUrl)];
        `.trim(),
        `
let requestSummary = [reportTitle];
        `.trim(),
    );
}

export function testFilterKeepsFunctionStructureAfterSanitizingNestedObject() {
    assertSanitizedCode(
        `
function preparePreview(userId) {
    const previewState = { title: previewTitle, destination: window.location, draft: localStorage.getItem(draftKey) };
    let previewOwner = userId;
}
        `.trim(),
        `
function preparePreview(userId) {
    const previewState = { "title": previewTitle };
    let previewOwner = userId;
}
        `.trim(),
    );
}
