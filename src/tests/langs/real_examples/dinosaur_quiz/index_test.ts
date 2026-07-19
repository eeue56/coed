/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { deepStrictEqual } from "assert";
import * as fs from "fs";
import { join } from "path";
import type { HtmlNode } from "../../../../coed.ts";
import * as coed from "../../../../coed.ts";
import { css } from "../../../../langs/css/index.ts";
import { html } from "../../../../langs/html/index.ts";
import { javascript } from "../../../../langs/javascript/index.ts";
import type { JsNode, Program } from "../../../../langs/javascript/types.ts";
import type { Result } from "../../../../langs/types.ts";

const rootPath = "src/tests/langs/real_examples/dinosaur_quiz";

const htmlString = fs.readFileSync(
    join(process.cwd(), rootPath, "web/index.html"),
    "utf-8",
);
const cssString = fs.readFileSync(
    join(process.cwd(), rootPath, "web/style.css"),
    "utf-8",
);
const jsString = fs.readFileSync(
    join(process.cwd(), rootPath, "web/script.js"),
    "utf-8",
);

export function testParseHtml() {
    const parsedHtml = html.parse(htmlString);

    deepStrictEqual(parsedHtml.kind, "Ok");

    deepStrictEqual(
        parsedHtml.value,
        coed.html(
            [],
            [],
            [
                coed.head([], [], []),
                coed.body(
                    [],
                    [],
                    [
                        coed.h1([], [], [coed.text("Dinosaur Quiz")]),
                        coed.text("\n"),
                        coed.div([], [coed.attribute("id", "quiz")], []),
                        coed.text("\n"),
                        coed.button(
                            [],
                            [coed.attribute("onclick", "check()")],
                            [coed.text("Submit")],
                        ),
                        coed.text("\n"),
                        coed.p([], [coed.attribute("id", "result")], []),
                        coed.text("\n\n"),
                        coed.link(
                            [],
                            [
                                coed.attribute("rel", "stylesheet"),
                                coed.attribute("href", "style.css"),
                            ],
                        ),
                        coed.text("\n"),
                        coed.script(
                            [],
                            [coed.attribute("src", "script.js")],
                            [],
                        ),
                        coed.text("\n"),
                    ],
                ),
            ],
        ),
    );

    deepStrictEqual(
        html.filter(
            [
                {
                    shouldKeep: (node: HtmlNode<unknown>) => {
                        if (
                            node.kind === "text" &&
                            (node.text === "\n" || node.text === "\n\n")
                        ) {
                            return false;
                        }
                        return true;
                    },
                    reason: "Remove pointless newlines",
                },
            ],
            parsedHtml.value,
        ).value,
        coed.html(
            [],
            [],
            [
                coed.head([], [], []),
                coed.body(
                    [],
                    [],
                    [
                        coed.h1([], [], [coed.text("Dinosaur Quiz")]),
                        coed.text(""),
                        coed.div([], [coed.attribute("id", "quiz")], []),
                        coed.text(""),
                        coed.button(
                            [],
                            [coed.attribute("onclick", "check()")],
                            [coed.text("Submit")],
                        ),
                        coed.text(""),
                        coed.p([], [coed.attribute("id", "result")], []),
                        coed.text(""),
                        coed.link(
                            [],
                            [
                                coed.attribute("rel", "stylesheet"),
                                coed.attribute("href", "style.css"),
                            ],
                        ),
                        coed.text(""),
                        coed.script(
                            [],
                            [coed.attribute("src", "script.js")],
                            [],
                        ),
                        coed.text(""),
                    ],
                ),
            ],
        ),
    );

    deepStrictEqual(
        html.generate(parsedHtml.value),
        `<html><head></head><body>${htmlString}</body></html>`.replace(
            `<link rel="stylesheet" href="style.css" />`,
            `<link rel="stylesheet" href="style.css">`,
        ),
    );
}

export function testParseCss() {
    const parsedCss = css.parse(cssString);

    deepStrictEqual(parsedCss.kind, "Ok");

    deepStrictEqual(parsedCss.value, [
        {
            kind: "Regular",
            selector: {
                kind: "Tag",
                tag: "body",
            },
            body: [
                {
                    kind: "Property",
                    name: "font",
                    value: "16px Arial",
                },
                {
                    kind: "Property",
                    name: "max-width",
                    value: "500px",
                },
                {
                    kind: "Property",
                    name: "margin",
                    value: "40px auto",
                },
            ],
        },
        {
            kind: "Regular",
            selector: {
                kind: "Tag",
                tag: "label",
            },
            body: [
                {
                    kind: "Property",
                    name: "display",
                    value: "block",
                },
                {
                    kind: "Property",
                    name: "margin",
                    value: "8px",
                },
            ],
        },
    ]);

    deepStrictEqual(css.generate(parsedCss.value), cssString.trim());
}

