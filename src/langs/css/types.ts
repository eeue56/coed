export type Selector =
    | { kind: "Class"; class: string }
    | { kind: "Tag"; tag: string }
    | { kind: "Child"; parent: Selector; child: Selector }
    | { kind: "Sibling"; siblings: Selector[] }
    | { kind: "Psuedo"; selector: Selector; psuedo: string }
    | { kind: "PsuedoElement"; selector: Selector; element: string }
    | { kind: "Multiple"; selectors: Selector[] }
    | { kind: "Id"; id: string }
    | { kind: "All" }
    | { kind: "Media"; query: string };

export type Declaration =
    | { kind: "Property"; name: string; value: string }
    | { kind: "Nested"; selector: Selector; declarations: Declaration[] };

export type Ruleset = {
    selector: Selector;
    declarations: Declaration[];
};

export type CssBlock =
    | {
          kind: "Regular";
          selector: Exclude<Selector, { kind: "Media" }>;
          body: Declaration[];
      }
    | {
          kind: "MediaQuery";
          selector: { kind: "Media"; query: string };
          body: CssBlock[];
      };

export type ExtractedTagsAndClasses = {
    tags: string[];
    classes: string[];
};

export type CssNode = CssBlock | Declaration;

export function isCssBlock(node: CssNode): node is CssBlock {
    return (
        (node as CssBlock).kind == "Regular" ||
        (node as CssBlock).kind == "MediaQuery"
    );
}

export function isCssDeclaration(node: CssNode): node is Declaration {
    return (
        (node as Declaration).kind == "Property" ||
        (node as Declaration).kind == "Nested"
    );
}
