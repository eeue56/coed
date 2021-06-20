import { html } from "@eeue56/coed";

type AddItem = {
    kind: "AddItem";
    text: string;
};

function AddItem(text: string): Msg {
    return {
        kind: "AddItem",
        text: text,
    };
}

type DeleteItem = {
    kind: "DeleteItem";
    id: number;
};

function DeleteItem(id: number): Msg {
    return {
        kind: "DeleteItem",
        id: id,
    };
}

type ChangeNewItemText = {
    kind: "ChangeNewItemText";
    text: string;
};

function ChangeNewItemText(text: string): Msg {
    return {
        kind: "ChangeNewItemText",
        text: text,
    };
}

type Msg = AddItem | DeleteItem | ChangeNewItemText;

type Item = {
    id: number;
    text: string;
};

type Model = {
    items: Item[];
    newItemText: string;
    maxId: number;
};

function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "AddItem":
            const newItem = {
                id: model.maxId,
                text: msg.text,
            };

            model.items.push(newItem);

            return {
                ...model,
                items: model.items,
                maxId: model.maxId + 1,
                newItemText: "",
            };

        case "DeleteItem":
            return {
                ...model,
                items: model.items.filter((item) => item.id !== msg.id),
            };
        case "ChangeNewItemText":
            return {
                ...model,
                newItemText: msg.text,
            };
    }
}

function viewItem(item: Item): html.HtmlNode<Msg> {
    return html.div(
        [ ],
        [ ],
        [
            html.text(item.id + ":" + item.text),
            html.button(
                [ html.on("click", () => DeleteItem(item.id)) ],
                [ ],
                [ html.text("Remove") ]
            ),
        ]
    );
}

function viewAddItem(newItemText: string): html.HtmlNode<Msg> {
    const copy = newItemText.slice();
    return html.li(
        [ ],
        [ ],
        [
            html.input(
                [ html.onInput(ChangeNewItemText) ],
                [
                    html.attribute("type", "string"),
                    html.attribute("placeholder", "New item text"),
                    html.attribute("value", newItemText),
                ],
                [ ]
            ),
            html.button(
                [ html.on("click", () => AddItem(newItemText)) ],
                [ ],
                [ html.text("Add") ]
            ),
        ]
    );
}

function view(model: Model): html.HtmlNode<Msg> {
    return html.div(
        [ ],
        [ ],
        [
            html.ul([ ], [ ], model.items.map(viewItem)),
            viewAddItem(model.newItemText),
        ]
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = html.program({
        root: root,
        initialModel: { maxId: 0, items: [ ], newItemText: "sample" },
        view: view,
        update: update,
    });
}

main();
