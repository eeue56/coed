import { html } from "hiraeth";

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

function view(model: Model): html.HtmlNode<Msg> {
    return html.button(
        [ html.on("click", () => Clicked()) ],
        [
            html.style_("position", "absolute"),
            html.style_("top", `${model.x}px`),
            html.style_("left", `${model.y}px`),
        ],
        [ html.text("Click me!") ]
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = html.program({
        root: root,
        initialModel: { x: 100, y: 100 },
        view: view,
        update: update,
    });
}

main();
