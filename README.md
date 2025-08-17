# coed

Coed is a small library intended to be used on small TypeScript projects. It contains an Elm-inspired model-view-update loop, complete with relative type-safety and side effects.

Part of the [Hiraeth](https://github.com/eeue56/hiraeth) collection.

## Installation

```
npm install --save @eeue56/coed
```

## Usage

[API docs](docs/src/html.md)

Like Elm, everything is built around functions. There's no JSX to be seen - writing html is done via functions that take three arguments: events, attributes, and children. There's also `html.text` which simply takes a string to be rendered.

You should break your program down into logical sections: two types, `Model` to represent the data used by the view functions to render, `Msg` to represent interactions and state changes. Then you need a view function of the type `Model -> HtmlNode<Msg>`, and an update function of the type `Msg -> Model -> (?Msg -> void) -> Model`. These will be passed to `html.program`. You will need a root element in your index.html file which you pass to `html.program`, too.

For example:

```typescript
import { HtmlNode, div, on, style_, text } from "@eeue56/coed";
import * as coed from "@eeue56/coed";

type FlipName = { kind: "FlipName" };
function FlipName(): Msg {
    return {
        kind: "FlipName",
    };
}

type Msg = FlipName;
type Model = { name: string };

function update(msg: Msg, model: Model): Model {
    switch (msg.kind) {
        case "FlipName":
            if (model.name === "Noah") {
                return { name: "Ianto" };
            } else {
                return { name: "Noah" };
            }
    }
}

function view(model: Model): HtmlNode<Msg> {
    return div(
        [on("click", () => FlipName())],
        [style_("color", model.name === "Noah" ? "green" : "red")],
        [text(model.name)],
    );
}

function main() {
    const root = document.getElementById("root");
    if (root === null) return;

    const program = coed.program({
        root: root,
        initialModel: { name: "Noah" },
        view: view,
        update: update,
    });
}

main();
```

You can send data to `program` at a later point, for example:

```javascript
function main() {
    const root = document.getElementById('root');

    const program = coed.program({
        root: root
        initialModel: { name: "Noah" },
        view: view,
        update: update,
    });

    setTimeout(() => {
        program.send(FlipName())
    }, 3000);
}
```

Or via the optional argument `send` in the update function:

```typescript
function update(msg: Msg, model: Model, send: (msg: Msg) => void): Model {
    switch (msg.kind) {
        case "FlipName":
            setTimeout(() => {
                send(FlipName());
            }, 3000);

            if (model.name === "Noah") {
                return { name: "Ianto" };
            } else {
                return { name: "Noah" };
            }
    }
}
```

## Hydration

There is also hydration support, via using `render` with `hydrate`. Check out the [hydration](examples/hydration/) folder for an example.

## Name

Coed is the Welsh word for trees, forest, wood. For English speakers it'd be pronounced similar to "coyed".
