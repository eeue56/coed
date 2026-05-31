## type Nothing

```javascript
export type Nothing = {
    kind: "Nothing";
};

```

[View source](https://github.com/eeue56/coed/blob/main/src/types.ts#L0-L3)

## type Just<A>

```javascript
export type Just<A> = {
    kind: "Just";
    value: A;
};

```

[View source](https://github.com/eeue56/coed/blob/main/src/types.ts#L4-L8)

## type Maybe<A>

```javascript
export type Maybe<A> = Just<A> | Nothing;

```

[View source](https://github.com/eeue56/coed/blob/main/src/types.ts#L9-L10)

## Just

```javascript
export function Just<A>(value: A): Maybe<A> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/types.ts#L11-L11)

## Nothing

```javascript
export function Nothing<A>(): Maybe<A> {
```

[View source](https://github.com/eeue56/coed/blob/main/src/types.ts#L18-L18)
