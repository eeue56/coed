## coed JS parsing

coed supports a subset of JavaScript to convert into a tree.

When a JavaScript feature is not supported in the subset, it will either be converted to an approved feature, or a specific error will be given detailing what to do instead.

### Transformations

Some accepted input is normalized into canonical subset nodes:

- `var foo = value;` becomes `let foo = value;`
- `var foo = undefined;` becomes `let foo = null;`
- `while (condition) { ... }` becomes a synthetic `for` loop
- `const name = (args) => expr;` becomes a named `function` declaration
- `let name = () => { ... };` becomes a named `function` declaration

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
- Postfix operators:
    - `name++`, `name--`

### Current subset limitations

- Explicitly rejected:
    - `with`
- Not currently parsed as statements:
    - `return`, `break`, `continue`
- Not currently parsed as expressions:
    - Assignment expressions like `x = 1` or `obj.key = 1`
    - Logical operators like `&&` and `||`
    - Exponent/scientific number forms like `1e10`, `1.2e-3`, `.5`
    - Optional chaining, nullish coalescing, destructuring, classes, and other general ESNext syntax
- Prefix `!` and `typeof` tokens are accepted but currently lowered away (the parser keeps only the operand expression)
- Bracket access is limited to numeric or string literal keys (`arr[0]`, `obj["key"]`)
