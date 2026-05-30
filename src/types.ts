export type Nothing = {
    kind: 'Nothing';
};
export type Just<A> = {
    kind: 'Just';
    value: A;
};
export type Maybe<A> = Just<A> | Nothing;
export function Just<A>(value: A): Maybe<A> {
    return {
        kind: 'Just',
        value
    };
}
export function Nothing<A>(): Maybe<A> {
    return { kind: 'Nothing' };
};