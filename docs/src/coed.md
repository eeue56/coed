## type Tag

```javascript
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

```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2-L116)

## type Attribute

```javascript
export type Attribute =
    | None
    | StringAttribute
    | NumberAttribute
    | StyleAttribute
    | BooleanAttribute;

```

Used to represent the different types of attributes possible.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L148-L154)

## type AttributeKind

```javascript
export type AttributeKind = Attribute["kind"];

```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L155-L156)

## class\_

```javascript
export function class_(str: string): Attribute {
```

Creates a class attribute - classes are combined by the html creator, so you can use it like:

```
html.div([ ], [ class_("one"), class_("two") ], [ ])
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L163-L163)

## style\_

```javascript
export function style_(key: string, value: string): Attribute {
```

Creates a style attribute - styles are combined by the html creator, so you can use it like:

```
html.div([ ], [ style_("color", "red"), style_("background-color", "blue") ], [ ])
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L177-L177)

## none

```javascript
export function none(): Attribute {
```

An empty attribute - filtered by the html creator on creation. This is useful if you have a tenary
operator, e.g:

```
html.div([ ], [ somethingTruthy ? none() : class_("something") ], [ ])
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L192-L192)

## attribute

```javascript
export function attribute(key: string, value: string): Attribute {
```

Create an attribute with a given key and value. This is set via `setAttribute` at runtime.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L201-L201)

## booleanAttribute

```javascript
export function booleanAttribute(key: string, value: boolean): Attribute {
```

Create an attribute with a given key and value. This is set via `setAttribute` at runtime.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L215-L215)

## type Event<Msg>

```javascript
export type Event<Msg> = {
    name: string;
    tagger(event: globalThis.Event): Msg;
};

```

Every event has a `name`, like `click`, and a tagger which produces a message of the right type
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L226-L230)

## on

```javascript
export function on<Msg>(
    name: string,
    tagger: (data: globalThis.Event) => Msg,
    stopPropagation: boolean = true,
    preventDefault: boolean = true,
): Event<Msg> {
```

Creates an event handler for passing to a html node
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L234-L239)

## onInput

```javascript
export function onInput<Msg>(tagger: (data: string) => Msg): Event<Msg> {
```

Special-cased input handler
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L257-L257)

## type HtmlNode<Msg>

```javascript
export type HtmlNode<Msg> =
    | TextNode
    | RegularNode<Msg>
    | VoidNode<Msg>
    | NamespacedRegularNode<Msg>
    | NamespacedVoidNode<Msg>
    | HtmlStringNode;

```

A HtmlNode where the content is used to create a DOM element

A HtmlNode is either a text, like:

```
html.text("hello world")
```

Or html, like:

```
html.div([ ], [ ], [ ])
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L335-L342)

## type HtmlNodeKind

```javascript
export type HtmlNodeKind = HtmlNode<never>["kind"];

```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L343-L344)

## text

```javascript
export function text(str: string): TextNode {
```

Creates a text node
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L348-L348)

## node

```javascript
export function node<Msg>(
    tag: Tag,
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): RegularNode<Msg> {
```

Creates a html node with a given tag name, any events, any attributes and any children.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L358-L363)

## voidNode

```javascript
export function voidNode<Msg>(
    tag: Tag,
    events: Event<Msg>[],
    attributes: Attribute[],
): VoidNode<Msg> {
```

Creates a void html node with a given tag name, any events, any attributes.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L377-L381)

## nodeNS

```javascript
export function nodeNS<Msg>(
    tag: Tag,
    namespace: string,
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): NamespacedRegularNode<Msg> {
```

Creates a void html node with a given tag name, any events, any attributes.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L394-L400)

## voidNodeNS

```javascript
export function voidNodeNS<Msg>(
    tag: Tag,
    namespace: string,
    events: Event<Msg>[],
    attributes: Attribute[],
): NamespacedVoidNode<Msg> {
```

Creates a void html node with a given tag name, any events, any attributes.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L421-L426)

## render

```javascript
export function render<Msg>(node: HtmlNode<Msg>, depth = 0): string {
```

Renders a HtmlNode tree as a string.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L523-L523)

## flatRender

```javascript
export function flatRender<Msg>(node: HtmlNode<Msg>): string {
```

Render a node without whitespace
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L570-L570)

## fromString(string: string): HtmlNode

```javascript
export function fromString(string: string): HtmlNode<never> {
```

Create a HtmlStringNode from a html string - and create a DOM element using it
@param string a string of html
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L610-L610)

## hydrate

```javascript
export function hydrate<Model, Msg>(
    program: RunningProgram<Model, Msg>,
    root: Element,
): void {
```

Hydrates a root from a given program. Program must have root set as the string "hydration"
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L617-L620)

## hydrateNode

