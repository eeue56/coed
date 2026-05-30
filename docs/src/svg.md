## type SvgTag

```javascript
export type SvgTag =
    | "svg"
    | "g"
    | "a"
    | "defs"
    | "symbol"
    | "marker"
    | "mask"
    | "pattern"
    | "clipPath"
    | "foreignObject"
    | "switch"
    | "circle"
    | "ellipse"
    | "line"
    | "path"
    | "polygon"
    | "polyline"
    | "rect"
    | "image"
    | "text"
    | "tspan"
    | "textPath"
    | "use"
    | "linearGradient"
    | "radialGradient"
    | "stop"
    | "filter"
    | "feBlend"
    | "feColorMatrix"
    | "feComponentTransfer"
    | "feComposite"
    | "feConvolveMatrix"
    | "feDiffuseLighting"
    | "feDisplacementMap"
    | "feDropShadow";

```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L11-L47)

## svg

```javascript
export function svg<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L48-L52)

## g

```javascript
export function g<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L62-L66)

## a

```javascript
export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L76-L80)

## defs

```javascript
export function defs<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L90-L94)

## symbol

```javascript
export function symbol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L104-L108)

## marker

```javascript
export function marker<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L118-L122)

## mask

```javascript
export function mask<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L132-L136)

## pattern

```javascript
export function pattern<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L146-L150)

## clipPath

```javascript
export function clipPath<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L160-L164)

## foreignObject

```javascript
export function foreignObject<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L174-L178)

## svgSwitch

```javascript
export function svgSwitch<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L188-L192)

## circle

```javascript
export function circle<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L202-L205)

## ellipse

```javascript
export function ellipse<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L214-L217)

## line

```javascript
export function line<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L226-L229)

## path

```javascript
export function path<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L238-L241)

## polygon

```javascript
export function polygon<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L250-L253)

## polyline

```javascript
export function polyline<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L262-L265)

## rect

```javascript
export function rect<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L274-L277)

## image

```javascript
export function image<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L286-L289)

## text

```javascript
export function text<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L298-L301)

## tspan

```javascript
export function tspan<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L310-L313)

## textPath

```javascript
export function textPath<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L322-L325)

## use

```javascript
export function use<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L334-L337)

## linearGradient

```javascript
export function linearGradient<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L346-L349)

## radialGradient

```javascript
export function radialGradient<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L358-L361)

## stop

```javascript
export function stop<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L370-L373)

## filter

```javascript
export function filter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L382-L385)

## feBlend

```javascript
export function feBlend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L394-L397)

## feColorMatrix

```javascript
export function feColorMatrix<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L406-L409)

## feComponentTransfer

```javascript
export function feComponentTransfer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L418-L421)

## feComposite

```javascript
export function feComposite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L430-L433)

## feConvolveMatrix

```javascript
export function feConvolveMatrix<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L442-L445)

## feDiffuseLighting

```javascript
export function feDiffuseLighting<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L454-L457)

## feDisplacementMap

```javascript
export function feDisplacementMap<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L466-L469)

## feDropShadow

```javascript
export function feDropShadow<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L478-L481)

## feFlood

```javascript
export function feFlood<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L490-L493)

## feGaussianBlur

```javascript
export function feGaussianBlur<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L502-L505)

## feImage

```javascript
export function feImage<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L514-L517)

## feMerge

```javascript
export function feMerge<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L526-L529)

## feMorphology

```javascript
export function feMorphology<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L538-L541)

## feOffset

```javascript
export function feOffset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L550-L553)

## feSpecularLighting

```javascript
export function feSpecularLighting<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L562-L565)

## feTile

```javascript
export function feTile<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L574-L577)

## feTurbulence

```javascript
export function feTurbulence<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L586-L589)

## animate

```javascript
export function animate<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L598-L601)

## animateMotion

```javascript
export function animateMotion<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L610-L613)

## animateTransform

```javascript
export function animateTransform<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L622-L625)

## svgSet

```javascript
export function svgSet<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L634-L637)

## mpath

```javascript
export function mpath<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L646-L649)

## styleEl

```javascript
export function styleEl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L658-L661)

## scriptEl

```javascript
export function scriptEl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L670-L673)

## desc

```javascript
export function desc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L682-L685)

## title

```javascript
export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/svg.ts#L694-L697)
