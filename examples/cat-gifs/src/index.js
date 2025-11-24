import * as coed from "@eeue56/coed";
function MorePlease() {
    return {
        kind: "MorePlease",
    };
}
function GotGif(url) {
    return {
        kind: "GotGif",
        url: url,
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
function Success(url) {
    return {
        kind: "Success",
        url: url,
    };
}
function getRandomCatGif(send) {
    fetch("https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat").then((data) => {
        data.json().then((json) => {
            const imageUrl = json.data.image_url;
            const msg = GotGif(imageUrl);
            send(msg);
        });
    });
}
function update(msg, model, send) {
    switch (msg.kind) {
        case "MorePlease":
            getRandomCatGif(send);
            return model;
        case "GotGif":
            return Success(msg.url);
        case "GotError":
            return Failure();
    }
}
function SubMsg() {
    return {
        kind: "SubMsg",
    };
}
function viewGif(model) {
    switch (model.kind) {
        case "Failure":
            return coed.div([], [], [
                coed.text("I could not load a random cat for some reason"),
                coed.button([coed.on("click", () => SubMsg())], [], [coed.text("Try again!")]),
            ]);
        case "Loading":
            return coed.text("Loading...");
        case "Success":
            return coed.div([], [], [
                coed.button([coed.on("click", () => SubMsg())], [coed.style_("display", "block")], [coed.text("More please!")]),
                coed.img([coed.on("click", () => SubMsg())], [coed.attribute("src", model.url)]),
            ]);
    }
}
function view(model) {
    return coed.div([], [], [
        coed.h2([], [], [coed.text("Random cats")]),
        coed.map((sub) => MorePlease(), viewGif(model)),
    ]);
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
    getRandomCatGif(program.send);
}
main();
