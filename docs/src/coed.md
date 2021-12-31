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
    | StyleAttribute;

```
/**
Used to represent the different types of attributes possible.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L142-L147)
## class_
```javascript
export function class_(str: string): Attribute {
```
/**
Creates a class attribute - classes are combined by the html creator, so you can use it like:
```
html.div([ ], [ class_("one"), class_("two") ], [ ])
```
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L154-L154)
## style_
```javascript
export function style_(key: string, value: string): Attribute {
```
/**
Creates a style attribute - styles are combined by the html creator, so you can use it like:
```
html.div([ ], [ style_("color", "red"), style_("background-color", "blue") ], [ ])
```
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L168-L168)
## none
```javascript
export function none(): Attribute {
```
/**
An empty attribute - filtered by the html creator on creation. This is useful if you have a tenary
operator, e.g:
```
html.div([ ], [ somethingTruthy ? none() : class_("something") ], [ ])
```
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L183-L183)
## attribute
```javascript
export function attribute(key: string, value: string): Attribute {
```
/**
Create an attribute with a given key and value. This is set via `setAttribute` at runtime.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L192-L192)
## type Event<Msg> 
```javascript
export type Event<Msg> = {
    name: string;
    tagger(data: any): Msg;
};

```
/**
Every event has a `name`, like `click`, and a tagger which produces a message of the right type
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L206-L210)
## on
```javascript
export function on<Msg>(name: string, tagger: (data: any) => Msg): Event<Msg> {
```
/**
Creates an event handler for passing to a html node
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L214-L214)
## onInput
```javascript
export function onInput<Msg>(tagger: (data: string) => Msg): Event<Msg> {
```
/**
Special-cased input handler
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L230-L230)
## type HtmlNode<Msg> 
```javascript
export type HtmlNode<Msg> = TextNode | RegularNode<Msg> | VoidNode<Msg>;

```
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
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L273-L274)
## text
```javascript
export function text(str: string): TextNode {
```
/**
Creates a text node
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L278-L278)
## node
```javascript
export function node<Msg>(
    tag: Tag,
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): RegularNode<Msg> {
```
/**
Creates a html node with a given tag name, any events, any attributes and any children.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L288-L293)
## voidNode
```javascript
export function voidNode<Msg>(
    tag: Tag,
    events: Event<Msg>[],
    attributes: Attribute[]
): VoidNode<Msg> {
```
/**
Creates a void html node with a given tag name, any events, any attributes.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L307-L311)
## render
```javascript
export function render<Msg>(node: HtmlNode<Msg>, depth = 0): string {
```
/**
Renders a HtmlNode tree as a string.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L399-L399)
## buildTree
```javascript
export function buildTree<Msg>(
    listener: (msg: Msg) => void,
    node: HtmlNode<Msg>
): HTMLElement | Text {
```
/**
Builds a HTMLElement tree from a HtmlNode tree, with event triggers being sent to the runner via the listener
This function should not be needed by most usage.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L437-L440)
## triggerEvent
```javascript
export function triggerEvent<Msg>(
    eventName: string,
    payload: any,
    node: HtmlNode<Msg>
): Maybe.Maybe<Msg> {
```
/**
Triggers the event by name, passing it the payload provided.
This function is useful for testing but not much else
 */
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L485-L489)
## map
```javascript
export function map<A, B>(tagger: (a: A) => B, tree: HtmlNode<A>): HtmlNode<B> {
```
/**
Converts a `HtmlNode` of type `A` to a `HtmlNode` of type `B`, including children.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L509-L509)
## type Program<Model, Msg> 
```javascript
export type Program<Model, Msg> = {
    initialModel: Model;
    view(model: Model): HtmlNode<Msg>;
    update(msg: Msg, model: Model, send?: (msg: Msg) => void): Model;
    root: HTMLElement;
};

```
/**
Every Coed program follows the model-view-update (MVU) pattern made popular on the frontend by Elm.
An initial model is given, which is passed to the view function which then populates the `root` element.
Any events triggered within the view will use the `update` function to create a new model.
Async updates can be handled via the optional `send` callback within the update function.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L723-L729)
## type RunningProgram<Model, Msg> 
```javascript
export type RunningProgram<Model, Msg> = {
    program: Program<Model, Msg>;
    send: (msg: Msg) => void;
};

```
/**
Every running program can be interacted with via `send`.
For example you may want to start a program but send some data to it after loading a network request.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L734-L738)
## program
```javascript
export function program<Model, Msg>(
    program: Program<Model, Msg>
): RunningProgram<Model, Msg> {
```
/**
Takes in a program, sets it up and runs it as a main loop
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L742-L744)
## a
```javascript
export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L767-L771)
## abbr
```javascript
export function abbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L775-L779)
## address
```javascript
export function address<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L783-L787)
## area
```javascript
export function area<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L791-L794)
## article
```javascript
export function article<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L798-L802)
## aside
```javascript
export function aside<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L806-L810)
## audio
```javascript
export function audio<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L814-L818)
## b
```javascript
export function b<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L822-L826)
## base
```javascript
export function base<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L830-L833)
## bdi
```javascript
export function bdi<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L837-L841)
## bdo
```javascript
export function bdo<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L845-L849)
## blockquote
```javascript
export function blockquote<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L853-L857)
## body
```javascript
export function body<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L861-L865)
## br
```javascript
export function br<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L869-L872)
## button
```javascript
export function button<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L876-L880)
## canvas
```javascript
export function canvas<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L884-L888)
## caption
```javascript
export function caption<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L892-L896)
## cite
```javascript
export function cite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L900-L904)
## code
```javascript
export function code<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L908-L912)
## col
```javascript
export function col<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L916-L919)
## colgroup
```javascript
export function colgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L923-L927)
## data
```javascript
export function data<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L931-L935)
## datalist
```javascript
export function datalist<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L939-L943)
## dd
```javascript
export function dd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L947-L951)
## del
```javascript
export function del<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L955-L959)
## details
```javascript
export function details<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L963-L967)
## dfn
```javascript
export function dfn<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L971-L975)
## dialog
```javascript
export function dialog<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L979-L983)
## div
```javascript
export function div<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L987-L991)
## dl
```javascript
export function dl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L995-L999)
## dt
```javascript
export function dt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1003-L1007)
## em
```javascript
export function em<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1011-L1015)
## embed
```javascript
export function embed<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1019-L1022)
## fieldset
```javascript
export function fieldset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1026-L1030)
## figure
```javascript
export function figure<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1034-L1038)
## footer
```javascript
export function footer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1042-L1046)
## form
```javascript
export function form<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1050-L1054)
## h1
```javascript
export function h1<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1058-L1062)
## h2
```javascript
export function h2<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1066-L1070)
## h3
```javascript
export function h3<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1074-L1078)
## h4
```javascript
export function h4<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1082-L1086)
## h5
```javascript
export function h5<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1090-L1094)
## h6
```javascript
export function h6<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1098-L1102)
## head
```javascript
export function head<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1106-L1110)
## header
```javascript
export function header<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1114-L1118)
## hgroup
```javascript
export function hgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1122-L1126)
## hr
```javascript
export function hr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1130-L1133)
## html
```javascript
export function html<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1137-L1141)
## i
```javascript
export function i<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1145-L1149)
## iframe
```javascript
export function iframe<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1153-L1157)
## img
```javascript
export function img<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1161-L1164)
## input
```javascript
export function input<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1168-L1171)
## ins
```javascript
export function ins<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1175-L1179)
## kbd
```javascript
export function kbd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1183-L1187)
## keygen
```javascript
export function keygen<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1191-L1195)
## label
```javascript
export function label<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1199-L1203)
## legend
```javascript
export function legend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1207-L1211)
## li
```javascript
export function li<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1215-L1219)
## link
```javascript
export function link<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1223-L1226)
## main
```javascript
export function main<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1230-L1234)
## map_
```javascript
export function map_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1238-L1242)
## mark
```javascript
export function mark<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1246-L1250)
## menu
```javascript
export function menu<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1254-L1258)
## menuitem
```javascript
export function menuitem<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1262-L1266)
## meta
```javascript
export function meta<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1270-L1273)
## meter
```javascript
export function meter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1277-L1281)
## nav
```javascript
export function nav<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1285-L1289)
## noscript
```javascript
export function noscript<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1293-L1297)
## object
```javascript
export function object<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1301-L1305)
## ol
```javascript
export function ol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1309-L1313)
## optgroup
```javascript
export function optgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1317-L1321)
## option
```javascript
export function option<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1325-L1329)
## output
```javascript
export function output<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1333-L1337)
## p
```javascript
export function p<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1341-L1345)
## param
```javascript
export function param<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1349-L1352)
## pre
```javascript
export function pre<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1356-L1360)
## progress
```javascript
export function progress<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1364-L1368)
## q
```javascript
export function q<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1372-L1376)
## rb
```javascript
export function rb<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1380-L1384)
## rp
```javascript
export function rp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1388-L1392)
## rt
```javascript
export function rt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1396-L1400)
## rtc
```javascript
export function rtc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1404-L1408)
## ruby
```javascript
export function ruby<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1412-L1416)
## s
```javascript
export function s<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1420-L1424)
## samp
```javascript
export function samp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1428-L1432)
## script
```javascript
export function script<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1436-L1440)
## section
```javascript
export function section<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1444-L1448)
## select
```javascript
export function select<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1452-L1456)
## small
```javascript
export function small<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1460-L1464)
## source
```javascript
export function source<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1468-L1471)
## span
```javascript
export function span<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1475-L1479)
## strong
```javascript
export function strong<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1483-L1487)
## style
```javascript
export function style<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1491-L1495)
## sub
```javascript
export function sub<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1499-L1503)
## summary
```javascript
export function summary<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1507-L1511)
## sup
```javascript
export function sup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1515-L1519)
## table
```javascript
export function table<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1523-L1527)
## tbody
```javascript
export function tbody<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1531-L1535)
## td
```javascript
export function td<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1539-L1543)
## template
```javascript
export function template<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1547-L1551)
## textarea
```javascript
export function textarea<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1555-L1559)
## tfoot
```javascript
export function tfoot<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1563-L1567)
## th
```javascript
export function th<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1571-L1575)
## thead
```javascript
export function thead<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1579-L1583)
## time
```javascript
export function time<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1587-L1591)
## title
```javascript
export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1595-L1599)
## tr
```javascript
export function tr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1603-L1607)
## track
```javascript
export function track<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1611-L1614)
## u
```javascript
export function u<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1618-L1622)
## ul
```javascript
export function ul<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1626-L1630)
## var_
```javascript
export function var_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1634-L1638)
## video
```javascript
export function video<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1642-L1646)
## wbr
```javascript
export function wbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1650-L1653)