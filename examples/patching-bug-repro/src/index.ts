import * as coed from "@eeue56/coed";
import { HtmlNode } from "@eeue56/coed";

// Types for our application
type AddQuery = { kind: "AddQuery" };
type RemoveQuery = { kind: "RemoveQuery"; index: number };
type UpdateField = { kind: "UpdateField"; index: number; field: string };
type UpdateValue = { kind: "UpdateValue"; index: number; value: string };

type Msg = AddQuery | RemoveQuery | UpdateField | UpdateValue;

type Query = {
    field: string;
    value: string;
    operator: string;
};

type Model = {
    queries: Query[];
};

// Message constructors
function AddQuery(): Msg {
    return { kind: "AddQuery" };
}

function RemoveQuery(index: number): Msg {
    return { kind: "RemoveQuery", index };
}

function UpdateField(index: number, field: string): Msg {
    return { kind: "UpdateField", index, field };
}

function UpdateValue(index: number, value: string): Msg {
    return { kind: "UpdateValue", index, value };
}

// Update function
function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "AddQuery": {
            return {
                ...model,
                queries: [
                    ...model.queries,
                    { field: "field", value: "value", operator: "equals" },
                ],
            };
        }
        case "RemoveQuery": {
            return {
                ...model,
                queries: model.queries.filter((_, i) => i !== msg.index),
            };
        }
        case "UpdateField": {
            return {
                ...model,
                queries: model.queries.map((q, i) =>
                    i === msg.index ? { ...q, field: msg.field } : q
                ),
            };
        }
        case "UpdateValue": {
            return {
                ...model,
                queries: model.queries.map((q, i) =>
                    i === msg.index ? { ...q, value: msg.value } : q
                ),
            };
        }
    }
}

