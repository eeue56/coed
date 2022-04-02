import { Maybe } from "@eeue56/ts-core";

export type Tag =
    | "a"
    | "abbr"
    | "address"
    | "area"
    | "article"
    | "aside"
    | "audio"
    | "b"
    | "base"
    | "bdi"
    | "bdo"
    | "blockquote"
    | "body"
    | "br"
    | "button"
    | "canvas"
    | "caption"
    | "cite"
    | "code"
    | "col"
    | "colgroup"
    | "data"
    | "datalist"
    | "dd"
    | "del"
    | "details"
    | "dfn"
    | "dialog"
    | "div"
    | "dl"
    | "dt"
    | "em"
    | "embed"
    | "fieldset"
    | "figure"
    | "footer"
    | "form"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "head"
    | "header"
    | "hgroup"
    | "hr"
    | "html"
    | "i"
    | "iframe"
    | "img"
    | "input"
    | "ins"
    | "kbd"
    | "keygen"
    | "label"
    | "legend"
    | "li"
    | "link"
    | "main"
    | "map"
    | "mark"
    | "menu"
    | "menuitem"
    | "meta"
    | "meter"
    | "nav"
    | "noscript"
    | "object"
    | "ol"
    | "optgroup"
    | "option"
    | "output"
    | "p"
    | "param"
    | "pre"
    | "progress"
    | "q"
    | "rb"
    | "rp"
    | "rt"
    | "rtc"
    | "ruby"
    | "s"
    | "samp"
    | "script"
    | "section"
    | "select"
    | "small"
    | "source"
    | "span"
    | "strong"
    | "style"
    | "sub"
    | "summary"
    | "sup"
    | "table"
    | "tbody"
    | "td"
    | "template"
    | "textarea"
    | "tfoot"
    | "th"
    | "thead"
    | "time"
    | "title"
    | "tr"
    | "track"
    | "u"
    | "ul"
    | "var"
    | "video"
    | "wbr";

type None = {
    kind: "none";
};

type StringAttribute = {
    kind: "string";
    key: string;
    value: string;
};

type StyleAttribute = {
    kind: "style";
    key: string;
    value: string;
};

type NumberAttribute = {
    kind: "number";
    key: string;
    value: string;
};

/**
Used to represent the different types of attributes possible.
*/
export type Attribute =
    | None
    | StringAttribute
    | NumberAttribute
    | StyleAttribute;

/**
Creates a class attribute - classes are combined by the html creator, so you can use it like:
```
html.div([ ], [ class_("one"), class_("two") ], [ ])
```
*/
export function class_(str: string): Attribute {
    return {
        kind: "string",
        key: "class",
        value: str,
    };
}

/**
Creates a style attribute - styles are combined by the html creator, so you can use it like:
```
html.div([ ], [ style_("color", "red"), style_("background-color", "blue") ], [ ])
```
*/
export function style_(key: string, value: string): Attribute {
    return {
        kind: "style",
        key: key,
        value: value,
    };
}

/**
An empty attribute - filtered by the html creator on creation. This is useful if you have a tenary
operator, e.g:
```
html.div([ ], [ somethingTruthy ? none() : class_("something") ], [ ])
```
*/
export function none(): Attribute {
    return {
        kind: "none",
    };
}

/**
Create an attribute with a given key and value. This is set via `setAttribute` at runtime.
*/
export function attribute(key: string, value: string): Attribute {
    if (key === "style")
        return style_(value.split(":")[0], value.split(":")[1]);

    return {
        kind: "string",
        key: key,
        value: value,
    };
}

/**
Every event has a `name`, like `click`, and a tagger which produces a message of the right type
*/
export type Event<Msg> = {
    name: string;
    tagger(data: any): Msg;
};

/**
Creates an event handler for passing to a html node
*/
export function on<Msg>(name: string, tagger: (data: any) => Msg): Event<Msg> {
    return {
        name: name,
        tagger: (event: any) => {
            if (event.stopPropagation) {
                event.stopPropagation();
                event.preventDefault();
            }
            return tagger(event);
        },
    };
}

