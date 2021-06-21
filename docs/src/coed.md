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
export type HtmlNode<Msg> = TextNode | RegularNode<Msg>;

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
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L265-L266)
## text
```javascript
export function text(str: string): TextNode {
```
/**
Creates a text node
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L270-L270)
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
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L280-L285)
## render
```javascript
export function render<Msg>(node: HtmlNode<Msg>): string {
```
/**
Renders a HtmlNode tree as a string.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L371-L371)
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
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L390-L393)
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
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L434-L438)
## map
```javascript
export function map<A, B>(tagger: (a: A) => B, tree: HtmlNode<A>): HtmlNode<B> {
```
/**
Converts a `HtmlNode` of type `A` to a `HtmlNode` of type `B`, including children.
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L457-L457)
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
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L641-L647)
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
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L652-L656)
## program
```javascript
export function program<Model, Msg>(
    program: Program<Model, Msg>
): RunningProgram<Model, Msg> {
```
/**
Takes in a program, sets it up and runs it as a main loop
*/
[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L660-L662)
## a
```javascript
export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L685-L689)
## abbr
```javascript
export function abbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L693-L697)
## address
```javascript
export function address<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L701-L705)
## area
```javascript
export function area<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L709-L713)
## article
```javascript
export function article<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L717-L721)
## aside
```javascript
export function aside<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L725-L729)
## audio
```javascript
export function audio<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L733-L737)
## b
```javascript
export function b<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L741-L745)
## base
```javascript
export function base<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L749-L753)
## bdi
```javascript
export function bdi<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L757-L761)
## bdo
```javascript
export function bdo<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L765-L769)
## blockquote
```javascript
export function blockquote<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L773-L777)
## body
```javascript
export function body<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L781-L785)
## br
```javascript
export function br<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L789-L793)
## button
```javascript
export function button<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L797-L801)
## canvas
```javascript
export function canvas<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L805-L809)
## caption
```javascript
export function caption<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L813-L817)
## cite
```javascript
export function cite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L821-L825)
## code
```javascript
export function code<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L829-L833)
## col
```javascript
export function col<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L837-L841)
## colgroup
```javascript
export function colgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L845-L849)
## data
```javascript
export function data<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L853-L857)
## datalist
```javascript
export function datalist<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L861-L865)
## dd
```javascript
export function dd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L869-L873)
## del
```javascript
export function del<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L877-L881)
## details
```javascript
export function details<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L885-L889)
## dfn
```javascript
export function dfn<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L893-L897)
## dialog
```javascript
export function dialog<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L901-L905)
## div
```javascript
export function div<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L909-L913)
## dl
```javascript
export function dl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L917-L921)
## dt
```javascript
export function dt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L925-L929)
## em
```javascript
export function em<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L933-L937)
## embed
```javascript
export function embed<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L941-L945)
## fieldset
```javascript
export function fieldset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L949-L953)
## figure
```javascript
export function figure<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L957-L961)
## footer
```javascript
export function footer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L965-L969)
## form
```javascript
export function form<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L973-L977)
## h1
```javascript
export function h1<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L981-L985)
## h2
```javascript
export function h2<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L989-L993)
## h3
```javascript
export function h3<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L997-L1001)
## h4
```javascript
export function h4<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1005-L1009)
## h5
```javascript
export function h5<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1013-L1017)
## h6
```javascript
export function h6<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1021-L1025)
## head
```javascript
export function head<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1029-L1033)
## header
```javascript
export function header<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1037-L1041)
## hgroup
```javascript
export function hgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1045-L1049)
## hr
```javascript
export function hr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1053-L1057)
## html
```javascript
export function html<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1061-L1065)
## i
```javascript
export function i<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1069-L1073)
## iframe
```javascript
export function iframe<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1077-L1081)
## img
```javascript
export function img<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1085-L1089)
## input
```javascript
export function input<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1093-L1097)
## ins
```javascript
export function ins<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1101-L1105)
## kbd
```javascript
export function kbd<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1109-L1113)
## keygen
```javascript
export function keygen<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1117-L1121)
## label
```javascript
export function label<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1125-L1129)
## legend
```javascript
export function legend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1133-L1137)
## li
```javascript
export function li<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1141-L1145)
## link
```javascript
export function link<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1149-L1153)
## main
```javascript
export function main<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1157-L1161)
## map_
```javascript
export function map_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1165-L1169)
## mark
```javascript
export function mark<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1173-L1177)
## menu
```javascript
export function menu<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1181-L1185)
## menuitem
```javascript
export function menuitem<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1189-L1193)
## meta
```javascript
export function meta<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1197-L1201)
## meter
```javascript
export function meter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1205-L1209)
## nav
```javascript
export function nav<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1213-L1217)
## noscript
```javascript
export function noscript<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1221-L1225)
## object
```javascript
export function object<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1229-L1233)
## ol
```javascript
export function ol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1237-L1241)
## optgroup
```javascript
export function optgroup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1245-L1249)
## option
```javascript
export function option<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1253-L1257)
## output
```javascript
export function output<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1261-L1265)
## p
```javascript
export function p<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1269-L1273)
## param
```javascript
export function param<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1277-L1281)
## pre
```javascript
export function pre<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1285-L1289)
## progress
```javascript
export function progress<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1293-L1297)
## q
```javascript
export function q<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1301-L1305)
## rb
```javascript
export function rb<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1309-L1313)
## rp
```javascript
export function rp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1317-L1321)
## rt
```javascript
export function rt<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1325-L1329)
## rtc
```javascript
export function rtc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1333-L1337)
## ruby
```javascript
export function ruby<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1341-L1345)
## s
```javascript
export function s<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1349-L1353)
## samp
```javascript
export function samp<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1357-L1361)
## script
```javascript
export function script<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1365-L1369)
## section
```javascript
export function section<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1373-L1377)
## select
```javascript
export function select<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1381-L1385)
## small
```javascript
export function small<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1389-L1393)
## source
```javascript
export function source<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1397-L1401)
## span
```javascript
export function span<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1405-L1409)
## strong
```javascript
export function strong<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1413-L1417)
## style
```javascript
export function style<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1421-L1425)
## sub
```javascript
export function sub<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1429-L1433)
## summary
```javascript
export function summary<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1437-L1441)
## sup
```javascript
export function sup<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1445-L1449)
## table
```javascript
export function table<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1453-L1457)
## tbody
```javascript
export function tbody<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1461-L1465)
## td
```javascript
export function td<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1469-L1473)
## template
```javascript
export function template<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1477-L1481)
## textarea
```javascript
export function textarea<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1485-L1489)
## tfoot
```javascript
export function tfoot<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1493-L1497)
## th
```javascript
export function th<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1501-L1505)
## thead
```javascript
export function thead<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1509-L1513)
## time
```javascript
export function time<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1517-L1521)
## title
```javascript
export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1525-L1529)
## tr
```javascript
export function tr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1533-L1537)
## track
```javascript
export function track<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1541-L1545)
## u
```javascript
export function u<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1549-L1553)
## ul
```javascript
export function ul<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1557-L1561)
## var_
```javascript
export function var_<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1565-L1569)
## video
```javascript
export function video<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1573-L1577)
## wbr
```javascript
export function wbr<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[]
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/coed.ts#L1581-L1585)