// Helper to render a deeply nested query builder component
function renderQueryBuilder(
    query: Query,
    index: number
): HtmlNode<Msg> {
    return coed.div(
        [],
        [coed.class_("query-builder")],
        [
            coed.div(
                [],
                [coed.class_("query-builder-row")],
                [
                    coed.div(
                        [],
                        [coed.class_("query-builder-field")],
                        [
                            coed.label([], [], [coed.text("Field:")]),
                            coed.div(
                                [],
                                [coed.class_("input-wrapper")],
                                [
                                    coed.input(
                                        [
                                            coed.on("input", (e) => {
                                                const target = e.target as HTMLInputElement;
                                                return UpdateField(index, target.value);
                                            }),
                                        ],
                                        [
                                            coed.attribute("type", "text"),
                                            coed.attribute("value", query.field),
                                            coed.class_("field-input"),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("query-builder-operator")],
                        [
                            coed.label([], [], [coed.text("Operator:")]),
                            coed.div(
                                [],
                                [coed.class_("operator-wrapper")],
                                [
                                    coed.select(
                                        [],
                                        [coed.class_("operator-select")],
                                        [
                                            coed.option(
                                                [],
                                                [coed.attribute("value", "equals")],
                                                [coed.text("Equals")]
                                            ),
                                            coed.option(
                                                [],
                                                [coed.attribute("value", "contains")],
                                                [coed.text("Contains")]
                                            ),
                                            coed.option(
                                                [],
                                                [coed.attribute("value", "startsWith")],
                                                [coed.text("Starts With")]
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("query-builder-value")],
                        [
                            coed.label([], [], [coed.text("Value:")]),
                            coed.div(
                                [],
                                [coed.class_("input-wrapper")],
                                [
                                    coed.input(
                                        [
                                            coed.on("input", (e) => {
                                                const target = e.target as HTMLInputElement;
                                                return UpdateValue(index, target.value);
                                            }),
                                        ],
                                        [
                                            coed.attribute("type", "text"),
                                            coed.attribute("value", query.value),
                                            coed.class_("value-input"),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                ]
            ),
        ]
    );
}

// Helper to render the remove button
function renderRemoveQueryButton(index: number): HtmlNode<Msg> {
    return coed.button(
        [coed.on("click", () => RemoveQuery(index))],
        [coed.class_("remove-button")],
        [coed.text(`✕ Remove Query ${index + 1}`)]
    );
}

// Helper to render query result display
function renderQueryResult(query: Query, index: number): HtmlNode<Msg> {
    // Use a deterministic "result" based on the query properties
    // This simulates a query result without causing unnecessary re-renders
    const fieldHash = query.field.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const valueHash = query.value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const days = ((fieldHash + valueHash + index) % 90) + 10; // Deterministic value between 10-99
    
    return coed.div(
        [],
        [coed.class_("filter-query-result")],
        [
            coed.div(
                [],
                [coed.class_("result-header")],
                [
                    coed.text("Matches: "),
                ]
            ),
            coed.div(
                [],
                [coed.class_("result-content")],
                [
                    coed.text("A total of "),
                    coed.strong([], [], [coed.text(days.toString())]),
                    coed.text(" days where "),
                    coed.code([], [], [coed.text(query.field)]),
                    coed.text(" "),
                    coed.em([], [], [coed.text(query.operator)]),
                    coed.text(" "),
                    coed.code([], [], [coed.text(query.value)]),
                ]
            ),
        ]
    );
}

// Render a single filter query - WITHOUT id attribute (buggy version)
function renderInteractiveFilterQueryBuggy(
    query: Query,
    index: number
): HtmlNode<Msg> {
    return coed.div(
        [],
        [coed.class_("filter-query")],
        [
            coed.div(
                [],
                [coed.class_("query-header")],
                [
                    coed.h3([], [], [coed.text(`Query ${index + 1}`)]),
                    coed.div([], [], [renderRemoveQueryButton(index)]),
                ]
            ),
            coed.div([], [], [renderQueryBuilder(query, index)]),
            coed.div([], [], [renderQueryResult(query, index)]),
        ]
    );
}

// Render a single filter query - WITH id attribute (working version)
function renderInteractiveFilterQueryFixed(
    query: Query,
    index: number
): HtmlNode<Msg> {
    const id = `filter-query-${index}`;

    return coed.div(
        [],
        [coed.class_("filter-query"), coed.attribute("id", id)],
        [
            coed.div(
                [],
                [coed.class_("query-header")],
                [
                    coed.h3([], [], [coed.text(`Query ${index + 1}`)]),
                    coed.div([], [], [renderRemoveQueryButton(index)]),
                ]
            ),
            coed.div([], [], [renderQueryBuilder(query, index)]),
            coed.div([], [], [renderQueryResult(query, index)]),
        ]
    );
}

// Main view function
function view(model: Model): HtmlNode<Msg> {
    // Use buggy version by default - change to Fixed to see it work
    const useBuggyVersion = true;
    const renderFunction = useBuggyVersion
        ? renderInteractiveFilterQueryBuggy
        : renderInteractiveFilterQueryFixed;

    return coed.div(
        [],
        [],
        [
            coed.h1(
                [],
                [],
                [coed.text("Patching Bug Reproduction - Issue #3")]
            ),
            coed.p(
                [],
                [coed.class_("status-message")],
                [
                    coed.text(
                        useBuggyVersion
                            ? "⚠️ BUGGY VERSION: Tree nodes without unique IDs may get combined incorrectly"
                            : "✓ FIXED VERSION: Tree nodes with unique IDs work correctly"
                    ),
                ]
            ),
            coed.div(
                [],
                [coed.class_("controls")],
                [
                    coed.button(
                        [coed.on("click", () => AddQuery())],
                        [coed.class_("add-button")],
                        [coed.text("+ Add Query")]
                    ),
                ]
            ),
            coed.div(
                [],
                [coed.class_("queries-container")],
                model.queries.map((query, index) =>
                    renderFunction(query, index)
                )
            ),
            coed.div(
                [],
                [coed.class_("instructions")],
                [
                    coed.h2([], [], [coed.text("How to reproduce the bug:")]),
                    coed.ol(
                        [],
                        [],
                        [
                            coed.li(
                                [],
                                [],
                                [
                                    coed.text(
                                        'Click "Add Query" to add more queries (add at least 3-4 total)'
                                    ),
                                ]
                            ),
                            coed.li(
                                [],
                                [],
                                [
                                    coed.text(
                                        "Notice each query has a deeply nested structure with inputs, labels, and results"
                                    ),
                                ]
                            ),
                            coed.li(
                                [],
                                [],
                                [
                                    coed.text(
                                        "Click a remove button in the MIDDLE (e.g., Query 2 or Query 3, not first or last)"
                                    ),
                                ]
                            ),
                            coed.li(
                                [],
                                [],
                                [
                                    coed.strong(
                                        [],
                                        [],
                                        [coed.text("BUG: ")]
                                    ),
                                    coed.text(
                                        "The wrong query may be removed, or query content gets mixed up between nodes. Input values may appear in wrong queries."
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.p(
                        [],
                        [coed.class_("note")],
                        [
                            coed.text("💡 To see the fix, change "),
                            coed.code([], [], [coed.text("useBuggyVersion")]),
                            coed.text(" to "),
                            coed.code([], [], [coed.text("false")]),
                            coed.text(" in the code."),
                        ]
                    ),
                ]
            ),
        ]
    );
}

// Initialize the program
function main() {
    const root = document.getElementById("root");
    if (root === null) {
        console.error("Root element not found");
        return;
    }

    const initialModel: Model = {
        queries: [
            { field: "status", value: "active", operator: "equals" },
            { field: "priority", value: "high", operator: "equals" },
            { field: "category", value: "bug", operator: "contains" },
        ],
    };

    const program = coed.program({
        root: root,
        initialModel: initialModel,
        view: view,
        update: update,
    });

    // Expose program for testing
    (window as any).testProgram = program;
    (window as any).AddQuery = AddQuery;
    (window as any).RemoveQuery = RemoveQuery;
}

main();