/**
Special-cased input handler
*/
export function onInput<Msg>(tagger: (data: string) => Msg): Event<Msg> {
    return {
        name: "input",
        tagger: (event: any) => {
            event.stopPropagation();
            event.preventDefault();
            return tagger(event.target.value);
        },
    };
}

type TextNode = {
    kind: "text";
    text: string;
};

type RegularNode<Msg> = {
    kind: "regular";
    tag: Tag;
    events: Event<Msg>[];
    attributes: Attribute[];
    children: HtmlNode<Msg>[];
    _eventListeners: any[];
};

type VoidNode<Msg> = {
    kind: "void";
    tag: Tag;
    events: Event<Msg>[];
    attributes: Attribute[];
    _eventListeners: any[];
};

/**
A HtmlNode is either a text, like:
```
html.text("hello world")
```
Or html, like:
```
html.div([ ], [ ], [ ])
```
*/
export type HtmlNode<Msg> = TextNode | RegularNode<Msg> | VoidNode<Msg>;

/**
Creates a text node
*/
export function text(str: string): TextNode {
    return {
        kind: "text",
        text: str,
    };
}

/**
Creates a html node with a given tag name, any events, any attributes and any children.
*/
export function node<Msg>(
    tag: Tag,
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): RegularNode<Msg> {
    return {
        kind: "regular",
        tag: tag,
        events: events,
        attributes: combineAttributes(attributes),
        children: children,
        _eventListeners: [ ],
    };
}

/**
Creates a void html node with a given tag name, any events, any attributes.
*/
export function voidNode<Msg>(
    tag: Tag,
    events: Event<Msg>[],
    attributes: Attribute[]
): VoidNode<Msg> {
    return {
        kind: "void",
        tag: tag,
        events: events,
        attributes: combineAttributes(attributes),
        _eventListeners: [ ],
    };
}

function combineAttributes(attributes: Attribute[]): Attribute[] {
    const knownStringAttributes: { [id: string]: StringAttribute[] } = {};
    const knownStyleAttributes: StyleAttribute[] = [ ];
    const otherAttributes: Attribute[] = [ ];

    // group attribute values
    attributes.forEach((attribute: Attribute) => {
        switch (attribute.kind) {
            case "string":
                if (!knownStringAttributes[attribute.key]) {
                    knownStringAttributes[attribute.key] = [ ];
                }

                knownStringAttributes[attribute.key].push(attribute);
                break;
            case "style":
                knownStyleAttributes.push(attribute);
                break;
            default:
                otherAttributes.push(attribute);
        }
    });

    const combinedAttributes: Attribute[] = otherAttributes.filter(
        (attribute) => attribute.kind !== "none"
    );

    // actually combine attributes together
    Object.keys(knownStringAttributes).map((key: string) => {
        combinedAttributes.push(
            knownStringAttributes[key].reduce(
                (acc: StringAttribute, currentValue: StringAttribute) => {
                    if (key === "class") {
                        acc.value += " " + currentValue.value;
                    }
                    return acc;
                }
            )
        );
    });

    if (knownStyleAttributes.length > 0) {
        // actually combine attributes together
        combinedAttributes.push(
            knownStyleAttributes.reduce(
                (acc: StringAttribute, currentValue: StyleAttribute) => {
                    if (typeof acc.value === "undefined") acc.value = "";
                    acc.value +=
                        currentValue.key + ":" + currentValue.value + ";";
                    return acc;
                },
                attribute("style", "") as StringAttribute
            )
        );
    }

    return combinedAttributes;
}

function renderAttribute(attribute: Attribute): string {
    switch (attribute.kind) {
        case "string":
            if (attribute.value.indexOf('"') > 0) {
                return `${attribute.key}='${attribute.value}'`;
            }
            return `${attribute.key}="${attribute.value}"`;
        case "number":
            return `${attribute.key}=${attribute.value}`;
        case "style":
            return "";
        case "none":
            return "";
    }
}

