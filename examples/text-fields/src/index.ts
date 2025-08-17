import * as coed from "@eeue56/coed";

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

function view(model: Model): coed.HtmlNode<Msg> {
    return coed.div(
        [],
        [],
        [
            coed.input(
                [coed.onInput(ChangeText)],
                [
                    coed.attribute("placeholder", "Text to reverse"),
                    coed.attribute("value", model.text),
                ],
            ),
            coed.div(
                [],
                [],
                [coed.text(model.text.split("").reverse().join(""))],
            ),
        ],
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = coed.program({
        root: root,
        initialModel: { text: "" },
        view: view,
        update: update,
    });
}

main();
