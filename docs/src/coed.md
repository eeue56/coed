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
    postRender?: () => void | Promise<void>;
};

```

Every Coed program follows the model-view-update (MVU) pattern made popular on the frontend by Elm.
An initial model is given, which is passed to the view function which then populates the `root` element.
Any events triggered within the view will use the `update` function to create a new model.
Async updates can be handled via the optional `send` callback within the update function.
`postRender`, if it exists, will be called after rendering and patching the DOM (useful for attaching things to the DOM after the main render)
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L952-L963)

## type RunningProgram<Model, Msg>

```javascript
export type RunningProgram<Model, Msg> = {
    program: Program<Model, Msg>;
    send: (msg: Msg) => void;
};

```

Every running program can be interacted with via `send`.
For example you may want to start a program but send some data to it after loading a network request.
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L968-L972)

## program

```javascript
export function program<Model, Msg>(
    program: Program<Model, Msg>
): RunningProgram<Model, Msg> {
```

Takes in a program, sets it up and runs it as a main loop
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L976-L978)

## a

```javascript
export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1016-L1020)

## abbr

```javascript
export function abbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1024-L1028)

## address

```javascript
export function address<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1032-L1036)

## area

```javascript
export function area<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1040-L1043)

## article

```javascript
export function article<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1047-L1051)

## aside

```javascript
export function aside<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1055-L1059)

## audio

```javascript
export function audio<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1063-L1067)

## b

```javascript
export function b<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1071-L1075)

## base

```javascript
export function base<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1079-L1082)

## bdi

```javascript
export function bdi<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1086-L1090)

## bdo

```javascript
export function bdo<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1094-L1098)

## blockquote

```javascript
export function blockquote<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1102-L1106)

## body

```javascript
export function body<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1110-L1114)

## br

```javascript
export function br<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1118-L1121)

## button

```javascript
export function button<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1125-L1129)

## canvas

```javascript
export function canvas<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1133-L1137)

## caption

```javascript
export function caption<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1141-L1145)

## cite

```javascript
export function cite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1149-L1153)

## code

```javascript
export function code<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1157-L1161)

## col

```javascript
export function col<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1165-L1168)

## colgroup

```javascript
export function colgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1172-L1176)

## data

```javascript
export function data<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1180-L1184)

## datalist

```javascript
export function datalist<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1188-L1192)

## dd

```javascript
export function dd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1196-L1200)

## del

```javascript
export function del<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1204-L1208)

## details

```javascript
export function details<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1212-L1216)

## dfn

```javascript
export function dfn<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1220-L1224)

## dialog

```javascript
export function dialog<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1228-L1232)

## div

```javascript
export function div<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1236-L1240)

## dl

```javascript
export function dl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1244-L1248)

## dt

```javascript
export function dt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1252-L1256)

## em

```javascript
export function em<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1260-L1264)

## embed

```javascript
export function embed<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1268-L1271)

## fieldset

```javascript
export function fieldset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1275-L1279)

## figure

```javascript
export function figure<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1283-L1287)

## footer

```javascript
export function footer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1291-L1295)

## form

```javascript
export function form<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1299-L1303)

## h1

```javascript
export function h1<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1307-L1311)

## h2

```javascript
export function h2<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1315-L1319)

## h3

```javascript
export function h3<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1323-L1327)

## h4

```javascript
export function h4<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1331-L1335)

## h5

```javascript
export function h5<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1339-L1343)

## h6

```javascript
export function h6<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1347-L1351)

## head

```javascript
export function head<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1355-L1359)

## header

```javascript
export function header<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1363-L1367)

## hgroup

```javascript
export function hgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1371-L1375)

## hr

```javascript
export function hr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1379-L1382)

## html

```javascript
export function html<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1386-L1390)

## i

```javascript
export function i<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1394-L1398)

## iframe

```javascript
export function iframe<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1402-L1406)

## img

```javascript
export function img<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1410-L1413)

## input

```javascript
export function input<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1417-L1420)

## ins

```javascript
export function ins<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1424-L1428)

## kbd

```javascript
export function kbd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1432-L1436)

## keygen

```javascript
export function keygen<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1440-L1444)

## label

```javascript
export function label<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1448-L1452)

## legend

```javascript
export function legend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1456-L1460)

## li

```javascript
export function li<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1464-L1468)

## link

```javascript
export function link<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1472-L1475)

## main

```javascript
export function main<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1479-L1483)

## map\_

```javascript
export function map_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1487-L1491)

## mark

```javascript
export function mark<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1495-L1499)

## menu

```javascript
export function menu<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1503-L1507)

## menuitem

```javascript
export function menuitem<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1511-L1515)

## meta

```javascript
export function meta<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1519-L1522)

## meter

```javascript
export function meter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1526-L1530)

## nav

```javascript
export function nav<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1534-L1538)

## noscript

```javascript
export function noscript<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1542-L1546)

## object

```javascript
export function object<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1550-L1554)

## ol

```javascript
export function ol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1558-L1562)

## optgroup

```javascript
export function optgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1566-L1570)

## option

```javascript
export function option<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1574-L1578)

## output

```javascript
export function output<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1582-L1586)

## p

```javascript
export function p<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1590-L1594)

## param

```javascript
export function param<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1598-L1601)

## pre

```javascript
export function pre<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1605-L1609)

## progress

```javascript
export function progress<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1613-L1617)

## q

```javascript
export function q<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1621-L1625)

## rb

```javascript
export function rb<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1629-L1633)

## rp

```javascript
export function rp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1637-L1641)

## rt

```javascript
export function rt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1645-L1649)

## rtc

```javascript
export function rtc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1653-L1657)

## ruby

```javascript
export function ruby<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1661-L1665)

## s

```javascript
export function s<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1669-L1673)

## samp

```javascript
export function samp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1677-L1681)

## script

```javascript
export function script<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1685-L1689)

## section

```javascript
export function section<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1693-L1697)

## select

```javascript
export function select<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1701-L1705)

## small

```javascript
export function small<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1709-L1713)

## source

```javascript
export function source<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1717-L1720)

## span

```javascript
export function span<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1724-L1728)

## strong

```javascript
export function strong<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1732-L1736)

## style

```javascript
export function style<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1740-L1744)

## sub

```javascript
export function sub<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1748-L1752)

## summary

```javascript
export function summary<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1756-L1760)

## sup

```javascript
export function sup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1764-L1768)

## table

```javascript
export function table<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1772-L1776)

## tbody

```javascript
export function tbody<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1780-L1784)

## td

```javascript
export function td<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1788-L1792)

## template

```javascript
export function template<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1796-L1800)

## textarea

```javascript
export function textarea<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1804-L1808)

## tfoot

```javascript
export function tfoot<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1812-L1816)

## th

```javascript
export function th<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1820-L1824)

## thead

```javascript
export function thead<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1828-L1832)

## time

```javascript
export function time<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1836-L1840)

## title

```javascript
export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1844-L1848)

## tr

```javascript
export function tr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1852-L1856)

## track

```javascript
export function track<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1860-L1863)

## u

```javascript
export function u<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1867-L1871)

## ul

```javascript
export function ul<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1875-L1879)

## var\_

```javascript
export function var_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1883-L1887)

## video

```javascript
export function video<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1891-L1895)

## wbr

```javascript
export function wbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1899-L1902)