/**
Renders a HtmlNode tree as a string.
*/
export function render<Msg>(node: HtmlNode<Msg>, depth = 0): string {
    const whitespace = " ".repeat(depth * 4);
    switch (node.kind) {
        case "text":
            return whitespace + node.text;

        case "void":
        case "regular":
            const attributes =
                (node.attributes.length > 0 ? " " : "") +
                node.attributes.map(renderAttribute).join(" ");

            switch (node.kind) {
                case "void":
                    return whitespace + `<${node.tag}${attributes}>`;

                case "regular": {
                    if (node.children.length > 0) {
                        return (
                            whitespace +
                            `<${node.tag}${attributes}>
${node.children.map((child) => render(child, depth + 1)).join("\n")}
${whitespace}</${node.tag}>`
                        );
                    }

                    return (
                        whitespace + `<${node.tag}${attributes}></${node.tag}>`
                    );
                }
            }
    }
}

/**
Builds a HTMLElement tree from a HtmlNode tree, with event triggers being sent to the runner via the listener
This function should not be needed by most usage.
*/
export function buildTree<Msg>(
    listener: (msg: Msg) => void,
    node: HtmlNode<Msg>
): HTMLElement | Text {
    switch (node.kind) {
        case "text":
            return document.createTextNode(node.text);
        case "void":
        case "regular": {
            const element = document.createElement(node.tag);

            node.attributes.forEach((attribute: Attribute) => {
                setAttributeOnElement(element, attribute);
            });

            node.events.forEach((event: Event<Msg>) => {
                const listenerFunction = (data: globalThis.Event) => {
                    listener(event.tagger(data));
                };

                element.addEventListener(event.name, listenerFunction, {
                    once: true,
                });

                node._eventListeners.push({
                    event: event,
                    listener: listenerFunction,
                });
            });

            if (node.kind === "regular") {
                const children = node.children.map((child) =>
                    buildTree(listener, child)
                );
                children.forEach((child) => {
                    element.appendChild(child);
                });
            }

            return element;
        }
    }
}

/**
Triggers the event by name, passing it the payload provided.
This function is useful for testing but not much else
 */
export function triggerEvent<Msg>(
    eventName: string,
    payload: any,
    node: HtmlNode<Msg>
): Maybe.Maybe<Msg> {
    switch (node.kind) {
        case "text":
            return Maybe.Nothing();
        case "void":
        case "regular":
            const events = node.events.filter(
                (event) => event.name === eventName
            );
            if (events.length > 0) {
                return Maybe.Just(events[0].tagger(payload));
            } else {
                return Maybe.Nothing();
            }
    }
}

/**
Converts a `HtmlNode` of type `A` to a `HtmlNode` of type `B`, including children.
*/
export function map<A, B>(tagger: (a: A) => B, tree: HtmlNode<A>): HtmlNode<B> {
    switch (tree.kind) {
        case "text":
            return tree as HtmlNode<B>;
        case "void":
            return voidNode(
                tree.tag,
                tree.events.map((event: Event<A>) => {
                    return on(event.name, (data: any) =>
                        tagger(event.tagger(data))
                    );
                }),
                tree.attributes
            );
        case "regular":
            return node(
                tree.tag,
                tree.events.map((event: Event<A>) => {
                    return on(event.name, (data: any) =>
                        tagger(event.tagger(data))
                    );
                }),
                tree.attributes,
                tree.children.map((child: HtmlNode<A>) => {
                    return map(tagger, child);
                })
            );
    }
}