```javascript
export function hydrateNode<Msg>(
    node: HtmlNode<Msg>,
    listener: (msg: Msg) => void,
    root: Element,
): void {
```

Attaches event listeners to nodes
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L643-L647)

## buildTree

```javascript
export function buildTree<Msg>(
    listener: (msg: Msg) => void,
    node: HtmlNode<Msg>,
): HTMLElement | Text {
```

Builds a HTMLElement tree from a HtmlNode tree, with event triggers being sent to the runner via the listener
This function should not be needed by most usage.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L686-L689)

## triggerEvent

```javascript
export function triggerEvent<Msg>(
    eventName: string,
    payload: any,
    node: HtmlNode<Msg>,
): Maybe<Msg> {
```

Triggers the event by name, passing it the payload provided.
This function is useful for testing but not much else
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L751-L755)

## map

```javascript
export function map<A, B>(tagger: (a: A) => B, tree: HtmlNode<A>): HtmlNode<B> {
```

Converts a `HtmlNode` of type `A` to a `HtmlNode` of type `B`, including children.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L787-L787)

## filter

```javascript
export function filter<A>(
    shouldKeep: (leaf: HtmlNode<A>) => boolean,
    tree: HtmlNode<A>,
): HtmlNode<A> {
```

filters a tree, removing any nodes that don't match. Replaces nodes which don't match with empty text nodes.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L828-L831)

## filterAttributes

```javascript
export function filterAttributes<A>(
    shouldKeep: (attribute: Attribute) => boolean,
    tree: HtmlNode<A>,
): HtmlNode<A> {
```

since classnames are joined into one string, we need to split when filtering

filters a tree, removing any attributes that don't match.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L887-L890)

## filterEvents

```javascript
export function filterEvents<A>(
    shouldKeep: (event: Event<A>) => boolean,
    tree: HtmlNode<A>,
): HtmlNode<A> {
```

filters a tree, removing any events that don't match.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L927-L930)

## type Program<Model, Msg>

```javascript
export type Program<Model, Msg> = {
    initialModel: Model;
    view(model: Model): HtmlNode<Msg>;
    update: (
        msg: Msg,
        model: Model,
        send?: (msg: Msg) => void,
    ) => Model | Promise<Model>;
    root: HTMLElement | "hydration";
    postRender?: (model: Model) => void | Promise<void>;
};

```

Every Coed program follows the model-view-update (MVU) pattern made popular on the frontend by Elm.
An initial model is given, which is passed to the view function which then populates the `root` element.
Any events triggered within the view will use the `update` function to create a new model.
Async updates can be handled via the optional `send` callback within the update function.
`postRender`, if it exists, will be called after rendering and patching the DOM (useful for attaching things to the DOM after the main render)
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1262-L1273)

## type RunningProgram<Model, Msg>

```javascript
export type RunningProgram<Model, Msg> = {
    program: Program<Model, Msg>;
    send: (msg: Msg) => void;
};

```

Every running program can be interacted with via `send`.
For example you may want to start a program but send some data to it after loading a \*network request.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1278-L1282)

## program

```javascript
export function program<Model, Msg>(
    program: Program<Model, Msg>,
): RunningProgram<Model, Msg> {
```

Takes in a program, sets it up and runs it as a main loop
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1286-L1288)

## a

```javascript
export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1326-L1330)

## abbr

```javascript
export function abbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1334-L1338)

## address

```javascript
export function address<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1342-L1346)

## area

```javascript
export function area<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1350-L1353)

## article

```javascript
export function article<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1357-L1361)

## aside

```javascript
export function aside<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1365-L1369)

## audio

```javascript
export function audio<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1373-L1377)

## b

```javascript
export function b<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1381-L1385)

## base

```javascript
export function base<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1389-L1392)

## bdi

```javascript
export function bdi<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1396-L1400)

## bdo

```javascript
export function bdo<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1404-L1408)

## blockquote

```javascript
export function blockquote<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1412-L1416)

## body

```javascript
export function body<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1420-L1424)

## br

```javascript
export function br<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1428-L1431)

## button

```javascript
export function button<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1435-L1439)

## canvas

```javascript
export function canvas<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1443-L1447)

## caption

```javascript
export function caption<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1451-L1455)

## cite

```javascript
export function cite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1459-L1463)

## code

```javascript
export function code<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1467-L1471)

## col

```javascript
export function col<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1475-L1478)

## colgroup

```javascript
export function colgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1482-L1486)

## data

```javascript
export function data<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1490-L1494)

## datalist

```javascript
export function datalist<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1498-L1502)

## dd

```javascript
export function dd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1506-L1510)

## del

```javascript
export function del<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1514-L1518)

## details

```javascript
export function details<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1522-L1526)

## dfn

```javascript
export function dfn<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1530-L1534)

## dialog

```javascript
export function dialog<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1538-L1542)

