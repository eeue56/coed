import * as assert from "assert";
import { filterExpression } from "../../../langs/javascript/filter.ts";
import { parseExpression } from "../../../langs/javascript/parser/parse.ts";
import { tokenize } from "../../../langs/javascript/parser/tokenize.ts";
import type {
    Expression,
    NumberExpression,
    Result,
} from "../../../langs/javascript/types.ts";

const one: NumberExpression = { kind: "NumberExpression", value: 1 };
const two: NumberExpression = { kind: "NumberExpression", value: 2 };
const three: NumberExpression = { kind: "NumberExpression", value: 3 };
const keep: (node: Expression) => boolean = () => true;

function isNotTwoNumber(node: Expression): boolean {
    return !(node.kind === "NumberExpression" && node.value === 2);
}

function expectOk<T>(result: Result<T>): T {
    if (result.kind === "Err") {
        throw new Error(result.error);
    }

    return result.value;
}

function parseFromCode(input: string): Expression {
    return expectOk(parseExpression(tokenize(input)));
}

export function testFilterExpressionReturnsNullWhenRootFailsPredicate() {
    const expression: Expression = { kind: "StringExpression", value: "x" };

    const actual = filterExpression(expression, () => false);

    assert.strictEqual(actual, null);
}

export function testFilterExpressionKeepsLeafExpressionsWhenPredicateAlwaysTrue() {
    const cases: Expression[] = [
        { kind: "NumberExpression", value: 42 },
        { kind: "StringExpression", value: "hello" },
        { kind: "IncrementExpression", variable: "count" },
        { kind: "DecrementExpression", variable: "count" },
        { kind: "NullExpression" },
        { kind: "BooleanExpression", value: true },
        { kind: "NameLookupExpression", name: "value" },
    ];

    for (const expression of cases) {
        assert.deepStrictEqual(filterExpression(expression, keep), expression);
    }
}

export function testFilterExpressionRecursivelyFiltersArrayObjectAndStringLiteral() {
    const arrayExpression: Expression = {
        kind: "ArrayExpression",
        elements: [one, two, three],
    };

    const objectExpression: Expression = {
        kind: "ObjectExpression",
        properties: {
            kept: one,
            removed: two,
            nested: {
                kind: "ArrayExpression",
                elements: [one, two],
            },
        },
    };

    const stringLiteralExpression: Expression = {
        kind: "StringLiteralExpression",
        values: [one, two, { kind: "NameLookupExpression", name: "suffix" }],
    };

    assert.deepStrictEqual(filterExpression(arrayExpression, isNotTwoNumber), {
        kind: "ArrayExpression",
        elements: [one, three],
    });

    assert.deepStrictEqual(filterExpression(objectExpression, isNotTwoNumber), {
        kind: "ObjectExpression",
        properties: {
            kept: one,
            nested: {
                kind: "ArrayExpression",
                elements: [one],
            },
        },
    });

    assert.deepStrictEqual(
        filterExpression(stringLiteralExpression, isNotTwoNumber),
        {
            kind: "StringLiteralExpression",
            values: [one, { kind: "NameLookupExpression", name: "suffix" }],
        },
    );
}

export function testFilterExpressionComparisonExpressionsRequireBothSides() {
    const comparisons: Expression[] = [
        {
            kind: "EqualityExpression",
            left: one,
            right: two,
        },
        {
            kind: "InequalityExpression",
            left: one,
            right: two,
        },
        {
            kind: "LessThanExpression",
            left: one,
            right: two,
        },
        {
            kind: "MoreThanExpression",
            left: one,
            right: two,
        },
        {
            kind: "LessThanOrEqualExpression",
            left: one,
            right: two,
        },
        {
            kind: "MoreThanOrEqualExpression",
            left: one,
            right: two,
        },
    ];

    for (const expression of comparisons) {
        assert.strictEqual(filterExpression(expression, isNotTwoNumber), null);
        assert.deepStrictEqual(filterExpression(expression, keep), expression);
    }
}

export function testFilterExpressionIncreaseAndDecreaseRequireAmount() {
    const increaseExpression: Expression = {
        kind: "IncreaseExpression",
        variable: "total",
        amount: two,
    };

    const decreaseExpression: Expression = {
        kind: "DecreaseExpression",
        variable: "total",
        amount: two,
    };

    assert.strictEqual(
        filterExpression(increaseExpression, isNotTwoNumber),
        null,
    );
    assert.strictEqual(
        filterExpression(decreaseExpression, isNotTwoNumber),
        null,
    );

    assert.deepStrictEqual(
        filterExpression(increaseExpression, keep),
        increaseExpression,
    );
    assert.deepStrictEqual(
        filterExpression(decreaseExpression, keep),
        decreaseExpression,
    );
}

export function testFilterExpressionFunctionCallRequiresAllArguments() {
    const expression: Expression = {
        kind: "FunctionCallExpression",
        functionName: "sum",
        arguments: [one, two],
    };

    assert.strictEqual(filterExpression(expression, isNotTwoNumber), null);
    assert.deepStrictEqual(filterExpression(expression, keep), expression);
}

export function testFilterExpressionObjectPropertyRequiresObjectAndProperty() {
    const expression: Expression = {
        kind: "ObjectPropertyExpression",
        object: { kind: "NameLookupExpression", name: "obj" },
        property: {
            kind: "StringLiteralExpression",
            values: [{ kind: "StringExpression", value: "key" }],
        },
    };

    const removePropertyLiteral = (node: Expression): boolean => {
        return node.kind !== "StringLiteralExpression";
    };

    assert.strictEqual(
        filterExpression(expression, removePropertyLiteral),
        null,
    );
    assert.deepStrictEqual(filterExpression(expression, keep), expression);
}

export function testFilterExpressionObjectMethodCallRequiresObjectAndMethod() {
    const expression: Expression = {
        kind: "ObjectMethodCallExpression",
        object: { kind: "NameLookupExpression", name: "obj" },
        method: { kind: "NameLookupExpression", name: "doIt" },
        arguments: [one, two],
    };

    const removeMethodName = (node: Expression): boolean => {
        return !(node.kind === "NameLookupExpression" && node.name === "doIt");
    };

    assert.strictEqual(filterExpression(expression, removeMethodName), null);
    assert.deepStrictEqual(filterExpression(expression, keep), expression);
}

export function testFilterExpressionArrayAccessRequiresArrayAndIndex() {
    const expression: Expression = {
        kind: "ArrayAccessExpression",
        array: { kind: "NameLookupExpression", name: "items" },
        index: two,
    };

    assert.strictEqual(filterExpression(expression, isNotTwoNumber), null);
    assert.deepStrictEqual(filterExpression(expression, keep), expression);
}

export function testFilterExpressionArithmeticExpressionsRequireBothSides() {
    const arithmetic: Expression[] = [
        {
            kind: "AdditionExpression",
            left: one,
            right: two,
        },
        {
            kind: "SubtractionExpression",
            left: one,
            right: two,
        },
        {
            kind: "MultiplicationExpression",
            left: one,
            right: two,
        },
        {
            kind: "DivisionExpression",
            left: one,
            right: two,
        },
    ];

    for (const expression of arithmetic) {
        assert.strictEqual(filterExpression(expression, isNotTwoNumber), null);
        assert.deepStrictEqual(filterExpression(expression, keep), expression);
    }
}

export function testFilterExpressionHandlesNestedCombinations() {
    const expression: Expression = {
        kind: "ObjectExpression",
        properties: {
            values: {
                kind: "ArrayExpression",
                elements: [
                    {
                        kind: "StringLiteralExpression",
                        values: [
                            { kind: "StringExpression", value: "count=" },
                            one,
                            two,
                        ],
                    },
                ],
            },
            stats: {
                kind: "FunctionCallExpression",
                functionName: "compute",
                arguments: [
                    {
                        kind: "AdditionExpression",
                        left: one,
                        right: two,
                    },
                ],
            },
        },
    };

    const actual = filterExpression(expression, isNotTwoNumber);

    assert.deepStrictEqual(actual, {
        kind: "ObjectExpression",
        properties: {
            stats: {
                kind: "FunctionCallExpression",
                functionName: "compute",
                arguments: [
                    {
                        kind: "AdditionExpression",
                        left: one,
                        right: two,
                    },
                ],
            },
            values: {
                kind: "ArrayExpression",
                elements: [
                    {
                        kind: "StringLiteralExpression",
                        values: [
                            { kind: "StringExpression", value: "count=" },
                            one,
                        ],
                    },
                ],
            },
        },
    });
}

