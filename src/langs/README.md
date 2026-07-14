# language extensions

Each of the folders inside here support specific languages, beyond the pure `coed` structures.

`css`, `html`, and `javascript` all provide parsers/filters/generation for those specific languages.

- `html` provides filtering + parsing extensions to the root `coed` library
- `css` provides parsing, filtering, and generation. Filtering can be done on the block level (e.g classnames), or on the declaration level (e.g `width`, or `width: 20px`)
- `javascript` provides parsing, filter, and generation for a subset of JavaScript.

Each module exposes an object with the name of the language. That object has the available parsers, filters, and generators. Generally: the full parser -> filter -> generate flow uses the same types, allowing for easy transition.