function setAttributeOnElement(
    element: HTMLElement,
    attribute: Attribute
): void {
    switch (attribute.kind) {
        case "string":
        case "number":
            (element as any)[attribute.key] = attribute.value;
            element.setAttribute(attribute.key, attribute.value);
            return;
        case "style":
            element.removeAttribute("style");
            const styles = attribute.value.split(";");

            for (var i = 0; i < styles.length; i++) {
                const styleName: string = styles[i].split(":")[0];
                const styleValue = styles[i].split(":")[1];
                element.style[styleName as any] = styleValue;
            }
            return;
        case "none":
            return;
    }
}

function patchFacts<Msg>(nextTree: HtmlNode<Msg>, elements: HTMLElement) {
    switch (nextTree.kind) {
        case "void":
        case "regular":
            nextTree.attributes.forEach((attribute: Attribute) => {
                setAttributeOnElement(elements, attribute);
            });
            return;
        case "text":
            return;
    }
}

function patchEvents<Msg>(
    listener: (msg: Msg) => void,
    previousTree: HtmlNode<Msg>,
    nextTree: HtmlNode<Msg>,
    elements: HTMLElement
) {
    switch (nextTree.kind) {
        case "void":
        case "regular":
            (
                previousTree as RegularNode<Msg> | VoidNode<Msg>
            )._eventListeners.forEach((eventListeners) => {
                elements.removeEventListener(
                    eventListeners.event.name,
                    eventListeners.listener
                );
            });

            (nextTree as RegularNode<Msg> | VoidNode<Msg>).events.forEach(
                (event: Event<Msg>) => {
                    const listenerFunction = (data: globalThis.Event) => {
                        listener(event.tagger(data));
                    };

                    elements.addEventListener(event.name, listenerFunction, {
                        once: true,
                    });

                    nextTree._eventListeners.push({
                        event: event,
                        listener: listenerFunction,
                    });
                }
            );
            return;
        case "text":
            return;
    }
}

function patch<Msg>(
    listener: (msg: Msg) => void,
    currentTree: HtmlNode<Msg>,
    nextTree: HtmlNode<Msg>,
    elements: HTMLElement | Text
): HtmlNode<Msg> {
    if (currentTree.kind != nextTree.kind) {
        elements.replaceWith(buildTree(listener, nextTree));
        return nextTree;
    }

    switch (currentTree.kind) {
        case "text":
            nextTree = nextTree as TextNode;
            elements = elements as Text;

            if (currentTree.text == nextTree.text) {
                return currentTree;
            } else {
                elements.replaceWith(document.createTextNode(nextTree.text));
                return nextTree;
            }

        case "void": {
            currentTree = currentTree as VoidNode<Msg>;
            nextTree = nextTree as VoidNode<Msg>;

            if (currentTree.tag != nextTree.tag) {
                elements.replaceWith(buildTree(listener, nextTree));
                return nextTree;
            } else {
                patchFacts(nextTree, elements as HTMLElement);

                patchEvents(
                    listener,
                    currentTree,
                    nextTree,
                    elements as HTMLElement
                );
                const htmlElements = elements as HTMLElement;
            }
            return nextTree;
        }

        case "regular":
            currentTree = currentTree as RegularNode<Msg>;
            nextTree = nextTree as RegularNode<Msg>;

            const currentTreeId = currentTree.attributes.filter(
                (x) => x.kind === "string" && x.key === "id"
            )[0];
            const nextTreeId = nextTree.attributes.filter(
                (x) => x.kind === "string" && x.key === "id"
            )[0];

            if (
                currentTree.tag !== nextTree.tag ||
                currentTreeId !== nextTreeId
            ) {
                elements.replaceWith(buildTree(listener, nextTree));
                return nextTree;
            } else {
                patchFacts(nextTree, elements as HTMLElement);

                patchEvents(
                    listener,
                    currentTree,
                    nextTree,
                    elements as HTMLElement
                );
                const htmlElements = elements as HTMLElement;

                for (var i = 0; i < nextTree.children.length; i++) {
                    const currentChild = currentTree.children[i];
                    const nextChild = nextTree.children[i];
                    const node = htmlElements.childNodes[i];

                    if (typeof node === "undefined") {
                        htmlElements.appendChild(
                            buildTree(listener, nextChild)
                        );
                        continue;
                    }

                    switch (node.nodeType) {
                        case Node.ELEMENT_NODE:
                            const element = node as HTMLElement;
                            patch(listener, currentChild, nextChild, element);
                            break;

                        case Node.TEXT_NODE:
                            const text = (node as unknown) as Text;
                            patch(listener, currentChild, nextChild, text);
                            break;
                    }
                }

                for (
                    var i = htmlElements.childNodes.length;
                    i > nextTree.children.length;
                    i--
                ) {
                    const node = htmlElements.childNodes[i];
                    htmlElements.removeChild(node);
                }
            }
            return nextTree;
    }
}

