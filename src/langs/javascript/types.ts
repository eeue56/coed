import type { Result } from "../types.ts";
import type { OperatorExpression, Token } from "./parser/types.ts";

export type NumberExpression = { kind: "NumberExpression"; value: number };

export type StringExpression = { kind: "StringExpression"; value: string };
export type StringLiteralExpression = {
    kind: "StringLiteralExpression";
    values: Expression[];
};
export type ArrayExpression = {
    kind: "ArrayExpression";
    elements: Expression[];
};
export type ObjectExpression = {
    kind: "ObjectExpression";
    properties: { [key: string]: Expression };
};
export type EqualityExpression = {
    kind: "EqualityExpression";
    left: Expression;
    right: Expression;
};
export type InequalityExpression = {
    kind: "InequalityExpression";
    left: Expression;
    right: Expression;
};

export type LessThanExpression = {
    kind: "LessThanExpression";
    left: Expression;
    right: Expression;
};

export type MoreThanExpression = {
    kind: "MoreThanExpression";
    left: Expression;
    right: Expression;
};

export type LessThanOrEqualExpression = {
    kind: "LessThanOrEqualExpression";
    left: Expression;
    right: Expression;
};

export type MoreThanOrEqualExpression = {
    kind: "MoreThanOrEqualExpression";
    left: Expression;
    right: Expression;
};

export type IncrementExpression = {
    kind: "IncrementExpression";
    variable: string;
};

export type DecrementExpression = {
    kind: "DecrementExpression";
    variable: string;
};

export type IncreaseExpression = {
    kind: "IncreaseExpression";
    variable: string;
    amount: Expression;
};

export type DecreaseExpression = {
    kind: "DecreaseExpression";
    variable: string;
    amount: Expression;
};

export type NegationExpression = {
    kind: "NegationExpression";
    value: Expression;
};

export type AssignmentTarget =
    | NameLookupExpression
    | ObjectPropertyExpression
    | ArrayAccessExpression;

export type AssignmentExpression = {
    kind: "AssignmentExpression";
    target: AssignmentTarget;
    value: Expression;
};

export type ArrowFunctionExpression = {
    kind: "ArrowFunctionExpression";
    isAsync: boolean;
    parameters: string[];
    body: Ast[] | Expression;
};

export type ThisExpression = {
    kind: "ThisExpression";
};

export type SuperExpression = {
    kind: "SuperExpression";
};

export type AwaitExpression = {
    kind: "AwaitExpression";
    value: Expression;
};

export type NewExpression = {
    kind: "NewExpression";
    callee: Expression;
    arguments: Expression[];
};

export type ImportExpression = {
    kind: "ImportExpression";
    source: Expression;
};

export type FunctionCallExpression = {
    kind: "FunctionCallExpression";
    functionName: string;
    arguments: Expression[];
};

export type NameLookupExpression = {
    kind: "NameLookupExpression";
    name: string;
};

export type ChainableExpression =
    | NameLookupExpression
    | ThisExpression
    | SuperExpression
    | NewExpression
    | FunctionCallExpression
    | ObjectPropertyExpression
    | ObjectMethodCallExpression
    | ArrayAccessExpression;

export type ObjectPropertyExpression = {
    kind: "ObjectPropertyExpression";
    object: ChainableExpression;
    property: NameLookupExpression | StringLiteralExpression;
};

export type ObjectMethodCallExpression = {
    kind: "ObjectMethodCallExpression";
    object: ChainableExpression;
    method: NameLookupExpression | StringLiteralExpression;
    arguments: Expression[];
};

export type ArrayAccessExpression = {
    kind: "ArrayAccessExpression";
    array: ChainableExpression;
    index: Expression;
};

export type AdditionExpression = {
    kind: "AdditionExpression";
    left: Expression;
    right: Expression;
};

export type SubtractionExpression = {
    kind: "SubtractionExpression";
    left: Expression;
    right: Expression;
};

export type MultiplicationExpression = {
    kind: "MultiplicationExpression";
    left: Expression;
    right: Expression;
};

export type DivisionExpression = {
    kind: "DivisionExpression";
    left: Expression;
    right: Expression;
};

export type AndExpression = {
    kind: "AndExpression";
    left: Expression;
    right: Expression;
};

