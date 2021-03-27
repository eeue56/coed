import { html } from "hiraeth";

type ChangeText = {
    kind: "ChangeText";
    text: string;
};

function ChangeText(text: string): Msg {
    return {
        kind: "ChangeText",
        text: text,
    };
}

type Msg = ChangeText;

type Model = {
    text: string;
};

function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "ChangeText":
            return { text: msg.text };
    }
}

function view(model: Model): html.HtmlNode<Msg> {
    return html.div(
        [ ],
        [ ],
        [
            html.input(
                [ html.onInput(ChangeText) ],
                [
                    html.attribute("placeholder", "Text to reverse"),
                    html.attribute("value", model.text),
                ],
                [ ]
            ),
            html.div(
                [ ],
                [ ],
                [ html.text(model.text.split("").reverse().join("")) ]
            ),
        ]
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = html.program({
        root: root,
        initialModel: { text: "" },
        view: view,
        update: update,
    });
}

main();
