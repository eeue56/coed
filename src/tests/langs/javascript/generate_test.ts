import * as assert from "assert";
import { javascript } from "../../../langs/javascript/index.ts";
import type { Program } from "../../../langs/javascript/types.ts";
import type { Result } from "../../../langs/types.ts";

function expectOk<T>(result: Result<T>): T {
    if (result.kind !== "Ok") {
        throw new Error(result.error);
    }

    return result.value;
}

function assertMatchingParsedAndGeneratedCode(code: string) {
    const program = expectOk<Program>(javascript.parse(code));

    assert.strictEqual(javascript.generate(program), code);
}

function assertGeneratedFromSource(input: string, expected: string) {
    const program = expectOk<Program>(javascript.parse(input));

    assert.strictEqual(javascript.generate(program), expected);
}

export function testGenerateObjectsAndArrays() {
    assertMatchingParsedAndGeneratedCode(
        `
const settings = { "theme": "light", "retries": 3 };

let queue = [1, 2, 3];
        `.trim(),
    );
}

export function testGenerateObjectsAndArraysIsNormalized() {
    const program = expectOk<Program>(
        javascript.parse(
            `
const settings = { theme: "light", retries: 3 };
let queue = [1, 2, 3];
        `.trim(),
        ),
    );

    const expected = `
const settings = { "theme": "light", "retries": 3 };

let queue = [1, 2, 3];
        `.trim();

    assert.strictEqual(javascript.generate(program), expected);
}

