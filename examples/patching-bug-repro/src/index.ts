import * as coed from "@eeue56/coed";
import { HtmlNode } from "@eeue56/coed";

// Types mimicking gobaith's recursive query structure
type AddQuery = { kind: "AddQuery" };
type RemoveQuery = { kind: "RemoveQuery"; index: number };
type UpdateField = {
    kind: "UpdateField";
    index: number;
    path: string[];
    field: string;
};
type UpdateValue = {
    kind: "UpdateValue";
    index: number;
    path: string[];
    value: string;
};

type Msg = AddQuery | RemoveQuery | UpdateField | UpdateValue;

// Recursive query structure
type FilterQuery = {
    kind: "Filter";
    field: string;
    value: string;
    operator: string;
};

type AndQuery = {
    kind: "And";
    left: Query;
    right: Query;
};

type OrQuery = {
    kind: "Or";
    left: Query;
    right: Query;
};

type Query = FilterQuery | AndQuery | OrQuery;

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

function UpdateField(index: number, path: string[], field: string): Msg {
    return { kind: "UpdateField", index, path, field };
}

function UpdateValue(index: number, path: string[], value: string): Msg {
    return { kind: "UpdateValue", index, path, value };
}

// Helper functions
function createFilterQuery(field: string, value: string): FilterQuery {
    return { kind: "Filter", field, value, operator: "equals" };
}

function createAndQuery(left: Query, right: Query): AndQuery {
    return { kind: "And", left, right };
}

function createOrQuery(left: Query, right: Query): OrQuery {
    return { kind: "Or", left, right };
}

// Update query at path
function updateQueryAtPath(
    query: Query,
    path: string[],
    updateFn: (q: FilterQuery) => FilterQuery
): Query {
    if (path.length === 0) {
        if (query.kind === "Filter") {
            return updateFn(query);
        }
        return query;
    }

    const [head, ...tail] = path;

    if (query.kind === "And" || query.kind === "Or") {
        if (head === "left") {
            return {
                ...query,
                left: updateQueryAtPath(query.left, tail, updateFn),
            };
        } else if (head === "right") {
            return {
                ...query,
                right: updateQueryAtPath(query.right, tail, updateFn),
            };
        }
    }

    return query;
}

// Update function
function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "AddQuery": {
            // Create nested query: And(Filter, Or(Filter, Filter))
            const newQuery: Query = createAndQuery(
                createFilterQuery("field1", "value1"),
                createOrQuery(
                    createFilterQuery("field2", "value2"),
                    createFilterQuery("field3", "value3")
                )
            );
            return {
                ...model,
                queries: [...model.queries, newQuery],
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
                    i === msg.index
                        ? updateQueryAtPath(q, msg.path, (filter) => ({
                              ...filter,
                              field: msg.field,
                          }))
                        : q
                ),
            };
        }
        case "UpdateValue": {
            return {
                ...model,
                queries: model.queries.map((q, i) =>
                    i === msg.index
                        ? updateQueryAtPath(q, msg.path, (filter) => ({
                              ...filter,
                              value: msg.value,
                          }))
                        : q
                ),
            };
        }
    }
}

