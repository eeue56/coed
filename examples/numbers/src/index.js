import * as coed from "@eeue56/coed";
function Roll() {
    return {
        kind: "Roll",
    };
}
function randomNumber(upper) {
    return Math.floor(Math.random() * upper) + 1;
}
function update(msg, model) {
    switch (msg.kind) {
        case "Roll":
            return { dieFace: randomNumber(6) };
    }
}
function view(model) {
    return coed.div([], [], [
        coed.h1([], [], [coed.text(`${model.dieFace}`)]),
        coed.button([coed.on("click", Roll)], [], [coed.text("Roll")]),
    ]);
}
function main() {
    const root = document.getElementById("root");
    if (root === null)
        return;
    const program = coed.program({
        root: root,
        initialModel: { dieFace: 1 },
        view: view,
        update: update,
    });
}
main();
