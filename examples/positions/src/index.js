import * as coed from "@eeue56/coed";
function Clicked() {
    return {
        kind: "Clicked",
    };
}
function randomNumber(lower, upper) {
    const diff = upper - lower;
    return Math.floor(Math.random() * diff) + lower;
}
function update(msg, model) {
    switch (msg.kind) {
        case "Clicked":
            return {
                x: randomNumber(50, 350),
                y: randomNumber(50, 350),
            };
    }
}
function view(model) {
    return coed.button([coed.on("click", () => Clicked())], [
        coed.style_("position", "absolute"),
        coed.style_("top", `${model.x}px`),
        coed.style_("left", `${model.y}px`),
    ], [coed.text("Click me!")]);
}
function main() {
    const root = document.getElementById("root");
    if (root === null)
        return;
    const program = coed.program({
        root: root,
        initialModel: { x: 100, y: 100 },
        view: view,
        update: update,
    });
}
main();
