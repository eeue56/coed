import { isJsNode } from "./types.ts";
import type {
    Ast,
    Expression,
    FunctionDeclaration,
    JsNode,
    Program,
    Purity,
} from "./types.ts";

const mutatingMethods = new Set([
    "add",
    "clear",
    "copyWithin",
    "delete",
    "fill",
    "pop",
    "push",
    "reverse",
    "set",
    "shift",
    "sort",
    "splice",
    "unshift",
]);

function combinePurity(left: Purity, right: Purity): Purity {
    if (left === "HasSideEffects" || right === "HasSideEffects") {
        return "HasSideEffects";
    }
    if (left === "ModifiesInputs" || right === "ModifiesInputs") {
        return "ModifiesInputs";
    }
    return "Pure";
}

function localNames(
    nodes: FunctionDeclaration["body"],
    parameters: string[],
): Set<string> {
    const names = new Set(parameters);
    const visited = new WeakSet<object>();

    function visit(value: unknown): void {
        if (Array.isArray(value)) {
            if (visited.has(value)) {
                return;
            }
            visited.add(value);
            for (const child of value) {
                visit(child);
            }
            return;
        }
        if (!value || typeof value !== "object") {
            return;
        }
        if (visited.has(value)) {
            return;
        }
        visited.add(value);
        if (isJsNode(value)) {
            if (
                value.kind === "FunctionDeclaration" ||
                value.kind === "ArrowFunctionExpression"
            ) {
                return;
            }
            if (
                value.kind === "LetStatement" ||
                value.kind === "ConstStatement"
            ) {
                names.add(value.name);
            } else if (value.kind === "LetListStatement") {
                for (const name of value.names) {
                    names.add(name);
                }
            }
        }
        for (const child of Object.values(value)) {
            visit(child);
        }
    }

    visit(nodes);
    return names;
}

function inspectNodes(
    nodes: JsNode[],
    bindings: Set<string>,
    functions: Map<string, Purity>,
    activeNodes: WeakSet<object>,
): Purity {
    let purity: Purity = "Pure";
    for (const node of nodes) {
        purity = combinePurity(
            purity,
            inspectNode(node, bindings, functions, activeNodes),
        );
    }
    return purity;
}

function inspectExpressions(
    expressions: Expression[],
    bindings: Set<string>,
    functions: Map<string, Purity>,
    activeNodes: WeakSet<object>,
): Purity {
    return inspectNodes(expressions, bindings, functions, activeNodes);
}

function inspectOptionalNode(
    node: JsNode | null | undefined,
    bindings: Set<string>,
    functions: Map<string, Purity>,
    activeNodes: WeakSet<object>,
): Purity {
    return node ? inspectNode(node, bindings, functions, activeNodes) : "Pure";
}

function inspectNode(
    node: JsNode,
    bindings: Set<string>,
    functions: Map<string, Purity>,
    activeNodes: WeakSet<object>,
): Purity {
    if (activeNodes.has(node)) {
        return "HasSideEffects";
    }

    activeNodes.add(node);
    try {
        return inspectNodeMembers(node, bindings, functions, activeNodes);
    } finally {
        activeNodes.delete(node);
    }
}

