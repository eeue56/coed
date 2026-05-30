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
): Maybe.Maybe<Msg> {
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

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L825-L828)

## filterAttributes

```javascript
export function filterAttributes<A>(
    shouldKeep: (attribute: Attribute) => boolean,
    tree: HtmlNode<A>,
): HtmlNode<A> {
```

since classnames are joined into one string, we need to split when filtering
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L881-L884)

## filterEvents

```javascript
export function filterEvents<A>(
    shouldKeep: (event: Event<A>) => boolean,
    tree: HtmlNode<A>,
): HtmlNode<A> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L918-L921)

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
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1253-L1264)

## type RunningProgram<Model, Msg>

```javascript
export type RunningProgram<Model, Msg> = {
    program: Program<Model, Msg>;
    send: (msg: Msg) => void;
};

```

Every running program can be interacted with via `send`.
For example you may want to start a program but send some data to it after loading a \*network request.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1269-L1273)

## program

```javascript
export function program<Model, Msg>(
    program: Program<Model, Msg>,
): RunningProgram<Model, Msg> {
```

Takes in a program, sets it up and runs it as a main loop
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1277-L1279)

## a

```javascript
export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1317-L1321)

## abbr

```javascript
export function abbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1325-L1329)

## address

```javascript
export function address<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1333-L1337)

## area

```javascript
export function area<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1341-L1344)

## article

```javascript
export function article<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1348-L1352)

## aside

```javascript
export function aside<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1356-L1360)

## audio

```javascript
export function audio<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1364-L1368)

## b

```javascript
export function b<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1372-L1376)

## base

```javascript
export function base<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1380-L1383)

## bdi

```javascript
export function bdi<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1387-L1391)

## bdo

```javascript
export function bdo<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1395-L1399)

## blockquote

```javascript
export function blockquote<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1403-L1407)

## body

```javascript
export function body<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1411-L1415)

## br

```javascript
export function br<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1419-L1422)

## button

```javascript
export function button<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1426-L1430)

## canvas

```javascript
export function canvas<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1434-L1438)

## caption

```javascript
export function caption<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1442-L1446)

## cite

```javascript
export function cite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1450-L1454)

## code

```javascript
export function code<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1458-L1462)

## col

```javascript
export function col<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1466-L1469)

## colgroup

```javascript
export function colgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1473-L1477)

## data

```javascript
export function data<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1481-L1485)

## datalist

```javascript
export function datalist<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1489-L1493)

## dd

```javascript
export function dd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1497-L1501)

## del

```javascript
export function del<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1505-L1509)

## details

```javascript
export function details<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1513-L1517)

## dfn

```javascript
export function dfn<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1521-L1525)

## dialog

```javascript
export function dialog<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1529-L1533)

## div

```javascript
export function div<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1537-L1541)

## dl

```javascript
export function dl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1545-L1549)

## dt

```javascript
export function dt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1553-L1557)

## em

```javascript
export function em<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1561-L1565)

## embed

```javascript
export function embed<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1569-L1572)

## fieldset

```javascript
export function fieldset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1576-L1580)

## figure

```javascript
export function figure<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1584-L1588)

## footer

```javascript
export function footer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1592-L1596)

## form

```javascript
export function form<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1600-L1604)

## h1

```javascript
export function h1<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1608-L1612)

## h2

```javascript
export function h2<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1616-L1620)

## h3

```javascript
export function h3<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1624-L1628)

## h4

```javascript
export function h4<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1632-L1636)

## h5

```javascript
export function h5<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1640-L1644)

## h6

```javascript
export function h6<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1648-L1652)

## head

```javascript
export function head<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1656-L1660)

## header

```javascript
export function header<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1664-L1668)

## hgroup

```javascript
export function hgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1672-L1676)

## hr

```javascript
export function hr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1680-L1683)

## html

```javascript
export function html<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1687-L1691)

## i

```javascript
export function i<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1695-L1699)

## iframe

```javascript
export function iframe<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1703-L1707)

## img

```javascript
export function img<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1711-L1714)

## input

```javascript
export function input<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1718-L1721)

## ins

```javascript
export function ins<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1725-L1729)

## kbd

```javascript
export function kbd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1733-L1737)

## keygen

```javascript
export function keygen<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1741-L1745)

## label

```javascript
export function label<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1749-L1753)

## legend

```javascript
export function legend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1757-L1761)

## li

```javascript
export function li<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1765-L1769)

## link

```javascript
export function link<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1773-L1776)

## main

```javascript
export function main<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1780-L1784)

## map\_

```javascript
export function map_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1788-L1792)

## mark

```javascript
export function mark<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1796-L1800)

## menu

```javascript
export function menu<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1804-L1808)

## menuitem

```javascript
export function menuitem<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1812-L1816)

## meta

```javascript
export function meta<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1820-L1823)

## meter

```javascript
export function meter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1827-L1831)

## nav

```javascript
export function nav<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1835-L1839)

## noscript

```javascript
export function noscript<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1843-L1847)

## object

```javascript
export function object<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1851-L1855)

## ol

```javascript
export function ol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1859-L1863)

## optgroup

```javascript
export function optgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1867-L1871)

## option

```javascript
export function option<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1875-L1879)

## output

```javascript
export function output<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1883-L1887)

## p

```javascript
export function p<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1891-L1895)

## param

```javascript
export function param<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1899-L1902)

## pre

```javascript
export function pre<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1906-L1910)

## progress

```javascript
export function progress<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1914-L1918)

## q

```javascript
export function q<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1922-L1926)

## rb

```javascript
export function rb<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1930-L1934)

## rp

```javascript
export function rp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1938-L1942)

## rt

```javascript
export function rt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1946-L1950)

## rtc

```javascript
export function rtc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1954-L1958)

## ruby

```javascript
export function ruby<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1962-L1966)

## s

```javascript
export function s<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1970-L1974)

## samp

```javascript
export function samp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1978-L1982)

## script

```javascript
export function script<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1986-L1990)

## section

```javascript
export function section<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1994-L1998)

## select

```javascript
export function select<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2002-L2006)

## small

```javascript
export function small<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2010-L2014)

## source

```javascript
export function source<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2018-L2021)

## span

```javascript
export function span<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2025-L2029)

## strong

```javascript
export function strong<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2033-L2037)

## style

```javascript
export function style<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2041-L2045)

## sub

```javascript
export function sub<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2049-L2053)

## summary

```javascript
export function summary<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2057-L2061)

## sup

```javascript
export function sup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2065-L2069)

## table

```javascript
export function table<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2073-L2077)

## tbody

```javascript
export function tbody<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2081-L2085)

## td

```javascript
export function td<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2089-L2093)

## template

```javascript
export function template<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2097-L2101)

## textarea

```javascript
export function textarea<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2105-L2109)

## tfoot

```javascript
export function tfoot<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2113-L2117)

## th

```javascript
export function th<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2121-L2125)

## thead

```javascript
export function thead<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2129-L2133)

## time

```javascript
export function time<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2137-L2141)

## title

```javascript
export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2145-L2149)

## tr

```javascript
export function tr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2153-L2157)

## track

```javascript
export function track<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2161-L2164)

## u

```javascript
export function u<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2168-L2172)

## ul

```javascript
export function ul<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2176-L2180)

## var\_

```javascript
export function var_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2184-L2188)

## video

```javascript
export function video<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2192-L2196)

## wbr

```javascript
export function wbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L2200-L2203)
