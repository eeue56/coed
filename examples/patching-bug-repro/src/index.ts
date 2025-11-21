import * as coed from "@eeue56/coed";
import { HtmlNode } from "@eeue56/coed";

// Types for our application
type AddQuery = { kind: "AddQuery" };
type RemoveQuery = { kind: "RemoveQuery"; index: number };

type Msg = AddQuery | RemoveQuery;

type Query = {
    field: string;
    value: string;
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

// Update function
function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "AddQuery": {
            return {
                ...model,
                queries: [
                    ...model.queries,
                    {
                        field: "test" + Math.random(),
                        value: "value" + Math.random(),
                    },
                ],
            };
        }
        case "RemoveQuery": {
            return {
                ...model,
                queries: model.queries.filter((_, i) => i !== msg.index),
            };
        }
    }
}

// Helper to render the remove button
function renderRemoveQueryButton(index: number): HtmlNode<Msg> {
    return coed.button(
        [coed.on("click", () => RemoveQuery(index))],
        [coed.class_("remove-button")],
        [coed.text(`Remove Query ${index + 1}`)]
    );
}

// Render a single filter query - WITHOUT id attribute (buggy version)
function renderInteractiveFilterQueryBuggy(
    query: Query,
    index: number
): HtmlNode<Msg> {
    const resultText = `Query ${index + 1}: ${query.field} = ${query.value}`;

    return coed.div(
        [],
        [coed.class_("filter-query")],
        [
            coed.div([], [], [coed.text(`Query ${index + 1}`)]),
            coed.div(
                [],
                [coed.class_("filter-query-result")],
                [
                    coed.text("Result: "),
                    coed.strong([], [], [coed.text(resultText)]),
                ]
            ),
            coed.div([], [], [renderRemoveQueryButton(index)]),
        ]
    );
}

// Render a single filter query - WITH id attribute (working version)
function renderInteractiveFilterQueryFixed(
    query: Query,
    index: number
): HtmlNode<Msg> {
    const resultText = `Query ${index + 1}: ${query.field} = ${query.value}`;
    const id = `filter-query-${index}`;

    return coed.div(
        [],
        [coed.class_("filter-query"), coed.attribute("id", id)],
        [
            coed.div([], [], [coed.text(`Query ${index + 1}`)]),
            coed.div(
                [],
                [coed.class_("filter-query-result")],
                [
                    coed.text("Result: "),
                    coed.strong([], [], [coed.text(resultText)]),
                ]
            ),
            coed.div([], [], [renderRemoveQueryButton(index)]),
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
                [],
                [
                    coed.text(
                        useBuggyVersion
                            ? "BUGGY VERSION: Tree nodes without unique IDs may get combined incorrectly"
                            : "FIXED VERSION: Tree nodes with unique IDs work correctly"
                    ),
                ]
            ),
            coed.div(
                [],
                [],
                [
                    coed.button(
                        [coed.on("click", () => AddQuery())],
                        [coed.class_("add-button")],
                        [coed.text("Add Query")]
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
                [],
                [
                    coed.p([], [], [coed.text("Instructions:")]),
                    coed.ol(
                        [],
                        [],
                        [
                            coed.li(
                                [],
                                [],
                                [
                                    coed.text(
                                        'Click "Add Query" multiple times to add several queries'
                                    ),
                                ]
                            ),
                            coed.li(
                                [],
                                [],
                                [
                                    coed.text(
                                        "Click a remove button in the middle (not first or last)"
                                    ),
                                ]
                            ),
                            coed.li(
                                [],
                                [],
                                [
                                    coed.text(
                                        "BUG: The wrong query may be removed, or queries may be combined/confused"
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

// Initialize the program
function main() {
    const root = document.getElementById("root");
    if (root === null) {
        console.error("Root element not found");
        return;
    }

    const initialModel: Model = {
        queries: [
            { field: "test1", value: "value1" },
            { field: "test2", value: "value2" },
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
