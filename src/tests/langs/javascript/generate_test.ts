import * as assert from "assert";
import { generateProgram } from "../../../langs/javascript/generate.ts";
import { parse } from "../../../langs/javascript/parse.ts";
import type { Program, Result } from "../../../langs/javascript/types.ts";

function expectOk<T>(result: Result<T>): T {
    if (result.kind !== "Ok") {
        throw new Error(result.error);
    }

    return result.value;
}

function assertMatchingParsedAndGeneratedCode(code: string) {
    const program = expectOk<Program>(parse(code));

    assert.strictEqual(generateProgram(program), code);
}

function assertGeneratedFromSource(input: string, expected: string) {
    const program = expectOk<Program>(parse(input));

    assert.strictEqual(generateProgram(program), expected);
}

export function testGenerateObjectsAndArrays() {
    assertMatchingParsedAndGeneratedCode(
        `
const settings = { theme: "light", retries: 3 };
let queue = [1, 2, 3];
        `.trim(),
    );
}

export function testGenerateIfAndForStatements() {
    assertMatchingParsedAndGeneratedCode(
        `
if (ready) {
    let current = { count: 1, values: [1, 2] };
} else {
    const fallback = [0];
}
for (let i = 0; i < 3; i++) {
    let row = [i, 2];
}
        `.trim(),
    );
}

export function testGenerateFunctionsWithNestedLanguageFeatures() {
    assertMatchingParsedAndGeneratedCode(
        `
function build(items) {
    let list = [1, 2];
    if (items) {
        let result = { items: list };
    } else {
        const result = { items: [] };
    }
    for (let i = 0; i < 2; i++) {
        let pair = [i, 1];
    }
}
        `.trim(),
    );
}

export function testGeneratePrimitiveFlagsAndCounters() {
    assertMatchingParsedAndGeneratedCode(
        `
const featureEnabled = true;
let retryCount = 3;
        `.trim(),
    );
}

export function testGenerateNullAndFallbackValues() {
    assertMatchingParsedAndGeneratedCode(
        `
const lastSyncedAt = null;
let isArchived = false;
        `.trim(),
    );
}

export function testGenerateEmptyCollections() {
    assertMatchingParsedAndGeneratedCode(
        `
const emptyPreferences = {};
let pendingJobs = [];
        `.trim(),
    );
}

export function testGenerateNestedCollections() {
    assertMatchingParsedAndGeneratedCode(
        `
const dashboardState = { widgets: [1, 2], filters: { active: true, region: "eu" } };
        `.trim(),
    );
}

export function testGenerateArrayOfObjects() {
    assertMatchingParsedAndGeneratedCode(
        `
const releasePlan = [{ version: 1 }, { version: 2 }];
        `.trim(),
    );
}

export function testGenerateNestedArraysInsideObjects() {
    assertMatchingParsedAndGeneratedCode(
        `
let analyticsSummary = { weeklyTotals: [1, 2, 3], monthlyTotals: [4, 5] };
        `.trim(),
    );
}

export function testGenerateAdditionAndMultiplication() {
    assertMatchingParsedAndGeneratedCode(
        `
let invoiceTotal = subtotal + taxRate * quantity;
        `.trim(),
    );
}

export function testGenerateSubtractionAndDivision() {
    assertMatchingParsedAndGeneratedCode(
        `
const netRevenue = grossRevenue - refunds / activeMonths;
        `.trim(),
    );
}

export function testGenerateEqualityComparison() {
    assertMatchingParsedAndGeneratedCode(
        `
let shouldRefresh = activeRoute === nextRoute;
        `.trim(),
    );
}

export function testGenerateInequalityComparison() {
    assertMatchingParsedAndGeneratedCode(
        `
const hasMismatch = expectedOwner !== actualOwner;
        `.trim(),
    );
}

export function testGenerateLessThanComparison() {
    assertMatchingParsedAndGeneratedCode(
        `
let seatsAvailable = usedSeats < totalSeats;
        `.trim(),
    );
}

