## parseFragment(string: string): HtmlNode

```javascript
export function parseFragment(string: string): HtmlNode<never>[] {
```

Parse a fragment of html string into Coed.

e.g `<div>hello world</div>`
[View source](https://github.com/eeue56/coed/blob/main/src/parse.ts#L22-L22)

## parse(string: string): HtmlNode

```javascript
export function parse(string: string): HtmlNode<never> {
```

parse html into a coed tree.

e.g `<html><body><div>hello world</div></body></html>`
[View source](https://github.com/eeue56/coed/blob/main/src/parse.ts#L34-L34)
