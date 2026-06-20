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
      }
    | {
          kind: "Never";
      };

export type ExtractedTagsAndClasses = {
    tags: string[];
    classes: string[];
};
