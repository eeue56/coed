import * as assert from "assert";
import { javascript } from "../../../langs/javascript/index.ts";
import type {
    Expression,
    FunctionDeclaration,
    Program,
    Purity,
} from "../../../langs/javascript/types.ts";

function parseProgram(source: string): Program {
    const result = javascript.parse(source);
    if (result.kind !== "Ok") {
        throw new Error(result.error);
    }
    return result.value;
}

function assertPurity(source: string, expected: Purity): void {
    assert.strictEqual(
        javascript.checkPurity(parseProgram(source)),
        expected,
        source,
    );
}

export function testPureProgram(): void {
    assert.strictEqual(
        javascript.checkPurity(
            parseProgram("function add(a, b) { return a + b; }"),
        ),
        "Pure",
    );
}

export function testLocalMutationIsPure(): void {
    assert.strictEqual(
        javascript.checkPurity(
            parseProgram("function count() { let value = 0; value++; }"),
        ),
        "Pure",
    );
}

export function testObjectMutationModifiesInputs(): void {
    assert.strictEqual(
        javascript.checkPurity(
            parseProgram("function update(input) { input.value = 1; }"),
        ),
        "ModifiesInputs",
    );
}

export function testArrayMutationModifiesInputs(): void {
    assert.strictEqual(
        javascript.checkPurity(
            parseProgram("function append(values) { values.push(1); }"),
        ),
        "ModifiesInputs",
    );
}

export function testUnknownFunctionCallHasSideEffects(): void {
    assert.strictEqual(
        javascript.checkPurity(
            parseProgram("function load() { fetch('/data'); }"),
        ),
        "HasSideEffects",
    );
}

export function testFunctionPurityPropagatesToCaller(): void {
    assert.strictEqual(
        javascript.checkPurity(
            parseProgram(
                "function update(input) { mutate(input); } function mutate(input) { input.value = 1; }",
            ),
        ),
        "ModifiesInputs",
    );
}

export function testPureValueAndLocalStateExamples(): void {
    const examples = [
        "const score = 0;",
        "function total(items) { return items.length + 1; }",
        "function describe(item) { return { label: item.name, values: [1, 2, 3] }; }",
        "function formatName(name) { const trimmed = name; trimmed = trimmed + '!'; return trimmed; }",
        "function choose(value) { if (value > 0) { return value * 2; } else { return 0; } }",
        "function sumTo(limit) { let total = 0; for (let index = 0; index < limit; index++) { total += index; } return total; }",
        "function clamp(value, minimum) { if (value < minimum) { return minimum; } return value; }",
        "function fail(reason) { throw reason; }",
    ];

    for (const source of examples) {
        assertPurity(source, "Pure");
    }
}

export function testWritesOutsideLocalBindingsModifyInputs(): void {
    const examples = [
        "score = score + 1;",
        "function increment() { score++; }",
        "function update(input) { input.value = 1; }",
        "function update(input) { input['value'] = 1; }",
        "function replace(items) { items[0] = 'ready'; }",
        "function update(input) { input.count += 1; }",
    ];

    for (const source of examples) {
        assertPurity(source, "ModifiesInputs");
    }
}

export function testCommonMutatingCollectionMethodsModifyInputs(): void {
    const examples = [
        "function addItem(items, item) { items.push(item); }",
        "function removeItem(items) { items.pop(); }",
        "function clearValues(values) { values.splice(0, values.length); }",
        "function updateMap(cache, key, value) { cache.set(key, value); }",
        "function updateSet(values, value) { values.add(value); }",
    ];

    for (const source of examples) {
        assertPurity(source, "ModifiesInputs");
    }
}

export function testUnknownAndPlatformCallsHaveSideEffects(): void {
    const examples = [
        "function load(url) { fetch(url); }",
        "function report(message) { console.log(message); }",
        "function readForm(selector) { document.querySelector(selector); }",
        "function listen(button, callback) { button.addEventListener('click', callback); }",
        "function store(key, value) { localStorage.setItem(key, value); }",
        "function createDate() { return new Date(); }",
        "async function loadData(url) { return await fetch(url); }",
        "function loadModule(path) { return import(path); }",
        "import data from './data.js';",
    ];

    for (const source of examples) {
        assertPurity(source, "HasSideEffects");
    }
}

export function testEffectsInsideNestedControlFlowAreIncluded(): void {
    const examples = [
        "function load(shouldLoad) { if (shouldLoad) { fetch('/api/items'); } }",
        "function retry(count) { while (count > 0) { console.log(count); count--; } }",
        "function run(items) { for (const item of items) { send(item); } }",
        "function recover() { try { readFile(); } catch (error) { report(error); } }",
    ];

    for (const source of examples) {
        assertPurity(source, "HasSideEffects");
    }
}

export function testFunctionPurityPropagatesAcrossForwardAndTransitiveCalls(): void {
    const examples: { source: string; expected: Purity }[] = [
        {
            source: "function view(value) { return format(value); } function format(value) { return value + '!'; }",
            expected: "Pure",
        },
        {
            source: "function update(value) { middle(value); } function middle(value) { mutate(value); } function mutate(value) { value.done = true; }",
            expected: "ModifiesInputs",
        },
        {
            source: "function start(url) { load(url); } function load(url) { request(url); } function request(url) { fetch(url); }",
            expected: "HasSideEffects",
        },
        {
            source: "function isEven(value) { if (value === 0) { return true; } return isOdd(value - 1); } function isOdd(value) { if (value === 0) { return false; } return isEven(value - 1); }",
            expected: "Pure",
        },
    ];

    for (const { source, expected } of examples) {
        assertPurity(source, expected);
    }
}

export function testPurityPropagatesThroughLongForwardCallChain(): void {
    const functionCount = 24;
    const declarations = [];
    for (let index = 0; index < functionCount - 1; index++) {
        declarations.push(`function task${index}() { task${index + 1}(); }`);
    }
    declarations.push(
        `function task${functionCount - 1}() { fetch('/data'); }`,
    );

    assertPurity(declarations.join(" "), "HasSideEffects");
}

export function testCyclicAstTerminatesConservatively(): void {
    let cyclicExpression: Expression = { kind: "NullExpression" };
    cyclicExpression = {
        kind: "NegationExpression",
        value: cyclicExpression,
    };
    if (cyclicExpression.kind === "NegationExpression") {
        cyclicExpression.value = cyclicExpression;
    }

    const declaration: FunctionDeclaration = {
        kind: "FunctionDeclaration",
        isAsync: false,
        name: "cyclic",
        parameters: [],
        body: [{ kind: "ReturnStatement", value: cyclicExpression }],
    };

    assert.strictEqual(javascript.checkPurity([declaration]), "HasSideEffects");
}

export function testRealWorldQuizRenderingAndCheckingPatterns(): void {
    assertPurity(
        "const questions = [{ q: 'Which dinosaur?', answer: 'Triceratops' }]; quiz.innerHTML = questions.map((question) => question.q).join('');",
        "HasSideEffects",
    );
    assertPurity(
        "function check(question) { const selected = document.querySelector(question.selector); if (selected.value === question.answer) { result.textContent = 'Correct'; } }",
        "HasSideEffects",
    );
}

export function testRealWorldGameEntityPatterns(): void {
    assertPurity(
        "function spawn(grid, entity) { grid.appendChild(entity.element); }",
        "HasSideEffects",
    );
    assertPurity(
        "function removeEntity(entities, entity) { entities.splice(entities.indexOf(entity), 1); entity.element.remove(); }",
        "HasSideEffects",
    );
}
