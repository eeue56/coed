## coed JS parsing

coed supports a subset of JavaScript to convert into a tree.

When a JavaScript feature is not supported in the subset, it will either be converted to an approved feature, or a specific error will be given detailing what to do instead.

Parsing uses the TypeScript compiler frontend, then converts supported syntax into Coed's smaller AST. `javascript.parse(source)` uses TypeScript syntax; `javascript.parseTypeScript(source, fileName)` selects `.ts`, `.tsx`, `.js`, or `.jsx` grammar from the filename. Compiler syntax errors and unsupported Coed constructs include source locations.

### Transformations

Some accepted input is normalized into canonical subset nodes:

- `var foo = value;` becomes `let foo = value;`
- `var foo = undefined;` becomes `let foo = null;`
- `while (condition) { ... }` becomes a synthetic `for` loop
- `const name = (args) => expr;` becomes a named `function` declaration
- `let name = () => { ... };` becomes a named `function` declaration
- Type annotations, generic parameter declarations, and type assertions are erased from executable nodes
- `interface`, `type`, and `enum` declarations are retained as TypeScript-specific Coed nodes
- Class members not represented by the JavaScript AST, such as fields and decorated methods, retain their TypeScript source text

### Supported statements

- Variable declarations:
    - `let name = expression;`
    - `const name = expression;`
- Conditional statements:
    - `if (condition) { ... }`
    - `if (...) { ... } else { ... }`
    - `if (...) { ... } else if (...) { ... }`
- Loops:
    - `for (let i = init; condition; increment) { ... }`
- Function declarations:
    - `function name(a, b) { ... }`
- Classes and methods:
    - `class Name extends Base { method() { ... } }`
- TypeScript declarations:
    - `interface Name { ... }`
    - `type Name = ...`
    - `enum Name { ... }`
- Decorators on classes and class members
- Control flow statements:
    - `return expression;` (only inside function bodies)
    - `return;` (only inside function bodies)
    - `break;` (only inside `for` loop bodies)
    - `continue;` (only inside `for` loop bodies)

### Supported expressions

- Literals:
    - Numbers: `123`, `12.34`
    - Strings: `'text'`, `"text"`, `` `text` ``
    - Booleans: `true`, `false`
    - `null`
    - `undefined` (lowered to `NullExpression`)
- Identifiers: `name`
- Grouping: `(expression)`
- Arrays: `[a, b, c]`
- Objects:
    - `{ key: value }`
    - `{ "key": value }`
- Property/index access:
    - `obj.key`
    - `arr[0]`
    - `obj["key"]`
- Function/method calls:
    - `fn(a, b)`
    - `obj.method(a)`
- Arithmetic binary operators:
    - `+`, `-`, `*`, `/`
    - Standard precedence (`*`/`/` before `+`/`-`)
- Comparison operators:
    - `===`, `!==`, `<`, `>`, `<=`, `>=`
- Logical operators:
    - `&&`, `||`
    - Standard precedence (`&&` before `||`)
- Postfix operators:
    - `name++`, `name--`

### Current subset limitations

- Explicitly rejected:
    - `with`, optional chaining, destructuring, JSX expressions, and syntax without a corresponding Coed AST shape
    - Namespace imports, aliased imports/exports, and re-exports
- Interfaces, type aliases, and enum initializer/type fragments are retained as source text where Coed has no dedicated type-expression AST
- Decorated classes are represented by a wrapper node; decorated class members are retained as source text
- A successful parse does not perform TypeScript type checking or module resolution
