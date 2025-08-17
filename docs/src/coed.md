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

## class\_

```javascript
export function class_(str: string): Attribute {
```

Creates a class attribute - classes are combined by the html creator, so you can use it like:

```
html.div([ ], [ class_("one"), class_("two") ], [ ])
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L161-L161)

## style\_

```javascript
export function style_(key: string, value: string): Attribute {
```

Creates a style attribute - styles are combined by the html creator, so you can use it like:

```
html.div([ ], [ style_("color", "red"), style_("background-color", "blue") ], [ ])
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L175-L175)

## none

```javascript
export function none(): Attribute {
```

An empty attribute - filtered by the html creator on creation. This is useful if you have a tenary
operator, e.g:

```
html.div([ ], [ somethingTruthy ? none() : class_("something") ], [ ])
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L190-L190)

## attribute

```javascript
export function attribute(key: string, value: string): Attribute {
```

Create an attribute with a given key and value. This is set via `setAttribute` at runtime.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L199-L199)

## booleanAttribute

```javascript
export function booleanAttribute(key: string, value: boolean): Attribute {
```

Create an attribute with a given key and value. This is set via `setAttribute` at runtime.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L213-L213)

## type Event<Msg>

```javascript
export type Event<Msg> = {
    name: string;
    tagger(event: globalThis.Event): Msg;
};

```

Every event has a `name`, like `click`, and a tagger which produces a message of the right type
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L224-L228)

## on

```javascript
export function on<Msg>(
    name: string,
    tagger: (data: globalThis.Event) => Msg,
    stopPropagation: boolean = true,
    preventDefault: boolean = true
): Event<Msg> {
```

Creates an event handler for passing to a html node
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L232-L237)

## onInput

```javascript
export function onInput<Msg>(tagger: (data: string) => Msg): Event<Msg> {
```

Special-cased input handler
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L255-L255)

## type HtmlNode<Msg>

```javascript
export type HtmlNode<Msg> = TextNode | RegularNode<Msg> | VoidNode<Msg>;

```

A HtmlNode is either a text, like:

```
html.text("hello world")
```

Or html, like:

```
html.div([ ], [ ], [ ])
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L306-L307)

## text

```javascript
export function text(str: string): TextNode {
```

Creates a text node
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L311-L311)

## node

```javascript
export function node<Msg>(
    tag: Tag,
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): RegularNode<Msg> {
```

Creates a html node with a given tag name, any events, any attributes and any children.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L321-L326)

## voidNode

```javascript
export function voidNode<Msg>(
    tag: Tag,
    events: Event<Msg>[],
    attributes: Attribute[]
): VoidNode<Msg> {
```

Creates a void html node with a given tag name, any events, any attributes.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L340-L344)

## render

```javascript
export function render<Msg>(node: HtmlNode<Msg>, depth = 0): string {
```

Renders a HtmlNode tree as a string.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L434-L434)

## flatRender

```javascript
export function flatRender<Msg>(node: HtmlNode<Msg>): string {
```

Render a node without whitespace
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L473-L473)

## hydrate

```javascript
export function hydrate<Model, Msg>(
    program: RunningProgram<Model, Msg>,
    root: Element
) {
```

Hydrates a root from a given program. Program must have root set as the string "hydration"
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L504-L507)

## hydrateNode

```javascript
export function hydrateNode<Msg>(
    node: HtmlNode<Msg>,
    listener: (msg: Msg) => void,
    root: Element
): void {
```

Attaches event listeners to nodes
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L530-L534)

## buildTree

```javascript
export function buildTree<Msg>(
    listener: (msg: Msg) => void,
    node: HtmlNode<Msg>
): HTMLElement | Text {
```

Builds a HTMLElement tree from a HtmlNode tree, with event triggers being sent to the runner via the listener
This function should not be needed by most usage.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L573-L576)

## triggerEvent

```javascript
export function triggerEvent<Msg>(
    eventName: string,
    payload: any,
    node: HtmlNode<Msg>
): Maybe.Maybe<Msg> {
```

