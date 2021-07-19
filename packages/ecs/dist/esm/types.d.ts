export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P];
};
export declare type MutableDeep<T> = {
    -readonly [P in keyof T]: T[P] extends {} ? MutableDeep<T[P]> : T[P] extends ReadonlyArray<infer U> ? U[] : T[P];
};
//# sourceMappingURL=types.d.ts.map