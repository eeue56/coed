import * as coed from "@eeue56/coed";

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

function view(model: Model): coed.HtmlNode<Msg> {
    return coed.div(
        [],
        [],
        [
            coed.h1([], [], [coed.text(`${model.dieFace}`)]),
            coed.button([coed.on("click", Roll)], [], [coed.text("Roll")]),
        ],
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = coed.program({
        root: root,
        initialModel: { dieFace: 1 },
        view: view,
        update: update,
    });
}

main();