/**
Every Coed program follows the model-view-update (MVU) pattern made popular on the frontend by Elm.
An initial model is given, which is passed to the view function which then populates the `root` element.
Any events triggered within the view will use the `update` function to create a new model.
Async updates can be handled via the optional `send` callback within the update function.
*/
export type Program<Model, Msg> = {
    initialModel: Model;
    view(model: Model): HtmlNode<Msg>;
    update(msg: Msg, model: Model, send?: (msg: Msg) => void): Model;
    root: HTMLElement;
};

/**
Every running program can be interacted with via `send`.
For example you may want to start a program but send some data to it after loading a network request.
*/
export type RunningProgram<Model, Msg> = {
    program: Program<Model, Msg>;
    send: (msg: Msg) => void;
};

/**
Takes in a program, sets it up and runs it as a main loop
*/
export function program<Model, Msg>(
    program: Program<Model, Msg>
): RunningProgram<Model, Msg> {
    let model = program.initialModel;
    let previousView = program.view(program.initialModel);

    const listener = (msg: Msg) => {
        model = program.update(msg, model, listener);

        const nextView = program.view(model);
        patch(listener, previousView, nextView, currentTree);
        previousView = nextView;
    };

    let currentTree = buildTree(listener, previousView);
    program.root.appendChild(currentTree);

    return {
        program: program,
        send: listener,
    };
}

// tags

export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("a", events, attributes, children);
}

export function abbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("abbr", events, attributes, children);
}

export function address<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("address", events, attributes, children);
}

export function area<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("area", events, attributes);
}

export function article<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("article", events, attributes, children);
}

export function aside<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("aside", events, attributes, children);
}

export function audio<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("audio", events, attributes, children);
}

export function b<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("b", events, attributes, children);
}

export function base<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("base", events, attributes);
}

export function bdi<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("bdi", events, attributes, children);
}

export function bdo<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("bdo", events, attributes, children);
}

export function blockquote<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("blockquote", events, attributes, children);
}

export function body<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("body", events, attributes, children);
}

export function br<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("br", events, attributes);
}

export function button<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("button", events, attributes, children);
}

export function canvas<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("canvas", events, attributes, children);
}

export function caption<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("caption", events, attributes, children);
}

export function cite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("cite", events, attributes, children);
}

export function code<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("code", events, attributes, children);
}

export function col<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("col", events, attributes);
}

export function colgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("colgroup", events, attributes, children);
}

export function data<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("data", events, attributes, children);
}

export function datalist<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("datalist", events, attributes, children);
}

export function dd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("dd", events, attributes, children);
}

export function del<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("del", events, attributes, children);
}

export function details<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("details", events, attributes, children);
}

export function dfn<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("dfn", events, attributes, children);
}

export function dialog<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("dialog", events, attributes, children);
}

export function div<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("div", events, attributes, children);
}

export function dl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("dl", events, attributes, children);
}

export function dt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("dt", events, attributes, children);
}

export function em<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("em", events, attributes, children);
}

export function embed<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("embed", events, attributes);
}

export function fieldset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("fieldset", events, attributes, children);
}

export function figure<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("figure", events, attributes, children);
}

export function footer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("footer", events, attributes, children);
}

