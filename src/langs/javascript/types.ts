type BaseToken = { startIndex: number, endIndex: number };

type NumberToken = BaseToken & { kind: "NumberToken", value: number };
type StringToken = BaseToken & { kind: "StringToken", value: string };
type IdentifierToken = BaseToken & { kind: "IdentifierToken", name: string };
type AdditionToken = BaseToken & { kind: "AdditionToken" };
type SubtractionToken = BaseToken & { kind: "SubtractionToken" };
type MultiplicationToken = BaseToken & { kind: "MultiplicationToken" };
type DivisionToken = BaseToken & { kind: "DivisionToken" };
type EqualityToken = BaseToken & { kind: "EqualityToken" };
type InqualityToken = BaseToken & { kind: "InqualityToken" };
type LessThanToken = BaseToken & { kind: "LessThanToken" };
type MoreThanToken = BaseToken & { kind: "MoreThanToken" };
type LessThanOrEqualToken = BaseToken & { kind: "LessThanOrEqualToken" };
type MoreThanOrEqualToken = BaseToken & { kind: "MoreThanOrEqualToken" };
type IncrementToken = BaseToken & { kind: "IncrementToken" };
type DecrementToken = BaseToken & { kind: "DecrementToken" };
type IncreaseToken = BaseToken & { kind: "IncreaseToken" };
type DecreaseToken = BaseToken & { kind: "DecreaseToken" };
type LeftParenToken = BaseToken & { kind: "LeftParenToken" };
type RightParenToken = BaseToken & { kind: "RightParenToken" };
type LeftBracketToken = BaseToken & { kind: "LeftBracketToken" };
type RightBracketToken = BaseToken & { kind: "RightBracketToken" };
type LeftBraceToken = BaseToken & { kind: "LeftBraceToken" };
type RightBraceToken = BaseToken & { kind: "RightBraceToken" };
type CommaToken = BaseToken & { kind: "CommaToken" };
type SemicolonToken = BaseToken & { kind: "SemicolonToken" };
type LetToken = BaseToken & { kind: "LetToken" };
type ConstToken = BaseToken & { kind: "ConstToken" };
type IfToken = BaseToken & { kind: "IfToken" };
type ElseToken = BaseToken & { kind: "ElseToken" };
type ForToken = BaseToken & { kind: "ForToken" };
type FunctionToken = BaseToken & { kind: "FunctionToken" };
type ReturnToken = BaseToken & { kind: "ReturnToken" };

export type Token = NumberToken | StringToken | IdentifierToken | AdditionToken | SubtractionToken | MultiplicationToken | DivisionToken | EqualityToken | InqualityToken | LessThanToken | MoreThanToken | LessThanOrEqualToken | MoreThanOrEqualToken | IncrementToken | DecrementToken | IncreaseToken | DecreaseToken | LeftParenToken | RightParenToken | LeftBracketToken | RightBracketToken | LeftBraceToken | RightBraceToken | CommaToken | SemicolonToken | LetToken | ConstToken | IfToken | ElseToken | ForToken | FunctionToken | ReturnToken;

type NumberExpression = { kind: "NumberExpression", value: number };
type StringExpression = { kind: "StringExpression", value: string };
type StringLiteralExpression = { kind: "StringLiteralExpression", values: Expression[] };
type ArrayExpression = { kind: "ArrayExpression", elements: Expression[] };
type ObjectExpression = { kind: "ObjectExpression", properties: { [key: string]: Expression } };
type EqualityExpression = {
    kind: "EqualityExpression";
    left: Expression;
    right: Expression;
};
type InqualityExpression = {
    kind: "InqualityExpression";
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
}

type DecreaseExpression = {
    kind: "DecreaseExpression";
    variable: string;
    amount: Expression;
}

type FunctionCallExpression = {
    kind: "FunctionCallExpression";
    functionName: string;
    arguments: Expression[];
};

type NameLookupExpression = {
    kind: "NameLookupExpression";
    name: string;
};

type ObjectPropertyExpression = {
    kind: "ObjectPropertyExpression";
    object: NameLookupExpression;
    property: NameLookupExpression | StringLiteralExpression;
};

type ObjectMethodCallExpression = {
    kind: "ObjectMethodCallExpression";
    object: NameLookupExpression;
    method: NameLookupExpression | StringLiteralExpression;
    arguments: Expression[];
};

type ArrayAccessExpression = {
    kind: "ArrayAccessExpression";
    array: NameLookupExpression;
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

type NullExpression = { kind: "NullExpression" };
type BooleanExpression = { kind: "BooleanExpression", value: boolean };

export type Expression = NumberExpression | StringExpression | ArrayExpression | ObjectExpression | EqualityExpression | InqualityExpression | LessThanExpression | MoreThanExpression | LessThanOrEqualExpression | MoreThanOrEqualExpression | IncrementExpression | DecrementExpression | IncreaseExpression | DecreaseExpression | NullExpression | BooleanExpression | StringLiteralExpression | FunctionCallExpression | NameLookupExpression | ObjectPropertyExpression | ObjectMethodCallExpression | ArrayAccessExpression | AdditionExpression | SubtractionExpression | MultiplicationExpression | DivisionExpression;

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

export type Ast = LetStatement | IfStatement | ForLoop | FunctionDeclaration | ConstStatement;