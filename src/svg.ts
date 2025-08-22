import { Attribute, Event, HtmlNode, nodeNS, Tag, voidNodeNS } from "./coed";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export function svg<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS("svg" as Tag, SVG_NAMESPACE, events, attributes, children);
}

export function g<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS("g" as Tag, SVG_NAMESPACE, events, attributes, children);
}

export function a<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS("a" as Tag, SVG_NAMESPACE, events, attributes, children);
}

export function defs<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS("defs" as Tag, SVG_NAMESPACE, events, attributes, children);
}

export function symbol<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS("symbol" as Tag, SVG_NAMESPACE, events, attributes, children);
}

export function marker<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS("marker" as Tag, SVG_NAMESPACE, events, attributes, children);
}

export function mask<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS("mask" as Tag, SVG_NAMESPACE, events, attributes, children);
}

export function pattern<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
    children: HtmlNode<Msg>[],
): HtmlNode<Msg> {
    return nodeNS(
        "pattern" as Tag,
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
        "clipPath" as Tag,
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
        "foreignObject" as Tag,
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
    return nodeNS("switch" as Tag, SVG_NAMESPACE, events, attributes, children);
}

export function circle<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("circle" as Tag, SVG_NAMESPACE, events, attributes);
}

export function ellipse<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("ellipse" as Tag, SVG_NAMESPACE, events, attributes);
}

export function line<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("line" as Tag, SVG_NAMESPACE, events, attributes);
}

export function path<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("path" as Tag, SVG_NAMESPACE, events, attributes);
}

export function polygon<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("polygon" as Tag, SVG_NAMESPACE, events, attributes);
}

export function polyline<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("polyline" as Tag, SVG_NAMESPACE, events, attributes);
}

export function rect<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("rect" as Tag, SVG_NAMESPACE, events, attributes);
}

export function image<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("image" as Tag, SVG_NAMESPACE, events, attributes);
}

export function text<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("text" as Tag, SVG_NAMESPACE, events, attributes);
}

export function tspan<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("tspan" as Tag, SVG_NAMESPACE, events, attributes);
}

export function textPath<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("textPath" as Tag, SVG_NAMESPACE, events, attributes);
}

export function use<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("use" as Tag, SVG_NAMESPACE, events, attributes);
}

export function linearGradient<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "linearGradient" as Tag,
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
        "radialGradient" as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function stop<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("stop" as Tag, SVG_NAMESPACE, events, attributes);
}

export function filter<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("filter" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feBlend<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feBlend" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feColorMatrix<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feColorMatrix" as Tag,
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
        "feComponentTransfer" as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feComposite<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feComposite" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feConvolveMatrix<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feConvolveMatrix" as Tag,
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
        "feDiffuseLighting" as Tag,
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
        "feDisplacementMap" as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feDropShadow<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feDropShadow" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feFlood<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feFlood" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feGaussianBlur<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feGaussianBlur" as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feImage<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feImage" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feMerge<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feMerge" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feMorphology<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feMorphology" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feOffset<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feOffset" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feSpecularLighting<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "feSpecularLighting" as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function feTile<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feTile" as Tag, SVG_NAMESPACE, events, attributes);
}

export function feTurbulence<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("feTurbulence" as Tag, SVG_NAMESPACE, events, attributes);
}

export function animate<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("animate" as Tag, SVG_NAMESPACE, events, attributes);
}

export function animateMotion<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS(
        "animateMotion" as Tag,
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
        "animateTransform" as Tag,
        SVG_NAMESPACE,
        events,
        attributes,
    );
}

export function svgSet<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("set" as Tag, SVG_NAMESPACE, events, attributes);
}

export function mpath<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("mpath" as Tag, SVG_NAMESPACE, events, attributes);
}

export function styleEl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("style" as Tag, SVG_NAMESPACE, events, attributes);
}

export function scriptEl<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("script" as Tag, SVG_NAMESPACE, events, attributes);
}

export function desc<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("desc" as Tag, SVG_NAMESPACE, events, attributes);
}

export function title<Msg>(
    events: Event<Msg>[],
    attributes: Attribute[],
): HtmlNode<Msg> {
    return voidNodeNS("title" as Tag, SVG_NAMESPACE, events, attributes);
}
