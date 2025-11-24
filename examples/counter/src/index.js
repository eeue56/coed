import * as coed from "@eeue56/coed";
function Add() {
    return {
        kind: "Add",
    };
}
function Sub() {
    return {
        kind: "Sub",
    };
}
function update(msg, model) {
    switch (msg.kind) {
        case "Add":
            return { count: model.count + 1 };
        case "Sub":
            return { count: model.count - 1 };
    }
}
function view(model) {
    return coed.div([], [], [
        coed.button([coed.on("click", () => Sub())], [coed.class_("button-sub")], [coed.text("-")]),
        coed.text(`${model.count}`),
        coed.button([coed.on("click", () => Add())], [coed.class_("button-add")], [coed.text("+")]),
    ]);
}
function main() {
    const root = document.getElementById("root");
    if (root === null)
        return;
    const program = coed.program({
        root: root,
        initialModel: { count: 0 },
        view: view,
        update: update,
    });
}
main();