export function testParseJs() {
    const parsedJs = javascript.parse(jsString);

    deepStrictEqual(parsedJs, {
        kind: "Ok",
        value: [
            {
                kind: "ConstStatement",
                name: "questions",
                value: {
                    kind: "ArrayExpression",
                    elements: [
                        {
                            kind: "ObjectExpression",
                            properties: {
                                q: {
                                    kind: "StringExpression",
                                    value: "Which dinosaur was a herbivore?",
                                },
                                options: {
                                    kind: "ArrayExpression",
                                    elements: [
                                        {
                                            kind: "StringExpression",
                                            value: "T. rex",
                                        },
                                        {
                                            kind: "StringExpression",
                                            value: "Triceratops",
                                        },
                                        {
                                            kind: "StringExpression",
                                            value: "Velociraptor",
                                        },
                                    ],
                                },
                                answer: {
                                    kind: "StringExpression",
                                    value: "Triceratops",
                                },
                            },
                        },
                        {
                            kind: "ObjectExpression",
                            properties: {
                                q: {
                                    kind: "StringExpression",
                                    value: "Which dinosaur had a long neck?",
                                },
                                options: {
                                    kind: "ArrayExpression",
                                    elements: [
                                        {
                                            kind: "StringExpression",
                                            value: "Brachiosaurus",
                                        },
                                        {
                                            kind: "StringExpression",
                                            value: "Stegosaurus",
                                        },
                                        {
                                            kind: "StringExpression",
                                            value: "Spinosaurus",
                                        },
                                    ],
                                },
                                answer: {
                                    kind: "StringExpression",
                                    value: "Brachiosaurus",
                                },
                            },
                        },
                    ],
                },
            },
            {
                kind: "AssignmentExpression",
                target: {
                    kind: "ObjectPropertyExpression",
                    object: {
                        kind: "NameLookupExpression",
                        name: "quiz",
                    },
                    property: {
                        kind: "NameLookupExpression",
                        name: "innerHTML",
                    },
                },
                value: {
                    kind: "ObjectMethodCallExpression",
                    object: {
                        kind: "ObjectMethodCallExpression",
                        object: {
                            kind: "NameLookupExpression",
                            name: "questions",
                        },
                        method: {
                            kind: "NameLookupExpression",
                            name: "map",
                        },
                        arguments: [
                            {
                                kind: "ArrowFunctionExpression",
                                parameters: ["x", "i"],
                                body: {
                                    kind: "StringLiteralExpression",
                                    values: [
                                        {
                                            kind: "StringExpression",
                                            value: '\n  <p>${x.q}</p>\n  ${x.options\n      .map(\n          (o) => `\n    <label><input type="radio" name="q${i}" value="${o}"> ${o}</label>\n  `,\n      )\n      .join("")}\n',
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    method: {
                        kind: "NameLookupExpression",
                        name: "join",
                    },
                    arguments: [
                        {
                            kind: "StringExpression",
                            value: "",
                        },
                    ],
                },
            },
            {
                kind: "FunctionDeclaration",
                name: "check",
                parameters: [],
                body: [
                    {
                        kind: "LetStatement",
                        name: "score",
                        value: {
                            kind: "NumberExpression",
                            value: 0,
                        },
                    },
                    {
                        kind: "LineTerminatedExpression",
                        expressions: [
                            {
                                kind: "ObjectMethodCallExpression",
                                object: {
                                    kind: "NameLookupExpression",
                                    name: "questions",
                                },
                                method: {
                                    kind: "NameLookupExpression",
                                    name: "forEach",
                                },
                                arguments: [
                                    {
                                        kind: "ArrowFunctionExpression",
                                        parameters: ["x", "i"],
                                        body: [
                                            {
                                                kind: "ConstStatement",
                                                name: "selected",
                                                value: {
                                                    kind: "ObjectMethodCallExpression",
                                                    object: {
                                                        kind: "NameLookupExpression",
                                                        name: "document",
                                                    },
                                                    method: {
                                                        kind: "NameLookupExpression",
                                                        name: "querySelector",
                                                    },
                                                    arguments: [
                                                        {
                                                            kind: "StringLiteralExpression",
                                                            values: [
                                                                {
                                                                    kind: "StringExpression",
                                                                    value: 'input[name="q${i}"]:checked',
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: "IfStatement",
                                                condition: {
                                                    kind: "EqualityExpression",
                                                    left: {
                                                        kind: "ObjectPropertyExpression",
                                                        object: {
                                                            kind: "NameLookupExpression",
                                                            name: "selected",
                                                        },
                                                        property: {
                                                            kind: "NameLookupExpression",
                                                            name: "value",
                                                        },
                                                    },
                                                    right: {
                                                        kind: "ObjectPropertyExpression",
                                                        object: {
                                                            kind: "NameLookupExpression",
                                                            name: "x",
                                                        },
                                                        property: {
                                                            kind: "NameLookupExpression",
                                                            name: "answer",
                                                        },
                                                    },
                                                },
                                                thenBranch: [
                                                    {
                                                        kind: "LineTerminatedExpression",
                                                        expressions: [
                                                            {
                                                                kind: "IncrementExpression",
                                                                variable:
                                                                    "score",
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        kind: "LineTerminatedExpression",
                        expressions: [
                            {
                                kind: "AssignmentExpression",
                                target: {
                                    kind: "ObjectPropertyExpression",
                                    object: {
                                        kind: "NameLookupExpression",
                                        name: "result",
                                    },
                                    property: {
                                        kind: "NameLookupExpression",
                                        name: "textContent",
                                    },
                                },
                                value: {
                                    kind: "StringLiteralExpression",
                                    values: [
                                        {
                                            kind: "StringExpression",
                                            value: "${score} / ${questions.length} correct",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    } as Result<Program>);

    deepStrictEqual(parsedJs.kind, "Ok");

    deepStrictEqual(
        javascript.filter(
            [
                {
                    shouldKeep: (node: JsNode) => {
                        if (node.kind === "NameLookupExpression") {
                            if (node.name.length === 1) {
                                return false;
                            }
                        }

                        if (node.kind === "ObjectPropertyExpression") {
                            if (
                                node.property.kind === "NameLookupExpression" &&
                                node.property.name.length === 1
                            ) {
                                return false;
                            }
                        }

                        if (node.kind === "ObjectExpression") {
                            if (
                                Object.keys(node.properties).some(
                                    (key) => key.length === 1,
                                )
                            ) {
                                return false;
                            }
                        }

                        if (node.kind === "ArrowFunctionExpression") {
                            if (
                                node.parameters.some(
                                    (param) => param.length === 1,
                                )
                            ) {
                                return false;
                            }
                        }

                        return true;
                    },
                    reason: "No one letter variable or property names unless it is an index",
                },
            ],
            parsedJs.value,
        ),
        {
            errors: [
                "No one letter variable or property names unless it is an index",
                "No one letter variable or property names unless it is an index",
                "No one letter variable or property names unless it is an index",
                "No one letter variable or property names unless it is an index",
            ],
            value: [
                {
                    kind: "ConstStatement",
                    name: "questions",
                    value: {
                        kind: "ArrayExpression",
                        elements: [],
                    },
                },
                {
                    kind: "FunctionDeclaration",
                    name: "check",
                    parameters: [],
                    body: [
                        {
                            kind: "LetStatement",
                            name: "score",
                            value: {
                                kind: "NumberExpression",
                                value: 0,
                            },
                        },
                        {
                            kind: "LineTerminatedExpression",
                            expressions: [],
                        },
                        {
                            kind: "LineTerminatedExpression",
                            expressions: [
                                {
                                    kind: "AssignmentExpression",
                                    target: {
                                        kind: "ObjectPropertyExpression",
                                        object: {
                                            kind: "NameLookupExpression",
                                            name: "result",
                                        },
                                        property: {
                                            kind: "NameLookupExpression",
                                            name: "textContent",
                                        },
                                    },
                                    value: {
                                        kind: "StringLiteralExpression",
                                        values: [
                                            {
                                                kind: "StringExpression",
                                                value: "${score} / ${questions.length} correct",
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            ] as Program,
        },
    );

    deepStrictEqual(
        javascript.generate(parsedJs.value),
        `const questions = [{ "q": "Which dinosaur was a herbivore?", "options": ["T. rex", "Triceratops", "Velociraptor"], "answer": "Triceratops" }, { "q": "Which dinosaur had a long neck?", "options": ["Brachiosaurus", "Stegosaurus", "Spinosaurus"], "answer": "Brachiosaurus" }];

quiz.innerHTML = questions.map((x, i) => \`
  <p>\${x.q}</p>
  \${x.options
      .map(
          (o) => \`
    <label><input type="radio" name="q\${i}" value="\${o}"> \${o}</label>
  \`,
      )
      .join("")}
\`).join("")

function check() {
    let score = 0;
    questions.forEach((x, i) => {
        const selected = document.querySelector(\`input[name="q\${i}"]:checked\`);
        if (selected.value === x.answer) {
            score++;
        }
    });
    result.textContent = \`\${score} / \${questions.length} correct\`;
}`,
    );
}
