import { html } from "@eeue56/coed";

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

function view(model: Model): html.HtmlNode<Msg> {
    return html.div(
        [ ],
        [ ],
        [
            html.button(
                [ html.on("click", () => Sub()) ],
                [ html.class_("button-sub") ],
                [ html.text("-") ]
            ),
            html.text(`${model.count}`),
            html.button(
                [ html.on("click", () => Add()) ],
                [ html.class_("button-add") ],
                [ html.text("+") ]
            ),
        ]
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = html.program({
        root: root,
        initialModel: { count: 0 },
        view: view,
        update: update,
    });
}

main();
