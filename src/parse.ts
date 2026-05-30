import * as jsdom from "jsdom";
import {
    booleanAttribute,
    node,
    nodeNS,
    style_,
    text,
    voidNode,
    voidNodeNS,
    type Attribute,
    type AttributeKind,
    type HtmlNode,
    type HtmlNodeKind,
    type Tag,
} from "./coed.ts";
import { type SvgTag } from "./svg.ts";

export function parseFragment(string: string): HtmlNode<never>[] {
    const parser = new jsdom.JSDOM();
    const parsed = parser.window.document;
    parsed.body.innerHTML = string;
    return [...parsed.body.childNodes].flatMap((child) => walk(child)).flat();
}

export function parse(string: string): HtmlNode<never> {
    const parser = new jsdom.JSDOM(string, { contentType: "text/html" });

    return walk(parser.window.document.documentElement)[0] as HtmlNode<never>;
}

function namespaceNodeKind(tagName: string, namespace: string): HtmlNodeKind {
    if (namespace !== "http://www.w3.org/2000/svg") return "regular";

    switch (tagName as SvgTag) {
        case "svg":
        case "symbol":
        case "stop":
        case "g":
        case "a":
        case "defs":
        case "marker":
        case "mask":
        case "pattern":
        case "clipPath":
        case "foreignObject":
        case "switch":
            return "ns-regular";
        case "text":
        case "circle":
        case "ellipse":
        case "line":
        case "path":
        case "polygon":
        case "polyline":
        case "rect":
        case "image":
        case "tspan":
        case "textPath":
        case "use":
        case "linearGradient":
        case "radialGradient":
        case "filter":
        case "feBlend":
        case "feColorMatrix":
        case "feComponentTransfer":
        case "feComposite":
        case "feConvolveMatrix":
        case "feDiffuseLighting":
        case "feDisplacementMap":
        case "feDropShadow":
            return "ns-void";
    }
}

function nodeKind(tagName: string, namespace: string): HtmlNodeKind {
    if (namespace.endsWith("svg")) {
        return namespaceNodeKind(tagName, namespace);
    }

    switch (tagName as Tag) {
        case "a":
        case "abbr":
        case "address":
        case "article":
        case "aside":
        case "audio":
        case "b":
        case "bdi":
        case "bdo":
        case "blockquote":
        case "body":
        case "button":
        case "canvas":
        case "caption":
        case "cite":
        case "code":
        case "colgroup":
        case "data":
        case "datalist":
        case "dd":
        case "del":
        case "details":
        case "dfn":
        case "dialog":
        case "div":
        case "dl":
        case "dt":
        case "em":
        case "fieldset":
        case "figure":
        case "footer":
        case "form":
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
        case "head":
        case "header":
        case "hgroup":
        case "html":
        case "i":
        case "iframe":
        case "ins":
        case "kbd":
        case "keygen":
        case "label":
        case "legend":
        case "li":
        case "main":
        case "map":
        case "mark":
        case "menu":
        case "menuitem":
        case "meter":
        case "nav":
        case "noscript":
        case "object":
        case "ol":
        case "optgroup":
        case "option":
        case "output":
        case "p":
        case "pre":
        case "progress":
        case "q":
        case "rb":
        case "rp":
        case "rt":
        case "rtc":
        case "ruby":
        case "s":
        case "samp":
        case "script":
        case "section":
        case "select":
        case "small":
        case "span":
        case "strong":
        case "style":
        case "sub":
        case "summary":
        case "sup":
        case "table":
        case "tbody":
        case "td":
        case "template":
        case "textarea":
        case "tfoot":
        case "th":
        case "thead":
        case "time":
        case "title":
        case "tr":
        case "u":
        case "ul":
        case "var":
        case "video":
            return "regular";
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "img":
        case "input":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
            return "void";
        default:
            return "regular";
    }
}

function isBooleanAttribute(name: string): boolean {
    switch (name) {
        case "disabled":
        case "checked":
        case "readonly":
        case "required":
        case "autofocus":
        case "novalidate":
        case "formnovalidate":
        case "hidden":
        case "selected":
            return true;
        default:
            return false;
    }
}

function attributeKind(name: string): AttributeKind {
    if (isBooleanAttribute(name)) {
        return "boolean";
    }

    switch (name) {
        case "class":
            return "string";
        case "style":
            return "style";
        default:
            return "string";
    }
}

function walk(childNode: ChildNode): HtmlNode<never>[] {
    if (childNode.nodeType === childNode.TEXT_NODE) {
        return [
            text(childNode.textContent || ""),
        ] as unknown as HtmlNode<never>[];
    }

    if (childNode.nodeType !== childNode.ELEMENT_NODE) {
        return [];
    }

    const element = childNode as Element;
    const namespace = element.namespaceURI;

    const children: HtmlNode<never>[] = [];
    for (const child of element.childNodes) {
        children.push(...walk(child));
    }

    const attributes: Attribute[] = [];
    for (const attribute of element.attributes) {
        const kind: AttributeKind = attributeKind(attribute.name);

        attribute.value = attribute.value.trim();

        switch (kind) {
            case "string":
                attributes.push({
                    kind: "string",
                    key: attribute.name,
                    value: attribute.value,
                });
                break;
            case "style":
                const [styleKey, styleValue] = attribute.value
                    .split(":")
                    .map((s) => s.trim());
                attributes.push(
                    style_(styleKey, styleValue.replaceAll(";", "")),
                );
                break;
            case "boolean":
                attributes.push(booleanAttribute(attribute.name, true));
                break;
        }
    }

    const tagName = element.tagName.toLowerCase();
    const kind = nodeKind(tagName, namespace || "");

    switch (kind) {
        case "text":
            return [
                text(element.textContent || ""),
            ] as unknown as HtmlNode<never>[];
        case "regular":
            return [node(tagName as Tag, [], attributes, children)];
        case "void":
            return [voidNode(tagName as Tag, [], attributes)];
        case "html-string":
            return [
                {
                    kind: "html-string",
                    content: element.outerHTML,
                },
            ] as unknown as HtmlNode<never>[];
        case "ns-regular":
            return [
                nodeNS(tagName as Tag, namespace!, [], attributes, children),
            ];
        case "ns-void":
            return [voidNodeNS(tagName as Tag, namespace!, [], attributes)];
    }
}
