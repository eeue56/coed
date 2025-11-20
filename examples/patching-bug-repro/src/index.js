"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var coed = __importStar(require("@eeue56/coed"));
// Message constructors
function AddQuery() {
    return { kind: "AddQuery" };
}
function RemoveQuery(index) {
    return { kind: "RemoveQuery", index: index };
}
// Update function
function update(msg, model) {
    switch (msg.kind) {
        case "AddQuery": {
            return __assign(__assign({}, model), { queries: __spreadArray(__spreadArray([], model.queries, true), [
                    { field: "test", value: "value" },
                ], false) });
        }
        case "RemoveQuery": {
            return __assign(__assign({}, model), { queries: model.queries.filter(function (_, i) { return i !== msg.index; }) });
        }
    }
}
// Helper to render the remove button
function renderRemoveQueryButton(index) {
    return coed.button([coed.on("click", function () { return RemoveQuery(index); })], [coed.class_("remove-button")], [coed.text("Remove Query ".concat(index + 1))]);
}
// Render a single filter query - WITHOUT id attribute (buggy version)
function renderInteractiveFilterQueryBuggy(query, index) {
    var resultText = "Query ".concat(index + 1, ": ").concat(query.field, " = ").concat(query.value);
    return coed.div([], [coed.class_("filter-query")], [
        coed.div([], [], [coed.text("Query ".concat(index + 1))]),
        coed.div([], [coed.class_("filter-query-result")], [
            coed.text("Result: "),
            coed.strong([], [], [coed.text(resultText)]),
        ]),
        coed.div([], [], [renderRemoveQueryButton(index)]),
    ]);
}
// Render a single filter query - WITH id attribute (working version)
function renderInteractiveFilterQueryFixed(query, index) {
    var resultText = "Query ".concat(index + 1, ": ").concat(query.field, " = ").concat(query.value);
    var id = "filter-query-".concat(index);
    return coed.div([], [coed.class_("filter-query"), coed.attribute("id", id)], [
        coed.div([], [], [coed.text("Query ".concat(index + 1))]),
        coed.div([], [coed.class_("filter-query-result")], [
            coed.text("Result: "),
            coed.strong([], [], [coed.text(resultText)]),
        ]),
        coed.div([], [], [renderRemoveQueryButton(index)]),
    ]);
}
// Main view function
function view(model) {
    // Use buggy version by default - change to Fixed to see it work
    var useBuggyVersion = true;
    var renderFunction = useBuggyVersion
        ? renderInteractiveFilterQueryBuggy
        : renderInteractiveFilterQueryFixed;
    return coed.div([], [], [
        coed.h1([], [], [coed.text("Patching Bug Reproduction - Issue #3")]),
        coed.p([], [], [
            coed.text(useBuggyVersion
                ? "BUGGY VERSION: Tree nodes without unique IDs may get combined incorrectly"
                : "FIXED VERSION: Tree nodes with unique IDs work correctly"),
        ]),
        coed.div([], [], [
            coed.button([coed.on("click", function () { return AddQuery(); })], [coed.class_("add-button")], [coed.text("Add Query")]),
        ]),
        coed.div([], [coed.class_("queries-container")], model.queries.map(function (query, index) {
            return renderFunction(query, index);
        })),
        coed.div([], [], [
            coed.p([], [], [coed.text("Instructions:")]),
            coed.ol([], [], [
                coed.li([], [], [coed.text('Click "Add Query" multiple times to add several queries')]),
                coed.li([], [], [
                    coed.text("Click a remove button in the middle (not first or last)"),
                ]),
                coed.li([], [], [
                    coed.text("BUG: The wrong query may be removed, or queries may be combined/confused"),
                ]),
            ]),
        ]),
    ]);
}
// Initialize the program
function main() {
    var root = document.getElementById("root");
    if (root === null) {
        console.error("Root element not found");
        return;
    }
    var initialModel = {
        queries: [
            { field: "test1", value: "value1" },
            { field: "test2", value: "value2" },
        ]
    };
    var program = coed.program({
        root: root,
        initialModel: initialModel,
        view: view,
        update: update
    });
    // Expose program for testing
    window.testProgram = program;
    window.AddQuery = AddQuery;
    window.RemoveQuery = RemoveQuery;
}
main();