function inspectNodeMembers(
    node: JsNode,
    bindings: Set<string>,
    functions: Map<string, Purity>,
    activeNodes: WeakSet<object>,
): Purity {
    switch (node.kind) {
        case "NumberExpression":
        case "StringExpression":
        case "NullExpression":
        case "BooleanExpression":
        case "ThisExpression":
        case "SuperExpression":
        case "NameLookupExpression":
        case "LetListStatement":
        case "ContinueStatement":
        case "BreakStatement":
        case "ExportNamedStatement":
            return "Pure";
        case "FunctionDeclaration":
            return functions.get(node.name) ?? "HasSideEffects";
        case "ArrowFunctionExpression": {
            const arrowBindings = new Set([...bindings, ...node.parameters]);
            if (Array.isArray(node.body)) {
                for (const name of localNames(node.body, [])) {
                    arrowBindings.add(name);
                }
                return inspectNodes(
                    node.body,
                    arrowBindings,
                    functions,
                    activeNodes,
                );
            }
            return inspectNode(
                node.body,
                arrowBindings,
                functions,
                activeNodes,
            );
        }
        case "AssignmentExpression": {
            const targetPurity = inspectNode(
                node.target,
                bindings,
                functions,
                activeNodes,
            );
            const valuePurity = inspectNode(
                node.value,
                bindings,
                functions,
                activeNodes,
            );
            let mutationPurity: Purity;
            if (
                node.target.kind === "ObjectPropertyExpression" ||
                node.target.kind === "ArrayAccessExpression"
            ) {
                mutationPurity = "ModifiesInputs";
            } else if (!bindings.has(node.target.name)) {
                mutationPurity = "ModifiesInputs";
            } else {
                mutationPurity = "Pure";
            }
            return combinePurity(
                mutationPurity,
                combinePurity(targetPurity, valuePurity),
            );
        }
        case "IncrementExpression":
        case "DecrementExpression":
            return bindings.has(node.variable) ? "Pure" : "ModifiesInputs";
        case "IncreaseExpression":
        case "DecreaseExpression":
            return combinePurity(
                bindings.has(node.variable) ? "Pure" : "ModifiesInputs",
                inspectNode(node.amount, bindings, functions, activeNodes),
            );
        case "FunctionCallExpression":
            return combinePurity(
                functions.get(node.functionName) ?? "HasSideEffects",
                inspectExpressions(
                    node.arguments,
                    bindings,
                    functions,
                    activeNodes,
                ),
            );
        case "ObjectMethodCallExpression": {
            const callPurity =
                node.method.kind === "NameLookupExpression" &&
                mutatingMethods.has(node.method.name)
                    ? "ModifiesInputs"
                    : "HasSideEffects";
            return combinePurity(
                callPurity,
                combinePurity(
                    inspectNode(node.object, bindings, functions, activeNodes),
                    combinePurity(
                        inspectNode(
                            node.method,
                            bindings,
                            functions,
                            activeNodes,
                        ),
                        inspectExpressions(
                            node.arguments,
                            bindings,
                            functions,
                            activeNodes,
                        ),
                    ),
                ),
            );
        }
        case "NewExpression":
            return combinePurity(
                "HasSideEffects",
                combinePurity(
                    inspectNode(node.callee, bindings, functions, activeNodes),
                    inspectExpressions(
                        node.arguments,
                        bindings,
                        functions,
                        activeNodes,
                    ),
                ),
            );
        case "ImportExpression":
            return combinePurity(
                "HasSideEffects",
                inspectNode(node.source, bindings, functions, activeNodes),
            );
        case "AwaitExpression":
            return combinePurity(
                "HasSideEffects",
                inspectNode(node.value, bindings, functions, activeNodes),
            );
        case "ImportStatement":
            return "HasSideEffects";
        case "ArrayExpression":
            return inspectExpressions(
                node.elements,
                bindings,
                functions,
                activeNodes,
            );
        case "ObjectExpression":
            return inspectExpressions(
                Object.values(node.properties),
                bindings,
                functions,
                activeNodes,
            );
        case "StringLiteralExpression":
            return inspectExpressions(
                node.values,
                bindings,
                functions,
                activeNodes,
            );
        case "EqualityExpression":
        case "InequalityExpression":
        case "LessThanExpression":
        case "MoreThanExpression":
        case "LessThanOrEqualExpression":
        case "MoreThanOrEqualExpression":
        case "AdditionExpression":
        case "SubtractionExpression":
        case "MultiplicationExpression":
        case "DivisionExpression":
        case "AndExpression":
        case "OrExpression":
            return combinePurity(
                inspectNode(node.left, bindings, functions, activeNodes),
                inspectNode(node.right, bindings, functions, activeNodes),
            );
        case "NegationExpression":
            return inspectNode(node.value, bindings, functions, activeNodes);
        case "ObjectPropertyExpression":
            return combinePurity(
                inspectNode(node.object, bindings, functions, activeNodes),
                inspectNode(node.property, bindings, functions, activeNodes),
            );
        case "ArrayAccessExpression":
            return combinePurity(
                inspectNode(node.array, bindings, functions, activeNodes),
                inspectNode(node.index, bindings, functions, activeNodes),
            );
        case "LetStatement":
        case "ConstStatement":
            return inspectNode(node.value, bindings, functions, activeNodes);
        case "IfStatement": {
            let purity = combinePurity(
                inspectNode(node.condition, bindings, functions, activeNodes),
                inspectNodes(node.thenBranch, bindings, functions, activeNodes),
            );
            purity = combinePurity(
                purity,
                inspectOptionalNode(
                    node.elseIf,
                    bindings,
                    functions,
                    activeNodes,
                ),
            );
            return combinePurity(
                purity,
                node.elseBranch
                    ? inspectNodes(
                          node.elseBranch,
                          bindings,
                          functions,
                          activeNodes,
                      )
                    : "Pure",
            );
        }
        case "ClassicForLoop":
            return combinePurity(
                inspectNode(node.init, bindings, functions, activeNodes),
                combinePurity(
                    inspectNode(
                        node.condition,
                        bindings,
                        functions,
                        activeNodes,
                    ),
                    combinePurity(
                        inspectNode(
                            node.increment,
                            bindings,
                            functions,
                            activeNodes,
                        ),
                        inspectNodes(
                            node.body,
                            bindings,
                            functions,
                            activeNodes,
                        ),
                    ),
                ),
            );
        case "ForInOfLoop":
            return combinePurity(
                inspectNode(node.iterable, bindings, functions, activeNodes),
                inspectNodes(node.body, bindings, functions, activeNodes),
            );
        case "DoWhileLoop":
            return combinePurity(
                inspectNode(node.condition, bindings, functions, activeNodes),
                inspectNodes(node.body, bindings, functions, activeNodes),
            );
        case "ClassDeclaration":
            return combinePurity(
                inspectOptionalNode(
                    node.superClass,
                    bindings,
                    functions,
                    activeNodes,
                ),
                inspectNodes(node.body, bindings, functions, activeNodes),
            );
        case "ReturnStatement":
            return inspectOptionalNode(
                node.value,
                bindings,
                functions,
                activeNodes,
            );
        case "ThrowStatement":
            return inspectNode(node.value, bindings, functions, activeNodes);
        case "TryCatchStatement":
            return combinePurity(
                inspectNodes(node.tryBlock, bindings, functions, activeNodes),
                inspectNodes(node.catchBlock, bindings, functions, activeNodes),
            );
        case "ExportDeclarationStatement":
            return inspectNode(
                node.declaration,
                bindings,
                functions,
                activeNodes,
            );
        case "ExportDefaultStatement":
            return inspectNode(node.value, bindings, functions, activeNodes);
        case "LineTerminatedExpression":
            return inspectExpressions(
                node.expressions,
                bindings,
                functions,
                activeNodes,
            );
    }
}

