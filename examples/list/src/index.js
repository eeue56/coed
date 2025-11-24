import * as coed from "@eeue56/coed";
function AddItem(text) {
    return {
        kind: "AddItem",
        text: text,
    };
}
function DeleteItem(id) {
    return {
        kind: "DeleteItem",
        id: id,
    };
}
function Toggle(id) {
    return {
        kind: "Toggle",
        id: id,
    };
}
function ChangeNewItemText(text) {
    return {
        kind: "ChangeNewItemText",
        text: text,
    };
}
function update(msg, model) {
    switch (msg.kind) {
        case "AddItem":
            const newItem = {
                id: model.maxId,
                text: msg.text,
                state: true,
            };
            model.items.push(newItem);
            return {
                ...model,
                items: model.items,
                maxId: model.maxId + 1,
                newItemText: "",
            };
        case "DeleteItem":
            return {
                ...model,
                items: model.items.filter((item) => item.id !== msg.id),
            };
        case "Toggle":
            return {
                ...model,
                items: model.items.map((item) => item.id === msg.id ? { ...item, state: !item.state } : item),
            };
        case "ChangeNewItemText":
            return {
                ...model,
                newItemText: msg.text,
            };
    }
}
function viewItem(item) {
    return coed.li([], [], [
        coed.text(item.id + ":" + item.text),
        coed.input([coed.on("click", () => Toggle(item.id), false, false)], [
            coed.booleanAttribute("checked", item.state),
            coed.attribute("type", "checkbox"),
        ]),
        coed.button([coed.on("click", () => DeleteItem(item.id))], [coed.attribute("id", "btn-remove-" + item.id)], [coed.text("Remove")]),
    ]);
}
function viewAddItem(newItemText) {
    return coed.div([], [], [
        coed.input([coed.onInput(ChangeNewItemText)], [
            coed.attribute("type", "string"),
            coed.attribute("placeholder", "New item text"),
            coed.attribute("value", newItemText),
        ]),
        coed.button([coed.on("click", () => AddItem(newItemText))], [coed.attribute("id", "btn-add-item")], [coed.text("Add")]),
    ]);
}
function view(model) {
    return coed.div([], [], [
        coed.ul([], [], model.items.map(viewItem)),
        viewAddItem(model.newItemText),
    ]);
}
function main() {
    const root = document.getElementById("root");
    if (root === null)
        return;
    const program = coed.program({
        root: root,
        initialModel: { maxId: 0, items: [], newItemText: "sample" },
        view: view,
        update: update,
    });
}
main();