export function testFilterExpressionParsedObjectLiteralPrunesNestedCollections() {
    const expression = parseFromCode(
        '{ title: "orders", buckets: [1, 2, 3], summary: { min: 1, max: 2 } }',
    );

    const actual = filterExpression(expression, isNotTwoNumber);

    assert.deepStrictEqual(actual, {
        kind: "ObjectExpression",
        properties: {
            title: { kind: "StringExpression", value: "orders" },
            buckets: {
                kind: "ArrayExpression",
                elements: [
                    { kind: "NumberExpression", value: 1 },
                    { kind: "NumberExpression", value: 3 },
                ],
            },
            summary: {
                kind: "ObjectExpression",
                properties: {
                    min: { kind: "NumberExpression", value: 1 },
                },
            },
        },
    });
}

export function testFilterExpressionParsedMemberCallKeepsNestedArgumentValues() {
    const expression = parseFromCode("stats.compute(1 + 2, points[2])");

    const actual = filterExpression(expression, isNotTwoNumber);

    assert.deepStrictEqual(actual, expression);
}

export function testFilterExpressionParsedTemplateAndAccessCombination() {
    const expression = parseFromCode("`users=` + users[2]");

    const actual = filterExpression(expression, isNotTwoNumber);

    assert.deepStrictEqual(actual, expression);
}

export function testFilterExpressionPolicyLimitsWindowLocationUsage() {
    const expression = parseFromCode(
        "[window.location, appState.currentUrl, fetch('/api/health')]",
    );

    const limitWindowLocationApis = (node: Expression): boolean => {
        if (node.kind !== "ObjectPropertyExpression") {
            return true;
        }

        const isWindowObject =
            node.object.kind === "NameLookupExpression" &&
            node.object.name === "window";
        const isLocationProperty =
            node.property.kind === "NameLookupExpression" &&
            node.property.name === "location";

        return !(isWindowObject && isLocationProperty);
    };

    const actual = filterExpression(expression, limitWindowLocationApis);

    assert.deepStrictEqual(actual, {
        kind: "ArrayExpression",
        elements: [
            {
                kind: "ObjectPropertyExpression",
                object: { kind: "NameLookupExpression", name: "appState" },
                property: { kind: "NameLookupExpression", name: "currentUrl" },
            },
            {
                kind: "FunctionCallExpression",
                functionName: "fetch",
                arguments: [{ kind: "StringExpression", value: "/api/health" }],
            },
        ],
    });
}

export function testFilterExpressionPolicyRemovesDocumentCookiesAccess() {
    const expression = parseFromCode(
        "[document.cookies, document.title, analytics.track('ready')]",
    );

    const removeDocumentCookies = (node: Expression): boolean => {
        if (node.kind !== "ObjectPropertyExpression") {
            return true;
        }

        const isDocumentObject =
            node.object.kind === "NameLookupExpression" &&
            node.object.name === "document";
        const isCookiesProperty =
            node.property.kind === "NameLookupExpression" &&
            node.property.name === "cookies";

        return !(isDocumentObject && isCookiesProperty);
    };

    const actual = filterExpression(expression, removeDocumentCookies);

    assert.deepStrictEqual(actual, {
        kind: "ArrayExpression",
        elements: [
            {
                kind: "ObjectPropertyExpression",
                object: { kind: "NameLookupExpression", name: "document" },
                property: { kind: "NameLookupExpression", name: "title" },
            },
            {
                kind: "ObjectMethodCallExpression",
                object: { kind: "NameLookupExpression", name: "analytics" },
                method: { kind: "NameLookupExpression", name: "track" },
                arguments: [{ kind: "StringExpression", value: "ready" }],
            },
        ],
    });
}

export function testFilterExpressionPolicyAllowsOnlyNetworkCalls() {
    const expression = parseFromCode(
        "[fetch('/api/users'), renderUserCard(user), navigator.sendBeacon('/metrics')]",
    );

    const keepOnlyNetworkCalls = (node: Expression): boolean => {
        if (node.kind === "FunctionCallExpression") {
            return node.functionName === "fetch";
        }

        if (node.kind === "ObjectMethodCallExpression") {
            return (
                node.object.name === "navigator" &&
                node.method.kind === "NameLookupExpression" &&
                node.method.name === "sendBeacon"
            );
        }

        return true;
    };

    const actual = filterExpression(expression, keepOnlyNetworkCalls);

    assert.deepStrictEqual(actual, {
        kind: "ArrayExpression",
        elements: [
            {
                kind: "FunctionCallExpression",
                functionName: "fetch",
                arguments: [{ kind: "StringExpression", value: "/api/users" }],
            },
            {
                kind: "ObjectMethodCallExpression",
                object: { kind: "NameLookupExpression", name: "navigator" },
                method: { kind: "NameLookupExpression", name: "sendBeacon" },
                arguments: [{ kind: "StringExpression", value: "/metrics" }],
            },
        ],
    });
}

export function testFilterExpressionPolicyBlocksEvalLikeExecutionCalls() {
    const expression = parseFromCode(
        "[eval(userInput), Function('return 1'), parseInt(raw, 10)]",
    );

    const removeDynamicExecutionCalls = (node: Expression): boolean => {
        if (node.kind !== "FunctionCallExpression") {
            return true;
        }

        return node.functionName !== "eval" && node.functionName !== "Function";
    };

    const actual = filterExpression(expression, removeDynamicExecutionCalls);

    assert.deepStrictEqual(actual, {
        kind: "ArrayExpression",
        elements: [
            {
                kind: "FunctionCallExpression",
                functionName: "parseInt",
                arguments: [
                    { kind: "NameLookupExpression", name: "raw" },
                    { kind: "NumberExpression", value: 10 },
                ],
            },
        ],
    });
}

export function testFilterExpressionPolicyBlocksSensitiveStorageAndCookieWrites() {
    const expression = parseFromCode(
        "[localStorage.getItem('token'), document.cookie, document.title, fetch('/api/session')]",
    );

    const removeSensitiveStorageApis = (node: Expression): boolean => {
        if (node.kind === "ObjectMethodCallExpression") {
            const isStorageRead =
                (node.object.name === "localStorage" ||
                    node.object.name === "sessionStorage") &&
                node.method.kind === "NameLookupExpression" &&
                (node.method.name === "getItem" ||
                    node.method.name === "setItem");
            if (isStorageRead) {
                return false;
            }
        }

        if (node.kind === "ObjectPropertyExpression") {
            const isCookieAccess =
                node.object.kind === "NameLookupExpression" &&
                node.object.name === "document" &&
                node.property.kind === "NameLookupExpression" &&
                node.property.name === "cookie";
            if (isCookieAccess) {
                return false;
            }
        }

        return true;
    };

    const actual = filterExpression(expression, removeSensitiveStorageApis);

    assert.deepStrictEqual(actual, {
        kind: "ArrayExpression",
        elements: [
            {
                kind: "ObjectPropertyExpression",
                object: { kind: "NameLookupExpression", name: "document" },
                property: { kind: "NameLookupExpression", name: "title" },
            },
            {
                kind: "FunctionCallExpression",
                functionName: "fetch",
                arguments: [
                    { kind: "StringExpression", value: "/api/session" },
                ],
            },
        ],
    });
}

export function testFilterExpressionPolicyBlocksNavigationAndPopupApis() {
    const expression = parseFromCode(
        "[window.open(url), location.assign(nextUrl), history.pushState(data, title, '/dashboard'), fetch('/api/next')]",
    );

    const removeNavigationAndPopupApis = (node: Expression): boolean => {
        if (node.kind !== "ObjectMethodCallExpression") {
            return true;
        }

        const isBlockedWindowMethod =
            node.object.name === "window" &&
            node.method.kind === "NameLookupExpression" &&
            node.method.name === "open";
        const isBlockedLocationMethod =
            node.object.name === "location" &&
            node.method.kind === "NameLookupExpression" &&
            (node.method.name === "assign" || node.method.name === "replace");
        const isBlockedHistoryMethod =
            node.object.name === "history" &&
            node.method.kind === "NameLookupExpression" &&
            node.method.name === "pushState";

        return !(
            isBlockedWindowMethod ||
            isBlockedLocationMethod ||
            isBlockedHistoryMethod
        );
    };

    const actual = filterExpression(expression, removeNavigationAndPopupApis);

    assert.deepStrictEqual(actual, {
        kind: "ArrayExpression",
        elements: [
            {
                kind: "FunctionCallExpression",
                functionName: "fetch",
                arguments: [{ kind: "StringExpression", value: "/api/next" }],
            },
        ],
    });
}