Triggers the event by name, passing it the payload provided.
This function is useful for testing but not much else
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L621-L625)

## map

```javascript
export function map<A, B>(tagger: (a: A) => B, tree: HtmlNode<A>): HtmlNode<B> {
```

Converts a `HtmlNode` of type `A` to a `HtmlNode` of type `B`, including children.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L650-L650)

## type Program<Model, Msg>

```javascript
export type Program<Model, Msg> = {
    initialModel: Model;
    view(model: Model): HtmlNode<Msg>;
    update: (
        msg: Msg,
        model: Model,
        send?: (msg: Msg) => void
    ) => Model | Promise<Model>;
    root: HTMLElement | "hydration";
};

```

Every Coed program follows the model-view-update (MVU) pattern made popular on the frontend by Elm.
An initial model is given, which is passed to the view function which then populates the `root` element.
Any events triggered within the view will use the `update` function to create a new model.
Async updates can be handled via the optional `send` callback within the update function.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L951-L961)

## type RunningProgram<Model, Msg>

```javascript
export type RunningProgram<Model, Msg> = {
    program: Program<Model, Msg>;
    send: (msg: Msg) => void;
};

```

Every running program can be interacted with via `send`.
For example you may want to start a program but send some data to it after loading a network request.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L966-L970)

## program

```javascript
export function program<Model, Msg>(
    program: Program<Model, Msg>
): RunningProgram<Model, Msg> {
```

Takes in a program, sets it up and runs it as a main loop
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L974-L976)

## a

```javascript
export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1011-L1015)

## abbr

```javascript
export function abbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1019-L1023)

## address

```javascript
export function address<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1027-L1031)

## area

```javascript
export function area<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1035-L1038)

## article

```javascript
export function article<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1042-L1046)

## aside

```javascript
export function aside<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1050-L1054)

## audio

```javascript
export function audio<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1058-L1062)

## b

```javascript
export function b<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1066-L1070)

## base

```javascript
export function base<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1074-L1077)

## bdi

```javascript
export function bdi<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1081-L1085)

## bdo

```javascript
export function bdo<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1089-L1093)

## blockquote

```javascript
export function blockquote<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1097-L1101)

## body

```javascript
export function body<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1105-L1109)

## br

```javascript
export function br<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1113-L1116)

## button

```javascript
export function button<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1120-L1124)

## canvas

```javascript
export function canvas<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1128-L1132)

## caption

```javascript
export function caption<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1136-L1140)

## cite

```javascript
export function cite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1144-L1148)

## code

```javascript
export function code<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1152-L1156)

## col

```javascript
export function col<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1160-L1163)

## colgroup

```javascript
export function colgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1167-L1171)

## data

```javascript
export function data<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1175-L1179)

## datalist

```javascript
export function datalist<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1183-L1187)

## dd

```javascript
export function dd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1191-L1195)

## del

```javascript
export function del<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1199-L1203)

## details

```javascript
export function details<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1207-L1211)

## dfn

```javascript
export function dfn<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1215-L1219)

## dialog

```javascript
export function dialog<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1223-L1227)

## div

```javascript
export function div<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1231-L1235)

## dl

```javascript
export function dl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1239-L1243)

## dt

```javascript
export function dt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1247-L1251)

## em

```javascript
export function em<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1255-L1259)

## embed

```javascript
export function embed<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1263-L1266)

## fieldset

```javascript
export function fieldset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1270-L1274)

## figure

```javascript
export function figure<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1278-L1282)

## footer

```javascript
export function footer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1286-L1290)

## form

```javascript
export function form<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1294-L1298)

## h1

```javascript
export function h1<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1302-L1306)

## h2

```javascript
export function h2<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1310-L1314)

## h3

```javascript
export function h3<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1318-L1322)

## h4

```javascript
export function h4<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1326-L1330)

## h5

```javascript
export function h5<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1334-L1338)

## h6