function collectFunctions(
    value: unknown,
    functions: Map<string, FunctionDeclaration>,
    visited: WeakSet<object>,
): void {
    if (Array.isArray(value)) {
        if (visited.has(value)) {
            return;
        }
        visited.add(value);
        for (const child of value) {
            collectFunctions(child, functions, visited);
        }
        return;
    }
    if (!value || typeof value !== "object") {
        return;
    }
    if (visited.has(value)) {
        return;
    }
    visited.add(value);
    if (isJsNode(value) && value.kind === "FunctionDeclaration") {
        functions.set(value.name, value);
    }
    for (const child of Object.values(value)) {
        collectFunctions(child, functions, visited);
    }
}

export function checkPurity(program: Program): Purity {
    const declarations = new Map<string, FunctionDeclaration>();
    collectFunctions(program, declarations, new WeakSet());

    const functions = new Map<string, Purity>();
    for (const name of declarations.keys()) {
        functions.set(name, "Pure");
    }

    const maximumPasses = declarations.size * 2 + 1;
    for (let pass = 0; pass < maximumPasses; pass++) {
        let changed = false;
        for (const [name, declaration] of declarations) {
            const bindings = localNames(
                declaration.body,
                declaration.parameters,
            );
            let purity: Purity = "Pure";
            for (const statement of declaration.body) {
                purity = combinePurity(
                    purity,
                    inspectNode(statement, bindings, functions, new WeakSet()),
                );
            }
            const currentPurity = functions.get(name) ?? "Pure";
            const nextPurity = combinePurity(currentPurity, purity);
            if (nextPurity !== currentPurity) {
                functions.set(name, nextPurity);
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }

    let purity: Purity = "Pure";
    for (const node of program) {
        purity = combinePurity(
            purity,
            inspectNode(node, new Set(), functions, new WeakSet()),
        );
    }
    return purity;
}
