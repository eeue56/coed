import type { Result } from "../types.ts";
import type { OperatorExpression, Token } from "./parser/types.ts";

export type NumberExpression = { kind: "NumberExpression"; value: number };

type StringExpression = { kind: "StringExpression"; value: string };
type StringLiteralExpression = {
    kind: "StringLiteralExpression";
    values: Expression[];
};
type ArrayExpression = { kind: "ArrayExpression"; elements: Expression[] };
type ObjectExpression = {
    kind: "ObjectExpression";
    properties: { [key: string]: Expression };
};
type EqualityExpression = {
    kind: "EqualityExpression";
    left: Expression;
    right: Expression;
};
type InequalityExpression = {
    kind: "InequalityExpression";
    left: Expression;
    right: Expression;
};

type LessThanExpression = {
    kind: "LessThanExpression";
    left: Expression;
    right: Expression;
};

type MoreThanExpression = {
    kind: "MoreThanExpression";
    left: Expression;
    right: Expression;
};

type LessThanOrEqualExpression = {
    kind: "LessThanOrEqualExpression";
    left: Expression;
    right: Expression;
};

type MoreThanOrEqualExpression = {
    kind: "MoreThanOrEqualExpression";
    left: Expression;
    right: Expression;
};

type IncrementExpression = {
    kind: "IncrementExpression";
    variable: string;
};

type DecrementExpression = {
    kind: "DecrementExpression";
    variable: string;
};

type IncreaseExpression = {
    kind: "IncreaseExpression";
    variable: string;
    amount: Expression;
};

type DecreaseExpression = {
    kind: "DecreaseExpression";
    variable: string;
    amount: Expression;
};

type AssignmentTarget =
    | NameLookupExpression
    | ObjectPropertyExpression
    | ArrayAccessExpression;

type AssignmentExpression = {
    kind: "AssignmentExpression";
    target: AssignmentTarget;
    value: Expression;
};

type ArrowFunctionExpression = {
    kind: "ArrowFunctionExpression";
    parameters: string[];
    body: Ast[] | Expression;
};

type FunctionCallExpression = {
    kind: "FunctionCallExpression";
    functionName: string;
    arguments: Expression[];
};

export type NameLookupExpression = {
    kind: "NameLookupExpression";
    name: string;
};

type ChainableExpression =
    | NameLookupExpression
    | ObjectPropertyExpression
    | ObjectMethodCallExpression
    | ArrayAccessExpression;

type ObjectPropertyExpression = {
    kind: "ObjectPropertyExpression";
    object: ChainableExpression;
    property: NameLookupExpression | StringLiteralExpression;
};

type ObjectMethodCallExpression = {
    kind: "ObjectMethodCallExpression";
    object: ChainableExpression;
    method: NameLookupExpression | StringLiteralExpression;
    arguments: Expression[];
};

type ArrayAccessExpression = {
    kind: "ArrayAccessExpression";
    array: ChainableExpression;
    index: NumberExpression;
};

type AdditionExpression = {
    kind: "AdditionExpression";
    left: Expression;
    right: Expression;
};

type SubtractionExpression = {
    kind: "SubtractionExpression";
    left: Expression;
    right: Expression;
};

type MultiplicationExpression = {
    kind: "MultiplicationExpression";
    left: Expression;
    right: Expression;
};

type DivisionExpression = {
    kind: "DivisionExpression";
    left: Expression;
    right: Expression;
};

type AndExpression = {
    kind: "AndExpression";
    left: Expression;
    right: Expression;
};

type OrExpression = {
    kind: "OrExpression";
    left: Expression;
    right: Expression;
};

type NullExpression = { kind: "NullExpression" };
type BooleanExpression = { kind: "BooleanExpression"; value: boolean };

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
    | AssignmentExpression
    | ArrowFunctionExpression
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

type LetStatement = {
    kind: "LetStatement";
    name: string;
    value: Expression;
};

type ConstStatement = {
    kind: "ConstStatement";
    name: string;
    value: Expression;
};

type IfStatement = {
    kind: "IfStatement";
    condition: Expression;
    thenBranch: Ast[];
    elseBranch?: Ast[];
};

type ForLoop = {
    kind: "ForLoop";
    init: LetStatement;
    condition: Expression;
    increment: Expression;
    body: Ast[];
};

type FunctionDeclaration = {
    kind: "FunctionDeclaration";
    name: string;
    parameters: string[];
    body: Ast[];
};

type ReturnStatement = {
    kind: "ReturnStatement";
    value: Expression | null;
};

type ContinueStatement = {
    kind: "ContinueStatement";
};

type BreakStatement = {
    kind: "BreakStatement";
};

/**
 * e.g
 *
 * ```
 * main();
 * ```
 */
type LineTerminatedExpression = {
    kind: "LineTerminatedExpression";
    expressions: Expression[];
};

export type Ast =
    | LetStatement
    | IfStatement
    | ForLoop
    | FunctionDeclaration
    | ConstStatement
    | ReturnStatement
    | ContinueStatement
    | BreakStatement
    | LineTerminatedExpression;

export type ExpressionParseResult = {
    expression: Expression;
    index: number;
};

export type IndexedResult<a> = Result<a> & { index: number };

export type StatementParseResult = IndexedResult<Ast>;

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

export function isExpression(node: JsNode): node is Expression {
    return !isAst(node);
}

export function isAst(node: JsNode): node is Ast {
    const kind = node.kind;

    return (
        kind === "LetStatement" ||
        kind === "ConstStatement" ||
        kind === "IfStatement" ||
        kind === "ForLoop" ||
        kind === "FunctionDeclaration" ||
        kind === "ReturnStatement" ||
        kind === "ContinueStatement" ||
        kind === "BreakStatement"
    );
}

export type JsNode = Ast | Expression;

export type Program = JsNode[];
