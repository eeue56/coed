import * as coed from "@eeue56/coed";

type Add = {
    kind: "Add";
};

function Add(): Msg {
    return {
        kind: "Add",
    };
}

type Sub = {
    kind: "Sub";
};

function Sub(): Msg {
    return {
        kind: "Sub",
    };
}

type Msg = Add | Sub;

type Model = {
    count: number;
};

function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "Add":
            return { count: model.count + 1 };
        case "Sub":
            return { count: model.count - 1 };
    }
}

function view(model: Model): coed.HtmlNode<Msg> {
    return coed.div(
        [ ],
        [ ],
        [
            coed.button(
                [ coed.on("click", () => Sub()) ],
                [ coed.class_("button-sub") ],
                [ coed.text("-") ]
            ),
            coed.text(`${model.count}`),
            coed.button(
                [ coed.on("click", () => Add()) ],
                [ coed.class_("button-add") ],
                [ coed.text("+") ]
            ),
        ]
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = coed.program({
        root: root,
        initialModel: { count: 0 },
        view: view,
        update: update,
    });
}

main();