export function testGenerateMoreThanComparison() {
    assertMatchingParsedAndGeneratedCode(
        `
const backlogExceeded = openTickets > targetTickets;
        `.trim(),
    );
}

export function testGenerateLessThanOrEqualComparison() {
    assertMatchingParsedAndGeneratedCode(
        `
let canRetry = retryCount <= maxRetries;
        `.trim(),
    );
}

export function testGenerateMoreThanOrEqualComparison() {
    assertMatchingParsedAndGeneratedCode(
        `
const shouldEscalate = waitMinutes >= thresholdMinutes;
        `.trim(),
    );
}

export function testGenerateFunctionCallWithMultipleArguments() {
    assertMatchingParsedAndGeneratedCode(
        `
let formattedAddress = formatAddress(streetLine, cityName, postCode);
        `.trim(),
    );
}

export function testGenerateObjectPropertyLookup() {
    assertMatchingParsedAndGeneratedCode(
        `
let customerName = orderSummary.customerName;
        `.trim(),
    );
}

export function testGenerateObjectMethodCall() {
    assertMatchingParsedAndGeneratedCode(
        `
let sessionToken = authClient.getToken(accountId);
        `.trim(),
    );
}

export function testGenerateArrayAccessLookup() {
    assertMatchingParsedAndGeneratedCode(
        `
let firstInvoice = invoiceIds[0];
        `.trim(),
    );
}

export function testGenerateIncrementExpressionAssignment() {
    assertMatchingParsedAndGeneratedCode(
        `
let nextPage = pageIndex++;
        `.trim(),
    );
}

export function testGenerateDecrementExpressionAssignment() {
    assertMatchingParsedAndGeneratedCode(
        `
let previousPage = pageIndex--;
        `.trim(),
    );
}

export function testGenerateIfWithoutElseBranch() {
    assertMatchingParsedAndGeneratedCode(
        `
if (hasDraft) {
    let currentDraft = draftStore.latest;
}
        `.trim(),
    );
}

export function testGenerateNestedIfElseBranches() {
    assertMatchingParsedAndGeneratedCode(
        `
if (accountActive) {
    if (hasOverdueInvoice) {
        let bannerState = "warning";
    } else {
        const bannerState = "clear";
    }
} else {
    const bannerState = "disabled";
}
        `.trim(),
    );
}

export function testGenerateForLoopCountingUp() {
    assertMatchingParsedAndGeneratedCode(
        `
for (let orderIndex = 0; orderIndex < 3; orderIndex++) {
    let orderLabel = orderIndex;
}
        `.trim(),
    );
}

export function testGenerateForLoopCountingDown() {
    assertMatchingParsedAndGeneratedCode(
        `
for (let dayOffset = 7; dayOffset > 0; dayOffset--) {
    let reviewDay = dayOffset;
}
        `.trim(),
    );
}

export function testGenerateFunctionWithComparisonLogic() {
    assertMatchingParsedAndGeneratedCode(
        `
function canViewDashboard(userRole, requiredRole) {
    let isAllowed = userRole === requiredRole;
}
        `.trim(),
    );
}

export function testGenerateFunctionWithForLoopIteration() {
    assertMatchingParsedAndGeneratedCode(
        `
function buildTimeline(eventIds) {
    for (let eventIndex = 0; eventIndex < 2; eventIndex++) {
        let timelineEntry = eventIds[0];
    }
}
        `.trim(),
    );
}

export function testGenerateFunctionWithNestedCollections() {
    assertMatchingParsedAndGeneratedCode(
        `
function loadWorkspace(teamId) {
    let workspaceState = { teamId: teamId, members: [1, 2], flags: { active: true } };
}
        `.trim(),
    );
}

export function testGenerateFunctionWithNestedIfAndLoop() {
    assertMatchingParsedAndGeneratedCode(
        `
function syncMailbox(unreadCount) {
    if (unreadCount > 0) {
        for (let messageIndex = 0; messageIndex < 2; messageIndex++) {
            let mailboxEntry = messageIndex;
        }
    } else {
        const mailboxEntry = null;
    }
}
        `.trim(),
    );
}

