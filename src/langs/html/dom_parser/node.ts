import { JSDOM } from "jsdom";

const DOMParserImpl: typeof DOMParser = new JSDOM().window.DOMParser;

export function createDOMParser(): DOMParser {
    return new DOMParserImpl();
}
