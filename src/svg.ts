import {
    type Attribute,
    type Event,
    type HtmlNode,
    nodeNS,
    type Tag,
    voidNodeNS,
} from "./coed.ts";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

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

export function svg<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "svg" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function g<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "g" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "a" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function defs<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "defs" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function symbol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "symbol" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function marker<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "marker" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function mask<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "mask" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function pattern<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "pattern" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function clipPath<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "clipPath" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function foreignObject<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "foreignObject" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function svgSwitch<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "switch" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
        children,
    );
}

export function circle<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "circle" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function ellipse<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "ellipse" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function line<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "line" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function path<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "path" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function polygon<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "polygon" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function polyline<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "polyline" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function rect<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "rect" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function image<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "image" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function text<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "text" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function tspan<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "tspan" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function textPath<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "textPath" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function use<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "use" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function linearGradient<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "linearGradient" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function radialGradient<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "radialGradient" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function stop<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "stop" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function filter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "filter" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feBlend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feBlend" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feColorMatrix<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feColorMatrix" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feComponentTransfer<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feComponentTransfer" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feComposite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feComposite" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feConvolveMatrix<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feConvolveMatrix" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feDiffuseLighting<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feDiffuseLighting" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feDisplacementMap<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feDisplacementMap" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feDropShadow<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feDropShadow" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feFlood<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feFlood" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feGaussianBlur<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feGaussianBlur" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feImage<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feImage" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feMerge<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feMerge" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feMorphology<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feMorphology" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feOffset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feOffset" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feSpecularLighting<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feSpecularLighting" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feTile<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feTile" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feTurbulence<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feTurbulence" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function animate<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "animate" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function animateMotion<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "animateMotion" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function animateTransform<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "animateTransform" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function svgSet<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "set" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function mpath<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "mpath" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function styleEl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "style" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function scriptEl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "script" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function desc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "desc" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "title" as SvgTag as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}
