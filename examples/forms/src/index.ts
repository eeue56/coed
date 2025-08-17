import * as coed from "@eeue56/coed";

type SetName = {
    kind: "SetName";
    value: string;
};

function SetName(name: string): Msg {
    return {
        kind: "SetName",
        value: name,
    };
}

type SetPassword = {
    kind: "SetPassword";
    value: string;
};

function SetPassword(password: string): Msg {
    return {
        kind: "SetPassword",
        value: password,
    };
}

type SetPasswordAgain = {
    kind: "SetPasswordAgain";
    value: string;
};

function SetPasswordAgain(passwordAgain: string): Msg {
    return {
        kind: "SetPasswordAgain",
        value: passwordAgain,
    };
}

type Msg = SetName | SetPassword | SetPasswordAgain;

type Model = {
    name: string;
    password: string;
    passwordAgain: string;
};

function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "SetName":
            return { ...model, name: msg.value };
        case "SetPassword":
            return { ...model, password: msg.value };
        case "SetPasswordAgain":
            return { ...model, passwordAgain: msg.value };
    }
}

function viewInput<Msg>(
    type_: string,
    placeholder: string,
    value: string,
    onInput: (input: string) => Msg,
): coed.HtmlNode<Msg> {
    return coed.input(
        [coed.onInput(onInput)],
        [
            coed.attribute("type", type_),
            coed.attribute("placeholder", placeholder),
            coed.attribute("value", value),
        ],
    );
}

function viewValidation<Msg>(model: Model): coed.HtmlNode<Msg> {
    if (model.password.length === 0) {
        return coed.div(
            [],
            [
                coed.style_("color", "red"),
                coed.style_("border", "1px solid black"),
            ],
            [coed.text("No password set")],
        );
    }
    if (model.password === model.passwordAgain) {
        return coed.div(
            [],
            [
                coed.style_("color", "green"),
                coed.style_("border", "5px dashed yellow"),
            ],
            [coed.text("Matching passwords")],
        );
    }

    return coed.div(
        [],
        [
            coed.style_("color", "red"),
            coed.style_("border", "1px solid black"),
            coed.style_("background", "lightblue"),
        ],
        [coed.text("Passwords don't match")],
    );
}

function view(model: Model): coed.HtmlNode<Msg> {
    return coed.div(
        [],
        [],
        [
            viewInput("text", "Name", model.name, SetName),
            viewInput("password", "Password", model.password, SetPassword),
            viewInput(
                "password",
                "Re-enter password",
                model.passwordAgain,
                SetPasswordAgain,
            ),
            viewValidation(model),
        ],
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = coed.program({
        root: root,
        initialModel: { password: "", passwordAgain: "", name: "" },
        view: view,
        update: update,
    });
}

main();
