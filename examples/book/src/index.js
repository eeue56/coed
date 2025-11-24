import * as coed from "@eeue56/coed";
import { pre, text } from "@eeue56/coed";
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
function update(msg, model) {
    switch (msg.kind) {
        case "GotText":
            return Success(msg.text);
        case "GotError":
            return Failure();
    }
}
function view(model) {
    switch (model.kind) {
        case "Loading":
            return text("Loading...");
        case "Failure":
            return text("I was unable to load your book.");
        case "Success":
            return pre([], [], [text(model.text)]);
    }
}
function main() {
    const root = document.getElementById("root");
    if (root === null)
        return;
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