// Render filter (leaf node) - DEEPLY NESTED like gobaith
function renderFilter(
    filter: FilterQuery,
    index: number,
    path: string[]
): HtmlNode<Msg> {
    return coed.div(
        [],
        [coed.class_("filter-builder")],
        [
            coed.div(
                [],
                [coed.class_("filter-row")],
                [
                    coed.div(
                        [],
                        [coed.class_("filter-field")],
                        [
                            coed.div(
                                [],
                                [coed.class_("field-container")],
                                [
                                    coed.label([], [coed.class_("field-label")], [
                                        coed.text("Field:"),
                                    ]),
                                    coed.div(
                                        [],
                                        [coed.class_("input-wrapper")],
                                        [
                                            coed.div(
                                                [],
                                                [coed.class_("input-container")],
                                                [
                                                    coed.input(
                                                        [
                                                            coed.on("input", (e) => {
                                                                const target =
                                                                    e.target as HTMLInputElement;
                                                                return UpdateField(
                                                                    index,
                                                                    path,
                                                                    target.value
                                                                );
                                                            }),
                                                        ],
                                                        [
                                                            coed.attribute("type", "text"),
                                                            coed.attribute("value", filter.field),
                                                            coed.class_("field-input"),
                                                        ]
                                                    ),
                                                ]
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("filter-operator")],
                        [
                            coed.div(
                                [],
                                [coed.class_("operator-container")],
                                [
                                    coed.label([], [coed.class_("operator-label")], [
                                        coed.text("Operator:"),
                                    ]),
                                    coed.div(
                                        [],
                                        [coed.class_("select-wrapper")],
                                        [
                                            coed.div(
                                                [],
                                                [coed.class_("select-container")],
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
                                                                [
                                                                    coed.attribute(
                                                                        "value",
                                                                        "contains"
                                                                    ),
                                                                ],
                                                                [coed.text("Contains")]
                                                            ),
                                                        ]
                                                    ),
                                                ]
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("filter-value")],
                        [
                            coed.div(
                                [],
                                [coed.class_("value-container")],
                                [
                                    coed.label([], [coed.class_("value-label")], [
                                        coed.text("Value:"),
                                    ]),
                                    coed.div(
                                        [],
                                        [coed.class_("input-wrapper")],
                                        [
                                            coed.div(
                                                [],
                                                [coed.class_("input-container")],
                                                [
                                                    coed.input(
                                                        [
                                                            coed.on("input", (e) => {
                                                                const target =
                                                                    e.target as HTMLInputElement;
                                                                return UpdateValue(
                                                                    index,
                                                                    path,
                                                                    target.value
                                                                );
                                                            }),
                                                        ],
                                                        [
                                                            coed.attribute("type", "text"),
                                                            coed.attribute("value", filter.value),
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
                    ),
                ]
            ),
        ]
    );
}

// Recursive query builder renderer
function renderQueryBuilder(
    query: Query,
    index: number,
    path: string[]
): HtmlNode<Msg> {
    switch (query.kind) {
        case "Filter": {
            return renderFilter(query, index, path);
        }
        case "And": {
            return coed.div(
                [],
                [coed.class_("combinator-container")],
                [
                    coed.div(
                        [],
                        [coed.class_("left-branch")],
                        [
                            coed.div(
                                [],
                                [coed.class_("branch-wrapper")],
                                [
                                    coed.div(
                                        [],
                                        [coed.class_("indent")],
                                        [
                                            renderQueryBuilder(
                                                query.left,
                                                index,
                                                [...path, "left"]
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("combinator-selector")],
                        [
                            coed.div(
                                [],
                                [coed.class_("combinator-wrapper")],
                                [
                                    coed.div(
                                        [],
                                        [coed.class_("combinator-label")],
                                        [
                                            coed.span(
                                                [],
                                                [coed.class_("combinator-text")],
                                                [coed.text("AND")]
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("right-branch")],
                        [
                            coed.div(
                                [],
                                [coed.class_("branch-wrapper")],
                                [
                                    coed.div(
                                        [],
                                        [coed.class_("indent")],
                                        [
                                            renderQueryBuilder(
                                                query.right,
                                                index,
                                                [...path, "right"]
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
        case "Or": {
            return coed.div(
                [],
                [coed.class_("combinator-container")],
                [
                    coed.div(
                        [],
                        [coed.class_("left-branch")],
                        [
                            coed.div(
                                [],
                                [coed.class_("branch-wrapper")],
                                [
                                    coed.div(
                                        [],
                                        [coed.class_("indent")],
                                        [
                                            renderQueryBuilder(
                                                query.left,
                                                index,
                                                [...path, "left"]
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("combinator-selector")],
                        [
                            coed.div(
                                [],
                                [coed.class_("combinator-wrapper")],
                                [
                                    coed.div(
                                        [],
                                        [coed.class_("combinator-label")],
                                        [
                                            coed.span(
                                                [],
                                                [coed.class_("combinator-text")],
                                                [coed.text("OR")]
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("right-branch")],
                        [
                            coed.div(
                                [],
                                [coed.class_("branch-wrapper")],
                                [
                                    coed.div(
                                        [],
                                        [coed.class_("indent")],
                                        [
                                            renderQueryBuilder(
                                                query.right,
                                                index,
                                                [...path, "right"]
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
    }
    
    // TypeScript exhaustiveness check
    const _exhaustive: never = query;
    return _exhaustive;
}

// Helper to extract field/value for display
function extractQuerySummary(query: Query): string {
    switch (query.kind) {
        case "Filter":
            return `${query.field}=${query.value}`;
        case "And":
            return `(${extractQuerySummary(query.left)} AND ${extractQuerySummary(query.right)})`;
        case "Or":
            return `(${extractQuerySummary(query.left)} OR ${extractQuerySummary(query.right)})`;
    }
}

// Render query result
function renderQueryResult(query: Query, index: number): HtmlNode<Msg> {
    const summary = extractQuerySummary(query);
    const hash = summary.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const days = (hash % 90) + 10;

    return coed.div(
        [],
        [coed.class_("filter-query-result")],
        [
            coed.div(
                [],
                [coed.class_("result-header")],
                [
                    coed.div(
                        [],
                        [coed.class_("result-title")],
                        [coed.text("Matches:")]
                    ),
                ]
            ),
            coed.div(
                [],
                [coed.class_("result-content")],
                [
                    coed.div(
                        [],
                        [coed.class_("result-text")],
                        [
                            coed.text("A total of "),
                            coed.strong([], [coed.class_("result-count")], [
                                coed.text(days.toString()),
                            ]),
                            coed.text(" days matching query: "),
                            coed.code([], [coed.class_("result-query")], [
                                coed.text(summary),
                            ]),
                        ]
                    ),
                ]
            ),
        ]
    );
}

// Render remove button
function renderRemoveQueryButton(index: number): HtmlNode<Msg> {
    return coed.button(
        [coed.on("click", () => RemoveQuery(index))],
        [coed.class_("remove-button")],
        [coed.text(`✕ Remove Query ${index + 1}`)]
    );
}

// Render a complete query - WITHOUT id (buggy) or WITH id (fixed)
function renderInteractiveFilterQueryBuggy(
    query: Query,
    index: number
): HtmlNode<Msg> {
    return coed.div(
        [],
        [coed.class_("filter-query")], // NO ID - causes bug!
        [
            coed.div(
                [],
                [coed.class_("query-header")],
                [
                    coed.div(
                        [],
                        [coed.class_("query-title-wrapper")],
                        [
                            coed.h3([], [coed.class_("query-title")], [
                                coed.text(`Query ${index + 1}`),
                            ]),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("query-actions")],
                        [renderRemoveQueryButton(index)]
                    ),
                ]
            ),
            coed.div(
                [],
                [coed.class_("query-builder-wrapper")],
                [
                    coed.div([], [coed.class_("builder-container")], [
                        renderQueryBuilder(query, index, []),
                    ]),
                ]
            ),
            coed.div(
                [],
                [coed.class_("query-result-wrapper")],
                [
                    coed.div([], [coed.class_("result-container")], [
                        renderQueryResult(query, index),
                    ]),
                ]
            ),
        ]
    );
}

function renderInteractiveFilterQueryFixed(
    query: Query,
    index: number
): HtmlNode<Msg> {
    const id = `filter-query-${index}`;

    return coed.div(
        [],
        [coed.class_("filter-query"), coed.attribute("id", id)], // WITH ID - works correctly
        [
            coed.div(
                [],
                [coed.class_("query-header")],
                [
                    coed.div(
                        [],
                        [coed.class_("query-title-wrapper")],
                        [
                            coed.h3([], [coed.class_("query-title")], [
                                coed.text(`Query ${index + 1}`),
                            ]),
                        ]
                    ),
                    coed.div(
                        [],
                        [coed.class_("query-actions")],
                        [renderRemoveQueryButton(index)]
                    ),
                ]
            ),
            coed.div(
                [],
                [coed.class_("query-builder-wrapper")],
                [
                    coed.div([], [coed.class_("builder-container")], [
                        renderQueryBuilder(query, index, []),
                    ]),
                ]
            ),
            coed.div(
                [],
                [coed.class_("query-result-wrapper")],
                [
                    coed.div([], [coed.class_("result-container")], [
                        renderQueryResult(query, index),
                    ]),
                ]
            ),
        ]
    );
}

// Main view
function view(model: Model): HtmlNode<Msg> {
    const useBuggyVersion = true;
    const renderFunction = useBuggyVersion
        ? renderInteractiveFilterQueryBuggy
        : renderInteractiveFilterQueryFixed;

    return coed.div(
        [],
        [coed.class_("app-container")],
        [
            coed.h1([], [coed.class_("app-title")], [
                coed.text("Patching Bug Reproduction - Issue #3"),
            ]),
            coed.p([], [coed.class_("status-message")], [
                coed.text(
                    useBuggyVersion
                        ? "⚠️ BUGGY VERSION: Recursive tree nodes without unique IDs get combined incorrectly"
                        : "✓ FIXED VERSION: Tree nodes with unique IDs work correctly"
                ),
            ]),
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
                model.queries.map((query, index) => renderFunction(query, index))
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
                            coed.li([], [], [
                                coed.text(
                                    'Click "Add Query" to add more RECURSIVE queries (each has nested And/Or/Filter structure)'
                                ),
                            ]),
                            coed.li([], [], [
                                coed.text(
                                    "Notice each query has DEEPLY NESTED structures with 6-7+ levels of divs, like gobaith"
                                ),
                            ]),
                            coed.li([], [], [
                                coed.text(
                                    "Click a remove button in the MIDDLE (e.g., Query 2, not first or last)"
                                ),
                            ]),
                            coed.li(
                                [],
                                [],
                                [
                                    coed.strong([], [], [coed.text("BUG: ")]),
                                    coed.text(
                                        "Input values get mixed up between queries due to similar recursive tree structures"
                                    ),
                                ]
                            ),
                        ]
                    ),
                    coed.p([], [coed.class_("note")], [
                        coed.text("💡 To see the fix, change "),
                        coed.code([], [], [coed.text("useBuggyVersion")]),
                        coed.text(" to "),
                        coed.code([], [], [coed.text("false")]),
                        coed.text(" in the code."),
                    ]),
                ]
            ),
        ]
    );
}

// Main
function main() {
    const root = document.getElementById("root");
    if (root === null) {
        console.error("Root element not found");
        return;
    }

    const initialModel: Model = {
        queries: [
            createAndQuery(
                createFilterQuery("status", "active"),
                createFilterQuery("priority", "high")
            ),
            createOrQuery(
                createFilterQuery("category", "bug"),
                createAndQuery(
                    createFilterQuery("severity", "critical"),
                    createFilterQuery("assigned", "true")
                )
            ),
            createAndQuery(
                createFilterQuery("type", "feature"),
                createOrQuery(
                    createFilterQuery("phase", "development"),
                    createFilterQuery("phase", "testing")
                )
            ),
        ],
    };

    const program = coed.program({
        root: root,
        initialModel: initialModel,
        view: view,
        update: update,
    });

    (window as any).testProgram = program;
    (window as any).AddQuery = AddQuery;
    (window as any).RemoveQuery = RemoveQuery;
}

main();