export type OrExpression = {
    kind: "OrExpression";
    left: Expression;
    right: Expression;
};

export type NullExpression = { kind: "NullExpression" };
export type BooleanExpression = { kind: "BooleanExpression"; value: boolean };

export type Expression =
    | NumberExpression
    | StringExpression
    | ArrayExpression
    | ObjectExpression
    | EqualityExpression
    | InequalityExpression
    | LessThanExpression
    | MoreThanExpression
    | LessThanOrEqualExpression
    | MoreThanOrEqualExpression
    | IncrementExpression
    | DecrementExpression
    | IncreaseExpression
    | DecreaseExpression
    | NegationExpression
    | AssignmentExpression
    | ArrowFunctionExpression
    | ThisExpression
    | SuperExpression
    | AwaitExpression
    | NewExpression
    | ImportExpression
    | NullExpression
    | BooleanExpression
    | StringLiteralExpression
    | FunctionCallExpression
    | NameLookupExpression
    | ObjectPropertyExpression
    | ObjectMethodCallExpression
    | ArrayAccessExpression
    | AdditionExpression
    | SubtractionExpression
    | MultiplicationExpression
    | DivisionExpression
    | AndExpression
    | OrExpression;

export type LetStatement = {
    kind: "LetStatement";
    name: string;
    value: Expression;
};

export type LetListStatement = {
    kind: "LetListStatement";
    names: string[];
};

export type ConstStatement = {
    kind: "ConstStatement";
    name: string;
    value: Expression;
};

export type IfStatement = {
    kind: "IfStatement";
    condition: Expression;
    thenBranch: Ast[];
    elseIf?: IfStatement;
    elseBranch?: Ast[];
};

export type ForLoopBinding = {
    declarationKind: "let" | "const";
    name: string;
};

export type ClassicForLoop = {
    kind: "ClassicForLoop";
    init: LetStatement | ConstStatement;
    condition: Expression;
    increment: Expression;
    body: Ast[];
};

export type ForInOfLoop = {
    kind: "ForInOfLoop";
    init: ForLoopBinding;
    operator: "in" | "of";
    iterable: Expression;
    body: Ast[];
};

export type ForLoop = ClassicForLoop | ForInOfLoop;

export type DoWhileLoop = {
    kind: "DoWhileLoop";
    condition: Expression;
    body: Ast[];
};

export type FunctionDeclaration = {
    kind: "FunctionDeclaration";
    isAsync: boolean;
    name: string;
    parameters: string[];
    body: Ast[];
};

export type ClassDeclaration = {
    kind: "ClassDeclaration";
    name: string;
    superClass: Expression | null;
    body: Ast[];
};

export type ReturnStatement = {
    kind: "ReturnStatement";
    value: Expression | null;
};

export type ContinueStatement = {
    kind: "ContinueStatement";
};

export type BreakStatement = {
    kind: "BreakStatement";
};

export type ThrowStatement = {
    kind: "ThrowStatement";
    value: Expression;
};

export type TryCatchStatement = {
    kind: "TryCatchStatement";
    catchParameter: string;
    tryBlock: Ast[];
    catchBlock: Ast[];
};

export type ImportStatement = {
    kind: "ImportStatement";
    defaultImport: string | null;
    namedImports: string[];
    source: string;
};

export type ExportDeclarationStatement = {
    kind: "ExportDeclarationStatement";
    declaration:
        | LetStatement
        | LetListStatement
        | ConstStatement
        | FunctionDeclaration
        | ClassDeclaration;
};

export type ExportNamedStatement = {
    kind: "ExportNamedStatement";
    names: string[];
};

export type ExportDefaultStatement = {
    kind: "ExportDefaultStatement";
    value: Expression | FunctionDeclaration;
};

/**
 * e.g
 *
 * ```
 * main();
 * ```
 */
export type LineTerminatedExpression = {
    kind: "LineTerminatedExpression";
    expressions: Expression[];
};

export type Ast =
    | LetStatement
    | LetListStatement
    | IfStatement
    | ForLoop
    | DoWhileLoop
    | FunctionDeclaration
    | ClassDeclaration
    | ConstStatement
    | ReturnStatement
    | ContinueStatement
    | BreakStatement
    | ThrowStatement
    | TryCatchStatement
    | ImportStatement
    | ExportDeclarationStatement
    | ExportNamedStatement
    | ExportDefaultStatement
    | LineTerminatedExpression;

