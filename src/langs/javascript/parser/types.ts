import type {
    Ast,
    Expression,
    ExpressionParseResult,
    ParserState,
    StatementParseResult,
} from "../types.ts";

import type { Result } from "../../types.ts";

type BaseToken = { startIndex: number; endIndex: number };
type NumberToken = BaseToken & { kind: "NumberToken"; value: number };
type StringToken = BaseToken & { kind: "StringToken"; value: string };
type IdentifierToken = BaseToken & { kind: "IdentifierToken"; name: string };
type AdditionToken = BaseToken & { kind: "AdditionToken" };
type SubtractionToken = BaseToken & { kind: "SubtractionToken" };
type MultiplicationToken = BaseToken & { kind: "MultiplicationToken" };
type DivisionToken = BaseToken & { kind: "DivisionToken" };
type AndToken = BaseToken & { kind: "AndToken" };
type OrToken = BaseToken & { kind: "OrToken" };
type EqualityToken = BaseToken & { kind: "EqualityToken" };
type InequalityToken = BaseToken & { kind: "InequalityToken" };
type LessThanToken = BaseToken & { kind: "LessThanToken" };
type MoreThanToken = BaseToken & { kind: "MoreThanToken" };
type NegationToken = BaseToken & { kind: "NegationToken" };
type LessThanOrEqualToken = BaseToken & { kind: "LessThanOrEqualToken" };
type MoreThanOrEqualToken = BaseToken & { kind: "MoreThanOrEqualToken" };
type IncrementToken = BaseToken & { kind: "IncrementToken" };
type DecrementToken = BaseToken & { kind: "DecrementToken" };
type LeftParenToken = BaseToken & { kind: "LeftParenToken" };
type RightParenToken = BaseToken & { kind: "RightParenToken" };
type LeftBracketToken = BaseToken & { kind: "LeftBracketToken" };
type RightBracketToken = BaseToken & { kind: "RightBracketToken" };
type LeftBraceToken = BaseToken & { kind: "LeftBraceToken" };
type RightBraceToken = BaseToken & { kind: "RightBraceToken" };
type CommaToken = BaseToken & { kind: "CommaToken" };
type ColonToken = BaseToken & { kind: "ColonToken" };
type SemicolonToken = BaseToken & { kind: "SemicolonToken" };
type DotToken = BaseToken & { kind: "DotToken" };
type AssignToken = BaseToken & { kind: "AssignToken" };
type ArrowToken = BaseToken & { kind: "ArrowToken" };
type WhitespaceToken = BaseToken & { kind: "WhitespaceToken"; value: string };
type LetToken = BaseToken & { kind: "LetToken" };
type VarToken = BaseToken & { kind: "VarToken" };
type ConstToken = BaseToken & { kind: "ConstToken" };
type IfToken = BaseToken & { kind: "IfToken" };
type ElseToken = BaseToken & { kind: "ElseToken" };
type ForToken = BaseToken & { kind: "ForToken" };
type WhileToken = BaseToken & { kind: "WhileToken" };
type WithToken = BaseToken & { kind: "WithToken" };
type FunctionToken = BaseToken & { kind: "FunctionToken" };
type ReturnToken = BaseToken & { kind: "ReturnToken" };
type ContinueToken = BaseToken & { kind: "ContinueToken" };
type BreakToken = BaseToken & { kind: "BreakToken" };
type NullToken = BaseToken & { kind: "NullToken" };
type TrueToken = BaseToken & { kind: "TrueToken" };
type FalseToken = BaseToken & { kind: "FalseToken" };
type TypeofToken = BaseToken & { kind: "TypeofToken" };
type AsToken = BaseToken & { kind: "AsToken" };
type UndefinedToken = BaseToken & { kind: "UndefinedToken" };

export type Token =
    | NumberToken
    | StringToken
    | IdentifierToken
    | AdditionToken
    | SubtractionToken
    | MultiplicationToken
    | DivisionToken
    | AndToken
    | OrToken
    | EqualityToken
    | InequalityToken
    | LessThanToken
    | MoreThanToken
    | NegationToken
    | LessThanOrEqualToken
    | MoreThanOrEqualToken
    | IncrementToken
    | DecrementToken
    | LeftParenToken
    | RightParenToken
    | LeftBracketToken
    | RightBracketToken
    | LeftBraceToken
    | RightBraceToken
    | CommaToken
    | ColonToken
    | SemicolonToken
    | DotToken
    | AssignToken
    | ArrowToken
    | WhitespaceToken
    | LetToken
    | VarToken
    | ConstToken
    | IfToken
    | ElseToken
    | ForToken
    | WhileToken
    | WithToken
    | FunctionToken
    | ReturnToken
    | ContinueToken
    | BreakToken
    | NullToken
    | TrueToken
    | FalseToken
    | TypeofToken
    | AsToken
    | UndefinedToken;

export type StatementParser = (state: ParserState) => StatementParseResult;

export type BinaryExpression = Extract<
    Expression,
    { left: Expression; right: Expression }
>;

export type ParsedFunctionBody = { body: Ast[]; index: number };
type LetStatement = Extract<Ast, { kind: "LetStatement" }>;

export type IfStatementAst = Extract<Ast, { kind: "IfStatement" }>;

export type ParsedForHeader = {
    init: LetStatement;
    condition: Expression;
    increment: Expression;
    afterRightParenIndex: number;
};

export type LoopControlKind = "ContinueStatement" | "BreakStatement";

export type ParsedConditionBlock = {
    condition: Expression;
    body: Ast[];
    nextIndex: number;
};

export type ParsedOptionalElse = {
    elseBranch?: Ast[];
    nextIndex: number;
};

export type ClosingTokenKind = "RightParenToken" | "RightBracketToken";

export type StatementListParseResult = {
    statements: Ast[] | null;
    index: number;
    noProgressToken?: Token;
};

export type ParsedExpressionResult = Result<ExpressionParseResult>;
export type ParsedBlockResult = {
    body: Ast[] | null;
    index: number;
};
export type ParsedStatementResult = StatementParseResult;
