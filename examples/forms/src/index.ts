import { html } from "hiraeth";

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
    onInput: (input: string) => Msg
): html.HtmlNode<Msg> {
    return html.input(
        [ html.onInput(onInput) ],
        [
            html.attribute("type", type_),
            html.attribute("placeholder", placeholder),
            html.attribute("value", value),
        ],
        [ ]
    );
}

function viewValidation<Msg>(model: Model): html.HtmlNode<Msg> {
    if (model.password.length === 0) {
        return html.div(
            [ ],
            [
                html.style_("color", "red"),
                html.style_("border", "1px solid black"),
            ],
            [ html.text("No password set") ]
        );
    }
    if (model.password === model.passwordAgain) {
        return html.div(
            [ ],
            [
                html.style_("color", "green"),
                html.style_("border", "5px dashed yellow"),
            ],
            [ html.text("Matching passwords") ]
        );
    }

    return html.div(
        [ ],
        [
            html.style_("color", "red"),
            html.style_("border", "1px solid black"),
        ],
        [ html.text("Passwords don't match") ]
    );
}

function view(model: Model): html.HtmlNode<Msg> {
    return html.div(
        [ ],
        [ ],
        [
            viewInput("text", "Name", model.name, SetName),
            viewInput("password", "Password", model.password, SetPassword),
            viewInput(
                "password",
                "Re-enter password",
                model.passwordAgain,
                SetPasswordAgain
            ),
            viewValidation(model),
        ]
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = html.program({
        root: root,
        initialModel: { password: "", passwordAgain: "", name: "" },
        view: view,
        update: update,
    });
}

main();