## div

```javascript
export function div<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1546-L1550)

## dl

```javascript
export function dl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1554-L1558)

## dt

```javascript
export function dt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1562-L1566)

## em

```javascript
export function em<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1570-L1574)

## embed

```javascript
export function embed<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1578-L1581)

## fieldset

```javascript
export function fieldset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1585-L1589)

## figure

```javascript
export function figure<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1593-L1597)

## footer

```javascript
export function footer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1601-L1605)

## form

```javascript
export function form<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1609-L1613)

## h1

```javascript
export function h1<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1617-L1621)

## h2

```javascript
export function h2<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1625-L1629)

## h3

```javascript
export function h3<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1633-L1637)

## h4

```javascript
export function h4<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1641-L1645)

## h5

```javascript
export function h5<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1649-L1653)

## h6

```javascript
export function h6<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1657-L1661)

## head

```javascript
export function head<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1665-L1669)

## header

```javascript
export function header<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1673-L1677)

## hgroup

```javascript
export function hgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1681-L1685)

## hr

```javascript
export function hr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1689-L1692)

## html

```javascript
export function html<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1696-L1700)

## i

```javascript
export function i<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1704-L1708)

## iframe

```javascript
export function iframe<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1712-L1716)

## img

```javascript
export function img<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1720-L1723)

## input

```javascript
export function input<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1727-L1730)

## ins

```javascript
export function ins<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1734-L1738)

## kbd

```javascript
export function kbd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1742-L1746)

## keygen

```javascript
export function keygen<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1750-L1754)

## label

```javascript
export function label<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1758-L1762)

## legend

```javascript
export function legend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1766-L1770)

## li

```javascript
export function li<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1774-L1778)

## link

```javascript
export function link<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1782-L1785)

## main

```javascript
export function main<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1789-L1793)

## map\_

```javascript
export function map_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1797-L1801)

## mark

```javascript
export function mark<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1805-L1809)

## menu

```javascript
export function menu<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1813-L1817)

## menuitem

```javascript
export function menuitem<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1821-L1825)

## meta

```javascript
export function meta<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1829-L1832)

## meter

```javascript
export function meter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1836-L1840)

## nav

```javascript
export function nav<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1844-L1848)

## noscript

```javascript
export function noscript<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1852-L1856)

## object

```javascript
export function object<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1860-L1864)

## ol

```javascript
export function ol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1868-L1872)

## optgroup

```javascript
export function optgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1876-L1880)

## option

```javascript
export function option<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1884-L1888)

## output

```javascript
export function output<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1892-L1896)

## p

```javascript
export function p<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1900-L1904)

## param

```javascript
export function param<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1908-L1911)

## pre

```javascript
export function pre<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1915-L1919)

## progress

```javascript
export function progress<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1923-L1927)

## q

```javascript
export function q<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1931-L1935)

## rb

```javascript
export function rb<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1939-L1943)

## rp

```javascript
export function rp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1947-L1951)

## rt

```javascript
export function rt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1955-L1959)

## rtc

```javascript
export function rtc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1963-L1967)

## ruby

```javascript
export function ruby<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1971-L1975)

## s

```javascript
export function s<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1979-L1983)

## samp

```javascript
export function samp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1987-L1991)

## script

```javascript
export function script<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1995-L1999)

## section

```javascript
export function section<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2003-L2007)

## select

```javascript
export function select<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2011-L2015)

## small

```javascript
export function small<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2019-L2023)

## source

```javascript
export function source<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2027-L2030)

## span

```javascript
export function span<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2034-L2038)

## strong

```javascript
export function strong<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2042-L2046)

## style

```javascript
export function style<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2050-L2054)

## sub

```javascript
export function sub<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2058-L2062)

## summary

```javascript
export function summary<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2066-L2070)

## sup

```javascript
export function sup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2074-L2078)

## table

```javascript
export function table<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2082-L2086)

## tbody

```javascript
export function tbody<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2090-L2094)

## td

```javascript
export function td<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2098-L2102)

## template

```javascript
export function template<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2106-L2110)

## textarea

```javascript
export function textarea<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2114-L2118)

## tfoot

```javascript
export function tfoot<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2122-L2126)

## th

```javascript
export function th<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2130-L2134)

## thead

```javascript
export function thead<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2138-L2142)

## time

```javascript
export function time<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2146-L2150)

## title

```javascript
export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2154-L2158)

## tr

```javascript
export function tr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2162-L2166)

## track

```javascript
export function track<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2170-L2173)

## u

```javascript
export function u<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2177-L2181)

## ul

```javascript
export function ul<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2185-L2189)

## var\_

```javascript
export function var_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2193-L2197)

## video

```javascript
export function video<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2201-L2205)

## wbr

```javascript
export function wbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2209-L2212)
