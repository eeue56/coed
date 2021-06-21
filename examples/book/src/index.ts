import * as coed from "@eeue56/coed";
import { text, pre, HtmlNode } from "@eeue56/coed";

type GotText = {
    kind: "GotText";
    text: string;
};

function GotText(text: string): Msg {
    return {
        kind: "GotText",
        text: text,
    };
}

type GotError = {
    kind: "GotError";
};

function GotError(): Msg {
    return {
        kind: "GotError",
    };
}

type Msg = GotText | GotError;

type Failure = {
    kind: "Failure";
};

function Failure(): Model {
    return {
        kind: "Failure",
    };
}

type Loading = {
    kind: "Loading";
};

function Loading(): Model {
    return {
        kind: "Loading",
    };
}

type Success = {
    kind: "Success";
    text: string;
};

function Success(text: string): Model {
    return {
        kind: "Success",
        text: text,
    };
}

type Model = Failure | Loading | Success;

function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "GotText":
            return Success(msg.text);
        case "GotError":
            return Failure();
    }
}

function view(model: Model): HtmlNode<Msg> {
    switch (model.kind) {
        case "Loading":
            return text("Loading...");
        case "Failure":
            return text("I was unable to load your book.");
        case "Success":
            return pre([ ], [ ], [ text(model.text) ]);
    }
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = coed.program({
        root: root,
        initialModel: Loading(),
        view: view,
        update: update,
    });

    fetch("https://elm-lang.org/assets/public-opinion.txt")
        .then((data) => {
            data.text().then((text) => {
                program.send(GotText(text));
            });
        })
        .catch(() => {
            program.send(GotError());
        });
}

main();