export type ParserState = {
    tokens: Token[];
    index: number;
    insideFunction: boolean;
    insideForLoop: boolean;
};

export type SourceLocation = {
    line: number;
    column: number;
    lineText: string;
};

export type DetailedParseError = {
    problem: string;
    hint: string;
    suggestion: string | null;
    focusToken: Token | null;
};

export type ParseExpressionFunction = (
    state: ParserState,
) => IndexedResult<Expression>;

export type OperatorRule = {
    tokenKind:
        | "EqualityToken"
        | "InequalityToken"
        | "LessThanToken"
        | "MoreThanToken"
        | "LessThanOrEqualToken"
        | "MoreThanOrEqualToken"
        | "AdditionToken"
        | "SubtractionToken"
        | "MultiplicationToken"
        | "DivisionToken"
        | "AndToken"
        | "OrToken";
    build: (left: Expression, right: Expression) => OperatorExpression;
};

export type TokenKinds = Token["kind"];

export function isExpression(node: unknown): node is Expression {
    if (
        !node ||
        typeof node !== "object" ||
        typeof (node as JsNode).kind === "undefined"
    ) {
        return false;
    }

    const kind = (node as JsNode).kind;

    switch (kind as Expression["kind"]) {
        case "NumberExpression":
        case "StringExpression":
        case "ArrayExpression":
        case "ObjectExpression":
        case "EqualityExpression":
        case "InequalityExpression":
        case "LessThanExpression":
        case "MoreThanExpression":
        case "LessThanOrEqualExpression":
        case "MoreThanOrEqualExpression":
        case "IncrementExpression":
        case "DecrementExpression":
        case "IncreaseExpression":
        case "DecreaseExpression":
        case "NegationExpression":
        case "AssignmentExpression":
        case "ArrowFunctionExpression":
        case "ThisExpression":
        case "SuperExpression":
        case "AwaitExpression":
        case "NewExpression":
        case "ImportExpression":
        case "NullExpression":
        case "BooleanExpression":
        case "StringLiteralExpression":
        case "FunctionCallExpression":
        case "NameLookupExpression":
        case "ObjectPropertyExpression":
        case "ObjectMethodCallExpression":
        case "ArrayAccessExpression":
        case "AdditionExpression":
        case "SubtractionExpression":
        case "MultiplicationExpression":
        case "DivisionExpression":
        case "AndExpression":
        case "OrExpression":
            return true;
    }

    return false;
}

export function isAst(node: unknown): node is Ast {
    if (
        !node ||
        typeof node !== "object" ||
        typeof (node as JsNode).kind === "undefined"
    ) {
        return false;
    }
    const kind = (node as JsNode).kind;

    switch (kind as Ast["kind"]) {
        case "LetStatement":
        case "LetListStatement":
        case "ConstStatement":
        case "IfStatement":
        case "ClassicForLoop":
        case "ForInOfLoop":
        case "DoWhileLoop":
        case "FunctionDeclaration":
        case "ClassDeclaration":
        case "ReturnStatement":
        case "ContinueStatement":
        case "BreakStatement":
        case "ThrowStatement":
        case "TryCatchStatement":
        case "ImportStatement":
        case "ExportDeclarationStatement":
        case "ExportNamedStatement":
        case "ExportDefaultStatement":
        case "LineTerminatedExpression":
            return true;
        default:
            return false;
    }
}

export function isDeclaration(
    node: JsNode,
): node is
    | FunctionDeclaration
    | LetStatement
    | LetListStatement
    | ConstStatement
    | ClassDeclaration {
    const kind = node.kind;
    return (
        kind === "FunctionDeclaration" ||
        kind === "LetStatement" ||
        kind === "LetListStatement" ||
        kind === "ConstStatement" ||
        kind === "ClassDeclaration"
    );
}

export function isJsNode(node: unknown): node is JsNode {
    return isAst(node) || isExpression(node);
}

export type JsNode = Ast | Expression;

export type Program = JsNode[];

export type IndexedResult<a> = Result<a> & { index: number };
