import { html } from "@eeue56/coed";

type Roll = {
    kind: "Roll";
};

function Roll(): Msg {
    return {
        kind: "Roll",
    };
}

type Msg = Roll;

type Model = {
    dieFace: number;
};

function randomNumber(upper: number) {
    return Math.floor(Math.random() * upper) + 1;
}

function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "Roll":
            return { dieFace: randomNumber(6) };
    }
}

function view(model: Model): html.HtmlNode<Msg> {
    return html.div(
        [ ],
        [ ],
        [
            html.h1([ ], [ ], [ html.text(`${model.dieFace}`) ]),
            html.button([ html.on("click", Roll) ], [ ], [ html.text("Roll") ]),
        ]
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = html.program({
        root: root,
        initialModel: { dieFace: 1 },
        view: view,
        update: update,
    });
}

main();