export function form<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("form", events, attributes, children);
}

export function h1<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("h1", events, attributes, children);
}

export function h2<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("h2", events, attributes, children);
}

export function h3<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("h3", events, attributes, children);
}

export function h4<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("h4", events, attributes, children);
}

export function h5<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("h5", events, attributes, children);
}

export function h6<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("h6", events, attributes, children);
}

export function head<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("head", events, attributes, children);
}

export function header<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("header", events, attributes, children);
}

export function hgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("hgroup", events, attributes, children);
}

export function hr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("hr", events, attributes);
}

export function html<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("html", events, attributes, children);
}

export function i<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("i", events, attributes, children);
}

export function iframe<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("iframe", events, attributes, children);
}

export function img<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("img", events, attributes);
}

export function input<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("input", events, attributes);
}

export function ins<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("ins", events, attributes, children);
}

export function kbd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("kbd", events, attributes, children);
}

export function keygen<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("keygen", events, attributes, children);
}

export function label<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("label", events, attributes, children);
}

export function legend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("legend", events, attributes, children);
}

export function li<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("li", events, attributes, children);
}

export function link<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("link", events, attributes);
}

export function main<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("main", events, attributes, children);
}

export function map_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("map", events, attributes, children);
}

export function mark<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("mark", events, attributes, children);
}

export function menu<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("menu", events, attributes, children);
}

export function menuitem<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("menuitem", events, attributes, children);
}

export function meta<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("meta", events, attributes);
}

export function meter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("meter", events, attributes, children);
}

export function nav<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("nav", events, attributes, children);
}

export function noscript<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("noscript", events, attributes, children);
}

export function object<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("object", events, attributes, children);
}

export function ol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("ol", events, attributes, children);
}

export function optgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("optgroup", events, attributes, children);
}

export function option<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("option", events, attributes, children);
}

export function output<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("output", events, attributes, children);
}

export function p<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("p", events, attributes, children);
}

export function param<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("param", events, attributes);
}

export function pre<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("pre", events, attributes, children);
}

export function progress<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("progress", events, attributes, children);
}

export function q<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("q", events, attributes, children);
}

export function rb<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("rb", events, attributes, children);
}

export function rp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("rp", events, attributes, children);
}

export function rt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("rt", events, attributes, children);
}

export function rtc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("rtc", events, attributes, children);
}

export function ruby<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("ruby", events, attributes, children);
}

export function s<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("s", events, attributes, children);
}

export function samp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("samp", events, attributes, children);
}

export function script<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("script", events, attributes, children);
}

export function section<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("section", events, attributes, children);
}

export function select<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("select", events, attributes, children);
}

export function small<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("small", events, attributes, children);
}

export function source<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("source", events, attributes);
}

export function span<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("span", events, attributes, children);
}

export function strong<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("strong", events, attributes, children);
}

export function style<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("style", events, attributes, children);
}

export function sub<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("sub", events, attributes, children);
}

export function summary<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("summary", events, attributes, children);
}

export function sup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("sup", events, attributes, children);
}

export function table<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("table", events, attributes, children);
}

export function tbody<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("tbody", events, attributes, children);
}

export function td<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("td", events, attributes, children);
}

export function template<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("template", events, attributes, children);
}

export function textarea<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("textarea", events, attributes, children);
}

export function tfoot<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("tfoot", events, attributes, children);
}

export function th<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("th", events, attributes, children);
}

export function thead<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("thead", events, attributes, children);
}

export function time<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("time", events, attributes, children);
}

export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("title", events, attributes, children);
}

export function tr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("tr", events, attributes, children);
}

export function track<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("track", events, attributes);
}

export function u<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("u", events, attributes, children);
}

export function ul<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("ul", events, attributes, children);
}

export function var_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("var", events, attributes, children);
}

export function video<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
    return node("video", events, attributes, children);
}

export function wbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
    return voidNode("wbr", events, attributes);
}
