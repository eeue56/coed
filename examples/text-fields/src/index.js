import * as coed from "@eeue56/coed";
function ChangeText(text) {
    return {
        kind: "ChangeText",
        text: text,
    };
}
function update(msg, model) {
    switch (msg.kind) {
        case "ChangeText":
            return { text: msg.text };
    }
}
function view(model) {
    return coed.div([], [], [
        coed.input([coed.onInput(ChangeText)], [
            coed.attribute("placeholder", "Text to reverse"),
            coed.attribute("value", model.text),
        ]),
        coed.div([], [], [coed.text(model.text.split("").reverse().join(""))]),
    ]);
}
function main() {
    const root = document.getElementById("root");
    if (root === null)
        return;
    const program = coed.program({
        root: root,
        initialModel: { text: "" },
        view: view,
        update: update,
    });
}
main();
