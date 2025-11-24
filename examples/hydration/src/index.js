import * as coed from "@eeue56/coed";
import { hydrate, pre, text } from "../../../build/coed";
function GotText(text) {
    return {
        kind: "GotText",
        text: text,
    };
}
function GotError() {
    return {
        kind: "GotError",
    };
}
function Fetch() {
    return {
        kind: "Fetch",
    };
}
function Failure() {
    return {
        kind: "Failure",
    };
}
function Loading() {
    return {
        kind: "Loading",
    };
}
function Success(text) {
    return {
        kind: "Success",
        text: text,
    };
}
function PageLoaded() {
    return {
        kind: "PageLoaded",
    };
}
function update(msg, model, send) {
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
function viewState(model) {
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
export function view(model) {
    return coed.div([], [], [
        coed.button([coed.on("click", () => Fetch())], [], [text("Fetch text")]),
        viewState(model),
    ]);
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
