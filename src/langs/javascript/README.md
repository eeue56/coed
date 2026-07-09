## coed JS parsing

coed supports a subset of JavaScript to convert into a tree.

When a JavaScript feature is not supported in the subset, it will either be converted to an approved feature, or a specific error will be given detailing what to do instead.

- `var foo = undefined;` becomes `let foo = null;`
- `while (condition) { ... }` becomes a synthetic `for` loop
- `const name = (args) => expr;` becomes a named `function` declaration

Still explicitly not supported:

- `with`
- arbitrary ESNext syntax outside the supported lowerings above