export function testGenerateMultiStatementWorkflow() {
    assertMatchingParsedAndGeneratedCode(
        `
const regionCode = "eu";
let dashboardTitle = formatTitle(regionCode, "sales");
if (dashboardTitle !== "archived") {
    let currentView = dashboardTitle;
}
        `.trim(),
    );
}

export function testGenerateChainedProgramWithSharedNames() {
    assertMatchingParsedAndGeneratedCode(
        `
function createReminder(userId, deliveryChannel) {
    let reminderPayload = notifyUser(userId, deliveryChannel);
}
const reminderChannel = "email";
let reminderEnabled = reminderChannel === "email";
        `.trim(),
    );
}

export function testGenerateFunctionWithPropertyLookupAndMethodCall() {
    assertMatchingParsedAndGeneratedCode(
        `
function refreshProfile(accountId) {
    let profileState = apiClient.fetchProfile(accountId);
    let displayName = profileState.displayName;
}
        `.trim(),
    );
}

export function testGenerateObjectMethodCallWithArrayAccessArgument() {
    assertMatchingParsedAndGeneratedCode(
        `
let supportTicket = ticketBuilder.create(accountId, issueCounts[0]);
        `.trim(),
    );
}

export function testGenerateObjectWithArithmeticProperties() {
    assertMatchingParsedAndGeneratedCode(
        `
const quotaSnapshot = { used: usedSeats, remaining: maxSeats - usedSeats };
        `.trim(),
    );
}

export function testGenerateVarUndefinedAsApprovedSubset() {
    assertGeneratedFromSource(
        `
var currentUser = undefined;
        `.trim(),
        `
let currentUser = null;
        `.trim(),
    );
}

export function testGenerateWhileLoopAsForLoop() {
    assertGeneratedFromSource(
        `
while (hasPendingSync) {
    let syncAttempt = retryCount;
}
        `.trim(),
        `
for (let __while_0 = 0; hasPendingSync; __while_0++) {
    let syncAttempt = retryCount;
}
        `.trim(),
    );
}

export function testGenerateWithBlockReturnsErr() {
    const result = parse(
        `
with (dashboardState) {
    const selectedTheme = themeName;
}
        `.trim(),
    );

    assert.deepStrictEqual(result, {
        kind: "Err",
        error:
            "I got stuck while parsing your JavaScript.\n" +
            "\n" +
            "Problem: The `with` statement is not allowed in this JavaScript subset.\n" +
            "Hint: `with` is infrequently used, deprecated, and usually only valuable in niche style-driven cases. Rewrite it using explicit property access or by assigning the object to a named variable first.\n" +
            "\n" +
            "At line 1, column 1:\n" +
            "with (dashboardState) {\n" +
            "^",
    });
}

export function testGenerateArrowFunctionExpressionAsFunctionDeclaration() {
    assertGeneratedFromSource(
        `
const buildInvoice = (subtotal, taxRate) => subtotal + taxRate;
        `.trim(),
        `
function buildInvoice(subtotal, taxRate) {
    let result = subtotal + taxRate;
}
        `.trim(),
    );
}

export function testGenerateArrowFunctionBlockBodyAsFunctionDeclaration() {
    assertGeneratedFromSource(
        `
let createBanner = () => {
    const bannerState = true;
};
        `.trim(),
        `
function createBanner() {
    const bannerState = true;
}
        `.trim(),
    );
}

export function testGenerateReturnWithValue() {
    assertMatchingParsedAndGeneratedCode(
        `
function getCurrentRoute(routeName) {
    return routeName;
}
        `.trim(),
    );
}

export function testGenerateReturnWithoutValue() {
    assertMatchingParsedAndGeneratedCode(
        `
function stopSync() {
    return;
}
        `.trim(),
    );
}

export function testGenerateBreakAndContinueInLoop() {
    assertMatchingParsedAndGeneratedCode(
        `
for (let retryIndex = 0; retryIndex < 3; retryIndex++) {
    continue;
    break;
}
        `.trim(),
    );
}