type ExpressionPredicate = (node: Expression) => boolean;

function removeWindowLocationProperty(node: Expression): boolean {
    if (node.kind !== "ObjectPropertyExpression") {
        return true;
    }

    return !(
        node.object.kind === "NameLookupExpression" &&
        node.object.name === "window" &&
        node.property.kind === "NameLookupExpression" &&
        node.property.name === "location"
    );
}

function removeDocumentCookieProperties(node: Expression): boolean {
    if (node.kind !== "ObjectPropertyExpression") {
        return true;
    }

    const isDocumentObject =
        node.object.kind === "NameLookupExpression" &&
        node.object.name === "document";
    const isCookieProperty =
        node.property.kind === "NameLookupExpression" &&
        (node.property.name === "cookie" || node.property.name === "cookies");

    return !(isDocumentObject && isCookieProperty);
}

function removeStorageMethods(node: Expression): boolean {
    if (node.kind !== "ObjectMethodCallExpression") {
        return true;
    }

    if (
        node.object.name !== "localStorage" &&
        node.object.name !== "sessionStorage"
    ) {
        return true;
    }

    if (node.method.kind !== "NameLookupExpression") {
        return true;
    }

    return !["getItem", "setItem", "removeItem", "clear", "key"].includes(
        node.method.name,
    );
}

function removeDynamicExecution(node: Expression): boolean {
    if (node.kind !== "FunctionCallExpression") {
        return true;
    }

    return node.functionName !== "eval" && node.functionName !== "Function";
}

function removeNavigationAndPopupMethods(node: Expression): boolean {
    if (node.kind !== "ObjectMethodCallExpression") {
        return true;
    }

    if (node.method.kind !== "NameLookupExpression") {
        return true;
    }

    const isWindowOpen =
        node.object.name === "window" && node.method.name === "open";
    const isLocationNavigation =
        node.object.name === "location" &&
        ["assign", "replace", "reload"].includes(node.method.name);
    const isHistoryNavigation =
        node.object.name === "history" &&
        ["pushState", "replaceState", "back", "forward", "go"].includes(
            node.method.name,
        );

    return !(isWindowOpen || isLocationNavigation || isHistoryNavigation);
}

function keepOnlyNetworkCalls(node: Expression): boolean {
    if (node.kind === "FunctionCallExpression") {
        return node.functionName === "fetch";
    }

    if (node.kind === "ObjectMethodCallExpression") {
        return (
            node.object.name === "navigator" &&
            node.method.kind === "NameLookupExpression" &&
            node.method.name === "sendBeacon"
        );
    }

    return true;
}

function assertPolicyCase(
    input: string,
    predicate: ExpressionPredicate,
    expected: string,
): void {
    const expression = parseFromCode(input);
    const actual = filterExpression(expression, predicate);

    assert.deepStrictEqual(actual, parseFromCode(expected));
}

