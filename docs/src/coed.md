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
## class_
```javascript
export function class_(str: string): Attribute {
```

Creates a class attribute - classes are combined by the html creator, so you can use it like:
```
html.div([ ], [ class_("one"), class_("two") ], [ ])
```
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L161-L161)
## style_
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
    update(msg: Msg, model: Model, send?: (msg: Msg) => void): Model;
    root: HTMLElement | "hydration";
};

```

Every Coed program follows the model-view-update (MVU) pattern made popular on the frontend by Elm.
An initial model is given, which is passed to the view function which then populates the `root` element.
Any events triggered within the view will use the `update` function to create a new model.
Async updates can be handled via the optional `send` callback within the update function.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L951-L957)
## type RunningProgram<Model, Msg> 
```javascript
export type RunningProgram<Model, Msg> = {
    program: Program<Model, Msg>;
    send: (msg: Msg) => void;
};

```

Every running program can be interacted with via `send`.
For example you may want to start a program but send some data to it after loading a network request.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L962-L966)
## program
```javascript
export function program<Model, Msg>(
    program: Program<Model, Msg>
): RunningProgram<Model, Msg> {
```

Takes in a program, sets it up and runs it as a main loop
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L970-L972)
## a
```javascript
export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1007-L1011)
## abbr
```javascript
export function abbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1015-L1019)
## address
```javascript
export function address<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1023-L1027)
## area
```javascript
export function area<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1031-L1034)
## article
```javascript
export function article<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1038-L1042)
## aside
```javascript
export function aside<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1046-L1050)
## audio
```javascript
export function audio<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1054-L1058)
## b
```javascript
export function b<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1062-L1066)
## base
```javascript
export function base<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1070-L1073)
## bdi
```javascript
export function bdi<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1077-L1081)
## bdo
```javascript
export function bdo<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1085-L1089)
## blockquote
```javascript
export function blockquote<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1093-L1097)
## body
```javascript
export function body<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1101-L1105)
## br
```javascript
export function br<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1109-L1112)
## button
```javascript
export function button<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1116-L1120)
## canvas
```javascript
export function canvas<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1124-L1128)
## caption
```javascript
export function caption<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1132-L1136)
## cite
```javascript
export function cite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1140-L1144)
## code
```javascript
export function code<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1148-L1152)
## col
```javascript
export function col<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1156-L1159)
## colgroup
```javascript
export function colgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1163-L1167)
## data
```javascript
export function data<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1171-L1175)
## datalist
```javascript
export function datalist<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1179-L1183)
## dd
```javascript
export function dd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1187-L1191)
## del
```javascript
export function del<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1195-L1199)
## details
```javascript
export function details<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1203-L1207)
## dfn
```javascript
export function dfn<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1211-L1215)
## dialog
```javascript
export function dialog<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1219-L1223)
## div
```javascript
export function div<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1227-L1231)
## dl
```javascript
export function dl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1235-L1239)
## dt
```javascript
export function dt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1243-L1247)
## em
```javascript
export function em<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1251-L1255)
## embed
```javascript
export function embed<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1259-L1262)
## fieldset
```javascript
export function fieldset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1266-L1270)
## figure
```javascript
export function figure<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1274-L1278)
## footer
```javascript
export function footer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1282-L1286)
## form
```javascript
export function form<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1290-L1294)
## h1
```javascript
export function h1<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1298-L1302)
## h2
```javascript
export function h2<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1306-L1310)
## h3
```javascript
export function h3<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1314-L1318)
## h4
```javascript
export function h4<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1322-L1326)
## h5
```javascript
export function h5<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1330-L1334)
## h6
```javascript
export function h6<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1338-L1342)
## head
```javascript
export function head<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1346-L1350)
## header
```javascript
export function header<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1354-L1358)
## hgroup
```javascript
export function hgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1362-L1366)
## hr
```javascript
export function hr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1370-L1373)
## html
```javascript
export function html<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1377-L1381)
## i
```javascript
export function i<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1385-L1389)
## iframe
```javascript
export function iframe<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1393-L1397)
## img
```javascript
export function img<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1401-L1404)
## input
```javascript
export function input<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1408-L1411)
## ins
```javascript
export function ins<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1415-L1419)
## kbd
```javascript
export function kbd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1423-L1427)
## keygen
```javascript
export function keygen<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1431-L1435)
## label
```javascript
export function label<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1439-L1443)
## legend
```javascript
export function legend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1447-L1451)
## li
```javascript
export function li<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1455-L1459)
## link
```javascript
export function link<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1463-L1466)
## main
```javascript
export function main<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1470-L1474)
## map_
```javascript
export function map_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1478-L1482)
## mark
```javascript
export function mark<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1486-L1490)
## menu
```javascript
export function menu<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1494-L1498)
## menuitem
```javascript
export function menuitem<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1502-L1506)
## meta
```javascript
export function meta<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1510-L1513)
## meter
```javascript
export function meter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1517-L1521)
## nav
```javascript
export function nav<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1525-L1529)
## noscript
```javascript
export function noscript<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1533-L1537)
## object
```javascript
export function object<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1541-L1545)
## ol
```javascript
export function ol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1549-L1553)
## optgroup
```javascript
export function optgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1557-L1561)
## option
```javascript
export function option<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1565-L1569)
## output
```javascript
export function output<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1573-L1577)
## p
```javascript
export function p<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1581-L1585)
## param
```javascript
export function param<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1589-L1592)
## pre
```javascript
export function pre<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1596-L1600)
## progress
```javascript
export function progress<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1604-L1608)
## q
```javascript
export function q<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1612-L1616)
## rb
```javascript
export function rb<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1620-L1624)
## rp
```javascript
export function rp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1628-L1632)
## rt
```javascript
export function rt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1636-L1640)
## rtc
```javascript
export function rtc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1644-L1648)
## ruby
```javascript
export function ruby<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1652-L1656)
## s
```javascript
export function s<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1660-L1664)
## samp
```javascript
export function samp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1668-L1672)
## script
```javascript
export function script<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1676-L1680)
## section
```javascript
export function section<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1684-L1688)
## select
```javascript
export function select<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1692-L1696)
## small
```javascript
export function small<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1700-L1704)
## source
```javascript
export function source<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1708-L1711)
## span
```javascript
export function span<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1715-L1719)
## strong
```javascript
export function strong<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1723-L1727)
## style
```javascript
export function style<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1731-L1735)
## sub
```javascript
export function sub<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1739-L1743)
## summary
```javascript
export function summary<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1747-L1751)
## sup
```javascript
export function sup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1755-L1759)
## table
```javascript
export function table<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1763-L1767)
## tbody
```javascript
export function tbody<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1771-L1775)
## td
```javascript
export function td<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1779-L1783)
## template
```javascript
export function template<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1787-L1791)
## textarea
```javascript
export function textarea<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1795-L1799)
## tfoot
```javascript
export function tfoot<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1803-L1807)
## th
```javascript
export function th<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1811-L1815)
## thead
```javascript
export function thead<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1819-L1823)
## time
```javascript
export function time<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1827-L1831)
## title
```javascript
export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1835-L1839)
## tr
```javascript
export function tr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1843-L1847)
## track
```javascript
export function track<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1851-L1854)
## u
```javascript
export function u<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1858-L1862)
## ul
```javascript
export function ul<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1866-L1870)
## var_
```javascript
export function var_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1874-L1878)
## video
```javascript
export function video<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1882-L1886)
## wbr
```javascript
export function wbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1890-L1893)