```javascript
export function h6<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1342-L1346)

## head

```javascript
export function head<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1350-L1354)

## header

```javascript
export function header<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1358-L1362)

## hgroup

```javascript
export function hgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1366-L1370)

## hr

```javascript
export function hr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1374-L1377)

## html

```javascript
export function html<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1381-L1385)

## i

```javascript
export function i<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1389-L1393)

## iframe

```javascript
export function iframe<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1397-L1401)

## img

```javascript
export function img<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1405-L1408)

## input

```javascript
export function input<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1412-L1415)

## ins

```javascript
export function ins<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1419-L1423)

## kbd

```javascript
export function kbd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1427-L1431)

## keygen

```javascript
export function keygen<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1435-L1439)

## label

```javascript
export function label<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1443-L1447)

## legend

```javascript
export function legend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1451-L1455)

## li

```javascript
export function li<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1459-L1463)

## link

```javascript
export function link<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1467-L1470)

## main

```javascript
export function main<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1474-L1478)

## map\_

```javascript
export function map_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1482-L1486)

## mark

```javascript
export function mark<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1490-L1494)

## menu

```javascript
export function menu<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1498-L1502)

## menuitem

```javascript
export function menuitem<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1506-L1510)

## meta

```javascript
export function meta<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1514-L1517)

## meter

```javascript
export function meter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1521-L1525)

## nav

```javascript
export function nav<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1529-L1533)

## noscript

```javascript
export function noscript<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1537-L1541)

## object

```javascript
export function object<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1545-L1549)

## ol

```javascript
export function ol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1553-L1557)

## optgroup

```javascript
export function optgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1561-L1565)

## option

```javascript
export function option<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1569-L1573)

## output

```javascript
export function output<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1577-L1581)

## p

```javascript
export function p<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1585-L1589)

## param

```javascript
export function param<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1593-L1596)

## pre

```javascript
export function pre<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1600-L1604)

## progress

```javascript
export function progress<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1608-L1612)

## q

```javascript
export function q<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1616-L1620)

## rb

```javascript
export function rb<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1624-L1628)

## rp

```javascript
export function rp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1632-L1636)

## rt

```javascript
export function rt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1640-L1644)

## rtc

```javascript
export function rtc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1648-L1652)

## ruby

```javascript
export function ruby<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1656-L1660)

## s

```javascript
export function s<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1664-L1668)

## samp

```javascript
export function samp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1672-L1676)

## script

```javascript
export function script<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1680-L1684)

## section

```javascript
export function section<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1688-L1692)

## select

```javascript
export function select<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1696-L1700)

## small

```javascript
export function small<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1704-L1708)

## source

```javascript
export function source<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1712-L1715)

## span

```javascript
export function span<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1719-L1723)

## strong

```javascript
export function strong<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1727-L1731)

## style

```javascript
export function style<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1735-L1739)

## sub

```javascript
export function sub<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1743-L1747)

## summary

```javascript
export function summary<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1751-L1755)

## sup

```javascript
export function sup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1759-L1763)

## table

```javascript
export function table<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1767-L1771)

## tbody

```javascript
export function tbody<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1775-L1779)

## td

```javascript
export function td<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1783-L1787)

## template

```javascript
export function template<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1791-L1795)

## textarea

```javascript
export function textarea<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1799-L1803)

## tfoot

```javascript
export function tfoot<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1807-L1811)

## th

```javascript
export function th<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1815-L1819)

## thead

```javascript
export function thead<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1823-L1827)

## time

```javascript
export function time<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1831-L1835)

## title

```javascript
export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1839-L1843)

## tr

```javascript
export function tr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1847-L1851)

## track

```javascript
export function track<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1855-L1858)

## u

```javascript
export function u<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1862-L1866)

## ul

```javascript
export function ul<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1870-L1874)

## var\_

```javascript
export function var_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1878-L1882)

## video

```javascript
export function video<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1886-L1890)

## wbr

```javascript
export function wbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1894-L1897)