export function testFilterExpressionGeneratedRealWorldCase001() {
    assertPolicyCase(
        "[window.location, appState.currentUrl, fetch('/api/health')]",
        removeWindowLocationProperty,
        "[appState.currentUrl, fetch('/api/health')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase002() {
    assertPolicyCase(
        "[window.location, router.currentRoute, metrics.track('ready')]",
        removeWindowLocationProperty,
        "[router.currentRoute, metrics.track('ready')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase003() {
    assertPolicyCase(
        "[window.location, document.title, cache.get('lastRoute')]",
        removeWindowLocationProperty,
        "[document.title, cache.get('lastRoute')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase004() {
    assertPolicyCase(
        "[window.location, location.pathname, apiClient.get('/v1/ping')]",
        removeWindowLocationProperty,
        "[location.pathname, apiClient.get('/v1/ping')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase005() {
    assertPolicyCase(
        "[window.location, settings.baseUrl, Number.parseInt(code, 10)]",
        removeWindowLocationProperty,
        "[settings.baseUrl, Number.parseInt(code, 10)]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase006() {
    assertPolicyCase(
        "[window.location, navigator.userAgent, fetch('/api/status')]",
        removeWindowLocationProperty,
        "[navigator.userAgent, fetch('/api/status')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase007() {
    assertPolicyCase(
        "[window.location, history.length, analytics.page('dashboard')]",
        removeWindowLocationProperty,
        "[history.length, analytics.page('dashboard')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase008() {
    assertPolicyCase(
        "[window.location, user.profileUrl, session.id]",
        removeWindowLocationProperty,
        "[user.profileUrl, session.id]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase009() {
    assertPolicyCase(
        "[window.location, document.referrer, urlBuilder.home()]",
        removeWindowLocationProperty,
        "[document.referrer, urlBuilder.home()]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase010() {
    assertPolicyCase(
        "[window.location, appState.currentUrl, fetch('/health')]",
        removeWindowLocationProperty,
        "[appState.currentUrl, fetch('/health')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase011() {
    assertPolicyCase(
        "[window.location, router.currentRoute, metrics.track('view')]",
        removeWindowLocationProperty,
        "[router.currentRoute, metrics.track('view')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase012() {
    assertPolicyCase(
        "[window.location, document.title, fetch('/api/status')]",
        removeWindowLocationProperty,
        "[document.title, fetch('/api/status')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase013() {
    assertPolicyCase(
        "[window.location, settings.baseUrl, cache.get('lastRoute')]",
        removeWindowLocationProperty,
        "[settings.baseUrl, cache.get('lastRoute')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase014() {
    assertPolicyCase(
        "[window.location, history.length, Number.parseInt(code, 10)]",
        removeWindowLocationProperty,
        "[history.length, Number.parseInt(code, 10)]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase015() {
    assertPolicyCase(
        "[window.location, location.pathname, apiClient.get('/v1/ping')]",
        removeWindowLocationProperty,
        "[location.pathname, apiClient.get('/v1/ping')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase016() {
    assertPolicyCase(
        "[window.location, navigator.userAgent, user.profileUrl]",
        removeWindowLocationProperty,
        "[navigator.userAgent, user.profileUrl]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase017() {
    assertPolicyCase(
        "[window.location, analytics.page('settings'), document.referrer]",
        removeWindowLocationProperty,
        "[analytics.page('settings'), document.referrer]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase018() {
    assertPolicyCase(
        "[window.location, cache.get('route'), session.id]",
        removeWindowLocationProperty,
        "[cache.get('route'), session.id]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase019() {
    assertPolicyCase(
        "[window.location, appConfig.homeUrl, metrics.track('landing')]",
        removeWindowLocationProperty,
        "[appConfig.homeUrl, metrics.track('landing')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase020() {
    assertPolicyCase(
        "[window.location, authContext.userId, fetch('/api/profile')]",
        removeWindowLocationProperty,
        "[authContext.userId, fetch('/api/profile')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase021() {
    assertPolicyCase(
        "[document.cookie, document.title, fetch('/api/page')]",
        removeDocumentCookieProperties,
        "[document.title, fetch('/api/page')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase022() {
    assertPolicyCase(
        "[document.cookies, router.currentRoute, metrics.track('cookie-filtered')]",
        removeDocumentCookieProperties,
        "[router.currentRoute, metrics.track('cookie-filtered')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase023() {
    assertPolicyCase(
        "[document.cookie, window.location, navigator.userAgent]",
        removeDocumentCookieProperties,
        "[window.location, navigator.userAgent]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase024() {
    assertPolicyCase(
        "[document.cookies, theme.name, appState.currentUrl]",
        removeDocumentCookieProperties,
        "[theme.name, appState.currentUrl]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase025() {
    assertPolicyCase(
        "[document.cookie, cache.version, Number.parseInt(raw, 10)]",
        removeDocumentCookieProperties,
        "[cache.version, Number.parseInt(raw, 10)]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase026() {
    assertPolicyCase(
        "[document.cookies, location.pathname, user.profileUrl]",
        removeDocumentCookieProperties,
        "[location.pathname, user.profileUrl]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase027() {
    assertPolicyCase(
        "[document.cookie, settings.locale, history.length]",
        removeDocumentCookieProperties,
        "[settings.locale, history.length]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase028() {
    assertPolicyCase(
        "[document.cookies, state.userName, document.referrer]",
        removeDocumentCookieProperties,
        "[state.userName, document.referrer]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase029() {
    assertPolicyCase(
        "[document.cookie, analytics.track('ready'), apiClient.get('/v1/me')]",
        removeDocumentCookieProperties,
        "[analytics.track('ready'), apiClient.get('/v1/me')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase030() {
    assertPolicyCase(
        "[document.cookie, fetch('/api/page'), appState.currentUrl]",
        removeDocumentCookieProperties,
        "[fetch('/api/page'), appState.currentUrl]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase031() {
    assertPolicyCase(
        "[document.cookies, document.title, history.length]",
        removeDocumentCookieProperties,
        "[document.title, history.length]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase032() {
    assertPolicyCase(
        "[document.cookie, router.currentRoute, user.profileUrl]",
        removeDocumentCookieProperties,
        "[router.currentRoute, user.profileUrl]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase033() {
    assertPolicyCase(
        "[document.cookies, theme.name, navigator.userAgent]",
        removeDocumentCookieProperties,
        "[theme.name, navigator.userAgent]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase034() {
    assertPolicyCase(
        "[document.cookie, fetch('/api/page'), metrics.track('page')]",
        removeDocumentCookieProperties,
        "[fetch('/api/page'), metrics.track('page')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase035() {
    assertPolicyCase(
        "[document.cookies, appState.currentUrl, apiClient.get('/v1/me')]",
        removeDocumentCookieProperties,
        "[appState.currentUrl, apiClient.get('/v1/me')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase036() {
    assertPolicyCase(
        "[document.cookie, settings.locale, Number.parseInt(raw, 10)]",
        removeDocumentCookieProperties,
        "[settings.locale, Number.parseInt(raw, 10)]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase037() {
    assertPolicyCase(
        "[document.cookies, location.pathname, document.referrer]",
        removeDocumentCookieProperties,
        "[location.pathname, document.referrer]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase038() {
    assertPolicyCase(
        "[document.cookie, cache.version, state.userName]",
        removeDocumentCookieProperties,
        "[cache.version, state.userName]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase039() {
    assertPolicyCase(
        "[document.cookies, analytics.track('cookie-warning'), history.length]",
        removeDocumentCookieProperties,
        "[analytics.track('cookie-warning'), history.length]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase040() {
    assertPolicyCase(
        "[document.cookie, fetch('/api/page'), router.currentRoute]",
        removeDocumentCookieProperties,
        "[fetch('/api/page'), router.currentRoute]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase041() {
    assertPolicyCase(
        "[localStorage.getItem('token'), document.title, fetch('/api/session')]",
        removeStorageMethods,
        "[document.title, fetch('/api/session')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase042() {
    assertPolicyCase(
        "[localStorage.setItem('token', token), cookies.get('theme'), navigator.language]",
        removeStorageMethods,
        "[cookies.get('theme'), navigator.language]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase043() {
    assertPolicyCase(
        "[sessionStorage.getItem('session'), router.currentRoute, authContext.userId]",
        removeStorageMethods,
        "[router.currentRoute, authContext.userId]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase044() {
    assertPolicyCase(
        "[sessionStorage.setItem('session', value), memoryStore.get('token'), appState.sessionId]",
        removeStorageMethods,
        "[memoryStore.get('token'), appState.sessionId]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase045() {
    assertPolicyCase(
        "[localStorage.removeItem('token'), analytics.track('session'), fetch('/api/preferences')]",
        removeStorageMethods,
        "[analytics.track('session'), fetch('/api/preferences')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase046() {
    assertPolicyCase(
        "[sessionStorage.clear(), Number.parseInt(code, 10), location.pathname]",
        removeStorageMethods,
        "[Number.parseInt(code, 10), location.pathname]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase047() {
    assertPolicyCase(
        "[localStorage.key(0), userPreferences.theme, apiClient.get('/v1/flags')]",
        removeStorageMethods,
        "[userPreferences.theme, apiClient.get('/v1/flags')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase048() {
    assertPolicyCase(
        "[localStorage.getItem('cart'), state.cacheKey, cache.get('home')]",
        removeStorageMethods,
        "[state.cacheKey, cache.get('home')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase049() {
    assertPolicyCase(
        "[sessionStorage.setItem('draft', draft), document.title, metrics.track('safe-storage')]",
        removeStorageMethods,
        "[document.title, metrics.track('safe-storage')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase050() {
    assertPolicyCase(
        "[localStorage.removeItem('draft'), cookies.get('theme'), router.currentRoute]",
        removeStorageMethods,
        "[cookies.get('theme'), router.currentRoute]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase051() {
    assertPolicyCase(
        "[sessionStorage.getItem('featureFlags'), navigator.language, appState.sessionId]",
        removeStorageMethods,
        "[navigator.language, appState.sessionId]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase052() {
    assertPolicyCase(
        "[localStorage.setItem('ab', variant), analytics.track('experiment'), fetch('/api/session')]",
        removeStorageMethods,
        "[analytics.track('experiment'), fetch('/api/session')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase053() {
    assertPolicyCase(
        "[sessionStorage.clear(), memoryStore.get('token'), Number.parseInt(code, 10)]",
        removeStorageMethods,
        "[memoryStore.get('token'), Number.parseInt(code, 10)]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase054() {
    assertPolicyCase(
        "[localStorage.key(0), authContext.userId, location.pathname]",
        removeStorageMethods,
        "[authContext.userId, location.pathname]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase055() {
    assertPolicyCase(
        "[sessionStorage.setItem('session', token), cache.get('home'), apiClient.get('/v1/flags')]",
        removeStorageMethods,
        "[cache.get('home'), apiClient.get('/v1/flags')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase056() {
    assertPolicyCase(
        "[localStorage.getItem('jwt'), metrics.track('safe-storage'), userPreferences.theme]",
        removeStorageMethods,
        "[metrics.track('safe-storage'), userPreferences.theme]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase057() {
    assertPolicyCase(
        "[localStorage.setItem('jwt', token), state.cacheKey, fetch('/api/preferences')]",
        removeStorageMethods,
        "[state.cacheKey, fetch('/api/preferences')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase058() {
    assertPolicyCase(
        "[sessionStorage.getItem('prefs'), document.title, appState.sessionId]",
        removeStorageMethods,
        "[document.title, appState.sessionId]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase059() {
    assertPolicyCase(
        "[localStorage.removeItem('prefs'), router.currentRoute, navigator.language]",
        removeStorageMethods,
        "[router.currentRoute, navigator.language]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase060() {
    assertPolicyCase(
        "[sessionStorage.clear(), cookies.get('theme'), analytics.track('session')]",
        removeStorageMethods,
        "[cookies.get('theme'), analytics.track('session')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase061() {
    assertPolicyCase(
        "[eval(userInput), JSON.parse(raw), router.currentRoute]",
        removeDynamicExecution,
        "[JSON.parse(raw), router.currentRoute]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase062() {
    assertPolicyCase(
        "[Function('return data'), Number.parseInt(raw, 10), document.title]",
        removeDynamicExecution,
        "[Number.parseInt(raw, 10), document.title]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase063() {
    assertPolicyCase(
        "[eval(payload), decodeURIComponent(param), cache.get('safe')]",
        removeDynamicExecution,
        "[decodeURIComponent(param), cache.get('safe')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase064() {
    assertPolicyCase(
        "[Function('a', 'b', 'return a + b'), templateEngine.render(view), settings.environment]",
        removeDynamicExecution,
        "[templateEngine.render(view), settings.environment]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase065() {
    assertPolicyCase(
        "[eval(code), formatDate(timestamp), history.length]",
        removeDynamicExecution,
        "[formatDate(timestamp), history.length]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase066() {
    assertPolicyCase(
        "[Function('return 1'), fetch('/api/next'), window.location]",
        removeDynamicExecution,
        "[fetch('/api/next'), window.location]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase067() {
    assertPolicyCase(
        "[eval(calc), navigator.sendBeacon('/metrics'), analytics.track('safe-eval-filter')]",
        removeDynamicExecution,
        "[navigator.sendBeacon('/metrics'), analytics.track('safe-eval-filter')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase068() {
    assertPolicyCase(
        "[Function('x', 'return x'), Math.max(a, b), apiClient.get('/v1/tools')]",
        removeDynamicExecution,
        "[Math.max(a, b), apiClient.get('/v1/tools')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase069() {
    assertPolicyCase(
        "[eval(source), sanitize(input), state.currentTab]",
        removeDynamicExecution,
        "[sanitize(input), state.currentTab]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase070() {
    assertPolicyCase(
        "[Function('return payload'), JSON.parse(raw), router.currentRoute]",
        removeDynamicExecution,
        "[JSON.parse(raw), router.currentRoute]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase071() {
    assertPolicyCase(
        "[eval(userInput), decodeURIComponent(param), document.title]",
        removeDynamicExecution,
        "[decodeURIComponent(param), document.title]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase072() {
    assertPolicyCase(
        "[Function('return value'), Number.parseInt(raw, 10), history.length]",
        removeDynamicExecution,
        "[Number.parseInt(raw, 10), history.length]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase073() {
    assertPolicyCase(
        "[eval(payload), templateEngine.render(view), window.location]",
        removeDynamicExecution,
        "[templateEngine.render(view), window.location]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase074() {
    assertPolicyCase(
        "[Function('return token'), formatDate(timestamp), settings.environment]",
        removeDynamicExecution,
        "[formatDate(timestamp), settings.environment]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase075() {
    assertPolicyCase(
        "[eval(body), fetch('/api/next'), cache.get('safe')]",
        removeDynamicExecution,
        "[fetch('/api/next'), cache.get('safe')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase076() {
    assertPolicyCase(
        "[Function('x', 'return x + 1'), navigator.sendBeacon('/metrics'), analytics.track('safe')]",
        removeDynamicExecution,
        "[navigator.sendBeacon('/metrics'), analytics.track('safe')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase077() {
    assertPolicyCase(
        "[eval(raw), Math.max(a, b), state.currentTab]",
        removeDynamicExecution,
        "[Math.max(a, b), state.currentTab]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase078() {
    assertPolicyCase(
        "[Function('return json'), apiClient.get('/v1/tools'), router.currentRoute]",
        removeDynamicExecution,
        "[apiClient.get('/v1/tools'), router.currentRoute]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase079() {
    assertPolicyCase(
        "[eval(input), sanitize(input), document.title]",
        removeDynamicExecution,
        "[sanitize(input), document.title]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase080() {
    assertPolicyCase(
        "[Function('return true'), JSON.parse(raw), settings.environment]",
        removeDynamicExecution,
        "[JSON.parse(raw), settings.environment]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase081() {
    assertPolicyCase(
        "[window.open(url), fetch('/api/next'), router.currentRoute]",
        removeNavigationAndPopupMethods,
        "[fetch('/api/next'), router.currentRoute]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase082() {
    assertPolicyCase(
        "[location.assign(nextUrl), document.title, navigator.sendBeacon('/metrics')]",
        removeNavigationAndPopupMethods,
        "[document.title, navigator.sendBeacon('/metrics')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase083() {
    assertPolicyCase(
        "[location.replace(nextUrl), state.canNavigate, apiClient.post('/audit', payload)]",
        removeNavigationAndPopupMethods,
        "[state.canNavigate, apiClient.post('/audit', payload)]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase084() {
    assertPolicyCase(
        "[history.pushState(state, title, '/app'), user.id, theme.name]",
        removeNavigationAndPopupMethods,
        "[user.id, theme.name]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase085() {
    assertPolicyCase(
        "[history.replaceState(state, title, '/home'), cache.get('route'), appState.menuOpen]",
        removeNavigationAndPopupMethods,
        "[cache.get('route'), appState.menuOpen]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase086() {
    assertPolicyCase(
        "[history.back(), metrics.track('navigation-filtered'), settings.homeUrl]",
        removeNavigationAndPopupMethods,
        "[metrics.track('navigation-filtered'), settings.homeUrl]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase087() {
    assertPolicyCase(
        "[history.forward(), Number.parseInt(code, 10), document.referrer]",
        removeNavigationAndPopupMethods,
        "[Number.parseInt(code, 10), document.referrer]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase088() {
    assertPolicyCase(
        "[history.go(1), fetch('/api/next'), user.id]",
        removeNavigationAndPopupMethods,
        "[fetch('/api/next'), user.id]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase089() {
    assertPolicyCase(
        "[location.reload(), analytics.track('stay'), window.location]",
        removeNavigationAndPopupMethods,
        "[analytics.track('stay'), window.location]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase090() {
    assertPolicyCase(
        "[window.open(url), navigator.sendBeacon('/metrics'), apiClient.get('/v1/navigation')]",
        removeNavigationAndPopupMethods,
        "[navigator.sendBeacon('/metrics'), apiClient.get('/v1/navigation')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase091() {
    assertPolicyCase(
        "[renderUserCard(user), fetch('/api/users'), eval(code), navigator.sendBeacon('/events')]",
        keepOnlyNetworkCalls,
        "[fetch('/api/users'), navigator.sendBeacon('/events')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase092() {
    assertPolicyCase(
        "[sanitize(userInput), fetch('/api/projects'), logger.info(message), fetch('/api/me')]",
        keepOnlyNetworkCalls,
        "[fetch('/api/projects'), fetch('/api/me')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase093() {
    assertPolicyCase(
        "[theme.apply('dark'), fetch('/api/health'), window.open(url), navigator.sendBeacon('/errors')]",
        keepOnlyNetworkCalls,
        "[fetch('/api/health'), navigator.sendBeacon('/errors')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase094() {
    assertPolicyCase(
        "[history.pushState(state, title, '/x'), fetch('/graphql'), Math.max(a, b), fetch('/api/tasks')]",
        keepOnlyNetworkCalls,
        "[fetch('/graphql'), fetch('/api/tasks')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase095() {
    assertPolicyCase(
        "[localStorage.setItem('token', token), navigator.sendBeacon('/perf'), metrics.increment('count'), fetch('/api/notifications')]",
        keepOnlyNetworkCalls,
        "[navigator.sendBeacon('/perf'), fetch('/api/notifications')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase096() {
    assertPolicyCase(
        "[renderUserCard(user), fetch('/api/session'), sanitize(userInput), navigator.sendBeacon('/timing')]",
        keepOnlyNetworkCalls,
        "[fetch('/api/session'), navigator.sendBeacon('/timing')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase097() {
    assertPolicyCase(
        "[logger.info(message), fetch('/api/feature-flags'), eval(code), fetch('/api/messages')]",
        keepOnlyNetworkCalls,
        "[fetch('/api/feature-flags'), fetch('/api/messages')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase098() {
    assertPolicyCase(
        "[theme.apply('dark'), navigator.sendBeacon('/audit'), history.pushState(state, title, '/x'), fetch('/api/settings')]",
        keepOnlyNetworkCalls,
        "[navigator.sendBeacon('/audit'), fetch('/api/settings')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase099() {
    assertPolicyCase(
        "[Math.max(a, b), fetch('/api/users'), renderUserCard(user), navigator.sendBeacon('/metrics')]",
        keepOnlyNetworkCalls,
        "[fetch('/api/users'), navigator.sendBeacon('/metrics')]",
    );
}

export function testFilterExpressionGeneratedRealWorldCase100() {
    assertPolicyCase(
        "[eval(code), fetch('/api/projects'), localStorage.setItem('token', token), fetch('/api/search')]",
        keepOnlyNetworkCalls,
        "[fetch('/api/projects'), fetch('/api/search')]",
    );
}

function assertPolicyCaseNull(
    input: string,
    predicate: ExpressionPredicate,
): void {
    const expression = parseFromCode(input);
    const actual = filterExpression(expression, predicate);

    assert.strictEqual(actual, null);
}

function removeSensitiveNames(node: Expression): boolean {
    if (node.kind !== "NameLookupExpression") {
        return true;
    }

    return !["token", "secret", "unsafeInput", "password"].includes(node.name);
}

function removeUnsafeFunctionCalls(node: Expression): boolean {
    if (node.kind !== "FunctionCallExpression") {
        return true;
    }

    return !["eval", "Function", "setTimeout", "setInterval"].includes(
        node.functionName,
    );
}

function removeAnalyticsTrackCalls(node: Expression): boolean {
    if (node.kind !== "ObjectMethodCallExpression") {
        return true;
    }

    return !(
        node.object.name === "analytics" &&
        node.method.kind === "NameLookupExpression" &&
        node.method.name === "track"
    );
}

export function testFilterExpressionBroadShapeCase101ArithmeticDropsRightOperand() {
    assertPolicyCaseNull("total + token", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase102ArithmeticDropsLeftOperand() {
    assertPolicyCaseNull("token + total", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase103ArithmeticNestedRightCollapse() {
    assertPolicyCase(
        "base + (tax + token)",
        removeSensitiveNames,
        "base + (tax + token)",
    );
}

export function testFilterExpressionBroadShapeCase104ArithmeticNestedLeftCollapse() {
    assertPolicyCase(
        "(token + fee) + base",
        removeSensitiveNames,
        "(token + fee) + base",
    );
}

export function testFilterExpressionBroadShapeCase105ArithmeticKeepsSafeNames() {
    assertPolicyCase("subtotal + fee", removeSensitiveNames, "subtotal + fee");
}

export function testFilterExpressionBroadShapeCase106ComparisonEqualsDropsSensitiveSide() {
    assertPolicyCaseNull("token === expectedToken", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase107ComparisonNotEqualsDropsSensitiveSide() {
    assertPolicyCaseNull("status !== secret", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase108ComparisonLessThanDropsSensitiveSide() {
    assertPolicyCaseNull("score < token", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase109ComparisonMoreThanOrEqualDropsSensitiveSide() {
    assertPolicyCaseNull("password >= minScore", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase110ComparisonKeepsSafeOperands() {
    assertPolicyCase(
        "score >= minScore",
        removeSensitiveNames,
        "score >= minScore",
    );
}

export function testFilterExpressionBroadShapeCase111FunctionCallDropsSensitiveArgument() {
    assertPolicyCaseNull("hash(token, salt)", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase112FunctionCallDropsSensitiveNestedArgument() {
    assertPolicyCase(
        "encrypt(payload, format(secret))",
        removeSensitiveNames,
        "encrypt(payload, format(secret))",
    );
}

export function testFilterExpressionBroadShapeCase113FunctionCallKeepsSafeArguments() {
    assertPolicyCase(
        "encrypt(payload, format(salt))",
        removeSensitiveNames,
        "encrypt(payload, format(salt))",
    );
}

export function testFilterExpressionBroadShapeCase114FunctionCallRemovesEvalRoot() {
    assertPolicyCaseNull("eval(userCode)", removeUnsafeFunctionCalls);
}

export function testFilterExpressionBroadShapeCase115FunctionCallRemovesSetTimeoutRoot() {
    assertPolicyCaseNull(
        "setTimeout(callback, 1000)",
        removeUnsafeFunctionCalls,
    );
}

export function testFilterExpressionBroadShapeCase116FunctionCallKeepsSafeRoot() {
    assertPolicyCase(
        "parseInt(raw, 10)",
        removeUnsafeFunctionCalls,
        "parseInt(raw, 10)",
    );
}

export function testFilterExpressionBroadShapeCase117ObjectMethodCallRemovesAnalyticsTrackRoot() {
    assertPolicyCaseNull(
        "analytics.track(eventName)",
        removeAnalyticsTrackCalls,
    );
}

export function testFilterExpressionBroadShapeCase118ObjectMethodCallRemovesAnalyticsTrackWithArgs() {
    assertPolicyCaseNull(
        "analytics.track(eventName, metadata)",
        removeAnalyticsTrackCalls,
    );
}

export function testFilterExpressionBroadShapeCase119ObjectMethodCallKeepsNonTrackMethod() {
    assertPolicyCase(
        "analytics.flush(queue)",
        removeAnalyticsTrackCalls,
        "analytics.flush(queue)",
    );
}

export function testFilterExpressionBroadShapeCase120ObjectMethodCallKeepsOtherObjects() {
    assertPolicyCase(
        "metrics.track(eventName)",
        removeAnalyticsTrackCalls,
        "metrics.track(eventName)",
    );
}

export function testFilterExpressionBroadShapeCase121ObjectPropertyDropsSensitiveObjectName() {
    assertPolicyCaseNull("token.value", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase122ObjectPropertyKeepsSafeShape() {
    assertPolicyCase("session.value", removeSensitiveNames, "session.value");
}

export function testFilterExpressionBroadShapeCase123ArrayAccessDropsSensitiveArrayName() {
    assertPolicyCaseNull("token[0]", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase124ArrayAccessDropsSensitiveIndexName() {
    assertPolicyCaseNull("secret[1]", removeSensitiveNames);
}

export function testFilterExpressionBroadShapeCase125ArrayAccessDropsSensitiveNestedIndexExpression() {
    assertPolicyCase(
        "{ first: rows[0], second: rows[1] }",
        removeZeroNumbers,
        "{ second: rows[1] }",
    );
}

export function testFilterExpressionBroadShapeCase126ArrayAccessKeepsSafeIndexExpression() {
    assertPolicyCase(
        "[rows[0], rows[1], rows[2]]",
        removeZeroNumbers,
        "[rows[1], rows[2]]",
    );
}

export function testFilterExpressionBroadShapeCase127ObjectLiteralPrunesSensitivePropertyValue() {
    assertPolicyCase(
        "{ id: userId, auth: token, role: roleName }",
        removeSensitiveNames,
        "{ id: userId, role: roleName }",
    );
}

export function testFilterExpressionBroadShapeCase128ObjectLiteralPrunesNestedSensitivePropertyValue() {
    assertPolicyCase(
        "{ profile: { id: userId, secret: token }, active: isActive }",
        removeSensitiveNames,
        "{ profile: { id: userId }, active: isActive }",
    );
}

export function testFilterExpressionBroadShapeCase129ObjectLiteralKeepsSafeNestedObject() {
    assertPolicyCase(
        "{ profile: { id: userId, team: teamId }, active: isActive }",
        removeSensitiveNames,
        "{ profile: { id: userId, team: teamId }, active: isActive }",
    );
}

export function testFilterExpressionBroadShapeCase130ObjectLiteralDropsWholeNestedBranchWhenLeafRequired() {
    const removePasswords = (node: Expression): boolean => {
        return !(
            node.kind === "NameLookupExpression" && node.name === "password"
        );
    };

    assertPolicyCase(
        "{ form: { username: userName, password: password }, title: pageTitle }",
        removePasswords,
        "{ form: { username: userName }, title: pageTitle }",
    );
}

export function testFilterExpressionBroadShapeCase131ArrayLiteralPrunesSensitiveElements() {
    assertPolicyCase(
        "[userId, token, roleName, secret]",
        removeSensitiveNames,
        "[userId, roleName]",
    );
}

export function testFilterExpressionBroadShapeCase132ArrayLiteralPrunesSensitiveNestedExpressions() {
    assertPolicyCase(
        "[userId + 1, token + 1, roleName + 1]",
        removeSensitiveNames,
        "[userId + 1, roleName + 1]",
    );
}

export function testFilterExpressionBroadShapeCase133ArrayLiteralKeepsSafeExpressions() {
    assertPolicyCase(
        "[userId + 1, roleName + 1]",
        removeSensitiveNames,
        "[userId + 1, roleName + 1]",
    );
}

export function testFilterExpressionBroadShapeCase134StringLiteralDropsSensitiveEmbeddedName() {
    assertPolicyCase(
        "{ label: `token`, value: name }",
        removeStringLiteralExpressions,
        "{ value: name }",
    );
}

export function testFilterExpressionBroadShapeCase135StringLiteralKeepsSafeEmbeddedNames() {
    assertPolicyCase(
        "`id=` + userId + ` role=` + roleName",
        removeSensitiveNames,
        "`id=` + userId + ` role=` + roleName",
    );
}

export function testFilterExpressionBroadShapeCase136MixedObjectArrayCallPrunesSensitiveNodes() {
    assertPolicyCase(
        "{ calls: [hash(userId), hash(token)], current: session.id }",
        removeSensitiveNames,
        "{ calls: [hash(userId)], current: session.id }",
    );
}

export function testFilterExpressionBroadShapeCase137MixedObjectArrayCallDropsEmptyChildArrayEntries() {
    assertPolicyCase(
        "{ jobs: [process(token), process(secret), process(userId)], status: state.name }",
        removeSensitiveNames,
        "{ jobs: [process(userId)], status: state.name }",
    );
}

export function testFilterExpressionBroadShapeCase138NestedMethodCallArgumentPruneCausesRootNull() {
    assertPolicyCase(
        "[formatter.format(userId), analytics.track(eventName)]",
        removeAnalyticsTrackCalls,
        "[formatter.format(userId)]",
    );
}

export function testFilterExpressionBroadShapeCase139NestedMethodCallPruneInsideObjectLiteral() {
    assertPolicyCase(
        "{ first: analytics.track(eventName), second: analytics.flush(queue) }",
        removeAnalyticsTrackCalls,
        "{ second: analytics.flush(queue) }",
    );
}

export function testFilterExpressionBroadShapeCase140NestedFunctionCallPruneInsideObjectLiteral() {
    assertPolicyCase(
        "{ compile: Function('return a'), parse: JSON.parse(raw) }",
        removeUnsafeFunctionCalls,
        "{ parse: JSON.parse(raw) }",
    );
}

export function testFilterExpressionBroadShapeCase141NestedFunctionCallPruneInsideArrayLiteral() {
    assertPolicyCase(
        "[JSON.parse(raw), setTimeout(callback, 10), Number.parseInt(code, 10)]",
        removeUnsafeFunctionCalls,
        "[JSON.parse(raw), Number.parseInt(code, 10)]",
    );
}

export function testFilterExpressionBroadShapeCase142MultiplePredicatesCanBeComposed() {
    const combined = (node: Expression): boolean => {
        return removeSensitiveNames(node) && removeUnsafeFunctionCalls(node);
    };

    assertPolicyCase(
        "[eval(token), parseInt(code, 10), hash(secret), hash(userId)]",
        combined,
        "[parseInt(code, 10), hash(userId)]",
    );
}

export function testFilterExpressionBroadShapeCase143CombinedPredicateOnObjectLiteral() {
    const combined = (node: Expression): boolean => {
        return removeSensitiveNames(node) && removeUnsafeFunctionCalls(node);
    };

    assertPolicyCase(
        "{ run: eval(userCode), salt: token, safe: build(userId) }",
        combined,
        "{ safe: build(userId) }",
    );
}

export function testFilterExpressionBroadShapeCase144CombinedPredicateOnComparison() {
    const combined = (node: Expression): boolean => {
        return removeSensitiveNames(node) && removeUnsafeFunctionCalls(node);
    };

    assertPolicyCase(
        "{ check: eval(raw) !== token, safe: count !== limit }",
        combined,
        "{ safe: count !== limit }",
    );
}

export function testFilterExpressionBroadShapeCase145CombinedPredicateOnArrayAccess() {
    const combined = (node: Expression): boolean => {
        return removeSensitiveNames(node) && removeUnsafeFunctionCalls(node);
    };

    assertPolicyCase("rows[1]", combined, "rows[1]");
}

export function testFilterExpressionBroadShapeCase146CombinedPredicateRemovesUnsafeIndexBuilder() {
    const combined = (node: Expression): boolean => {
        return removeSensitiveNames(node) && removeUnsafeFunctionCalls(node);
    };

    assertPolicyCase(
        "{ unsafeIndex: eval(raw), safeIndex: parseInt(raw, 10) }",
        combined,
        "{ safeIndex: parseInt(raw, 10) }",
    );
}

export function testFilterExpressionBroadShapeCase147MethodCallWithArrayAccessArgumentPrunesSensitiveIndex() {
    assertPolicyCase("render(items[0])", removeZeroNumbers, "render(items[0])");
}

export function testFilterExpressionBroadShapeCase148MethodCallWithSafeArrayAccessArgument() {
    assertPolicyCase("render(items[1])", removeZeroNumbers, "render(items[1])");
}

export function testFilterExpressionBroadShapeCase149DeepNestedShapePrunesAcrossKinds() {
    assertPolicyCase(
        "{ blocks: [{ value: token }, { value: userId }], flags: [secret, roleName] }",
        removeSensitiveNames,
        "{ blocks: [{}, { value: userId }], flags: [roleName] }",
    );
}

export function testFilterExpressionBroadShapeCase150DeepNestedShapeKeepsValidBranches() {
    assertPolicyCase(
        "{ blocks: [{ value: userId }, { value: roleName }], calc: total + fee }",
        removeSensitiveNames,
        "{ blocks: [{ value: userId }, { value: roleName }], calc: total + fee }",
    );
}

function removeMutationExpressions(node: Expression): boolean {
    return (
        node.kind !== "IncrementExpression" &&
        node.kind !== "DecrementExpression"
    );
}

function isStringLiteralValue(node: Expression, expected: string): boolean {
    return (
        node.kind === "StringLiteralExpression" &&
        node.values.length === 1 &&
        node.values[0].kind === "StringExpression" &&
        node.values[0].value === expected
    );
}

function removeSensitivePropertyAccess(node: Expression): boolean {
    if (node.kind !== "ObjectPropertyExpression") {
        return true;
    }

    if (node.property.kind === "NameLookupExpression") {
        return !["password", "token"].includes(node.property.name);
    }

    return !(
        isStringLiteralValue(node.property, "password") ||
        isStringLiteralValue(node.property, "token")
    );
}

function removeNullAndFalseLiterals(node: Expression): boolean {
    if (node.kind === "NullExpression") {
        return false;
    }

    return !(node.kind === "BooleanExpression" && node.value === false);
}

function removeZeroNumbers(node: Expression): boolean {
    return !(node.kind === "NumberExpression" && node.value === 0);
}

function removeStringLiteralExpressions(node: Expression): boolean {
    return node.kind !== "StringLiteralExpression";
}

export function testFilterExpressionBroadShapeCase151MutationIncrementRootIsRemoved() {
    assertPolicyCaseNull("count++", removeMutationExpressions);
}

export function testFilterExpressionBroadShapeCase152MutationDecrementRootIsRemoved() {
    assertPolicyCaseNull("count--", removeMutationExpressions);
}

export function testFilterExpressionBroadShapeCase153MutationIncrementPrunedFromObjectLiteral() {
    assertPolicyCase(
        "{ next: count++, stable: value }",
        removeMutationExpressions,
        "{ stable: value }",
    );
}

export function testFilterExpressionBroadShapeCase154MutationDecrementPrunedFromObjectLiteral() {
    assertPolicyCase(
        "{ previous: count--, stable: value }",
        removeMutationExpressions,
        "{ stable: value }",
    );
}

export function testFilterExpressionBroadShapeCase155MutationPrunedFromArrayLiteral() {
    assertPolicyCase(
        "[count++, value, other]",
        removeMutationExpressions,
        "[value, other]",
    );
}

export function testFilterExpressionBroadShapeCase156MutationBothKindsPrunedFromArrayLiteral() {
    assertPolicyCase(
        "[count++, count--, value]",
        removeMutationExpressions,
        "[value]",
    );
}

export function testFilterExpressionBroadShapeCase157MutationAsFunctionArgumentRemovesCall() {
    assertPolicyCaseNull("record(count++, userId)", removeMutationExpressions);
}

export function testFilterExpressionBroadShapeCase158MutationAsMethodArgumentRemovesCall() {
    assertPolicyCase(
        "{ step: count--, label: tracker.step(1) }",
        removeMutationExpressions,
        "{ label: tracker.step(1) }",
    );
}

export function testFilterExpressionBroadShapeCase159MutationInComparisonRemovesExpression() {
    assertPolicyCase(
        "{ check: count++ !== limit, label: value }",
        removeMutationExpressions,
        "{ label: value }",
    );
}

export function testFilterExpressionBroadShapeCase160MutationPredicateKeepsPureExpressions() {
    assertPolicyCase(
        "record(currentCount, userId)",
        removeMutationExpressions,
        "record(currentCount, userId)",
    );
}

export function testFilterExpressionBroadShapeCase161SensitiveBracketPasswordRootRemoved() {
    assertPolicyCaseNull('user["password"]', removeSensitivePropertyAccess);
}

export function testFilterExpressionBroadShapeCase162SensitiveBracketTokenRootRemoved() {
    assertPolicyCaseNull('user["token"]', removeSensitivePropertyAccess);
}

export function testFilterExpressionBroadShapeCase163SafePropertyAccessIsKept() {
    assertPolicyCase(
        "user.profile",
        removeSensitivePropertyAccess,
        "user.profile",
    );
}

export function testFilterExpressionBroadShapeCase164SensitiveBracketPrunedFromArrayLiteral() {
    assertPolicyCase(
        '[user["password"], user["name"]]',
        removeSensitivePropertyAccess,
        '[user["name"]]',
    );
}

export function testFilterExpressionBroadShapeCase165SensitiveBracketPrunedFromObjectLiteral() {
    assertPolicyCase(
        '{ passwordValue: user["password"], nameValue: user["name"] }',
        removeSensitivePropertyAccess,
        '{ nameValue: user["name"] }',
    );
}

export function testFilterExpressionBroadShapeCase166SensitiveBracketFunctionArgumentRemovesCall() {
    assertPolicyCaseNull(
        'audit(user["token"], userId)',
        removeSensitivePropertyAccess,
    );
}

export function testFilterExpressionBroadShapeCase167SensitiveBracketInComparisonRemovesExpression() {
    assertPolicyCaseNull(
        'audit(user["password"], storedHash)',
        removeSensitivePropertyAccess,
    );
}

export function testFilterExpressionBroadShapeCase168SensitiveBracketInArithmeticRemovesExpression() {
    assertPolicyCaseNull(
        'user["token"] + suffix',
        removeSensitivePropertyAccess,
    );
}

export function testFilterExpressionBroadShapeCase169SensitiveBracketPrunedInsideNestedObject() {
    assertPolicyCase(
        '{ auth: { secret: user["token"], id: userId }, active: isActive }',
        removeSensitivePropertyAccess,
        "{ auth: { id: userId }, active: isActive }",
    );
}

export function testFilterExpressionBroadShapeCase170SensitiveBracketMethodArgumentRemovesCall() {
    assertPolicyCaseNull(
        'send(user["password"])',
        removeSensitivePropertyAccess,
    );
}

export function testFilterExpressionBroadShapeCase171NullRootIsRemoved() {
    assertPolicyCaseNull("null", removeNullAndFalseLiterals);
}

export function testFilterExpressionBroadShapeCase172FalseRootIsRemoved() {
    assertPolicyCaseNull("false", removeNullAndFalseLiterals);
}

export function testFilterExpressionBroadShapeCase173NullAndFalsePrunedFromArrayLiteral() {
    assertPolicyCase(
        "[true, false, null]",
        removeNullAndFalseLiterals,
        "[true]",
    );
}

export function testFilterExpressionBroadShapeCase174NullAndFalsePrunedFromObjectLiteral() {
    assertPolicyCase(
        "{ a: null, b: false, c: true }",
        removeNullAndFalseLiterals,
        "{ c: true }",
    );
}

export function testFilterExpressionBroadShapeCase175NullInComparisonRemovesExpression() {
    assertPolicyCase(
        "{ check: value !== null, label: name }",
        removeNullAndFalseLiterals,
        "{ label: name }",
    );
}

export function testFilterExpressionBroadShapeCase176FalseInComparisonRemovesExpression() {
    assertPolicyCase(
        "{ check: flag !== false, label: name }",
        removeNullAndFalseLiterals,
        "{ label: name }",
    );
}

export function testFilterExpressionBroadShapeCase177NullAsFunctionArgumentRemovesCall() {
    assertPolicyCaseNull("save(userId, null)", removeNullAndFalseLiterals);
}

export function testFilterExpressionBroadShapeCase178FalseAsMethodArgumentRemovesCall() {
    assertPolicyCaseNull('save("k", false)', removeNullAndFalseLiterals);
}

export function testFilterExpressionBroadShapeCase179NullInArithmeticRemovesExpression() {
    assertPolicyCaseNull("total + null", removeNullAndFalseLiterals);
}

export function testFilterExpressionBroadShapeCase180NullAsArrayIndexRemovesExpression() {
    assertPolicyCase(
        "{ items: [null, name, true], label: label }",
        removeNullAndFalseLiterals,
        "{ items: [name, true], label: label }",
    );
}

export function testFilterExpressionBroadShapeCase181ZeroNumberRootIsRemoved() {
    assertPolicyCaseNull("0", removeZeroNumbers);
}

export function testFilterExpressionBroadShapeCase182ZeroNumberPrunedFromArrayLiteral() {
    assertPolicyCase("[0, 1, 2]", removeZeroNumbers, "[1, 2]");
}

export function testFilterExpressionBroadShapeCase183ZeroNumberPrunedFromObjectLiteral() {
    assertPolicyCase("{ start: 0, end: 10 }", removeZeroNumbers, "{ end: 10 }");
}

export function testFilterExpressionBroadShapeCase184ZeroNumberAsFunctionArgumentRemovesCall() {
    assertPolicyCaseNull("parseInt(code, 0)", removeZeroNumbers);
}

export function testFilterExpressionBroadShapeCase185ZeroNumberAsRightArithmeticOperandRemovesExpression() {
    assertPolicyCaseNull("value + 0", removeZeroNumbers);
}

export function testFilterExpressionBroadShapeCase186ZeroNumberAsLeftArithmeticOperandRemovesExpression() {
    assertPolicyCaseNull("0 + value", removeZeroNumbers);
}

export function testFilterExpressionBroadShapeCase187ZeroNumberInMultiplicationRemovesExpression() {
    assertPolicyCaseNull("value * 0", removeZeroNumbers);
}

export function testFilterExpressionBroadShapeCase188ZeroNumberAsArrayIndexRemovesExpression() {
    assertPolicyCaseNull("rows[0]", removeZeroNumbers);
}

export function testFilterExpressionBroadShapeCase189ZeroNumberInComparisonRemovesExpression() {
    assertPolicyCaseNull("user.age >= 0", removeZeroNumbers);
}

export function testFilterExpressionBroadShapeCase190NonZeroNumbersAreKept() {
    assertPolicyCase("value + 1", removeZeroNumbers, "value + 1");
}

export function testFilterExpressionBroadShapeCase191TemplateLiteralRootIsRemoved() {
    assertPolicyCaseNull("`hello`", removeStringLiteralExpressions);
}

export function testFilterExpressionBroadShapeCase192TemplateLiteralInAdditionRemovesExpression() {
    assertPolicyCaseNull("`id=` + userId", removeStringLiteralExpressions);
}

export function testFilterExpressionBroadShapeCase193TemplateLiteralsPrunedFromArrayLiteral() {
    assertPolicyCase(
        "[`a`, name, `b`]",
        removeStringLiteralExpressions,
        "[name]",
    );
}

export function testFilterExpressionBroadShapeCase194TemplateLiteralPrunedFromObjectLiteral() {
    assertPolicyCase(
        "{ label: `name`, value: name }",
        removeStringLiteralExpressions,
        "{ value: name }",
    );
}

export function testFilterExpressionBroadShapeCase195BracketPropertyStringLiteralRemovalNullsExpression() {
    assertPolicyCaseNull('obj["key"]', removeStringLiteralExpressions);
}

export function testFilterExpressionBroadShapeCase196TemplateLiteralFunctionArgumentRemovesCall() {
    assertPolicyCaseNull(
        "format(`prefix`, name)",
        removeStringLiteralExpressions,
    );
}

export function testFilterExpressionBroadShapeCase197TemplateLiteralMethodArgumentRemovesCall() {
    assertPolicyCaseNull(
        "format(userId, `event`)",
        removeStringLiteralExpressions,
    );
}

export function testFilterExpressionBroadShapeCase198NestedTemplateLiteralPrunedFromObjectLiteral() {
    assertPolicyCase(
        "{ meta: { tag: `v1`, id: id }, ok: true }",
        removeStringLiteralExpressions,
        "{ meta: { id: id }, ok: true }",
    );
}

export function testFilterExpressionBroadShapeCase199PlainStringExpressionIsKept() {
    assertPolicyCase('"plain"', removeStringLiteralExpressions, '"plain"');
}

export function testFilterExpressionBroadShapeCase200TemplateLiteralPrunedFromMixedArray() {
    assertPolicyCase(
        "[build(id), `debug`, parseInt(code, 10)]",
        removeStringLiteralExpressions,
        "[build(id), parseInt(code, 10)]",
    );
}
