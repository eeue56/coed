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

export type InExpression = {
    kind: "InExpression";
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

export type PrefixIncrementExpression = {
    kind: "PrefixIncrementExpression";
    variable: string;
};

export type PrefixDecrementExpression = {
    kind: "PrefixDecrementExpression";
    variable: string;
};

export type LooseEqualityExpression = {
    kind: "LooseEqualityExpression";
    left: Expression;
    right: Expression;
};

export type LooseInequalityExpression = {
    kind: "LooseInequalityExpression";
    left: Expression;
    right: Expression;
};

// A method, getter or setter inside an object literal, stored under `name`, `get name` or `set name`.
export type ObjectMemberExpression = {
    kind: "ObjectMemberExpression";
    memberKind: "method" | "get" | "set";
    name: string;
    isAsync: boolean;
    parameters: string[];
    body: Ast[];
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

export type ConditionalExpression = {
    kind: "ConditionalExpression";
    condition: Expression;
    whenTrue: Expression;
    whenFalse: Expression;
};

export type ModuloExpression = {
    kind: "ModuloExpression";
    left: Expression;
    right: Expression;
};

export type BitwiseOperator = "&" | "|" | "^" | "<<" | ">>" | ">>>" | "**";

// Bitwise and exponent operators, which share one node shape.
export type BitwiseExpression = {
    kind: "BitwiseExpression";
    operator: BitwiseOperator;
    left: Expression;
    right: Expression;
};

export type InstanceOfExpression = {
    kind: "InstanceOfExpression";
    left: Expression;
    right: Expression;
};

export type UnaryExpression = {
    kind: "UnaryExpression";
    operator: "-" | "+" | "~" | "typeof" | "void" | "delete";
    value: Expression;
};

// Keeps source parentheses where an expression is used as a member/call target.
// `[key]: value` inside an object literal, stored under a synthetic `[N]` property name.
export type ComputedPropertyExpression = {
    kind: "ComputedPropertyExpression";
    key: Expression;
    value: Expression;
};

export type ParenthesizedExpression = {
    kind: "ParenthesizedExpression";
    value: Expression;
};

export type NullishCoalescingExpression = {
    kind: "NullishCoalescingExpression";
    left: Expression;
    right: Expression;
};

export type RegexExpression = {
    kind: "RegexExpression";
    // Raw literal text including slashes and flags, e.g. `/a+/gi`.
    source: string;
};

export type SpreadExpression = {
    kind: "SpreadExpression";
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

// A call whose target is not a plain name, e.g. `(() => {})()` or `fn()()`.
export type CallExpression = {
    kind: "CallExpression";
    callee: ChainableExpression;
    arguments: Expression[];
};

export type CommaExpression = {
    kind: "CommaExpression";
    left: Expression;
    right: Expression;
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
    | CallExpression
    | ThisExpression
    | SuperExpression
    | NewExpression
    | FunctionCallExpression
    | ObjectPropertyExpression
    | ObjectMethodCallExpression
    | ArrayAccessExpression
    | StringExpression
    | StringLiteralExpression
    | RegexExpression
    | ParenthesizedExpression
    | ArrayExpression;

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
    | InExpression
    | MoreThanExpression
    | LessThanOrEqualExpression
    | MoreThanOrEqualExpression
    | IncrementExpression
    | DecrementExpression
    | IncreaseExpression
    | DecreaseExpression
    | NegationExpression
    | PrefixIncrementExpression
    | PrefixDecrementExpression
    | LooseEqualityExpression
    | LooseInequalityExpression
    | ObjectMemberExpression
    | AssignmentExpression
    | ArrowFunctionExpression
    | ThisExpression
    | SuperExpression
    | AwaitExpression
    | ConditionalExpression
    | RegexExpression
    | NullishCoalescingExpression
    | ModuloExpression
    | InstanceOfExpression
    | BitwiseExpression
    | UnaryExpression
    | ParenthesizedExpression
    | ComputedPropertyExpression
    | SpreadExpression
    | NewExpression
    | ImportExpression
    | NullExpression
    | BooleanExpression
    | StringLiteralExpression
    | FunctionCallExpression
    | CallExpression
    | CommaExpression
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

export type InterfaceDeclaration = {
    kind: "InterfaceDeclaration";
    name: string;
    typeParameters: string;
    extends: string[];
    members: string[];
};

export type TypeAliasDeclaration = {
    kind: "TypeAliasDeclaration";
    name: string;
    typeParameters: string;
    type: string;
};

export type EnumMember = {
    name: string;
    initializer: string | null;
};

export type EnumDeclaration = {
    kind: "EnumDeclaration";
    name: string;
    isConst: boolean;
    members: EnumMember[];
};

export type TypeScriptClassMember = {
    kind: "TypeScriptClassMember";
    source: string;
};

export type DecoratedDeclaration = {
    kind: "DecoratedDeclaration";
    decorators: string[];
    declaration: Ast;
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

export type TryFinallyStatement = {
    kind: "TryFinallyStatement";
    tryBlock: Ast[];
    catchParameter: string | null;
    catchBlock: Ast[] | null;
    finallyBlock: Ast[];
};

export type ImportNamespaceStatement = {
    kind: "ImportNamespaceStatement";
    name: string;
    source: string;
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
        | ClassDeclaration
        | InterfaceDeclaration
        | TypeAliasDeclaration
        | EnumDeclaration
        | DecoratedDeclaration;
};

export type ExportNamedStatement = {
    kind: "ExportNamedStatement";
    names: string[];
};

// `names` is null for `export * from`.
export type ExportFromStatement = {
    kind: "ExportFromStatement";
    names: string[] | null;
    source: string;
};

export type ExportDefaultStatement = {
    kind: "ExportDefaultStatement";
    value: Expression | FunctionDeclaration | ClassDeclaration;
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
    | InterfaceDeclaration
    | TypeAliasDeclaration
    | EnumDeclaration
    | TypeScriptClassMember
    | DecoratedDeclaration
    | ConstStatement
    | ReturnStatement
    | ContinueStatement
    | BreakStatement
    | ThrowStatement
    | TryCatchStatement
    | TryFinallyStatement
    | ImportStatement
    | ImportNamespaceStatement
    | ExportDeclarationStatement
    | ExportNamedStatement
    | ExportFromStatement
    | ExportDefaultStatement
    | LineTerminatedExpression;

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
        case "InExpression":
        case "MoreThanExpression":
        case "LessThanOrEqualExpression":
        case "MoreThanOrEqualExpression":
        case "IncrementExpression":
        case "DecrementExpression":
        case "IncreaseExpression":
        case "DecreaseExpression":
        case "NegationExpression":
        case "PrefixIncrementExpression":
        case "PrefixDecrementExpression":
        case "LooseEqualityExpression":
        case "LooseInequalityExpression":
        case "ObjectMemberExpression":
        case "AssignmentExpression":
        case "ArrowFunctionExpression":
        case "ThisExpression":
        case "SuperExpression":
        case "AwaitExpression":
        case "ConditionalExpression":
        case "RegexExpression":
        case "NullishCoalescingExpression":
        case "ModuloExpression":
        case "InstanceOfExpression":
        case "BitwiseExpression":
        case "UnaryExpression":
        case "ParenthesizedExpression":
        case "ComputedPropertyExpression":
        case "SpreadExpression":
        case "NewExpression":
        case "ImportExpression":
        case "NullExpression":
        case "BooleanExpression":
        case "StringLiteralExpression":
        case "FunctionCallExpression":
        case "CallExpression":
        case "CommaExpression":
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
        case "InterfaceDeclaration":
        case "TypeAliasDeclaration":
        case "EnumDeclaration":
        case "TypeScriptClassMember":
        case "DecoratedDeclaration":
        case "ReturnStatement":
        case "ContinueStatement":
        case "BreakStatement":
        case "ThrowStatement":
        case "TryCatchStatement":
        case "TryFinallyStatement":
        case "ImportStatement":
        case "ImportNamespaceStatement":
        case "ExportDeclarationStatement":
        case "ExportNamedStatement":
        case "ExportFromStatement":
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
    | ClassDeclaration
    | InterfaceDeclaration
    | TypeAliasDeclaration
    | EnumDeclaration
    | DecoratedDeclaration {
    const kind = node.kind;
    return (
        kind === "FunctionDeclaration" ||
        kind === "LetStatement" ||
        kind === "LetListStatement" ||
        kind === "ConstStatement" ||
        kind === "ClassDeclaration" ||
        kind === "InterfaceDeclaration" ||
        kind === "TypeAliasDeclaration" ||
        kind === "EnumDeclaration" ||
        kind === "DecoratedDeclaration"
    );
}

export function isJsNode(node: unknown): node is JsNode {
    return isAst(node) || isExpression(node);
}

export type JsNode = Ast | Expression;

export type Program = JsNode[];

export type Purity = "Pure" | "ModifiesInputs" | "HasSideEffects";