export function testGenerateIfAndForStatements() {
    assertMatchingParsedAndGeneratedCode(
        `
if (ready) {
    let current = { "count": 1, "values": [1, 2] };
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
        let result = { "items": list };
    } else {
        const result = { "items": [] };
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

export function testGenerateTypeStrippedDeclarationsAndFunctions() {
    assertGeneratedFromSource(
        `
let retryCount: number = 3;
const isReady: boolean = true;
function formatName(name: string): string {
    return name;
}
const scale = (value: number): number => value;
let finalName = value as string;
        `.trim(),
        `
let retryCount = 3;

const isReady = true;

function formatName(name) {
    return name;
}

function scale(value) {
    let result = value;
}

let finalName = value;
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
const dashboardState = { "widgets": [1, 2], "filters": { "active": true, "region": "eu" } };
        `.trim(),
    );
}

export function testGenerateNestedCollectionsIsNormalized() {
    const code = `
const dashboardState = { widgets: [1, 2], filters: { active: true, region: "eu" } };
        `.trim();

    const program = expectOk<Program>(javascript.parse(code));

    const expected = `
const dashboardState = { "widgets": [1, 2], "filters": { "active": true, "region": "eu" } };
        `.trim();

    assert.strictEqual(javascript.generate(program), expected);
}

export function testGenerateArrayOfObjects() {
    assertMatchingParsedAndGeneratedCode(
        `
const releasePlan = [{ "version": 1 }, { "version": 2 }];
        `.trim(),
    );
}

export function testGenerateNestedArraysInsideObjects() {
    assertMatchingParsedAndGeneratedCode(
        `
let analyticsSummary = { "weeklyTotals": [1, 2, 3], "monthlyTotals": [4, 5] };
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

export function testGenerateLogicalAndOrExpressions() {
    assertMatchingParsedAndGeneratedCode(
        `
let canProceed = isEnabled && hasCapacity || isAdmin;
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

export function testGenerateStringLiteralExpression() {
    assertMatchingParsedAndGeneratedCode(
        `
const name = "noah";

let greeting = \`hello \${name}\`;
        `.trim(),
    );
}

export function testGenerateStringWithEscapedQuote() {
    assertGeneratedFromSource(
        `
const message = 'Enemy\\'s turn';
        `.trim(),
        `
const message = "Enemy's turn";
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
    let workspaceState = { "teamId": teamId, "members": [1, 2], "flags": { "active": true } };
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

export function testGenerateClass() {
    assertMatchingParsedAndGeneratedCode(
        `
class FishFrog {}
        `.trim(),
    );
}

export function testGenerateClassWithProperties() {
    assertMatchingParsedAndGeneratedCode(
        `
class GridEntity {
    constructor(col, row, type) {
        this.col = col;
        this.row = row;
        this.type = type;
        this.hp = 50;
        this.maxHp = 50;
        this.element = document.createElement("div");
        this.element.className = "grid-entity";
        this.element.setAttribute("data-type", type);
        this.render();
    }
    render() {
        this.element.style.left = this.col * GRID_SIZE + "px";
        this.element.style.top = this.row * GRID_SIZE + "px";
        this.element.textContent = animalEmojis[this.type] || "?";
        gameGrid.appendChild(this.element);
    }
    remove() {
        this.element.remove();
        gridEntities = gridEntities.filter((e) => e !== this);
    }
}`.trim(),
    );
}

export function testGenerateComplexForLoop() {
    assertGeneratedFromSource(
        `
for (let i = 0; i < 12; i++) {
    let col = Math.floor(Math.random() * GRID_WIDTH);
    let row = Math.floor(Math.random() * GRID_HEIGHT);
    let isBlocked =
        (col === playerCol && row === playerRow) ||
        gridEntities.some((e) => e.col === col && e.row === row);
    const type =
        animalTypes[Math.floor(Math.random() * animalTypes.length)];
    gridEntities.push(new GridEntity(col, row, type));
}`.trim(),
        `
for (let i = 0; i < 12; i++) {
    let col = Math.floor(Math.random() * GRID_WIDTH);
    let row = Math.floor(Math.random() * GRID_HEIGHT);
    let isBlocked = col === playerCol && row === playerRow || gridEntities.some((e) => e.col === col && e.row === row);
    const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    gridEntities.push(new GridEntity(col, row, type));
}`.trim(),
    );
}

export function testGenerateComplexIf() {
    assertMatchingParsedAndGeneratedCode(
        `function playerAttack(moveIndex) {
    if (!battleState.playerTurn || !inBattle) return;
    const move = moves[moveIndex];
    battleState.playerTurn = false;
    const hit = Math.random() < move.accuracy;
    if (hit) {
        const damage = Math.floor(Math.random() * 20 + move.power * 0.8);
        battleState.enemyHp = Math.max(0, battleState.enemyHp - damage);
        battleLog.innerHTML +=
            "<p>You used " + move.name + " for " + damage + " damage!</p>";
    } else {
        battleLog.innerHTML += "<p>" + move.name + " missed!</p>";
    }
    updateBattleUI();
    if (battleState.enemyHp <= 0) {
        battleLog.innerHTML += "<p>You won! +50 Score!</p>";
        endBattle(true);
        return;
    }
    setTimeout(enemyAttack, 1000);
}`.trim(),
    );
}

export function testGenerateDocumentMethodCall() {
    assertMatchingParsedAndGeneratedCode(
        `
document.addEventListener("keydown", (e) => {
    if (inBattle) return;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        movePlayer(0, -1);
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        movePlayer(0, 1);
    } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        movePlayer(-1, 0);
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        movePlayer(1, 0);
    }
});`.trim(),
    );

    const parsedJavascript = javascript.parse(
        `document.addEventListener('DOMContentLoaded',function(){const battleScreen=document.getElementById('battle-screen');if(battleScreen&&!battleScreen.classList.contains('hidden')){battleScreen.classList.remove('hidden');}const moveBtns=document.querySelectorAll('.move-btn');moveBtns.forEach(btn=>{btn.addEventListener('click',function(){const moveIndex=this.getAttribute('data-move');const battleLog=document.getElementById('battle-log');if(battleLog){const entry=document.createElement('p');entry.textContent='Move '+moveIndex+' selected!';battleLog.appendChild(entry);battleLog.scrollTop=battleLog.scrollHeight;}});});});`,
    );

    assert.deepStrictEqual(parsedJavascript.kind, "Ok");
    assert.deepStrictEqual(
        javascript.generate(parsedJavascript.value),
        `
document.addEventListener("DOMContentLoaded", () => {
    const battleScreen = document.getElementById("battle-screen");
    if (battleScreen && !battleScreen.classList.contains("hidden")) {
        battleScreen.classList.remove("hidden");
    }
    const moveBtns = document.querySelectorAll(".move-btn");
    moveBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const moveIndex = this.getAttribute("data-move");
            const battleLog = document.getElementById("battle-log");
            if (battleLog) {
                const entry = document.createElement("p");
                entry.textContent = "Move " + moveIndex + " selected!";
                battleLog.appendChild(entry);
                battleLog.scrollTop = battleLog.scrollHeight;
            }
        });
    });
});`.trim(),
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
    let displayName = profileState[\`displayName\`];
}
        `.trim(),
    );
}

export function testGenerateFunctionWithPropertyLookupAndMethodCallGetsDoubleQuoteNormalized() {
    const program = expectOk<Program>(
        javascript.parse(
            `
function refreshProfile(accountId) {
    let profileState = apiClient.fetchProfile(accountId);
    let displayName = profileState["displayName"];
}
        `.trim(),
        ),
    );

    const expectedOutcome = `
function refreshProfile(accountId) {
    let profileState = apiClient.fetchProfile(accountId);
    let displayName = profileState[\`displayName\`];
}
        `.trim();

    assert.strictEqual(javascript.generate(program), expectedOutcome);
}

export function testGenerateFunctionWithPropertyLookupAndMethodCallGetsSingleQuoteNormalized() {
    const program = expectOk<Program>(
        javascript.parse(
            `
function refreshProfile(accountId) {
    let profileState = apiClient.fetchProfile(accountId);
    let displayName = profileState['displayName'];
}
        `.trim(),
        ),
    );

    const expectedOutcome = `
function refreshProfile(accountId) {
    let profileState = apiClient.fetchProfile(accountId);
    let displayName = profileState[\`displayName\`];
}
        `.trim();

    assert.strictEqual(javascript.generate(program), expectedOutcome);
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
const quotaSnapshot = { "used": usedSeats, "remaining": maxSeats - usedSeats };
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
    const result = javascript.parse(
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
