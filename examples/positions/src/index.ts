import * as coed from "@eeue56/coed";

type Clicked = {
    kind: "Clicked";
};

function Clicked(): Msg {
    return {
        kind: "Clicked",
    };
}

type Msg = Clicked;

type Model = {
    x: number;
    y: number;
};

function randomNumber(lower: number, upper: number) {
    const diff = upper - lower;
    return Math.floor(Math.random() * diff) + lower;
}

function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "Clicked":
            return {
                x: randomNumber(50, 350),
                y: randomNumber(50, 350),
            };
    }
}

function view(model: Model): coed.HtmlNode<Msg> {
    return coed.button(
        [coed.on("click", () => Clicked())],
        [
            coed.style_("position", "absolute"),
            coed.style_("top", `${model.x}px`),
            coed.style_("left", `${model.y}px`),
        ],
        [coed.text("Click me!")]
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = coed.program({
        root: root,
        initialModel: { x: 100, y: 100 },
        view: view,
        update: update,
    });
}

main();
