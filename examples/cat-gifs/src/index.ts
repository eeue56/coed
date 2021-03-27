import { html } from "hiraeth";

type MorePlease = {
    kind: "MorePlease";
};

function MorePlease(): Msg {
    return {
        kind: "MorePlease",
    };
}

type GotGif = {
    kind: "GotGif";
    url: string;
};

function GotGif(url: string): Msg {
    return {
        kind: "GotGif",
        url: url,
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

type Msg = MorePlease | GotGif | GotError;

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
    url: string;
};

function Success(url: string): Model {
    return {
        kind: "Success",
        url: url,
    };
}

type Model = Failure | Loading | Success;

function getRandomCatGif(send: (msg: Msg) => void) {
    fetch(
        "https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat"
    ).then((data) => {
        data.json().then((json) => {
            const imageUrl = json.data.image_url as string;
            const msg = GotGif(imageUrl);
            send(msg);
        });
    });
}

function update(msg: Msg, model: Model, send: (msg: Msg) => void): Model {
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

type SubMsg = {
    kind: "SubMsg";
};

function SubMsg(): SubMsg {
    return {
        kind: "SubMsg",
    };
}

function viewGif(model: Model): html.HtmlNode<SubMsg> {
    switch (model.kind) {
        case "Failure":
            return html.div(
                [ ],
                [ ],
                [
                    html.text("I could not load a random cat for some reason"),
                    html.button(
                        [ html.on("click", () => SubMsg()) ],
                        [ ],
                        [ html.text("Try again!") ]
                    ),
                ]
            );
        case "Loading":
            return html.text("Loading...");
        case "Success":
            return html.div(
                [ ],
                [ ],
                [
                    html.button(
                        [ html.on("click", () => SubMsg()) ],
                        [ html.style_("display", "block") ],
                        [ html.text("More please!") ]
                    ),
                    html.img([ ], [ html.attribute("src", model.url) ], [ ]),
                ]
            );
    }
}

function view(model: Model): html.HtmlNode<Msg> {
    return html.div(
        [ ],
        [ ],
        [
            html.h2([ ], [ ], [ html.text("Random cats") ]),
            html.map((sub: SubMsg) => MorePlease(), viewGif(model)),
        ]
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = html.program({
        root: root,
        initialModel: Loading(),
        view: view,
        update: update,
    });

    getRandomCatGif(program.send);
}

main();
