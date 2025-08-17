import * as coed from "@eeue56/coed";
import { HtmlNode, hydrate, pre, text } from "../../../build/coed";

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

type Fetch = {
    kind: "Fetch";
};

function Fetch(): Msg {
    return {
        kind: "Fetch",
    };
}

type Msg = GotText | GotError | Fetch;

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

type PageLoaded = {
    kind: "PageLoaded";
};

function PageLoaded(): PageLoaded {
    return {
        kind: "PageLoaded",
    };
}

type Model = Failure | Loading | Success | PageLoaded;

function update(msg: Msg, model: Model, send: (msg: Msg) => void): Model {
    switch (msg.kind) {
        case "GotText":
            return Success(msg.text);
        case "GotError":
            return Failure();
        case "Fetch": {
            fetch("https://elm-lang.org/assets/public-opinion.txt")
                .then((data) => {
                    data.text().then((text) => {
                        send(GotText(text));
                    });
                })
                .catch(() => {
                    send(GotError());
                });
            return Loading();
        }
    }
}

function viewState(model: Model): HtmlNode<Msg> {
    switch (model.kind) {
        case "PageLoaded": {
            return text("Page loaded");
        }
        case "Loading":
            return text("Loading...");
        case "Failure":
            return text("I was unable to load your book.");
        case "Success":
            return pre([], [], [text(model.text)]);
    }
}

export function view(model: Model): HtmlNode<Msg> {
    return coed.div(
        [],
        [],
        [
            coed.button(
                [coed.on("click", () => Fetch())],
                [],
                [text("Fetch text")],
            ),
            viewState(model),
        ],
    );
}

export const initalModel = PageLoaded();

function main() {
    console.log("Hydrating...");
    const program = coed.program({
        root: "hydration",
        initialModel: initalModel,
        view: view,
        update: update,
    });

    const root = document.getElementById("root");
    if (root === null) {
        console.log("Couldn't find root");
        return;
    }
    hydrate(program, root);
}

if (typeof document !== "undefined") {
    main();
}
