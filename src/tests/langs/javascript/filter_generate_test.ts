import * as assert from "assert";
import { getRootObjectName } from "../../../langs/javascript/filter.ts";
import { javascript } from "../../../langs/javascript/index.ts";
import {
    isAst,
    isDeclaration,
    type Ast,
    type Expression,
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
    const results = [];

    for (const statement of program) {
        const sanitized = sanitizeAst(statement, filterRule);
        if (sanitized !== null && isAst(sanitized)) {
            results.push(sanitized);
        }
    }

    return results;
}

function sanitizeAst(ast: Ast, filterRule: FilterRule<JsNode>): JsNode | null {
    switch (ast.kind) {
        case "LetStatement": {
            const program = javascript.filter([filterRule], [ast.value]);

            if (program.value.length === 0) {
                return null;
            }
            return { ...ast, value: program.value[0] as Expression };
        }
        case "ConstStatement": {
            const value = javascript.filter([filterRule], [ast.value]);
            if (value.value.length === 0) {
                return null;
            }
            return { ...ast, value: value.value[0] as Expression };
        }
        case "IfStatement": {
            const condition = javascript.filter([filterRule], [ast.condition]);
            if (condition.value.length === 0) {
                return null;
            }

            const thenBranch = sanitizeProgram(ast.thenBranch, filterRule);
            const elseBranch = ast.elseBranch
                ? sanitizeProgram(ast.elseBranch, filterRule)
                : undefined;

            return {
                ...ast,
                condition: condition.value[0] as Expression,
                thenBranch,
                elseBranch,
            };
        }
        case "ForInOfLoop": {
            const iterable = javascript.filter([filterRule], [ast.iterable]);
            if (iterable.value.length === 0) {
                return null;
            }

            return {
                ...ast,
                iterable: iterable.value[0] as Expression,
                body: sanitizeProgram(ast.body, filterRule),
            };
        }
        case "ClassicForLoop": {
            const initValue = javascript.filter([filterRule], [ast.init.value]);
            const condition = javascript.filter([filterRule], [ast.condition]);
            const increment = javascript.filter([filterRule], [ast.increment]);

            if (
                initValue.value.length === 0 ||
                condition.value.length === 0 ||
                increment.value.length === 0
            ) {
                return null;
            }

            return {
                ...ast,
                init: { ...ast.init, value: initValue.value[0] as Expression },
                condition: condition.value[0] as Expression,
                increment: increment.value[0] as Expression,
                body: sanitizeProgram(ast.body, filterRule),
            };
        }
        case "FunctionDeclaration": {
            return {
                ...ast,
                body: sanitizeProgram(ast.body, filterRule),
            };
        }
        case "ClassDeclaration": {
            return {
                ...ast,
                body: sanitizeProgram(ast.body, filterRule),
            };
        }
        case "DoWhileLoop": {
            return {
                ...ast,
                condition: javascript.filter([filterRule], [ast.condition])
                    .value[0] as Expression,
                body: sanitizeProgram(ast.body, filterRule),
            };
        }
        case "LetListStatement": {
            return ast;
        }
        case "ReturnStatement": {
            if (ast.value === null) {
                return ast;
            }

            const value = javascript.filter([filterRule], [ast.value]);
            if (value.value.length === 0) {
                return null;
            }
            return { ...ast, value: value.value[0] as Expression };
        }
        case "ContinueStatement": {
            return ast;
        }
        case "BreakStatement": {
            return ast;
        }
        case "ThrowStatement": {
            const value = javascript.filter([filterRule], [ast.value]);
            if (value.value.length === 0) {
                return null;
            }

            return { ...ast, value: value.value[0] as Expression };
        }
        case "TryCatchStatement": {
            return {
                ...ast,
                tryBlock: sanitizeProgram(ast.tryBlock, filterRule),
                catchBlock: sanitizeProgram(ast.catchBlock, filterRule),
            };
        }
        case "ImportStatement": {
            return ast;
        }
        case "ExportNamedStatement": {
            return ast;
        }
        case "ExportDeclarationStatement": {
            const declaration = sanitizeAst(ast.declaration, filterRule);
            if (
                declaration === null ||
                !isAst(declaration) ||
                !isDeclaration(declaration)
            ) {
                return null;
            }

            return {
                ...ast,
                declaration,
            };
        }
        case "ExportDefaultStatement": {
            if (isAst(ast.value)) {
                const declaration = sanitizeAst(ast.value, filterRule);
                if (
                    declaration === null ||
                    !isAst(declaration) ||
                    declaration.kind !== "FunctionDeclaration"
                ) {
                    return null;
                }

                return {
                    ...ast,
                    value: declaration,
                };
            }

            const value = javascript.filter([filterRule], [ast.value]);
            if (value.value.length === 0) {
                return null;
            }

            return {
                ...ast,
                value: value.value[0] as Expression,
            };
        }
        case "LineTerminatedExpression": {
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
            const objectName = getRootObjectName(node.object);
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
            const objectName = getRootObjectName(node.object);
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
    const result = javascript.parse(input);
    const program = expectOk<Program>(result);
    const sanitized = sanitizeProgram(
        program.filter(isAst),
        isHarmfulExpression,
    );

    assert.strictEqual(javascript.generate(sanitized), expected);
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
let diagnostics = {
    "endpoints": [apiBaseUrl],
    "status": statusLabel
};
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
